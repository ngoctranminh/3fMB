import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '@/hooks';
import { AuthError, AuthErrorKind } from '@/hooks/domain/auth/authService';
import {
  MIN_PASSWORD_LENGTH,
  MIN_USERNAME_LENGTH,
} from '@/hooks/domain/auth/schema';
import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { useTheme } from '@/theme';

import { Logo } from '@/components/atoms';
import { SafeScreen } from '@/components/templates';

type FieldErrors = {
  password?: string;
  username?: string;
};

const LOGO_SIZE = 88;

function Login({ navigation }: RootScreenProps<Paths.Login>) {
  const { t } = useTranslation();
  const { colors, components, fonts, gutters, layout } = useTheme();
  const { useLoginMutation } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [focusedField, setFocusedField] = useState<string | undefined>(
    undefined,
  );

  const loginMutation = useLoginMutation();

  const validate = () => {
    const nextErrors: FieldErrors = {};

    if (username.trim().length === 0) {
      nextErrors.username = t('screen_login.validation.username_required');
    } else if (username.trim().length < MIN_USERNAME_LENGTH) {
      nextErrors.username = t('screen_login.validation.username_too_short');
    }

    if (password.length === 0) {
      nextErrors.password = t('screen_login.validation.password_required');
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      nextErrors.password = t('screen_login.validation.password_too_short');
    }

    setFieldErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    loginMutation.reset();

    if (!validate()) {
      return;
    }

    loginMutation.mutate(
      { password, username: username.trim() },
      {
        onSuccess: () => {
          navigation.reset({
            index: 0,
            routes: [{ name: Paths.MainTabs }],
          });
        },
      },
    );
  };

  const submitErrorMessage = () => {
    if (!loginMutation.isError) {
      return undefined;
    }

    const isInvalidCredentials =
      loginMutation.error instanceof AuthError &&
      loginMutation.error.kind === AuthErrorKind.invalidCredentials;

    return isInvalidCredentials
      ? t('screen_login.error.invalid_credentials')
      : t('screen_login.error.network');
  };

  const inputStyle = (field: string, hasError: boolean) => [
    components.textInput,
    focusedField === field ? components.textInputFocused : undefined,
    hasError ? components.textInputError : undefined,
  ];

  const submitError = submitErrorMessage();

  return (
    <SafeScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[layout.flex_1]}
      >
        <ScrollView
          contentContainerStyle={[
            layout.flex_1,
            layout.justifyCenter,
            gutters.paddingHorizontal_32,
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[layout.itemsCenter, gutters.marginBottom_40]}>
            <Logo size={LOGO_SIZE} />
            <Text
              style={[
                fonts.size_32,
                fonts.gray800,
                fonts.bold,
                gutters.marginTop_24,
              ]}
            >
              {t('screen_login.title')}
            </Text>
            <Text
              style={[
                fonts.size_16,
                fonts.gray200,
                fonts.alignCenter,
                gutters.marginTop_12,
              ]}
            >
              {t('screen_login.subtitle')}
            </Text>
          </View>

          <View style={[gutters.gap_16]}>
            <View style={[gutters.gap_12]}>
              <Text style={[fonts.size_16, fonts.gray800]}>
                {t('screen_login.username_label')}
              </Text>
              <TextInput
                autoCapitalize="none"
                autoComplete="username"
                autoCorrect={false}
                editable={!loginMutation.isPending}
                onBlur={() => {
                  setFocusedField(undefined);
                }}
                onChangeText={setUsername}
                onFocus={() => {
                  setFocusedField('username');
                }}
                placeholder={t('screen_login.username_placeholder')}
                placeholderTextColor={colors.gray200}
                returnKeyType="next"
                style={inputStyle('username', Boolean(fieldErrors.username))}
                testID="login-username-input"
                value={username}
              />
              {fieldErrors.username ? (
                <Text
                  style={[fonts.size_12, fonts.red500]}
                  testID="login-username-error"
                >
                  {fieldErrors.username}
                </Text>
              ) : undefined}
            </View>

            <View style={[gutters.gap_12]}>
              <Text style={[fonts.size_16, fonts.gray800]}>
                {t('screen_login.password_label')}
              </Text>
              <TextInput
                autoCapitalize="none"
                autoComplete="current-password"
                autoCorrect={false}
                editable={!loginMutation.isPending}
                onBlur={() => {
                  setFocusedField(undefined);
                }}
                onChangeText={setPassword}
                onFocus={() => {
                  setFocusedField('password');
                }}
                onSubmitEditing={handleSubmit}
                placeholder={t('screen_login.password_placeholder')}
                placeholderTextColor={colors.gray200}
                returnKeyType="go"
                secureTextEntry
                style={inputStyle('password', Boolean(fieldErrors.password))}
                testID="login-password-input"
                value={password}
              />
              {fieldErrors.password ? (
                <Text
                  style={[fonts.size_12, fonts.red500]}
                  testID="login-password-error"
                >
                  {fieldErrors.password}
                </Text>
              ) : undefined}
            </View>

            {submitError ? (
              <Text
                style={[fonts.size_12, fonts.red500, fonts.alignCenter]}
                testID="login-submit-error"
              >
                {submitError}
              </Text>
            ) : undefined}

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={{ disabled: loginMutation.isPending }}
              disabled={loginMutation.isPending}
              onPress={handleSubmit}
              style={[
                components.buttonPrimary,
                gutters.marginTop_16,
                loginMutation.isPending
                  ? components.buttonPrimaryDisabled
                  : undefined,
              ]}
              testID="login-submit-button"
            >
              {loginMutation.isPending ? (
                <ActivityIndicator
                  color={components.buttonPrimaryLabel.color}
                  testID="login-loading-indicator"
                />
              ) : (
                <Text style={[components.buttonPrimaryLabel]}>
                  {t('screen_login.submit')}
                </Text>
              )}
            </TouchableOpacity>

            <Text
              style={[
                fonts.size_12,
                fonts.gray200,
                fonts.alignCenter,
                gutters.marginTop_16,
              ]}
            >
              {t('screen_login.hint')}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

export default Login;
