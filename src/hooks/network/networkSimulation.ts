import { Settings } from 'react-native';

export const SIMULATE_OFFLINE_SETTING = 'threefff_simulate_offline';

export const isOfflineSimulationEnabled = () => {
  const value = Settings.get(SIMULATE_OFFLINE_SETTING);

  return __DEV__ && (value === true || value === 'YES' || value === 'true');
};
