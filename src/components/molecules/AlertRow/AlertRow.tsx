import type { ViewProps } from 'react-native';

import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { useTheme } from '@/theme';

import { IconByVariant } from '@/components/atoms';

type Properties = {
  readonly date: string;
  readonly quantity: string;
  readonly severity: 'expired' | 'low' | 'out';
  readonly title: string;
} & ViewProps;

const ICON_SIZE = 20;

function AlertRow({
  date,
  quantity,
  severity,
  style,
  title,
  ...props
}: Properties) {
  const { t } = useTranslation();
  const { colors, fonts, gutters, layout } = useTheme();

  const isLow = severity === 'low';
  const isOut = severity === 'out';

  return (
    <View
      {...props}
      style={[layout.row, layout.itemsCenter, gutters.gap_12, style]}
    >
      <IconByVariant
        height={ICON_SIZE}
        path={
          isLow ? 'warning-triangle' : isOut ? 'x-circle' : 'warning-circle'
        }
        stroke={isLow ? colors.amber500 : colors.red500}
        width={ICON_SIZE}
      />

      <View style={[layout.flex_1, gutters.gap_4]}>
        <Text style={[fonts.size_14, fonts.gray800]}>{title}</Text>
        <Text style={[fonts.size_12, isLow ? fonts.amber500 : fonts.red500]}>
          {isOut
            ? t('screen_overview.alerts.out_stock')
            : isLow
              ? t('screen_overview.alerts.low_stock', { quantity })
              : t('screen_overview.alerts.expired_on', { date: quantity })}
        </Text>
      </View>

      <Text style={[fonts.size_12, fonts.gray200]}>{date}</Text>
    </View>
  );
}

export default AlertRow;
