import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth, useInventory } from '@/hooks';
import { formatCurrency } from '@/hooks/domain/inventory/adapters';
import { Paths } from '@/navigation/paths';
import type { MainTabScreenProps } from '@/navigation/types';
import { useTheme } from '@/theme';

import {
  QuickActionTile,
  SectionHeader,
  StatTile,
} from '@/components/molecules';
import {
  AlertsCard,
  InventoryCard,
  OverviewHeader,
  TAB_BAR_BASE_HEIGHT,
} from '@/components/organisms';
import { SafeScreen } from '@/components/templates';

const ALERTS_LIMIT = 4;
const CHART_DAYS = 7;
const CONTENT_GAP = 16;

function Overview({ navigation }: MainTabScreenProps<Paths.Overview>) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { backgrounds, gutters, layout } = useTheme();
  const { useCurrentUserQuery } = useAuth();
  const {
    useFetchAlertsQuery,
    useFetchItemsQuery,
    useFetchSummaryQuery,
    useFetchValueHistoryQuery,
  } = useInventory();

  const currentUserQuery = useCurrentUserQuery();
  const summaryQuery = useFetchSummaryQuery();
  const historyQuery = useFetchValueHistoryQuery(CHART_DAYS);
  const alertsQuery = useFetchAlertsQuery(ALERTS_LIMIT);
  const itemsQuery = useFetchItemsQuery();

  const summary = summaryQuery.data;
  const username = currentUserQuery.data
    ? currentUserQuery.data.username
    : undefined;
  const lowStockCount = itemsQuery.data?.filter(
    (item) => item.status === 'low',
  ).length;

  const stats = [
    {
      caption: t('screen_overview.stats.total_unit'),
      iconPath: 'box',
      label: t('screen_overview.stats.total_label'),
      tone: 'blue',
      value: summary ? String(summary.total_items) : '—',
    },
    {
      caption: t('screen_overview.stats.value_unit'),
      iconPath: 'clipboard-check',
      label: t('screen_overview.stats.value_label'),
      tone: 'green',
      value: summary ? formatCurrency(summary.total_value) : '—',
    },
    {
      caption: t('screen_overview.stats.low_unit'),
      iconPath: 'warning-triangle',
      label: t('screen_overview.stats.low_label'),
      tone: 'amber',
      value: lowStockCount === undefined ? '—' : String(lowStockCount),
    },
    {
      caption: t('screen_overview.stats.expired_unit'),
      iconPath: 'calendar',
      label: t('screen_overview.stats.expired_label'),
      tone: 'red',
      value: summary ? String(summary.overdue_count) : '—',
    },
  ] as const;

  const isError =
    summaryQuery.isError ||
    historyQuery.isError ||
    alertsQuery.isError ||
    itemsQuery.isError;

  const handleResetError = () => {
    void summaryQuery.refetch();
    void historyQuery.refetch();
    void alertsQuery.refetch();
    void itemsQuery.refetch();
  };

  const handleSelectItem = (itemId: string) => {
    navigation.navigate(Paths.ItemDetail, { itemId });
  };

  const handleSeeAllAlerts = () => {
    navigation.navigate(Paths.Alerts);
  };

  const handleSeeAllItems = () => {
    navigation.navigate(Paths.Ingredients);
  };

  const handleMenu = () => {
    navigation.navigate(Paths.More);
  };

  const handleRefresh = () => {
    void Promise.all([
      summaryQuery.refetch(),
      historyQuery.refetch(),
      alertsQuery.refetch(),
      itemsQuery.refetch(),
    ]);
  };

  const isRefreshing =
    summaryQuery.isRefetching ||
    historyQuery.isRefetching ||
    alertsQuery.isRefetching ||
    itemsQuery.isRefetching;

  return (
    <SafeScreen
      edges={['top', 'left', 'right']}
      isError={isError}
      onResetError={handleResetError}
    >
      <View
        style={[layout.flex_1, backgrounds.surfaceSunken]}
        testID="overview-screen"
      >
        <ScrollView
          contentContainerStyle={[
            gutters.gap_16,
            gutters.paddingVertical_16,
            {
              paddingBottom: TAB_BAR_BASE_HEIGHT + insets.bottom + CONTENT_GAP,
            },
          ]}
          refreshControl={
            <RefreshControl
              onRefresh={handleRefresh}
              refreshing={isRefreshing}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={[gutters.paddingHorizontal_16]}>
            <OverviewHeader
              alertCount={summary?.alert_count ?? 0}
              onBell={handleSeeAllAlerts}
              onMenu={handleMenu}
              username={username}
            />
          </View>

          <ScrollView
            contentContainerStyle={[
              gutters.gap_12,
              gutters.paddingHorizontal_16,
            ]}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {stats.map((stat) => (
              <StatTile
                caption={stat.caption}
                iconPath={stat.iconPath}
                key={stat.iconPath}
                label={stat.label}
                tone={stat.tone}
                value={stat.value}
              />
            ))}
          </ScrollView>

          <View style={[gutters.gap_16, gutters.paddingHorizontal_16]}>
            <View style={[gutters.gap_12]}>
              <SectionHeader title={t('screen_overview.quick_actions.title')} />
              <View style={[layout.row, gutters.gap_8]}>
                <QuickActionTile
                  caption={t('screen_overview.quick_actions.import.caption')}
                  iconPath="tray-down"
                  label={t('screen_overview.quick_actions.import.label')}
                  onPress={() => {
                    navigation.navigate(Paths.CreateDocument, {
                      initialSubtype: 'purchase',
                    });
                  }}
                  testID="overview-action-import"
                  tone="blue"
                />
                <QuickActionTile
                  caption={t('screen_overview.quick_actions.export.caption')}
                  iconPath="tray-up"
                  label={t('screen_overview.quick_actions.export.label')}
                  onPress={() => {
                    navigation.navigate(Paths.CreateDocument, {
                      initialSubtype: 'usage',
                    });
                  }}
                  testID="overview-action-export"
                  tone="purple"
                />
                <QuickActionTile
                  caption={t('screen_overview.quick_actions.item.caption')}
                  iconPath="plus"
                  label={t('screen_overview.quick_actions.item.label')}
                  onPress={() => {
                    navigation.navigate(Paths.AddIngredient);
                  }}
                  testID="overview-action-item"
                  tone="green"
                />
              </View>
            </View>
            {/* <StockValueChart points={historyQuery.data ?? []} /> */}
            <AlertsCard
              alerts={alertsQuery.data ?? []}
              onSeeAll={handleSeeAllAlerts}
            />
            <InventoryCard
              items={itemsQuery.data ?? []}
              onSeeAll={handleSeeAllItems}
              onSelectItem={handleSelectItem}
            />
          </View>
        </ScrollView>
      </View>
    </SafeScreen>
  );
}

export default Overview;
