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
import type { RootScreenProps } from '@/navigation/types';
import { ThemeProvider } from '@/theme';
import i18n from '@/translations';

import CreateDocument from './CreateDocument';

jest.mock('@/hooks/domain/inventory/inventoryService', () => ({
  InventoryServices: {
    createDocument: jest.fn(),
    fetchInventoryCatalog: jest.fn(),
  },
}));

const mockedServices = jest.mocked(InventoryServices);

describe('CreateDocument screen', () => {
  let storage: MMKV;

  beforeAll(() => {
    storage = createMMKV();
  });

  beforeEach(() => {
    mockedServices.fetchInventoryCatalog.mockResolvedValue({
      groups: [{ id: '1', name: 'Đông lạnh' }],
      items: [
        {
          fullName: 'Đông lạnh / Cá hồi',
          id: '3',
          name: 'Cá hồi',
          unit: 'kg',
          unitPrice: 200_000,
        },
      ],
    });
    mockedServices.createDocument.mockResolvedValue({
      canCancel: true,
      code: 'NK260811-001',
      date: '11/08/2026 18:00',
      id: '101',
      kind: 'import',
      lines: [],
      note: '',
      partner: 'NCC A',
      status: 'done',
      statusLabel: 'Hoàn thành',
      subtypeLabel: 'Nhập hàng',
      totalValue: '400.000 đ',
      user: 'Admin',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates a receipt from a selected ingredient', async () => {
    const replace = jest.fn();
    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
        queries: { retry: false },
      },
    });
    const props = {
      navigation: { goBack: jest.fn(), replace },
      route: {
        key: 'create-document-test',
        name: Paths.CreateDocument,
        params: { initialSubtype: 'purchase' },
      },
    } as unknown as RootScreenProps<Paths.CreateDocument>;

    render(
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider storage={storage}>
            <I18nextProvider i18n={i18n}>
              <CreateDocument {...props} />
            </I18nextProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('create-document-item-3')).toBeOnTheScreen();
    });

    fireEvent.press(screen.getByTestId('create-document-item-3'));
    fireEvent.changeText(screen.getByTestId('create-document-party'), 'NCC A');
    fireEvent.changeText(screen.getByTestId('create-document-quantity'), '2');
    fireEvent.press(screen.getByTestId('create-document-submit'));

    await waitFor(() => {
      expect(mockedServices.createDocument.mock.calls[0]?.[0]).toEqual({
        created_by: 'Admin',
        lines: [
          {
            item_id: 3,
            note: '',
            quantity: 2,
            unit_price: 200_000,
          },
        ],
        note: '',
        party: 'NCC A',
        subtype: 'purchase',
      });
      expect(replace).toHaveBeenCalledWith(Paths.ReceiptDetail, {
        documentId: '101',
      });
    });
  });
});
