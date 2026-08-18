import { toItemLocale } from './schema';

describe('toItemLocale', () => {
  it.each([
    ['vi-VN', 'vi-VN'],
    ['en-EN', 'en-US'],
    ['cs-CZ', 'cs-CZ'],
  ])('maps app language %s to server locale %s', (language, locale) => {
    expect(toItemLocale(language)).toBe(locale);
  });

  it('falls back to Vietnamese for an unsupported language', () => {
    expect(toItemLocale('de-DE')).toBe('vi-VN');
  });
});
