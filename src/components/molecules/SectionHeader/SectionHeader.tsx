import type { ViewProps } from 'react-native';

import { Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

type Properties = {
  readonly actionLabel?: string;
  readonly onAction?: () => void;
  readonly title: string;
} & ViewProps;

function SectionHeader({
  actionLabel = undefined,
  onAction = undefined,
  style,
  title,
  ...props
}: Properties) {
  const { colors, components, fonts, layout } = useTheme();

  return (
    <View
      {...props}
      style={[layout.row, layout.itemsCenter, layout.justifyBetween, style]}
    >
      <Text style={[components.cardTitle]}>{title}</Text>

      {actionLabel ? (
        <TouchableOpacity accessibilityRole="button" onPress={onAction}>
          <Text style={[fonts.size_14, { color: colors.blue500 }]}>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      ) : undefined}
    </View>
  );
}

export default SectionHeader;
