import { createMMKV, type MMKV } from 'react-native-mmkv';

import { loadLanguage, saveLanguage } from './languageStorage';
import { SupportedLanguages } from './schema';

describe('language storage', () => {
  let storage: MMKV;

  beforeEach(() => {
    storage = createMMKV({ id: 'language-storage-test' });
    storage.clearAll();
  });

  it('uses Vietnamese when no valid language was saved', () => {
    storage.set('language', 'unsupported-language');

    expect(loadLanguage(storage)).toBe(SupportedLanguages.VI_VN);
    expect(storage.getString('language')).toBe(SupportedLanguages.VI_VN);
  });

  it('restores the saved language', () => {
    storage.set('language', SupportedLanguages.CS_CZ);

    expect(loadLanguage(storage)).toBe(SupportedLanguages.CS_CZ);
  });

  it('saves a language for the next app launch', () => {
    saveLanguage(SupportedLanguages.EN_EN, storage);

    expect(storage.getString('language')).toBe(SupportedLanguages.EN_EN);
  });
});
