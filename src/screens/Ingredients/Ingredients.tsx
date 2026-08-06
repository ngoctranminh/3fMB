import { Fragment, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useInventory } from '@/hooks';
import { formatCurrency } from '@/hooks/domain/inventory/adapters';
import { useTheme } from '@/theme';

import { Card, CategoryChip, IconByVariant } from '@/components/atoms';
import { IngredientDetailRow, SearchBar } from '@/components/molecules';
import {
  IngredientsHeader,
  IngredientsSummary,
  TAB_BAR_BASE_HEIGHT,
} from '@/components/organisms';
import { SafeScreen } from '@/components/templates';

const ALL_GROUPS = 'all';
const ON_BLUE = '#FFFFFF';
const PILL_GAP = 16;
const PILL_HEIGHT = 52;
const PLUS_SIZE = 20;

function Ingredients() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { backgrounds, components, gutters, layout } = useTheme();
  const { useFetchIngredientsQuery, useFetchSummaryQuery } = useInventory();

  const ingredientsQuery = useFetchIngredientsQuery();
  const summaryQuery = useFetchSummaryQuery();

  const tabBarHeight = TAB_BAR_BASE_HEIGHT + insets.bottom;
  const pillBottom = tabBarHeight + PILL_GAP;

  const [group, setGroup] = useState<string>(ALL_GROUPS);
  const [query, setQuery] = useState('');

  const items = useMemo(
    () => ingredientsQuery.data?.items ?? [],
    [ingredientsQuery.data],
  );
  const groupFilters = [ALL_GROUPS, ...(ingredientsQuery.data?.groups ?? [])];

  const visibleItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchesGroup = group === ALL_GROUPS || item.group === group;
      const matchesQuery =
        normalized.length === 0 || item.name.toLowerCase().includes(normalized);

      return matchesGroup && matchesQuery;
    });
  }, [group, items, query]);

  const summary = summaryQuery.data;
  const isError = ingredientsQuery.isError || summaryQuery.isError;

  const handleResetError = () => {
    void ingredientsQuery.refetch();
    void summaryQuery.refetch();
  };

  return (
    <SafeScreen
      edges={['top', 'left', 'right']}
      isError={isError}
      onResetError={handleResetError}
    >
      <View
        style={[layout.flex_1, backgrounds.surfaceSunken]}
        testID="ingredients-screen"
      >
        <ScrollView
          contentContainerStyle={[
            gutters.gap_16,
            gutters.paddingVertical_16,
            { paddingBottom: pillBottom + PILL_HEIGHT + PILL_GAP },
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
            {groupFilters.map((filter) => (
              <CategoryChip
                isActive={filter === group}
                key={filter}
                label={
                  filter === ALL_GROUPS
                    ? t('screen_ingredients.categories.all')
                    : filter
                }
                onPress={() => {
                  setGroup(filter);
                }}
                testID={`category-${filter}`}
              />
            ))}
          </ScrollView>

          <View style={[gutters.gap_16, gutters.paddingHorizontal_16]}>
            <IngredientsSummary
              expiredCount={summary?.overdue_count ?? 0}
              lowCount={summary?.low_stock_count ?? 0}
              totalCount={summary?.total_items ?? 0}
              totalValue={summary ? formatCurrency(summary.total_value) : '—'}
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
            { bottom: pillBottom },
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
