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

import AddIngredient from './AddIngredient';

jest.mock('@/hooks/domain/inventory/inventoryService', () => ({
  InventoryServices: {
    createItem: jest.fn(),
    fetchInventoryCatalog: jest.fn(),
  },
}));

const mockedServices = jest.mocked(InventoryServices);

describe('AddIngredient screen', () => {
  let storage: MMKV;

  beforeAll(() => {
    storage = createMMKV();
  });

  beforeEach(() => {
    mockedServices.fetchInventoryCatalog.mockResolvedValue({
      groups: [{ id: '1', name: 'Đông lạnh' }],
      items: [],
    });
    mockedServices.createItem.mockResolvedValue({
      // Server responses use null for an item without an expiry date.
      // eslint-disable-next-line unicorn/no-null
      expires_at: null,
      id: 99,
      min_quantity: 2,
      name: 'Cá hồi',
      parent_id: 1,
      quantity: 5,
      translations: {},
      unit: 'kg',
      unit_price: 200_000,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates an ingredient and opens its detail', async () => {
    const replace = jest.fn();
    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
        queries: { retry: false },
      },
    });
    const props = {
      navigation: { goBack: jest.fn(), replace },
      route: { key: 'add-ingredient-test', name: Paths.AddIngredient },
    } as unknown as RootScreenProps<Paths.AddIngredient>;

    render(
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider storage={storage}>
            <I18nextProvider i18n={i18n}>
              <AddIngredient {...props} />
            </I18nextProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('add-ingredient-group-1')).toBeOnTheScreen();
    });

    fireEvent.press(screen.getByTestId('add-ingredient-group-1'));
    fireEvent.changeText(screen.getByTestId('add-ingredient-name'), 'Cá hồi');
    fireEvent.changeText(screen.getByTestId('add-ingredient-quantity'), '5');
    fireEvent.changeText(
      screen.getByTestId('add-ingredient-unit-price'),
      '200000',
    );
    fireEvent.changeText(
      screen.getByTestId('add-ingredient-min-quantity'),
      '2',
    );
    fireEvent.changeText(
      screen.getByTestId('add-ingredient-name-en'),
      'Salmon',
    );
    fireEvent.changeText(screen.getByTestId('add-ingredient-name-cs'), 'Losos');
    fireEvent.press(screen.getByTestId('add-ingredient-submit'));

    await waitFor(() => {
      expect(mockedServices.createItem.mock.calls[0]?.[0]).toEqual(
        expect.objectContaining({
          min_quantity: 2,
          name: 'Cá hồi',
          parent_id: 1,
          quantity: 5,
          translations: {
            'cs-CZ': { name: 'Losos', note: '' },
            'en-US': { name: 'Salmon', note: '' },
          },
          unit: 'kg',
          unit_price: 200_000,
        }),
      );
      expect(replace).toHaveBeenCalledWith(Paths.ItemDetail, { itemId: '99' });
    });
  });
});
