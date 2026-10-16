import { Link } from 'react-router';
import { ArrowRight, BadgeCheck, Clock, FileCheck2, FlaskConical, Globe, Package, Receipt, Send, ShieldCheck, Truck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocalePath } from '../../utils/locale';
import { Photo } from './shared';

const DOC_ROWS = [
  { icon: Receipt, key: 'invoice', delay: '1.9s' },
  { icon: Package, key: 'packing', delay: '2.3s' },
  { icon: BadgeCheck, key: 'certs', delay: '2.7s' },
  { icon: Truck, key: 'tir', delay: '3.1s' },
  { icon: FlaskConical, key: 'analysis', delay: '3.5s' },
  { icon: FileCheck2, key: 'declaration', delay: '3.9s' },
  { icon: Send, key: 'submit', delay: '4.3s' },
] as const;

const TRUST = [
  { icon: ShieldCheck, key: 'legal' },
  { icon: Clock, key: 'online' },
  { icon: Globe, key: 'global' },
] as const;

export default function Hero() {
  const { t } = useTranslation();
  const lp = useLocalePath();

  return (
    <section id="top" style={{ position: 'relative', overflow: 'hidden', background: 'var(--deep)', color: '#fff' }}>
      <div className="hero-ph">
        <Photo id="264537" alt={t('pd.hero.photoAlt')} sizes="(max-width: 1000px) 100vw, 42vw" eager />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, #061B33 0%, rgba(6, 27, 51, .55) 38%, rgba(6, 27, 51, .1) 100%)' }} />
        <div
          className="hero-card fi"
          style={{ position: 'absolute', left: 36, bottom: 36, width: 'min(380px, calc(100% - 72px))', background: '#fff', color: 'var(--ink)', borderRadius: 2, boxShadow: '0 30px 60px -20px rgba(0, 0, 0, .6)', animationDelay: '1.3s' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 20px', borderBottom: '1px solid var(--line)' }}>
            <span className="mono" style={{ color: 'var(--gold-d)', fontSize: 12 }}>{t('pd.hero.card.title')}</span>
            <span style={{ display: 'inline-flex', width: 9, height: 9, borderRadius: '50%', background: '#1F9D55', animation: 'pulse 1.8s ease-out infinite' }} />
          </div>
          {DOC_ROWS.map((row, i) => (
            <div
              key={row.key}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 20px', borderBottom: i < DOC_ROWS.length - 1 ? '1px solid var(--line)' : undefined }}
            >
              <row.icon size={22} strokeWidth={1.6} style={{ color: 'var(--blue)', flex: 'none' }} aria-hidden />
              <span style={{ fontWeight: 500, flex: 1 }}>{t(`pd.hero.card.${row.key}`)}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#17783F', fontSize: 14, fontWeight: 600 }}>
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path className="tk" pathLength={1} style={{ animationDelay: row.delay }} d="M4 12l5 5L20 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t('pd.hero.card.ready')}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="wrap" style={{ paddingTop: 104, paddingBottom: 0 }}>
        <div className="hero-tx">
          <div className="mono lab lab-d" style={{ color: 'var(--gold)' }}>
            <span className="rule" style={{ animationDelay: '.1s' }} />
            <span className="fi" style={{ animationDelay: '.35s' }}>{t('pd.hero.kicker')}</span>
          </div>
          <h1 className="serif" style={{ margin: '30px 0 0', fontSize: 'clamp(40px, 5.2vw, 76px)', lineHeight: 1.06, color: '#fff' }}>
            <span className="mask"><span style={{ animationDelay: '.25s' }}>{t('pd.hero.l1')}</span></span>
            <span className="mask"><span style={{ animationDelay: '.38s' }}>{t('pd.hero.l2')}</span></span>
            <span className="mask"><span style={{ animationDelay: '.51s', fontStyle: 'italic', color: 'var(--gold)' }}>{t('pd.hero.l3')}</span></span>
          </h1>
          <p className="fu" style={{ animationDelay: '.9s', margin: '30px 0 0', maxWidth: 540, fontSize: 19.5, lineHeight: 1.6, color: 'rgba(255, 255, 255, .78)' }}>
            {t('pd.hero.lead')}
          </p>
          <div className="fu" style={{ animationDelay: '1.1s', marginTop: 40, display: 'flex', flexWrap: 'wrap', gap: 14 }}>
            <a className="btn btn-gold" href="#contact">
              {t('pd.hero.cta')} <ArrowRight size={20} strokeWidth={1.8} aria-hidden />
            </a>
            <Link className="btn btn-line" to={lp('/services')}>{t('home.hero.services')}</Link>
          </div>
        </div>

        <div className="hero-tx fu" style={{ animationDelay: '1.3s', marginTop: 76, display: 'flex', flexWrap: 'wrap', borderTop: '1px solid rgba(255, 255, 255, .18)' }}>
          {TRUST.map((item, i) => (
            <div
              key={item.key}
              style={{
                flex: '1 1 180px',
                padding: i === 0 ? '24px 24px 34px 0' : i === TRUST.length - 1 ? '24px 0 34px 24px' : '24px 24px 34px 24px',
                borderLeft: i === 0 ? undefined : '1px solid rgba(255, 255, 255, .14)',
                display: 'flex',
                gap: 14,
                alignItems: 'flex-start',
              }}
            >
              <item.icon size={26} strokeWidth={1.6} style={{ color: 'var(--gold)', flex: 'none' }} aria-hidden />
              <div>
                <div style={{ fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>{t(`pd.hero.trust.${item.key}.title`)}</div>
                <div style={{ fontSize: 14.5, color: 'rgba(255, 255, 255, .62)', marginTop: 4, lineHeight: 1.45 }}>{t(`pd.hero.trust.${item.key}.desc`)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
