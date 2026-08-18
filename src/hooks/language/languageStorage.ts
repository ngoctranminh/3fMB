import { createMMKV, type MMKV } from 'react-native-mmkv';

import { languageSchema, SupportedLanguages } from './schema';

const LANGUAGE_STORAGE_KEY = 'language';

export const languageStorage = createMMKV({ id: 'language-preferences' });

export const loadLanguage = (storage: MMKV = languageStorage) => {
  const storedLanguage = languageSchema.safeParse(
    storage.getString(LANGUAGE_STORAGE_KEY),
  );

  if (storedLanguage.success) {
    return storedLanguage.data;
  }

  storage.set(LANGUAGE_STORAGE_KEY, SupportedLanguages.VI_VN);

  return SupportedLanguages.VI_VN;
};

export const saveLanguage = (
  language: SupportedLanguages,
  storage: MMKV = languageStorage,
) => {
  storage.set(LANGUAGE_STORAGE_KEY, language);
};
