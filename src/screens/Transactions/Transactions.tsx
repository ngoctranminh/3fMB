import { Fragment, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useInventory } from '@/hooks';
import type {
  DocumentSubtype,
  TransactionPeriod,
} from '@/hooks/domain/inventory/schema';
import { Paths } from '@/navigation/paths';
import type { MainTabScreenProps } from '@/navigation/types';
import { useTheme } from '@/theme';

import { Card, CategoryChip, IconByVariant } from '@/components/atoms';
import { QuickActionTile, TransactionRow } from '@/components/molecules';
import {
  TAB_BAR_BASE_HEIGHT,
  TodayTotalsCard,
  TransactionsHeader,
} from '@/components/organisms';
import { FixedScreenHeader, SafeScreen } from '@/components/templates';

type SubtypeFilter = 'all' | DocumentSubtype;

const ALL_SUBTYPES = 'all';
const CONTENT_GAP = 16;
const ICON_SIZE = 18;

const SUBTYPE_FILTERS: readonly SubtypeFilter[] = [
  ALL_SUBTYPES,
  'purchase',
  'return',
  'other_in',
  'usage',
  'waste',
  'other_out',
];

const QUICK_ACTIONS = [
  { iconPath: 'tray-down', id: 'receive', subtype: 'purchase', tone: 'blue' },
  { iconPath: 'box', id: 'return', subtype: 'return', tone: 'purple' },
  {
    iconPath: 'document',
    id: 'other_in',
    subtype: 'other_in',
    tone: 'green',
  },
] as const;

const PERIODS: readonly TransactionPeriod[] = ['today', 'week', 'month', 'all'];

function Transactions({ navigation }: MainTabScreenProps<Paths.Transactions>) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { backgrounds, colors, components, gutters, layout } = useTheme();
  const { useFetchTodayTotalsQuery, useFetchTransactionsQuery } =
    useInventory();

  const [period, setPeriod] = useState<TransactionPeriod>('today');

  const transactionsQuery = useFetchTransactionsQuery(period);
  const todayTotalsQuery = useFetchTodayTotalsQuery();

  const [subtype, setSubtype] = useState<SubtypeFilter>(ALL_SUBTYPES);
  const [query, setQuery] = useState('');

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

      return matchesSubtype && matchesQuery;
    });
  }, [query, subtype, transactions]);

  const todayTotals = todayTotalsQuery.data;
  const isError = transactionsQuery.isError || todayTotalsQuery.isError;

  const handleResetError = () => {
    void transactionsQuery.refetch();
    void todayTotalsQuery.refetch();
  };

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

  const handleSubtypePicker = () => {
    Alert.alert(
      t('screen_transactions.filter'),
      undefined,
      SUBTYPE_FILTERS.map((option) => ({
        onPress: () => {
          setSubtype(option);
        },
        text: t(`screen_transactions.filters.${option}`),
      })),
    );
  };

  return (
    <SafeScreen
      edges={['top', 'left', 'right']}
      isError={isError}
      onResetError={handleResetError}
    >
      <View
        style={[layout.flex_1, backgrounds.surfaceSunken]}
        testID="transactions-screen"
      >
        <FixedScreenHeader>
          <TransactionsHeader
            onBack={() => {
              navigation.navigate(Paths.Overview);
            }}
            onFilter={handleSubtypePicker}
            onHistory={() => {
              navigation.navigate(Paths.TransactionHistory);
            }}
          />
        </FixedScreenHeader>

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
            <View style={[layout.row, gutters.gap_8]}>
              {QUICK_ACTIONS.map((action) => (
                <QuickActionTile
                  caption={t(
                    `screen_transactions.actions.${action.id}.caption`,
                  )}
                  iconPath={action.iconPath}
                  key={action.id}
                  label={t(`screen_transactions.actions.${action.id}.label`)}
                  onPress={() => {
                    navigation.navigate(Paths.CreateDocument, {
                      initialSubtype: action.subtype,
                    });
                  }}
                  testID={`action-${action.id}`}
                  tone={action.tone}
                />
              ))}
            </View>

            <TodayTotalsCard
              exportCount={todayTotals?.exportCount ?? 0}
              exportValue={todayTotals?.exportValue ?? '—'}
              importCount={todayTotals?.importCount ?? 0}
              importValue={todayTotals?.importValue ?? '—'}
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
                  placeholderTextColor={colors.inputPlaceholder}
                  style={[components.searchInput]}
                  testID="transactions-search-input"
                  value={query}
                />
              </View>

              <TouchableOpacity
                accessibilityRole="button"
                onPress={handlePeriodPicker}
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
                onPress={handlePeriodPicker}
                style={[components.dateChip]}
                testID="transactions-range"
              >
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

            <Card style={[gutters.gap_12]}>
              <ScrollView
                contentContainerStyle={[gutters.gap_8]}
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                {SUBTYPE_FILTERS.map((option) => (
                  <CategoryChip
                    isActive={option === subtype}
                    key={option}
                    label={t(`screen_transactions.filters.${option}`)}
                    onPress={() => {
                      setSubtype(option);
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
                      <TransactionRow
                        item={item}
                        onPress={() => {
                          navigation.navigate(Paths.ReceiptDetail, {
                            documentId: item.id,
                          });
                        }}
                        testID={`transaction-row-${item.id}`}
                      />
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
