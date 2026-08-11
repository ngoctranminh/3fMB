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
import { Paths } from '@/navigation/paths';
import { ThemeProvider } from '@/theme';
import i18n from '@/translations';

import { createTabScreenProps } from '@/tests/navigationProps';

import Alerts from './Alerts';

jest.mock('@/hooks/domain/inventory/inventoryService', () => ({
  InventoryServices: {
    fetchAlertBoard: jest.fn(),
  },
}));

const mockedServices = jest.mocked(InventoryServices);

const ALERT_BOARD = {
  items: [
    {
      date: '06/08/2026',
      fullName: 'Đông lạnh / Mực / Đã làm',
      group: 'today' as const,
      id: '4',
      name: 'Mực đã làm',
      quantity: '2.5 kg',
      reorderLevel: '3 kg',
      severity: 'low' as const,
      statusLabel: 'Sắp hết (2.5 kg)',
    },
    {
      date: '05/08/2026',
      fullName: 'Đông lạnh / Trứng cá / Đen',
      group: 'yesterday' as const,
      id: '23',
      name: 'Trứng cá đen',
      quantity: '0 kg',
      reorderLevel: '1 kg',
      severity: 'out' as const,
      statusLabel: 'Sắp hết (0 kg)',
    },
    {
      date: '09/08/2026',
      fullName: 'Rau củ quả',
      group: 'today' as const,
      id: '52',
      name: 'Rau củ quả',
      quantity: '25 kg',
      reorderLevel: '10 kg',
      severity: 'expiring' as const,
      statusLabel: 'Còn 3 ngày',
    },
  ],
  totals: { expiring: 1, low: 1, out: 1 },
};

describe('Alerts screen', () => {
  let storage: MMKV;

  beforeAll(() => {
    storage = createMMKV();
  });

  beforeEach(() => {
    mockedServices.fetchAlertBoard.mockResolvedValue(ALERT_BOARD);
  });

  afterEach(() => {
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
              <Alerts {...createTabScreenProps(Paths.Alerts).props} />
            </I18nextProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>,
    );
  };

  it('renders the header, summary and grouped alerts', async () => {
    renderScreen();

    expect(screen.getByText('Cảnh báo')).toBeOnTheScreen();
    expect(screen.getByTestId('alerts-summary')).toBeOnTheScreen();

    await waitFor(() => {
      expect(screen.getByText('Hôm nay')).toBeOnTheScreen();
    });
    expect(screen.getByText('Hôm qua')).toBeOnTheScreen();

    expect(screen.getByText('Mực đã làm')).toBeOnTheScreen();
    expect(screen.getByText('Trứng cá đen')).toBeOnTheScreen();
  });

  it('overrides the server low-stock label when quantity is zero', async () => {
    renderScreen();

    await waitFor(() => {
      expect(screen.getByText('Sắp hết (2.5 kg)')).toBeOnTheScreen();
    });
    expect(screen.getAllByText('Hết hàng').length).toBeGreaterThan(0);
    expect(screen.queryByText('Sắp hết (0 kg)')).not.toBeOnTheScreen();
    expect(screen.getByText('Còn 3 ngày')).toBeOnTheScreen();
  });

  it('filters the list by severity tab', async () => {
    renderScreen();

    await waitFor(() => {
      expect(screen.getByText('Mực đã làm')).toBeOnTheScreen();
    });

    fireEvent.press(screen.getByTestId('segment-out'));

    expect(screen.getByText('Trứng cá đen')).toBeOnTheScreen();
    expect(screen.queryByText('Mực đã làm')).not.toBeOnTheScreen();
  });

  it('filters the list by the search query', async () => {
    renderScreen();

    await waitFor(() => {
      expect(screen.getByText('Mực đã làm')).toBeOnTheScreen();
    });

    fireEvent.changeText(screen.getByTestId('alerts-search-input'), 'trứng cá');

    expect(screen.getByText('Trứng cá đen')).toBeOnTheScreen();
    expect(screen.queryByText('Mực đã làm')).not.toBeOnTheScreen();
  });

  it('collapses and expands a date group', async () => {
    renderScreen();

    await waitFor(() => {
      expect(screen.getByText('Mực đã làm')).toBeOnTheScreen();
    });

    fireEvent.press(screen.getByTestId('alerts-group-today'));

    expect(screen.getByText('Hôm nay')).toBeOnTheScreen();
    expect(screen.queryByText('Mực đã làm')).not.toBeOnTheScreen();

    fireEvent.press(screen.getByTestId('alerts-group-today'));

    expect(screen.getByText('Mực đã làm')).toBeOnTheScreen();
  });

  it('shows the empty state when nothing matches', async () => {
    renderScreen();

    await waitFor(() => {
      expect(screen.getByText('Mực đã làm')).toBeOnTheScreen();
    });

    fireEvent.changeText(
      screen.getByTestId('alerts-search-input'),
      'khong-co-gi',
    );

    expect(screen.getByText('Không có cảnh báo nào')).toBeOnTheScreen();
  });
});
