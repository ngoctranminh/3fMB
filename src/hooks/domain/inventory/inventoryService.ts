import { apiInstance } from '@/services/instance';

import {
  buildItemTrail,
  toAlertDetails,
  toAlertItem,
  toAlertTotals,
  toChartPoint,
  toDocumentDetail,
  toGroupNames,
  toIngredientItems,
  toItemDetail,
  toLeafInventoryItems,
  toLedgerEntry,
  toTodayTotals,
  toTransactionItem,
} from './adapters';
import {
  documentsSummarySchema,
  inventorySummarySchema,
  serverAlertsSchema,
  serverDocumentDetailSchema,
  serverDocumentsSchema,
  serverItemDetailSchema,
  serverItemsSchema,
  serverLedgerSchema,
  valueHistorySchema,
} from './schema';

const DOCUMENTS_LIMIT = 50;
const LEDGER_LIMIT = 20;

export const InventoryServices = {
  adjustItemQuantity: async ({
    delta,
    itemId,
  }: {
    readonly delta: number;
    readonly itemId: number;
  }) => {
    const response = await apiInstance
      .post(`api/items/${String(itemId)}/adjust`, { json: { delta } })
      .json();
    return serverItemDetailSchema.parse(response);
  },

  cancelDocument: async (documentId: string) => {
    const response = await apiInstance
      .post(`api/documents/${documentId}/cancel`)
      .json();
    return toDocumentDetail(serverDocumentDetailSchema.parse(response));
  },

  fetchAlertBoard: async () => {
    const response = await apiInstance.get('api/alerts').json();
    const alerts = serverAlertsSchema.parse(response);
    return { items: toAlertDetails(alerts), totals: toAlertTotals(alerts) };
  },

  fetchDocumentDetail: async (documentId: string) => {
    const response = await apiInstance
      .get(`api/documents/${documentId}`)
      .json();
    return toDocumentDetail(serverDocumentDetailSchema.parse(response));
  },

  // Trail phải dựng từ cây đầy đủ vì /api/items/:id không trả đường dẫn cha
  fetchItemDetail: async (itemId: string) => {
    const [detailResponse, treeResponse] = await Promise.all([
      apiInstance.get(`api/items/${itemId}`).json(),
      apiInstance.get('api/items', { searchParams: { flat: 1 } }).json(),
    ]);
    const item = serverItemDetailSchema.parse(detailResponse);
    const tree = serverItemsSchema.parse(treeResponse);
    return toItemDetail(item, buildItemTrail(item, tree));
  },

  fetchItemLedger: async (itemId: string) => {
    const response = await apiInstance
      .get('api/transactions', {
        searchParams: { item_id: itemId, limit: LEDGER_LIMIT },
      })
      .json();
    return serverLedgerSchema
      .parse(response)
      .items.map((entry) => toLedgerEntry(entry));
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
