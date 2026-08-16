import { fireEvent, render, screen } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { createMMKV } from 'react-native-mmkv';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { ThemeProvider } from '@/theme';
import i18n from '@/translations';

import PurchaseGuide from './PurchaseGuide';
import {
  loadPurchaseChecklist,
  purchaseGuideStorage,
  savePurchaseChecklist,
} from './purchaseGuideStorage';

const renderScreen = () => {
  const props = {
    navigation: { goBack: jest.fn() },
    route: { key: 'purchase-guide-test', name: Paths.PurchaseGuide },
  } as unknown as RootScreenProps<Paths.PurchaseGuide>;

  return render(
    <SafeAreaProvider>
      <ThemeProvider storage={createMMKV()}>
        <I18nextProvider i18n={i18n}>
          <PurchaseGuide {...props} />
        </I18nextProvider>
      </ThemeProvider>
    </SafeAreaProvider>,
  );
};

describe('PurchaseGuide screen', () => {
  beforeEach(() => {
    purchaseGuideStorage.clearAll();
  });

  it('searches and checks an item from the buying guide', () => {
    renderScreen();

    fireEvent.changeText(
      screen.getByTestId('purchase-guide-screen-search'),
      'binh ga',
    );

    expect(screen.getByText('Bình ga')).toBeOnTheScreen();
    expect(
      screen.queryByText('Salad — trung bình 2 cục/ngày'),
    ).not.toBeOnTheScreen();

    fireEvent.press(
      screen.getByTestId('purchase-guide-screen-item-upstairs-44'),
    );
    expect(screen.getByText(/^1\/\d+ đã hoàn thành$/)).toBeOnTheScreen();
  });

  it('restores checked items when the screen is opened again the same day', () => {
    const { unmount } = renderScreen();

    fireEvent.press(screen.getByTestId('purchase-guide-screen-item-fresh-0'));
    unmount();
    renderScreen();

    expect(screen.getByTestId('purchase-guide-screen-item-fresh-0')).toHaveProp(
      'accessibilityState',
      { checked: true },
    );
    expect(screen.getByText(/^1\/\d+ đã hoàn thành$/)).toBeOnTheScreen();
  });

  it('starts a new checklist on the next local day', () => {
    const firstDay = new Date('2026-08-14T23:00:00');
    const nextDay = new Date('2026-08-15T01:00:00');

    savePurchaseChecklist(['fresh-0'], firstDay);

    expect(loadPurchaseChecklist(firstDay)).toEqual(['fresh-0']);
    expect(loadPurchaseChecklist(nextDay)).toEqual([]);
  });
});
