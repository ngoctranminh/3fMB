import 'intl-pluralrules';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { loadLanguage } from '@/hooks/language/languageStorage';
import type { Language } from '@/hooks/language/schema';

import cs from './cs-CZ.json';
import en from './en-EN.json';
import vi from './vi-VN.json';

export const defaultNS = 'threefffapp';

export const resources = {
  'cs-CZ': cs,
  'en-EN': en,
  'vi-VN': vi,
} as const satisfies Record<Language, unknown>;

void i18n.use(initReactI18next).init({
  defaultNS,
  fallbackLng: 'vi-VN',
  // React Native renders text nodes, so HTML escaping would leak entities
  // like &#x2F; into interpolated dates and quantities.
  interpolation: { escapeValue: false },
  lng: loadLanguage(),
  resources,
});

// add capitalization formatter
i18n.services.formatter?.add(
  'capitalize',
  (value: string) =>
    value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
);

export { default } from 'i18next';
