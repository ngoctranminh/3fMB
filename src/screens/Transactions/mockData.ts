export type TransactionItem = {
  readonly code: string;
  readonly date: string;
  readonly id: string;
  readonly kind: TransactionKind;
  readonly partner: string;
  readonly status: 'done' | 'draft' | 'pending';
  readonly user: string;
  readonly value: string;
};

export type TransactionKind = 'export' | 'import' | 'transfer';

export const TRANSACTION_TABS = ['import', 'export'] as const;

export type TransactionTab = (typeof TRANSACTION_TABS)[number];

export const TRANSACTION_FILTERS = [
  'all',
  'import',
  'export',
  'transfer',
] as const;

export type QuickAction = {
  readonly iconPath: string;
  readonly id: string;
  readonly tone: 'amber' | 'blue' | 'green' | 'purple';
};

export type TransactionFilter = (typeof TRANSACTION_FILTERS)[number];

export const QUICK_ACTIONS: readonly QuickAction[] = [
  { iconPath: 'tray-down', id: 'receive', tone: 'blue' },
  { iconPath: 'box', id: 'return', tone: 'purple' },
  { iconPath: 'document', id: 'other', tone: 'green' },
  { iconPath: 'arrows', id: 'transfer', tone: 'amber' },
];

export const TODAY_TOTALS = {
  exportCount: 4,
  exportValue: '8.450.000 đ',
  importCount: 6,
  importValue: '15.600.000 đ',
} as const;

export const TRANSACTIONS: readonly TransactionItem[] = [
  {
    code: 'NK250512-001',
    date: '12/05/2025 10:30',
    id: 'transaction-nk-001',
    kind: 'import',
    partner: 'Nhà cung cấp A',
    status: 'done',
    user: 'Admin',
    value: '5.200.000 đ',
  },
  {
    code: 'XK250512-001',
    date: '12/05/2025 12:15',
    id: 'transaction-xk-001',
    kind: 'export',
    partner: 'Xuất cho bếp',
    status: 'done',
    user: 'Admin',
    value: '2.850.000 đ',
  },
  {
    code: 'NK250512-002',
    date: '12/05/2025 14:20',
    id: 'transaction-nk-002',
    kind: 'import',
    partner: 'Nhà cung cấp B',
    status: 'done',
    user: 'Admin',
    value: '6.400.000 đ',
  },
  {
    code: 'XK250512-002',
    date: '12/05/2025 16:45',
    id: 'transaction-xk-002',
    kind: 'export',
    partner: 'Xuất cho quầy bar',
    status: 'done',
    user: 'Admin',
    value: '1.600.000 đ',
  },
  {
    code: 'DC250512-001',
    date: '12/05/2025 17:30',
    id: 'transaction-dc-001',
    kind: 'transfer',
    partner: 'Kho chính → Kho phụ',
    status: 'done',
    user: 'Admin',
    value: '3.500.000 đ',
  },
];
