import type { NavigationProp } from '@react-navigation/native';

import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';

import { useAuth, useI18n } from '@/hooks';
import { Paths } from '@/navigation/paths';
import type { MainTabScreenProps } from '@/navigation/types';
import type { RootStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme';

import { Card, IconByVariant } from '@/components/atoms';
import { SafeScreen } from '@/components/templates';

const ICON_SIZE = 22;

function More({ navigation }: MainTabScreenProps<Paths.More>) {
  const { t } = useTranslation();
  const { useLogoutMutation } = useAuth();
  const { toggleLanguage } = useI18n();
  const { backgrounds, changeTheme, colors, fonts, gutters, layout, variant } =
    useTheme();
  const logoutMutation = useLogoutMutation();

  const handleLogout = () => {
    logoutMutation.reset();
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigation
          .getParent<NavigationProp<RootStackParamList>>()
          .reset({ index: 0, routes: [{ name: Paths.Login }] });
      },
    });
  };

  const actions = [
    {
      disabled: false,
      handlePress: () => {
        changeTheme(variant === 'dark' ? 'default' : 'dark');
      },
      icon: 'theme',
      label: t('screen_more.theme'),
      testID: 'more-theme',
    },
    {
      disabled: false,
      handlePress: toggleLanguage,
      icon: 'language',
      label: t('screen_more.language'),
      testID: 'more-language',
    },
    {
      disabled: logoutMutation.isPending,
      handlePress: handleLogout,
      icon: 'user',
      label: logoutMutation.isPending
        ? t('screen_more.logging_out')
        : t('screen_more.logout'),
      testID: 'more-logout',
    },
  ] as const;

  return (
    <SafeScreen edges={['top', 'left', 'right']}>
      <View
        style={[
          layout.flex_1,
          backgrounds.surfaceSunken,
          gutters.gap_16,
          gutters.padding_16,
        ]}
        testID="more-screen"
      >
        <Text style={[fonts.size_24, fonts.gray800, fonts.bold]}>
          {t('screen_more.title')}
        </Text>

        <Card style={[gutters.gap_4]}>
          {actions.map((action, index) => (
            <View key={action.testID}>
              {index > 0 ? (
                <View style={[backgrounds.gray100, { height: 1 }]} />
              ) : undefined}
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={{ disabled: action.disabled }}
                disabled={action.disabled}
                onPress={action.handlePress}
                style={[
                  layout.row,
                  layout.itemsCenter,
                  gutters.gap_12,
                  gutters.paddingVertical_16,
                ]}
                testID={action.testID}
              >
                <IconByVariant
                  height={ICON_SIZE}
                  path={action.icon}
                  stroke={colors.gray800}
                  width={ICON_SIZE}
                />
                <Text style={[layout.flex_1, fonts.size_16, fonts.gray800]}>
                  {action.label}
                </Text>
                <IconByVariant
                  height={ICON_SIZE}
                  path="chevron-right"
                  stroke={colors.gray200}
                  width={ICON_SIZE}
                />
              </TouchableOpacity>
            </View>
          ))}
        </Card>

        {logoutMutation.isError ? (
          <Text style={[fonts.size_12, fonts.red500, fonts.alignCenter]}>
            {t('screen_more.logout_error')}
          </Text>
        ) : undefined}
      </View>
    </SafeScreen>
  );
}

export default More;
