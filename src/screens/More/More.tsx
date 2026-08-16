import type { NavigationProp } from '@react-navigation/native';

import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useAuth, useI18n } from '@/hooks';
import { Paths } from '@/navigation/paths';
import type { MainTabScreenProps } from '@/navigation/types';
import type { RootStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme';

import { Card, IconByVariant } from '@/components/atoms';
import { SafeScreen } from '@/components/templates';

const ICON_SIZE = 22;

type Action = {
  readonly disabled: boolean;
  readonly handlePress: () => void;
  readonly icon: string;
  readonly label: string;
  readonly testID: string;
};

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

  const operationActions: readonly Action[] = [
    {
      disabled: false,
      handlePress: () => {
        navigation.navigate(Paths.Sauces);
      },
      icon: 'fire',
      label: t('screen_more.sauces'),
      testID: 'more-sauces',
    },
    {
      disabled: false,
      handlePress: () => {
        navigation.navigate(Paths.PurchaseGuide);
      },
      icon: 'document',
      label: t('screen_more.purchase_guide'),
      testID: 'more-purchase-guide',
    },
    {
      disabled: false,
      handlePress: () => {
        navigation.navigate(Paths.PrepTasks);
      },
      icon: 'clipboard-check',
      label: t('screen_more.prep_tasks'),
      testID: 'more-prep-tasks',
    },
  ];

  const settingActions: readonly Action[] = [
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
  ];

  const renderActions = (actions: readonly Action[]) =>
    actions.map((action, index) => (
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
    ));

  return (
    <SafeScreen edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={[
          gutters.gap_16,
          gutters.padding_16,
          gutters.paddingBottom_40,
        ]}
        style={[layout.flex_1, backgrounds.surfaceSunken]}
        testID="more-screen"
      >
        <Text style={[fonts.size_24, fonts.gray800, fonts.bold]}>
          {t('screen_more.title')}
        </Text>

        <View style={[gutters.gap_8]}>
          <Text style={[fonts.size_14, fonts.gray200]}>
            {t('screen_more.operations')}
          </Text>
          <Card style={[gutters.gap_4]}>{renderActions(operationActions)}</Card>
        </View>

        <View style={[gutters.gap_8]}>
          <Text style={[fonts.size_14, fonts.gray200]}>
            {t('screen_more.settings')}
          </Text>
          <Card style={[gutters.gap_4]}>{renderActions(settingActions)}</Card>
        </View>

        {logoutMutation.isError ? (
          <Text style={[fonts.size_12, fonts.red500, fonts.alignCenter]}>
            {t('screen_more.logout_error')}
          </Text>
        ) : undefined}
      </ScrollView>
    </SafeScreen>
  );
}

export default More;
