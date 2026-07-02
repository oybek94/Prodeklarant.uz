import { useCallback } from 'react';
import { useLocation } from 'react-router';

/**
 * Ko'p tilli URL yordamchilari.
 *
 * URL strukturasi: default til (uz) prefikssiz (`/services`), qolganlari prefiksli
 * (`/ru/services`, `/en/services`). URL — tilning yagona manbai; hreflang shu yo'llarga
 * ishora qiladi, shunda Google har bir til kontentini alohida indekslaydi.
 */

export const SUPPORTED_LOCALES = ['uz', 'ru', 'en'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'uz';
/** Prefiksga ega tillar (uz prefikssiz ishlaydi) */
export const PREFIXED_LOCALES: Locale[] = ['ru', 'en'];

function isPrefixed(seg: string | undefined): seg is 'ru' | 'en' {
  return seg === 'ru' || seg === 'en';
}

/** Pathname'dan joriy tilni aniqlaydi (`/ru/...` → 'ru', aks holda 'uz'). */
export function localeFromPath(pathname: string): Locale {
  const seg = pathname.split('/')[1];
  return isPrefixed(seg) ? seg : DEFAULT_LOCALE;
}

/** Til prefiksini olib tashlab, "toza" yo'lni qaytaradi (`/ru/services` → `/services`). */
export function stripLocale(pathname: string): string {
  const seg = pathname.split('/')[1];
  if (isPrefixed(seg)) {
    const rest = pathname.slice(3); // '/ru' yoki '/en' (3 belgi) ni kesamiz
    return rest || '/';
  }
  return pathname || '/';
}

/** Toza yo'lga til prefiksini qo'shadi (uz uchun prefiks yo'q). */
export function withLocale(path: string, locale: Locale): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return clean;
  if (clean === '/') return `/${locale}`;
  return `/${locale}${clean}`;
}

/**
 * Joriy tilga bog'langan `lp(path)` funksiyasini qaytaradi — barcha ichki
 * `<Link>` larda `to={lp('/services')}` ko'rinishida ishlatiladi.
 */
export function useLocalePath(): (path: string) => string {
  const { pathname } = useLocation();
  const locale = localeFromPath(pathname);
  return useCallback((p: string) => withLocale(p, locale), [locale]);
}
