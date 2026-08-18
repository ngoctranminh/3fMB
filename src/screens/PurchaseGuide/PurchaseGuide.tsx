import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';

import type { ChecklistGroup } from '@/components/templates';
import { ChecklistScreen } from '@/components/templates';

import {
  loadPurchaseChecklist,
  loadUrgentPurchaseItems,
  savePurchaseChecklist,
  saveUrgentPurchaseItems,
} from './purchaseGuideStorage';
import PurchaseListExporter from './PurchaseListExporter';

const PURCHASE_GROUPS = [
  {
    id: 'fresh',
    items: [
      'Salad — trung bình 2 cục/ngày',
      'Súp lơ — trung bình 1 cục vào ngày đông chicken bowl',
      'Bầu',
      'Táo ninh sốt đen',
      'Nấm mì',
      'Tuna hộp',
      'Lợn cuốn gimbap',
      'Nấm udon',
      'Cải pắc choy',
      'Cải chín',
      'Cà rốt',
      'Ớt chuông xanh',
      'Củ cải đỏ',
      'Mùi',
      'Mata',
      'Chanh',
      'Hành lá',
      'Cá hồi',
      'Cua — trung bình 1 bịch/ngày',
      'Củ dền',
      'Lá trang trí',
      'Trang trí tartar (China rose)',
      'Xoài',
      'Su hào',
      'Tỏi',
      'Hành tây',
      'Hành tím',
      'Khoai mật',
      'Khoai tây',
      'Hành khô',
      'Bún',
      'Đậu phụ',
      'Đùi gà',
      'Giá',
      'Trứng',
      'Lạc',
    ],
    label: 'Đồ tươi và hàng ngày',
  },
  {
    id: 'sauce',
    items: [
      'Sốt mayonnaise',
      'Sốt mayonnaise tartar',
      'Sốt sì',
      'Sì Philip',
      'Sốt hoa cải',
      'Giấm — pha giấm 8 chai',
      'Muối — pha giấm gần 2 bịch',
      'Đường — pha giấm 9 bịch',
      'Dầu ăn',
      'Mè trắng',
      'Mè đen',
      'Ngô hộp',
      'Dứa hộp',
      'Tương ớt',
      'Bột ớt chuông (paprika)',
      'Sốt Knorr gà',
      'Sốt BBQ',
      'Bột tỏi',
      'Tiêu đen',
      'Bột vàng',
      'Hải Châu',
      'Nước cốt chanh vàng',
      'Nước cốt chanh xanh',
      'Bột hành',
    ],
    label: 'Sốt, gia vị và đồ khô',
  },
  {
    id: 'supplies',
    items: [
      'Giấy bếp',
      'Giấy toilet',
      'Giấy ăn',
      'Nước 2 loại',
      'Dầu rửa bát',
      'Nước lau nhà',
      'Nước tẩy trắng',
      'Hạt tẩy',
      'Nước lau bàn',
      'Hộp donut',
      'Dẻ bát',
      'Dẻ sắt',
      'Lót thớt',
      'Bút',
    ],
    label: 'Bao bì và vệ sinh',
  },
  {
    id: 'shared',
    items: [
      'Chanh',
      'Hành tây',
      'Hành tím',
      'Đậu phụ',
      'Cà rốt',
      'Giá',
      'Đùi gà',
      'Giấy ăn',
      'Nước cốt chanh 2 loại',
      'Giấy toilet',
      'Hộp bokkum',
    ],
    label: 'Đồ chung với No Nê',
  },
  {
    id: 'upstairs',
    items: [
      'Bột bò',
      'Bột ớt mịn',
      'Bột ớt hạt to',
      'Bột cá',
      'Syrup ngô',
      'Lá đẹp',
      'Lá xấu',
      'Tôm có vỏ',
      'Tôm không vỏ',
      'Tôm nigiri',
      'Bò bulgogi',
      'Bò nam bộ',
      'Mực',
      'Trứng cá đỏ, xanh, đen',
      'Sả băm',
      'Đậu có vỏ',
      'Đậu không vỏ',
      'Cua dự phòng',
      'Lợn cổ',
      'Lợn ba chỉ',
      'Tỏi đá',
      'Gyoza gà, lợn, bò, tofu',
      'Seaweed',
      'Tôm đẹp',
      'Lươn',
      'Đùi gà',
      'Trứng',
      'Tương ớt Hàn Quốc',
      'Miến',
      'Đũa',
      'Mì campong',
      'Mì rabokki',
      'Hộp 01, 3, 5, 7, 9',
      'Hộp và nắp bowl',
      'Hộp và nắp bún bò',
      'Hộp và nắp miso',
      'Hộp manduguk',
      'Hộp nước phở',
      'Lọ nhỏ nước gyoza',
      'Lọ nhỡ sốt bibimbap',
      'Lọ nắp hoa phẳng ume',
      'Lọ nước mắm bún bò',
      'Túi giấy',
      'Túi trắng nhỏ',
      'Bình ga',
      'Bột miso',
      'Rượu sake',
      'Củ cải vàng',
      'Chảo udon',
      'Lọ xì dầu',
      'Xì dầu chay',
      'Coca, Zero, nho, lê, Fanta, Sprite, Cozy, Aloe',
      'Bột chiên',
      'Bia',
      'Hộp bokkum',
    ],
    label: 'Kiểm kho trên nhà',
  },
] as const satisfies readonly ChecklistGroup[];

function PurchaseGuide({ navigation }: RootScreenProps<Paths.PurchaseGuide>) {
  const { t } = useTranslation();
  const initialCheckedItemIds = useMemo(() => loadPurchaseChecklist(), []);
  const initialPriorityItemIds = useMemo(() => loadUrgentPurchaseItems(), []);

  return (
    <ChecklistScreen
      allLabel={t('operations_common.all')}
      completedLabel={(completed, total) =>
        t('operations_common.progress', { completed, total })
      }
      emptyLabel={t('operations_common.empty')}
      groups={PURCHASE_GROUPS}
      initialCheckedItemIds={initialCheckedItemIds}
      initialPriorityItemIds={initialPriorityItemIds}
      onBack={() => {
        navigation.goBack();
      }}
      onCheckedItemIdsChange={savePurchaseChecklist}
      onPriorityItemIdsChange={saveUrgentPurchaseItems}
      priorityLabel={t('screen_purchase_guide.priority_action')}
      renderSelectionAction={(selectedGroups) => (
        <PurchaseListExporter groups={selectedGroups} />
      )}
      resetLabel={t('operations_common.reset')}
      searchPlaceholder={t('screen_purchase_guide.search_placeholder')}
      subtitle={t('screen_purchase_guide.subtitle')}
      testID="purchase-guide-screen"
      title={t('screen_purchase_guide.title')}
    />
  );
}

export default PurchaseGuide;
