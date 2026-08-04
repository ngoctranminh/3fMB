import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { useTheme } from '@/theme';

import { StatTile } from '@/components/molecules';
import {
  AlertsCard,
  InventoryCard,
  OverviewHeader,
  StockValueChart,
} from '@/components/organisms';
import { SafeScreen } from '@/components/templates';

import { ALERTS, INVENTORY, STOCK_VALUE_POINTS } from './mockData';

const ALERT_COUNT = 3;
const BOTTOM_PADDING = 120;

function Overview() {
  const { t } = useTranslation();
  const { backgrounds, gutters, layout } = useTheme();

  const stats = [
    {
      caption: t('screen_overview.stats.total_unit'),
      iconPath: 'box',
      label: t('screen_overview.stats.total_label'),
      tone: 'blue',
      value: '128',
    },
    {
      caption: t('screen_overview.stats.value_unit'),
      iconPath: 'clipboard-check',
      label: t('screen_overview.stats.value_label'),
      tone: 'green',
      value: '45.250.000đ',
    },
    {
      caption: t('screen_overview.stats.low_unit'),
      iconPath: 'warning-triangle',
      label: t('screen_overview.stats.low_label'),
      tone: 'amber',
      value: '12',
    },
    {
      caption: t('screen_overview.stats.expired_unit'),
      iconPath: 'calendar',
      label: t('screen_overview.stats.expired_label'),
      tone: 'red',
      value: '5',
    },
  ] as const;

  return (
    <SafeScreen edges={['top', 'left', 'right']}>
      <View
        style={[layout.flex_1, backgrounds.surfaceSunken]}
        testID="overview-screen"
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
            <OverviewHeader alertCount={ALERT_COUNT} />
          </View>

          <ScrollView
            contentContainerStyle={[
              gutters.gap_12,
              gutters.paddingHorizontal_16,
            ]}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {stats.map((stat) => (
              <StatTile
                caption={stat.caption}
                iconPath={stat.iconPath}
                key={stat.iconPath}
                label={stat.label}
                tone={stat.tone}
                value={stat.value}
              />
            ))}
          </ScrollView>

          <View style={[gutters.gap_16, gutters.paddingHorizontal_16]}>
            <StockValueChart points={STOCK_VALUE_POINTS} />
            <AlertsCard alerts={ALERTS} />
            <InventoryCard items={INVENTORY} />
          </View>
        </ScrollView>
      </View>
    </SafeScreen>
  );
}

export default Overview;
