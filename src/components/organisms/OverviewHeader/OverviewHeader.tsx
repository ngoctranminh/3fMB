import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

import { Badge, IconByVariant } from '@/components/atoms';

type Properties = {
  readonly alertCount: number;
  readonly onBell?: () => void;
};

const ICON_SIZE = 24;

function OverviewHeader({ alertCount, onBell = undefined }: Properties) {
  const { t } = useTranslation();
  const { colors, fonts, gutters, layout } = useTheme();

  return (
    <View
      style={[
        layout.row,
        layout.itemsCenter,
        layout.justifyBetween,
        gutters.gap_16,
      ]}
    >
      <TouchableOpacity
        accessibilityRole="button"
        testID="overview-menu-button"
      >
        <IconByVariant
          height={ICON_SIZE}
          path="menu"
          stroke={colors.gray800}
          width={ICON_SIZE}
        />
      </TouchableOpacity>

      <View style={[layout.flex_1, gutters.gap_4]}>
        <Text style={[fonts.size_24, fonts.gray800, fonts.bold]}>
          {t('screen_overview.title')}
        </Text>
        <Text style={[fonts.size_12, fonts.gray200]}>
          {t('screen_overview.subtitle')}
        </Text>
      </View>

      <TouchableOpacity
        accessibilityRole="button"
        onPress={onBell}
        style={[layout.relative]}
        testID="overview-bell-button"
      >
        <IconByVariant
          height={ICON_SIZE}
          path="bell"
          stroke={colors.gray800}
          width={ICON_SIZE}
        />
        <Badge count={alertCount} />
      </TouchableOpacity>
    </View>
  );
}

export default OverviewHeader;
