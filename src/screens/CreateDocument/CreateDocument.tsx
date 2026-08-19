import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';

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
import { FormField } from '@/components/molecules';
import { FixedScreenHeader, SafeScreen } from '@/components/templates';

type CapturedPhoto = {
  readonly dataUrl: string;
  readonly fileName: string;
  readonly uri: string;
};

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
const IMPORT_SUBTYPES = new Set<DocumentSubtype>([
  'other_in',
  'purchase',
  'return',
]);

const kindForSubtype = (subtype: DocumentSubtype): TransactionKind =>
  IMPORT_SUBTYPES.has(subtype) ? 'import' : 'export';

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
  const [cameraError, setCameraError] = useState<string>();
  const [isCameraPending, setIsCameraPending] = useState(false);
  const [itemId, setItemId] = useState<string>();
  const [lines, setLines] = useState<readonly DraftLine[]>([]);
  const [note, setNote] = useState('');
  const [party, setParty] = useState('');
  const [photo, setPhoto] = useState<CapturedPhoto>();
  const [query, setQuery] = useState('');
  const subtype = route.params.initialSubtype;
  const kind = kindForSubtype(subtype);

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
      if (kind === 'export' && item && quantityValue > item.quantity) {
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
        ...(kind === 'import' && photo
          ? { image: photo.dataUrl, image_name: photo.fileName }
          : {}),
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

  const handleTakePhoto = async () => {
    setCameraError(undefined);
    setIsCameraPending(true);

    try {
      const response = await launchCamera({
        assetRepresentationMode: 'compatible',
        cameraType: 'back',
        includeBase64: true,
        maxHeight: 1024,
        maxWidth: 1024,
        mediaType: 'photo',
        quality: 0.5,
      });

      if (response.didCancel) return;
      if (response.errorCode) {
        setCameraError(
          response.errorCode === 'permission'
            ? t('screen_create_document.photo_permission_error')
            : t('screen_create_document.photo_error'),
        );
        return;
      }

      const asset = response.assets?.[0];
      if (!asset?.base64 || !asset.uri) {
        setCameraError(t('screen_create_document.photo_error'));
        return;
      }

      setPhoto({
        dataUrl: `data:${asset.type ?? 'image/jpeg'};base64,${asset.base64}`,
        fileName: asset.fileName ?? 'anh-nhap-hang.jpg',
        uri: asset.uri,
      });
    } catch {
      setCameraError(t('screen_create_document.photo_error'));
    } finally {
      setIsCameraPending(false);
    }
  };

  return (
    <SafeScreen
      edges={['top', 'left', 'right']}
      isError={catalogQuery.isError}
      onGoBackError={() => {
        navigation.goBack();
      }}
      onResetError={() => {
        void catalogQuery.refetch();
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[layout.flex_1, backgrounds.surfaceSunken]}
      >
        <FixedScreenHeader>
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
              {t(`screen_create_document.titles.${subtype}`)}
            </Text>
          </View>
        </FixedScreenHeader>

        <ScrollView
          contentContainerStyle={[
            gutters.gap_16,
            gutters.padding_16,
            gutters.paddingBottom_40,
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <Card style={[gutters.gap_16]}>
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
                  placeholderTextColor={colors.inputPlaceholder}
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
                  const isEditing = itemId === line.itemId;
                  const lineValue =
                    Number(line.quantity) * Number(line.unitPrice);

                  return (
                    <View
                      key={line.itemId}
                      style={[
                        layout.row,
                        layout.itemsCenter,
                        gutters.gap_8,
                        gutters.paddingVertical_8,
                        gutters.paddingHorizontal_8,
                        {
                          backgroundColor: isEditing
                            ? colors.blue50
                            : undefined,
                          borderColor: isEditing
                            ? colors.blue500
                            : 'transparent',
                          borderRadius: 8,
                          borderWidth: 1,
                        },
                      ]}
                    >
                      <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityState={{ selected: isEditing }}
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
                            isEditing ? fonts.blue500 : fonts.gray800,
                            isEditing ? fonts.bold : undefined,
                          ]}
                        >
                          {item?.fullName ?? line.itemId}
                        </Text>
                        <Text
                          style={[
                            fonts.size_12,
                            isEditing ? fonts.blue500 : fonts.gray200,
                          ]}
                        >
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

            <View style={[gutters.gap_12]}>
              <View
                style={[
                  gutters.gap_4,
                  gutters.padding_12,
                  {
                    backgroundColor: selectedItem
                      ? colors.blue50
                      : colors.surfaceSunken,
                    borderColor: selectedItem
                      ? colors.blue500
                      : colors.inputBorder,
                    borderRadius: 12,
                    borderWidth: 1,
                  },
                ]}
                testID="create-document-editing-banner"
              >
                <Text
                  style={[
                    fonts.size_14,
                    selectedItem ? fonts.blue500 : fonts.gray800,
                    fonts.bold,
                  ]}
                >
                  {selectedItem
                    ? t('screen_create_document.editing', {
                        name: selectedItem.fullName,
                      })
                    : t('screen_create_document.line_details')}
                </Text>
                <Text
                  style={[
                    fonts.size_12,
                    selectedItem ? fonts.blue500 : fonts.gray200,
                  ]}
                >
                  {selectedItem
                    ? t('screen_create_document.available_stock', {
                        quantity: selectedItem.quantity,
                        unit: selectedItem.unit,
                      })
                    : t('screen_create_document.select_item_hint')}
                </Text>
              </View>
              <FormField
                editable={Boolean(selectedLine && selectedItem)}
                error={fieldErrors.quantity ?? fieldErrors.stock}
                keyboardType="decimal-pad"
                label={
                  selectedItem
                    ? `${t('screen_create_document.quantity')} (${selectedItem.unit})`
                    : t('screen_create_document.quantity')
                }
                onChangeText={(value) => {
                  updateSelectedLine('quantity', value);
                }}
                placeholder={t(
                  selectedItem
                    ? 'screen_create_document.quantity_placeholder'
                    : 'screen_create_document.select_item_placeholder',
                )}
                testID="create-document-quantity"
                value={selectedLine?.quantity ?? ''}
              />
              <FormField
                editable={Boolean(selectedLine && selectedItem)}
                error={fieldErrors.unitPrice}
                keyboardType="decimal-pad"
                label={t('screen_create_document.unit_price')}
                onChangeText={(value) => {
                  updateSelectedLine('unitPrice', value);
                }}
                placeholder={t(
                  selectedItem
                    ? 'screen_create_document.unit_price_placeholder'
                    : 'screen_create_document.select_item_placeholder',
                )}
                testID="create-document-unit-price"
                value={selectedLine?.unitPrice ?? ''}
              />
            </View>

            <FormField
              label={t(`screen_create_document.party_labels.${subtype}`)}
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

            {kind === 'import' ? (
              <View style={[gutters.gap_8]}>
                <Text style={[fonts.size_14, fonts.gray800]}>
                  {t('screen_create_document.photo_title')}
                </Text>
                <Text style={[fonts.size_12, fonts.gray200]}>
                  {t('screen_create_document.photo_hint')}
                </Text>

                {photo ? (
                  <Image
                    accessibilityLabel={t(
                      'screen_create_document.photo_preview',
                    )}
                    resizeMode="cover"
                    source={{ uri: photo.uri }}
                    style={{ borderRadius: 12, height: 200, width: '100%' }}
                    testID="create-document-photo-preview"
                  />
                ) : undefined}

                <View style={[layout.row, gutters.gap_8]}>
                  <TouchableOpacity
                    accessibilityRole="button"
                    disabled={isCameraPending}
                    onPress={() => {
                      void handleTakePhoto();
                    }}
                    style={[
                      layout.flex_1,
                      layout.row,
                      layout.itemsCenter,
                      layout.justifyCenter,
                      gutters.gap_8,
                      gutters.paddingVertical_12,
                      components.iconButtonSquare,
                      { backgroundColor: colors.blue50 },
                    ]}
                    testID="create-document-take-photo"
                  >
                    {isCameraPending ? (
                      <ActivityIndicator color={colors.blue500} />
                    ) : (
                      <IconByVariant
                        height={ICON_SIZE}
                        path="camera"
                        stroke={colors.blue500}
                        width={ICON_SIZE}
                      />
                    )}
                    <Text style={[fonts.size_14, fonts.blue500, fonts.bold]}>
                      {t(
                        photo
                          ? 'screen_create_document.retake_photo'
                          : 'screen_create_document.take_photo',
                      )}
                    </Text>
                  </TouchableOpacity>

                  {photo ? (
                    <TouchableOpacity
                      accessibilityLabel={t(
                        'screen_create_document.remove_photo',
                      )}
                      accessibilityRole="button"
                      onPress={() => {
                        setPhoto(undefined);
                        setCameraError(undefined);
                      }}
                      style={[
                        layout.itemsCenter,
                        layout.justifyCenter,
                        components.iconButtonSquare,
                        { backgroundColor: colors.red50, width: 48 },
                      ]}
                      testID="create-document-remove-photo"
                    >
                      <IconByVariant
                        height={ICON_SIZE}
                        path="x-circle"
                        stroke={colors.red500}
                        width={ICON_SIZE}
                      />
                    </TouchableOpacity>
                  ) : undefined}
                </View>

                {cameraError ? (
                  <Text style={[fonts.size_12, fonts.red500]}>
                    {cameraError}
                  </Text>
                ) : undefined}
              </View>
            ) : undefined}
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
                {t(`screen_create_document.titles.${subtype}`)}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

export default CreateDocument;
