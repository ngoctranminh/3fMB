import i18next from 'i18next';

import { SupportedLanguages } from './schema';

const LANGUAGE_CYCLE = [
  SupportedLanguages.VI_VN,
  SupportedLanguages.EN_EN,
  SupportedLanguages.FR_FR,
] as const;

const changeLanguage = (lang: SupportedLanguages) => {
  void i18next.changeLanguage(lang);
};

const toggleLanguage = () => {
  const currentIndex = LANGUAGE_CYCLE.indexOf(
    i18next.language as (typeof LANGUAGE_CYCLE)[number],
  );
  const nextIndex = (currentIndex + 1) % LANGUAGE_CYCLE.length;

  void i18next.changeLanguage(LANGUAGE_CYCLE[nextIndex]);
};

export const useI18n = () => {
  return { changeLanguage, toggleLanguage };
};
