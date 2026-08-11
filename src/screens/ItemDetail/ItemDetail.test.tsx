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

import { createDetailScreenProps } from '@/tests/navigationProps';

import ItemDetail from './ItemDetail';

jest.mock('@/hooks/domain/inventory/inventoryService', () => ({
  InventoryServices: {
    adjustItemQuantity: jest.fn(),
    fetchItemDetail: jest.fn(),
    fetchItemLedger: jest.fn(),
  },
}));

const mockedServices = jest.mocked(InventoryServices);

const ITEM = {
  expiresAt: null,
  fullName: 'Đông lạnh / Mực / Chưa làm',
  id: 3,
  minQuantity: '3 kg',
  name: 'Chưa làm',
  note: '',
  quantity: 6,
  quantityLabel: '6 kg',
  status: 'ok' as const,
  totalValue: '1.080.000đ',
  unit: 'kg',
  unitPrice: '180.000đ',
};

const LEDGER = [
  {
    deltaLabel: '+50 kg',
    id: '53',
    isIncoming: true,
    note: 'Nhập hàng — T',
    occurredAt: '06/08/2026 09:04',
    totalPrice: '50.000 đ',
  },
];

const renderScreen = (storage: MMKV) => {
  const { goBack, props } = createDetailScreenProps(Paths.ItemDetail, {
    itemId: '3',
  });
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
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
            <ItemDetail {...props} />
          </I18nextProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>,
  );

  return { goBack };
};

describe('ItemDetail screen', () => {
  let storage: MMKV;

  beforeAll(() => {
    storage = createMMKV();
  });

  beforeEach(() => {
    mockedServices.fetchItemDetail.mockResolvedValue(ITEM);
    mockedServices.fetchItemLedger.mockResolvedValue(LEDGER);
    mockedServices.adjustItemQuantity.mockResolvedValue({
      expires_at: null,
      id: 3,
      min_quantity: 3,
      name: 'Chưa làm',
      note: '',
      parent_id: 2,
      quantity: 7,
      unit: 'kg',
      unit_price: 180_000,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the item fields and its transaction history', async () => {
    renderScreen(storage);

    await waitFor(() => {
      expect(screen.getByText('Chưa làm')).toBeOnTheScreen();
    });

    expect(screen.getByText('Đông lạnh / Mực / Chưa làm')).toBeOnTheScreen();
    expect(screen.getByText('6 kg')).toBeOnTheScreen();
    expect(screen.getByText('180.000đ')).toBeOnTheScreen();
    expect(screen.getByText('1.080.000đ')).toBeOnTheScreen();
    expect(screen.getByText('Không có hạn')).toBeOnTheScreen();

    expect(screen.getByText('Nhập hàng — T')).toBeOnTheScreen();
    expect(screen.getByText('+50 kg')).toBeOnTheScreen();
  });

  it('sends the tapped step to the adjust endpoint', async () => {
    renderScreen(storage);

    await waitFor(() => {
      expect(screen.getByText('Chưa làm')).toBeOnTheScreen();
    });

    fireEvent.press(screen.getByTestId('item-adjust-1'));

    await waitFor(() => {
      expect(mockedServices.adjustItemQuantity).toHaveBeenCalledWith({
        delta: 1,
        itemId: 3,
      });
    });
  });

  it('sends a negative delta when a minus step is tapped', async () => {
    renderScreen(storage);

    await waitFor(() => {
      expect(screen.getByText('Chưa làm')).toBeOnTheScreen();
    });

    fireEvent.press(screen.getByTestId('item-adjust--0.5'));

    await waitFor(() => {
      expect(mockedServices.adjustItemQuantity).toHaveBeenCalledWith({
        delta: -0.5,
        itemId: 3,
      });
    });
  });

  it('shows the empty history state when there are no transactions', async () => {
    mockedServices.fetchItemLedger.mockResolvedValue([]);

    renderScreen(storage);

    await waitFor(() => {
      expect(screen.getByText('Chưa có giao dịch nào')).toBeOnTheScreen();
    });
  });

  it('goes back when the back button is pressed', async () => {
    const { goBack } = renderScreen(storage);

    await waitFor(() => {
      expect(screen.getByText('Chưa làm')).toBeOnTheScreen();
    });

    fireEvent.press(screen.getByTestId('item-detail-back'));

    expect(goBack).toHaveBeenCalled();
  });
});
