import { fireEvent, render, screen } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { createMMKV, MMKV } from 'react-native-mmkv';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider } from '@/theme';
import i18n from '@/translations';

import Alerts from './Alerts';

describe('Alerts screen', () => {
  let storage: MMKV;

  beforeAll(() => {
    storage = createMMKV();
  });

  const renderScreen = () => {
    render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { height: 812, width: 375, x: 0, y: 0 },
          insets: { bottom: 34, left: 0, right: 0, top: 44 },
        }}
      >
        <ThemeProvider storage={storage}>
          <I18nextProvider i18n={i18n}>
            <Alerts />
          </I18nextProvider>
        </ThemeProvider>
      </SafeAreaProvider>,
    );
  };

  it('renders the header, summary and grouped alerts', () => {
    renderScreen();

    expect(screen.getByText('Cảnh báo')).toBeOnTheScreen();
    expect(screen.getByTestId('alerts-summary')).toBeOnTheScreen();

    expect(screen.getByText('Hôm nay')).toBeOnTheScreen();
    expect(screen.getByText('Hôm qua')).toBeOnTheScreen();

    expect(screen.getByText('Thịt bò')).toBeOnTheScreen();
    expect(screen.getByText('Rau răm')).toBeOnTheScreen();
  });

  it('shows the status line matching each severity', () => {
    renderScreen();

    expect(screen.getByText('Sắp hết (1.2 kg)')).toBeOnTheScreen();
    expect(screen.getByText('Hết hạn từ 11/05/2025')).toBeOnTheScreen();
    expect(screen.getByText('Hết hạn vào 13/05/2025')).toBeOnTheScreen();
    expect(screen.getByText('Quá hạn nhập 3 ngày')).toBeOnTheScreen();
  });

  it('filters the list by severity tab', () => {
    renderScreen();

    fireEvent.press(screen.getByTestId('segment-out'));

    expect(screen.getByText('Rau răm')).toBeOnTheScreen();
    expect(screen.queryByText('Thịt bò')).not.toBeOnTheScreen();
  });

  it('filters the list by the search query', () => {
    renderScreen();

    fireEvent.changeText(screen.getByTestId('alerts-search-input'), 'kho mát');

    expect(screen.getByText('Sữa tươi')).toBeOnTheScreen();
    expect(screen.queryByText('Thịt bò')).not.toBeOnTheScreen();
  });

  it('collapses and expands a date group', () => {
    renderScreen();

    fireEvent.press(screen.getByTestId('alerts-group-today'));

    expect(screen.getByText('Hôm nay')).toBeOnTheScreen();
    expect(screen.queryByText('Thịt bò')).not.toBeOnTheScreen();

    fireEvent.press(screen.getByTestId('alerts-group-today'));

    expect(screen.getByText('Thịt bò')).toBeOnTheScreen();
  });

  it('shows the empty state when nothing matches', () => {
    renderScreen();

    fireEvent.changeText(
      screen.getByTestId('alerts-search-input'),
      'khong-co-gi',
    );

    expect(screen.getByText('Không có cảnh báo nào')).toBeOnTheScreen();
  });
});
