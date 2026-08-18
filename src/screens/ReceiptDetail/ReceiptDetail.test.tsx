/* eslint-disable unicorn/no-null -- API fields are explicitly nullable. */
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

import { resolveApiUrl } from '@/services/instance';

import ReceiptDetail from './ReceiptDetail';

jest.mock('@/hooks/domain/inventory/inventoryService', () => ({
  InventoryServices: {
    cancelDocument: jest.fn(),
    fetchDocumentDetail: jest.fn(),
  },
}));

const mockedServices = jest.mocked(InventoryServices);

const RECEIPT = {
  canCancel: true,
  code: 'XK260806-001',
  date: '06/08/2026 09:04',
  id: '22',
  imageUrl: null,
  kind: 'export' as const,
  lines: [
    {
      fullName: 'Đông lạnh / Tỏi, sả, ớt / Tỏi',
      id: '48',
      name: 'Tỏi',
      note: '',
      quantity: '0.9 kg',
      totalPrice: '40.500 Kč',
      unitPrice: '45.000 Kč',
    },
  ],
  note: '',
  partner: 'Bếp chính',
  status: 'done' as const,
  statusLabel: 'Hoàn thành',
  subtype: 'usage' as const,
  subtypeLabel: 'Xuất dùng',
  totalValue: '352.000 Kč',
  user: 'Admin',
};

const renderScreen = (storage: MMKV) => {
  const { goBack, props } = createDetailScreenProps(Paths.ReceiptDetail, {
    documentId: '22',
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
            <ReceiptDetail {...props} />
          </I18nextProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>,
  );

  return { goBack };
};

describe('ReceiptDetail screen', () => {
  let storage: MMKV;

  beforeAll(() => {
    storage = createMMKV();
  });

  beforeEach(() => {
    mockedServices.fetchDocumentDetail.mockResolvedValue(RECEIPT);
    mockedServices.cancelDocument.mockResolvedValue({
      ...RECEIPT,
      canCancel: false,
      status: 'cancelled' as const,
      statusLabel: 'Đã huỷ',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the receipt fields and its line items', async () => {
    renderScreen(storage);

    await waitFor(() => {
      expect(screen.getByText('XK260806-001')).toBeOnTheScreen();
    });

    expect(screen.getByText('Xuất dùng')).toBeOnTheScreen();
    expect(screen.getByText('Bếp chính')).toBeOnTheScreen();
    expect(screen.getByText('352.000 Kč')).toBeOnTheScreen();
    expect(screen.getByText('Hoàn thành')).toBeOnTheScreen();

    expect(screen.getByText('Tỏi')).toBeOnTheScreen();
    expect(screen.getByText('0.9 kg')).toBeOnTheScreen();
    expect(screen.getByText('40.500 Kč')).toBeOnTheScreen();
  });

  it('shows the receiving photo returned by the server', async () => {
    mockedServices.fetchDocumentDetail.mockResolvedValue({
      ...RECEIPT,
      imageUrl: '/api/documents/22/image',
    });

    renderScreen(storage);

    await waitFor(() => {
      expect(screen.getByTestId('receipt-photo')).toBeOnTheScreen();
    });

    expect(screen.getByText('Ảnh nhập hàng')).toBeOnTheScreen();
    expect(screen.getByTestId('receipt-photo')).toHaveProp('source', {
      uri: resolveApiUrl('/api/documents/22/image'),
    });
  });

  it('cancels the receipt when the cancel button is pressed', async () => {
    renderScreen(storage);

    await waitFor(() => {
      expect(screen.getByTestId('receipt-cancel')).toBeOnTheScreen();
    });

    fireEvent.press(screen.getByTestId('receipt-cancel'));

    await waitFor(() => {
      expect(mockedServices.cancelDocument).toHaveBeenCalledWith('22');
    });
  });

  it('hides the cancel button for an already cancelled receipt', async () => {
    mockedServices.fetchDocumentDetail.mockResolvedValue({
      ...RECEIPT,
      canCancel: false,
      status: 'cancelled' as const,
      statusLabel: 'Đã huỷ',
    });

    renderScreen(storage);

    await waitFor(() => {
      expect(screen.getByText('Phiếu này đã huỷ.')).toBeOnTheScreen();
    });

    expect(screen.queryByTestId('receipt-cancel')).not.toBeOnTheScreen();
  });

  it('shows the empty state when the receipt has no lines', async () => {
    mockedServices.fetchDocumentDetail.mockResolvedValue({
      ...RECEIPT,
      lines: [],
    });

    renderScreen(storage);

    await waitFor(() => {
      expect(screen.getByText('Phiếu không có dòng hàng')).toBeOnTheScreen();
    });
  });

  it('goes back when the back button is pressed', async () => {
    const { goBack } = renderScreen(storage);

    await waitFor(() => {
      expect(screen.getByText('XK260806-001')).toBeOnTheScreen();
    });

    fireEvent.press(screen.getByTestId('receipt-detail-back'));

    expect(goBack).toHaveBeenCalled();
  });
});
