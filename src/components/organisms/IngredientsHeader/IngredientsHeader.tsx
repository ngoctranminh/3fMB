import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

import { IconByVariant } from '@/components/atoms';

type Properties = {
  readonly onBack?: () => void;
  readonly onFilter?: () => void;
  readonly onMenu?: () => void;
  readonly onSearch?: () => void;
};

const ICON_SIZE = 24;

function IngredientsHeader({
  onBack = undefined,
  onFilter = undefined,
  onMenu = undefined,
  onSearch = undefined,
}: Properties) {
  const { t } = useTranslation();
  const { colors, fonts, gutters, layout } = useTheme();

  const actions = [
    {
      handlePress: onSearch,
      iconPath: 'magnifier',
      testID: 'ingredients-search',
    },
    { handlePress: onFilter, iconPath: 'filter', testID: 'ingredients-filter' },
    {
      handlePress: onMenu,
      iconPath: 'dots-vertical',
      testID: 'ingredients-menu',
    },
  ] as const;

  return (
    <View style={[layout.row, layout.itemsCenter, gutters.gap_12]}>
      <TouchableOpacity
        accessibilityRole="button"
        onPress={onBack}
        testID="ingredients-back"
      >
        <IconByVariant
          height={ICON_SIZE}
          path="chevron-left"
          stroke={colors.gray800}
          width={ICON_SIZE}
        />
      </TouchableOpacity>

      <View style={[layout.flex_1, gutters.gap_4]}>
        <Text style={[fonts.size_24, fonts.gray800, fonts.bold]}>
          {t('screen_ingredients.title')}
        </Text>
        <Text style={[fonts.size_12, fonts.gray200]}>
          {t('screen_ingredients.subtitle')}
        </Text>
      </View>

      {actions.map((action) => (
        <TouchableOpacity
          accessibilityRole="button"
          key={action.iconPath}
          onPress={action.handlePress}
          testID={action.testID}
        >
          <IconByVariant
            height={ICON_SIZE}
            path={action.iconPath}
            stroke={colors.gray800}
            width={ICON_SIZE}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default IngredientsHeader;
