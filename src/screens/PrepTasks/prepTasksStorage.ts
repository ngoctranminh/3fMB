import { createDailyChecklistStorage } from '@/services/dailyChecklistStorage';

const prepChecklist = createDailyChecklistStorage('threefff.prep-tasks');

export const loadPrepTasks = prepChecklist.load;
export const prepTasksStorage = prepChecklist.storage;
export const savePrepTasks = prepChecklist.save;
