import type {
  CreateDocumentInput,
  CreateItemInput,
  TransactionPeriod,
} from './schema';

import type { ItemLocale } from '@/hooks/language/schema';

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
  toInventoryCatalog,
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
  serverItemSchema,
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

  createDocument: async (document: CreateDocumentInput) => {
    const response = await apiInstance
      .post('api/documents', { json: document })
      .json();
    return toDocumentDetail(serverDocumentDetailSchema.parse(response));
  },

  createItem: async (item: CreateItemInput) => {
    const response = await apiInstance.post('api/items', { json: item }).json();
    return serverItemSchema.parse(response);
  },

  fetchAlertBoard: async (locale: ItemLocale) => {
    const response = await apiInstance
      .get('api/alerts', { searchParams: { locale } })
      .json();
    const alerts = serverAlertsSchema.parse(response);
    return {
      items: toAlertDetails(alerts, locale),
      totals: toAlertTotals(alerts),
    };
  },
  fetchAlerts: async (limit: number, locale: ItemLocale) => {
    const response = await apiInstance
      .get('api/alerts', { searchParams: { limit, locale } })
      .json();
    return serverAlertsSchema
      .parse(response)
      .map((alert) => toAlertItem(alert, locale));
  },

  fetchDocumentDetail: async (documentId: string, locale: ItemLocale) => {
    const [documentResponse, itemsResponse] = await Promise.all([
      apiInstance.get(`api/documents/${documentId}`).json(),
      apiInstance
        .get('api/items', { searchParams: { flat: 1, locale } })
        .json(),
    ]);
    return toDocumentDetail(
      serverDocumentDetailSchema.parse(documentResponse),
      locale,
      serverItemsSchema.parse(itemsResponse),
    );
  },

  fetchIngredients: async (locale: ItemLocale) => {
    const response = await apiInstance
      .get('api/items', { searchParams: { flat: 1, locale } })
      .json();
    const items = serverItemsSchema.parse(response);
    return {
      groups: toGroupNames(items),
      items: toIngredientItems(items, locale),
    };
  },

  fetchInventoryCatalog: async (locale: ItemLocale) => {
    const response = await apiInstance
      .get('api/items', { searchParams: { flat: 1, locale } })
      .json();
    return toInventoryCatalog(serverItemsSchema.parse(response), locale);
  },
  // Trail phải dựng từ cây đầy đủ vì /api/items/:id không trả đường dẫn cha
  fetchItemDetail: async (itemId: string, locale: ItemLocale) => {
    const [detailResponse, treeResponse] = await Promise.all([
      apiInstance
        .get(`api/items/${itemId}`, { searchParams: { locale } })
        .json(),
      apiInstance
        .get('api/items', { searchParams: { flat: 1, locale } })
        .json(),
    ]);
    const item = serverItemDetailSchema.parse(detailResponse);
    const tree = serverItemsSchema.parse(treeResponse);
    return toItemDetail(item, buildItemTrail(item, tree), locale);
  },
  fetchItemLedger: async (itemId: string, locale: ItemLocale) => {
    const response = await apiInstance
      .get('api/transactions', {
        searchParams: { item_id: itemId, limit: LEDGER_LIMIT },
      })
      .json();
    return serverLedgerSchema
      .parse(response)
      .items.map((entry) => toLedgerEntry(entry, locale));
  },

  fetchItems: async (locale: ItemLocale) => {
    const response = await apiInstance
      .get('api/items', { searchParams: { flat: 1, locale } })
      .json();
    return toLeafInventoryItems(serverItemsSchema.parse(response), locale);
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

  fetchTransactions: async (period: TransactionPeriod = 'all') => {
    const response = await apiInstance
      .get('api/documents', {
        searchParams: { limit: DOCUMENTS_LIMIT, period },
      })
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

  updateItemPrice: async ({
    itemId,
    unitPrice,
  }: {
    readonly itemId: number;
    readonly unitPrice: number;
  }) => {
    const response = await apiInstance
      .patch(`api/items/${String(itemId)}`, {
        json: { unit_price: unitPrice },
      })
      .json();
    return serverItemDetailSchema.parse(response);
  },
};
