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

import Transactions from './Transactions';

jest.mock('@/hooks/domain/inventory/inventoryService', () => ({
  InventoryServices: {
    fetchTodayTotals: jest.fn(),
    fetchTransactions: jest.fn(),
  },
}));

const mockedServices = jest.mocked(InventoryServices);

const TODAY_TOTALS = {
  exportCount: 3,
  exportValue: '569.800 đ',
  importCount: 2,
  importValue: '70.000 đ',
};

const TRANSACTIONS = [
  {
    code: 'NK260806-001',
    date: '06/08/2026 09:04',
    id: '24',
    kind: 'import' as const,
    partner: 'Nhà cung cấp T',
    status: 'done' as const,
    subtype: 'purchase' as const,
    subtypeLabel: 'Nhập hàng',
    user: 'Admin',
    value: '50.000 đ',
  },
  {
    code: 'NK260806-002',
    date: '06/08/2026 08:30',
    id: '26',
    kind: 'import' as const,
    partner: 'Trả lại NCC B',
    status: 'done' as const,
    subtype: 'return' as const,
    subtypeLabel: 'Trả hàng',
    user: 'Admin',
    value: '20.000 đ',
  },
  {
    code: 'XK260806-003',
    date: '06/08/2026 09:04',
    id: '25',
    kind: 'export' as const,
    partner: 'Bếp phụ',
    status: 'done' as const,
    subtype: 'usage' as const,
    subtypeLabel: 'Xuất dùng',
    user: 'Admin',
    value: '51.000 đ',
  },
];

describe('Transactions screen', () => {
  let storage: MMKV;

  beforeAll(() => {
    storage = createMMKV();
  });

  beforeEach(() => {
    mockedServices.fetchTransactions.mockResolvedValue(TRANSACTIONS);
    mockedServices.fetchTodayTotals.mockResolvedValue(TODAY_TOTALS);
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
              <Transactions />
            </I18nextProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>,
    );
  };

  it('renders the header, quick actions, totals and receipt list', async () => {
    renderScreen();

    expect(screen.getByText('Nhập / Xuất kho')).toBeOnTheScreen();
    expect(screen.getByTestId('action-receive')).toBeOnTheScreen();
    expect(screen.getByTestId('transactions-today-totals')).toBeOnTheScreen();

    await waitFor(() => {
      expect(screen.getByText('70.000 đ')).toBeOnTheScreen();
    });
    expect(screen.getByText('569.800 đ')).toBeOnTheScreen();

    expect(screen.getByText('NK260806-001')).toBeOnTheScreen();
  });

  it('shows only receipts belonging to the active tab', async () => {
    renderScreen();

    await waitFor(() => {
      expect(screen.getByText('NK260806-001')).toBeOnTheScreen();
    });
    expect(screen.queryByText('XK260806-003')).not.toBeOnTheScreen();

    fireEvent.press(screen.getByTestId('segment-export'));

    expect(screen.getByText('XK260806-003')).toBeOnTheScreen();
    expect(screen.queryByText('NK260806-001')).not.toBeOnTheScreen();
  });

  it('filters the list by receipt subtype', async () => {
    renderScreen();

    await waitFor(() => {
      expect(screen.getByText('NK260806-001')).toBeOnTheScreen();
    });

    fireEvent.press(screen.getByTestId('filter-return'));

    expect(screen.getByText('NK260806-002')).toBeOnTheScreen();
    expect(screen.queryByText('NK260806-001')).not.toBeOnTheScreen();
  });

  it('filters the list by the search query', async () => {
    renderScreen();

    await waitFor(() => {
      expect(screen.getByText('NK260806-001')).toBeOnTheScreen();
    });

    fireEvent.changeText(
      screen.getByTestId('transactions-search-input'),
      'trả lại',
    );

    expect(screen.getByText('NK260806-002')).toBeOnTheScreen();
    expect(screen.queryByText('NK260806-001')).not.toBeOnTheScreen();
  });

  it('shows the empty state when nothing matches', async () => {
    renderScreen();

    await waitFor(() => {
      expect(screen.getByText('NK260806-001')).toBeOnTheScreen();
    });

    fireEvent.changeText(
      screen.getByTestId('transactions-search-input'),
      'khong-co-gi',
    );

    expect(screen.getByText('Không tìm thấy phiếu nào')).toBeOnTheScreen();
  });
});
