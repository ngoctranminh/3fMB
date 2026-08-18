import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '@/hooks';
import { AuthError, AuthErrorKind } from '@/hooks/domain/auth/authService';
import { MIN_PASSWORD_LENGTH } from '@/hooks/domain/auth/schema';
import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { useTheme } from '@/theme';

import { Card, IconByVariant } from '@/components/atoms';
import { FormField } from '@/components/molecules';
import { SafeScreen } from '@/components/templates';

type FieldErrors = {
  confirmPassword?: string;
  currentPassword?: string;
  newPassword?: string;
};

const ICON_SIZE = 24;

function ChangePassword({ navigation }: RootScreenProps<Paths.ChangePassword>) {
  const { t } = useTranslation();
  const { useChangePasswordMutation } = useAuth();
  const { backgrounds, colors, components, fonts, gutters, layout } =
    useTheme();

  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] =
    useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const changePasswordMutation = useChangePasswordMutation();

  const validate = () => {
    const errors: FieldErrors = {};

    if (currentPassword.length === 0) {
      errors.currentPassword = t(
        'screen_change_password.validation.current_required',
      );
    }

    if (newPassword.length === 0) {
      errors.newPassword = t('screen_change_password.validation.new_required');
    } else if (newPassword.length < MIN_PASSWORD_LENGTH) {
      errors.newPassword = t('screen_change_password.validation.new_too_short');
    } else if (newPassword === currentPassword) {
      errors.newPassword = t(
        'screen_change_password.validation.new_must_differ',
      );
    }

    if (confirmPassword.length === 0) {
      errors.confirmPassword = t(
        'screen_change_password.validation.confirm_required',
      );
    } else if (confirmPassword !== newPassword) {
      errors.confirmPassword = t(
        'screen_change_password.validation.confirm_mismatch',
      );
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    changePasswordMutation.reset();
    setIsSuccessful(false);

    if (!validate()) return;

    changePasswordMutation.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setConfirmPassword('');
          setCurrentPassword('');
          setFieldErrors({});
          setIsSuccessful(true);
          setNewPassword('');
        },
      },
    );
  };

  const handleFieldChange = (
    setter: (value: string) => void,
    value: string,
  ) => {
    setter(value);
    setIsSuccessful(false);
  };

  const submitErrorMessage = () => {
    if (!changePasswordMutation.isError) return undefined;

    const isInvalidCurrentPassword =
      changePasswordMutation.error instanceof AuthError &&
      changePasswordMutation.error.kind ===
        AuthErrorKind.invalidCurrentPassword;

    return isInvalidCurrentPassword
      ? t('screen_change_password.error.invalid_current')
      : t('screen_change_password.error.network');
  };

  const submitError = submitErrorMessage();

  return (
    <SafeScreen edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[layout.flex_1, backgrounds.surfaceSunken]}
      >
        <ScrollView
          contentContainerStyle={[
            gutters.gap_16,
            gutters.padding_16,
            gutters.paddingBottom_40,
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[layout.row, layout.itemsCenter, gutters.gap_12]}>
            <TouchableOpacity
              accessibilityLabel={t('screen_change_password.back')}
              accessibilityRole="button"
              onPress={() => {
                navigation.goBack();
              }}
              testID="change-password-back"
            >
              <IconByVariant
                height={ICON_SIZE}
                path="chevron-left"
                stroke={colors.gray800}
                width={ICON_SIZE}
              />
            </TouchableOpacity>
            <Text
              style={[layout.flex_1, fonts.size_20, fonts.gray800, fonts.bold]}
            >
              {t('screen_change_password.title')}
            </Text>
          </View>

          <Text style={[fonts.size_14, fonts.gray200]}>
            {t('screen_change_password.subtitle')}
          </Text>

          <Card style={[gutters.gap_16]}>
            <FormField
              autoCapitalize="none"
              autoComplete="current-password"
              autoCorrect={false}
              editable={!changePasswordMutation.isPending}
              error={fieldErrors.currentPassword}
              label={t('screen_change_password.current_label')}
              onChangeText={(value) => {
                handleFieldChange(setCurrentPassword, value);
              }}
              placeholder={t('screen_change_password.current_placeholder')}
              rightAccessory={
                <TouchableOpacity
                  accessibilityLabel={t(
                    isCurrentPasswordVisible
                      ? 'screen_change_password.hide_password'
                      : 'screen_change_password.show_password',
                  )}
                  accessibilityRole="button"
                  disabled={changePasswordMutation.isPending}
                  hitSlop={8}
                  onPress={() => {
                    setIsCurrentPasswordVisible((previous) => !previous);
                  }}
                  testID="change-password-current-visibility"
                >
                  <IconByVariant
                    height={ICON_SIZE}
                    path={isCurrentPasswordVisible ? 'eye-slash' : 'eye'}
                    stroke={colors.gray400}
                    width={ICON_SIZE}
                  />
                </TouchableOpacity>
              }
              secureTextEntry={!isCurrentPasswordVisible}
              testID="change-password-current-input"
              value={currentPassword}
            />

            <FormField
              autoCapitalize="none"
              autoComplete="new-password"
              autoCorrect={false}
              editable={!changePasswordMutation.isPending}
              error={fieldErrors.newPassword}
              label={t('screen_change_password.new_label')}
              onChangeText={(value) => {
                handleFieldChange(setNewPassword, value);
              }}
              placeholder={t('screen_change_password.new_placeholder')}
              rightAccessory={
                <TouchableOpacity
                  accessibilityLabel={t(
                    isNewPasswordVisible
                      ? 'screen_change_password.hide_password'
                      : 'screen_change_password.show_password',
                  )}
                  accessibilityRole="button"
                  disabled={changePasswordMutation.isPending}
                  hitSlop={8}
                  onPress={() => {
                    setIsNewPasswordVisible((previous) => !previous);
                  }}
                  testID="change-password-new-visibility"
                >
                  <IconByVariant
                    height={ICON_SIZE}
                    path={isNewPasswordVisible ? 'eye-slash' : 'eye'}
                    stroke={colors.gray400}
                    width={ICON_SIZE}
                  />
                </TouchableOpacity>
              }
              secureTextEntry={!isNewPasswordVisible}
              testID="change-password-new-input"
              value={newPassword}
            />

            <FormField
              autoCapitalize="none"
              autoComplete="new-password"
              autoCorrect={false}
              editable={!changePasswordMutation.isPending}
              error={fieldErrors.confirmPassword}
              label={t('screen_change_password.confirm_label')}
              onChangeText={(value) => {
                handleFieldChange(setConfirmPassword, value);
              }}
              onSubmitEditing={handleSubmit}
              placeholder={t('screen_change_password.confirm_placeholder')}
              returnKeyType="done"
              rightAccessory={
                <TouchableOpacity
                  accessibilityLabel={t(
                    isConfirmPasswordVisible
                      ? 'screen_change_password.hide_password'
                      : 'screen_change_password.show_password',
                  )}
                  accessibilityRole="button"
                  disabled={changePasswordMutation.isPending}
                  hitSlop={8}
                  onPress={() => {
                    setIsConfirmPasswordVisible((previous) => !previous);
                  }}
                  testID="change-password-confirm-visibility"
                >
                  <IconByVariant
                    height={ICON_SIZE}
                    path={isConfirmPasswordVisible ? 'eye-slash' : 'eye'}
                    stroke={colors.gray400}
                    width={ICON_SIZE}
                  />
                </TouchableOpacity>
              }
              secureTextEntry={!isConfirmPasswordVisible}
              testID="change-password-confirm-input"
              value={confirmPassword}
            />

            {submitError ? (
              <Text
                accessibilityLiveRegion="polite"
                style={[fonts.size_12, fonts.red500, fonts.alignCenter]}
                testID="change-password-submit-error"
              >
                {submitError}
              </Text>
            ) : undefined}

            {isSuccessful ? (
              <Text
                accessibilityLiveRegion="polite"
                style={[fonts.size_12, fonts.green500, fonts.alignCenter]}
                testID="change-password-success"
              >
                {t('screen_change_password.success')}
              </Text>
            ) : undefined}

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={{
                disabled: changePasswordMutation.isPending,
              }}
              disabled={changePasswordMutation.isPending}
              onPress={handleSubmit}
              style={[
                components.buttonPrimary,
                changePasswordMutation.isPending
                  ? components.buttonPrimaryDisabled
                  : undefined,
              ]}
              testID="change-password-submit-button"
            >
              {changePasswordMutation.isPending ? (
                <ActivityIndicator
                  color={components.buttonPrimaryLabel.color}
                  testID="change-password-loading-indicator"
                />
              ) : (
                <Text style={[components.buttonPrimaryLabel]}>
                  {t('screen_change_password.submit')}
                </Text>
              )}
            </TouchableOpacity>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

export default ChangePassword;
