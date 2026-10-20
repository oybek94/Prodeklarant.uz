import { ArrowRight, Briefcase, Check, Eye, Shield, Target, Zap, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Fragment } from 'react';
import { Photo, type CssVars } from '../components/home/shared';
import { useLocalePath } from '../utils/locale';

const VALUE_ICONS: LucideIcon[] = [Shield, Eye, Target, Zap, Briefcase];

/** "300M+" → ["300M", "+"]: oxirgi "+" oltin rangda ko'rsatiladi. */
function splitPlus(value: string): [string, boolean] {
  return value.endsWith('+') ? [value.slice(0, -1), true] : [value, false];
}

export default function About() {
  const { t } = useTranslation();
  const lp = useLocalePath();

  // Kompaniya ko'rsatkichlari — qo'lda yuritiladigan umumiy raqamlar (CRM'dan emas).
  const stats = [
    { label: t('about.stats.experience'), value: '10+' },
    { label: t('about.stats.clients'), value: '100+' },
    { label: t('about.stats.cargo'), value: '15 000+' },
    { label: t('about.stats.countries'), value: '30+' },
    { label: t('about.stats.exportVolume'), value: '300M+' },
    { label: t('about.stats.exportValue'), value: '400M+' },
  ];
  // slogan1 tarjimasida <br /> bor: xom HTML o'rniga qatorlarga bo'lib chiziladi
  const slogan1 = t('about.intro.slogan1').split(/<br\s*\/?>/i);
  const approach = t('about.approach.items', { returnObjects: true }) as string[];
  const why = t('about.why.items', { returnObjects: true }) as string[];
  const values = t('about.values.items', { returnObjects: true }) as string[];

  return (
    <div className="pd">
      <section className="ab-hero">
        <div className="wrap ab-hero-in">
          <div className="ab-kick">
            <span className="ab-kick-l" />
            <span className="mono">Prodeklarant</span>
          </div>
          <h1 className="serif ab-h1">{t('about.title')}</h1>
          <p className="ab-sub">{t('about.subtitle')}</p>
          <div className="ab-ph ab-wide">
            <Photo id="264537" alt="" sizes="(max-width: 1000px) 100vw, 1360px" eager />
          </div>
        </div>
      </section>

      <section className="ab-intro">
        <div className="wrap">
          <div className="ab-two">
            <div style={{ minWidth: 0 }} className="rv">
              <div className="ab-lab ab-lab-r">
                <span className="mono">{t('about.intro.badge')}</span>
                <span className="ab-lab-l" />
              </div>
              <h2 className="serif ab-h2">
                {slogan1.map((line, i) => (
                  <Fragment key={i}>{i > 0 && <br />}{line}</Fragment>
                ))}{' '}<span className="ab-blue">{t('about.intro.slogan2')}</span>
              </h2>
              <p className="ab-p">{t('about.intro.p1')}</p>
            </div>
            <div className="ab-team rv" style={{ '--s': '8%' } as CssVars}>
              <div className="ab-ph ab-img">
                <Photo id="3184291" alt="PRO DEKLARANT jamoasi bojxona rasmiylashtiruv ustida ishlamoqda" sizes="(max-width: 1000px) 100vw, 640px" />
              </div>
              <div className="serif ab-quote">«{t('about.quote')}»</div>
            </div>
          </div>

          <div className="ab-mission">
            <div className="mono ab-ml">{t('about.mission.title')}</div>
            <p className="serif ab-mt">{t('about.mission.text')}</p>
          </div>
        </div>
      </section>

      <section className="ab-stats">
        <div className="wrap">
          <div className="ab-lab ab-lab-l2">
            <span className="ab-lab-l" />
            <span className="mono">{t('pd.results.label')}</span>
          </div>
          <h2 className="serif ab-h2 ab-h2-w">{t('about.stats.title')}</h2>
          <div className="ab-kp">
            {stats.map((s) => {
              const [num, plus] = splitPlus(s.value);
              return (
                <div key={s.label} className="ab-k rv">
                  <div className="serif ab-kn">{num}{plus && <span className="ab-gold">+</span>}</div>
                  <div className="mono ab-kl">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="ab-app">
        <div className="wrap ab-two ab-top">
          <div style={{ minWidth: 0 }} className="rv">
            <h2 className="serif ab-h2">{t('about.approach.title')}</h2>
            <p className="ab-p">{t('about.approach.lead')}</p>
          </div>
          <div className="ab-steps">
            {approach.map((item, i) => (
              <div key={item} className="ab-step rv" style={{ '--s': `${i * 6}%` } as CssVars}>
                <span className="mono ab-sn">0{i + 1}</span>
                <span className="serif ab-st">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ab-goal">
        <div className="wrap">
          <p className="serif">{t('about.approach.goal')}</p>
        </div>
      </section>

      <section className="ab-why">
        <div className="wrap ab-two ab-top">
          <div style={{ minWidth: 0 }} className="rv">
            <h2 className="serif ab-h3">{t('about.why.title')}</h2>
            <div className="ab-wl">
              {why.map((item) => (
                <div key={item} className="ab-wy">
                  <Check size={22} strokeWidth={2.2} aria-hidden />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ minWidth: 0 }} className="rv">
            <h2 className="serif ab-h3">{t('about.values.title')}</h2>
            <div className="ab-vt">
              {values.map((item, i) => {
                const Icon = VALUE_ICONS[i] ?? Shield;
                return (
                  <div key={item} className={i >= 3 ? 'w3' : undefined}>
                    <Icon size={32} strokeWidth={1.5} aria-hidden />
                    <span className="serif">{item}</span>
                  </div>
                );
              })}
            </div>
            <p className="serif ab-trust">“{t('about.mission.trust')}”</p>
          </div>
        </div>
      </section>

      <section className="ab-cta">
        <div className="ab-cta-in">
          <h2 className="serif">{t('about.closing')}</h2>
          <Link to={lp('/contact')} className="btn btn-gold">
            {t('layout.footer.contactTitle')} <ArrowRight size={18} aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  );
}
