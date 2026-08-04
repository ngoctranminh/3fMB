import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useTheme } from '@/theme';

import { Card } from '@/components/atoms';
import { AlertRow, SectionHeader } from '@/components/molecules';
import type { AlertItem } from '@/screens/Overview/mockData';

type Properties = {
  readonly alerts: readonly AlertItem[];
  readonly onSeeAll?: () => void;
};

function AlertsCard({ alerts, onSeeAll = undefined }: Properties) {
  const { t } = useTranslation();
  const { backgrounds, gutters } = useTheme();

  return (
    <Card>
      <SectionHeader
        actionLabel={t('screen_overview.alerts.see_all')}
        onAction={onSeeAll}
        title={t('screen_overview.alerts.title')}
      />

      <View style={[gutters.marginTop_16, gutters.gap_12]}>
        {alerts.map((alert, index) => (
          <Fragment key={alert.id}>
            {index > 0 ? (
              <View style={[backgrounds.gray100, { height: 1 }]} />
            ) : undefined}
            <AlertRow
              date={alert.date}
              quantity={alert.quantity}
              severity={alert.severity}
              title={alert.title}
            />
          </Fragment>
        ))}
      </View>
    </Card>
  );
}

export default AlertsCard;
