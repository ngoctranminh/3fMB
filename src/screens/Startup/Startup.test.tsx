import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { createMMKV } from 'react-native-mmkv';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthServices } from '@/hooks/domain/auth/authService';
import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { ThemeProvider } from '@/theme';
import i18n from '@/translations';

import Startup from './Startup';

jest.mock('@/hooks/domain/auth/authService', () => ({
  AuthServices: {
    getCurrentUser: jest.fn(),
  },
}));

const mockedServices = jest.mocked(AuthServices);

describe('Startup screen', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderScreen = () => {
    const resetNavigation = jest.fn();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const props = {
      navigation: { reset: resetNavigation },
      route: { key: 'startup-test', name: Paths.Startup },
    } as unknown as RootScreenProps<Paths.Startup>;

    render(
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider storage={createMMKV()}>
            <I18nextProvider i18n={i18n}>
              <Startup {...props} />
            </I18nextProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>,
    );

    return { resetNavigation };
  };

  it('opens the app when a server session exists', async () => {
    mockedServices.getCurrentUser.mockResolvedValue({
      id: 1,
      username: 'manhtu3f',
    });
    const { resetNavigation } = renderScreen();

    await waitFor(() => {
      expect(resetNavigation).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: Paths.MainTabs }],
      });
    });
  });

  it('opens login when there is no server session', async () => {
    mockedServices.getCurrentUser.mockResolvedValue(false);
    const { resetNavigation } = renderScreen();

    await waitFor(() => {
      expect(resetNavigation).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: Paths.Login }],
      });
    });
  });
});
