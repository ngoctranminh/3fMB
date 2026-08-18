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

import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { ThemeProvider } from '@/theme';
import i18n from '@/translations';

import Sauces from './Sauces';

describe('Sauces screen', () => {
  it('searches recipes and opens the selected recipe detail', () => {
    const navigate = jest.fn();
    const props = {
      navigation: { goBack: jest.fn(), navigate },
      route: { key: 'sauces-test', name: Paths.Sauces },
    } as unknown as RootScreenProps<Paths.Sauces>;
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
              <Sauces {...props} />
            </I18nextProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>,
    );

    fireEvent.changeText(screen.getByTestId('sauces-search'), 'bibimbap');
    expect(screen.getByText('Sốt bibimbap')).toBeOnTheScreen();
    expect(screen.queryByText('Sốt trắng')).not.toBeOnTheScreen();

    fireEvent.press(screen.getByTestId('sauce-item-bibimbap-sauce'));
    expect(navigate).toHaveBeenCalledWith(Paths.SauceDetail, {
      sauceId: 'bibimbap-sauce',
    });
  });

  it('blocks users outside the sauce viewer allowlist', async () => {
    const goBack = jest.fn();
    const props = {
      navigation: { goBack },
      route: { key: 'sauces-test', name: Paths.Sauces },
    } as unknown as RootScreenProps<Paths.Sauces>;
    const queryClient = new QueryClient({
      defaultOptions: { queries: { staleTime: Infinity } },
    });
    queryClient.setQueryData(['auth', 'currentUser'], {
      id: 4,
      username: 'other3f',
    });

    render(
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider storage={createMMKV()}>
            <I18nextProvider i18n={i18n}>
              <Sauces {...props} />
            </I18nextProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>,
    );

    await waitFor(() => {
      expect(goBack).toHaveBeenCalled();
    });
    expect(screen.queryByTestId('sauces-screen')).not.toBeOnTheScreen();
  });
});
