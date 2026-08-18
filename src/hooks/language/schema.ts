import * as z from 'zod';

export const enum SupportedLanguages {
  CS_CZ = 'cs-CZ',
  EN_EN = 'en-EN',
  VI_VN = 'vi-VN',
}

export const languageSchema = z.enum([
  SupportedLanguages.CS_CZ,
  SupportedLanguages.EN_EN,
  SupportedLanguages.VI_VN,
]);

export type ItemLocale = 'cs-CZ' | 'en-US' | 'vi-VN';

export type Language = z.infer<typeof languageSchema>;

export const toItemLocale = (language: string): ItemLocale => {
  if (language === 'cs-CZ') {
    return 'cs-CZ';
  }

  if (language === 'en-EN') {
    return 'en-US';
  }

  return 'vi-VN';
};
