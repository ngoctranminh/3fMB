import 'intl-pluralrules';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import type { Language } from '@/hooks/language/schema';

import en from './en-EN.json';
import fr from './fr-FR.json';
import vi from './vi-VN.json';

export const defaultNS = 'threefffapp';

export const resources = {
  'en-EN': en,
  'fr-FR': fr,
  'vi-VN': vi,
} as const satisfies Record<Language, unknown>;

void i18n.use(initReactI18next).init({
  defaultNS,
  fallbackLng: 'vi-VN',
  // React Native renders text nodes, so HTML escaping would leak entities
  // like &#x2F; into interpolated dates and quantities.
  interpolation: { escapeValue: false },
  lng: 'vi-VN',
  resources,
});

// add capitalization formatter
i18n.services.formatter?.add(
  'capitalize',
  (value: string) =>
    value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
);

export { default } from 'i18next';
