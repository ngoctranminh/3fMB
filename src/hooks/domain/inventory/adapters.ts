import type {
  AlertDetail,
  AlertGroup,
  AlertItem,
  AlertSeverity,
  AlertTotals,
  ChartPoint,
  DocumentDetail,
  DocumentsSummary,
  IngredientItem,
  InventoryCatalog,
  InventoryItem,
  ItemDetail,
  LedgerEntry,
  ServerAlert,
  ServerDocument,
  ServerDocumentDetail,
  ServerItem,
  ServerItemDetail,
  ServerLedgerEntry,
  TodayTotals,
  TransactionItem,
  ValuePoint,
} from './schema';

import type { ItemLocale } from '@/hooks/language/schema';

const THOUSANDS_GROUP = /\B(?=(\d{3})+(?!\d))/g;
const MONTH_START = 5;
const MONTH_END = 10;
const DATE_LENGTH = 10;
const MONTH_OFFSET = 1;
const PAD_LENGTH = 2;
const TIME_LENGTH = 5;

const UNIT_LABELS: Readonly<
  Record<ItemLocale, Readonly<Record<string, string>>>
> = {
  'cs-CZ': {
    cái: 'kus',
    chai: 'láhev',
    cuộn: 'role',
    gói: 'balení',
    hộp: 'krabice',
  },
  'en-US': {
    cái: 'piece',
    chai: 'bottle',
    cuộn: 'roll',
    gói: 'pack',
    hộp: 'box',
  },
  'vi-VN': {},
};

export const localizeUnit = (unit: string, locale: ItemLocale) =>
  UNIT_LABELS[locale][unit] ?? unit;

export const formatCurrency = (value: number) => {
  const rounded = Math.round(value);
  return `${String(rounded).replaceAll(THOUSANDS_GROUP, '.')} Kč`;
};

// Server trả "2026-08-06 09:04:37" (không phải ISO) nên cắt chuỗi, không parse Date
export const toDateTimeLabel = (timestamp: string) => {
  const [date, time = ''] = timestamp.split(' ');
  const [year, month, day] = date.split('-');
  const clock = time.slice(0, TIME_LENGTH);
  return clock ? `${day}/${month}/${year} ${clock}` : `${day}/${month}/${year}`;
};

// Server trả "2026-07-31", không phải ISO có timezone, nên cắt chuỗi thay vì new Date()
export const toChartLabel = (date: string) => {
  const [month, day] = date.slice(MONTH_START, MONTH_END).split('-');
  return `${day}/${month}`;
};

export const toChartPoint = (point: ValuePoint): ChartPoint => ({
  label: toChartLabel(point.date),
  value: point.value,
});

// AlertRow hiển thị ngày hết hạn qua prop `quantity`, không phải `date`
export const toAlertItem = (
  alert: ServerAlert,
  locale: ItemLocale = 'vi-VN',
): AlertItem => {
  const isLow = alert.kind === 'low_stock';
  const severity = alert.quantity <= 0 ? 'out' : isLow ? 'low' : 'expired';
  const unit = localizeUnit(alert.unit, locale);

  return {
    date: alert.date,
    id: String(alert.id),
    quantity:
      isLow || severity === 'out'
        ? `${String(alert.quantity)} ${unit}`.trim()
        : alert.date,
    severity,
    title: alert.full_name,
  };
};

// expires_at là YYYY-MM-DD nên so sánh chuỗi đúng thứ tự thời gian
const todayIsoDate = () => {
  const now = new Date();
  const month = String(now.getMonth() + MONTH_OFFSET).padStart(PAD_LENGTH, '0');
  const day = String(now.getDate()).padStart(PAD_LENGTH, '0');
  return `${String(now.getFullYear())}-${month}-${day}`;
};

// Cộng ngày bằng UTC để đổi giờ mùa không làm lệch mất một ngày
const shiftIsoDate = (isoDate: string, days: number) => {
  const shifted = new Date(`${isoDate}T00:00:00Z`);
  shifted.setUTCDate(shifted.getUTCDate() + days);
  return shifted.toISOString().slice(0, DATE_LENGTH);
};

const toStatus = (item: ServerItem, today: string): InventoryItem['status'] => {
  if (item.quantity <= 0) {
    return 'out';
  }
  if (
    item.expires_at !== null &&
    item.expires_at.slice(0, DATE_LENGTH) < today
  ) {
    return 'expired';
  }
  if (item.min_quantity > 0 && item.quantity <= item.min_quantity) {
    return 'low';
  }
  return 'ok';
};

// Tên lá trùng nhau nhiều ("Đã làm" có ở cả Mực và Bò) nên cần đường dẫn cha
export const buildTrail = (item: ServerItem, byId: Map<number, ServerItem>) => {
  const names = [item.name];
  let parentId = item.parent_id;

  while (parentId !== null) {
    const parent = byId.get(parentId);
    if (!parent) {
      break;
    }
    names.unshift(parent.name);
    parentId = parent.parent_id;
  }

  return names.join(' / ');
};

// Server không trả nhóm ngày, tự suy từ updated_at ("2026-08-06 00:44:09")
const toAlertGroup = (updatedAt: string, today: string): AlertGroup => {
  const date = updatedAt.slice(0, DATE_LENGTH);

  if (date === today) {
    return 'today';
  }
  return date === shiftIsoDate(today, -1) ? 'yesterday' : 'earlier';
};

// quantity 0 là hết hàng hẳn, khác với sắp hết — UI tách thành 2 tab riêng
const toAlertSeverity = (alert: ServerAlert): AlertSeverity => {
  if (alert.quantity <= 0) {
    return 'out';
  }
  if (alert.kind === 'low_stock') {
    return 'low';
  }
  return 'expiring';
};

export const toAlertDetails = (
  alerts: readonly ServerAlert[],
  locale: ItemLocale = 'vi-VN',
): readonly AlertDetail[] => {
  const today = todayIsoDate();

  return alerts.map((alert) => ({
    date: alert.date,
    fullName: alert.full_name,
    group: toAlertGroup(alert.updated_at, today),
    id: String(alert.id),
    name: alert.name,
    quantity:
      `${String(alert.quantity)} ${localizeUnit(alert.unit, locale)}`.trim(),
    reorderLevel:
      `${String(alert.min_quantity)} ${localizeUnit(alert.unit, locale)}`.trim(),
    severity: toAlertSeverity(alert),
    statusLabel: alert.label,
  }));
};

export const toAlertTotals = (alerts: readonly ServerAlert[]): AlertTotals => ({
  expiring: alerts.filter((alert) => toAlertSeverity(alert) === 'expiring')
    .length,
  low: alerts.filter((alert) => toAlertSeverity(alert) === 'low').length,
  out: alerts.filter((alert) => toAlertSeverity(alert) === 'out').length,
});

const formatDocumentValue = (value: number) => formatCurrency(value);

export const toTransactionItem = (
  document: ServerDocument,
): TransactionItem => ({
  code: document.code,
  date: document.occurred_at_label,
  id: String(document.id),
  kind: document.type === 'in' ? 'import' : 'export',
  partner: document.party,
  status: document.status === 'completed' ? 'done' : 'cancelled',
  subtype: document.subtype,
  subtypeLabel: document.subtype_label,
  user: document.created_by,
  value: formatDocumentValue(document.total_value),
});

export const toTodayTotals = (summary: DocumentsSummary): TodayTotals => ({
  exportCount: summary.out.count,
  exportValue: formatDocumentValue(summary.out.total),
  importCount: summary.in.count,
  importValue: formatDocumentValue(summary.in.total),
});

// Gốc cây là nhóm hiển thị trên UI (Đông lạnh / Rau củ quả / Vệ sinh)
const buildRootName = (item: ServerItem, byId: Map<number, ServerItem>) => {
  let current = item;

  while (current.parent_id !== null) {
    const parent = byId.get(current.parent_id);
    if (!parent) {
      break;
    }
    current = parent;
  }

  return current.name;
};

// Node nhóm có quantity 0 và unit rỗng nên hiển thị vô nghĩa; chỉ giữ lá
const selectLeaves = (items: readonly ServerItem[]) => {
  const parentIds = new Set(
    items
      .map((item) => item.parent_id)
      .filter((id): id is number => id !== null),
  );

  return items.filter((item) => !parentIds.has(item.id));
};

export const toLeafInventoryItems = (
  items: readonly ServerItem[],
  locale: ItemLocale = 'vi-VN',
): readonly InventoryItem[] => {
  const byId = new Map(items.map((item) => [item.id, item]));
  const today = todayIsoDate();

  return selectLeaves(items).map((item) => {
    const status = toStatus(item, today);

    return {
      fullName: buildTrail(item, byId),
      id: String(item.id),
      isLow: status === 'low' || status === 'out',
      name: item.name,
      quantity: String(item.quantity),
      status,
      unit: localizeUnit(item.unit, locale),
    };
  });
};

export const toIngredientItems = (
  items: readonly ServerItem[],
  locale: ItemLocale = 'vi-VN',
): readonly IngredientItem[] => {
  const byId = new Map(items.map((item) => [item.id, item]));
  const today = todayIsoDate();

  return selectLeaves(items).map((item) => {
    const status = toStatus(item, today);

    return {
      fullName: buildTrail(item, byId),
      group: buildRootName(item, byId),
      id: String(item.id),
      isLow: status === 'low' || status === 'out',
      name: item.name,
      quantity: String(item.quantity),
      status,
      unit: localizeUnit(item.unit, locale),
      value: formatCurrency(item.quantity * item.unit_price),
    };
  });
};

// Chip lọc dựng từ gốc cây thật thay vì danh sách category cố định
export const toGroupNames = (items: readonly ServerItem[]) =>
  items.filter((item) => item.parent_id === null).map((item) => item.name);

export const toInventoryCatalog = (
  items: readonly ServerItem[],
  locale: ItemLocale = 'vi-VN',
): InventoryCatalog => {
  const byId = new Map(items.map((item) => [item.id, item]));

  return {
    groups: items
      .filter((item) => item.parent_id === null)
      .map((item) => ({ id: String(item.id), name: item.name })),
    items: selectLeaves(items).map((item) => ({
      fullName: buildTrail(item, byId),
      id: String(item.id),
      name: item.name,
      quantity: item.quantity,
      unit: localizeUnit(item.unit, locale),
      unitPrice: item.unit_price,
    })),
  };
};

// /api/items/:id không trả đường dẫn cha nên phải dựng từ cây phẳng
export const buildItemTrail = (
  item: ServerItem,
  items: readonly ServerItem[],
) => buildTrail(item, new Map(items.map((entry) => [entry.id, entry])));

export const toItemDetail = (
  item: ServerItemDetail,
  trail: string,
  locale: ItemLocale = 'vi-VN',
): ItemDetail => {
  const status = toStatus(item, todayIsoDate());
  const unit = localizeUnit(item.unit, locale);

  return {
    expiresAt: item.expires_at,
    fullName: trail,
    id: item.id,
    minQuantity: `${String(item.min_quantity)} ${unit}`.trim(),
    name: item.name,
    note: item.note,
    quantity: item.quantity,
    quantityLabel: `${String(item.quantity)} ${unit}`.trim(),
    status,
    totalValue: formatCurrency(item.quantity * item.unit_price),
    unit,
    unitPrice: formatCurrency(item.unit_price),
  };
};

export const toLedgerEntry = (
  entry: ServerLedgerEntry,
  locale: ItemLocale = 'vi-VN',
): LedgerEntry => {
  const isIncoming = entry.kind === 'in';
  const sign = isIncoming ? '+' : '−';

  return {
    deltaLabel:
      `${sign}${String(Math.abs(entry.delta))} ${localizeUnit(entry.item_unit, locale)}`.trim(),
    documentId: entry.document_id,
    id: String(entry.id),
    isIncoming,
    note: entry.note,
    // occurred_at là "2026-08-06 09:04:37", cắt chuỗi thay vì parse Date
    occurredAt: toDateTimeLabel(entry.occurred_at),
    source: entry.source,
    totalPrice: formatDocumentValue(entry.total_price),
    userId: entry.user_id,
    username: entry.username,
  };
};

export const toDocumentDetail = (
  document: ServerDocumentDetail,
  locale: ItemLocale = 'vi-VN',
  localizedItems: readonly ServerItem[] = [],
): DocumentDetail => {
  const localizedItemsById = new Map(
    localizedItems.map((item) => [item.id, item]),
  );

  return {
    canCancel: document.status === 'completed',
    code: document.code,
    date: document.occurred_at_label,
    id: String(document.id),
    imageUrl: document.image_url,
    kind: document.type === 'in' ? 'import' : 'export',
    lines: document.lines.map((line) => {
      const localizedItem = localizedItemsById.get(line.item_id);
      return {
        fullName: localizedItem
          ? buildTrail(localizedItem, localizedItemsById)
          : line.item_full_name,
        id: String(line.id),
        name: localizedItem?.name ?? line.item_name,
        note: line.note,
        quantity:
          `${String(line.quantity)} ${localizeUnit(line.item_unit, locale)}`.trim(),
        totalPrice: formatDocumentValue(line.total_price),
        unitPrice: formatDocumentValue(line.unit_price),
      };
    }),
    note: document.note,
    partner: document.party,
    status: document.status === 'completed' ? 'done' : 'cancelled',
    statusLabel: document.status_label,
    subtype: document.subtype,
    subtypeLabel: document.subtype_label,
    totalValue: formatDocumentValue(document.total_value),
    user: document.created_by,
  };
};
