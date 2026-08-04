export type AlertItem = {
  readonly date: string;
  readonly id: string;
  readonly quantity: string;
  readonly severity: 'expired' | 'low';
  readonly title: string;
};

export type ChartPoint = {
  readonly label: string;
  readonly value: number;
};

export type InventoryItem = {
  readonly emoji: string;
  readonly id: string;
  readonly isLow: boolean;
  readonly name: string;
  readonly quantity: string;
  readonly status: 'expired' | 'low' | 'ok';
  readonly unit: string;
};

export const STOCK_VALUE_POINTS: readonly ChartPoint[] = [
  { label: '06/05', value: 29_000_000 },
  { label: '07/05', value: 32_000_000 },
  { label: '08/05', value: 28_500_000 },
  { label: '09/05', value: 40_000_000 },
  { label: '10/05', value: 30_500_000 },
  { label: '11/05', value: 42_000_000 },
  { label: '12/05', value: 44_500_000 },
];

export const ALERTS: readonly AlertItem[] = [
  {
    date: '12/05/2025',
    id: 'alert-beef',
    quantity: '1.2 kg',
    severity: 'low',
    title: 'Thịt bò',
  },
  {
    date: '12/05/2025',
    id: 'alert-herb',
    quantity: '0.2 kg',
    severity: 'low',
    title: 'Rau răm',
  },
  {
    date: '11/05/2025',
    id: 'alert-milk',
    quantity: '11/05/2025',
    severity: 'expired',
    title: 'Sữa tươi',
  },
  {
    date: '10/05/2025',
    id: 'alert-coconut',
    quantity: '10/05/2025',
    severity: 'expired',
    title: 'Nước cốt dừa',
  },
];

export const INVENTORY: readonly InventoryItem[] = [
  {
    emoji: '🥩',
    id: 'item-beef',
    isLow: true,
    name: 'Thịt bò',
    quantity: '1.2',
    status: 'low',
    unit: 'kg',
  },
  {
    emoji: '🌿',
    id: 'item-herb',
    isLow: true,
    name: 'Rau răm',
    quantity: '0.2',
    status: 'low',
    unit: 'kg',
  },
  {
    emoji: '🍚',
    id: 'item-rice',
    isLow: false,
    name: 'Gạo tấm thơm',
    quantity: '25',
    status: 'ok',
    unit: 'kg',
  },
  {
    emoji: '🥛',
    id: 'item-milk',
    isLow: true,
    name: 'Sữa tươi',
    quantity: '5',
    status: 'expired',
    unit: 'lít',
  },
  {
    emoji: '🍶',
    id: 'item-sauce',
    isLow: false,
    name: 'Nước mắm',
    quantity: '3',
    status: 'ok',
    unit: 'lít',
  },
];
