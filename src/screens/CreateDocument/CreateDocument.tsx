import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useInventory } from '@/hooks';
import type {
  DocumentSubtype,
  TransactionKind,
} from '@/hooks/domain/inventory/schema';
import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { useTheme } from '@/theme';

import { Card, CategoryChip, IconByVariant } from '@/components/atoms';
import { FormField, SegmentTabs } from '@/components/molecules';
import { SafeScreen } from '@/components/templates';

type FieldErrors = {
  item?: string;
  quantity?: string;
  unitPrice?: string;
};

const ICON_SIZE = 24;
const SUBTYPES_BY_TAB = {
  export: ['usage', 'waste', 'other_out'],
  import: ['purchase', 'return', 'other_in'],
} as const satisfies Record<TransactionKind, readonly DocumentSubtype[]>;

const tabForSubtype = (subtype: DocumentSubtype): TransactionKind =>
  SUBTYPES_BY_TAB.import.includes(
    subtype as (typeof SUBTYPES_BY_TAB.import)[number],
  )
    ? 'import'
    : 'export';

function CreateDocument({
  navigation,
  route,
}: RootScreenProps<Paths.CreateDocument>) {
  const { t } = useTranslation();
  const { backgrounds, colors, components, fonts, gutters, layout } =
    useTheme();
  const { useCreateDocumentMutation, useFetchInventoryCatalogQuery } =
    useInventory();

  const catalogQuery = useFetchInventoryCatalogQuery();
  const createMutation = useCreateDocumentMutation();

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [itemId, setItemId] = useState<string>();
  const [note, setNote] = useState('');
  const [party, setParty] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [subtype, setSubtype] = useState(route.params.initialSubtype);
  const [tab, setTab] = useState<TransactionKind>(() =>
    tabForSubtype(route.params.initialSubtype),
  );
  const [unitPrice, setUnitPrice] = useState('0');

  const selectedItem = catalogQuery.data?.items.find(
    (item) => item.id === itemId,
  );

  const handleSelectItem = (nextItemId: string) => {
    const item = catalogQuery.data?.items.find(
      (entry) => entry.id === nextItemId,
    );
    setItemId(nextItemId);
    if (item) setUnitPrice(String(item.unitPrice));
  };

  const validate = () => {
    const errors: FieldErrors = {};
    const quantityValue = Number(quantity);
    const priceValue = Number(unitPrice);

    if (!itemId) errors.item = t('screen_create_document.validation.item');
    if (!Number.isFinite(quantityValue) || quantityValue <= 0) {
      errors.quantity = t('screen_create_document.validation.quantity');
    }
    if (!Number.isFinite(priceValue) || priceValue < 0) {
      errors.unitPrice = t('screen_create_document.validation.unit_price');
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    createMutation.reset();
    if (!validate() || !itemId) return;

    createMutation.mutate(
      {
        created_by: 'Admin',
        lines: [
          {
            item_id: Number(itemId),
            note: note.trim(),
            quantity: Number(quantity),
            unit_price: Number(unitPrice),
          },
        ],
        note: note.trim(),
        party: party.trim(),
        subtype,
      },
      {
        onSuccess: (document) => {
          navigation.replace(Paths.ReceiptDetail, {
            documentId: document.id,
          });
        },
      },
    );
  };

  const tabOptions = (['import', 'export'] as const).map((id) => ({
    id,
    label: t(`screen_transactions.tabs.${id}`),
  }));

  return (
    <SafeScreen
      edges={['top', 'left', 'right']}
      isError={catalogQuery.isError}
      onResetError={() => {
        void catalogQuery.refetch();
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[layout.flex_1, backgrounds.surfaceSunken]}
      >
        <ScrollView
          contentContainerStyle={[
            gutters.gap_16,
            gutters.padding_16,
            gutters.paddingBottom_40,
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[layout.row, layout.itemsCenter, gutters.gap_12]}>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => {
                navigation.goBack();
              }}
              testID="create-document-back"
            >
              <IconByVariant
                height={ICON_SIZE}
                path="chevron-left"
                stroke={colors.gray800}
                width={ICON_SIZE}
              />
            </TouchableOpacity>
            <Text
              style={[layout.flex_1, fonts.size_20, fonts.gray800, fonts.bold]}
            >
              {t('screen_create_document.title')}
            </Text>
          </View>

          <Card style={[gutters.gap_16]}>
            <SegmentTabs
              activeId={tab}
              onSelect={(id) => {
                const nextTab = id as TransactionKind;
                setTab(nextTab);
                setSubtype(SUBTYPES_BY_TAB[nextTab][0]);
              }}
              options={tabOptions}
            />

            <View style={[gutters.gap_8]}>
              <Text style={[fonts.size_14, fonts.gray800]}>
                {t('screen_create_document.subtype')}
              </Text>
              <ScrollView
                contentContainerStyle={[gutters.gap_8]}
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                {SUBTYPES_BY_TAB[tab].map((option) => (
                  <CategoryChip
                    isActive={option === subtype}
                    key={option}
                    label={t(`screen_transactions.filters.${option}`)}
                    onPress={() => {
                      setSubtype(option);
                    }}
                    testID={`create-document-subtype-${option}`}
                  />
                ))}
              </ScrollView>
            </View>

            <View style={[gutters.gap_8]}>
              <Text style={[fonts.size_14, fonts.gray800]}>
                {t('screen_create_document.item')}
              </Text>
              <ScrollView
                contentContainerStyle={[gutters.gap_8]}
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                {(catalogQuery.data?.items ?? []).map((item) => (
                  <CategoryChip
                    isActive={item.id === itemId}
                    key={item.id}
                    label={item.fullName}
                    onPress={() => {
                      handleSelectItem(item.id);
                    }}
                    testID={`create-document-item-${item.id}`}
                  />
                ))}
              </ScrollView>
              {fieldErrors.item ? (
                <Text style={[fonts.size_12, fonts.red500]}>
                  {fieldErrors.item}
                </Text>
              ) : undefined}
            </View>

            <FormField
              label={t('screen_create_document.party')}
              onChangeText={setParty}
              testID="create-document-party"
              value={party}
            />
            <FormField
              error={fieldErrors.quantity}
              keyboardType="decimal-pad"
              label={`${t('screen_create_document.quantity')}${selectedItem?.unit ? ` (${selectedItem.unit})` : ''}`}
              onChangeText={setQuantity}
              testID="create-document-quantity"
              value={quantity}
            />
            <FormField
              error={fieldErrors.unitPrice}
              keyboardType="decimal-pad"
              label={t('screen_create_document.unit_price')}
              onChangeText={setUnitPrice}
              testID="create-document-unit-price"
              value={unitPrice}
            />
            <FormField
              label={t('screen_create_document.note')}
              multiline
              onChangeText={setNote}
              style={{ height: 88, textAlignVertical: 'top' }}
              testID="create-document-note"
              value={note}
            />
          </Card>

          {createMutation.isError ? (
            <Text style={[fonts.size_12, fonts.red500, fonts.alignCenter]}>
              {t('screen_create_document.error')}
            </Text>
          ) : undefined}

          <TouchableOpacity
            accessibilityRole="button"
            disabled={createMutation.isPending}
            onPress={handleSubmit}
            style={[
              components.buttonPrimary,
              createMutation.isPending
                ? components.buttonPrimaryDisabled
                : undefined,
            ]}
            testID="create-document-submit"
          >
            {createMutation.isPending ? (
              <ActivityIndicator color={components.buttonPrimaryLabel.color} />
            ) : (
              <Text style={[components.buttonPrimaryLabel]}>
                {t('screen_create_document.submit')}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

export default CreateDocument;
