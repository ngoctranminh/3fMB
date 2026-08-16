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

const THOUSANDS_GROUP = /\B(?=(\d{3})+(?!\d))/g;
const MONTH_START = 5;
const MONTH_END = 10;
const DATE_LENGTH = 10;
const MONTH_OFFSET = 1;
const PAD_LENGTH = 2;
const TIME_LENGTH = 5;

export const formatCurrency = (value: number) => {
  const rounded = Math.round(value);
  return `${String(rounded).replaceAll(THOUSANDS_GROUP, '.')}đ`;
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
export const toAlertItem = (alert: ServerAlert): AlertItem => {
  const isLow = alert.kind === 'low_stock';
  const severity = alert.quantity <= 0 ? 'out' : isLow ? 'low' : 'expired';

  return {
    date: alert.date,
    id: String(alert.id),
    quantity:
      isLow || severity === 'out'
        ? `${String(alert.quantity)} ${alert.unit}`.trim()
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
): readonly AlertDetail[] => {
  const today = todayIsoDate();

  return alerts.map((alert) => ({
    date: alert.date,
    fullName: alert.full_name,
    group: toAlertGroup(alert.updated_at, today),
    id: String(alert.id),
    name: alert.name,
    quantity: `${String(alert.quantity)} ${alert.unit}`.trim(),
    reorderLevel: `${String(alert.min_quantity)} ${alert.unit}`.trim(),
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

// Transactions hiển thị tiền có khoảng trắng trước "đ", khác Overview/Ingredients
const formatDocumentValue = (value: number) =>
  `${formatCurrency(value).slice(0, -1)} đ`;

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
      unit: item.unit,
    };
  });
};

export const toIngredientItems = (
  items: readonly ServerItem[],
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
      unit: item.unit,
      value: formatCurrency(item.quantity * item.unit_price),
    };
  });
};

// Chip lọc dựng từ gốc cây thật thay vì danh sách category cố định
export const toGroupNames = (items: readonly ServerItem[]) =>
  items.filter((item) => item.parent_id === null).map((item) => item.name);

export const toInventoryCatalog = (
  items: readonly ServerItem[],
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
      unit: item.unit,
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
): ItemDetail => {
  const status = toStatus(item, todayIsoDate());

  return {
    expiresAt: item.expires_at,
    fullName: trail,
    id: item.id,
    minQuantity: `${String(item.min_quantity)} ${item.unit}`.trim(),
    name: item.name,
    note: item.note,
    quantity: item.quantity,
    quantityLabel: `${String(item.quantity)} ${item.unit}`.trim(),
    status,
    totalValue: formatCurrency(item.quantity * item.unit_price),
    unit: item.unit,
    unitPrice: formatCurrency(item.unit_price),
  };
};

export const toLedgerEntry = (entry: ServerLedgerEntry): LedgerEntry => {
  const isIncoming = entry.kind === 'in';
  const sign = isIncoming ? '+' : '−';

  return {
    deltaLabel:
      `${sign}${String(Math.abs(entry.delta))} ${entry.item_unit}`.trim(),
    id: String(entry.id),
    isIncoming,
    note: entry.note,
    // occurred_at là "2026-08-06 09:04:37", cắt chuỗi thay vì parse Date
    occurredAt: toDateTimeLabel(entry.occurred_at),
    totalPrice: formatDocumentValue(entry.total_price),
  };
};

export const toDocumentDetail = (
  document: ServerDocumentDetail,
): DocumentDetail => ({
  canCancel: document.status === 'completed',
  code: document.code,
  date: document.occurred_at_label,
  id: String(document.id),
  kind: document.type === 'in' ? 'import' : 'export',
  lines: document.lines.map((line) => ({
    fullName: line.item_full_name,
    id: String(line.id),
    name: line.item_name,
    note: line.note,
    quantity: `${String(line.quantity)} ${line.item_unit}`.trim(),
    totalPrice: formatDocumentValue(line.total_price),
    unitPrice: formatDocumentValue(line.unit_price),
  })),
  note: document.note,
  partner: document.party,
  status: document.status === 'completed' ? 'done' : 'cancelled',
  statusLabel: document.status_label,
  subtypeLabel: document.subtype_label,
  totalValue: formatDocumentValue(document.total_value),
  user: document.created_by,
});
