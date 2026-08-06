import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { useTheme } from '@/theme';

import { IconByVariant } from '@/components/atoms';

type Properties = {
  readonly expiringCount: number;
  readonly lowCount: number;
  readonly outCount: number;
};

const ICON_SIZE = 22;
const TILE_SIZE = 44;

function AlertsSummary({ expiringCount, lowCount, outCount }: Properties) {
  const { t } = useTranslation();
  const { backgrounds, colors, components, fonts, gutters, layout } =
    useTheme();

  const entries = [
    {
      background: colors.amber50,
      iconPath: 'warning-triangle',
      id: 'low',
      label: t('screen_alerts.summary.low_label'),
      tint: colors.amber500,
      value: lowCount,
    },
    {
      background: colors.red50,
      iconPath: 'x-circle',
      id: 'out',
      label: t('screen_alerts.summary.out_label'),
      tint: colors.red500,
      value: outCount,
    },
    {
      background: colors.blue50,
      iconPath: 'calendar',
      id: 'expiring',
      label: t('screen_alerts.summary.expiring_label'),
      tint: colors.blue500,
      value: expiringCount,
    },
  ];

  return (
    <View style={[components.summaryStrip]} testID="alerts-summary">
      {entries.map((entry, index) => (
        <Fragment key={entry.id}>
          {index > 0 ? (
            <View style={[backgrounds.gray100, { width: 1 }]} />
          ) : undefined}
          <View
            style={[
              layout.flex_1,
              layout.itemsCenter,
              gutters.gap_4,
              gutters.paddingHorizontal_8,
            ]}
          >
            <View
              style={[
                components.severityTile,
                {
                  backgroundColor: entry.background,
                  borderColor: entry.background,
                  borderRadius: TILE_SIZE / 2,
                },
              ]}
            >
              <IconByVariant
                height={ICON_SIZE}
                path={entry.iconPath}
                stroke={entry.tint}
                width={ICON_SIZE}
              />
            </View>

            <Text
              numberOfLines={1}
              style={[fonts.size_12, fonts.gray400, gutters.marginTop_4]}
            >
              {entry.label}
            </Text>
            <Text style={[components.summaryValue, { color: entry.tint }]}>
              {entry.value}
            </Text>
            <Text style={[fonts.size_10, fonts.gray200]}>
              {t('screen_alerts.summary.unit')}
            </Text>
          </View>
        </Fragment>
      ))}
    </View>
  );
}

export default AlertsSummary;
