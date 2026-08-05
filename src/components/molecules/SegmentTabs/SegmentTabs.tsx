import type { ViewProps } from 'react-native';

import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

export type SegmentOption = {
  readonly count?: number;
  readonly countColor?: string;
  readonly id: string;
  readonly label: string;
};

type Properties = {
  readonly activeId: string;
  readonly isScrollable?: boolean;
  readonly onSelect: (id: string) => void;
  readonly options: readonly SegmentOption[];
} & ViewProps;

const ON_COUNT = '#FFFFFF';
const SCROLLABLE_TAB_GAP = 20;

function SegmentTabs({
  activeId,
  isScrollable = false,
  onSelect,
  options,
  style,
  ...props
}: Properties) {
  const { backgrounds, colors, components, fonts, gutters, layout } =
    useTheme();

  const tabs = options.map((option) => {
    const isActive = option.id === activeId;

    return (
      <TouchableOpacity
        accessibilityRole="tab"
        accessibilityState={{ selected: isActive }}
        key={option.id}
        onPress={() => {
          onSelect(option.id);
        }}
        style={[
          components.segmentTab,
          isScrollable ? layout.itemsStart : undefined,
        ]}
        testID={`segment-${option.id}`}
      >
        <View style={[layout.row, layout.itemsCenter, gutters.gap_8]}>
          <Text
            style={[
              fonts.size_14,
              isActive ? fonts.bold : undefined,
              { color: isActive ? colors.blue500 : colors.gray200 },
            ]}
          >
            {option.label}
          </Text>

          {option.count === undefined ? undefined : (
            <View
              style={[
                components.tabCountBadge,
                { backgroundColor: option.countColor ?? colors.blue500 },
              ]}
            >
              <Text style={[components.tabCountLabel, { color: ON_COUNT }]}>
                {option.count}
              </Text>
            </View>
          )}
        </View>

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
  });

  if (isScrollable) {
    return (
      <ScrollView
        contentContainerStyle={[{ gap: SCROLLABLE_TAB_GAP }]}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={style}
      >
        {tabs}
      </ScrollView>
    );
  }

  return (
    <View {...props} style={[layout.row, style]}>
      {tabs}
    </View>
  );
}

export default SegmentTabs;
