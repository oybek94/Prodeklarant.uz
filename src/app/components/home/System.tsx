import { FileSearch, LayoutDashboard, ListChecks, QrCode, Wand2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SectionLabel, type CssVars } from './shared';

const FEATURES = [
  { icon: FileSearch, key: 'check' },
  { icon: Wand2, key: 'fill' },
  { icon: LayoutDashboard, key: 'cabinet' },
  { icon: ListChecks, key: 'stages' },
  { icon: QrCode, key: 'qr' },
] as const;

/** Ichki tizimdan haqiqiy ekranlar (public/images). */
const SHOTS = [
  { key: 'list', cls: 'sys-a', src: '/images/tizim-invoyslar.webp', w: 1855, h: 976 },
  { key: 'edit', cls: 'sys-b', src: '/images/tizim-invoys-tahrir.webp', w: 1859, h: 973 },
] as const;

export default function System({ num = '04' }: { num?: string }) {
  const { t } = useTranslation();
  return (
    <section id="system" className="sys-sec">
      <div className="wrap sys-wrap">
        <div className="sys-head rv">
          <div style={{ flex: '1 1 640px', minWidth: 0 }}>
            <SectionLabel num={num}>{t('pd.system.label')}</SectionLabel>
            <h2 className="serif h2">{t('pd.system.title')}</h2>
          </div>
          <p className="lede" style={{ flex: '1 1 360px', maxWidth: 470 }}>{t('pd.system.lede')}</p>
        </div>

        <div className="sys-stage rv" style={{ '--s': '6%' } as CssVars}>
          <div className="sys-stg">
            {SHOTS.map((s) => (
              <div key={s.key} className={`sys-shot ${s.cls}`} onContextMenu={(e) => e.preventDefault()}>
                <div className="sys-bar">
                  <i /><i /><i />
                  <span className="mono">{t(`pd.system.shots.${s.key}.title`)}</span>
                </div>
                {/* <img> emas, fon rasmi: sichqoncha o'ng tugmasi, sudrash va "yangi oynada ochish" ishlamaydi */}
                <div className="sys-img" role="img" aria-label={t(`pd.system.shots.${s.key}.alt`)} style={{ backgroundImage: `url(${s.src})`, aspectRatio: `${s.w} / ${s.h}` }} />
              </div>
            ))}
            <p className="sys-cap mono">
              <span style={{ color: 'var(--gold)' }}>●</span> {t('pd.system.shots.caption')}
            </p>
          </div>
        </div>

        <div className="sys-feats">
          {FEATURES.map((f, i) => (
            <div key={f.key} className="sys-feat rv" style={{ '--s': `${i * 4}%` } as CssVars}>
              <div className="sys-fh">
                <span className="sys-n mono">{i + 1}</span>
                <f.icon size={26} strokeWidth={1.6} aria-hidden />
              </div>
              <h3 className="serif">{t(`pd.system.items.${f.key}.title`)}</h3>
              <p>{t(`pd.system.items.${f.key}.desc`)}</p>
            </div>
          ))}
        </div>

        <p className="rv" style={{ margin: '36px 0 0', color: 'var(--mut)', fontSize: 15 }}>{t('pd.system.note')}</p>
      </div>
    </section>
  );
}
