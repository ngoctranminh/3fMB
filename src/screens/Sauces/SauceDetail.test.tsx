import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { createMMKV } from 'react-native-mmkv';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthServices } from '@/hooks/domain/auth/authService';
import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { ThemeProvider } from '@/theme';
import i18n from '@/translations';

import SauceDetail from './SauceDetail';

describe('Sauce detail screen', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('adjusts ingredient amounts only inside the selected recipe', () => {
    const props = {
      navigation: { goBack: jest.fn() },
      route: {
        key: 'sauce-detail-test',
        name: Paths.SauceDetail,
        params: { sauceId: 'white-sauce' },
      },
    } as unknown as RootScreenProps<Paths.SauceDetail>;
    const queryClient = new QueryClient({
      defaultOptions: { queries: { staleTime: Infinity } },
    });
    queryClient.setQueryData(['auth', 'currentUser'], {
      id: 1,
      username: 'manhtu3f',
    });

    render(
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider storage={createMMKV()}>
            <I18nextProvider i18n={i18n}>
              <SauceDetail {...props} />
            </I18nextProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>,
    );

    expect(screen.getByText('Sốt trắng')).toBeOnTheScreen();
    expect(screen.getByText('1,5 kg')).toBeOnTheScreen();

    fireEvent.press(screen.getByTestId('sauce-detail-scale-2'));

    expect(screen.getByText('3 kg')).toBeOnTheScreen();
    expect(screen.getByText('480 g')).toBeOnTheScreen();
  });

  it('can go back when checking sauce access fails', async () => {
    jest
      .spyOn(AuthServices, 'getCurrentUser')
      .mockRejectedValue(new Error('Offline'));
    const goBack = jest.fn();
    const props = {
      navigation: { goBack },
      route: {
        key: 'sauce-detail-test',
        name: Paths.SauceDetail,
        params: { sauceId: 'white-sauce' },
      },
    } as unknown as RootScreenProps<Paths.SauceDetail>;
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider storage={createMMKV()}>
            <I18nextProvider i18n={i18n}>
              <SauceDetail {...props} />
            </I18nextProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('error-go-back')).toBeOnTheScreen();
    });

    fireEvent.press(screen.getByTestId('error-go-back'));

    expect(goBack).toHaveBeenCalled();
  });
});
