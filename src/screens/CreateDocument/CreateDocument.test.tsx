/* eslint-disable unicorn/no-null -- API fields are explicitly nullable. */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { launchCamera } from 'react-native-image-picker';
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
jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(),
}));

const mockedServices = jest.mocked(InventoryServices);
const mockedLaunchCamera = jest.mocked(launchCamera);

describe('CreateDocument screen', () => {
  let storage: MMKV;

  beforeAll(() => {
    storage = createMMKV();
  });

  beforeEach(() => {
    mockedLaunchCamera.mockResolvedValue({ didCancel: true });
    mockedServices.fetchInventoryCatalog.mockResolvedValue({
      groups: [{ id: '1', name: 'Đông lạnh' }],
      items: [
        {
          fullName: 'Đông lạnh / Cá hồi',
          id: '3',
          name: 'Cá hồi',
          quantity: 8,
          unit: 'kg',
          unitPrice: 200_000,
        },
        {
          fullName: 'Đông lạnh / Tôm',
          id: '4',
          name: 'Tôm',
          quantity: 2,
          unit: 'kg',
          unitPrice: 150_000,
        },
      ],
    });
    mockedServices.createDocument.mockResolvedValue({
      canCancel: true,
      code: 'NK260811-001',
      date: '11/08/2026 18:00',
      id: '101',
      imageUrl: null,
      kind: 'import',
      lines: [],
      note: '',
      partner: 'NCC A',
      status: 'done',
      statusLabel: 'Hoàn thành',
      subtype: 'purchase',
      subtypeLabel: 'Nhập hàng',
      totalValue: '400.000 Kč',
      user: 'Admin',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderScreen = (initialSubtype: 'purchase' | 'usage' = 'purchase') => {
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
        params: { initialSubtype },
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

    return { replace };
  };

  it('creates a receipt from a selected ingredient', async () => {
    const { replace } = renderScreen();

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

  it('creates one receipt with multiple ingredients', async () => {
    renderScreen();

    await waitFor(() => {
      expect(screen.getByTestId('create-document-item-3')).toBeOnTheScreen();
    });

    fireEvent.press(screen.getByTestId('create-document-item-3'));
    fireEvent.changeText(screen.getByTestId('create-document-quantity'), '2');
    fireEvent.press(screen.getByTestId('create-document-item-4'));
    fireEvent.changeText(screen.getByTestId('create-document-quantity'), '1.5');
    fireEvent.press(screen.getByTestId('create-document-submit'));

    await waitFor(() => {
      expect(mockedServices.createDocument.mock.calls[0]?.[0].lines).toEqual([
        {
          item_id: 3,
          note: '',
          quantity: 2,
          unit_price: 200_000,
        },
        {
          item_id: 4,
          note: '',
          quantity: 1.5,
          unit_price: 150_000,
        },
      ]);
    });
  });

  it('captures and uploads a photo with an import receipt', async () => {
    mockedLaunchCamera.mockResolvedValue({
      assets: [
        {
          base64: 'captured-photo',
          fileName: 'hoa-don.jpg',
          type: 'image/jpeg',
          uri: 'file:///captured-photo.jpg',
        },
      ],
    });
    renderScreen();

    await waitFor(() => {
      expect(
        screen.getByTestId('create-document-take-photo'),
      ).toBeOnTheScreen();
    });

    fireEvent.press(screen.getByTestId('create-document-take-photo'));

    await waitFor(() => {
      expect(
        screen.getByTestId('create-document-photo-preview'),
      ).toBeOnTheScreen();
    });

    fireEvent.press(screen.getByTestId('create-document-item-3'));
    fireEvent.press(screen.getByTestId('create-document-submit'));

    await waitFor(() => {
      expect(mockedServices.createDocument.mock.calls[0]?.[0]).toEqual(
        expect.objectContaining({
          image: 'data:image/jpeg;base64,captured-photo',
          image_name: 'hoa-don.jpg',
        }),
      );
    });
  });

  it('only offers photo capture for import receipts', async () => {
    renderScreen('usage');

    await waitFor(() => {
      expect(screen.getByTestId('create-document-item-3')).toBeOnTheScreen();
    });

    expect(
      screen.queryByTestId('create-document-take-photo'),
    ).not.toBeOnTheScreen();
  });

  it('prevents exporting more than the available stock', async () => {
    renderScreen('usage');

    await waitFor(() => {
      expect(screen.getByTestId('create-document-item-4')).toBeOnTheScreen();
    });

    fireEvent.press(screen.getByTestId('create-document-item-4'));
    fireEvent.changeText(screen.getByTestId('create-document-quantity'), '3');
    fireEvent.press(screen.getByTestId('create-document-submit'));

    expect(
      screen.getByText('Không thể xuất quá tồn kho (còn 2 kg)'),
    ).toBeOnTheScreen();
    expect(mockedServices.createDocument).not.toHaveBeenCalled();
  });
});
