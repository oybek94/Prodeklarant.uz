import type { CSSProperties, ReactNode } from 'react';
import { Check } from 'lucide-react';
import { formatInt } from '../../utils/siteStats';

/** Inline style'da CSS custom property (--s, --to) ishlatish uchun. */
export type CssVars = CSSProperties & Record<`--${string}`, string | number>;

/**
 * public/images ostidagi mavjud o'lchamlar (scripts/optimize-public-images.mjs).
 * Rasm qo'shilsa shu yerga ham yoziladi.
 */
const IMG_WIDTHS: Record<string, number[]> = {
  '264537': [640, 800, 1280, 1920],
  '3184360': [640, 1280, 1920],
  '3184291': [800],
  '4483610': [640, 1280, 1920],
  '1132047': [640, 960, 1280, 1920],
  '1367243': [640, 960, 1280, 1920],
  '109274': [640, 960, 1280, 1920],
  '265087': [1280],
};

/** responsive <picture> (webp + jpg fallback) */
export function Photo({
  id,
  alt,
  sizes = '(max-width: 1000px) 100vw, 50vw',
  eager = false,
}: {
  id: keyof typeof IMG_WIDTHS;
  alt: string;
  sizes?: string;
  eager?: boolean;
}) {
  const widths = IMG_WIDTHS[id];
  const set = (ext: string) => widths.map((w) => `/images/p${id}-${w}.${ext} ${w}w`).join(', ');
  const fallbackW = widths.includes(1280) ? 1280 : widths[widths.length - 1];
  return (
    <picture>
      <source type="image/webp" srcSet={set('webp')} sizes={sizes} />
      <img
        src={`/images/p${id}-${fallbackW}.jpg`}
        srcSet={set('jpg')}
        sizes={sizes}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : undefined}
        decoding="async"
      />
    </picture>
  );
}

/** "01 — Afzalliklar" yorlig'i (qoida chizig'i scroll bilan chiziladi) */
export function SectionLabel({ num, children, dark = false }: { num?: string; children: ReactNode; dark?: boolean }) {
  return (
    <div className={`mono lab${dark ? ' lab-d' : ''}`} style={dark ? { color: 'var(--gold)' } : undefined}>
      {num && <span className="num">{num}</span>}
      <span className="rule rule-s" />
      {children}
    </div>
  );
}

export function TickRow({ children, size = 19, dark = false, last = false }: { children: ReactNode; size?: number; dark?: boolean; last?: boolean }) {
  return (
    <div className={`tickrow${dark ? ' tickrow-d' : ''}`} style={last ? { borderBottom: '1px solid var(--line)' } : undefined}>
      <Check size={size} strokeWidth={2} aria-hidden />
      {children}
    </div>
  );
}

/**
 * Raqam: ko'rinadigan qiymat CSS counter bilan sanaladi (JS yo'q, SSR-mos),
 * haqiqiy matn esa ekran o'qigichlar va qidiruv uchun sr-only'da turadi.
 */
export function Count({ value }: { value: number }) {
  return (
    <>
      <span className="count" style={{ '--to': Math.round(value) } as CssVars} aria-hidden="true" />
      <span className="sr-only">{formatInt(value)}</span>
    </>
  );
}
