import type {
  AlertItem,
  ChartPoint,
  InventoryItem,
  ServerAlert,
  ServerItem,
  ValuePoint,
} from './schema';

const THOUSANDS_GROUP = /\B(?=(\d{3})+(?!\d))/g;
const MONTH_START = 5;
const MONTH_END = 10;
const DATE_LENGTH = 10;
const MONTH_OFFSET = 1;
const PAD_LENGTH = 2;

export const formatCurrency = (value: number) => {
  const rounded = Math.round(value);
  return `${String(rounded).replaceAll(THOUSANDS_GROUP, '.')}đ`;
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

  return {
    date: alert.date,
    id: String(alert.id),
    quantity: isLow
      ? `${String(alert.quantity)} ${alert.unit}`.trim()
      : alert.date,
    severity: isLow ? 'low' : 'expired',
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

const toStatus = (item: ServerItem, today: string): InventoryItem['status'] => {
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
const buildTrail = (item: ServerItem, byId: Map<number, ServerItem>) => {
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

// Node nhóm có quantity 0 và unit rỗng nên hiển thị vô nghĩa; chỉ giữ lá
export const toLeafInventoryItems = (
  items: readonly ServerItem[],
): readonly InventoryItem[] => {
  const byId = new Map(items.map((item) => [item.id, item]));
  const parentIds = new Set(
    items
      .map((item) => item.parent_id)
      .filter((id): id is number => id !== null),
  );
  const today = todayIsoDate();

  return items
    .filter((item) => !parentIds.has(item.id))
    .map((item) => {
      const status = toStatus(item, today);

      return {
        fullName: buildTrail(item, byId),
        id: String(item.id),
        isLow: status === 'low',
        name: item.name,
        quantity: String(item.quantity),
        status,
        unit: item.unit,
      };
    });
};
