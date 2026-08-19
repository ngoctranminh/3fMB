import type { ReactNode } from 'react';

import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/hooks';
import { canViewSauces } from '@/hooks/domain/auth/permissions';
import { useTheme } from '@/theme';

import { SafeScreen } from '@/components/templates';

type Properties = {
  readonly children: ReactNode;
  readonly onUnauthorized: () => void;
};

function SauceAccessGuard({ children, onUnauthorized }: Properties) {
  const { useCurrentUserQuery } = useAuth();
  const { layout } = useTheme();
  const currentUserQuery = useCurrentUserQuery();
  const username = currentUserQuery.data
    ? currentUserQuery.data.username
    : undefined;
  const isAllowed = canViewSauces(username);

  useEffect(() => {
    if (currentUserQuery.isSuccess && !isAllowed) {
      onUnauthorized();
    }
  }, [currentUserQuery.isSuccess, isAllowed, onUnauthorized]);

  if (currentUserQuery.isError) {
    return (
      <SafeScreen
        isError
        onGoBackError={onUnauthorized}
        onResetError={() => {
          void currentUserQuery.refetch();
        }}
      />
    );
  }

  if (!isAllowed) {
    return (
      <SafeScreen>
        {currentUserQuery.isFetching ? (
          <View
            style={[layout.flex_1, layout.itemsCenter, layout.justifyCenter]}
          >
            <ActivityIndicator size="large" />
          </View>
        ) : undefined}
      </SafeScreen>
    );
  }

  return children;
}

export default SauceAccessGuard;
