import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { createMMKV } from 'react-native-mmkv';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthServices } from '@/hooks/domain/auth/authService';
import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { ThemeProvider } from '@/theme';
import i18n from '@/translations';

import ChangePassword from './ChangePassword';

jest.mock('@/hooks/domain/auth/authService', () => {
  const actual = jest.requireActual<Record<string, unknown>>(
    '@/hooks/domain/auth/authService',
  );

  return {
    ...actual,
    AuthServices: { changePassword: jest.fn() },
  };
});

const changePasswordMock = jest.mocked(AuthServices.changePassword);

describe('ChangePassword screen', () => {
  const navigation = { goBack: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderScreen = () => {
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const props = {
      navigation,
      route: { key: 'change-password-test', name: Paths.ChangePassword },
    } as unknown as RootScreenProps<Paths.ChangePassword>;

    render(
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider storage={createMMKV()}>
            <I18nextProvider i18n={i18n}>
              <ChangePassword {...props} />
            </I18nextProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>,
    );
  };

  it('validates all required password fields', () => {
    renderScreen();

    fireEvent.press(screen.getByTestId('change-password-submit-button'));

    expect(
      screen.getByText('Vui lòng nhập mật khẩu hiện tại'),
    ).toBeOnTheScreen();
    expect(screen.getByText('Vui lòng nhập mật khẩu mới')).toBeOnTheScreen();
    expect(
      screen.getByText('Vui lòng xác nhận mật khẩu mới'),
    ).toBeOnTheScreen();
    expect(changePasswordMock).not.toHaveBeenCalled();
  });

  it('rejects a confirmation that does not match the new password', () => {
    renderScreen();

    fireEvent.changeText(
      screen.getByTestId('change-password-current-input'),
      'old-password',
    );
    fireEvent.changeText(
      screen.getByTestId('change-password-new-input'),
      'new-password',
    );
    fireEvent.changeText(
      screen.getByTestId('change-password-confirm-input'),
      'different-password',
    );
    fireEvent.press(screen.getByTestId('change-password-submit-button'));

    expect(screen.getByText('Mật khẩu xác nhận không khớp')).toBeOnTheScreen();
    expect(changePasswordMock).not.toHaveBeenCalled();
  });

  it('shows and hides each password independently', () => {
    renderScreen();

    const currentInput = screen.getByTestId('change-password-current-input');
    const newInput = screen.getByTestId('change-password-new-input');
    const confirmInput = screen.getByTestId('change-password-confirm-input');

    expect(currentInput).toHaveProp('secureTextEntry', true);
    expect(newInput).toHaveProp('secureTextEntry', true);
    expect(confirmInput).toHaveProp('secureTextEntry', true);

    fireEvent.press(screen.getByTestId('change-password-current-visibility'));
    expect(currentInput).toHaveProp('secureTextEntry', false);
    expect(newInput).toHaveProp('secureTextEntry', true);

    fireEvent.press(screen.getByTestId('change-password-new-visibility'));
    fireEvent.press(screen.getByTestId('change-password-confirm-visibility'));
    expect(newInput).toHaveProp('secureTextEntry', false);
    expect(confirmInput).toHaveProp('secureTextEntry', false);

    fireEvent.press(screen.getByTestId('change-password-current-visibility'));
    expect(currentInput).toHaveProp('secureTextEntry', true);
  });

  it('submits valid passwords and clears the form after success', async () => {
    changePasswordMock.mockResolvedValue(undefined);
    renderScreen();

    fireEvent.changeText(
      screen.getByTestId('change-password-current-input'),
      'old-password',
    );
    fireEvent.changeText(
      screen.getByTestId('change-password-new-input'),
      'new-password',
    );
    fireEvent.changeText(
      screen.getByTestId('change-password-confirm-input'),
      'new-password',
    );
    fireEvent.press(screen.getByTestId('change-password-submit-button'));

    await waitFor(() => {
      expect(screen.getByTestId('change-password-success')).toBeOnTheScreen();
    });

    expect(changePasswordMock).toHaveBeenCalledWith({
      currentPassword: 'old-password',
      newPassword: 'new-password',
    });
    expect(screen.getByTestId('change-password-current-input')).toHaveProp(
      'value',
      '',
    );
    expect(screen.getByTestId('change-password-new-input')).toHaveProp(
      'value',
      '',
    );
  });

  it('shows a specific error for an incorrect current password', async () => {
    const { AuthError, AuthErrorKind } = jest.requireActual<{
      AuthError: new (kind: string) => Error;
      AuthErrorKind: { invalidCurrentPassword: string };
    }>('@/hooks/domain/auth/authService');

    changePasswordMock.mockRejectedValue(
      new AuthError(AuthErrorKind.invalidCurrentPassword),
    );
    renderScreen();

    fireEvent.changeText(
      screen.getByTestId('change-password-current-input'),
      'wrong-password',
    );
    fireEvent.changeText(
      screen.getByTestId('change-password-new-input'),
      'new-password',
    );
    fireEvent.changeText(
      screen.getByTestId('change-password-confirm-input'),
      'new-password',
    );
    fireEvent.press(screen.getByTestId('change-password-submit-button'));

    await waitFor(() => {
      expect(
        screen.getByTestId('change-password-submit-error'),
      ).toHaveTextContent('Mật khẩu hiện tại không đúng.');
    });
  });
});
