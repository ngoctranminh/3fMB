import type { PropsWithChildren } from 'react';
import type { ViewProps } from 'react-native';

import { View } from 'react-native';

import { useTheme } from '@/theme';

type Properties = PropsWithChildren<ViewProps>;

function FixedScreenHeader({
  children = undefined,
  style,
  ...props
}: Properties) {
  const { backgrounds, colors, gutters } = useTheme();

  return (
    <View
      {...props}
      style={[
        backgrounds.surfaceSunken,
        gutters.paddingHorizontal_16,
        gutters.paddingVertical_12,
        {
          borderBottomColor: colors.gray100,
          borderBottomWidth: 1,
          zIndex: 10,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export default FixedScreenHeader;
