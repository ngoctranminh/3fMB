import type { Ref } from 'react';
import type { ViewProps } from 'react-native';
import type { TextInput as TextInputType } from 'react-native';

import { useTranslation } from 'react-i18next';
import { TextInput, View } from 'react-native';

import { useTheme } from '@/theme';

import { IconButton, IconByVariant } from '@/components/atoms';

type Properties = {
  readonly inputRef?: Ref<TextInputType>;
  readonly onChangeText: (value: string) => void;
  readonly onFilter?: () => void;
  readonly onSort?: () => void;
  readonly value: string;
} & ViewProps;

const ICON_SIZE = 18;

function SearchBar({
  inputRef: inputReference = undefined,
  onChangeText,
  onFilter = undefined,
  onSort = undefined,
  style,
  value,
  ...props
}: Properties) {
  const { t } = useTranslation();
  const { colors, components, gutters, layout } = useTheme();

  return (
    <View
      {...props}
      style={[layout.row, layout.itemsCenter, gutters.gap_8, style]}
    >
      <View style={[components.searchInputWrapper, layout.flex_1]}>
        <IconByVariant
          height={ICON_SIZE}
          path="magnifier"
          stroke={colors.gray200}
          width={ICON_SIZE}
        />
        <TextInput
          onChangeText={onChangeText}
          placeholder={t('screen_overview.inventory.search_placeholder')}
          placeholderTextColor={colors.inputPlaceholder}
          ref={inputReference}
          style={[components.searchInput]}
          testID="inventory-search-input"
          value={value}
        />
      </View>

      <IconButton
        iconPath="filter"
        onPress={onFilter}
        testID="inventory-filter-button"
      />
      <IconButton
        iconPath="sort"
        onPress={onSort}
        testID="inventory-sort-button"
      />
    </View>
  );
}

export default SearchBar;
