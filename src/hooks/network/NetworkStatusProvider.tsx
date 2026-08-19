import type { PropsWithChildren } from 'react';

import { useNetInfo } from '@react-native-community/netinfo';
import { createContext, useMemo } from 'react';

import { isOfflineSimulationEnabled } from './networkSimulation';

type NetworkStatus = {
  readonly isOffline: boolean;
};

export const NetworkStatusContext = createContext<NetworkStatus>({
  isOffline: false,
});

function NetworkStatusProvider({ children = undefined }: PropsWithChildren) {
  const { isConnected, isInternetReachable } = useNetInfo();
  const isOffline =
    isOfflineSimulationEnabled() ||
    isConnected === false ||
    isInternetReachable === false;
  const value = useMemo(() => ({ isOffline }), [isOffline]);

  return (
    <NetworkStatusContext.Provider value={value}>
      {children}
    </NetworkStatusContext.Provider>
  );
}

export default NetworkStatusProvider;
