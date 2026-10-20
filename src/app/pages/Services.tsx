import { ArrowRight, BarChart, Check, FileText, Globe, Package, ShieldCheck, Truck, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import Process from '../components/home/Process';
import { Photo, type CssVars } from '../components/home/shared';
import { useLocalePath } from '../utils/locale';
import { servicePath } from '../utils/services';

const SERVICES: { key: string; icon: LucideIcon }[] = [
  { key: 'export', icon: FileText },
  { key: 'import', icon: Truck },
  { key: 'transit', icon: Globe },
  { key: 'certification', icon: ShieldCheck },
  { key: 'warehouse', icon: Package },
  { key: 'consulting', icon: BarChart },
];

export default function Services() {
  const { t } = useTranslation();
  const lp = useLocalePath();

  return (
    <div className="pd">
      <section className="sv-hero">
        <div className="wrap sv-hg">
          <div style={{ minWidth: 0 }}>
            <div className="sv-kick">
              <span className="sv-kick-l" />
              <span className="mono">PRODEKLARANT · {t('layout.nav.services')}</span>
            </div>
            <h1 className="serif sv-h1">{t('services.title')}</h1>
            <p className="sv-lede">{t('services.subtitle')}</p>
            <div className="sv-btns">
              <Link to={lp('/contact')} className="btn btn-gold">
                {t('layout.contactBtn')} <ArrowRight size={18} aria-hidden />
              </Link>
              <a href="#process" className="btn btn-line">{t('pd.process.label')}</a>
            </div>
          </div>
          <div className="sv-ph">
            <div className="ph">
              <Photo id="4483610" alt="" sizes="(max-width: 900px) 100vw, 46vw" eager />
            </div>
            <div className="sv-tag mono">{t('services.count', { count: SERVICES.length })}</div>
          </div>
        </div>
      </section>

      <section className="sv-sec">
        <div className="wrap">
          <div className="sv-grid">
            {SERVICES.map((s, i) => {
              const features = t(`services.items.${s.key}.features`, { returnObjects: true }) as string[];
              const href = servicePath(s.key);
              return (
                <article key={s.key} className="sv-card rv" style={{ '--s': `${(i % 3) * 5}%` } as CssVars}>
                  <div className="sv-ch">
                    <span className="mono sv-n">0{i + 1}</span>
                    <s.icon className="sv-ic" size={36} strokeWidth={1.4} aria-hidden />
                  </div>
                  <h2 className="serif">{t(`services.items.${s.key}.title`)}</h2>
                  <p className="sv-d">{t(`services.items.${s.key}.desc`)}</p>
                  <ul className="sv-ul">
                    {Array.isArray(features) &&
                      features.map((f) => (
                        <li key={f}>
                          <Check size={18} strokeWidth={2.2} aria-hidden />
                          {f}
                        </li>
                      ))}
                  </ul>
                  {href !== '/services' && (
                    <Link to={lp(href)} className="sv-more">
                      {t('home.services.more')} <ArrowRight size={16} aria-hidden />
                    </Link>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <div id="process">
        <Process num="" />
      </div>

      <section className="sv-cta">
        <div className="wrap sv-cta-in">
          <div style={{ flex: '1 1 560px', minWidth: 0 }}>
            <h2 className="serif">{t('services.cta.title')}</h2>
            <p>{t('services.cta.desc')}</p>
          </div>
          <Link to={lp('/contact')} className="btn btn-ink">
            {t('layout.contactBtn')} <ArrowRight size={18} aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  );
}
