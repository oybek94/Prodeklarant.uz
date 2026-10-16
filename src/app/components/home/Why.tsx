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
      <div className="wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: '64px 80px', alignItems: 'flex-start' }}>
        <div style={{ flex: '1 1 420px', minWidth: 0 }}>
          <div className="rv">
            <SectionLabel num="01">{t('pd.why.label')}</SectionLabel>
            <h2 className="serif h2">{t('pd.why.title')}</h2>
            <p className="lede">{t('pd.why.lede')}</p>
          </div>
          <figure className="rv" style={{ margin: '48px 0 0' }}>
            <div className="ph wipe-s" style={{ aspectRatio: '4 / 3' }}>
              <Photo id="3184360" alt={t('pd.why.photoAlt')} sizes="(max-width: 1000px) 100vw, 560px" />
            </div>
            <figcaption className="cap">
              <span className="mono" style={{ color: 'var(--gold-d)', fontSize: 11.5 }}>{t('pd.why.capLabel')}</span>
              {t('pd.why.caption')}
            </figcaption>
          </figure>
        </div>
        <div style={{ flex: '1 1 460px', minWidth: 0, borderBottom: '1px solid var(--line)' }}>
          {ITEMS.map((item, i) => (
            <div key={item.key} className="adv rv" style={{ '--s': `${i * 6}%` } as CssVars}>
              <div className="ibox"><item.icon size={26} strokeWidth={1.6} aria-hidden /></div>
              <div>
                <h3 className="serif" style={{ margin: '0 0 8px', fontSize: 26, lineHeight: 1.2 }}>{t(`home.features.${item.key}.title`)}</h3>
                <p style={{ margin: 0, color: 'var(--mut)' }}>{t(`home.features.${item.key}.desc`)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
