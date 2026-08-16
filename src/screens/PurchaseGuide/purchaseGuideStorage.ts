import { createDailyChecklistStorage } from '@/services/dailyChecklistStorage';

const purchaseChecklist = createDailyChecklistStorage(
  'threefff.purchase-guide',
);

export const loadPurchaseChecklist = purchaseChecklist.load;
export const purchaseGuideStorage = purchaseChecklist.storage;
export const savePurchaseChecklist = purchaseChecklist.save;
