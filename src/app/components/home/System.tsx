import { Check, FileSearch, LayoutDashboard, ListChecks, QrCode, Wand2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SectionLabel, type CssVars } from './shared';

const FEATURES = [
  { icon: FileSearch, key: 'check' },
  { icon: Wand2, key: 'fill' },
  { icon: LayoutDashboard, key: 'cabinet' },
  { icon: ListChecks, key: 'stages' },
  { icon: QrCode, key: 'qr' },
] as const;

/** Mijoz kabinetidagi bosqichlar (Hero kartochkasi bilan bir xil nomlar). Ma'lumot emas, sxema. */
const STAGES = ['invoice', 'packing', 'certs', 'tir', 'analysis', 'declaration', 'submit'] as const;
const DONE = 5;

export default function System({ num = '04' }: { num?: string }) {
  const { t } = useTranslation();
  return (
    <section id="system" style={{ background: 'var(--paper)', padding: '120px 0' }}>
      <div className="wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: '64px 80px', alignItems: 'flex-start' }}>
        <div style={{ flex: '1 1 460px', minWidth: 0 }}>
          <div className="rv">
            <SectionLabel num={num}>{t('pd.system.label')}</SectionLabel>
            <h2 className="serif h2">{t('pd.system.title')}</h2>
            <p className="lede">{t('pd.system.lede')}</p>
          </div>
          <div style={{ marginTop: 44, borderBottom: '1px solid var(--line)' }}>
            {FEATURES.map((f, i) => (
              <div key={f.key} className="adv rv" style={{ '--s': `${i * 5}%`, padding: '24px 0 24px 26px' } as CssVars}>
                <div className="ibox"><f.icon size={24} strokeWidth={1.6} aria-hidden /></div>
                <div>
                  <h3 className="serif" style={{ margin: '0 0 6px', fontSize: 24, lineHeight: 1.2 }}>{t(`pd.system.items.${f.key}.title`)}</h3>
                  <p style={{ margin: 0, color: 'var(--mut)', fontSize: 16 }}>{t(`pd.system.items.${f.key}.desc`)}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="rv" style={{ margin: '26px 0 0', color: 'var(--mut)', fontSize: 15 }}>{t('pd.system.note')}</p>
        </div>

        <div className="sys-wrap rv" style={{ '--s': '8%' } as CssVars}>
          <div className="sys-card" role="img" aria-label={t('pd.system.cabinet.title')}>
            <div className="sys-bar">
              <span className="mono" style={{ color: 'var(--gold-d)', fontSize: 12 }}>{t('pd.system.cabinet.title')}</span>
              <span className="mono" style={{ color: 'var(--mut)', fontSize: 12 }}>{DONE} / {STAGES.length}</span>
            </div>
            <div className="sys-prog"><i style={{ width: `${(DONE / STAGES.length) * 100}%` }} /></div>
            <div className="mono" style={{ padding: '16px 24px 4px', color: 'var(--mut)', fontSize: 11.5 }}>{t('pd.system.cabinet.sub')}</div>
            <ol style={{ listStyle: 'none', margin: 0, padding: '0 24px 8px' }}>
              {STAGES.map((st, i) => {
                const state = i < DONE ? 'done' : i === DONE ? 'doing' : 'wait';
                return (
                  <li key={st} className={`sys-row sys-${state}`}>
                    <span className="sys-dot" aria-hidden>
                      {state === 'done' && (
                        <svg viewBox="0 0 24 24" width="14" height="14">
                          <path className="sys-tk" pathLength={1} style={{ '--s': `${i * 4}%` } as CssVars} d="M4 12l5 5L20 6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <span className="sys-name">{t(`pd.hero.card.${st}`)}</span>
                    <span className="sys-state">{t(`pd.system.cabinet.${state}`)}</span>
                  </li>
                );
              })}
            </ol>
            <div className="sys-foot">
              <Check size={16} strokeWidth={2} aria-hidden /> {t('pd.system.cabinet.foot')}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
