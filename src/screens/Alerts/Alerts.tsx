import type { AlertGroup, AlertTab } from './mockData';

import { Fragment, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

import { Card, IconButton, IconByVariant } from '@/components/atoms';
import {
  AlertDetailRow,
  AlertGroupHeader,
  SegmentTabs,
} from '@/components/molecules';
import {
  AlertsHeader,
  AlertsSummary,
  TAB_BAR_BASE_HEIGHT,
} from '@/components/organisms';
import { SafeScreen } from '@/components/templates';

import { ALERT_GROUPS, ALERT_TABS, ALERT_TOTALS, ALERTS } from './mockData';

const CONTENT_GAP = 16;
const ICON_SIZE = 18;

function Alerts() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { backgrounds, colors, components, gutters, layout } = useTheme();

  const [tab, setTab] = useState<AlertTab>('all');
  const [query, setQuery] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<readonly AlertGroup[]>(
    [],
  );

  const totalCount =
    ALERT_TOTALS.low +
    ALERT_TOTALS.out +
    ALERT_TOTALS.expiring +
    ALERT_TOTALS.overdue;

  const visibleItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return ALERTS.filter((item) => {
      const matchesTab = tab === 'all' || item.severity === tab;
      const matchesQuery =
        normalized.length === 0 ||
        item.name.toLowerCase().includes(normalized) ||
        item.warehouse.toLowerCase().includes(normalized);

      return matchesTab && matchesQuery;
    });
  }, [query, tab]);

  const tabOptions = ALERT_TABS.map((id) => ({
    count: id === 'all' ? totalCount : ALERT_TOTALS[id],
    countColor: {
      all: colors.red500,
      expiring: colors.blue500,
      low: colors.amber500,
      out: colors.red500,
      overdue: colors.purple500,
    }[id],
    id,
    label: t(`screen_alerts.tabs.${id}`),
  }));

  const toggleGroup = (group: AlertGroup) => {
    setCollapsedGroups((previous) =>
      previous.includes(group)
        ? previous.filter((item) => item !== group)
        : [...previous, group],
    );
  };

  const groups = ALERT_GROUPS.map((group) => ({
    group,
    items: visibleItems.filter((item) => item.group === group),
  })).filter((entry) => entry.items.length > 0);

  return (
    <SafeScreen edges={['top', 'left', 'right']}>
      <View
        style={[layout.flex_1, backgrounds.surfaceSunken]}
        testID="alerts-screen"
      >
        <ScrollView
          contentContainerStyle={[
            gutters.gap_16,
            gutters.paddingVertical_16,
            {
              paddingBottom: TAB_BAR_BASE_HEIGHT + insets.bottom + CONTENT_GAP,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[gutters.paddingHorizontal_16]}>
            <AlertsHeader alertCount={ALERT_TOTALS.overdue} />
          </View>

          <View style={[gutters.paddingHorizontal_16]}>
            <AlertsSummary
              expiringCount={ALERT_TOTALS.expiring}
              lowCount={ALERT_TOTALS.low}
              outCount={ALERT_TOTALS.out}
              overdueCount={ALERT_TOTALS.overdue}
            />
          </View>

          <SegmentTabs
            activeId={tab}
            isScrollable
            onSelect={(id) => {
              setTab(id as AlertTab);
            }}
            options={tabOptions}
            style={[gutters.paddingHorizontal_16]}
          />

          <View style={[gutters.gap_16, gutters.paddingHorizontal_16]}>
            <View style={[layout.row, layout.itemsCenter, gutters.gap_8]}>
              <View style={[components.searchInputWrapper, layout.flex_1]}>
                <IconByVariant
                  height={ICON_SIZE}
                  path="magnifier"
                  stroke={colors.gray200}
                  width={ICON_SIZE}
                />
                <TextInput
                  onChangeText={setQuery}
                  placeholder={t('screen_alerts.search_placeholder')}
                  placeholderTextColor={colors.gray200}
                  style={[components.searchInput]}
                  testID="alerts-search-input"
                  value={query}
                />
              </View>

              <TouchableOpacity
                accessibilityRole="button"
                style={[components.dateChip]}
                testID="alerts-filter"
              >
                <IconByVariant
                  height={ICON_SIZE}
                  path="filter"
                  stroke={colors.gray400}
                  width={ICON_SIZE}
                />
                <Text style={[components.categoryChipLabel]}>
                  {t('screen_alerts.filter')}
                </Text>
                <IconByVariant
                  height={ICON_SIZE}
                  path="chevron-down"
                  stroke={colors.gray400}
                  width={ICON_SIZE}
                />
              </TouchableOpacity>

              <IconButton iconPath="sort" testID="alerts-sort" />
            </View>

            {groups.length === 0 ? (
              <Card>
                <Text
                  style={[
                    components.categoryChipLabel,
                    gutters.paddingVertical_16,
                  ]}
                >
                  {t('screen_alerts.empty')}
                </Text>
              </Card>
            ) : (
              groups.map(({ group, items }) => {
                const isExpanded = !collapsedGroups.includes(group);

                return (
                  <Card key={group} style={[gutters.paddingVertical_4]}>
                    <AlertGroupHeader
                      count={items.length}
                      isExpanded={isExpanded}
                      onPress={() => {
                        toggleGroup(group);
                      }}
                      testID={`alerts-group-${group}`}
                      title={t(`screen_alerts.groups.${group}`)}
                    />

                    {isExpanded ? (
                      <View>
                        {items.map((item) => (
                          <Fragment key={item.id}>
                            <View
                              style={[backgrounds.gray100, { height: 1 }]}
                            />
                            <AlertDetailRow item={item} />
                          </Fragment>
                        ))}
                      </View>
                    ) : undefined}
                  </Card>
                );
              })
            )}
          </View>
        </ScrollView>
      </View>
    </SafeScreen>
  );
}

export default Alerts;
