import type { ViewProps } from 'react-native';

import { Text, View } from 'react-native';

import { useTheme } from '@/theme';

import { IconByVariant } from '@/components/atoms';

export type StatTone = 'amber' | 'blue' | 'green' | 'red';

type Properties = {
  readonly caption: string;
  readonly iconPath: string;
  readonly label: string;
  readonly tone: StatTone;
  readonly value: string;
} & ViewProps;

const ICON_SIZE = 24;

function StatTile({
  caption,
  iconPath,
  label,
  style,
  tone,
  value,
  ...props
}: Properties) {
  const { colors, components, fonts, gutters } = useTheme();

  const tones: Record<StatTone, { background: string; icon: string }> = {
    amber: { background: colors.amber50, icon: colors.amber500 },
    blue: { background: colors.blue50, icon: colors.blue500 },
    green: { background: colors.green50, icon: colors.green500 },
    red: { background: colors.red50, icon: colors.red500 },
  };

  const { background, icon } = tones[tone];

  return (
    <View
      {...props}
      style={[
        components.statTile,
        { backgroundColor: background, borderColor: background },
        style,
      ]}
    >
      <IconByVariant
        height={ICON_SIZE}
        path={iconPath}
        stroke={icon}
        width={ICON_SIZE}
      />

      <Text style={[fonts.size_12, fonts.gray400, gutters.marginTop_4]}>
        {label}
      </Text>

      <Text
        style={[
          components.statValue,
          tone === 'green' ? { color: colors.green500 } : undefined,
        ]}
      >
        {value}
      </Text>

      <Text style={[fonts.size_10, fonts.gray200]}>{caption}</Text>
    </View>
  );
}

export default StatTile;
