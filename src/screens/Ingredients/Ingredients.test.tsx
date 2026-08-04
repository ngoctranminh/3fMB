import { fireEvent, render, screen } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { createMMKV, MMKV } from 'react-native-mmkv';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider } from '@/theme';
import i18n from '@/translations';

import Ingredients from './Ingredients';

describe('Ingredients screen', () => {
  let storage: MMKV;

  beforeAll(() => {
    storage = createMMKV();
  });

  const renderScreen = () => {
    render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { height: 812, width: 375, x: 0, y: 0 },
          insets: { bottom: 34, left: 0, right: 0, top: 44 },
        }}
      >
        <ThemeProvider storage={storage}>
          <I18nextProvider i18n={i18n}>
            <Ingredients />
          </I18nextProvider>
        </ThemeProvider>
      </SafeAreaProvider>,
    );
  };

  it('renders the header, summary and ingredient list', () => {
    renderScreen();

    expect(screen.getByText('Nguyên liệu')).toBeOnTheScreen();
    expect(screen.getByText('Kho Quán Ăn')).toBeOnTheScreen();

    expect(screen.getByTestId('ingredients-summary')).toBeOnTheScreen();
    expect(screen.getByText('128')).toBeOnTheScreen();
    expect(screen.getByText('45.250.000đ')).toBeOnTheScreen();

    expect(screen.getByText('Thịt bò')).toBeOnTheScreen();
    expect(screen.getByText('Gạo tấm thơm')).toBeOnTheScreen();
    expect(screen.getByText('Thêm nguyên liệu')).toBeOnTheScreen();
  });

  it('filters the list by category', () => {
    renderScreen();

    fireEvent.press(screen.getByTestId('category-starch'));

    expect(screen.getByText('Gạo tấm thơm')).toBeOnTheScreen();
    expect(screen.queryByText('Thịt bò')).not.toBeOnTheScreen();
  });

  it('filters the list by the search query', () => {
    renderScreen();

    fireEvent.changeText(screen.getByTestId('inventory-search-input'), 'tỏi');

    expect(screen.getByText('Tỏi')).toBeOnTheScreen();
    expect(screen.queryByText('Sữa tươi')).not.toBeOnTheScreen();
  });

  it('shows the empty state when nothing matches', () => {
    renderScreen();

    fireEvent.changeText(
      screen.getByTestId('inventory-search-input'),
      'khong-co-gi',
    );

    expect(
      screen.getByText('Không tìm thấy nguyên liệu nào'),
    ).toBeOnTheScreen();
  });
});
