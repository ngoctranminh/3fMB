import type { TouchableOpacityProps } from 'react-native';

import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';

import type { AlertDetail } from '@/hooks/domain/inventory/schema';
import { useTheme } from '@/theme';

import { IconByVariant, TagChip } from '@/components/atoms';

type MetaLine = {
  readonly color: string;
  readonly id: string;
  readonly isStrong: boolean;
  readonly label?: string;
  readonly value: string;
};

type Properties = {
  readonly item: AlertDetail;
} & TouchableOpacityProps;

const CHEVRON_SIZE = 16;
const SEVERITY_ICON_SIZE = 22;
const THUMB_SIZE = 44;

function AlertDetailRow({ item, style, ...props }: Properties) {
  const { t } = useTranslation();
  const { borders, colors, fonts, gutters, layout } = useTheme();

  const severities = {
    expiring: {
      background: colors.blue50,
      iconPath: 'calendar',
      tint: colors.blue500,
    },
    low: {
      background: colors.amber50,
      iconPath: 'warning-triangle',
      tint: colors.amber500,
    },
    out: {
      background: colors.red50,
      iconPath: 'x-circle',
      tint: colors.red500,
    },
  } as const;

  const { background, iconPath, tint } = severities[item.severity];

  const getMetaLines = (): readonly MetaLine[] => {
    switch (item.severity) {
      case 'expiring': {
        return [
          {
            color: colors.blue500,
            id: 'expiry',
            isStrong: false,
            value: item.date,
          },
        ];
      }
      case 'low': {
        return [
          {
            color: colors.gray800,
            id: 'remaining',
            isStrong: true,
            label: t('screen_alerts.meta.remaining_label'),
            value: item.quantity,
          },
          {
            color: colors.gray400,
            id: 'reorder',
            isStrong: false,
            label: t('screen_alerts.meta.reorder_label'),
            value: item.reorderLevel,
          },
        ];
      }
      case 'out': {
        return [
          {
            color: colors.gray400,
            id: 'reorder',
            isStrong: false,
            label: t('screen_alerts.meta.reorder_label'),
            value: item.reorderLevel,
          },
        ];
      }
    }
  };

  const status = {
    color: tint,
    text:
      item.severity === 'out'
        ? t('screen_alerts.statuses.out')
        : item.statusLabel,
  };

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
          borders.w_1,
          {
            backgroundColor: background,
            borderColor: background,
            height: THUMB_SIZE,
            width: THUMB_SIZE,
          },
        ]}
      >
        <IconByVariant
          height={SEVERITY_ICON_SIZE}
          path={iconPath}
          stroke={tint}
          width={SEVERITY_ICON_SIZE}
        />
      </View>

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
        <Text style={[fonts.size_20, fonts.gray400, fonts.bold]}>
          {item.name.slice(0, 1).toUpperCase()}
        </Text>
      </View>

      <View style={[layout.flex_1, gutters.gap_4]}>
        <Text style={[fonts.size_14, fonts.gray800, fonts.bold]}>
          {item.name}
        </Text>
        <Text style={[fonts.size_12, { color: status.color }]}>
          {status.text}
        </Text>
        <View style={[layout.row]}>
          <TagChip
            background={colors.surfaceSunken}
            label={item.fullName}
            tint={colors.gray400}
          />
        </View>
      </View>

      <View style={[layout.itemsEnd, gutters.gap_4]}>
        {getMetaLines().map((line) => (
          <View
            key={line.id}
            style={[layout.row, layout.itemsCenter, gutters.gap_4]}
          >
            {line.label === undefined ? undefined : (
              <Text style={[fonts.size_10, fonts.gray200]}>{line.label}</Text>
            )}
            <Text
              style={[
                fonts.size_12,
                line.isStrong ? fonts.bold : undefined,
                { color: line.color },
              ]}
            >
              {line.value}
            </Text>
          </View>
        ))}
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

export default AlertDetailRow;
