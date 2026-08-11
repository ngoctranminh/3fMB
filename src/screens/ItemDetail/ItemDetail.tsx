import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useInventory } from '@/hooks';
import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { useTheme } from '@/theme';

import { Card, IconByVariant, StatusPill } from '@/components/atoms';
import { DetailField, SectionHeader } from '@/components/molecules';
import { SafeScreen } from '@/components/templates';

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
  } = useInventory();

  const itemQuery = useFetchItemDetailQuery(itemId);
  const ledgerQuery = useFetchItemLedgerQuery(itemId);
  const adjustMutation = useAdjustQuantityMutation();

  const item = itemQuery.data;
  const ledger = ledgerQuery.data ?? [];

  const statusLabels = {
    expired: t('screen_item_detail.status_expired'),
    low: t('screen_item_detail.status_low'),
    ok: t('screen_item_detail.status_ok'),
  };

  const statusTones = {
    expired: 'danger',
    low: 'warning',
    ok: 'success',
  } as const;

  const handleAdjust = (delta: number) => {
    if (!item) {
      return;
    }
    adjustMutation.mutate({ delta, itemId: item.id });
  };

  const handleResetError = () => {
    void itemQuery.refetch();
    void ledgerQuery.refetch();
  };

  return (
    <SafeScreen
      edges={['top', 'left', 'right']}
      isError={itemQuery.isError}
      onResetError={handleResetError}
    >
      <View
        style={[layout.flex_1, backgrounds.surfaceSunken]}
        testID="item-detail-screen"
      >
        <ScrollView
          contentContainerStyle={[
            gutters.gap_16,
            gutters.paddingVertical_16,
            gutters.paddingHorizontal_16,
          ]}
          showsVerticalScrollIndicator={false}
        >
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

          <Card>
            <DetailField
              label={t('screen_item_detail.stock')}
              value={item?.quantityLabel ?? '—'}
            />
            <DetailField
              label={t('screen_item_detail.unit_price')}
              value={item?.unitPrice ?? '—'}
            />
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
                      {entry.note}
                    </Text>
                    <Text style={[fonts.size_10, fonts.gray200]}>
                      {entry.occurredAt}
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
