import type { TouchableOpacityProps } from 'react-native';

import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

import { IconByVariant, StatusPill } from '@/components/atoms';
import type { InventoryItem } from '@/screens/Overview/mockData';

type Properties = {
  readonly item: InventoryItem;
} & TouchableOpacityProps;

const CHEVRON_SIZE = 16;
const DOT_SIZE = 8;
const THUMB_SIZE = 40;

function IngredientRow({ item, style, ...props }: Properties) {
  const { t } = useTranslation();
  const { borders, colors, fonts, gutters, layout } = useTheme();

  const statusLabels = {
    expired: t('screen_overview.inventory.status_expired'),
    low: t('screen_overview.inventory.status_low'),
    ok: t('screen_overview.inventory.status_ok'),
  };

  const statusTones = {
    expired: 'danger',
    low: 'danger',
    ok: 'success',
  } as const;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      {...props}
      style={[layout.row, layout.itemsCenter, gutters.gap_12, style]}
    >
      <View
        style={[
          layout.justifyCenter,
          layout.itemsCenter,
          borders.rounded_8,
          {
            backgroundColor: colors.surfaceSunken,
            height: THUMB_SIZE,
            width: THUMB_SIZE,
          },
        ]}
      >
        <Text style={[fonts.size_20]}>{item.emoji}</Text>
      </View>

      <Text style={[layout.flex_1, fonts.size_14, fonts.gray800]}>
        {item.name}
      </Text>

      <Text style={[fonts.size_12, fonts.gray200]}>{item.unit}</Text>

      <View style={[layout.row, layout.itemsCenter, gutters.gap_4]}>
        <Text
          style={[
            fonts.size_14,
            item.isLow ? fonts.red500 : fonts.gray800,
            fonts.bold,
          ]}
        >
          {item.quantity}
        </Text>
        <View
          style={[
            {
              backgroundColor: item.isLow ? colors.red500 : colors.green500,
              borderRadius: DOT_SIZE / 2,
              height: DOT_SIZE,
              width: DOT_SIZE,
            },
          ]}
        />
      </View>

      <StatusPill
        label={statusLabels[item.status]}
        tone={statusTones[item.status]}
      />

      <IconByVariant
        height={CHEVRON_SIZE}
        path="chevron-right"
        stroke={colors.gray200}
        width={CHEVRON_SIZE}
      />
    </TouchableOpacity>
  );
}

export default IngredientRow;
