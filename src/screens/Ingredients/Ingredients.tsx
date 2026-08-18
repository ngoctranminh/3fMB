import { Fragment, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useInventory } from '@/hooks';
import { formatCurrency } from '@/hooks/domain/inventory/adapters';
import { Paths } from '@/navigation/paths';
import type { MainTabScreenProps } from '@/navigation/types';
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

type StatusFilter = 'all' | 'expired' | 'low' | 'ok' | 'out';

function Ingredients({ navigation }: MainTabScreenProps<Paths.Ingredients>) {
  const { i18n, t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { backgrounds, components, gutters, layout } = useTheme();
  const { useFetchIngredientsQuery, useFetchSummaryQuery } = useInventory();

  const ingredientsQuery = useFetchIngredientsQuery();
  const summaryQuery = useFetchSummaryQuery();

  const tabBarHeight = TAB_BAR_BASE_HEIGHT + insets.bottom;
  const pillBottom = tabBarHeight + PILL_GAP;

  const [group, setGroup] = useState<string>(ALL_GROUPS);
  const [query, setQuery] = useState('');
  const [sortAscending, setSortAscending] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const searchInputReference = useRef<TextInput>(null);

  const items = useMemo(
    () => ingredientsQuery.data?.items ?? [],
    [ingredientsQuery.data],
  );
  const groupFilters = [ALL_GROUPS, ...(ingredientsQuery.data?.groups ?? [])];

  const visibleItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    const filteredItems = items.filter((item) => {
      const matchesGroup = group === ALL_GROUPS || item.group === group;
      const matchesStatus =
        statusFilter === 'all' || item.status === statusFilter;
      const matchesQuery =
        normalized.length === 0 ||
        item.fullName.toLowerCase().includes(normalized);

      return matchesGroup && matchesStatus && matchesQuery;
    });

    // React Native's current JS target does not expose Array#toSorted yet.
    // eslint-disable-next-line unicorn/no-array-sort
    return filteredItems.sort((left, right) => {
      const result = left.fullName.localeCompare(
        right.fullName,
        i18n.resolvedLanguage ?? i18n.language,
      );
      return sortAscending ? result : -result;
    });
  }, [
    group,
    i18n.language,
    i18n.resolvedLanguage,
    items,
    query,
    sortAscending,
    statusFilter,
  ]);

  const summary = summaryQuery.data;
  const isError = ingredientsQuery.isError || summaryQuery.isError;

  const handleResetError = () => {
    void ingredientsQuery.refetch();
    void summaryQuery.refetch();
  };

  const handleFilter = () => {
    const options: readonly StatusFilter[] = [
      'all',
      'ok',
      'low',
      'out',
      'expired',
    ];

    Alert.alert(
      t('screen_ingredients.filter_title'),
      undefined,
      options.map((option) => ({
        onPress: () => {
          setStatusFilter(option);
        },
        text: t(`screen_ingredients.filters.${option}`),
      })),
    );
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
            <IngredientsHeader
              onBack={() => {
                navigation.navigate(Paths.Overview);
              }}
              onFilter={handleFilter}
              onMenu={() => {
                navigation.navigate(Paths.More);
              }}
              onSearch={() => {
                searchInputReference.current?.focus();
              }}
            />
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
              lowCount={items.filter((item) => item.status === 'low').length}
              totalCount={summary?.total_items ?? 0}
              totalValue={summary ? formatCurrency(summary.total_value) : '—'}
            />

            <Card>
              <SearchBar
                inputRef={searchInputReference}
                onChangeText={setQuery}
                onFilter={handleFilter}
                onSort={() => {
                  setSortAscending((previous) => !previous);
                }}
                value={query}
              />

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
                      <IngredientDetailRow
                        item={item}
                        onPress={() => {
                          navigation.navigate(Paths.ItemDetail, {
                            itemId: item.id,
                          });
                        }}
                        testID={`ingredient-row-${item.id}`}
                      />
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
            onPress={() => {
              navigation.navigate(Paths.AddIngredient);
            }}
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
