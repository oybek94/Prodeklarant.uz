/**
 * Prodeklarant CRM'dan kelgan jamlangan statistika (server: services/siteStats.js).
 * Faqat sonlar — mijoz nomi, summa yoki narx yo'q.
 */
export type SiteStats = {
  generatedAt: string;
  periodMonths: number;
  declarations: { total: number; thisMonth: number; monthly: Array<{ month: string; count: number }> };
  cargo: { tonnes: number; byProduct: Array<{ key: string; tonnes: number }> };
  destinations: { countries: number; byCountry: Array<{ code: string; count: number }>; otherCount: number };
  clients: { active: number };
  /** Ixtiyoriy: CRM bersa — yakunlangan va jami invoyslar (yo'q bo'lsa chiziq chizilmaydi). */
  invoices?: { done: number; total: number };
};

/** Brauzerda (client-side navigatsiya) — server tayyor javobni /api/stats dan beradi; 204 → null. */
export async function getSiteStats(): Promise<SiteStats | null> {
  try {
    const res = await fetch('/api/stats');
    if (res.status !== 200) return null;
    return (await res.json()) as SiteStats;
  } catch {
    return null;
  }
}

/** Raqamlarni ko'rsatishga arziydimi: bo'sh baza yoki 0 deklaratsiya bo'lsa blok yashiriladi. */
export function hasStatsToShow(stats: SiteStats | null | undefined): stats is SiteStats {
  return Boolean(stats && stats.declarations && stats.declarations.total > 0);
}

/** 18460 → "18 460". Intl ishlatilmaydi (SSR va brauzer ICU farqi hydration'ni buzmasin). */
export function formatInt(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/** Tonna: 100 dan katta — butun, kichik — bitta kasr xonasi (vergul bilan). */
export function formatTonnes(n: number): string {
  if (n >= 100) return formatInt(n);
  return (Math.round(n * 10) / 10).toString().replace('.', ',');
}

/** "2026-10-16T07:00:00Z" → "16.10.2026" (Toshkent vaqti, UTC+5; server/brauzer farqsiz). */
export function formatStatsDate(iso: string): string {
  const t = new Date(new Date(iso).getTime() + 5 * 60 * 60 * 1000);
  if (Number.isNaN(t.getTime())) return '';
  const dd = String(t.getUTCDate()).padStart(2, '0');
  const mm = String(t.getUTCMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}.${t.getUTCFullYear()}`;
}
