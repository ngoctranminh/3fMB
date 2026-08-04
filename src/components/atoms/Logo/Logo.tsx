import type { ViewProps } from 'react-native';

import { Text, View } from 'react-native';

import { useTheme } from '@/theme';

type Properties = {
  readonly size?: number;
} & ViewProps;

const SIZE = 96;
const RADIUS_RATIO = 0.28;
const FONT_RATIO = 0.42;

function Logo({ size = SIZE, style, ...props }: Properties) {
  const { backgrounds, colors, fonts, layout } = useTheme();

  return (
    <View
      {...props}
      style={[
        layout.justifyCenter,
        layout.itemsCenter,
        backgrounds.purple100,
        {
          borderRadius: size * RADIUS_RATIO,
          height: size,
          width: size,
        },
        style,
      ]}
      testID="app-logo"
    >
      <Text
        style={[
          fonts.bold,
          {
            color: colors.purple500,
            fontSize: size * FONT_RATIO,
          },
        ]}
      >
        3F
      </Text>
    </View>
  );
}

export default Logo;
