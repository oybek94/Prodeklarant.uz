import { useTranslation } from 'react-i18next';
import { Photo, SectionLabel, TickRow, type CssVars } from './shared';

const ITEMS = [
  { key: 'cherry', photo: '109274' },
  { key: 'fruits', photo: '1132047' },
  { key: 'veg', photo: '1367243' },
] as const;

export default function Products() {
  const { t } = useTranslation();
  return (
    <section style={{ background: '#fff', padding: '120px 0' }}>
      <div className="wrap">
        <div className="rv">
          <SectionLabel num="04">{t('pd.products.label')}</SectionLabel>
          <h2 className="serif h2">{t('pd.products.title')}</h2>
          <p className="lede">{t('pd.products.lede')}</p>
        </div>
        <div style={{ marginTop: 60, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
          {ITEMS.map((item, i) => {
            const points = t(`pd.products.${item.key}.points`, { returnObjects: true }) as string[];
            return (
              <article key={item.key} className="pcard rv" style={{ '--s': `${i * 8}%` } as CssVars}>
                <div className="ph wipe-s">
                  <Photo id={item.photo} alt={t(`pd.products.${item.key}.title`)} sizes="(max-width: 700px) 100vw, 400px" />
                </div>
                <div className="mono" style={{ margin: '22px 0 0', color: 'var(--gold-d)' }}>{t('pd.products.item')} 0{i + 1}</div>
                <h3 className="serif" style={{ margin: '8px 0 18px', fontSize: 30 }}>{t(`pd.products.${item.key}.title`)}</h3>
                {Array.isArray(points) && points.map((p, j) => <TickRow key={p} last={j === points.length - 1}>{p}</TickRow>)}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
