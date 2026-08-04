import type { ViewProps } from 'react-native';

import { Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

export type SegmentOption = {
  readonly id: string;
  readonly label: string;
};

type Properties = {
  readonly activeId: string;
  readonly onSelect: (id: string) => void;
  readonly options: readonly SegmentOption[];
} & ViewProps;

function SegmentTabs({
  activeId,
  onSelect,
  options,
  style,
  ...props
}: Properties) {
  const { backgrounds, colors, components, fonts, layout } = useTheme();

  return (
    <View {...props} style={[layout.row, style]}>
      {options.map((option) => {
        const isActive = option.id === activeId;

        return (
          <TouchableOpacity
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            key={option.id}
            onPress={() => {
              onSelect(option.id);
            }}
            style={[components.segmentTab]}
            testID={`segment-${option.id}`}
          >
            <Text
              style={[
                fonts.size_14,
                isActive ? fonts.bold : undefined,
                { color: isActive ? colors.blue500 : colors.gray200 },
              ]}
            >
              {option.label}
            </Text>
            <View
              style={[
                components.segmentTabIndicator,
                isActive
                  ? { backgroundColor: colors.blue500 }
                  : backgrounds.gray100,
              ]}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default SegmentTabs;
