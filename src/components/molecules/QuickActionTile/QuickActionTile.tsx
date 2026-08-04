import type { TouchableOpacityProps } from 'react-native';

import { Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

import { IconByVariant } from '@/components/atoms';

export type QuickActionTone = 'amber' | 'blue' | 'green' | 'purple';

type Properties = {
  readonly caption: string;
  readonly iconPath: string;
  readonly label: string;
  readonly tone: QuickActionTone;
} & TouchableOpacityProps;

const ICON_SIZE = 20;

function QuickActionTile({
  caption,
  iconPath,
  label,
  style,
  tone,
  ...props
}: Properties) {
  const { colors, components, fonts } = useTheme();

  const tones: Record<QuickActionTone, { background: string; icon: string }> = {
    amber: { background: colors.amber50, icon: colors.amber500 },
    blue: { background: colors.blue50, icon: colors.blue500 },
    green: { background: colors.green50, icon: colors.green500 },
    purple: { background: colors.purple100, icon: colors.purple500 },
  };

  const { background, icon } = tones[tone];

  return (
    <TouchableOpacity
      accessibilityRole="button"
      {...props}
      style={[components.quickAction, style]}
    >
      <View
        style={[components.quickActionIcon, { backgroundColor: background }]}
      >
        <IconByVariant
          height={ICON_SIZE}
          path={iconPath}
          stroke={icon}
          width={ICON_SIZE}
        />
      </View>

      <Text style={[fonts.size_12, fonts.gray800, fonts.bold]}>{label}</Text>
      <Text style={[fonts.size_10, fonts.gray200]}>{caption}</Text>
    </TouchableOpacity>
  );
}

export default QuickActionTile;
