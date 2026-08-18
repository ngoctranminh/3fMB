import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { Alert } from 'react-native';
import { createMMKV, MMKV } from 'react-native-mmkv';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { InventoryServices } from '@/hooks/domain/inventory/inventoryService';
import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { ThemeProvider } from '@/theme';
import i18n from '@/translations';

import TransactionHistory from './TransactionHistory';

jest.mock('@/hooks/domain/inventory/inventoryService', () => ({
  InventoryServices: {
    fetchTransactions: jest.fn(),
  },
}));

const fetchTransactionsMock = jest.mocked(InventoryServices.fetchTransactions);

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
    value: '50.000 Kč',
  },
  {
    code: 'NK260806-002',
    date: '06/08/2026 08:30',
    id: '26',
    kind: 'import' as const,
    partner: 'Trả lại NCC B',
    status: 'cancelled' as const,
    subtype: 'return' as const,
    subtypeLabel: 'Trả hàng',
    user: 'Admin',
    value: '20.000 Kč',
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
    user: 'Bếp trưởng',
    value: '51.000 Kč',
  },
];

describe('TransactionHistory screen', () => {
  let storage: MMKV;
  const goBack = jest.fn();
  const navigate = jest.fn();

  beforeAll(() => {
    storage = createMMKV();
  });

  beforeEach(() => {
    fetchTransactionsMock.mockResolvedValue(TRANSACTIONS);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  const renderScreen = () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const props = {
      navigation: { goBack, navigate },
      route: {
        key: 'transaction-history-test',
        name: Paths.TransactionHistory,
      },
    } as unknown as RootScreenProps<Paths.TransactionHistory>;

    render(
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider storage={storage}>
            <I18nextProvider i18n={i18n}>
              <TransactionHistory {...props} />
            </I18nextProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>,
    );
  };

  it('loads all history and separates stock-in from stock-out', async () => {
    renderScreen();

    expect(screen.getByText('Lịch sử xuất / nhập kho')).toBeOnTheScreen();
    await waitFor(() => {
      expect(fetchTransactionsMock).toHaveBeenCalledWith('all');
      expect(screen.getByText('NK260806-001')).toBeOnTheScreen();
    });
    expect(
      within(screen.getByTestId('history-row-24')).getByText('Nhập hàng'),
    ).toBeOnTheScreen();
    expect(screen.queryByText('XK260806-003')).not.toBeOnTheScreen();
    expect(screen.getByText('2 phiếu')).toBeOnTheScreen();

    fireEvent.press(screen.getByTestId('segment-export'));
    expect(screen.getByText('XK260806-003')).toBeOnTheScreen();
    expect(screen.queryByText('NK260806-001')).not.toBeOnTheScreen();
  });

  it('filters by subtype and search text', async () => {
    renderScreen();

    await waitFor(() => {
      expect(screen.getByText('NK260806-001')).toBeOnTheScreen();
    });

    fireEvent.press(screen.getByTestId('history-filter-return'));
    expect(screen.getByText('NK260806-002')).toBeOnTheScreen();
    expect(screen.queryByText('NK260806-001')).not.toBeOnTheScreen();

    fireEvent.press(screen.getByTestId('history-filter-all'));
    fireEvent.changeText(
      screen.getByTestId('transaction-history-search'),
      'nhà cung cấp',
    );
    expect(screen.getByText('NK260806-001')).toBeOnTheScreen();
    expect(screen.queryByText('NK260806-002')).not.toBeOnTheScreen();
  });

  it('requests the selected server period', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation();
    renderScreen();

    fireEvent.press(screen.getByTestId('transaction-history-period'));
    const buttons = alert.mock.calls[0]?.[2];
    const weekButton = buttons?.find((button) => button.text === '7 ngày qua');
    await act(async () => {
      weekButton?.onPress?.();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(fetchTransactionsMock).toHaveBeenCalledWith('week');
    });
    expect(screen.getByText('7 ngày qua')).toBeOnTheScreen();
  });

  it('opens receipt details and returns to the previous screen', async () => {
    renderScreen();

    await waitFor(() => {
      expect(screen.getByTestId('history-row-24')).toBeOnTheScreen();
    });

    fireEvent.press(screen.getByTestId('history-row-24'));
    expect(navigate).toHaveBeenCalledWith(Paths.ReceiptDetail, {
      documentId: '24',
    });

    fireEvent.press(screen.getByTestId('transaction-history-back'));
    expect(goBack).toHaveBeenCalledTimes(1);
  });
});
