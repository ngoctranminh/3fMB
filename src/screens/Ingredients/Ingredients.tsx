import type { CategoryFilter } from './mockData';

import { Fragment, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

import { Card, CategoryChip, IconByVariant } from '@/components/atoms';
import { IngredientDetailRow, SearchBar } from '@/components/molecules';
import { IngredientsHeader, IngredientsSummary } from '@/components/organisms';
import { SafeScreen } from '@/components/templates';

import { CATEGORY_FILTERS, INGREDIENTS } from './mockData';

const BOTTOM_PADDING = 180;
const ON_BLUE = '#FFFFFF';
const PLUS_SIZE = 20;
const TOTAL_COUNT = 128;
const TOTAL_VALUE = '45.250.000đ';

function Ingredients() {
  const { t } = useTranslation();
  const { backgrounds, components, gutters, layout } = useTheme();

  const [category, setCategory] = useState<CategoryFilter>('all');
  const [query, setQuery] = useState('');

  const visibleItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return INGREDIENTS.filter((item) => {
      const matchesCategory = category === 'all' || item.category === category;
      const matchesQuery =
        normalized.length === 0 || item.name.toLowerCase().includes(normalized);

      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  const lowCount = INGREDIENTS.filter((item) => item.status === 'low').length;
  const expiredCount = INGREDIENTS.filter(
    (item) => item.status === 'expired',
  ).length;

  return (
    <SafeScreen edges={['top', 'left', 'right']}>
      <View
        style={[layout.flex_1, backgrounds.surfaceSunken]}
        testID="ingredients-screen"
      >
        <ScrollView
          contentContainerStyle={[
            gutters.gap_16,
            gutters.paddingVertical_16,
            { paddingBottom: BOTTOM_PADDING },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[gutters.paddingHorizontal_16]}>
            <IngredientsHeader />
          </View>

          <ScrollView
            contentContainerStyle={[
              gutters.gap_8,
              gutters.paddingHorizontal_16,
            ]}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {CATEGORY_FILTERS.map((filter) => (
              <CategoryChip
                isActive={filter === category}
                key={filter}
                label={t(`screen_ingredients.categories.${filter}`)}
                onPress={() => {
                  setCategory(filter);
                }}
                testID={`category-${filter}`}
              />
            ))}
          </ScrollView>

          <View style={[gutters.gap_16, gutters.paddingHorizontal_16]}>
            <IngredientsSummary
              expiredCount={expiredCount}
              lowCount={lowCount}
              totalCount={TOTAL_COUNT}
              totalValue={TOTAL_VALUE}
            />

            <Card>
              <SearchBar onChangeText={setQuery} value={query} />

              <View style={[gutters.marginTop_8]}>
                {visibleItems.length === 0 ? (
                  <Text
                    style={[
                      components.categoryChipLabel,
                      gutters.paddingVertical_16,
                    ]}
                  >
                    {t('screen_ingredients.empty')}
                  </Text>
                ) : (
                  visibleItems.map((item, index) => (
                    <Fragment key={item.id}>
                      {index > 0 ? (
                        <View style={[backgrounds.gray100, { height: 1 }]} />
                      ) : undefined}
                      <IngredientDetailRow item={item} />
                    </Fragment>
                  ))
                )}
              </View>
            </Card>
          </View>
        </ScrollView>

        <View
          style={[
            layout.absolute,
            layout.left0,
            layout.right0,
            layout.itemsCenter,
            { bottom: BOTTOM_PADDING / 2 },
          ]}
        >
          <TouchableOpacity
            accessibilityRole="button"
            style={[components.buttonPill]}
            testID="ingredients-add"
          >
            <IconByVariant
              height={PLUS_SIZE}
              path="plus"
              stroke={ON_BLUE}
              width={PLUS_SIZE}
            />
            <Text style={[components.buttonPillLabel]}>
              {t('screen_ingredients.add')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeScreen>
  );
}

export default Ingredients;
