import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NavigatorScreenParams } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';

import type { Paths } from '@/navigation/paths';

export type MainTabParamList = {
  [Paths.Alerts]: undefined;
  [Paths.Ingredients]: undefined;
  [Paths.More]: undefined;
  [Paths.Overview]: undefined;
  [Paths.Transactions]: undefined;
};

export type MainTabScreenProps<
  S extends keyof MainTabParamList = keyof MainTabParamList,
> = BottomTabScreenProps<MainTabParamList, S>;

export type RootScreenProps<
  S extends keyof RootStackParamList = keyof RootStackParamList,
> = StackScreenProps<RootStackParamList, S>;

export type RootStackParamList = {
  [Paths.Example]: undefined;
  [Paths.Login]: undefined;
  [Paths.MainTabs]: NavigatorScreenParams<MainTabParamList> | undefined;
  [Paths.Startup]: undefined;
};
