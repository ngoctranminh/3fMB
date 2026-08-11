import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';

import type { Paths } from '@/navigation/paths';

export type MainTabParamList = {
  [Paths.Alerts]: undefined;
  [Paths.Ingredients]: undefined;
  [Paths.More]: undefined;
  [Paths.Overview]: undefined;
  [Paths.Transactions]: undefined;
};

// Tab screens phải điều hướng sang stack cha (ItemDetail, ReceiptDetail)
export type MainTabScreenProps<
  S extends keyof MainTabParamList = keyof MainTabParamList,
> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, S>,
  StackScreenProps<RootStackParamList>
>;

export type RootScreenProps<
  S extends keyof RootStackParamList = keyof RootStackParamList,
> = StackScreenProps<RootStackParamList, S>;

export type RootStackParamList = {
  [Paths.Example]: undefined;
  [Paths.ItemDetail]: { readonly itemId: string };
  [Paths.Login]: undefined;
  [Paths.MainTabs]: NavigatorScreenParams<MainTabParamList> | undefined;
  [Paths.ReceiptDetail]: { readonly documentId: string };
  [Paths.Startup]: undefined;
};
