import type { ViewProps } from 'react-native';

import { Image, View } from 'react-native';

import { useTheme } from '@/theme';
import logo from '@/theme/assets/images/logo.png';

type Properties = {
  readonly size?: number;
} & ViewProps;

const SIZE = 96;
const RADIUS_RATIO = 0.22;

function Logo({ size = SIZE, style, ...props }: Properties) {
  const { layout } = useTheme();

  return (
    <View
      {...props}
      style={[
        layout.justifyCenter,
        layout.itemsCenter,
        {
          backgroundColor: '#000000',
          borderRadius: size * RADIUS_RATIO,
          height: size,
          overflow: 'hidden',
          width: size,
        },
        style,
      ]}
      testID="app-logo"
    >
      <Image
        accessibilityIgnoresInvertColors
        resizeMode="cover"
        source={logo}
        style={{ height: size, width: size }}
      />
    </View>
  );
}

export default Logo;
