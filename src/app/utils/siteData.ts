import raw from '../../content/site-data.json';
import type { Tariff } from './contactModal';

/** src/content/site-data.json uchun tiplar — bloklar faqat shu ma'lumotdan chiziladi. */
export type Localized = { uz?: string; ru?: string; en?: string };
export type Testimonial = { name: string; company?: string; text: string | Localized; photo?: string };
export type Price = { amount: number; currency: 'UZS' | 'USD' };

type SiteData = {
  testimonials: Testimonial[];
  tariffPrices: Partial<Record<Tariff, Price | null>>;
  productsHandled: string[];
  destinations: Localized[];
};

export const siteData = raw as unknown as SiteData;

/** Joriy til bo'yicha matn; yo'q bo'lsa uz → birinchi mavjud qiymat. */
export function pickLocale(value: string | Localized | undefined, lang: string): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[lang as keyof Localized] || value.uz || Object.values(value).find(Boolean) || '';
}

/**
 * 1500000 → "1 500 000". Intl ishlatilmaydi: Node va brauzer ICU'si turlicha bo'shliq
 * belgisi qaytarishi mumkin — SSR hydration'da mos kelmay qoladi.
 */
export function formatAmount(amount: number): string {
  return String(Math.round(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
