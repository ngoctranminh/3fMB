import { createDailyChecklistStorage } from '@/services/dailyChecklistStorage';

const purchaseChecklist = createDailyChecklistStorage(
  'threefff.purchase-guide',
);
const urgentPurchaseChecklist = createDailyChecklistStorage(
  'threefff.purchase-guide-urgent',
);

export const loadPurchaseChecklist = purchaseChecklist.load;
export const loadUrgentPurchaseItems = urgentPurchaseChecklist.load;
export const purchaseGuideStorage = purchaseChecklist.storage;
export const savePurchaseChecklist = purchaseChecklist.save;
export const saveUrgentPurchaseItems = urgentPurchaseChecklist.save;
export const urgentPurchaseGuideStorage = urgentPurchaseChecklist.storage;
