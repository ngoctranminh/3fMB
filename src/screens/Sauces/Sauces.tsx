import { useCallback, useMemo, useState } from 'react';
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

import { Card, IconByVariant } from '@/components/atoms';
import { SafeScreen } from '@/components/templates';

import SauceAccessGuard from './SauceAccessGuard';
import { SAUCE_RECIPES } from './sauceRecipes';

const HEADER_ICON_SIZE = 24;
const SEARCH_ICON_SIZE = 18;

const normalizeSearch = (value: string) =>
  value
    .normalize('NFD')
    .replaceAll(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replaceAll('đ', 'd');

function Sauces({ navigation }: RootScreenProps<Paths.Sauces>) {
  const { t } = useTranslation();
  const { backgrounds, colors, components, fonts, gutters, layout } =
    useTheme();
  const [query, setQuery] = useState('');
  const handleUnauthorized = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const visibleRecipes = useMemo(() => {
    const normalized = normalizeSearch(query.trim());
    if (!normalized) return SAUCE_RECIPES;
    return SAUCE_RECIPES.filter((recipe) =>
      normalizeSearch(recipe.name).includes(normalized),
    );
  }, [query]);

  return (
    <SauceAccessGuard onUnauthorized={handleUnauthorized}>
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
                placeholderTextColor={colors.inputPlaceholder}
                style={[components.searchInput]}
                testID="sauces-search"
                value={query}
              />
            </View>

            {visibleRecipes.length === 0 ? (
              <Card>
                <Text style={[fonts.size_14, fonts.gray200, fonts.alignCenter]}>
                  {t('operations_common.empty')}
                </Text>
              </Card>
            ) : (
              visibleRecipes.map((recipe) => {
                const recipeSummary =
                  recipe.ingredients.length > 0
                    ? t('screen_sauces.ingredient_count', {
                        count: recipe.ingredients.length,
                      })
                    : t('screen_sauces.ratio_recipe');

                return (
                  <TouchableOpacity
                    accessibilityRole="button"
                    key={recipe.id}
                    onPress={() => {
                      navigation.navigate(Paths.SauceDetail, {
                        sauceId: recipe.id,
                      });
                    }}
                    testID={`sauce-item-${recipe.id}`}
                  >
                    <Card>
                      <View
                        style={[layout.row, layout.itemsCenter, gutters.gap_12]}
                      >
                        <View style={[layout.flex_1, gutters.gap_4]}>
                          <Text
                            style={[fonts.size_16, fonts.gray800, fonts.bold]}
                          >
                            {recipe.name}
                          </Text>
                          <Text style={[fonts.size_12, fonts.gray200]}>
                            {recipeSummary}
                          </Text>
                        </View>
                        <Text
                          style={[fonts.size_12, { color: colors.blue500 }]}
                        >
                          {t('screen_sauces.view_recipe')}
                        </Text>
                        <IconByVariant
                          height={SEARCH_ICON_SIZE}
                          path="chevron-right"
                          stroke={colors.gray200}
                          width={SEARCH_ICON_SIZE}
                        />
                      </View>
                    </Card>
                  </TouchableOpacity>
                );
              })
            )}

            <Text style={[fonts.size_12, fonts.gray200, fonts.alignCenter]}>
              {t('screen_sauces.disclaimer')}
            </Text>
          </ScrollView>
        </View>
      </SafeScreen>
    </SauceAccessGuard>
  );
}

export default Sauces;
