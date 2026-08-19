import { Fragment, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useInventory } from '@/hooks';
import type {
  DocumentSubtype,
  TransactionKind,
  TransactionPeriod,
} from '@/hooks/domain/inventory/schema';
import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { useTheme } from '@/theme';

import { Card, CategoryChip, IconByVariant } from '@/components/atoms';
import { SegmentTabs, TransactionRow } from '@/components/molecules';
import { FixedScreenHeader, SafeScreen } from '@/components/templates';

type SubtypeFilter = 'all' | DocumentSubtype;

const ALL_SUBTYPES = 'all';
const ICON_SIZE = 20;
const PERIODS: readonly TransactionPeriod[] = ['today', 'week', 'month', 'all'];
const TRANSACTION_TABS = ['import', 'export'] as const;

const SUBTYPES_BY_TAB = {
  export: ['usage', 'waste', 'other_out'],
  import: ['purchase', 'return', 'other_in'],
} as const satisfies Record<TransactionKind, readonly DocumentSubtype[]>;

function TransactionHistory({
  navigation,
}: RootScreenProps<Paths.TransactionHistory>) {
  const { t } = useTranslation();
  const { backgrounds, colors, components, fonts, gutters, layout } =
    useTheme();
  const { useFetchTransactionsQuery } = useInventory();

  const [period, setPeriod] = useState<TransactionPeriod>('all');
  const [query, setQuery] = useState('');
  const [subtype, setSubtype] = useState<SubtypeFilter>(ALL_SUBTYPES);
  const [tab, setTab] = useState<TransactionKind>('import');

  const transactionsQuery = useFetchTransactionsQuery(period);
  const transactions = useMemo(
    () => transactionsQuery.data ?? [],
    [transactionsQuery.data],
  );

  const visibleItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return transactions.filter((item) => {
      const matchesSubtype =
        subtype === ALL_SUBTYPES || item.subtype === subtype;
      const matchesQuery =
        normalized.length === 0 ||
        item.code.toLowerCase().includes(normalized) ||
        item.partner.toLowerCase().includes(normalized) ||
        item.subtypeLabel.toLowerCase().includes(normalized) ||
        item.user.toLowerCase().includes(normalized);

      return item.kind === tab && matchesSubtype && matchesQuery;
    });
  }, [query, subtype, tab, transactions]);

  const tabOptions = TRANSACTION_TABS.map((id) => ({
    id,
    label: t(`screen_transactions.tabs.${id}`),
  }));

  const subtypeFilters: readonly SubtypeFilter[] = [
    ALL_SUBTYPES,
    ...SUBTYPES_BY_TAB[tab],
  ];

  const handlePeriodPicker = () => {
    Alert.alert(
      t('screen_transactions.period_title'),
      undefined,
      PERIODS.map((option) => ({
        onPress: () => {
          setPeriod(option);
        },
        text: t(`screen_transactions.periods.${option}`),
      })),
    );
  };

  return (
    <SafeScreen
      edges={['top', 'left', 'right']}
      isError={transactionsQuery.isError}
      onGoBackError={() => {
        navigation.goBack();
      }}
      onResetError={() => {
        void transactionsQuery.refetch();
      }}
    >
      <View
        style={[layout.flex_1, backgrounds.surfaceSunken]}
        testID="transaction-history-screen"
      >
        <FixedScreenHeader style={[gutters.gap_12]}>
          <View style={[layout.row, layout.itemsCenter, gutters.gap_12]}>
            <TouchableOpacity
              accessibilityLabel={t('screen_transactions.history_back')}
              accessibilityRole="button"
              onPress={() => {
                navigation.goBack();
              }}
              testID="transaction-history-back"
            >
              <IconByVariant
                height={ICON_SIZE}
                path="chevron-left"
                stroke={colors.gray800}
                width={ICON_SIZE}
              />
            </TouchableOpacity>

            <View style={[layout.flex_1, gutters.gap_4]}>
              <Text style={[fonts.size_20, fonts.gray800, fonts.bold]}>
                {t('screen_transactions.history_title')}
              </Text>
              <Text style={[fonts.size_12, fonts.gray200]}>
                {t('screen_transactions.history_subtitle')}
              </Text>
            </View>
          </View>

          <SegmentTabs
            activeId={tab}
            onSelect={(id) => {
              setTab(id as TransactionKind);
              setSubtype(ALL_SUBTYPES);
            }}
            options={tabOptions}
          />
        </FixedScreenHeader>

        <ScrollView
          contentContainerStyle={[
            gutters.gap_16,
            gutters.padding_16,
            gutters.paddingBottom_40,
          ]}
          refreshControl={
            <RefreshControl
              onRefresh={() => {
                void transactionsQuery.refetch();
              }}
              refreshing={transactionsQuery.isRefetching}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={[layout.row, layout.itemsCenter, gutters.gap_8]}>
            <View style={[components.searchInputWrapper, layout.flex_1]}>
              <IconByVariant
                height={ICON_SIZE}
                path="magnifier"
                stroke={colors.gray400}
                width={ICON_SIZE}
              />
              <TextInput
                onChangeText={setQuery}
                placeholder={t('screen_transactions.search_placeholder')}
                placeholderTextColor={colors.inputPlaceholder}
                style={[components.searchInput]}
                testID="transaction-history-search"
                value={query}
              />
            </View>

            <TouchableOpacity
              accessibilityRole="button"
              onPress={handlePeriodPicker}
              style={[components.dateChip]}
              testID="transaction-history-period"
            >
              <IconByVariant
                height={ICON_SIZE}
                path="calendar"
                stroke={colors.gray400}
                width={ICON_SIZE}
              />
              <Text style={[components.categoryChipLabel]}>
                {t(`screen_transactions.periods.${period}`)}
              </Text>
              <IconByVariant
                height={ICON_SIZE}
                path="chevron-down"
                stroke={colors.gray400}
                width={ICON_SIZE}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={[gutters.gap_8]}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {subtypeFilters.map((option) => (
              <CategoryChip
                isActive={option === subtype}
                key={option}
                label={t(`screen_transactions.filters.${option}`)}
                onPress={() => {
                  setSubtype(option);
                }}
                testID={`history-filter-${option}`}
              />
            ))}
          </ScrollView>

          <View style={[layout.row, layout.itemsCenter, layout.justifyBetween]}>
            <Text style={[fonts.size_16, fonts.gray800, fonts.bold]}>
              {t(`screen_transactions.tabs.${tab}`)}
            </Text>
            <Text style={[fonts.size_12, fonts.gray200]}>
              {t('screen_transactions.history_count', {
                count: visibleItems.length,
              })}
            </Text>
          </View>

          <Card style={[gutters.gap_12]}>
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
                  <TransactionRow
                    item={item}
                    onPress={() => {
                      navigation.navigate(Paths.ReceiptDetail, {
                        documentId: item.id,
                      });
                    }}
                    testID={`history-row-${item.id}`}
                  />
                </Fragment>
              ))
            )}
          </Card>
        </ScrollView>
      </View>
    </SafeScreen>
  );
}

export default TransactionHistory;
