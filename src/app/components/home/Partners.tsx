import { useTranslation } from 'react-i18next';

// Fayllar 2x (256x96) saqlangan; nisbat layout shift bo'lmasligi uchun width/height'da (scripts/optimize-public-images.mjs).
const PARTNERS = [
  { src: '/partners/agro505', alt: 'Oltiariq agro 505', width: 48, height: 48 },
  { src: '/partners/agropark-fergana', alt: 'Агропарк Фергана', width: 126, height: 48 },
  { src: '/partners/eximagro', alt: 'EXIM AGRO', width: 128, height: 28 },
  { src: '/partners/fruitvoyage', alt: 'Fruit Voyage', width: 45, height: 48 },
  { src: '/partners/havvogroup', alt: 'HAVVO GROUP', width: 121, height: 48 },
  { src: '/partners/uzbagro', alt: 'UZBAGRO', width: 64, height: 48 },
];

export default function Partners() {
  const { t } = useTranslation();
  return (
    <section aria-label={t('home.partners.title')} style={{ background: '#fff', borderBottom: '1px solid var(--line)' }}>
      <div className="wrap pt-grid">
        <div className="mono" style={{ padding: '28px 24px 28px 0', color: 'var(--mut)' }}>{t('home.partners.title')}</div>
        <div className="pt-logos">
          {PARTNERS.map((p) => (
            <div key={p.src} className="logo-cell">
              <picture>
                <source srcSet={`${p.src}.webp`} type="image/webp" />
                <img src={`${p.src}.png`} alt={p.alt} width={p.width} height={p.height} loading="lazy" decoding="async" />
              </picture>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
