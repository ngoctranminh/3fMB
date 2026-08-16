import { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTheme } from '@/theme';

import { Card, CategoryChip, IconByVariant } from '@/components/atoms';

import SafeScreen from '../SafeScreen/SafeScreen';

export type ChecklistGroup = {
  readonly id: string;
  readonly items: readonly string[];
  readonly label: string;
};

type Properties = {
  readonly allLabel: string;
  readonly completedLabel: (completed: number, total: number) => string;
  readonly emptyLabel: string;
  readonly groups: readonly ChecklistGroup[];
  readonly initialCheckedItemIds?: readonly string[];
  readonly onBack: () => void;
  readonly onCheckedItemIdsChange?: (itemIds: readonly string[]) => void;
  readonly resetLabel: string;
  readonly searchPlaceholder: string;
  readonly subtitle: string;
  readonly testID: string;
  readonly title: string;
};

const ALL_GROUPS = 'all';
const CHECKBOX_SIZE = 24;
const EMPTY_ITEM_IDS: readonly string[] = [];
const HEADER_ICON_SIZE = 24;
const SEARCH_ICON_SIZE = 18;

const normalizeSearch = (value: string) =>
  value
    .normalize('NFD')
    .replaceAll(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replaceAll('đ', 'd');

function ChecklistScreen({
  allLabel,
  completedLabel,
  emptyLabel,
  groups,
  initialCheckedItemIds = EMPTY_ITEM_IDS,
  onBack,
  onCheckedItemIdsChange = undefined,
  resetLabel,
  searchPlaceholder,
  subtitle,
  testID,
  title,
}: Properties) {
  const { backgrounds, colors, components, fonts, gutters, layout } =
    useTheme();
  const [activeGroup, setActiveGroup] = useState(ALL_GROUPS);
  const [checkedItemIds, setCheckedItemIds] = useState<ReadonlySet<string>>(
    () => new Set(initialCheckedItemIds),
  );
  const [query, setQuery] = useState('');

  useEffect(() => {
    onCheckedItemIdsChange?.([...checkedItemIds]);
  }, [checkedItemIds, onCheckedItemIdsChange]);

  const itemCount = groups.flatMap((group) => group.items).length;
  const visibleGroups = useMemo(() => {
    const normalized = normalizeSearch(query.trim());

    return groups
      .filter((group) => activeGroup === ALL_GROUPS || group.id === activeGroup)
      .map((group) => ({
        ...group,
        items: group.items
          .map((item, itemIndex) => ({
            id: `${group.id}-${String(itemIndex)}`,
            label: item,
          }))
          .filter((item) => normalizeSearch(item.label).includes(normalized)),
      }))
      .filter((group) => group.items.length > 0);
  }, [activeGroup, groups, query]);

  const toggleItem = (itemId: string) => {
    setCheckedItemIds((current) => {
      const next = new Set(current);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  return (
    <SafeScreen edges={['top', 'left', 'right']}>
      <View style={[layout.flex_1, backgrounds.surfaceSunken]} testID={testID}>
        <ScrollView
          contentContainerStyle={[
            gutters.gap_16,
            gutters.padding_16,
            gutters.paddingBottom_40,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[layout.row, layout.itemsCenter, gutters.gap_12]}>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={onBack}
              testID={`${testID}-back`}
            >
              <IconByVariant
                height={HEADER_ICON_SIZE}
                path="chevron-left"
                stroke={colors.gray800}
                width={HEADER_ICON_SIZE}
              />
            </TouchableOpacity>
            <View style={[layout.flex_1]}>
              <Text style={[fonts.size_20, fonts.gray800, fonts.bold]}>
                {title}
              </Text>
              <Text style={[fonts.size_12, fonts.gray200]}>{subtitle}</Text>
            </View>
          </View>

          <Card
            style={[
              layout.row,
              layout.itemsCenter,
              layout.justifyBetween,
              gutters.gap_12,
            ]}
          >
            <View style={[layout.flex_1, gutters.gap_4]}>
              <Text style={[fonts.size_12, fonts.gray200]}>{title}</Text>
              <Text style={[fonts.size_20, fonts.gray800, fonts.bold]}>
                {completedLabel(checkedItemIds.size, itemCount)}
              </Text>
            </View>
            {checkedItemIds.size > 0 ? (
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => {
                  setCheckedItemIds(new Set());
                }}
                testID={`${testID}-reset`}
              >
                <Text style={[fonts.size_14, { color: colors.blue500 }]}>
                  {resetLabel}
                </Text>
              </TouchableOpacity>
            ) : undefined}
          </Card>

          <View style={[components.searchInputWrapper]}>
            <IconByVariant
              height={SEARCH_ICON_SIZE}
              path="magnifier"
              stroke={colors.gray200}
              width={SEARCH_ICON_SIZE}
            />
            <TextInput
              onChangeText={setQuery}
              placeholder={searchPlaceholder}
              placeholderTextColor={colors.gray200}
              style={[components.searchInput]}
              testID={`${testID}-search`}
              value={query}
            />
          </View>

          <ScrollView
            contentContainerStyle={[gutters.gap_8]}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            <CategoryChip
              isActive={activeGroup === ALL_GROUPS}
              label={allLabel}
              onPress={() => {
                setActiveGroup(ALL_GROUPS);
              }}
              testID={`${testID}-filter-all`}
            />
            {groups.map((group) => (
              <CategoryChip
                isActive={activeGroup === group.id}
                key={group.id}
                label={group.label}
                onPress={() => {
                  setActiveGroup(group.id);
                }}
                testID={`${testID}-filter-${group.id}`}
              />
            ))}
          </ScrollView>

          {visibleGroups.length === 0 ? (
            <Card>
              <Text style={[fonts.size_14, fonts.gray200, fonts.alignCenter]}>
                {emptyLabel}
              </Text>
            </Card>
          ) : (
            visibleGroups.map((group) => (
              <Card key={group.id} style={[gutters.gap_8]}>
                <Text style={[fonts.size_16, fonts.gray800, fonts.bold]}>
                  {group.label}
                </Text>
                {group.items.map((item, itemIndex) => {
                  const isChecked = checkedItemIds.has(item.id);

                  return (
                    <View key={item.id}>
                      {itemIndex > 0 ? (
                        <View style={[backgrounds.gray100, { height: 1 }]} />
                      ) : undefined}
                      <TouchableOpacity
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: isChecked }}
                        onPress={() => {
                          toggleItem(item.id);
                        }}
                        style={[
                          layout.row,
                          layout.itemsCenter,
                          gutters.gap_12,
                          gutters.paddingVertical_12,
                        ]}
                        testID={`${testID}-item-${item.id}`}
                      >
                        <View
                          style={[
                            layout.itemsCenter,
                            layout.justifyCenter,
                            {
                              backgroundColor: isChecked
                                ? colors.green500
                                : colors.surface,
                              borderColor: isChecked
                                ? colors.green500
                                : colors.gray200,
                              borderRadius: 6,
                              borderWidth: 2,
                              height: CHECKBOX_SIZE,
                              width: CHECKBOX_SIZE,
                            },
                          ]}
                        >
                          {isChecked ? (
                            <IconByVariant
                              height={SEARCH_ICON_SIZE}
                              path="clipboard-check"
                              stroke="#FFFFFF"
                              width={SEARCH_ICON_SIZE}
                            />
                          ) : undefined}
                        </View>
                        <Text
                          style={[
                            layout.flex_1,
                            fonts.size_14,
                            isChecked ? fonts.gray200 : fonts.gray800,
                            isChecked
                              ? { textDecorationLine: 'line-through' }
                              : undefined,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </Card>
            ))
          )}
        </ScrollView>
      </View>
    </SafeScreen>
  );
}

export default ChecklistScreen;
