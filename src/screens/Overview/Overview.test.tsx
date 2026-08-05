import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { createMMKV, MMKV } from 'react-native-mmkv';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { InventoryServices } from '@/hooks/domain/inventory/inventoryService';
import { ThemeProvider } from '@/theme';
import i18n from '@/translations';

import Overview from './Overview';

jest.mock('@/hooks/domain/inventory/inventoryService', () => ({
  InventoryServices: {
    fetchAlerts: jest.fn(),
    fetchItems: jest.fn(),
    fetchSummary: jest.fn(),
    fetchValueHistory: jest.fn(),
  },
}));

const mockedServices = jest.mocked(InventoryServices);

const SUMMARY = {
  alert_count: 11,
  expiring_count: 1,
  low_stock_count: 10,
  overdue_count: 0,
  total_items: 66,
  total_value: 34_449_500,
};

const HISTORY = [
  { label: '31/07', value: 37_644_400 },
  { label: '06/08', value: 34_449_500 },
];

const ALERTS = [
  {
    date: '06/08/2026',
    id: '4',
    quantity: '2.5 kg',
    severity: 'low' as const,
    title: 'Đông lạnh / Mực / Đã làm',
  },
];

const ITEMS = [
  {
    fullName: 'Đông lạnh / Mực / Chưa làm',
    id: '3',
    isLow: false,
    name: 'Chưa làm',
    quantity: '6',
    status: 'ok' as const,
    unit: 'kg',
  },
  {
    fullName: 'Đông lạnh / Trứng cá / Đen',
    id: '23',
    isLow: true,
    name: 'Đen',
    quantity: '0.5',
    status: 'low' as const,
    unit: 'kg',
  },
];

describe('Overview screen', () => {
  let storage: MMKV;

  beforeAll(() => {
    storage = createMMKV();
  });

  // The chart schedules an Animated.timing via setTimeout; without fake timers
  // it fires after the Jest environment is torn down and crashes the worker.
  beforeEach(() => {
    jest.useFakeTimers();
    mockedServices.fetchSummary.mockResolvedValue(SUMMARY);
    mockedServices.fetchValueHistory.mockResolvedValue(HISTORY);
    mockedServices.fetchAlerts.mockResolvedValue(ALERTS);
    mockedServices.fetchItems.mockResolvedValue(ITEMS);
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  const renderScreen = () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { height: 812, width: 375, x: 0, y: 0 },
          insets: { bottom: 34, left: 0, right: 0, top: 44 },
        }}
      >
        <QueryClientProvider client={queryClient}>
          <ThemeProvider storage={storage}>
            <I18nextProvider i18n={i18n}>
              <Overview />
            </I18nextProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>,
    );
  };

  it('renders the header, stats, alerts and inventory', async () => {
    renderScreen();

    expect(screen.getByText('Tổng quan')).toBeOnTheScreen();
    expect(screen.getByText('Kho Quán Ăn')).toBeOnTheScreen();

    await waitFor(() => {
      expect(screen.getByText('66')).toBeOnTheScreen();
    });
    expect(screen.getByText('34.449.500đ')).toBeOnTheScreen();

    expect(screen.getAllByText('Giá trị tồn kho')).toHaveLength(2);
    expect(screen.getByText('7 ngày qua')).toBeOnTheScreen();

    expect(screen.getByText('Đông lạnh / Mực / Đã làm')).toBeOnTheScreen();
    expect(screen.getAllByText('Sắp hết').length).toBeGreaterThan(0);
    expect(screen.getByText('Chưa làm')).toBeOnTheScreen();
  });

  it('renders the chart after the card reports its width', async () => {
    renderScreen();

    await waitFor(() => {
      expect(screen.getByText('66')).toBeOnTheScreen();
    });

    fireEvent(screen.getByTestId('chart-body'), 'layout', {
      nativeEvent: { layout: { height: 180, width: 320, x: 0, y: 0 } },
    });

    expect(screen.getByText('50M')).toBeOnTheScreen();
    expect(screen.getByText('31/07')).toBeOnTheScreen();
    expect(screen.getByText('06/08')).toBeOnTheScreen();
  });

  it('filters the inventory list by the search query', async () => {
    renderScreen();

    await waitFor(() => {
      expect(screen.getByText('Chưa làm')).toBeOnTheScreen();
    });

    fireEvent.changeText(screen.getByTestId('inventory-search-input'), 'đen');

    expect(screen.getByText('Đen')).toBeOnTheScreen();
    expect(screen.queryByText('Chưa làm')).not.toBeOnTheScreen();
  });
});
