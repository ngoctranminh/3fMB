import { fireEvent, render, screen } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { createMMKV } from 'react-native-mmkv';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { ThemeProvider } from '@/theme';
import i18n from '@/translations';

import Sauces from './Sauces';

describe('Sauces screen', () => {
  it('searches recipes and scales ingredient amounts', () => {
    const props = {
      navigation: { goBack: jest.fn() },
      route: { key: 'sauces-test', name: Paths.Sauces },
    } as unknown as RootScreenProps<Paths.Sauces>;

    render(
      <SafeAreaProvider>
        <ThemeProvider storage={createMMKV()}>
          <I18nextProvider i18n={i18n}>
            <Sauces {...props} />
          </I18nextProvider>
        </ThemeProvider>
      </SafeAreaProvider>,
    );

    fireEvent.press(screen.getByTestId('sauces-scale-2'));
    expect(screen.getAllByText('3 kg').length).toBeGreaterThan(0);

    fireEvent.changeText(screen.getByTestId('sauces-search'), 'bibimbap');
    expect(screen.getByText('Sốt bibimbap')).toBeOnTheScreen();
    expect(screen.queryByText('Sốt trắng')).not.toBeOnTheScreen();
  });
});
