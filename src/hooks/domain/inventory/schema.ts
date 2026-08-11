import * as z from 'zod';

export const alertKindSchema = z.enum(['expired', 'expiring', 'low_stock']);

export const documentSubtypeSchema = z.enum([
  'other_in',
  'other_out',
  'purchase',
  'return',
  'usage',
  'waste',
]);

export const inventorySummarySchema = z.object({
  alert_count: z.number(),
  expiring_count: z.number(),
  low_stock_count: z.number(),
  overdue_count: z.number(),
  total_items: z.number(),
  total_value: z.number(),
});

export const serverDocumentSchema = z.object({
  code: z.string(),
  created_by: z.string(),
  id: z.number(),
  occurred_at_label: z.string(),
  party: z.string(),
  status: z.enum(['cancelled', 'completed']),
  subtype: documentSubtypeSchema,
  subtype_label: z.string(),
  total_value: z.number(),
  type: z.enum(['in', 'out']),
});

export const serverDocumentsSchema = z.object({
  items: z.array(serverDocumentSchema),
  total: z.number(),
});

const periodTotalSchema = z.object({
  count: z.number(),
  total: z.number(),
});

export const documentsSummarySchema = z.object({
  date: z.string(),
  in: periodTotalSchema,
  out: periodTotalSchema,
});

export const serverAlertSchema = z.object({
  date: z.string(),
  full_name: z.string(),
  id: z.number(),
  kind: alertKindSchema,
  label: z.string(),
  min_quantity: z.number(),
  name: z.string(),
  quantity: z.number(),
  unit: z.string(),
  updated_at: z.string(),
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

export const serverItemDetailSchema = serverItemSchema.extend({
  note: z.string(),
});

export const serverLedgerEntrySchema = z.object({
  delta: z.number(),
  id: z.number(),
  item_unit: z.string(),
  kind: z.enum(['in', 'out']),
  note: z.string(),
  occurred_at: z.string(),
  total_price: z.number(),
});

export const serverLedgerSchema = z.object({
  items: z.array(serverLedgerEntrySchema),
  total: z.number(),
});

export const serverDocumentLineSchema = z.object({
  id: z.number(),
  item_full_name: z.string(),
  item_id: z.number(),
  item_name: z.string(),
  item_unit: z.string(),
  note: z.string(),
  quantity: z.number(),
  total_price: z.number(),
  unit_price: z.number(),
});

export const serverDocumentDetailSchema = serverDocumentSchema.extend({
  lines: z.array(serverDocumentLineSchema),
  note: z.string(),
  occurred_at: z.string(),
  status_label: z.string(),
  type_label: z.string(),
});

export type AlertDetail = {
  readonly date: string;
  readonly fullName: string;
  readonly group: AlertGroup;
  readonly id: string;
  readonly name: string;
  readonly quantity: string;
  readonly reorderLevel: string;
  readonly severity: AlertSeverity;
  readonly statusLabel: string;
};

export type AlertGroup = 'earlier' | 'today' | 'yesterday';

export type AlertItem = {
  readonly date: string;
  readonly id: string;
  readonly quantity: string;
  readonly severity: 'expired' | 'low';
  readonly title: string;
};

export type AlertKind = z.infer<typeof alertKindSchema>;

export type AlertSeverity = 'expiring' | 'low' | 'out';

export type AlertTotals = {
  readonly expiring: number;
  readonly low: number;
  readonly out: number;
};

export type ChartPoint = {
  readonly label: string;
  readonly value: number;
};

export type CreateDocumentInput = {
  readonly created_by: string;
  readonly lines: readonly {
    readonly item_id: number;
    readonly note: string;
    readonly quantity: number;
    readonly unit_price?: number;
  }[];
  readonly note: string;
  readonly party: string;
  readonly subtype: DocumentSubtype;
};

export type CreateItemInput = {
  readonly expires_at: string | undefined;
  readonly min_quantity: number;
  readonly name: string;
  readonly note: string;
  readonly parent_id: number;
  readonly quantity: number;
  readonly unit: string;
  readonly unit_price: number;
};

export type DocumentDetail = {
  readonly canCancel: boolean;
  readonly code: string;
  readonly date: string;
  readonly id: string;
  readonly kind: TransactionKind;
  readonly lines: readonly DocumentLine[];
  readonly note: string;
  readonly partner: string;
  readonly status: 'cancelled' | 'done';
  readonly statusLabel: string;
  readonly subtypeLabel: string;
  readonly totalValue: string;
  readonly user: string;
};

export type DocumentLine = {
  readonly fullName: string;
  readonly id: string;
  readonly name: string;
  readonly note: string;
  readonly quantity: string;
  readonly totalPrice: string;
  readonly unitPrice: string;
};

export type DocumentsSummary = z.infer<typeof documentsSummarySchema>;

export type DocumentSubtype = z.infer<typeof documentSubtypeSchema>;

export type IngredientItem = {
  readonly fullName: string;
  readonly group: string;
  readonly id: string;
  readonly isLow: boolean;
  readonly name: string;
  readonly quantity: string;
  readonly status: 'expired' | 'low' | 'ok';
  readonly unit: string;
  readonly value: string;
};

export type InventoryCatalog = {
  readonly groups: readonly {
    readonly id: string;
    readonly name: string;
  }[];
  readonly items: readonly {
    readonly fullName: string;
    readonly id: string;
    readonly name: string;
    readonly unit: string;
    readonly unitPrice: number;
  }[];
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

export type ItemDetail = {
  readonly expiresAt: null | string;
  readonly fullName: string;
  readonly id: number;
  readonly minQuantity: string;
  readonly name: string;
  readonly note: string;
  readonly quantity: number;
  readonly quantityLabel: string;
  readonly status: 'expired' | 'low' | 'ok';
  readonly totalValue: string;
  readonly unit: string;
  readonly unitPrice: string;
};

export type LedgerEntry = {
  readonly deltaLabel: string;
  readonly id: string;
  readonly isIncoming: boolean;
  readonly note: string;
  readonly occurredAt: string;
  readonly totalPrice: string;
};

export type ServerAlert = z.infer<typeof serverAlertSchema>;

export type ServerDocument = z.infer<typeof serverDocumentSchema>;

export type ServerDocumentDetail = z.infer<typeof serverDocumentDetailSchema>;

export type ServerItem = z.infer<typeof serverItemSchema>;

export type ServerItemDetail = z.infer<typeof serverItemDetailSchema>;

export type ServerLedgerEntry = z.infer<typeof serverLedgerEntrySchema>;

export type TodayTotals = {
  readonly exportCount: number;
  readonly exportValue: string;
  readonly importCount: number;
  readonly importValue: string;
};

export type TransactionItem = {
  readonly code: string;
  readonly date: string;
  readonly id: string;
  readonly kind: TransactionKind;
  readonly partner: string;
  readonly status: 'cancelled' | 'done';
  readonly subtype: DocumentSubtype;
  readonly subtypeLabel: string;
  readonly user: string;
  readonly value: string;
};

export type TransactionKind = 'export' | 'import';

export type TransactionPeriod = 'all' | 'month' | 'today' | 'week';

export type ValuePoint = z.infer<typeof valuePointSchema>;
