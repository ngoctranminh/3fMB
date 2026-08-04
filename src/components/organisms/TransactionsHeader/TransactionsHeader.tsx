import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

import { IconByVariant } from '@/components/atoms';

type Properties = {
  readonly onBack?: () => void;
  readonly onFilter?: () => void;
  readonly onHistory?: () => void;
};

const BACK_SIZE = 24;
const ICON_SIZE = 22;

function TransactionsHeader({
  onBack = undefined,
  onFilter = undefined,
  onHistory = undefined,
}: Properties) {
  const { t } = useTranslation();
  const { colors, fonts, gutters, layout } = useTheme();

  const actions = [
    {
      handlePress: onHistory,
      iconPath: 'clock',
      label: t('screen_transactions.history'),
      testID: 'transactions-history',
    },
    {
      handlePress: onFilter,
      iconPath: 'filter',
      label: t('screen_transactions.filter'),
      testID: 'transactions-filter',
    },
  ] as const;

  return (
    <View style={[layout.row, layout.itemsCenter, gutters.gap_12]}>
      <TouchableOpacity
        accessibilityRole="button"
        onPress={onBack}
        testID="transactions-back"
      >
        <IconByVariant
          height={BACK_SIZE}
          path="chevron-left"
          stroke={colors.gray800}
          width={BACK_SIZE}
        />
      </TouchableOpacity>

      <Text style={[layout.flex_1, fonts.size_24, fonts.gray800, fonts.bold]}>
        {t('screen_transactions.title')}
      </Text>

      {actions.map((action) => (
        <TouchableOpacity
          accessibilityRole="button"
          key={action.iconPath}
          onPress={action.handlePress}
          style={[layout.itemsCenter, gutters.gap_4]}
          testID={action.testID}
        >
          <IconByVariant
            height={ICON_SIZE}
            path={action.iconPath}
            stroke={colors.gray800}
            width={ICON_SIZE}
          />
          <Text style={[fonts.size_10, fonts.gray200]}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default TransactionsHeader;
