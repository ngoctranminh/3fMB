import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useInventory } from '@/hooks';
import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { useTheme } from '@/theme';

import { Card, IconByVariant, StatusPill } from '@/components/atoms';
import { DetailField, FormField, SectionHeader } from '@/components/molecules';
import { FixedScreenHeader, SafeScreen } from '@/components/templates';

const CONTENT_GAP = 16;
const HALF_STEP = 0.5;
const ICON_SIZE = 24;
const STEP_ICON_SIZE = 20;
// Bước điều chỉnh nhanh; số lẻ vì nhiều mặt hàng bán theo kg
const STEPS = [-1, -HALF_STEP, HALF_STEP, 1];

function ItemDetail({ navigation, route }: RootScreenProps<Paths.ItemDetail>) {
  const { itemId } = route.params;
  const { t } = useTranslation();
  const { backgrounds, colors, components, fonts, gutters, layout } =
    useTheme();
  const {
    useAdjustQuantityMutation,
    useFetchItemDetailQuery,
    useFetchItemLedgerQuery,
    useUpdateItemPriceMutation,
  } = useInventory();

  const itemQuery = useFetchItemDetailQuery(itemId);
  const ledgerQuery = useFetchItemLedgerQuery(itemId);
  const adjustMutation = useAdjustQuantityMutation();
  const priceMutation = useUpdateItemPriceMutation();
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [priceDraft, setPriceDraft] = useState('');
  const [priceError, setPriceError] = useState<string>();

  const item = itemQuery.data;
  const ledger = ledgerQuery.data ?? [];

  const statusLabels = {
    expired: t('screen_item_detail.status_expired'),
    low: t('screen_item_detail.status_low'),
    ok: t('screen_item_detail.status_ok'),
    out: t('screen_item_detail.status_out'),
  };

  const statusTones = {
    expired: 'danger',
    low: 'warning',
    ok: 'success',
    out: 'danger',
  } as const;

  const handleAdjust = (delta: number) => {
    if (!item) {
      return;
    }
    adjustMutation.mutate({ delta, itemId: item.id });
  };

  const handleStartPriceEdit = () => {
    if (!item) {
      return;
    }
    setPriceDraft(String(item.unitPriceValue));
    setPriceError(undefined);
    setIsEditingPrice(true);
  };

  const handleSavePrice = () => {
    if (!item) {
      return;
    }
    const unitPrice = Number(priceDraft.trim().replace(',', '.'));
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      setPriceError(t('screen_item_detail.price_validation'));
      return;
    }

    setPriceError(undefined);
    priceMutation.mutate(
      { itemId: item.id, unitPrice },
      {
        onSuccess: () => {
          setIsEditingPrice(false);
        },
      },
    );
  };

  const handleResetError = () => {
    void itemQuery.refetch();
    void ledgerQuery.refetch();
  };

  const ledgerNote = (entry: (typeof ledger)[number]) => {
    if (entry.source === 'adjust') {
      return entry.isIncoming
        ? t('screen_item_detail.history_notes.quick_add')
        : t('screen_item_detail.history_notes.quick_remove');
    }
    if (entry.source === 'edit') {
      return t('screen_item_detail.history_notes.direct_edit');
    }
    if (entry.source === 'initial') {
      return t('screen_item_detail.history_notes.initial_stock');
    }
    if (entry.documentId !== null) {
      return entry.isIncoming
        ? t('screen_item_detail.history_notes.receipt_in')
        : t('screen_item_detail.history_notes.receipt_out');
    }
    return entry.note || t('screen_item_detail.history_notes.manual');
  };

  return (
    <SafeScreen
      edges={['top', 'left', 'right']}
      isError={itemQuery.isError}
      onGoBackError={() => {
        navigation.goBack();
      }}
      onResetError={handleResetError}
    >
      <View
        style={[layout.flex_1, backgrounds.surfaceSunken]}
        testID="item-detail-screen"
      >
        <FixedScreenHeader>
          <View style={[layout.row, layout.itemsCenter, gutters.gap_12]}>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => {
                navigation.goBack();
              }}
              testID="item-detail-back"
            >
              <IconByVariant
                height={ICON_SIZE}
                path="chevron-left"
                stroke={colors.gray800}
                width={ICON_SIZE}
              />
            </TouchableOpacity>

            <View style={[layout.flex_1, gutters.gap_4]}>
              <Text style={[fonts.size_20, fonts.gray800, fonts.bold]}>
                {item?.name ?? t('screen_item_detail.title')}
              </Text>
              <Text style={[fonts.size_12, fonts.gray200]}>
                {item?.fullName ?? ''}
              </Text>
            </View>

            {item ? (
              <StatusPill
                hasDot
                label={statusLabels[item.status]}
                tone={statusTones[item.status]}
              />
            ) : undefined}
          </View>
        </FixedScreenHeader>

        <ScrollView
          contentContainerStyle={[
            gutters.gap_16,
            gutters.paddingVertical_16,
            gutters.paddingHorizontal_16,
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Card>
            <DetailField
              label={t('screen_item_detail.stock')}
              value={item?.quantityLabel ?? '—'}
            />
            {isEditingPrice ? (
              <View style={[gutters.gap_8, gutters.paddingVertical_8]}>
                <FormField
                  error={priceError}
                  keyboardType="decimal-pad"
                  label={t('screen_item_detail.unit_price')}
                  onChangeText={setPriceDraft}
                  testID="item-unit-price-input"
                  value={priceDraft}
                />
                <View
                  style={[
                    layout.row,
                    layout.itemsCenter,
                    layout.justifyEnd,
                    gutters.gap_16,
                  ]}
                >
                  <TouchableOpacity
                    accessibilityRole="button"
                    disabled={priceMutation.isPending}
                    onPress={() => {
                      setIsEditingPrice(false);
                      setPriceError(undefined);
                    }}
                    testID="item-cancel-price"
                  >
                    <Text style={[fonts.size_14, fonts.gray200]}>
                      {t('screen_item_detail.cancel_price')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    accessibilityRole="button"
                    disabled={priceMutation.isPending}
                    onPress={handleSavePrice}
                    testID="item-save-price"
                  >
                    <Text style={[fonts.size_14, fonts.blue500, fonts.bold]}>
                      {priceMutation.isPending
                        ? t('screen_item_detail.price_updating')
                        : t('screen_item_detail.save_price')}
                    </Text>
                  </TouchableOpacity>
                </View>
                {priceMutation.isError ? (
                  <Text style={[fonts.size_12, fonts.red500]}>
                    {t('screen_item_detail.price_update_failed')}
                  </Text>
                ) : undefined}
              </View>
            ) : (
              <View style={[layout.row, layout.itemsCenter]}>
                <DetailField
                  label={t('screen_item_detail.unit_price')}
                  style={[layout.flex_1]}
                  value={item?.unitPrice ?? '—'}
                />
                <TouchableOpacity
                  accessibilityRole="button"
                  disabled={!item}
                  onPress={handleStartPriceEdit}
                  testID="item-edit-price"
                >
                  <Text style={[fonts.size_12, fonts.blue500, fonts.bold]}>
                    {t('screen_item_detail.edit_price')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            <DetailField
              label={t('screen_item_detail.total_value')}
              value={item?.totalValue ?? '—'}
            />
            <DetailField
              label={t('screen_item_detail.min_quantity')}
              value={item?.minQuantity ?? '—'}
            />
            <DetailField
              label={t('screen_item_detail.expires_at')}
              value={item?.expiresAt ?? t('screen_item_detail.no_expiry')}
            />
            <DetailField
              label={t('screen_item_detail.note')}
              value={
                item?.note === undefined || item.note === ''
                  ? t('screen_item_detail.no_note')
                  : item.note
              }
            />
          </Card>

          <Card style={[gutters.gap_12]}>
            <SectionHeader title={t('screen_item_detail.adjust_title')} />

            <View style={[layout.row, gutters.gap_8]}>
              {STEPS.map((step) => (
                <TouchableOpacity
                  accessibilityRole="button"
                  disabled={adjustMutation.isPending || !item}
                  key={step}
                  onPress={() => {
                    handleAdjust(step);
                  }}
                  style={[
                    layout.flex_1,
                    layout.row,
                    layout.itemsCenter,
                    layout.justifyCenter,
                    components.iconButtonSquare,
                    gutters.gap_4,
                  ]}
                  testID={`item-adjust-${String(step)}`}
                >
                  <IconByVariant
                    height={STEP_ICON_SIZE}
                    path={step > 0 ? 'plus' : 'minus'}
                    stroke={step > 0 ? colors.green500 : colors.red500}
                    width={STEP_ICON_SIZE}
                  />
                  <Text style={[fonts.size_12, fonts.gray800]}>
                    {String(Math.abs(step))}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {adjustMutation.isPending ? (
              <Text style={[fonts.size_12, fonts.gray200]}>
                {t('screen_item_detail.adjusting')}
              </Text>
            ) : undefined}

            {adjustMutation.isError ? (
              <Text style={[fonts.size_12, fonts.red500]}>
                {t('screen_item_detail.adjust_failed')}
              </Text>
            ) : undefined}
          </Card>

          <Card style={[gutters.gap_12]}>
            <SectionHeader title={t('screen_item_detail.history_title')} />

            {ledger.length === 0 ? (
              <Text style={[components.categoryChipLabel]}>
                {t('screen_item_detail.history_empty')}
              </Text>
            ) : (
              ledger.map((entry) => (
                <View
                  key={entry.id}
                  style={[
                    layout.row,
                    layout.itemsCenter,
                    gutters.gap_12,
                    gutters.paddingVertical_8,
                  ]}
                >
                  <View style={[layout.flex_1, gutters.gap_4]}>
                    <Text style={[fonts.size_14, fonts.gray800]}>
                      {ledgerNote(entry)}
                    </Text>
                    <Text style={[fonts.size_10, fonts.gray200]}>
                      {entry.occurredAt}
                    </Text>
                    <Text style={[fonts.size_10, fonts.gray200]}>
                      {t('screen_item_detail.changed_by')}{' '}
                      <Text style={[fonts.bold]}>
                        {entry.username ??
                          (entry.userId === null
                            ? t('screen_item_detail.unknown_user')
                            : `#${String(entry.userId)}`)}
                      </Text>
                    </Text>
                  </View>

                  <View style={[layout.itemsEnd, gutters.gap_4]}>
                    <Text
                      style={[
                        fonts.size_14,
                        fonts.bold,
                        entry.isIncoming ? fonts.green500 : fonts.red500,
                      ]}
                    >
                      {entry.deltaLabel}
                    </Text>
                    <Text style={[fonts.size_10, fonts.gray200]}>
                      {entry.totalPrice}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </Card>

          <View style={{ height: CONTENT_GAP }} />
        </ScrollView>
      </View>
    </SafeScreen>
  );
}

export default ItemDetail;
