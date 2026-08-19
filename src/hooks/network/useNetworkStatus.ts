import { useContext } from 'react';

import { NetworkStatusContext } from './NetworkStatusProvider';

export const useNetworkStatus = () => useContext(NetworkStatusContext);
