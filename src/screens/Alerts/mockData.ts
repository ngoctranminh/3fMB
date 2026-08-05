export type AlertGroup = 'earlier' | 'today' | 'yesterday';

export type AlertItem =
  | ({
      readonly days: number;
      readonly expiryDate: string;
      readonly isExpired: boolean;
      readonly severity: 'expiring';
    } & AlertBase)
  | ({
      readonly days: number;
      readonly lastImportDate: string;
      readonly severity: 'overdue';
    } & AlertBase)
  | ({
      readonly quantity: string;
      readonly reorderLevel: string;
      readonly severity: 'low';
    } & AlertBase)
  | ({
      readonly reorderLevel: string;
      readonly severity: 'out';
    } & AlertBase);

export type AlertSeverity = 'expiring' | 'low' | 'out' | 'overdue';

type AlertBase = {
  readonly emoji: string;
  readonly group: AlertGroup;
  readonly id: string;
  readonly name: string;
  readonly warehouse: string;
};

export const ALERT_GROUPS = ['today', 'yesterday', 'earlier'] as const;

export const ALERT_TABS = [
  'all',
  'low',
  'out',
  'expiring',
  'overdue',
] as const;

export type AlertTab = (typeof ALERT_TABS)[number];

// Totals span the whole warehouse, so they run ahead of the rows listed below.
export const ALERT_TOTALS = {
  expiring: 7,
  low: 12,
  out: 5,
  overdue: 3,
} as const;

export const ALERTS: readonly AlertItem[] = [
  {
    emoji: '🥩',
    group: 'today',
    id: 'alert-beef',
    name: 'Thịt bò',
    quantity: '1.2 kg',
    reorderLevel: '2.4 kg',
    severity: 'low',
    warehouse: 'Kho bếp chính',
  },
  {
    emoji: '🌿',
    group: 'today',
    id: 'alert-herb',
    name: 'Rau răm',
    reorderLevel: '0.5 kg',
    severity: 'out',
    warehouse: 'Kho bếp chính',
  },
  {
    days: 1,
    emoji: '🥛',
    expiryDate: '11/05/2025',
    group: 'today',
    id: 'alert-milk',
    isExpired: true,
    name: 'Sữa tươi',
    severity: 'expiring',
    warehouse: 'Kho mát',
  },
  {
    days: 2,
    emoji: '🐟',
    expiryDate: '13/05/2025',
    group: 'today',
    id: 'alert-fish',
    isExpired: false,
    name: 'Cá basa fillet',
    severity: 'expiring',
    warehouse: 'Kho mát',
  },
  {
    days: 3,
    emoji: '🍶',
    group: 'today',
    id: 'alert-sauce',
    lastImportDate: '09/05/2025',
    name: 'Nước mắm',
    severity: 'overdue',
    warehouse: 'Kho khô',
  },
  {
    emoji: '🥚',
    group: 'today',
    id: 'alert-egg',
    name: 'Trứng gà',
    quantity: '2 vỉ',
    reorderLevel: '5 vỉ',
    severity: 'low',
    warehouse: 'Kho bếp phụ',
  },
  {
    emoji: '🧄',
    group: 'yesterday',
    id: 'alert-garlic',
    name: 'Tỏi',
    quantity: '0.3 kg',
    reorderLevel: '1 kg',
    severity: 'low',
    warehouse: 'Kho khô',
  },
  {
    emoji: '🧈',
    group: 'yesterday',
    id: 'alert-butter',
    name: 'Bơ lạt',
    reorderLevel: '2 kg',
    severity: 'out',
    warehouse: 'Kho mát',
  },
  {
    days: 3,
    emoji: '🍜',
    expiryDate: '14/05/2025',
    group: 'yesterday',
    id: 'alert-noodle',
    isExpired: false,
    name: 'Bánh phở tươi',
    severity: 'expiring',
    warehouse: 'Kho bếp chính',
  },
  {
    days: 5,
    emoji: '🧂',
    group: 'yesterday',
    id: 'alert-salt',
    lastImportDate: '07/05/2025',
    name: 'Muối hạt',
    severity: 'overdue',
    warehouse: 'Kho khô',
  },
  {
    emoji: '🥬',
    group: 'earlier',
    id: 'alert-cabbage',
    name: 'Cải thảo',
    quantity: '0.8 kg',
    reorderLevel: '3 kg',
    severity: 'low',
    warehouse: 'Kho mát',
  },
  {
    days: 4,
    emoji: '🍤',
    expiryDate: '09/05/2025',
    group: 'earlier',
    id: 'alert-shrimp',
    isExpired: true,
    name: 'Tôm sú đông lạnh',
    severity: 'expiring',
    warehouse: 'Kho đông',
  },
];
