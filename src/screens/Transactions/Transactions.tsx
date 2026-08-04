import type { TransactionFilter, TransactionTab } from './mockData';

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

import { Card, CategoryChip, IconByVariant } from '@/components/atoms';
import {
  QuickActionTile,
  SegmentTabs,
  TransactionRow,
} from '@/components/molecules';
import {
  TAB_BAR_BASE_HEIGHT,
  TodayTotalsCard,
  TransactionsHeader,
} from '@/components/organisms';
import { SafeScreen } from '@/components/templates';

import {
  QUICK_ACTIONS,
  TODAY_TOTALS,
  TRANSACTION_FILTERS,
  TRANSACTION_TABS,
  TRANSACTIONS,
} from './mockData';

const CONTENT_GAP = 16;
const ICON_SIZE = 18;

function Transactions() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { backgrounds, colors, components, gutters, layout } = useTheme();

  const [tab, setTab] = useState<TransactionTab>('import');
  const [filter, setFilter] = useState<TransactionFilter>('all');
  const [query, setQuery] = useState('');

  const visibleItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return TRANSACTIONS.filter((item) => {
      const matchesFilter = filter === 'all' || item.kind === filter;
      const matchesQuery =
        normalized.length === 0 ||
        item.code.toLowerCase().includes(normalized) ||
        item.partner.toLowerCase().includes(normalized);

      return matchesFilter && matchesQuery;
    });
  }, [filter, query]);

  const tabOptions = TRANSACTION_TABS.map((id) => ({
    id,
    label: t(`screen_transactions.tabs.${id}`),
  }));

  return (
    <SafeScreen edges={['top', 'left', 'right']}>
      <View
        style={[layout.flex_1, backgrounds.surfaceSunken]}
        testID="transactions-screen"
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
          <View style={[gutters.gap_12, gutters.paddingHorizontal_16]}>
            <TransactionsHeader />

            <SegmentTabs
              activeId={tab}
              onSelect={(id) => {
                setTab(id as TransactionTab);
              }}
              options={tabOptions}
            />
          </View>

          <View style={[gutters.gap_12, gutters.paddingHorizontal_16]}>
            <View style={[layout.row, gutters.gap_8]}>
              {QUICK_ACTIONS.map((action) => (
                <QuickActionTile
                  caption={t(
                    `screen_transactions.actions.${action.id}.caption`,
                  )}
                  iconPath={action.iconPath}
                  key={action.id}
                  label={t(`screen_transactions.actions.${action.id}.label`)}
                  testID={`action-${action.id}`}
                  tone={action.tone}
                />
              ))}
            </View>

            <TodayTotalsCard
              exportCount={TODAY_TOTALS.exportCount}
              exportValue={TODAY_TOTALS.exportValue}
              importCount={TODAY_TOTALS.importCount}
              importValue={TODAY_TOTALS.importValue}
            />

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
                  placeholder={t('screen_transactions.search_placeholder')}
                  placeholderTextColor={colors.gray200}
                  style={[components.searchInput]}
                  testID="transactions-search-input"
                  value={query}
                />
              </View>

              <TouchableOpacity
                accessibilityRole="button"
                style={[components.iconButtonSquare]}
                testID="transactions-calendar"
              >
                <IconByVariant
                  height={ICON_SIZE}
                  path="calendar"
                  stroke={colors.gray400}
                  width={ICON_SIZE}
                />
              </TouchableOpacity>

              <TouchableOpacity
                accessibilityRole="button"
                style={[components.dateChip]}
                testID="transactions-range"
              >
                <Text style={[components.categoryChipLabel]}>
                  {t('screen_transactions.range_today')}
                </Text>
                <IconByVariant
                  height={ICON_SIZE}
                  path="chevron-down"
                  stroke={colors.gray400}
                  width={ICON_SIZE}
                />
              </TouchableOpacity>
            </View>

            <Card style={[gutters.gap_12]}>
              <ScrollView
                contentContainerStyle={[gutters.gap_8]}
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                {TRANSACTION_FILTERS.map((option) => (
                  <CategoryChip
                    isActive={option === filter}
                    key={option}
                    label={t(`screen_transactions.filters.${option}`)}
                    onPress={() => {
                      setFilter(option);
                    }}
                    testID={`filter-${option}`}
                  />
                ))}
              </ScrollView>

              <View>
                {visibleItems.length === 0 ? (
                  <Text
                    style={[
                      components.categoryChipLabel,
                      gutters.paddingVertical_16,
                    ]}
                  >
                    {t('screen_transactions.empty')}
                  </Text>
                ) : (
                  visibleItems.map((item, index) => (
                    <Fragment key={item.id}>
                      {index > 0 ? (
                        <View style={[backgrounds.gray100, { height: 1 }]} />
                      ) : undefined}
                      <TransactionRow item={item} />
                    </Fragment>
                  ))
                )}
              </View>
            </Card>
          </View>
        </ScrollView>
      </View>
    </SafeScreen>
  );
}

export default Transactions;
