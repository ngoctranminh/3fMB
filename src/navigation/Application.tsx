import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import MainTabs from '@/navigation/MainTabs';
import { Paths } from '@/navigation/paths';
import type { RootStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme';

import {
  AddIngredient,
  CreateDocument,
  Example,
  ItemDetail,
  Login,
  ReceiptDetail,
  Startup,
} from '@/screens';

const Stack = createStackNavigator<RootStackParamList>();

function ApplicationNavigator() {
  const { navigationTheme, variant } = useTheme();

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator key={variant} screenOptions={{ headerShown: false }}>
          <Stack.Screen component={Startup} name={Paths.Startup} />
          <Stack.Screen component={Login} name={Paths.Login} />
          <Stack.Screen component={MainTabs} name={Paths.MainTabs} />
          <Stack.Screen component={AddIngredient} name={Paths.AddIngredient} />
          <Stack.Screen
            component={CreateDocument}
            name={Paths.CreateDocument}
          />
          <Stack.Screen component={Example} name={Paths.Example} />
          <Stack.Screen component={ItemDetail} name={Paths.ItemDetail} />
          <Stack.Screen component={ReceiptDetail} name={Paths.ReceiptDetail} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default ApplicationNavigator;
