import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';

import { Paths } from '@/navigation/paths';
import type { MainTabParamList } from '@/navigation/types';

import { MainTabBar } from '@/components/organisms';
import { Alerts, Ingredients, More, Overview, Transactions } from '@/screens';

const Tab = createBottomTabNavigator<MainTabParamList>();

const renderTabBar = (props: BottomTabBarProps) => <MainTabBar {...props} />;

function MainTabs() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={renderTabBar}>
      <Tab.Screen
        component={Overview}
        name={Paths.Overview}
        options={{ title: t('screen_overview.tabs.overview') }}
      />
      <Tab.Screen
        component={Ingredients}
        name={Paths.Ingredients}
        options={{ title: t('screen_overview.tabs.ingredients') }}
      />
      <Tab.Screen
        component={Transactions}
        name={Paths.Transactions}
        options={{ title: t('screen_overview.tabs.transactions') }}
      />
      <Tab.Screen
        component={Alerts}
        name={Paths.Alerts}
        options={{ title: t('screen_overview.tabs.alerts') }}
      />
      <Tab.Screen
        component={More}
        name={Paths.More}
        options={{ title: t('screen_overview.tabs.more') }}
      />
    </Tab.Navigator>
  );
}

export default MainTabs;
