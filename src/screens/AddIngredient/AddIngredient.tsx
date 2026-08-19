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
import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { useTheme } from '@/theme';

import { Card, CategoryChip, IconByVariant } from '@/components/atoms';
import { FormField } from '@/components/molecules';
import { FixedScreenHeader, SafeScreen } from '@/components/templates';

type FieldErrors = {
  czechName?: string;
  englishName?: string;
  expiresAt?: string;
  group?: string;
  name?: string;
  numbers?: string;
  unit?: string;
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ICON_SIZE = 24;

function AddIngredient({ navigation }: RootScreenProps<Paths.AddIngredient>) {
  const { t } = useTranslation();
  const { backgrounds, colors, components, fonts, gutters, layout } =
    useTheme();
  const { useCreateItemMutation, useFetchInventoryCatalogQuery } =
    useInventory();

  const catalogQuery = useFetchInventoryCatalogQuery();
  const createMutation = useCreateItemMutation();

  const [expiresAt, setExpiresAt] = useState('');
  const [czechName, setCzechName] = useState('');
  const [czechNote, setCzechNote] = useState('');
  const [englishName, setEnglishName] = useState('');
  const [englishNote, setEnglishNote] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [groupId, setGroupId] = useState<string>();
  const [minQuantity, setMinQuantity] = useState('0');
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [quantity, setQuantity] = useState('0');
  const [unit, setUnit] = useState('kg');
  const [unitPrice, setUnitPrice] = useState('0');

  const validate = () => {
    const errors: FieldErrors = {};
    const numericValues = [quantity, unitPrice, minQuantity].map(Number);

    if (!groupId) errors.group = t('screen_add_ingredient.validation.group');
    if (!name.trim()) errors.name = t('screen_add_ingredient.validation.name');
    if (!unit.trim()) errors.unit = t('screen_add_ingredient.validation.unit');
    if (numericValues.some((value) => !Number.isFinite(value) || value < 0)) {
      errors.numbers = t('screen_add_ingredient.validation.numbers');
    }
    if (expiresAt && !DATE_PATTERN.test(expiresAt)) {
      errors.expiresAt = t('screen_add_ingredient.validation.date');
    }
    if (englishNote.trim() && !englishName.trim()) {
      errors.englishName = t(
        'screen_add_ingredient.validation.translation_name',
      );
    }
    if (czechNote.trim() && !czechName.trim()) {
      errors.czechName = t('screen_add_ingredient.validation.translation_name');
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    createMutation.reset();
    if (!validate() || !groupId) return;

    createMutation.mutate(
      {
        expires_at: expiresAt || undefined,
        min_quantity: Number(minQuantity),
        name: name.trim(),
        note: note.trim(),
        parent_id: Number(groupId),
        quantity: Number(quantity),
        translations: {
          ...(englishName.trim()
            ? {
                'en-US': {
                  name: englishName.trim(),
                  note: englishNote.trim(),
                },
              }
            : {}),
          ...(czechName.trim()
            ? {
                'cs-CZ': {
                  name: czechName.trim(),
                  note: czechNote.trim(),
                },
              }
            : {}),
        },
        unit: unit.trim(),
        unit_price: Number(unitPrice),
      },
      {
        onSuccess: (item) => {
          navigation.replace(Paths.ItemDetail, { itemId: String(item.id) });
        },
      },
    );
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
              testID="add-ingredient-back"
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
              {t('screen_add_ingredient.title')}
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
              <Text style={[fonts.size_14, fonts.gray800]}>
                {t('screen_add_ingredient.group')}
              </Text>
              <ScrollView
                contentContainerStyle={[gutters.gap_8]}
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                {(catalogQuery.data?.groups ?? []).map((group) => (
                  <CategoryChip
                    isActive={group.id === groupId}
                    key={group.id}
                    label={group.name}
                    onPress={() => {
                      setGroupId(group.id);
                    }}
                    testID={`add-ingredient-group-${group.id}`}
                  />
                ))}
              </ScrollView>
              {fieldErrors.group ? (
                <Text style={[fonts.size_12, fonts.red500]}>
                  {fieldErrors.group}
                </Text>
              ) : undefined}
            </View>

            <FormField
              error={fieldErrors.name}
              label={t('screen_add_ingredient.name')}
              onChangeText={setName}
              testID="add-ingredient-name"
              value={name}
            />
            <View style={[layout.row, gutters.gap_12]}>
              <FormField
                containerStyle={[layout.flex_1]}
                error={fieldErrors.numbers}
                keyboardType="decimal-pad"
                label={t('screen_add_ingredient.quantity')}
                onChangeText={setQuantity}
                testID="add-ingredient-quantity"
                value={quantity}
              />
              <FormField
                containerStyle={[layout.flex_1]}
                error={fieldErrors.unit}
                label={t('screen_add_ingredient.unit')}
                onChangeText={setUnit}
                testID="add-ingredient-unit"
                value={unit}
              />
            </View>
            <FormField
              error={fieldErrors.numbers}
              keyboardType="decimal-pad"
              label={t('screen_add_ingredient.unit_price')}
              onChangeText={setUnitPrice}
              testID="add-ingredient-unit-price"
              value={unitPrice}
            />
            <FormField
              error={fieldErrors.numbers}
              keyboardType="decimal-pad"
              label={t('screen_add_ingredient.min_quantity')}
              onChangeText={setMinQuantity}
              testID="add-ingredient-min-quantity"
              value={minQuantity}
            />
            <FormField
              error={fieldErrors.expiresAt}
              label={t('screen_add_ingredient.expires_at')}
              onChangeText={setExpiresAt}
              placeholder="YYYY-MM-DD"
              testID="add-ingredient-expires-at"
              value={expiresAt}
            />
            <FormField
              label={t('screen_add_ingredient.note')}
              multiline
              onChangeText={setNote}
              style={{ height: 88, textAlignVertical: 'top' }}
              testID="add-ingredient-note"
              value={note}
            />

            <View style={[gutters.gap_4]}>
              <Text style={[fonts.size_16, fonts.gray800, fonts.bold]}>
                {t('screen_add_ingredient.translations_title')}
              </Text>
              <Text style={[fonts.size_12, fonts.gray200]}>
                {t('screen_add_ingredient.translations_hint')}
              </Text>
            </View>

            <FormField
              error={fieldErrors.englishName}
              label={t('screen_add_ingredient.english_name')}
              onChangeText={setEnglishName}
              testID="add-ingredient-name-en"
              value={englishName}
            />
            <FormField
              label={t('screen_add_ingredient.english_note')}
              multiline
              onChangeText={setEnglishNote}
              style={{ height: 72, textAlignVertical: 'top' }}
              testID="add-ingredient-note-en"
              value={englishNote}
            />
            <FormField
              error={fieldErrors.czechName}
              label={t('screen_add_ingredient.czech_name')}
              onChangeText={setCzechName}
              testID="add-ingredient-name-cs"
              value={czechName}
            />
            <FormField
              label={t('screen_add_ingredient.czech_note')}
              multiline
              onChangeText={setCzechNote}
              style={{ height: 72, textAlignVertical: 'top' }}
              testID="add-ingredient-note-cs"
              value={czechNote}
            />
          </Card>

          {createMutation.isError ? (
            <Text style={[fonts.size_12, fonts.red500, fonts.alignCenter]}>
              {t('screen_add_ingredient.error')}
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
            testID="add-ingredient-submit"
          >
            {createMutation.isPending ? (
              <ActivityIndicator color={components.buttonPrimaryLabel.color} />
            ) : (
              <Text style={[components.buttonPrimaryLabel]}>
                {t('screen_add_ingredient.submit')}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

export default AddIngredient;
