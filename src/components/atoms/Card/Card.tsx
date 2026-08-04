import type { PropsWithChildren } from 'react';
import type { ViewProps } from 'react-native';

import { View } from 'react-native';

import { useTheme } from '@/theme';

type Properties = PropsWithChildren<ViewProps>;

function Card({ children = undefined, style, ...props }: Properties) {
  const { components } = useTheme();

  return (
    <View {...props} style={[components.card, style]}>
      {children}
    </View>
  );
}

export default Card;
