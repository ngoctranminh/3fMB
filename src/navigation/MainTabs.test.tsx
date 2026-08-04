import { NavigationContainer } from '@react-navigation/native';
import { render, screen } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { createMMKV, MMKV } from 'react-native-mmkv';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import MainTabs from '@/navigation/MainTabs';
import { ThemeProvider } from '@/theme';
import i18n from '@/translations';

describe('MainTabs navigator', () => {
  let storage: MMKV;

  beforeAll(() => {
    storage = createMMKV();
  });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('renders every tab plus the centre action button', () => {
    render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { height: 812, width: 375, x: 0, y: 0 },
          insets: { bottom: 34, left: 0, right: 0, top: 44 },
        }}
      >
        <ThemeProvider storage={storage}>
          <I18nextProvider i18n={i18n}>
            <NavigationContainer>
              <MainTabs />
            </NavigationContainer>
          </I18nextProvider>
        </ThemeProvider>
      </SafeAreaProvider>,
    );

    expect(screen.getByTestId('main-tab-bar')).toBeOnTheScreen();
    expect(screen.getByTestId('tab-fab')).toBeOnTheScreen();

    expect(screen.getByTestId('tab-overview')).toBeOnTheScreen();
    expect(screen.getByTestId('tab-ingredients')).toBeOnTheScreen();
    expect(screen.getByTestId('tab-alerts')).toBeOnTheScreen();
    expect(screen.getByTestId('tab-more')).toBeOnTheScreen();

    expect(screen.getByText('Nhập/Xuất')).toBeOnTheScreen();
  });
});
