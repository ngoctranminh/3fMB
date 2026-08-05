import * as z from 'zod';

export const alertKindSchema = z.enum(['expired', 'expiring', 'low_stock']);

export const inventorySummarySchema = z.object({
  alert_count: z.number(),
  expiring_count: z.number(),
  low_stock_count: z.number(),
  overdue_count: z.number(),
  total_items: z.number(),
  total_value: z.number(),
});

export const serverAlertSchema = z.object({
  date: z.string(),
  full_name: z.string(),
  id: z.number(),
  kind: alertKindSchema,
  label: z.string(),
  name: z.string(),
  quantity: z.number(),
  unit: z.string(),
});

export const serverItemSchema = z.object({
  expires_at: z.string().nullable(),
  id: z.number(),
  min_quantity: z.number(),
  name: z.string(),
  parent_id: z.number().nullable(),
  quantity: z.number(),
  unit: z.string(),
  unit_price: z.number(),
});

export const valuePointSchema = z.object({
  date: z.string(),
  value: z.number(),
});

export const serverAlertsSchema = z.array(serverAlertSchema);

export const serverItemsSchema = z.array(serverItemSchema);

export const valueHistorySchema = z.array(valuePointSchema);

export type AlertItem = {
  readonly date: string;
  readonly id: string;
  readonly quantity: string;
  readonly severity: 'expired' | 'low';
  readonly title: string;
};

export type AlertKind = z.infer<typeof alertKindSchema>;

export type ChartPoint = {
  readonly label: string;
  readonly value: number;
};

export type InventoryItem = {
  readonly fullName: string;
  readonly id: string;
  readonly isLow: boolean;
  readonly name: string;
  readonly quantity: string;
  readonly status: 'expired' | 'low' | 'ok';
  readonly unit: string;
};

export type InventorySummary = z.infer<typeof inventorySummarySchema>;

export type ServerAlert = z.infer<typeof serverAlertSchema>;

export type ServerItem = z.infer<typeof serverItemSchema>;

export type ValuePoint = z.infer<typeof valuePointSchema>;
