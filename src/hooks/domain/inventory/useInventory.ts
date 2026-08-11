import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { InventoryServices } from './inventoryService';

const enum InventoryQueryKey {
  fetchAlertBoard = 'fetchInventoryAlertBoard',
  fetchAlerts = 'fetchInventoryAlerts',
  fetchDocumentDetail = 'fetchInventoryDocumentDetail',
  fetchIngredients = 'fetchInventoryIngredients',
  fetchItemDetail = 'fetchInventoryItemDetail',
  fetchItemLedger = 'fetchInventoryItemLedger',
  fetchItems = 'fetchInventoryItems',
  fetchSummary = 'fetchInventorySummary',
  fetchTodayTotals = 'fetchInventoryTodayTotals',
  fetchTransactions = 'fetchInventoryTransactions',
  fetchValueHistory = 'fetchInventoryValueHistory',
}

const useFetchDocumentDetailQuery = (documentId: string) =>
  useQuery({
    queryFn: () => InventoryServices.fetchDocumentDetail(documentId),
    queryKey: [InventoryQueryKey.fetchDocumentDetail, documentId],
  });

const useFetchItemDetailQuery = (itemId: string) =>
  useQuery({
    queryFn: () => InventoryServices.fetchItemDetail(itemId),
    queryKey: [InventoryQueryKey.fetchItemDetail, itemId],
  });

const useFetchItemLedgerQuery = (itemId: string) =>
  useQuery({
    queryFn: () => InventoryServices.fetchItemLedger(itemId),
    queryKey: [InventoryQueryKey.fetchItemLedger, itemId],
  });

const useFetchAlertBoardQuery = () =>
  useQuery({
    queryFn: () => InventoryServices.fetchAlertBoard(),
    queryKey: [InventoryQueryKey.fetchAlertBoard],
  });

const useFetchAlertsQuery = (limit: number) =>
  useQuery({
    queryFn: () => InventoryServices.fetchAlerts(limit),
    queryKey: [InventoryQueryKey.fetchAlerts, limit],
  });

const useFetchIngredientsQuery = () =>
  useQuery({
    queryFn: () => InventoryServices.fetchIngredients(),
    queryKey: [InventoryQueryKey.fetchIngredients],
  });

const useFetchItemsQuery = () =>
  useQuery({
    queryFn: () => InventoryServices.fetchItems(),
    queryKey: [InventoryQueryKey.fetchItems],
  });

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

const useFetchTransactionsQuery = () =>
  useQuery({
    queryFn: () => InventoryServices.fetchTransactions(),
    queryKey: [InventoryQueryKey.fetchTransactions],
  });

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

  return {
    invalidateQuery,
    useAdjustQuantityMutation,
    useCancelDocumentMutation,
    useFetchAlertBoardQuery,
    useFetchAlertsQuery,
    useFetchDocumentDetailQuery,
    useFetchIngredientsQuery,
    useFetchItemDetailQuery,
    useFetchItemLedgerQuery,
    useFetchItemsQuery,
    useFetchSummaryQuery,
    useFetchTodayTotalsQuery,
    useFetchTransactionsQuery,
    useFetchValueHistoryQuery,
  };
};
