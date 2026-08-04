import { Fragment, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

import { Card } from '@/components/atoms';
import {
  IngredientRow,
  SearchBar,
  SectionHeader,
} from '@/components/molecules';
import type { InventoryItem } from '@/screens/Overview/mockData';

type Properties = {
  readonly items: readonly InventoryItem[];
  readonly onSeeAll?: () => void;
};

function InventoryCard({ items, onSeeAll = undefined }: Properties) {
  const { t } = useTranslation();
  const { backgrounds, colors, fonts, gutters, layout } = useTheme();

  const [query, setQuery] = useState('');

  const visibleItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (normalized.length === 0) {
      return items;
    }

    return items.filter((item) => item.name.toLowerCase().includes(normalized));
  }, [items, query]);

  return (
    <Card>
      <SectionHeader title={t('screen_overview.inventory.title')} />

      <SearchBar
        onChangeText={setQuery}
        style={[gutters.marginTop_16]}
        value={query}
      />

      <View style={[gutters.marginTop_16, gutters.gap_12]}>
        {visibleItems.map((item, index) => (
          <Fragment key={item.id}>
            {index > 0 ? (
              <View style={[backgrounds.gray100, { height: 1 }]} />
            ) : undefined}
            <IngredientRow item={item} />
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
