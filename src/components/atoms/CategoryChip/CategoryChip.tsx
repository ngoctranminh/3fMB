import type { TouchableOpacityProps } from 'react-native';

import { Text, TouchableOpacity } from 'react-native';

import { useTheme } from '@/theme';

type Properties = {
  readonly isActive: boolean;
  readonly label: string;
} & TouchableOpacityProps;

function CategoryChip({ isActive, label, style, ...props }: Properties) {
  const { components } = useTheme();

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      {...props}
      style={[
        components.categoryChip,
        isActive ? components.categoryChipActive : undefined,
        style,
      ]}
    >
      <Text
        style={[
          components.categoryChipLabel,
          isActive ? components.categoryChipLabelActive : undefined,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default CategoryChip;
