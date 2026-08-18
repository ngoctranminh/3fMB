import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Modal,
  PermissionsAndroid,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

import { IconByVariant } from '@/components/atoms';
import type { ChecklistSelectionGroup } from '@/components/templates';

import { captureReference } from '@/services/viewCapture';

type Properties = {
  readonly groups: readonly ChecklistSelectionGroup[];
};

const ACTION_ICON_SIZE = 20;
const ANDROID_SCOPED_STORAGE_VERSION = 29;
const CHECK_MARK_SIZE = 22;
const CHECK_MARK_FONT_SIZE = 14;
const COMPACT_CHECK_MARK_SIZE = 18;
const COMPACT_CHECK_MARK_FONT_SIZE = 12;
const COMPACT_LAYOUT_MIN_ITEM_COUNT = 12;
const COMPACT_ITEM_FONT_SIZE = 13;
const COMPACT_ITEM_GAP = 7;
const COMPACT_ITEM_LINE_HEIGHT = 18;
const DISABLED_OPACITY = 0.65;
const GROUP_SPACING = 22;
const COMPACT_GROUP_SPACING = 16;
const ITEM_FONT_SIZE = 16;
const ITEM_GAP = 10;
const ITEM_LINE_HEIGHT = 22;
const PREVIEW_BACKGROUND = '#F8FAFC';
const PREVIEW_BLUE = '#2563EB';
const PREVIEW_BORDER = '#CBD5E1';
const PREVIEW_GREEN = '#16A34A';
const PREVIEW_MUTED = '#64748B';
const PREVIEW_RED = '#DC2626';
const PREVIEW_RED_BACKGROUND = '#FEE2E2';
const PREVIEW_RED_TEXT = '#991B1B';
const PREVIEW_TEXT = '#0F172A';
const SAVING_OPACITY = 0.7;

const padDatePart = (value: number) => String(value).padStart(2, '0');

const getImageFileName = (date: Date) =>
  [
    'giay-mua-hang',
    date.getFullYear(),
    padDatePart(date.getMonth() + 1),
    padDatePart(date.getDate()),
    padDatePart(date.getHours()),
    padDatePart(date.getMinutes()),
  ].join('-');

const requestLegacyAndroidSavePermission = async () => {
  if (
    Platform.OS !== 'android' ||
    Platform.Version >= ANDROID_SCOPED_STORAGE_VERSION
  )
    return true;

  const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
  const alreadyGranted = await PermissionsAndroid.check(permission);
  if (alreadyGranted) return true;

  const result = await PermissionsAndroid.request(permission);
  return result === PermissionsAndroid.RESULTS.GRANTED;
};

function PurchaseListExporter({ groups }: Properties) {
  const { i18n, t } = useTranslation();
  const { backgrounds, colors, fonts, gutters, layout } = useTheme();
  const previewReference = useRef<ScrollView>(null);
  const [createdAt, setCreatedAt] = useState(() => new Date());
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const selectedCount = groups.reduce(
    (count, group) => count + group.items.length,
    0,
  );
  const urgentCount = groups.reduce(
    (count, group) =>
      count + group.items.filter((item) => item.isPriority).length,
    0,
  );
  const isCompactLayout = selectedCount >= COMPACT_LAYOUT_MIN_ITEM_COUNT;
  const formattedDate = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.resolvedLanguage ?? i18n.language, {
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(createdAt),
    [createdAt, i18n.language, i18n.resolvedLanguage],
  );

  const openPreview = () => {
    if (selectedCount === 0) return;
    setCreatedAt(new Date());
    setIsPreviewVisible(true);
  };

  const closePreview = () => {
    if (!isSaving) setIsPreviewVisible(false);
  };

  const saveImage = async () => {
    if (!previewReference.current || isSaving) return;

    setIsSaving(true);
    try {
      const hasPermission = await requestLegacyAndroidSavePermission();
      if (!hasPermission) throw new Error('Photo library permission denied');

      const imageUri = await captureReference(previewReference, {
        fileName: getImageFileName(createdAt),
        format: 'png',
        result: 'tmpfile',
        snapshotContentContainer: true,
      });
      await CameraRoll.saveAsset(imageUri, { type: 'photo' });
      setIsPreviewVisible(false);
      Alert.alert(
        t('screen_purchase_guide.export.saved_title'),
        t('screen_purchase_guide.export.saved_message', {
          date: formattedDate,
        }),
      );
    } catch {
      Alert.alert(
        t('screen_purchase_guide.export.error_title'),
        t('screen_purchase_guide.export.error_message'),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        accessibilityRole="button"
        disabled={selectedCount === 0}
        onPress={openPreview}
        style={[
          layout.row,
          layout.itemsCenter,
          layout.justifyCenter,
          gutters.gap_8,
          gutters.paddingVertical_12,
          {
            backgroundColor:
              selectedCount > 0 ? colors.blue500 : colors.gray100,
            borderRadius: 14,
            opacity: selectedCount > 0 ? 1 : DISABLED_OPACITY,
          },
        ]}
        testID="purchase-guide-export"
      >
        <IconByVariant
          height={ACTION_ICON_SIZE}
          path="tray-down"
          stroke={selectedCount > 0 ? '#FFFFFF' : colors.gray200}
          width={ACTION_ICON_SIZE}
        />
        <Text
          style={[
            fonts.size_14,
            fonts.bold,
            { color: selectedCount > 0 ? '#FFFFFF' : colors.gray200 },
          ]}
        >
          {t('screen_purchase_guide.export.action', {
            count: selectedCount,
          })}
        </Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        onRequestClose={closePreview}
        presentationStyle="pageSheet"
        visible={isPreviewVisible}
      >
        <SafeAreaView style={[layout.flex_1, backgrounds.surfaceSunken]}>
          <View
            style={[
              layout.row,
              layout.itemsCenter,
              layout.justifyBetween,
              gutters.gap_12,
              gutters.paddingHorizontal_16,
              gutters.paddingVertical_12,
            ]}
          >
            <View style={[layout.flex_1]}>
              <Text style={[fonts.size_20, fonts.gray800, fonts.bold]}>
                {t('screen_purchase_guide.export.preview_title')}
              </Text>
              <Text style={[fonts.size_12, fonts.gray200]}>
                {t('screen_purchase_guide.export.preview_hint')}
              </Text>
            </View>
            <TouchableOpacity
              accessibilityRole="button"
              disabled={isSaving}
              onPress={closePreview}
              testID="purchase-guide-export-close"
            >
              <IconByVariant
                height={ACTION_ICON_SIZE + 4}
                path="x-circle"
                stroke={colors.gray800}
                width={ACTION_ICON_SIZE + 4}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={{
              backgroundColor: PREVIEW_BACKGROUND,
              padding: 24,
            }}
            ref={previewReference}
            showsVerticalScrollIndicator={false}
            style={[layout.flex_1]}
            testID="purchase-guide-export-preview"
          >
            <View
              collapsable={false}
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: PREVIEW_BORDER,
                borderRadius: 20,
                borderWidth: 1,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  backgroundColor: PREVIEW_BLUE,
                  paddingHorizontal: 24,
                  paddingVertical: 22,
                }}
              >
                <Text
                  style={{ color: '#FFFFFF', fontSize: 26, fontWeight: '700' }}
                >
                  {t('screen_purchase_guide.export.image_title')}
                </Text>
                <Text style={{ color: '#DBEAFE', fontSize: 14, marginTop: 6 }}>
                  {t('screen_purchase_guide.export.generated_at', {
                    date: formattedDate,
                  })}
                </Text>
              </View>

              <View style={{ padding: 24 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 8,
                    marginBottom: 20,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: '#DCFCE7',
                      borderRadius: 999,
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: '#166534',
                        fontSize: 14,
                        fontWeight: '700',
                      }}
                    >
                      {t('screen_purchase_guide.export.selected_count', {
                        count: selectedCount,
                      })}
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: PREVIEW_RED_BACKGROUND,
                      borderRadius: 999,
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                    }}
                    testID="purchase-guide-export-urgent-count"
                  >
                    <Text
                      style={{
                        color: PREVIEW_RED_TEXT,
                        fontSize: 14,
                        fontWeight: '700',
                      }}
                    >
                      {t('screen_purchase_guide.export.urgent_count', {
                        count: urgentCount,
                      })}
                    </Text>
                  </View>
                </View>

                {groups.map((group, groupIndex) => (
                  <View
                    key={group.id}
                    style={{
                      marginTop:
                        groupIndex === 0
                          ? 0
                          : isCompactLayout
                            ? COMPACT_GROUP_SPACING
                            : GROUP_SPACING,
                    }}
                  >
                    <Text
                      style={{
                        color: PREVIEW_BLUE,
                        fontSize: 17,
                        fontWeight: '700',
                        marginBottom: 8,
                      }}
                    >
                      {group.label}
                    </Text>
                    <View
                      style={{
                        flexDirection: isCompactLayout ? 'row' : 'column',
                        flexWrap: isCompactLayout ? 'wrap' : 'nowrap',
                        justifyContent: 'space-between',
                      }}
                      testID={`purchase-guide-export-group-${group.id}`}
                    >
                      {group.items.map((item, itemIndex) => (
                        <View
                          key={item.id}
                          style={{
                            alignItems: 'flex-start',
                            borderBottomColor: '#E2E8F0',
                            borderBottomWidth: 1,
                            flexDirection: 'row',
                            gap: isCompactLayout ? COMPACT_ITEM_GAP : ITEM_GAP,
                            paddingVertical: isCompactLayout
                              ? COMPACT_ITEM_GAP
                              : ITEM_GAP,
                            width: isCompactLayout ? '48%' : '100%',
                          }}
                          testID={`purchase-guide-export-item-${group.id}-${itemIndex}`}
                        >
                          <View
                            style={{
                              alignItems: 'center',
                              backgroundColor: item.isPriority
                                ? PREVIEW_RED
                                : PREVIEW_GREEN,
                              borderRadius:
                                (isCompactLayout
                                  ? COMPACT_CHECK_MARK_SIZE
                                  : CHECK_MARK_SIZE) / 2,
                              height: isCompactLayout
                                ? COMPACT_CHECK_MARK_SIZE
                                : CHECK_MARK_SIZE,
                              justifyContent: 'center',
                              width: isCompactLayout
                                ? COMPACT_CHECK_MARK_SIZE
                                : CHECK_MARK_SIZE,
                            }}
                          >
                            <Text
                              style={{
                                color: '#FFFFFF',
                                fontSize: isCompactLayout
                                  ? COMPACT_CHECK_MARK_FONT_SIZE
                                  : CHECK_MARK_FONT_SIZE,
                                fontWeight: '700',
                              }}
                            >
                              {item.isPriority ? '!' : '✓'}
                            </Text>
                          </View>
                          <Text
                            style={{
                              color: item.isPriority
                                ? PREVIEW_RED_TEXT
                                : PREVIEW_TEXT,
                              flex: 1,
                              fontSize: isCompactLayout
                                ? COMPACT_ITEM_FONT_SIZE
                                : ITEM_FONT_SIZE,
                              fontWeight: item.isPriority ? '700' : '400',
                              lineHeight: isCompactLayout
                                ? COMPACT_ITEM_LINE_HEIGHT
                                : ITEM_LINE_HEIGHT,
                            }}
                          >
                            {item.label}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}

                <Text
                  style={{
                    color: PREVIEW_MUTED,
                    fontSize: 12,
                    marginTop: 24,
                    textAlign: 'center',
                  }}
                >
                  {t('screen_purchase_guide.export.image_footer')}
                </Text>
              </View>
            </View>
          </ScrollView>

          <View
            style={[
              layout.row,
              gutters.gap_12,
              gutters.padding_16,
              backgrounds.surface,
            ]}
          >
            <TouchableOpacity
              accessibilityRole="button"
              disabled={isSaving}
              onPress={closePreview}
              style={[
                layout.flex_1,
                layout.itemsCenter,
                gutters.paddingVertical_12,
                {
                  borderColor: colors.inputBorder,
                  borderRadius: 14,
                  borderWidth: 1,
                },
              ]}
            >
              <Text style={[fonts.size_14, fonts.gray800, fonts.bold]}>
                {t('screen_purchase_guide.export.close')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              disabled={isSaving}
              onPress={() => {
                void saveImage();
              }}
              style={[
                layout.flex_1,
                layout.itemsCenter,
                gutters.paddingVertical_12,
                {
                  backgroundColor: colors.blue500,
                  borderRadius: 14,
                  opacity: isSaving ? SAVING_OPACITY : 1,
                },
              ]}
              testID="purchase-guide-export-save"
            >
              <Text style={[fonts.size_14, fonts.bold, { color: '#FFFFFF' }]}>
                {isSaving
                  ? t('screen_purchase_guide.export.saving')
                  : t('screen_purchase_guide.export.save')}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

export default PurchaseListExporter;
