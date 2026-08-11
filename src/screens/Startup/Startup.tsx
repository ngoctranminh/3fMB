import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/hooks';
import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { useTheme } from '@/theme';

import { AssetByVariant } from '@/components/atoms';
import { SafeScreen } from '@/components/templates';

function Startup({ navigation }: RootScreenProps<Paths.Startup>) {
  const { gutters, layout } = useTheme();
  const { useCurrentUserQuery } = useAuth();

  const sessionQuery = useCurrentUserQuery();

  useEffect(() => {
    if (sessionQuery.isSuccess) {
      navigation.reset({
        index: 0,
        routes: [{ name: sessionQuery.data ? Paths.MainTabs : Paths.Login }],
      });
    }
  }, [navigation, sessionQuery.data, sessionQuery.isSuccess]);

  return (
    <SafeScreen
      isError={sessionQuery.isError}
      onResetError={() => {
        void sessionQuery.refetch();
      }}
    >
      <View
        style={[
          layout.flex_1,
          layout.col,
          layout.itemsCenter,
          layout.justifyCenter,
        ]}
      >
        <AssetByVariant
          path="tom"
          resizeMode="contain"
          style={{ height: 300, width: 300 }}
        />
        {sessionQuery.isFetching ? (
          <ActivityIndicator size="large" style={[gutters.marginVertical_24]} />
        ) : undefined}
      </View>
    </SafeScreen>
  );
}

export default Startup;
