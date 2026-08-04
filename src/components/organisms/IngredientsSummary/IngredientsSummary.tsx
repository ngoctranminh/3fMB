import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { useTheme } from '@/theme';

type Properties = {
  readonly expiredCount: number;
  readonly lowCount: number;
  readonly totalCount: number;
  readonly totalValue: string;
};

function IngredientsSummary({
  expiredCount,
  lowCount,
  totalCount,
  totalValue,
}: Properties) {
  const { t } = useTranslation();
  const { backgrounds, colors, components, fonts, gutters, layout } =
    useTheme();

  const entries = [
    {
      caption: t('screen_ingredients.summary.total_unit'),
      color: colors.blue500,
      id: 'total',
      label: t('screen_ingredients.summary.total_label'),
      value: String(totalCount),
    },
    {
      caption: t('screen_ingredients.summary.value_unit'),
      color: colors.green500,
      id: 'value',
      label: t('screen_ingredients.summary.value_label'),
      value: totalValue,
    },
    {
      caption: t('screen_ingredients.summary.low_unit'),
      color: colors.amber500,
      id: 'low',
      label: t('screen_ingredients.summary.low_label'),
      value: String(lowCount),
    },
    {
      caption: t('screen_ingredients.summary.expired_unit'),
      color: colors.red500,
      id: 'expired',
      label: t('screen_ingredients.summary.expired_label'),
      value: String(expiredCount),
    },
  ];

  return (
    <View style={[components.summaryStrip]} testID="ingredients-summary">
      {entries.map((entry, index) => (
        <Fragment key={entry.id}>
          {index > 0 ? (
            <View style={[backgrounds.gray100, { width: 1 }]} />
          ) : undefined}
          <View
            style={[
              layout.flex_1,
              gutters.gap_4,
              gutters.paddingHorizontal_12,
            ]}
          >
            <Text style={[fonts.size_12, fonts.gray400]}>{entry.label}</Text>
            <Text style={[components.summaryValue, { color: entry.color }]}>
              {entry.value}
            </Text>
            <Text style={[fonts.size_10, fonts.gray200]}>{entry.caption}</Text>
          </View>
        </Fragment>
      ))}
    </View>
  );
}

export default IngredientsSummary;
