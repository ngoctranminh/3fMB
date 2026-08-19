import { useNetInfo } from '@react-native-community/netinfo';
import { render, screen } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { createMMKV } from 'react-native-mmkv';

import { NetworkStatusProvider } from '@/hooks';
import { isOfflineSimulationEnabled } from '@/hooks/network/networkSimulation';
import { ThemeProvider } from '@/theme';
import i18n from '@/translations';

import NetworkStatusBanner from './NetworkStatusBanner';

jest.mock('@/hooks/network/networkSimulation', () => ({
  isOfflineSimulationEnabled: jest.fn(() => false),
}));

const mockedUseNetInfo = jest.mocked(useNetInfo);
const mockedIsOfflineSimulationEnabled = jest.mocked(
  isOfflineSimulationEnabled,
);

const setNetworkState = (
  isConnected: boolean | null,
  isInternetReachable: boolean | null,
) => {
  mockedUseNetInfo.mockReturnValue({
    isConnected,
    isInternetReachable,
  } as ReturnType<typeof useNetInfo>);
};

const renderBanner = () =>
  render(
    <ThemeProvider storage={createMMKV()}>
      <I18nextProvider i18n={i18n}>
        <NetworkStatusProvider>
          <NetworkStatusBanner />
        </NetworkStatusProvider>
      </I18nextProvider>
    </ThemeProvider>,
  );

describe('NetworkStatusBanner', () => {
  beforeEach(() => {
    setNetworkState(true, true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('stays hidden while the Internet is reachable', () => {
    renderBanner();

    expect(
      screen.queryByTestId('network-status-offline'),
    ).not.toBeOnTheScreen();
  });

  it('warns when the device has no network connection', () => {
    setNetworkState(false, false);
    renderBanner();

    expect(screen.getByTestId('network-status-offline')).toBeOnTheScreen();
  });

  it('warns when a network exists but the Internet is unreachable', () => {
    setNetworkState(true, false);
    renderBanner();

    expect(screen.getByTestId('network-status-offline')).toBeOnTheScreen();
  });

  it('supports forcing the offline state in a debug simulator', () => {
    mockedIsOfflineSimulationEnabled.mockReturnValue(true);
    renderBanner();

    expect(screen.getByTestId('network-status-offline')).toBeOnTheScreen();
  });
});
