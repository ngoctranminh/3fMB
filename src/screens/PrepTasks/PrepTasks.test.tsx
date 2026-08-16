import { fireEvent, render, screen } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { createMMKV } from 'react-native-mmkv';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { ThemeProvider } from '@/theme';
import i18n from '@/translations';

import PrepTasks from './PrepTasks';
import {
  loadPrepTasks,
  prepTasksStorage,
  savePrepTasks,
} from './prepTasksStorage';

const renderScreen = () => {
  const goBack = jest.fn();
  const props = {
    navigation: { goBack },
    route: { key: 'prep-tasks-test', name: Paths.PrepTasks },
  } as unknown as RootScreenProps<Paths.PrepTasks>;

  const { unmount } = render(
    <SafeAreaProvider>
      <ThemeProvider storage={createMMKV()}>
        <I18nextProvider i18n={i18n}>
          <PrepTasks {...props} />
        </I18nextProvider>
      </ThemeProvider>
    </SafeAreaProvider>,
  );

  return { goBack, unmount };
};

describe('PrepTasks screen', () => {
  beforeEach(() => {
    prepTasksStorage.clearAll();
  });

  it('filters tasks and tracks completed work', () => {
    renderScreen();

    fireEvent.press(screen.getByTestId('prep-tasks-screen-filter-hot-kitchen'));

    expect(screen.getByText('Gà xào')).toBeOnTheScreen();
    expect(screen.queryByText('Mổ cá')).not.toBeOnTheScreen();

    fireEvent.press(screen.getByTestId('prep-tasks-screen-item-hot-kitchen-0'));
    expect(screen.getByText(/^1\/\d+ đã hoàn thành$/)).toBeOnTheScreen();
  });

  it('returns to the previous screen', () => {
    const { goBack } = renderScreen();

    fireEvent.press(screen.getByTestId('prep-tasks-screen-back'));
    expect(goBack).toHaveBeenCalled();
  });

  it('restores completed tasks when opened again the same day', () => {
    const { unmount } = renderScreen();

    fireEvent.press(screen.getByTestId('prep-tasks-screen-item-sushi-0'));
    unmount();
    renderScreen();

    expect(screen.getByTestId('prep-tasks-screen-item-sushi-0')).toHaveProp(
      'accessibilityState',
      { checked: true },
    );
    expect(screen.getByText(/^1\/\d+ đã hoàn thành$/)).toBeOnTheScreen();
  });

  it('starts a new prep checklist on the next local day', () => {
    const firstDay = new Date('2026-08-14T23:00:00');
    const nextDay = new Date('2026-08-15T01:00:00');

    savePrepTasks(['sushi-0'], firstDay);

    expect(loadPrepTasks(firstDay)).toEqual(['sushi-0']);
    expect(loadPrepTasks(nextDay)).toEqual([]);
  });
});
