import type { ViewProps } from 'react-native';

import { Text, View } from 'react-native';

import { useTheme } from '@/theme';

export type StatusTone = 'danger' | 'success' | 'warning';

type Properties = {
  readonly label: string;
  readonly tone: StatusTone;
} & ViewProps;

function StatusPill({ label, style, tone, ...props }: Properties) {
  const { colors, components } = useTheme();

  const tones: Record<StatusTone, { background: string; text: string }> = {
    danger: { background: colors.red50, text: colors.red500 },
    success: { background: colors.green50, text: colors.green500 },
    warning: { background: colors.amber50, text: colors.amber500 },
  };

  const { background, text } = tones[tone];

  return (
    <View
      {...props}
      style={[components.statusPill, { backgroundColor: background }, style]}
    >
      <Text style={[components.statusPillLabel, { color: text }]}>{label}</Text>
    </View>
  );
}

export default StatusPill;
