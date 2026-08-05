import type { LayoutChangeEvent } from 'react-native';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts/dist/LineChart';

import type { ChartPoint } from '@/hooks/domain/inventory/schema';
import { useTheme } from '@/theme';

import { Card, IconByVariant } from '@/components/atoms';

type Properties = {
  readonly points: readonly ChartPoint[];
};

const AXIS_FONT_SIZE = 10;
const CHART_HEIGHT = 180;
const CHEVRON_SIZE = 16;
const DATA_POINT_RADIUS = 4;
const END_OPACITY = 0.02;
const LINE_THICKNESS = 2;
const MAX_VALUE = 50_000_000;
const SECTIONS = 5;
const SPACING = 12;
const START_OPACITY = 0.25;
const STEP_VALUE = 10_000_000;
const Y_AXIS_LABELS = ['0', '10M', '20M', '30M', '40M', '50M'];
const Y_AXIS_LABEL_WIDTH = 34;

function StockValueChart({ points }: Properties) {
  const { t } = useTranslation();
  const { colors, components, fonts, gutters, layout } = useTheme();

  const [chartWidth, setChartWidth] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    setChartWidth(event.nativeEvent.layout.width);
  };

  const data = points.map((point) => ({
    label: point.label,
    value: point.value,
  }));

  return (
    <Card>
      <View
        style={[layout.row, layout.itemsCenter, layout.justifyBetween]}
        testID="chart-header"
      >
        <Text style={[components.cardTitle]}>
          {t('screen_overview.chart.title')}
        </Text>

        <TouchableOpacity
          accessibilityRole="button"
          style={[components.searchInputWrapper, gutters.paddingHorizontal_12]}
          testID="chart-range-picker"
        >
          <Text style={[fonts.size_12, fonts.gray400]}>
            {t('screen_overview.chart.range_7d')}
          </Text>
          <IconByVariant
            height={CHEVRON_SIZE}
            path="chevron-down"
            stroke={colors.gray400}
            width={CHEVRON_SIZE}
          />
        </TouchableOpacity>
      </View>

      <View
        onLayout={handleLayout}
        style={[gutters.marginTop_16]}
        testID="chart-body"
      >
        {chartWidth > 0 ? (
          <LineChart
            adjustToWidth
            areaChart
            color={colors.blue500}
            curved
            data={data}
            dataPointsColor={colors.blue500}
            dataPointsRadius={DATA_POINT_RADIUS}
            endFillColor={colors.blue500}
            endOpacity={END_OPACITY}
            endSpacing={SPACING}
            height={CHART_HEIGHT}
            initialSpacing={SPACING}
            maxValue={MAX_VALUE}
            noOfSections={SECTIONS}
            rulesColor={colors.gray100}
            rulesType="solid"
            startFillColor={colors.blue500}
            startOpacity={START_OPACITY}
            stepValue={STEP_VALUE}
            thickness={LINE_THICKNESS}
            width={chartWidth - Y_AXIS_LABEL_WIDTH}
            xAxisColor={colors.gray100}
            xAxisLabelTextStyle={{
              color: colors.gray200,
              fontSize: AXIS_FONT_SIZE,
            }}
            yAxisColor="transparent"
            yAxisLabelTexts={Y_AXIS_LABELS}
            yAxisLabelWidth={Y_AXIS_LABEL_WIDTH}
            yAxisTextStyle={{
              color: colors.gray200,
              fontSize: AXIS_FONT_SIZE,
            }}
          />
        ) : undefined}
      </View>
    </Card>
  );
}

export default StockValueChart;
