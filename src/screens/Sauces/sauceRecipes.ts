export type RecipeIngredient = {
  readonly amount: number;
  readonly label: string;
  readonly unit: string;
};

export type SauceRecipe = {
  readonly id: string;
  readonly ingredients: readonly RecipeIngredient[];
  readonly instructions?: readonly string[];
  readonly name: string;
  readonly note?: string;
};

export const SAUCE_RECIPES: readonly SauceRecipe[] = [
  {
    id: 'white-sauce',
    ingredients: [
      { amount: 1.5, label: 'Mayonnaise', unit: 'kg' },
      { amount: 240, label: 'Đường', unit: 'g' },
      { amount: 120, label: 'Dầu mè', unit: 'g' },
      { amount: 1, label: 'Sprite', unit: 'lon (gần hết)' },
    ],
    name: 'Sốt trắng',
  },
  {
    id: 'spicy-sauce',
    ingredients: [
      { amount: 1.5, label: 'Mayonnaise', unit: 'kg' },
      { amount: 650, label: 'Tương ớt', unit: 'g' },
    ],
    name: 'Sốt cay',
  },
  {
    id: 'tofu-noodle-sauce',
    ingredients: [
      { amount: 400, label: 'Xì dầu', unit: 'g' },
      { amount: 160, label: 'Đường', unit: 'g' },
      { amount: 60, label: 'Chanh vàng', unit: 'g' },
    ],
    name: 'Sốt bún tofu',
  },
  {
    id: 'gyoza-sauce',
    ingredients: [
      { amount: 1, label: 'Nước', unit: 'kg' },
      { amount: 1, label: 'Xì dầu', unit: 'kg' },
      { amount: 500, label: 'Đường', unit: 'g' },
      { amount: 600, label: 'Giấm', unit: 'g' },
    ],
    name: 'Sốt gyoza',
  },
  {
    id: 'bun-bo-fish-sauce',
    ingredients: [
      { amount: 330, label: 'Chanh vàng', unit: 'g' },
      { amount: 300, label: 'Giấm', unit: 'g' },
      { amount: 1.2, label: 'Đường', unit: 'kg' },
      { amount: 960, label: 'Nước mắm mực', unit: 'g' },
      { amount: 2.4, label: 'Nước', unit: 'kg' },
    ],
    name: 'Nước mắm bún bò',
  },
  {
    id: 'mango-sauce',
    ingredients: [
      { amount: 200, label: 'Xoài đá', unit: 'g' },
      { amount: 100, label: 'Nước', unit: 'g' },
    ],
    instructions: [
      'Ngâm xoài với nước một thời gian rồi xay nhuyễn.',
      'Lọc hỗn hợp qua rây.',
      'Vừa khuấy vừa đun lửa vừa, thêm khoảng nửa thìa đường đến khi sôi.',
      'Nếm lại và gia giảm.',
    ],
    name: 'Sốt xoài',
  },
  {
    id: 'bibimbap-sauce',
    ingredients: [
      { amount: 1.6, label: 'Tương ớt Hàn Quốc', unit: 'kg' },
      { amount: 700, label: 'Syrup ngô', unit: 'g' },
      { amount: 300, label: 'Coca', unit: 'g' },
    ],
    instructions: ['Khuấy tan đều.', 'Nếm lại và gia giảm.'],
    name: 'Sốt bibimbap',
  },
  {
    id: 'sushi-vinegar',
    ingredients: [
      { amount: 8, label: 'Giấm', unit: 'lít' },
      { amount: 9, label: 'Đường', unit: 'kg' },
      { amount: 2, label: 'Muối', unit: 'bịch (gần đủ)' },
      { amount: 3, label: 'Rượu sake', unit: 'lít' },
    ],
    name: 'Giấm sushi',
  },
  {
    id: 'black-sauce',
    ingredients: [],
    instructions: [
      'Cân khối lượng sốt rồi chia cho 23,3 để ra lượng bột khoai.',
      'Lượng nước bằng 2 lần lượng bột khoai; khuấy tan bột và nước.',
      'Đun sôi sốt đen rồi tắt bếp.',
      'Khuấy sốt thành lốc xoáy và đổ nhanh hỗn hợp bột khoai vào.',
      'Tự kiểm tra độ đặc, loãng và điều chỉnh.',
    ],
    name: 'Đánh sốt đen',
    note: 'Công thức theo khối lượng sốt: bột khoai = khối lượng ÷ 23,3; nước = bột khoai × 2.',
  },
  {
    id: 'bowl-chicken-marinade',
    ingredients: [],
    name: 'Ướp gà bowl',
    note: 'Theo khối lượng gà: muối = 1,3%; dầu ăn = 2,5%.',
  },
];

export const getSauceRecipe = (id: string) =>
  SAUCE_RECIPES.find((recipe) => recipe.id === id);
