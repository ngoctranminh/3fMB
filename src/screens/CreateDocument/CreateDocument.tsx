import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useInventory } from '@/hooks';
import { formatCurrency } from '@/hooks/domain/inventory/adapters';
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

type DraftLine = {
  readonly itemId: string;
  readonly quantity: string;
  readonly unitPrice: string;
};

type FieldErrors = {
  item?: string;
  quantity?: string;
  stock?: string;
  unitPrice?: string;
};

const ICON_SIZE = 24;
const SEARCH_ICON_SIZE = 18;
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

const normalizeSearch = (value: string) =>
  value
    .normalize('NFD')
    .replaceAll(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replaceAll('đ', 'd');

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
  const [lines, setLines] = useState<readonly DraftLine[]>([]);
  const [note, setNote] = useState('');
  const [party, setParty] = useState('');
  const [query, setQuery] = useState('');
  const [subtype, setSubtype] = useState(route.params.initialSubtype);
  const [tab, setTab] = useState<TransactionKind>(() =>
    tabForSubtype(route.params.initialSubtype),
  );

  const selectedLine = lines.find((line) => line.itemId === itemId);
  const selectedItem = catalogQuery.data?.items.find(
    (item) => item.id === itemId,
  );

  const visibleItems = useMemo(() => {
    const normalized = normalizeSearch(query.trim());
    const items = catalogQuery.data?.items ?? [];

    if (!normalized) return items;
    return items.filter((item) =>
      normalizeSearch(item.fullName).includes(normalized),
    );
  }, [catalogQuery.data?.items, query]);

  const totalValue = useMemo(() => {
    let total = 0;
    for (const line of lines) {
      const quantity = Number(line.quantity);
      const unitPrice = Number(line.unitPrice);
      if (Number.isFinite(quantity) && Number.isFinite(unitPrice)) {
        total += quantity * unitPrice;
      }
    }
    return total;
  }, [lines]);

  const handleSelectItem = (nextItemId: string) => {
    const existingLine = lines.find((line) => line.itemId === nextItemId);
    const item = catalogQuery.data?.items.find(
      (entry) => entry.id === nextItemId,
    );

    setItemId(nextItemId);
    setFieldErrors({});
    if (!existingLine && item) {
      setLines((current) => [
        ...current,
        {
          itemId: nextItemId,
          quantity: '1',
          unitPrice: String(item.unitPrice),
        },
      ]);
    }
  };

  const updateSelectedLine = (
    field: 'quantity' | 'unitPrice',
    value: string,
  ) => {
    if (!itemId) return;
    setLines((current) =>
      current.map((line) =>
        line.itemId === itemId ? { ...line, [field]: value } : line,
      ),
    );
    setFieldErrors({});
  };

  const handleRemoveLine = (removedItemId: string) => {
    const remaining = lines.filter((line) => line.itemId !== removedItemId);
    setLines(remaining);
    if (itemId === removedItemId) setItemId(remaining.at(-1)?.itemId);
    setFieldErrors({});
  };

  const validate = () => {
    const errors: FieldErrors = {};
    let invalidItemId: string | undefined;

    if (lines.length === 0) {
      errors.item = t('screen_create_document.validation.item');
    }

    for (const line of lines) {
      const item = catalogQuery.data?.items.find(
        (entry) => entry.id === line.itemId,
      );
      const quantityValue = Number(line.quantity);
      const priceValue = Number(line.unitPrice);

      if (!Number.isFinite(quantityValue) || quantityValue <= 0) {
        errors.quantity = t('screen_create_document.validation.quantity');
        invalidItemId = line.itemId;
        break;
      }
      if (!Number.isFinite(priceValue) || priceValue < 0) {
        errors.unitPrice = t('screen_create_document.validation.unit_price');
        invalidItemId = line.itemId;
        break;
      }
      if (tab === 'export' && item && quantityValue > item.quantity) {
        errors.stock = t('screen_create_document.validation.stock', {
          quantity: item.quantity,
          unit: item.unit,
        });
        invalidItemId = line.itemId;
        break;
      }
    }

    if (invalidItemId) setItemId(invalidItemId);
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    createMutation.reset();
    if (!validate()) return;

    createMutation.mutate(
      {
        created_by: 'Admin',
        lines: lines.map((line) => ({
          item_id: Number(line.itemId),
          note: note.trim(),
          quantity: Number(line.quantity),
          unit_price: Number(line.unitPrice),
        })),
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
                setFieldErrors({});
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
              <View
                style={[layout.row, layout.itemsCenter, layout.justifyBetween]}
              >
                <Text style={[fonts.size_14, fonts.gray800]}>
                  {t('screen_create_document.item')}
                </Text>
                <Text style={[fonts.size_12, fonts.gray200]}>
                  {t('screen_create_document.selected_count', {
                    count: lines.length,
                  })}
                </Text>
              </View>

              <View style={[components.searchInputWrapper]}>
                <IconByVariant
                  height={SEARCH_ICON_SIZE}
                  path="magnifier"
                  stroke={colors.gray200}
                  width={SEARCH_ICON_SIZE}
                />
                <TextInput
                  onChangeText={setQuery}
                  placeholder={t('screen_create_document.search_placeholder')}
                  placeholderTextColor={colors.gray200}
                  style={[components.searchInput]}
                  testID="create-document-item-search"
                  value={query}
                />
              </View>

              <ScrollView
                contentContainerStyle={[gutters.gap_8]}
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                {visibleItems.map((item) => (
                  <CategoryChip
                    isActive={lines.some((line) => line.itemId === item.id)}
                    key={item.id}
                    label={item.fullName}
                    onPress={() => {
                      handleSelectItem(item.id);
                    }}
                    testID={`create-document-item-${item.id}`}
                  />
                ))}
              </ScrollView>
              {visibleItems.length === 0 ? (
                <Text style={[fonts.size_12, fonts.gray200]}>
                  {t('screen_create_document.search_empty')}
                </Text>
              ) : undefined}
              {fieldErrors.item ? (
                <Text style={[fonts.size_12, fonts.red500]}>
                  {fieldErrors.item}
                </Text>
              ) : undefined}
            </View>

            {lines.length > 0 ? (
              <View style={[gutters.gap_8]}>
                <Text style={[fonts.size_14, fonts.gray800, fonts.bold]}>
                  {t('screen_create_document.lines_title')}
                </Text>
                {lines.map((line) => {
                  const item = catalogQuery.data?.items.find(
                    (entry) => entry.id === line.itemId,
                  );
                  const lineValue =
                    Number(line.quantity) * Number(line.unitPrice);

                  return (
                    <View
                      key={line.itemId}
                      style={[
                        layout.row,
                        layout.itemsCenter,
                        gutters.gap_8,
                        gutters.paddingVertical_4,
                      ]}
                    >
                      <TouchableOpacity
                        accessibilityRole="button"
                        onPress={() => {
                          setItemId(line.itemId);
                          setFieldErrors({});
                        }}
                        style={[layout.flex_1]}
                        testID={`create-document-line-${line.itemId}`}
                      >
                        <Text
                          style={[
                            fonts.size_14,
                            fonts.gray800,
                            itemId === line.itemId ? fonts.bold : undefined,
                          ]}
                        >
                          {item?.fullName ?? line.itemId}
                        </Text>
                        <Text style={[fonts.size_12, fonts.gray200]}>
                          {line.quantity} {item?.unit} ·{' '}
                          {Number.isFinite(lineValue)
                            ? formatCurrency(lineValue)
                            : '—'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        accessibilityLabel={t(
                          'screen_create_document.remove_line',
                          { name: item?.fullName ?? line.itemId },
                        )}
                        accessibilityRole="button"
                        onPress={() => {
                          handleRemoveLine(line.itemId);
                        }}
                        testID={`create-document-remove-${line.itemId}`}
                      >
                        <IconByVariant
                          height={ICON_SIZE}
                          path="x-circle"
                          stroke={colors.red500}
                          width={ICON_SIZE}
                        />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            ) : undefined}

            {selectedLine && selectedItem ? (
              <View style={[gutters.gap_12]}>
                <Text style={[fonts.size_14, fonts.gray800, fonts.bold]}>
                  {t('screen_create_document.editing', {
                    name: selectedItem.fullName,
                  })}
                </Text>
                <Text style={[fonts.size_12, fonts.gray200]}>
                  {t('screen_create_document.available_stock', {
                    quantity: selectedItem.quantity,
                    unit: selectedItem.unit,
                  })}
                </Text>
                <FormField
                  error={fieldErrors.quantity ?? fieldErrors.stock}
                  keyboardType="decimal-pad"
                  label={`${t('screen_create_document.quantity')} (${selectedItem.unit})`}
                  onChangeText={(value) => {
                    updateSelectedLine('quantity', value);
                  }}
                  testID="create-document-quantity"
                  value={selectedLine.quantity}
                />
                <FormField
                  error={fieldErrors.unitPrice}
                  keyboardType="decimal-pad"
                  label={t('screen_create_document.unit_price')}
                  onChangeText={(value) => {
                    updateSelectedLine('unitPrice', value);
                  }}
                  testID="create-document-unit-price"
                  value={selectedLine.unitPrice}
                />
              </View>
            ) : undefined}

            <FormField
              label={t('screen_create_document.party')}
              onChangeText={setParty}
              testID="create-document-party"
              value={party}
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

          <Card style={[layout.row, layout.itemsCenter, layout.justifyBetween]}>
            <View>
              <Text style={[fonts.size_12, fonts.gray200]}>
                {t('screen_create_document.total')}
              </Text>
              <Text style={[fonts.size_20, fonts.gray800, fonts.bold]}>
                {formatCurrency(totalValue)}
              </Text>
            </View>
            <Text style={[fonts.size_12, fonts.gray200]}>
              {t('screen_create_document.selected_count', {
                count: lines.length,
              })}
            </Text>
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
