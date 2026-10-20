import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocalePath } from '../../utils/locale';
import { servicePath } from '../../utils/services';
import { Photo, SectionLabel, TickRow, type CssVars } from './shared';

const SERVICES = [
  { key: 'export', photo: '264537' },
  { key: 'import', photo: '265087' },
  { key: 'transit', photo: '3184291' },
  { key: 'certification', photo: '1132047' },
  { key: 'warehouse', photo: '4483610' },
  { key: 'consulting', photo: '3184360' },
] as const;

export default function ServicesPicker() {
  const { t } = useTranslation();
  const lp = useLocalePath();
  const [sel, setSel] = useState(0);
  const active = SERVICES[sel];
  const features = t(`services.items.${active.key}.features`, { returnObjects: true }) as string[];
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <section
      id="services"
      style={{
        position: 'relative',
        background: '#fff',
        color: 'var(--ink)',
        padding: '120px 0',
        '--xz-line': 'var(--line)',
        '--xz-row': 'var(--mut)',
        '--xz-n': 'var(--gold-d)',
        '--xz-hover': '#E8EDF4',
      } as CssVars}
    >
      <div aria-hidden style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'var(--gold)', opacity: 0.6 }} />
      <div className="wrap" style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
        <div className="rv" style={{ display: 'flex', flexWrap: 'wrap', gap: '32px 80px', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ flex: '1 1 560px', minWidth: 0 }}>
            <SectionLabel num="02">{t('pd.services.label')}</SectionLabel>
            <h2 className="serif h2" style={{ maxWidth: 820 }}>{t('pd.services.title')}</h2>
          </div>
          <p className="lede"style={{ flex: '1 1 360px', maxWidth: 480, margin: 0 }}>{t('pd.services.lede')}</p>
        </div>
        <div className="xz-wrap">
          <div className="xz-list" role="tablist" aria-orientation="vertical">
            {SERVICES.map((s, i) => (
              <button
                key={s.key}
                type="button"
                role="tab"
                id={`svc-tab-${s.key}`}
                aria-selected={sel === i}
                aria-controls="svc-panel"
                className={`xz-row${sel === i ? ' on' : ''}`}
                onClick={() => setSel(i)}
              >
                <span className="mono n">{pad(i + 1)}</span>
                <span className="serif t">{t(`services.items.${s.key}.title`)}</span>
                <ArrowRight className="arr" size={22} strokeWidth={1.6} aria-hidden />
              </button>
            ))}
          </div>
          <div id="svc-panel" className="xz-panel" role="tabpanel" aria-labelledby={`svc-tab-${active.key}`}>
            <div className="spanel" key={active.key} style={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto' }}>
              <div className="im ph xz-ph">
                <Photo id={active.photo} alt={t(`services.items.${active.key}.title`)} sizes="(max-width: 1000px) 100vw, 800px" />
                <span className="serif xz-big" aria-hidden>{pad(sel + 1)}</span>
              </div>
              <div className="tx xz-body">
                <div className="mono" style={{ color: 'var(--gold)' }}>{pad(sel + 1)} / {pad(SERVICES.length)}</div>
                <h3 className="serif" style={{ margin: 0, fontSize: 38, lineHeight: 1.15 }}>{t(`services.items.${active.key}.title`)}</h3>
                <p>{t(`services.items.${active.key}.desc`)}</p>
                <div>
                  {Array.isArray(features) &&
                    features.map((f) => (
                      <TickRow key={f} size={20} dark>{f}</TickRow>
                    ))}
                </div>
                <Link className="btn btn-gold" to={lp(servicePath(active.key))}>
                  {t('home.services.more')} <ArrowRight size={18} strokeWidth={1.8} aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
