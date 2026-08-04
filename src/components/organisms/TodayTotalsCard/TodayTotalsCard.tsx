import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { useTheme } from '@/theme';

type Properties = {
  readonly exportCount: number;
  readonly exportValue: string;
  readonly importCount: number;
  readonly importValue: string;
};

function TodayTotalsCard({
  exportCount,
  exportValue,
  importCount,
  importValue,
}: Properties) {
  const { t } = useTranslation();
  const { backgrounds, colors, components, fonts, gutters, layout } =
    useTheme();

  const entries = [
    {
      caption: t('screen_transactions.today.receipt_count', {
        count: importCount,
      }),
      color: colors.blue500,
      id: 'import',
      label: t('screen_transactions.today.import_label'),
      value: importValue,
    },
    {
      caption: t('screen_transactions.today.receipt_count', {
        count: exportCount,
      }),
      color: colors.amber500,
      id: 'export',
      label: t('screen_transactions.today.export_label'),
      value: exportValue,
    },
  ];

  return (
    <View
      style={[components.card, gutters.gap_12]}
      testID="transactions-today-totals"
    >
      <Text style={[fonts.size_14, fonts.gray800, fonts.bold]}>
        {t('screen_transactions.today.title')}
      </Text>

      <View style={[layout.row]}>
        {entries.map((entry, index) => (
          <View key={entry.id} style={[layout.row, layout.flex_1]}>
            {index > 0 ? (
              <View style={[backgrounds.gray100, { width: 1 }]} />
            ) : undefined}
            <View
              style={[
                layout.flex_1,
                layout.itemsCenter,
                gutters.gap_4,
                gutters.paddingHorizontal_12,
              ]}
            >
              <Text style={[fonts.size_12, fonts.gray400]}>{entry.label}</Text>
              <Text
                style={[components.summaryValueLarge, { color: entry.color }]}
              >
                {entry.value}
              </Text>
              <Text style={[fonts.size_10, fonts.gray200]}>
                {entry.caption}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export default TodayTotalsCard;
