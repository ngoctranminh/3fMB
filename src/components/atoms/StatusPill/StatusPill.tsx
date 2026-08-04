import type { ViewProps } from 'react-native';

import { Text, View } from 'react-native';

import { useTheme } from '@/theme';

export type StatusTone = 'danger' | 'success' | 'warning';

type Properties = {
  readonly hasDot?: boolean;
  readonly label: string;
  readonly tone: StatusTone;
} & ViewProps;

const DOT_SIZE = 6;

function StatusPill({
  hasDot = false,
  label,
  style,
  tone,
  ...props
}: Properties) {
  const { colors, components, layout } = useTheme();

  const tones: Record<StatusTone, { background: string; text: string }> = {
    danger: { background: colors.red50, text: colors.red500 },
    success: { background: colors.green50, text: colors.green500 },
    warning: { background: colors.amber50, text: colors.amber500 },
  };

  const { background, text } = tones[tone];

  return (
    <View
      {...props}
      style={[
        components.statusPill,
        layout.row,
        { backgroundColor: background, gap: 4 },
        style,
      ]}
    >
      {hasDot ? (
        <View
          style={[
            {
              backgroundColor: text,
              borderRadius: DOT_SIZE / 2,
              height: DOT_SIZE,
              width: DOT_SIZE,
            },
          ]}
        />
      ) : undefined}
      <Text style={[components.statusPillLabel, { color: text }]}>{label}</Text>
    </View>
  );
}

export default StatusPill;
