import type { TouchableOpacityProps } from 'react-native';

import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

import { IconByVariant, StatusPill } from '@/components/atoms';
import type { IngredientItem } from '@/screens/Ingredients/mockData';

type Properties = {
  readonly item: IngredientItem;
} & TouchableOpacityProps;

const CHEVRON_SIZE = 16;
const THUMB_SIZE = 44;

function IngredientDetailRow({ item, style, ...props }: Properties) {
  const { t } = useTranslation();
  const { borders, colors, fonts, gutters, layout } = useTheme();

  const statusLabels = {
    expired: t('screen_ingredients.status_expired'),
    low: t('screen_ingredients.status_low'),
    ok: t('screen_ingredients.status_ok'),
  };

  const statusTones = {
    expired: 'danger',
    low: 'warning',
    ok: 'success',
  } as const;

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
          borders.rounded_8,
          {
            backgroundColor: colors.surfaceSunken,
            height: THUMB_SIZE,
            width: THUMB_SIZE,
          },
        ]}
      >
        <Text style={[fonts.size_24]}>{item.emoji}</Text>
      </View>

      <View style={[layout.flex_1, gutters.gap_4]}>
        <Text style={[fonts.size_14, fonts.gray800, fonts.bold]}>
          {item.name}
        </Text>
        <Text style={[fonts.size_12, fonts.gray200]}>
          {t(`screen_ingredients.categories.${item.category}`)}
        </Text>

        <View
          style={[layout.row, layout.itemsCenter, layout.wrap, gutters.gap_8]}
        >
          <Text style={[fonts.size_10, fonts.gray200]}>
            {t('screen_ingredients.stock_label')}
          </Text>
          <Text
            style={[fonts.size_12, item.isLow ? fonts.red500 : fonts.gray800]}
          >
            {item.quantity} {item.unit}
          </Text>
          <Text style={[fonts.size_10, fonts.gray200]}>
            {t('screen_ingredients.value_label')}
          </Text>
          <Text style={[fonts.size_12, fonts.gray800]}>{item.value}</Text>
        </View>
      </View>

      <StatusPill
        hasDot
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

export default IngredientDetailRow;
