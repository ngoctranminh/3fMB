import { apiInstance } from '@/services/instance';

import {
  toAlertDetails,
  toAlertItem,
  toAlertTotals,
  toChartPoint,
  toGroupNames,
  toIngredientItems,
  toLeafInventoryItems,
  toTodayTotals,
  toTransactionItem,
} from './adapters';
import {
  documentsSummarySchema,
  inventorySummarySchema,
  serverAlertsSchema,
  serverDocumentsSchema,
  serverItemsSchema,
  valueHistorySchema,
} from './schema';

const DOCUMENTS_LIMIT = 50;

export const InventoryServices = {
  fetchAlertBoard: async () => {
    const response = await apiInstance.get('api/alerts').json();
    const alerts = serverAlertsSchema.parse(response);
    return { items: toAlertDetails(alerts), totals: toAlertTotals(alerts) };
  },

  fetchAlerts: async (limit: number) => {
    const response = await apiInstance
      .get('api/alerts', { searchParams: { limit } })
      .json();
    return serverAlertsSchema
      .parse(response)
      .map((alert) => toAlertItem(alert));
  },

  fetchIngredients: async () => {
    const response = await apiInstance
      .get('api/items', { searchParams: { flat: 1 } })
      .json();
    const items = serverItemsSchema.parse(response);
    return { groups: toGroupNames(items), items: toIngredientItems(items) };
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

  fetchTodayTotals: async () => {
    const response = await apiInstance
      .get('api/documents/summary', { searchParams: { period: 'today' } })
      .json();
    return toTodayTotals(documentsSummarySchema.parse(response));
  },

  fetchTransactions: async () => {
    const response = await apiInstance
      .get('api/documents', { searchParams: { limit: DOCUMENTS_LIMIT } })
      .json();
    return serverDocumentsSchema
      .parse(response)
      .items.map((document) => toTransactionItem(document));
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
