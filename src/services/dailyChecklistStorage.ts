import { createMMKV } from 'react-native-mmkv';

type StoredChecklist = {
  readonly date: string;
  readonly itemIds: readonly string[];
};

const DATE_PART_LENGTH = 2;
const STORAGE_KEY = 'daily-checklist';

const toLocalDateKey = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(DATE_PART_LENGTH, '0');
  const day = String(date.getDate()).padStart(DATE_PART_LENGTH, '0');
  return `${String(date.getFullYear())}-${month}-${day}`;
};

const isStoredChecklist = (value: unknown): value is StoredChecklist => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<StoredChecklist>;
  return (
    typeof candidate.date === 'string' &&
    Array.isArray(candidate.itemIds) &&
    candidate.itemIds.every((itemId) => typeof itemId === 'string')
  );
};

export const createDailyChecklistStorage = (id: string) => {
  const storage = createMMKV({ id });

  const load = (now: Date = new Date()) => {
    const storedValue = storage.getString(STORAGE_KEY);
    if (!storedValue) return [];

    try {
      const parsed: unknown = JSON.parse(storedValue);
      if (!isStoredChecklist(parsed) || parsed.date !== toLocalDateKey(now)) {
        return [];
      }
      return [...parsed.itemIds];
    } catch {
      return [];
    }
  };

  const save = (itemIds: readonly string[], now: Date = new Date()) => {
    if (itemIds.length === 0) {
      storage.remove(STORAGE_KEY);
      return;
    }

    storage.set(
      STORAGE_KEY,
      JSON.stringify({ date: toLocalDateKey(now), itemIds }),
    );
  };

  return { load, save, storage };
};
