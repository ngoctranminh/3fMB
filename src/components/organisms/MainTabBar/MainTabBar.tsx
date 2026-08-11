import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { NavigationProp } from '@react-navigation/native';

import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Paths } from '@/navigation/paths';
import type { RootStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme';

import { Badge, IconByVariant } from '@/components/atoms';

const BAR_HEIGHT = 60;
const FAB_ICON_SIZE = 28;
const FAB_LIFT = 20;
const ICON_SIZE = 24;

// Height above the safe-area inset; screens add insets.bottom to clear the bar.
export const TAB_BAR_BASE_HEIGHT = BAR_HEIGHT + FAB_LIFT;

const FAB_ROUTE: string = Paths.Transactions;

const TAB_ICONS: Record<string, string | undefined> = {
  [Paths.Alerts]: 'bell',
  [Paths.Ingredients]: 'package',
  [Paths.More]: 'dots',
  [Paths.Overview]: 'home',
  [Paths.Transactions]: 'arrows',
};

const BADGE_COUNTS: Record<string, number | undefined> = {
  [Paths.Alerts]: 3,
};

function MainTabBar({ descriptors, navigation, state }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors, components, fonts, layout } = useTheme();

  return (
    <View
      style={[
        layout.absolute,
        layout.bottom0,
        layout.left0,
        layout.right0,
        { height: BAR_HEIGHT + FAB_LIFT + insets.bottom },
      ]}
      testID="main-tab-bar"
    >
      <View
        style={[
          components.tabBarSurface,
          layout.absolute,
          layout.bottom0,
          layout.left0,
          layout.right0,
          { height: BAR_HEIGHT + insets.bottom, paddingBottom: insets.bottom },
        ]}
      />

      <View
        style={[
          layout.row,
          layout.itemsCenter,
          layout.absolute,
          layout.bottom0,
          layout.left0,
          layout.right0,
          { height: BAR_HEIGHT + FAB_LIFT, paddingBottom: insets.bottom },
        ]}
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const isFab = route.name === FAB_ROUTE;
          const { options } = descriptors[route.key];
          const label = options.title ?? route.name;
          const badgeCount = BADGE_COUNTS[route.name];

          const onPress = () => {
            const event = navigation.emit({
              canPreventDefault: true,
              target: route.key,
              type: 'tabPress',
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          if (isFab) {
            const handleCreateDocument = () => {
              navigation
                .getParent<NavigationProp<RootStackParamList>>()
                .navigate(Paths.CreateDocument, {
                  initialSubtype: 'purchase',
                });
            };

            return (
              <View
                key={route.key}
                style={[layout.flex_1, layout.itemsCenter, layout.justifyEnd]}
              >
                <TouchableOpacity
                  accessibilityLabel={label}
                  accessibilityRole="button"
                  onPress={handleCreateDocument}
                  style={[components.tabBarFab, { marginBottom: FAB_LIFT }]}
                  testID="tab-fab"
                >
                  <IconByVariant
                    height={FAB_ICON_SIZE}
                    path="plus"
                    stroke={colors.surface}
                    width={FAB_ICON_SIZE}
                  />
                </TouchableOpacity>
                <Text style={[fonts.size_10, fonts.gray200]}>{label}</Text>
              </View>
            );
          }

          const tint = isFocused ? colors.blue500 : colors.gray200;

          return (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={{ selected: isFocused }}
              key={route.key}
              onPress={onPress}
              style={[
                layout.flex_1,
                layout.itemsCenter,
                layout.justifyEnd,
                { gap: 4 },
              ]}
              testID={`tab-${route.name}`}
            >
              <View style={[layout.relative]}>
                <IconByVariant
                  height={ICON_SIZE}
                  path={TAB_ICONS[route.name] ?? 'home'}
                  stroke={tint}
                  width={ICON_SIZE}
                />
                {badgeCount === undefined ? undefined : (
                  <Badge count={badgeCount} />
                )}
              </View>
              <Text style={[fonts.size_10, { color: tint }]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default MainTabBar;
