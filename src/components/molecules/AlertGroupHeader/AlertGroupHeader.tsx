import type { TouchableOpacityProps } from 'react-native';

import { Text, TouchableOpacity } from 'react-native';

import { useTheme } from '@/theme';

import { IconByVariant } from '@/components/atoms';

type Properties = {
  readonly count: number;
  readonly isExpanded: boolean;
  readonly title: string;
} & TouchableOpacityProps;

const CHEVRON_SIZE = 20;

function AlertGroupHeader({
  count,
  isExpanded,
  style,
  title,
  ...props
}: Properties) {
  const { colors, fonts, gutters, layout } = useTheme();

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ expanded: isExpanded }}
      {...props}
      style={[
        layout.row,
        layout.itemsCenter,
        gutters.gap_8,
        gutters.paddingVertical_12,
        style,
      ]}
    >
      <Text style={[fonts.size_14, fonts.gray800, fonts.bold]}>{title}</Text>
      <Text style={[layout.flex_1, fonts.size_12, fonts.gray200]}>
        ({count})
      </Text>

      <IconByVariant
        height={CHEVRON_SIZE}
        path={isExpanded ? 'chevron-down' : 'chevron-right'}
        stroke={colors.gray200}
        width={CHEVRON_SIZE}
      />
    </TouchableOpacity>
  );
}

export default AlertGroupHeader;
