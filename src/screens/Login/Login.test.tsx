import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { createMMKV, MMKV } from 'react-native-mmkv';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthServices } from '@/hooks/domain/auth/authService';
import { Paths } from '@/navigation/paths';
import { ThemeProvider } from '@/theme';
import i18n from '@/translations';

import Login from './Login';

jest.mock('@/hooks/domain/auth/authService', () => {
  const actual = jest.requireActual<Record<string, unknown>>(
    '@/hooks/domain/auth/authService',
  );

  return { ...actual, AuthServices: { login: jest.fn() } };
});

const loginMock = jest.mocked(AuthServices.login);

const authenticatedUser = {
  id: 1,
  username: 'emilys',
};

describe('Login screen', () => {
  let storage: MMKV;
  const navigation = { reset: jest.fn() };

  beforeAll(() => {
    storage = createMMKV();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderScreen = () => {
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });

    render(
      <SafeAreaProvider>
        <ThemeProvider storage={storage}>
          <I18nextProvider i18n={i18n}>
            <QueryClientProvider client={queryClient}>
              <Login
                navigation={
                  navigation as unknown as React.ComponentProps<
                    typeof Login
                  >['navigation']
                }
                route={
                  { key: 'login', name: Paths.Login } as React.ComponentProps<
                    typeof Login
                  >['route']
                }
              />
            </QueryClientProvider>
          </I18nextProvider>
        </ThemeProvider>
      </SafeAreaProvider>,
    );
  };

  test('uses keyboard avoidance on Android so the password field stays visible', () => {
    const originalPlatformOs = Platform.OS;
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      get: () => 'android',
    });

    renderScreen();

    const keyboardAvoidingView = screen.UNSAFE_getByType(KeyboardAvoidingView);

    expect(keyboardAvoidingView.props.behavior).toBe('height');

    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      get: () => originalPlatformOs,
    });
  });

  test('shows validation errors when both fields are empty', () => {
    renderScreen();

    fireEvent.changeText(screen.getByTestId('login-username-input'), '');
    fireEvent.changeText(screen.getByTestId('login-password-input'), '');
    fireEvent.press(screen.getByTestId('login-submit-button'));

    expect(screen.getByTestId('login-username-error')).toBeTruthy();
    expect(screen.getByTestId('login-password-error')).toBeTruthy();
    expect(loginMock).not.toHaveBeenCalled();
  });

  test('shows a validation error when the username is too short', () => {
    renderScreen();

    fireEvent.changeText(screen.getByTestId('login-username-input'), 'ab');
    fireEvent.changeText(
      screen.getByTestId('login-password-input'),
      'emilyspass',
    );
    fireEvent.press(screen.getByTestId('login-submit-button'));

    expect(screen.getByTestId('login-username-error')).toBeTruthy();
    expect(loginMock).not.toHaveBeenCalled();
  });

  test('navigates to the example screen on a successful login', async () => {
    loginMock.mockResolvedValue(authenticatedUser);

    renderScreen();

    fireEvent.changeText(screen.getByTestId('login-username-input'), 'emilys');
    fireEvent.changeText(
      screen.getByTestId('login-password-input'),
      'emilyspass',
    );
    fireEvent.press(screen.getByTestId('login-submit-button'));

    await waitFor(() => {
      expect(navigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: Paths.MainTabs }],
      });
    });

    expect(loginMock).toHaveBeenCalledWith({
      password: 'emilyspass',
      username: 'emilys',
    });
  });

  test('shows an error message when the credentials are rejected', async () => {
    const { AuthError, AuthErrorKind } = jest.requireActual<{
      AuthError: new (kind: string) => Error;
      AuthErrorKind: { invalidCredentials: string };
    }>('@/hooks/domain/auth/authService');

    loginMock.mockRejectedValue(
      new AuthError(AuthErrorKind.invalidCredentials),
    );

    renderScreen();

    fireEvent.changeText(screen.getByTestId('login-username-input'), 'emilys');
    fireEvent.changeText(
      screen.getByTestId('login-password-input'),
      'wrongpass',
    );
    fireEvent.press(screen.getByTestId('login-submit-button'));

    await waitFor(() => {
      expect(screen.getByTestId('login-submit-error')).toBeTruthy();
    });

    expect(navigation.reset).not.toHaveBeenCalled();
  });
});
