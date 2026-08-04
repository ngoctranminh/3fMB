import { fireEvent, render, screen } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { createMMKV, MMKV } from 'react-native-mmkv';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider } from '@/theme';
import i18n from '@/translations';

import Overview from './Overview';

describe('Overview screen', () => {
  let storage: MMKV;

  beforeAll(() => {
    storage = createMMKV();
  });

  // The chart schedules an Animated.timing via setTimeout; without fake timers
  // it fires after the Jest environment is torn down and crashes the worker.
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
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
            <Overview />
          </I18nextProvider>
        </ThemeProvider>
      </SafeAreaProvider>,
    );
  };

  it('renders the header, stats, alerts and inventory', () => {
    renderScreen();

    expect(screen.getByText('Tổng quan')).toBeOnTheScreen();
    expect(screen.getByText('Kho Quán Ăn')).toBeOnTheScreen();

    expect(screen.getByText('128')).toBeOnTheScreen();
    expect(screen.getByText('45.250.000đ')).toBeOnTheScreen();

    expect(screen.getAllByText('Giá trị tồn kho')).toHaveLength(2);
    expect(screen.getByText('7 ngày qua')).toBeOnTheScreen();

    expect(screen.getByText('Nước cốt dừa')).toBeOnTheScreen();
    expect(screen.getAllByText('Sắp hết').length).toBeGreaterThan(0);
    expect(screen.getByText('Gạo tấm thơm')).toBeOnTheScreen();
  });

  it('renders the chart after the card reports its width', () => {
    renderScreen();

    fireEvent(screen.getByTestId('chart-body'), 'layout', {
      nativeEvent: { layout: { height: 180, width: 320, x: 0, y: 0 } },
    });

    expect(screen.getByText('50M')).toBeOnTheScreen();
    expect(screen.getByText('06/05')).toBeOnTheScreen();
    expect(screen.getByText('12/05')).toBeOnTheScreen();
  });

  it('filters the inventory list by the search query', () => {
    renderScreen();

    fireEvent.changeText(screen.getByTestId('inventory-search-input'), 'gạo');

    expect(screen.getByText('Gạo tấm thơm')).toBeOnTheScreen();
    expect(screen.queryByText('Nước mắm')).not.toBeOnTheScreen();
  });
});
