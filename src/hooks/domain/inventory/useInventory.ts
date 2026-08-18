import type { TransactionPeriod } from './schema';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { toItemLocale } from '@/hooks/language/schema';

import { InventoryServices } from './inventoryService';

const enum InventoryQueryKey {
  fetchAlertBoard = 'fetchInventoryAlertBoard',
  fetchAlerts = 'fetchInventoryAlerts',
  fetchDocumentDetail = 'fetchInventoryDocumentDetail',
  fetchIngredients = 'fetchInventoryIngredients',
  fetchInventoryCatalog = 'fetchInventoryCatalog',
  fetchItemDetail = 'fetchInventoryItemDetail',
  fetchItemLedger = 'fetchInventoryItemLedger',
  fetchItems = 'fetchInventoryItems',
  fetchSummary = 'fetchInventorySummary',
  fetchTodayTotals = 'fetchInventoryTodayTotals',
  fetchTransactions = 'fetchInventoryTransactions',
  fetchValueHistory = 'fetchInventoryValueHistory',
}

const useItemLocale = () => {
  const { i18n } = useTranslation();
  return toItemLocale(i18n.resolvedLanguage ?? i18n.language);
};

const useFetchDocumentDetailQuery = (documentId: string) => {
  const locale = useItemLocale();
  return useQuery({
    queryFn: () => InventoryServices.fetchDocumentDetail(documentId, locale),
    queryKey: [InventoryQueryKey.fetchDocumentDetail, documentId, locale],
  });
};

const useFetchItemDetailQuery = (itemId: string) => {
  const locale = useItemLocale();
  return useQuery({
    queryFn: () => InventoryServices.fetchItemDetail(itemId, locale),
    queryKey: [InventoryQueryKey.fetchItemDetail, itemId, locale],
  });
};

const useFetchItemLedgerQuery = (itemId: string) => {
  const locale = useItemLocale();
  return useQuery({
    queryFn: () => InventoryServices.fetchItemLedger(itemId, locale),
    queryKey: [InventoryQueryKey.fetchItemLedger, itemId, locale],
  });
};

const useFetchAlertBoardQuery = () => {
  const locale = useItemLocale();
  return useQuery({
    queryFn: () => InventoryServices.fetchAlertBoard(locale),
    queryKey: [InventoryQueryKey.fetchAlertBoard, locale],
  });
};

const useFetchAlertsQuery = (limit: number) => {
  const locale = useItemLocale();
  return useQuery({
    queryFn: () => InventoryServices.fetchAlerts(limit, locale),
    queryKey: [InventoryQueryKey.fetchAlerts, limit, locale],
  });
};

const useFetchIngredientsQuery = () => {
  const locale = useItemLocale();
  return useQuery({
    queryFn: () => InventoryServices.fetchIngredients(locale),
    queryKey: [InventoryQueryKey.fetchIngredients, locale],
  });
};

const useFetchItemsQuery = () => {
  const locale = useItemLocale();
  return useQuery({
    queryFn: () => InventoryServices.fetchItems(locale),
    queryKey: [InventoryQueryKey.fetchItems, locale],
  });
};

const useFetchSummaryQuery = () =>
  useQuery({
    queryFn: () => InventoryServices.fetchSummary(),
    queryKey: [InventoryQueryKey.fetchSummary],
  });

const useFetchTodayTotalsQuery = () =>
  useQuery({
    queryFn: () => InventoryServices.fetchTodayTotals(),
    queryKey: [InventoryQueryKey.fetchTodayTotals],
  });

const useFetchTransactionsQuery = (period: TransactionPeriod = 'all') =>
  useQuery({
    queryFn: () => InventoryServices.fetchTransactions(period),
    queryKey: [InventoryQueryKey.fetchTransactions, period],
  });

const useFetchInventoryCatalogQuery = () => {
  const locale = useItemLocale();
  return useQuery({
    queryFn: () => InventoryServices.fetchInventoryCatalog(locale),
    queryKey: [InventoryQueryKey.fetchInventoryCatalog, locale],
  });
};

const useFetchValueHistoryQuery = (days: number) =>
  useQuery({
    queryFn: () => InventoryServices.fetchValueHistory(days),
    queryKey: [InventoryQueryKey.fetchValueHistory, days],
  });

// Sửa tồn kho làm lệch mọi số liệu tổng nên phải xoá cache toàn domain
const ALL_QUERY_KEYS = [
  InventoryQueryKey.fetchAlertBoard,
  InventoryQueryKey.fetchAlerts,
  InventoryQueryKey.fetchDocumentDetail,
  InventoryQueryKey.fetchIngredients,
  InventoryQueryKey.fetchInventoryCatalog,
  InventoryQueryKey.fetchItemDetail,
  InventoryQueryKey.fetchItemLedger,
  InventoryQueryKey.fetchItems,
  InventoryQueryKey.fetchSummary,
  InventoryQueryKey.fetchTodayTotals,
  InventoryQueryKey.fetchTransactions,
  InventoryQueryKey.fetchValueHistory,
];

export const useInventory = () => {
  const client = useQueryClient();

  const invalidateQuery = (queryKeys: InventoryQueryKey[]) =>
    client.invalidateQueries({
      queryKey: queryKeys,
    });

  const invalidateAll = async () => {
    await Promise.all(
      ALL_QUERY_KEYS.map((key) =>
        client.invalidateQueries({ queryKey: [key] }),
      ),
    );
  };

  const useAdjustQuantityMutation = () =>
    useMutation({
      mutationFn: (variables: {
        readonly delta: number;
        readonly itemId: number;
      }) => InventoryServices.adjustItemQuantity(variables),
      onSuccess: invalidateAll,
    });

  const useCancelDocumentMutation = () =>
    useMutation({
      mutationFn: (documentId: string) =>
        InventoryServices.cancelDocument(documentId),
      onSuccess: invalidateAll,
    });

  const useCreateDocumentMutation = () =>
    useMutation({
      mutationFn: InventoryServices.createDocument,
      onSuccess: invalidateAll,
    });

  const useCreateItemMutation = () =>
    useMutation({
      mutationFn: InventoryServices.createItem,
      onSuccess: invalidateAll,
    });

  const useUpdateItemPriceMutation = () =>
    useMutation({
      mutationFn: (variables: {
        readonly itemId: number;
        readonly unitPrice: number;
      }) => InventoryServices.updateItemPrice(variables),
      onSuccess: invalidateAll,
    });

  return {
    invalidateQuery,
    useAdjustQuantityMutation,
    useCancelDocumentMutation,
    useCreateDocumentMutation,
    useCreateItemMutation,
    useFetchAlertBoardQuery,
    useFetchAlertsQuery,
    useFetchDocumentDetailQuery,
    useFetchIngredientsQuery,
    useFetchInventoryCatalogQuery,
    useFetchItemDetailQuery,
    useFetchItemLedgerQuery,
    useFetchItemsQuery,
    useFetchSummaryQuery,
    useFetchTodayTotalsQuery,
    useFetchTransactionsQuery,
    useFetchValueHistoryQuery,
    useUpdateItemPriceMutation,
  };
};
