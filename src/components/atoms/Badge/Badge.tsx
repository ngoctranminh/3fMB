import type { ViewProps } from 'react-native';

import { Text, View } from 'react-native';

import { useTheme } from '@/theme';

type Properties = {
  readonly count: number;
} & ViewProps;

function Badge({ count, style, ...props }: Properties) {
  const { components } = useTheme();

  return (
    <View {...props} style={[components.badge, style]} testID="badge">
      <Text style={[components.badgeLabel]}>{count}</Text>
    </View>
  );
}

export default Badge;
