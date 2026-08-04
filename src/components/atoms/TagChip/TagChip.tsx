import type { ViewProps } from 'react-native';

import { Text, View } from 'react-native';

import { useTheme } from '@/theme';

type Properties = {
  readonly background: string;
  readonly label: string;
  readonly tint: string;
} & ViewProps;

function TagChip({ background, label, style, tint, ...props }: Properties) {
  const { components } = useTheme();

  return (
    <View
      {...props}
      style={[components.tagChip, { backgroundColor: background }, style]}
    >
      <Text style={[components.tagChipLabel, { color: tint }]}>{label}</Text>
    </View>
  );
}

export default TagChip;
