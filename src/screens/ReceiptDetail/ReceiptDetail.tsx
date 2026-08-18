import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useInventory } from '@/hooks';
import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { useTheme } from '@/theme';

import { Card, IconByVariant, StatusPill } from '@/components/atoms';
import { DetailField, SectionHeader } from '@/components/molecules';
import { SafeScreen } from '@/components/templates';

import { resolveApiUrl } from '@/services/instance';

const CONTENT_GAP = 16;
const ICON_SIZE = 24;

function ReceiptDetail({
  navigation,
  route,
}: RootScreenProps<Paths.ReceiptDetail>) {
  const { documentId } = route.params;
  const { t } = useTranslation();
  const { backgrounds, colors, components, fonts, gutters, layout } =
    useTheme();
  const { useCancelDocumentMutation, useFetchDocumentDetailQuery } =
    useInventory();
  const documentQuery = useFetchDocumentDetailQuery(documentId);
  const cancelMutation = useCancelDocumentMutation();

  const receipt = documentQuery.data;
  const photoUrl = receipt?.imageUrl
    ? resolveApiUrl(receipt.imageUrl)
    : undefined;

  const handleCancel = () => {
    cancelMutation.mutate(documentId);
  };

  const handleResetError = () => {
    void documentQuery.refetch();
  };

  return (
    <SafeScreen
      edges={['top', 'left', 'right']}
      isError={documentQuery.isError}
      onResetError={handleResetError}
    >
      <View
        style={[layout.flex_1, backgrounds.surfaceSunken]}
        testID="receipt-detail-screen"
      >
        <ScrollView
          contentContainerStyle={[
            gutters.gap_16,
            gutters.paddingVertical_16,
            gutters.paddingHorizontal_16,
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[layout.row, layout.itemsCenter, gutters.gap_12]}>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => {
                navigation.goBack();
              }}
              testID="receipt-detail-back"
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
                {receipt?.code ?? t('screen_receipt_detail.title')}
              </Text>
              <Text style={[fonts.size_12, fonts.gray200]}>
                {receipt?.subtypeLabel ?? ''}
              </Text>
            </View>

            {receipt ? (
              <StatusPill
                label={receipt.statusLabel}
                tone={receipt.status === 'done' ? 'success' : 'danger'}
              />
            ) : undefined}
          </View>

          <Card>
            <DetailField
              label={t('screen_receipt_detail.partner')}
              value={receipt?.partner ?? '—'}
            />
            <DetailField
              label={t('screen_receipt_detail.date')}
              value={receipt?.date ?? '—'}
            />
            <DetailField
              label={t('screen_receipt_detail.user')}
              value={receipt?.user ?? '—'}
            />
            <DetailField
              label={t('screen_receipt_detail.total')}
              value={receipt?.totalValue ?? '—'}
            />
            <DetailField
              label={t('screen_receipt_detail.note')}
              value={
                receipt?.note === undefined || receipt.note === ''
                  ? t('screen_receipt_detail.no_note')
                  : receipt.note
              }
            />
          </Card>

          {photoUrl ? (
            <Card style={[gutters.gap_12]}>
              <SectionHeader title={t('screen_receipt_detail.photo_title')} />
              <Image
                accessibilityLabel={t('screen_receipt_detail.photo_preview')}
                resizeMode="cover"
                source={{ uri: photoUrl }}
                style={{ borderRadius: 12, height: 240, width: '100%' }}
                testID="receipt-photo"
              />
            </Card>
          ) : undefined}

          <Card style={[gutters.gap_12]}>
            <SectionHeader title={t('screen_receipt_detail.lines_title')} />

            {receipt?.lines.length === 0 ? (
              <Text style={[components.categoryChipLabel]}>
                {t('screen_receipt_detail.lines_empty')}
              </Text>
            ) : undefined}

            {(receipt?.lines ?? []).map((line, index) => (
              <Fragment key={line.id}>
                {index > 0 ? (
                  <View style={[backgrounds.gray100, { height: 1 }]} />
                ) : undefined}
                <View
                  style={[
                    layout.row,
                    layout.itemsCenter,
                    gutters.gap_12,
                    gutters.paddingVertical_8,
                  ]}
                >
                  <View style={[layout.flex_1, gutters.gap_4]}>
                    <Text style={[fonts.size_14, fonts.gray800, fonts.bold]}>
                      {line.name}
                    </Text>
                    <Text style={[fonts.size_10, fonts.gray200]}>
                      {line.fullName}
                    </Text>
                  </View>

                  <View style={[layout.itemsEnd, gutters.gap_4]}>
                    <Text style={[fonts.size_14, fonts.gray800]}>
                      {line.quantity}
                    </Text>
                    <Text style={[fonts.size_10, fonts.gray200]}>
                      {line.totalPrice}
                    </Text>
                  </View>
                </View>
              </Fragment>
            ))}
          </Card>

          {receipt?.canCancel === true ? (
            <TouchableOpacity
              accessibilityRole="button"
              disabled={cancelMutation.isPending}
              onPress={handleCancel}
              style={[
                layout.itemsCenter,
                gutters.paddingVertical_12,
                components.iconButtonSquare,
                { backgroundColor: colors.red50, width: '100%' },
              ]}
              testID="receipt-cancel"
            >
              <Text style={[fonts.size_14, fonts.red500, fonts.bold]}>
                {cancelMutation.isPending
                  ? t('screen_receipt_detail.cancelling')
                  : t('screen_receipt_detail.cancel')}
              </Text>
            </TouchableOpacity>
          ) : undefined}

          {receipt?.status === 'cancelled' ? (
            <Text style={[fonts.size_12, fonts.gray200]}>
              {t('screen_receipt_detail.cancelled_notice')}
            </Text>
          ) : undefined}

          {cancelMutation.isError ? (
            <Text style={[fonts.size_12, fonts.red500]}>
              {t('screen_receipt_detail.cancel_failed')}
            </Text>
          ) : undefined}

          <View style={{ height: CONTENT_GAP }} />
        </ScrollView>
      </View>
    </SafeScreen>
  );
}

export default ReceiptDetail;
