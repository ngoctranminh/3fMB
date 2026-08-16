import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { useTheme } from '@/theme';

import { Card, CategoryChip, IconByVariant } from '@/components/atoms';
import { SafeScreen } from '@/components/templates';

type RecipeIngredient = {
  readonly amount: number;
  readonly label: string;
  readonly unit: string;
};

type SauceRecipe = {
  readonly ingredients: readonly RecipeIngredient[];
  readonly instructions?: readonly string[];
  readonly name: string;
  readonly note?: string;
};

const HEADER_ICON_SIZE = 24;
const SEARCH_ICON_SIZE = 18;
const HALF_SCALE = 1 / 2;
const SCALE_OPTIONS = [HALF_SCALE, 1, 2, 3] as const;

const RECIPES: readonly SauceRecipe[] = [
  {
    ingredients: [
      { amount: 1.5, label: 'Mayonnaise', unit: 'kg' },
      { amount: 240, label: 'Đường', unit: 'g' },
      { amount: 120, label: 'Dầu mè', unit: 'g' },
      { amount: 1, label: 'Sprite', unit: 'lon (gần hết)' },
    ],
    name: 'Sốt trắng',
  },
  {
    ingredients: [
      { amount: 1.5, label: 'Mayonnaise', unit: 'kg' },
      { amount: 650, label: 'Tương ớt', unit: 'g' },
    ],
    name: 'Sốt cay',
  },
  {
    ingredients: [
      { amount: 400, label: 'Xì dầu', unit: 'g' },
      { amount: 160, label: 'Đường', unit: 'g' },
      { amount: 60, label: 'Chanh vàng', unit: 'g' },
    ],
    name: 'Sốt bún tofu',
  },
  {
    ingredients: [
      { amount: 1, label: 'Nước', unit: 'kg' },
      { amount: 1, label: 'Xì dầu', unit: 'kg' },
      { amount: 500, label: 'Đường', unit: 'g' },
      { amount: 600, label: 'Giấm', unit: 'g' },
    ],
    name: 'Sốt gyoza',
  },
  {
    ingredients: [
      { amount: 330, label: 'Chanh vàng', unit: 'g' },
      { amount: 300, label: 'Giấm', unit: 'g' },
      { amount: 1.2, label: 'Đường', unit: 'kg' },
      { amount: 960, label: 'Nước mắm mực', unit: 'g' },
      { amount: 2.4, label: 'Nước', unit: 'kg' },
    ],
    name: 'Nước mắm bún bò',
  },
  {
    ingredients: [
      { amount: 200, label: 'Xoài đá', unit: 'g' },
      { amount: 100, label: 'Nước', unit: 'g' },
    ],
    instructions: [
      'Ngâm xoài với nước một thời gian rồi xay nhuyễn.',
      'Lọc hỗn hợp qua rây.',
      'Vừa khuấy vừa đun lửa vừa, thêm khoảng nửa thìa đường đến khi sôi.',
      'Nếm lại và gia giảm.',
    ],
    name: 'Sốt xoài',
  },
  {
    ingredients: [
      { amount: 1.6, label: 'Tương ớt Hàn Quốc', unit: 'kg' },
      { amount: 700, label: 'Syrup ngô', unit: 'g' },
      { amount: 300, label: 'Coca', unit: 'g' },
    ],
    instructions: ['Khuấy tan đều.', 'Nếm lại và gia giảm.'],
    name: 'Sốt bibimbap',
  },
  {
    ingredients: [
      { amount: 8, label: 'Giấm', unit: 'lít' },
      { amount: 9, label: 'Đường', unit: 'kg' },
      { amount: 2, label: 'Muối', unit: 'bịch (gần đủ)' },
      { amount: 3, label: 'Rượu sake', unit: 'lít' },
    ],
    name: 'Giấm sushi',
  },
  {
    ingredients: [],
    instructions: [
      'Cân khối lượng sốt rồi chia cho 23,3 để ra lượng bột khoai.',
      'Lượng nước bằng 2 lần lượng bột khoai; khuấy tan bột và nước.',
      'Đun sôi sốt đen rồi tắt bếp.',
      'Khuấy sốt thành lốc xoáy và đổ nhanh hỗn hợp bột khoai vào.',
      'Tự kiểm tra độ đặc, loãng và điều chỉnh.',
    ],
    name: 'Đánh sốt đen',
    note: 'Công thức theo khối lượng sốt: bột khoai = khối lượng ÷ 23,3; nước = bột khoai × 2.',
  },
  {
    ingredients: [],
    name: 'Ướp gà bowl',
    note: 'Theo khối lượng gà: muối = 1,3%; dầu ăn = 2,5%.',
  },
];

const normalizeSearch = (value: string) =>
  value
    .normalize('NFD')
    .replaceAll(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replaceAll('đ', 'd');

const formatAmount = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(amount);

function Sauces({ navigation }: RootScreenProps<Paths.Sauces>) {
  const { t } = useTranslation();
  const { backgrounds, colors, components, fonts, gutters, layout } =
    useTheme();
  const [query, setQuery] = useState('');
  const [scale, setScale] = useState<number>(1);

  const visibleRecipes = useMemo(() => {
    const normalized = normalizeSearch(query.trim());
    if (!normalized) return RECIPES;
    return RECIPES.filter((recipe) =>
      normalizeSearch(recipe.name).includes(normalized),
    );
  }, [query]);

  return (
    <SafeScreen edges={['top', 'left', 'right']}>
      <View
        style={[layout.flex_1, backgrounds.surfaceSunken]}
        testID="sauces-screen"
      >
        <ScrollView
          contentContainerStyle={[
            gutters.gap_16,
            gutters.padding_16,
            gutters.paddingBottom_40,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[layout.row, layout.itemsCenter, gutters.gap_12]}>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => {
                navigation.goBack();
              }}
              testID="sauces-back"
            >
              <IconByVariant
                height={HEADER_ICON_SIZE}
                path="chevron-left"
                stroke={colors.gray800}
                width={HEADER_ICON_SIZE}
              />
            </TouchableOpacity>
            <View style={[layout.flex_1]}>
              <Text style={[fonts.size_20, fonts.gray800, fonts.bold]}>
                {t('screen_sauces.title')}
              </Text>
              <Text style={[fonts.size_12, fonts.gray200]}>
                {t('screen_sauces.subtitle')}
              </Text>
            </View>
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
              placeholder={t('screen_sauces.search_placeholder')}
              placeholderTextColor={colors.gray200}
              style={[components.searchInput]}
              testID="sauces-search"
              value={query}
            />
          </View>

          <Card style={[gutters.gap_8]}>
            <Text style={[fonts.size_14, fonts.gray800, fonts.bold]}>
              {t('screen_sauces.scale')}
            </Text>
            <ScrollView
              contentContainerStyle={[gutters.gap_8]}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {SCALE_OPTIONS.map((option) => (
                <CategoryChip
                  isActive={scale === option}
                  key={option}
                  label={`${String(option)}×`}
                  onPress={() => {
                    setScale(option);
                  }}
                  testID={`sauces-scale-${String(option)}`}
                />
              ))}
            </ScrollView>
          </Card>

          {visibleRecipes.length === 0 ? (
            <Card>
              <Text style={[fonts.size_14, fonts.gray200, fonts.alignCenter]}>
                {t('operations_common.empty')}
              </Text>
            </Card>
          ) : (
            visibleRecipes.map((recipe) => (
              <Card key={recipe.name} style={[gutters.gap_12]}>
                <View
                  style={[
                    layout.row,
                    layout.itemsCenter,
                    layout.justifyBetween,
                    gutters.gap_8,
                  ]}
                >
                  <Text
                    style={[
                      layout.flex_1,
                      fonts.size_16,
                      fonts.gray800,
                      fonts.bold,
                    ]}
                  >
                    {recipe.name}
                  </Text>
                  <Text style={[fonts.size_12, { color: colors.blue500 }]}>
                    {String(scale)}×
                  </Text>
                </View>

                {recipe.ingredients.length > 0 ? (
                  <View style={[gutters.gap_8]}>
                    {recipe.ingredients.map((ingredient) => (
                      <View
                        key={ingredient.label}
                        style={[
                          layout.row,
                          layout.itemsCenter,
                          layout.justifyBetween,
                          gutters.gap_12,
                        ]}
                      >
                        <Text
                          style={[layout.flex_1, fonts.size_14, fonts.gray800]}
                        >
                          {ingredient.label}
                        </Text>
                        <Text
                          style={[fonts.size_14, fonts.gray800, fonts.bold]}
                        >
                          {formatAmount(ingredient.amount * scale)}{' '}
                          {ingredient.unit}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : undefined}

                {recipe.note ? (
                  <Text style={[fonts.size_14, fonts.gray800]}>
                    {recipe.note}
                  </Text>
                ) : undefined}

                {recipe.instructions ? (
                  <View style={[gutters.gap_8]}>
                    {recipe.instructions.map((instruction, index) => (
                      <View
                        key={instruction}
                        style={[layout.row, gutters.gap_8]}
                      >
                        <Text style={[fonts.size_14, fonts.gray200]}>
                          {String(index + 1)}.
                        </Text>
                        <Text
                          style={[layout.flex_1, fonts.size_14, fonts.gray800]}
                        >
                          {instruction}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : undefined}
              </Card>
            ))
          )}

          <Text style={[fonts.size_12, fonts.gray200, fonts.alignCenter]}>
            {t('screen_sauces.disclaimer')}
          </Text>
        </ScrollView>
      </View>
    </SafeScreen>
  );
}

export default Sauces;
