import { Fragment, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

import type { InventoryItem } from '@/hooks/domain/inventory/schema';
import { useTheme } from '@/theme';

import { Card } from '@/components/atoms';
import {
  IngredientRow,
  SearchBar,
  SectionHeader,
} from '@/components/molecules';

type Properties = {
  readonly items: readonly InventoryItem[];
  readonly onSeeAll?: () => void;
  readonly onSelectItem?: (itemId: string) => void;
};

type StatusFilter = 'all' | 'expired' | 'low' | 'ok';

function InventoryCard({
  items,
  onSeeAll = undefined,
  onSelectItem = undefined,
}: Properties) {
  const { t } = useTranslation();
  const { backgrounds, colors, fonts, gutters, layout } = useTheme();

  const [query, setQuery] = useState('');
  const [sortAscending, setSortAscending] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const visibleItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    const filteredItems = items.filter((item) => {
      const matchesQuery =
        normalized.length === 0 ||
        item.fullName.toLowerCase().includes(normalized);
      const matchesStatus =
        statusFilter === 'all' || item.status === statusFilter;
      return matchesQuery && matchesStatus;
    });

    // React Native's current JS target does not expose Array#toSorted yet.
    // eslint-disable-next-line unicorn/no-array-sort
    return filteredItems.sort((left, right) => {
      const result = left.fullName.localeCompare(right.fullName, 'vi');
      return sortAscending ? result : -result;
    });
  }, [items, query, sortAscending, statusFilter]);

  const handleFilter = () => {
    const options: readonly StatusFilter[] = ['all', 'ok', 'low', 'expired'];

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
    <Card>
      <SectionHeader title={t('screen_overview.inventory.title')} />

      <SearchBar
        onChangeText={setQuery}
        onFilter={handleFilter}
        onSort={() => {
          setSortAscending((previous) => !previous);
        }}
        style={[gutters.marginTop_16]}
        value={query}
      />

      <View style={[gutters.marginTop_16, gutters.gap_12]}>
        {visibleItems.map((item, index) => (
          <Fragment key={item.id}>
            {index > 0 ? (
              <View style={[backgrounds.gray100, { height: 1 }]} />
            ) : undefined}
            <IngredientRow
              item={item}
              onPress={() => {
                onSelectItem?.(item.id);
              }}
              testID={`inventory-row-${item.id}`}
            />
          </Fragment>
        ))}
      </View>

      <TouchableOpacity
        accessibilityRole="button"
        onPress={onSeeAll}
        style={[layout.itemsCenter, gutters.marginTop_16]}
        testID="inventory-see-all"
      >
        <Text style={[fonts.size_14, { color: colors.blue500 }]}>
          {t('screen_overview.inventory.see_all')}
        </Text>
      </TouchableOpacity>
    </Card>
  );
}

export default InventoryCard;
