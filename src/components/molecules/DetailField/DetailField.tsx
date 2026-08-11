import type { ViewProps } from 'react-native';

import { Text, View } from 'react-native';

import { useTheme } from '@/theme';

type Properties = {
  readonly label: string;
  readonly value: string;
} & ViewProps;

function DetailField({ label, style, value, ...props }: Properties) {
  const { fonts, gutters, layout } = useTheme();

  return (
    <View
      {...props}
      style={[
        layout.row,
        layout.itemsCenter,
        layout.justifyBetween,
        gutters.gap_12,
        gutters.paddingVertical_8,
        style,
      ]}
    >
      <Text style={[fonts.size_12, fonts.gray200]}>{label}</Text>
      <Text
        style={[
          layout.flex_1,
          fonts.size_14,
          fonts.gray800,
          { textAlign: 'right' },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

export default DetailField;
