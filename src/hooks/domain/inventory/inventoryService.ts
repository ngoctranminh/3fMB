import { apiInstance } from '@/services/instance';

import { toAlertItem, toChartPoint, toLeafInventoryItems } from './adapters';
import {
  inventorySummarySchema,
  serverAlertsSchema,
  serverItemsSchema,
  valueHistorySchema,
} from './schema';

export const InventoryServices = {
  fetchAlerts: async (limit: number) => {
    const response = await apiInstance
      .get('api/alerts', { searchParams: { limit } })
      .json();
    return serverAlertsSchema
      .parse(response)
      .map((alert) => toAlertItem(alert));
  },

  fetchItems: async () => {
    const response = await apiInstance
      .get('api/items', { searchParams: { flat: 1 } })
      .json();
    return toLeafInventoryItems(serverItemsSchema.parse(response));
  },

  fetchSummary: async () => {
    const response = await apiInstance.get('api/summary').json();
    return inventorySummarySchema.parse(response);
  },

  fetchValueHistory: async (days: number) => {
    const response = await apiInstance
      .get('api/stats/value-history', { searchParams: { days } })
      .json();
    return valueHistorySchema
      .parse(response)
      .map((point) => toChartPoint(point));
  },
};
