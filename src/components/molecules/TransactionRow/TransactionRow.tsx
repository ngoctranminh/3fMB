import type { TouchableOpacityProps } from 'react-native';

import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';

import type { TransactionItem } from '@/hooks/domain/inventory/schema';
import { useTheme } from '@/theme';

import { IconByVariant, StatusPill, TagChip } from '@/components/atoms';

type Properties = {
  readonly item: TransactionItem;
} & TouchableOpacityProps;

const CHEVRON_SIZE = 16;
const META_ICON_SIZE = 12;
const THUMB_SIZE = 44;
const THUMB_ICON_SIZE = 22;

function TransactionRow({ item, style, ...props }: Properties) {
  const { t } = useTranslation();
  const { borders, colors, fonts, gutters, layout } = useTheme();

  const kinds = {
    export: {
      background: colors.green50,
      iconPath: 'tray-up',
      tint: colors.green500,
      valueColor: colors.amber500,
    },
    import: {
      background: colors.blue50,
      iconPath: 'tray-down',
      tint: colors.blue500,
      valueColor: colors.blue500,
    },
  } as const;

  const statusTones = {
    cancelled: 'danger',
    done: 'success',
  } as const;

  const { background, iconPath, tint, valueColor } = kinds[item.kind];

  return (
    <TouchableOpacity
      accessibilityRole="button"
      {...props}
      style={[
        layout.row,
        layout.itemsCenter,
        gutters.gap_12,
        gutters.paddingVertical_12,
        style,
      ]}
    >
      <View
        style={[
          layout.justifyCenter,
          layout.itemsCenter,
          borders.rounded_12,
          {
            backgroundColor: background,
            height: THUMB_SIZE,
            width: THUMB_SIZE,
          },
        ]}
      >
        <IconByVariant
          height={THUMB_ICON_SIZE}
          path={iconPath}
          stroke={tint}
          width={THUMB_ICON_SIZE}
        />
      </View>

      <View style={[layout.flex_1, gutters.gap_4]}>
        <View style={[layout.row, layout.itemsCenter, gutters.gap_8]}>
          <Text style={[fonts.size_14, fonts.gray800, fonts.bold]}>
            {item.code}
          </Text>
          <TagChip
            background={background}
            label={t(`screen_transactions.kinds.${item.kind}`)}
            tint={tint}
          />
        </View>

        <Text style={[fonts.size_12, fonts.gray400]}>{item.partner}</Text>

        <View
          style={[layout.row, layout.itemsCenter, layout.wrap, gutters.gap_12]}
        >
          <View style={[layout.row, layout.itemsCenter, gutters.gap_4]}>
            <IconByVariant
              height={META_ICON_SIZE}
              path="calendar"
              stroke={colors.gray200}
              width={META_ICON_SIZE}
            />
            <Text style={[fonts.size_10, fonts.gray200]}>{item.date}</Text>
          </View>

          <View style={[layout.row, layout.itemsCenter, gutters.gap_4]}>
            <IconByVariant
              height={META_ICON_SIZE}
              path="user"
              stroke={colors.gray200}
              width={META_ICON_SIZE}
            />
            <Text style={[fonts.size_10, fonts.gray200]}>{item.user}</Text>
          </View>
        </View>
      </View>

      <View style={[layout.itemsEnd, gutters.gap_8]}>
        <Text style={[fonts.size_14, fonts.bold, { color: valueColor }]}>
          {item.value}
        </Text>
        <StatusPill
          label={t(`screen_transactions.statuses.${item.status}`)}
          tone={statusTones[item.status]}
        />
      </View>

      <IconByVariant
        height={CHEVRON_SIZE}
        path="chevron-right"
        stroke={colors.gray200}
        width={CHEVRON_SIZE}
      />
    </TouchableOpacity>
  );
}

export default TransactionRow;
