import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocalePath } from '../../utils/locale';
import { servicePath } from '../../utils/services';
import { Photo, SectionLabel, TickRow } from './shared';

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
    <section id="services" style={{ background: '#fff', padding: '120px 0' }}>
      <div className="wrap">
        <div className="rv">
          <SectionLabel num="02">{t('pd.services.label')}</SectionLabel>
          <h2 className="serif h2">{t('pd.services.title')}</h2>
          <p className="lede">{t('pd.services.lede')}</p>
        </div>
        <div style={{ marginTop: 60, display: 'flex', flexWrap: 'wrap', gap: 0, border: '1px solid var(--line)', alignItems: 'stretch' }}>
          <div role="tablist" aria-orientation="vertical" style={{ flex: '1 1 380px', minWidth: 0, background: 'var(--paper)', borderRight: '1px solid var(--line)' }}>
            {SERVICES.map((s, i) => (
              <button
                key={s.key}
                type="button"
                role="tab"
                id={`svc-tab-${s.key}`}
                aria-selected={sel === i}
                aria-controls="svc-panel"
                className={`srow${sel === i ? ' on' : ''}`}
                onClick={() => setSel(i)}
              >
                <span className="mono n">{pad(i + 1)}</span>
                <span>{t(`services.items.${s.key}.title`)}</span>
                <ArrowRight className="arr" size={20} strokeWidth={1.8} aria-hidden />
              </button>
            ))}
          </div>
          <div id="svc-panel" role="tabpanel" aria-labelledby={`svc-tab-${active.key}`} style={{ flex: '1.5 1 560px', minWidth: 0, background: '#fff' }}>
            <div className="spanel" key={active.key}>
              <div className="im ph" style={{ aspectRatio: '16 / 8' }}>
                <Photo id={active.photo} alt={t(`services.items.${active.key}.title`)} sizes="(max-width: 1000px) 100vw, 720px" />
              </div>
              <div className="tx" style={{ padding: '36px 40px 40px' }}>
                <div className="mono" style={{ color: 'var(--gold-d)' }}>{pad(sel + 1)} / {pad(SERVICES.length)}</div>
                <h3 className="serif" style={{ margin: '12px 0 0', fontSize: 34, lineHeight: 1.15 }}>{t(`services.items.${active.key}.title`)}</h3>
                <p style={{ margin: '14px 0 22px', color: 'var(--mut)', maxWidth: 560 }}>{t(`services.items.${active.key}.desc`)}</p>
                {Array.isArray(features) &&
                  features.map((f, i) => (
                    <TickRow key={f} size={20} last={i === features.length - 1}>{f}</TickRow>
                  ))}
                <Link className="lnk" to={lp(servicePath(active.key))} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 26, fontWeight: 600, color: 'var(--blue)' }}>
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
