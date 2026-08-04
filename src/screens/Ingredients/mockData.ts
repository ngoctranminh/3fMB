export type IngredientCategory =
  | 'dairy'
  | 'meat'
  | 'spice'
  | 'starch'
  | 'vegetable';

export type IngredientItem = {
  readonly category: IngredientCategory;
  readonly emoji: string;
  readonly id: string;
  readonly isLow: boolean;
  readonly name: string;
  readonly quantity: string;
  readonly status: 'expired' | 'low' | 'ok';
  readonly unit: string;
  readonly value: string;
};

export const CATEGORY_FILTERS = [
  'all',
  'meat',
  'vegetable',
  'spice',
  'starch',
  'dairy',
] as const;

export type CategoryFilter = (typeof CATEGORY_FILTERS)[number];

export const INGREDIENTS: readonly IngredientItem[] = [
  {
    category: 'meat',
    emoji: '🥩',
    id: 'ingredient-beef',
    isLow: true,
    name: 'Thịt bò',
    quantity: '1.2',
    status: 'low',
    unit: 'kg',
    value: '480.000đ',
  },
  {
    category: 'vegetable',
    emoji: '🌿',
    id: 'ingredient-herb',
    isLow: true,
    name: 'Rau răm',
    quantity: '0.2',
    status: 'low',
    unit: 'kg',
    value: '8.000đ',
  },
  {
    category: 'starch',
    emoji: '🍚',
    id: 'ingredient-rice',
    isLow: false,
    name: 'Gạo tấm thơm',
    quantity: '25',
    status: 'ok',
    unit: 'kg',
    value: '375.000đ',
  },
  {
    category: 'dairy',
    emoji: '🥛',
    id: 'ingredient-milk',
    isLow: true,
    name: 'Sữa tươi',
    quantity: '5',
    status: 'expired',
    unit: 'lít',
    value: '125.000đ',
  },
  {
    category: 'meat',
    emoji: '🐟',
    id: 'ingredient-fish',
    isLow: false,
    name: 'Cá basa fillet',
    quantity: '3',
    status: 'ok',
    unit: 'kg',
    value: '210.000đ',
  },
  {
    category: 'dairy',
    emoji: '🥚',
    id: 'ingredient-egg',
    isLow: false,
    name: 'Trứng gà',
    quantity: '4',
    status: 'ok',
    unit: 'vỉ (10 trứng)',
    value: '40.000đ',
  },
  {
    category: 'spice',
    emoji: '🍶',
    id: 'ingredient-sauce',
    isLow: false,
    name: 'Nước mắm',
    quantity: '1',
    status: 'ok',
    unit: 'lít',
    value: '60.000đ',
  },
  {
    category: 'spice',
    emoji: '🧄',
    id: 'ingredient-garlic',
    isLow: true,
    name: 'Tỏi',
    quantity: '0.3',
    status: 'low',
    unit: 'kg',
    value: '15.000đ',
  },
];
