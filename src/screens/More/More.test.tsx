import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { createMMKV } from 'react-native-mmkv';

import { AuthServices } from '@/hooks/domain/auth/authService';
import { Paths } from '@/navigation/paths';
import type { MainTabScreenProps } from '@/navigation/types';
import { ThemeProvider } from '@/theme';
import i18n from '@/translations';

import More from './More';

jest.mock('@/hooks/domain/auth/authService', () => ({
  AuthServices: {
    getCurrentUser: jest.fn(),
    logout: jest.fn(),
  },
}));

const mockedServices = jest.mocked(AuthServices);

describe('More screen', () => {
  beforeEach(() => {
    mockedServices.getCurrentUser.mockResolvedValue({
      id: 1,
      username: 'manhtu3f',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls the logout API before returning to login', async () => {
    mockedServices.logout.mockResolvedValue(undefined);
    const reset = jest.fn();
    const props = {
      navigation: { getParent: () => ({ reset }) },
      route: { key: 'more-test', name: Paths.More },
    } as unknown as MainTabScreenProps<Paths.More>;
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider storage={createMMKV()}>
          <I18nextProvider i18n={i18n}>
            <More {...props} />
          </I18nextProvider>
        </ThemeProvider>
      </QueryClientProvider>,
    );

    fireEvent.press(screen.getByTestId('more-logout'));

    await waitFor(() => {
      expect(mockedServices.logout).toHaveBeenCalled();
      expect(reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: Paths.Login }],
      });
    });
  });

  it('opens all operation handbook pages for a sauce viewer', async () => {
    const navigate = jest.fn();
    const props = {
      navigation: { navigate },
      route: { key: 'more-test', name: Paths.More },
    } as unknown as MainTabScreenProps<Paths.More>;
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider storage={createMMKV()}>
          <I18nextProvider i18n={i18n}>
            <More {...props} />
          </I18nextProvider>
        </ThemeProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('more-sauces')).toBeOnTheScreen();
    });

    fireEvent.press(screen.getByTestId('more-sauces'));
    expect(navigate).toHaveBeenCalledWith(Paths.Sauces);

    fireEvent.press(screen.getByTestId('more-purchase-guide'));
    expect(navigate).toHaveBeenCalledWith(Paths.PurchaseGuide);

    fireEvent.press(screen.getByTestId('more-prep-tasks'));
    expect(navigate).toHaveBeenCalledWith(Paths.PrepTasks);
  });

  it('hides sauce recipes from other users', async () => {
    mockedServices.getCurrentUser.mockResolvedValue({
      id: 4,
      username: 'other3f',
    });
    const props = {
      navigation: { navigate: jest.fn() },
      route: { key: 'more-test', name: Paths.More },
    } as unknown as MainTabScreenProps<Paths.More>;
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider storage={createMMKV()}>
          <I18nextProvider i18n={i18n}>
            <More {...props} />
          </I18nextProvider>
        </ThemeProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(mockedServices.getCurrentUser).toHaveBeenCalled();
    });
    expect(screen.queryByTestId('more-sauces')).not.toBeOnTheScreen();
    expect(screen.getByTestId('more-purchase-guide')).toBeOnTheScreen();
  });

  it('opens the change password page from settings', () => {
    const navigate = jest.fn();
    const props = {
      navigation: { navigate },
      route: { key: 'more-test', name: Paths.More },
    } as unknown as MainTabScreenProps<Paths.More>;
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider storage={createMMKV()}>
          <I18nextProvider i18n={i18n}>
            <More {...props} />
          </I18nextProvider>
        </ThemeProvider>
      </QueryClientProvider>,
    );

    fireEvent.press(screen.getByTestId('more-change-password'));

    expect(navigate).toHaveBeenCalledWith(Paths.ChangePassword);
  });
});
