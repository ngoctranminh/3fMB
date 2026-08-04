import { fireEvent, render, screen } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { createMMKV, MMKV } from 'react-native-mmkv';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider } from '@/theme';
import i18n from '@/translations';

import Transactions from './Transactions';

describe('Transactions screen', () => {
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
            <Transactions />
          </I18nextProvider>
        </ThemeProvider>
      </SafeAreaProvider>,
    );
  };

  it('renders the header, quick actions, totals and receipt list', () => {
    renderScreen();

    expect(screen.getByText('Nhập / Xuất kho')).toBeOnTheScreen();
    expect(screen.getByText('Nhập hàng')).toBeOnTheScreen();
    expect(screen.getByTestId('action-transfer')).toBeOnTheScreen();

    expect(screen.getByTestId('transactions-today-totals')).toBeOnTheScreen();
    expect(screen.getByText('15.600.000 đ')).toBeOnTheScreen();
    expect(screen.getByText('8.450.000 đ')).toBeOnTheScreen();

    expect(screen.getByText('NK250512-001')).toBeOnTheScreen();
    expect(screen.getByText('DC250512-001')).toBeOnTheScreen();
  });

  it('filters the list by receipt kind', () => {
    renderScreen();

    fireEvent.press(screen.getByTestId('filter-transfer'));

    expect(screen.getByText('DC250512-001')).toBeOnTheScreen();
    expect(screen.queryByText('NK250512-001')).not.toBeOnTheScreen();
  });

  it('filters the list by the search query', () => {
    renderScreen();

    fireEvent.changeText(
      screen.getByTestId('transactions-search-input'),
      'quầy bar',
    );

    expect(screen.getByText('XK250512-002')).toBeOnTheScreen();
    expect(screen.queryByText('NK250512-001')).not.toBeOnTheScreen();
  });

  it('shows the empty state when nothing matches', () => {
    renderScreen();

    fireEvent.changeText(
      screen.getByTestId('transactions-search-input'),
      'khong-co-gi',
    );

    expect(screen.getByText('Không tìm thấy phiếu nào')).toBeOnTheScreen();
  });

  it('switches between the stock in and stock out tabs', () => {
    renderScreen();

    fireEvent.press(screen.getByTestId('segment-export'));

    expect(screen.getByTestId('segment-export')).toBeOnTheScreen();
  });
});
