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

export type Language = z.infer<typeof languageSchema>;
