import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';

import type { ChecklistGroup } from '@/components/templates';
import { ChecklistScreen } from '@/components/templates';

import { loadPrepTasks, savePrepTasks } from './prepTasksStorage';

const PREP_GROUPS = [
  {
    id: 'hot-kitchen',
    items: [
      'Gà xào',
      'Gà KFC',
      'Bò bulgogi',
      'Bò bún bò',
      'Tôm luộc',
      'Rau bokkum',
      'Rau udon',
      'Mực',
      'Bún',
      'Miso',
      'Súp lơ',
      'Bầu xào',
      'Giá trộn',
      'Cà rốt xào',
      'Nấm xào',
      'Đậu phụ chiên',
      'Đậu phụ miso',
      'Rong biển ngâm',
      'Rau bắp cải muối',
      'Salad bún bò',
      'Salad bowl',
      'Rau tataki',
      'Rau salmon tempura',
      'Thái lợn bokkum',
      'Thái lợn mì',
      'Chả gà',
      'Khoai tây chiên',
      'Khoai mật chiên',
      'Mè rang',
      'Lạc xay',
      'Pha bột toboki',
      'Manduguk',
      'Nặn toboki',
      'Tỏi băm',
      'Cải tím muối',
      'Luộc đỗ',
      'Thái hành',
      'Thái hành tím',
      'Bóp cua',
      'Salad giá',
      'Đảo bò',
      'Luộc trứng',
      'Đậu phụ mì',
      'Tôm xào',
      'Đảo lợn mì',
      'Xay nước quả',
      'Sốt trắng',
      'Sốt cay',
      'Sốt xoài',
      'Sốt bibimbap',
      'Sốt udon — anh Tú',
      'Sốt tempura salad — anh Tú',
      'Sốt yangnam — anh Tú',
      'Sốt japche — anh Tú',
      'Sốt gyoza',
      'Pha nước mắm',
      'Đánh sốt đen',
      'Bồi hộp',
      'Hàng hoá các loại',
      'Kiểm kho',
      'Dọn kho',
      'Xả tủ',
      'Đồ hạ giá',
      'Ghi hàng đi chợ',
      'Ghi hàng đặt',
      'Ngâm và xóc lọ',
      'Đục lỗ',
      'Bơm lốp',
    ],
    label: 'Bếp nóng',
  },
  {
    id: 'sushi',
    items: [
      'Tôm nigiri',
      'Tôm nắn',
      'Mổ cá',
      'Lọc cá',
      'Thái dưa sushi',
      'Bọc mành',
      'Củ cải vàng sushi',
      'Bẻ lá',
      'Cắt rong biển bowl',
      'Cắt đai',
      'Cắt nigiri',
      'Cắt sashimi',
      'Cắt hồi bowl',
      'Bào su hào',
      'Bào cà rốt',
      'Trộn cơm gimbap',
      'Trứng gimbap',
      'Dưa gimbap',
      'Củ cải vàng gimbap',
      'Củ cải vàng bowl',
      'Củ cải đỏ',
      'Quản lí tuna',
      'Quản lí bơ, dưa chuột',
      'Cạo tuna',
      'Cuốn tủ',
      'Cuốn hạ giá',
      'Hạt dẻ cười trang trí kem',
      'Mè trang trí kem',
    ],
    label: 'Sushi',
  },
] as const satisfies readonly ChecklistGroup[];

function PrepTasks({ navigation }: RootScreenProps<Paths.PrepTasks>) {
  const { t } = useTranslation();
  const initialCheckedItemIds = useMemo(() => loadPrepTasks(), []);

  return (
    <ChecklistScreen
      allLabel={t('operations_common.all')}
      completedLabel={(completed, total) =>
        t('operations_common.progress', { completed, total })
      }
      emptyLabel={t('operations_common.empty')}
      groups={PREP_GROUPS}
      initialCheckedItemIds={initialCheckedItemIds}
      onBack={() => {
        navigation.goBack();
      }}
      onCheckedItemIdsChange={savePrepTasks}
      resetLabel={t('operations_common.reset')}
      searchPlaceholder={t('screen_prep_tasks.search_placeholder')}
      subtitle={t('screen_prep_tasks.subtitle')}
      testID="prep-tasks-screen"
      title={t('screen_prep_tasks.title')}
    />
  );
}

export default PrepTasks;
