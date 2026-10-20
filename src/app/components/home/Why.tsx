import { Cherry, Moon, ShieldCheck, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Photo, SectionLabel, type CssVars } from './shared';

const ITEMS = [
  { icon: Zap, key: 'fast' },
  { icon: ShieldCheck, key: 'legal' },
  { icon: Cherry, key: 'focus' },
  { icon: Moon, key: 'night' },
] as const;

export default function Why() {
  const { t } = useTranslation();
  return (
    <section id="why" style={{ background: 'var(--paper)', padding: '120px 0' }}>
      <div className="wrap" style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>
        <div className="rv" style={{ display: 'flex', flexWrap: 'wrap', gap: '32px 80px', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ flex: '1 1 520px', minWidth: 0 }}>
            <SectionLabel num="01">{t('pd.why.label')}</SectionLabel>
            <h2 className="serif h2">{t('pd.why.title')}</h2>
          </div>
          <p className="lede" style={{ flex: '1 1 360px', maxWidth: 520, margin: 0 }}>{t('pd.why.lede')}</p>
        </div>

        <figure className="rv" style={{ margin: 0, position: 'relative' }}>
          <div className="ph wipe-s why-ph">
            <Photo id="3184360" alt={t('pd.why.photoAlt')} sizes="(max-width: 1520px) 100vw, 1424px" />
          </div>
          <figcaption className="why-cap">
            <span className="mono" style={{ color: 'var(--gold)', fontSize: 11.5 }}>{t('pd.why.capLabel')}</span>
            <span>{t('pd.why.caption')}</span>
          </figcaption>
        </figure>

        <div className="why-grid">
          {ITEMS.map((item, i) => (
            <div
              key={item.key}
              className={`why-card rv${item.key === 'legal' ? ' why-card-d' : ''}`}
              style={{ '--s': `${i * 6}%` } as CssVars}
            >
              <div className="why-top">
                <div className="ibox why-ibox"><item.icon size={26} strokeWidth={1.6} aria-hidden /></div>
                <span className="serif why-num" aria-hidden>{String(i + 1).padStart(2, '0')}</span>
              </div>
              <h3 className="serif" style={{ margin: 0, fontSize: 26, lineHeight: 1.2 }}>{t(`home.features.${item.key}.title`)}</h3>
              <p style={{ margin: 0 }}>{t(`home.features.${item.key}.desc`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
