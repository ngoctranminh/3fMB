import type { ReactNode } from 'react';

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

import FixedScreenHeader from '../FixedScreenHeader/FixedScreenHeader';
import SafeScreen from '../SafeScreen/SafeScreen';

export type ChecklistGroup = {
  readonly id: string;
  readonly items: readonly string[];
  readonly label: string;
};

export type ChecklistSelectionGroup = {
  readonly id: string;
  readonly items: readonly ChecklistSelectionItem[];
  readonly label: string;
};

export type ChecklistSelectionItem = {
  readonly id: string;
  readonly isPriority: boolean;
  readonly label: string;
};

type Properties = {
  readonly allLabel: string;
  readonly completedLabel: (completed: number, total: number) => string;
  readonly emptyLabel: string;
  readonly groups: readonly ChecklistGroup[];
  readonly initialCheckedItemIds?: readonly string[];
  readonly initialPriorityItemIds?: readonly string[];
  readonly onBack: () => void;
  readonly onCheckedItemIdsChange?: (itemIds: readonly string[]) => void;
  readonly onPriorityItemIdsChange?: (itemIds: readonly string[]) => void;
  readonly priorityLabel?: string;
  readonly renderSelectionAction?: (
    groups: readonly ChecklistSelectionGroup[],
  ) => ReactNode;
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
  initialPriorityItemIds = EMPTY_ITEM_IDS,
  onBack,
  onCheckedItemIdsChange = undefined,
  onPriorityItemIdsChange = undefined,
  priorityLabel = undefined,
  renderSelectionAction = undefined,
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
  const [priorityItemIds, setPriorityItemIds] = useState<ReadonlySet<string>>(
    () =>
      new Set(
        initialPriorityItemIds.filter((itemId) =>
          initialCheckedItemIds.includes(itemId),
        ),
      ),
  );
  const [query, setQuery] = useState('');

  useEffect(() => {
    onCheckedItemIdsChange?.([...checkedItemIds]);
  }, [checkedItemIds, onCheckedItemIdsChange]);

  useEffect(() => {
    onPriorityItemIdsChange?.([...priorityItemIds]);
  }, [onPriorityItemIdsChange, priorityItemIds]);

  const itemCount = groups.flatMap((group) => group.items).length;
  const selectedGroups = useMemo(
    () =>
      groups
        .map((group) => ({
          id: group.id,
          items: group.items
            .map((label, itemIndex) => {
              const id = `${group.id}-${String(itemIndex)}`;
              return { id, isPriority: priorityItemIds.has(id), label };
            })
            .filter((item) => checkedItemIds.has(item.id)),
          label: group.label,
        }))
        .filter((group) => group.items.length > 0),
    [checkedItemIds, groups, priorityItemIds],
  );
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
    const isRemoving = checkedItemIds.has(itemId);
    setCheckedItemIds((current) => {
      const next = new Set(current);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
    if (isRemoving) {
      setPriorityItemIds((current) => {
        const next = new Set(current);
        next.delete(itemId);
        return next;
      });
    }
  };

  const togglePriority = (itemId: string) => {
    setPriorityItemIds((current) => {
      const next = new Set(current);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  return (
    <SafeScreen edges={['top', 'left', 'right']}>
      <View style={[layout.flex_1, backgrounds.surfaceSunken]} testID={testID}>
        <FixedScreenHeader>
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
        </FixedScreenHeader>

        <ScrollView
          contentContainerStyle={[
            gutters.gap_16,
            gutters.padding_16,
            gutters.paddingBottom_40,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          testID={`${testID}-scroll`}
        >
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
                  setPriorityItemIds(new Set());
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
              placeholderTextColor={colors.inputPlaceholder}
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
                  const isPriority = priorityItemIds.has(item.id);

                  return (
                    <View key={item.id}>
                      {itemIndex > 0 ? (
                        <View style={[backgrounds.gray100, { height: 1 }]} />
                      ) : undefined}
                      <View
                        style={[
                          layout.row,
                          layout.itemsCenter,
                          priorityLabel ? gutters.gap_8 : undefined,
                        ]}
                      >
                        <TouchableOpacity
                          accessibilityRole="checkbox"
                          accessibilityState={{ checked: isChecked }}
                          onPress={() => {
                            toggleItem(item.id);
                          }}
                          style={[
                            layout.flex_1,
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
                        {priorityLabel && isChecked ? (
                          <TouchableOpacity
                            accessibilityLabel={priorityLabel}
                            accessibilityRole="button"
                            accessibilityState={{ selected: isPriority }}
                            onPress={() => {
                              togglePriority(item.id);
                            }}
                            style={[
                              layout.row,
                              layout.itemsCenter,
                              gutters.gap_4,
                              gutters.paddingHorizontal_8,
                              gutters.paddingVertical_8,
                              {
                                backgroundColor: isPriority
                                  ? colors.red50
                                  : colors.surface,
                                borderColor: isPriority
                                  ? colors.red500
                                  : colors.inputBorder,
                                borderRadius: 10,
                                borderWidth: 1,
                              },
                            ]}
                            testID={`${testID}-priority-${item.id}`}
                          >
                            <IconByVariant
                              height={SEARCH_ICON_SIZE}
                              path="fire"
                              stroke={
                                isPriority ? colors.red500 : colors.gray200
                              }
                              width={SEARCH_ICON_SIZE}
                            />
                            <Text
                              style={[
                                fonts.size_12,
                                fonts.bold,
                                {
                                  color: isPriority
                                    ? colors.red500
                                    : colors.gray200,
                                },
                              ]}
                            >
                              {priorityLabel}
                            </Text>
                          </TouchableOpacity>
                        ) : undefined}
                      </View>
                    </View>
                  );
                })}
              </Card>
            ))
          )}
        </ScrollView>

        {renderSelectionAction ? (
          <View
            style={[
              backgrounds.surface,
              gutters.paddingHorizontal_16,
              gutters.paddingVertical_12,
              {
                borderTopColor: colors.inputBorder,
                borderTopWidth: 1,
              },
            ]}
            testID={`${testID}-selection-action`}
          >
            {renderSelectionAction(selectedGroups)}
          </View>
        ) : undefined}
      </View>
    </SafeScreen>
  );
}

export default ChecklistScreen;
