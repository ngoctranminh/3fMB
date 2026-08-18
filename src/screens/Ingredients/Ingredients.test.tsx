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

import Ingredients from './Ingredients';

jest.mock('@/hooks/domain/inventory/inventoryService', () => ({
  InventoryServices: {
    fetchIngredients: jest.fn(),
    fetchSummary: jest.fn(),
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

const INGREDIENTS = {
  groups: ['Đông lạnh', 'Rau củ quả'],
  items: [
    {
      fullName: 'Đông lạnh / Mực / Chưa làm',
      group: 'Đông lạnh',
      id: '3',
      isLow: false,
      name: 'Mực chưa làm',
      quantity: '6',
      status: 'ok' as const,
      unit: 'kg',
      value: '1.080.000 Kč',
    },
    {
      fullName: 'Rau củ quả / Hành lá',
      group: 'Rau củ quả',
      id: '40',
      isLow: true,
      name: 'Hành lá',
      quantity: '0.5',
      status: 'low' as const,
      unit: 'kg',
      value: '15.000 Kč',
    },
  ],
};

describe('Ingredients screen', () => {
  let storage: MMKV;

  beforeAll(() => {
    storage = createMMKV();
  });

  beforeEach(() => {
    mockedServices.fetchIngredients.mockResolvedValue(INGREDIENTS);
    mockedServices.fetchSummary.mockResolvedValue(SUMMARY);
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
              <Ingredients {...createTabScreenProps(Paths.Ingredients).props} />
            </I18nextProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>,
    );
  };

  it('renders the header, summary and ingredient list', async () => {
    renderScreen();

    expect(screen.getByText('Nguyên liệu')).toBeOnTheScreen();
    expect(screen.getByText('Kho Quán Ăn')).toBeOnTheScreen();

    await waitFor(() => {
      expect(screen.getByText('66')).toBeOnTheScreen();
    });

    expect(screen.getByTestId('ingredients-summary')).toBeOnTheScreen();
    expect(screen.getByText('34.449.500 Kč')).toBeOnTheScreen();

    expect(screen.getByText('Mực chưa làm')).toBeOnTheScreen();
    expect(screen.getByText('Hành lá')).toBeOnTheScreen();
    expect(screen.getByText('Thêm nguyên liệu')).toBeOnTheScreen();
  });

  it('filters the list by tree root group', async () => {
    renderScreen();

    await waitFor(() => {
      expect(screen.getByTestId('category-Rau củ quả')).toBeOnTheScreen();
    });

    fireEvent.press(screen.getByTestId('category-Rau củ quả'));

    expect(screen.getByText('Hành lá')).toBeOnTheScreen();
    expect(screen.queryByText('Mực chưa làm')).not.toBeOnTheScreen();
  });

  it('filters the list by the search query', async () => {
    renderScreen();

    await waitFor(() => {
      expect(screen.getByText('Hành lá')).toBeOnTheScreen();
    });

    fireEvent.changeText(screen.getByTestId('inventory-search-input'), 'hành');

    expect(screen.getByText('Hành lá')).toBeOnTheScreen();
    expect(screen.queryByText('Mực chưa làm')).not.toBeOnTheScreen();
  });

  it('shows the empty state when nothing matches', async () => {
    renderScreen();

    await waitFor(() => {
      expect(screen.getByText('Hành lá')).toBeOnTheScreen();
    });

    fireEvent.changeText(
      screen.getByTestId('inventory-search-input'),
      'khong-co-gi',
    );

    expect(
      screen.getByText('Không tìm thấy nguyên liệu nào'),
    ).toBeOnTheScreen();
  });

  it('opens the add ingredient form', () => {
    const navigation = createTabScreenProps(Paths.Ingredients);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider storage={storage}>
            <I18nextProvider i18n={i18n}>
              <Ingredients {...navigation.props} />
            </I18nextProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>,
    );

    fireEvent.press(screen.getByTestId('ingredients-add'));
    expect(navigation.navigate).toHaveBeenCalledWith(Paths.AddIngredient);
  });
});
