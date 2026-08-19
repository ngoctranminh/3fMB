import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { useNetworkStatus } from '@/hooks';
import { useTheme } from '@/theme';

import { IconByVariant } from '@/components/atoms';

const ICON_SIZE = 18;

function NetworkStatusBanner() {
  const { isOffline } = useNetworkStatus();
  const { backgrounds, colors, fonts, gutters, layout } = useTheme();
  const { t } = useTranslation();

  if (!isOffline) return undefined;

  return (
    <View
      accessibilityLiveRegion="assertive"
      accessibilityRole="alert"
      style={[
        backgrounds.red500,
        layout.row,
        layout.itemsCenter,
        gutters.gap_8,
        gutters.paddingHorizontal_16,
        gutters.paddingVertical_8,
      ]}
      testID="network-status-offline"
    >
      <IconByVariant
        height={ICON_SIZE}
        path="warning-triangle"
        stroke={colors.gray50}
        width={ICON_SIZE}
      />
      <Text style={[layout.flex_1, fonts.gray50, fonts.size_12, fonts.bold]}>
        {t('network_status.offline')}
      </Text>
    </View>
  );
}

export default NetworkStatusBanner;
