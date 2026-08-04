import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { useTheme } from '@/theme';

import { SafeScreen } from '@/components/templates';

function Transactions() {
  const { t } = useTranslation();
  const { backgrounds, fonts, layout } = useTheme();

  return (
    <SafeScreen edges={['top', 'left', 'right']}>
      <View
        style={[
          layout.flex_1,
          layout.justifyCenter,
          layout.itemsCenter,
          backgrounds.surfaceSunken,
        ]}
      >
        <Text style={[fonts.size_16, fonts.gray400]}>
          {t('screen_overview.tabs.transactions')}
        </Text>
      </View>
    </SafeScreen>
  );
}

export default Transactions;
