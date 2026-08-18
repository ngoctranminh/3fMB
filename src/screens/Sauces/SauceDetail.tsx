import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { toItemLocale } from '@/hooks/language/schema';
import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { useTheme } from '@/theme';

import { Card, CategoryChip, IconByVariant } from '@/components/atoms';
import { FixedScreenHeader, SafeScreen } from '@/components/templates';

import SauceAccessGuard from './SauceAccessGuard';
import { getSauceRecipe } from './sauceRecipes';

const HEADER_ICON_SIZE = 24;
const HALF_SCALE = 1 / 2;
const SCALE_OPTIONS = [HALF_SCALE, 1, 2, 3] as const;

function SauceDetail({
  navigation,
  route,
}: RootScreenProps<Paths.SauceDetail>) {
  const { i18n, t } = useTranslation();
  const { backgrounds, colors, fonts, gutters, layout } = useTheme();
  const [scale, setScale] = useState<number>(1);
  const recipe = getSauceRecipe(route.params.sauceId);
  const locale = toItemLocale(i18n.language);
  const handleUnauthorized = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(amount);

  return (
    <SauceAccessGuard onUnauthorized={handleUnauthorized}>
      <SafeScreen edges={['top', 'left', 'right']}>
        <View
          style={[layout.flex_1, backgrounds.surfaceSunken]}
          testID="sauce-detail-screen"
        >
          <FixedScreenHeader>
            <View style={[layout.row, layout.itemsCenter, gutters.gap_12]}>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => {
                  navigation.goBack();
                }}
                testID="sauce-detail-back"
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
                  {recipe?.name ?? t('screen_sauces.detail_title')}
                </Text>
                <Text style={[fonts.size_12, fonts.gray200]}>
                  {t('screen_sauces.detail_subtitle')}
                </Text>
              </View>
            </View>
          </FixedScreenHeader>

          <ScrollView
            contentContainerStyle={[
              gutters.gap_16,
              gutters.padding_16,
              gutters.paddingBottom_40,
            ]}
            showsVerticalScrollIndicator={false}
          >
            {recipe ? (
              <>
                {recipe.ingredients.length > 0 ? (
                  <Card style={[gutters.gap_12]}>
                    <Text style={[fonts.size_14, fonts.gray800, fonts.bold]}>
                      {t('screen_sauces.scale')}
                    </Text>
                    <View
                      style={[
                        layout.row,
                        layout.itemsCenter,
                        layout.justifyBetween,
                        gutters.gap_8,
                      ]}
                    >
                      {SCALE_OPTIONS.map((option) => (
                        <CategoryChip
                          isActive={scale === option}
                          key={option}
                          label={`${String(option)}×`}
                          onPress={() => {
                            setScale(option);
                          }}
                          testID={`sauce-detail-scale-${String(option)}`}
                        />
                      ))}
                    </View>
                  </Card>
                ) : undefined}

                {recipe.ingredients.length > 0 ? (
                  <Card style={[gutters.gap_16]}>
                    <View
                      style={[
                        layout.row,
                        layout.itemsCenter,
                        layout.justifyBetween,
                        gutters.gap_8,
                      ]}
                    >
                      <Text style={[fonts.size_16, fonts.gray800, fonts.bold]}>
                        {t('screen_sauces.ingredients')}
                      </Text>
                      <Text style={[fonts.size_12, { color: colors.blue500 }]}>
                        {String(scale)}×
                      </Text>
                    </View>

                    <View style={[gutters.gap_12]}>
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
                            style={[
                              layout.flex_1,
                              fonts.size_14,
                              fonts.gray800,
                            ]}
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
                  </Card>
                ) : undefined}

                {recipe.note ? (
                  <Card style={[gutters.gap_8]}>
                    <Text style={[fonts.size_16, fonts.gray800, fonts.bold]}>
                      {t('screen_sauces.formula')}
                    </Text>
                    <Text style={[fonts.size_14, fonts.gray800]}>
                      {recipe.note}
                    </Text>
                  </Card>
                ) : undefined}

                {recipe.instructions ? (
                  <Card style={[gutters.gap_12]}>
                    <Text style={[fonts.size_16, fonts.gray800, fonts.bold]}>
                      {t('screen_sauces.instructions')}
                    </Text>
                    <View style={[gutters.gap_12]}>
                      {recipe.instructions.map((instruction, index) => (
                        <View
                          key={instruction}
                          style={[layout.row, gutters.gap_8]}
                        >
                          <Text
                            style={[fonts.size_14, { color: colors.blue500 }]}
                          >
                            {String(index + 1)}.
                          </Text>
                          <Text
                            style={[
                              layout.flex_1,
                              fonts.size_14,
                              fonts.gray800,
                            ]}
                          >
                            {instruction}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </Card>
                ) : undefined}

                <Text style={[fonts.size_12, fonts.gray200, fonts.alignCenter]}>
                  {t('screen_sauces.disclaimer')}
                </Text>
              </>
            ) : (
              <Card>
                <Text style={[fonts.size_14, fonts.gray200, fonts.alignCenter]}>
                  {t('operations_common.empty')}
                </Text>
              </Card>
            )}
          </ScrollView>
        </View>
      </SafeScreen>
    </SauceAccessGuard>
  );
}

export default SauceDetail;
