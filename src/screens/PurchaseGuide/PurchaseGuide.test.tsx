import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { createMMKV } from 'react-native-mmkv';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { ThemeProvider } from '@/theme';
import i18n from '@/translations';

import { captureReference } from '@/services/viewCapture';

import PurchaseGuide from './PurchaseGuide';
import {
  loadPurchaseChecklist,
  loadUrgentPurchaseItems,
  purchaseGuideStorage,
  savePurchaseChecklist,
  saveUrgentPurchaseItems,
  urgentPurchaseGuideStorage,
} from './purchaseGuideStorage';

jest.mock('react-native-view-shot', () => ({
  captureRef: jest.fn(),
}));

const cameraRollMock = jest.mocked(CameraRoll);
const captureReferenceMock = jest.mocked(captureReference);
const COMPACT_ITEM_COUNT = 12;

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
    urgentPurchaseGuideStorage.clearAll();
    captureReferenceMock.mockResolvedValue('file:///tmp/giay-mua-hang.png');
    cameraRollMock.saveAsset.mockResolvedValue({} as never);
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
    saveUrgentPurchaseItems(['fresh-0'], firstDay);

    expect(loadPurchaseChecklist(firstDay)).toEqual(['fresh-0']);
    expect(loadPurchaseChecklist(nextDay)).toEqual([]);
    expect(loadUrgentPurchaseItems(firstDay)).toEqual(['fresh-0']);
    expect(loadUrgentPurchaseItems(nextDay)).toEqual([]);
  });

  it('marks an item as urgent and shows its priority in the exported image', async () => {
    renderScreen();

    fireEvent.press(screen.getByTestId('purchase-guide-screen-item-fresh-0'));
    const priorityAction = screen.getByTestId(
      'purchase-guide-screen-priority-fresh-0',
    );
    expect(priorityAction).toHaveProp('accessibilityState', { selected: false });

    fireEvent.press(priorityAction);
    expect(priorityAction).toHaveProp('accessibilityState', { selected: true });

    await waitFor(() => {
      expect(loadUrgentPurchaseItems()).toEqual(['fresh-0']);
    });

    fireEvent.press(screen.getByTestId('purchase-guide-export'));
    expect(screen.getByText('1 mặt hàng cần gấp / đã hết')).toBeOnTheScreen();
  });

  it('previews and saves checked items as an image', async () => {
    renderScreen();

    fireEvent.press(screen.getByTestId('purchase-guide-screen-item-fresh-0'));
    fireEvent.press(screen.getByTestId('purchase-guide-export'));

    expect(screen.getByText('GIẤY MUA HÀNG')).toBeOnTheScreen();
    expect(screen.getAllByText('Salad — trung bình 2 cục/ngày')).toHaveLength(
      2,
    );
    expect(screen.getByText(/Ngày tạo:/)).toBeOnTheScreen();

    fireEvent.press(screen.getByTestId('purchase-guide-export-save'));

    await waitFor(() => {
      expect(captureReferenceMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          format: 'png',
          snapshotContentContainer: true,
        }),
      );
      expect(cameraRollMock.saveAsset).toHaveBeenCalledWith(
        'file:///tmp/giay-mua-hang.png',
        { type: 'photo' },
      );
    });
  });

  it('keeps the export action fixed outside the scrolling content', () => {
    renderScreen();

    expect(
      within(screen.getByTestId('purchase-guide-screen-scroll')).queryByTestId(
        'purchase-guide-export',
      ),
    ).not.toBeOnTheScreen();
    expect(
      within(
        screen.getByTestId('purchase-guide-screen-selection-action'),
      ).getByTestId('purchase-guide-export'),
    ).toBeOnTheScreen();
  });

  it('uses two compact columns when many items are exported', () => {
    renderScreen();

    for (let itemIndex = 0; itemIndex < COMPACT_ITEM_COUNT; itemIndex += 1) {
      fireEvent.press(
        screen.getByTestId(`purchase-guide-screen-item-fresh-${itemIndex}`),
      );
    }
    fireEvent.press(screen.getByTestId('purchase-guide-export'));

    expect(screen.getByTestId('purchase-guide-export-group-fresh')).toHaveStyle(
      { flexDirection: 'row', flexWrap: 'wrap' },
    );
    expect(
      screen.getByTestId('purchase-guide-export-item-fresh-0'),
    ).toHaveStyle({ paddingVertical: 7, width: '48%' });
  });
});
