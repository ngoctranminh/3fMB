import { useQuery, useQueryClient } from '@tanstack/react-query';

import { InventoryServices } from './inventoryService';

const enum InventoryQueryKey {
  fetchAlerts = 'fetchInventoryAlerts',
  fetchItems = 'fetchInventoryItems',
  fetchSummary = 'fetchInventorySummary',
  fetchValueHistory = 'fetchInventoryValueHistory',
}

const useFetchAlertsQuery = (limit: number) =>
  useQuery({
    queryFn: () => InventoryServices.fetchAlerts(limit),
    queryKey: [InventoryQueryKey.fetchAlerts, limit],
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
    useFetchAlertsQuery,
    useFetchItemsQuery,
    useFetchSummaryQuery,
    useFetchValueHistoryQuery,
  };
};
