import { Compass, FileText, Stamp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SectionLabel, type CssVars } from './shared';

const STEPS = [
  { n: 1, icon: FileText },
  { n: 2, icon: Compass },
  { n: 3, icon: Stamp },
] as const;

export default function Process() {
  const { t } = useTranslation();
  return (
    <section style={{ background: 'var(--deep)', color: '#fff', padding: '120px 0 130px' }}>
      <div className="wrap">
        <div className="rv">
          <SectionLabel num="03" dark>{t('pd.process.label')}</SectionLabel>
          <h2 className="serif h2 h2-d">{t('pd.process.title')}</h2>
        </div>
        <div style={{ position: 'relative', marginTop: 80 }}>
          <div className="pline" />
          <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '40px 0' }}>
            {STEPS.map((s, i) => (
              <li key={s.n} className="pstep rv" style={{ '--s': `${i * 8}%` } as CssVars}>
                <div className="mono" style={{ color: 'var(--gold)' }}>{t('pd.process.step')} 0{s.n}</div>
                <div className="ibox ibox-d" style={{ margin: '22px 0' }}><s.icon size={26} strokeWidth={1.6} aria-hidden /></div>
                <h3 className="serif" style={{ margin: '0 0 10px', fontSize: 28 }}>{t(`pd.process.steps.${s.n}.title`)}</h3>
                <p style={{ margin: 0, color: 'rgba(255, 255, 255, .72)', fontSize: 16.5 }}>{t(`pd.process.steps.${s.n}.desc`)}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
