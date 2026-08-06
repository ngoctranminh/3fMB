import { useQuery, useQueryClient } from '@tanstack/react-query';

import { InventoryServices } from './inventoryService';

const enum InventoryQueryKey {
  fetchAlertBoard = 'fetchInventoryAlertBoard',
  fetchAlerts = 'fetchInventoryAlerts',
  fetchIngredients = 'fetchInventoryIngredients',
  fetchItems = 'fetchInventoryItems',
  fetchSummary = 'fetchInventorySummary',
  fetchTodayTotals = 'fetchInventoryTodayTotals',
  fetchTransactions = 'fetchInventoryTransactions',
  fetchValueHistory = 'fetchInventoryValueHistory',
}

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

export const useInventory = () => {
  const client = useQueryClient();

  const invalidateQuery = (queryKeys: InventoryQueryKey[]) =>
    client.invalidateQueries({
      queryKey: queryKeys,
    });

  return {
    invalidateQuery,
    useFetchAlertBoardQuery,
    useFetchAlertsQuery,
    useFetchIngredientsQuery,
    useFetchItemsQuery,
    useFetchSummaryQuery,
    useFetchTodayTotalsQuery,
    useFetchTransactionsQuery,
    useFetchValueHistoryQuery,
  };
};
