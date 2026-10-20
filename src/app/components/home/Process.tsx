import { BadgeCheck, Check, ClipboardList, FileSearch, FileText, FileUp, ListChecks, Send, Truck, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SectionLabel } from './shared';

/** Har bir qadamdagi vazifalar ikonkasi; matnlar i18n'da (pd.process.steps.N.tasks), tartib bir xil. */
const STEPS: { n: 1 | 2 | 3; icons: LucideIcon[] }[] = [
  { n: 1, icons: [FileSearch, FileText, Send, ClipboardList] },
  { n: 2, icons: [BadgeCheck, ListChecks, FileUp] },
  { n: 3, icons: [Truck] },
];

export default function Process({ num = '03' }: { num?: string }) {
  const { t } = useTranslation();
  let taskNo = 0; // CSS animatsiyasi vazifalarni 0..7 tartibida ketma-ket bajaradi (.pr-t0 … .pr-t7)
  return (
    <section className="pr-sec">
      <div className="wrap">
        <div className="rv">
          <SectionLabel num={num} dark>{t('pd.process.label')}</SectionLabel>
          <h2 className="serif h2 h2-d" style={{ maxWidth: 'none' }}>{t('pd.process.title')}</h2>
        </div>
        <div className="pr-grid">
          {STEPS.map((s) => {
            const tasks = t(`pd.process.steps.${s.n}.tasks`, { returnObjects: true }) as string[];
            return (
              <div key={s.n} className="pr-col">
                <div className="pr-track" aria-hidden>
                  <div className={`pr-fill pr-f${s.n}`} />
                  <div className={`pr-dia pr-d${s.n}`} />
                </div>
                <div className="pr-body">
                  <div className="mono" style={{ color: 'var(--gold)' }}>{t('pd.process.step')} 0{s.n}</div>
                  <h3 className="serif">{t(`pd.process.steps.${s.n}.title`)}</h3>
                  <ol className="pr-list">
                    {Array.isArray(tasks) &&
                      tasks.map((text, i) => {
                        const Icon = s.icons[i];
                        const idx = taskNo++;
                        return (
                          <li key={text} className={`pr-task pr-t${idx}`}>
                            <div className="pr-left">
                              <div className="pr-ico" aria-hidden>
                                <svg width="44" height="44" viewBox="0 0 52 52" fill="none">
                                  <circle className="pr-fillc" cx="26" cy="26" r="24" fill="var(--gold)" />
                                  <circle cx="26" cy="26" r="24" stroke="rgba(255,255,255,.22)" strokeWidth="2" />
                                  <circle className="pr-ring" cx="26" cy="26" r="24" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeDasharray="151" transform="rotate(-90 26 26)" />
                                </svg>
                                <Icon className="pr-ic" size={24} strokeWidth={1.6} />
                                <Check className="pr-ck" size={24} strokeWidth={2.2} />
                              </div>
                              {i < tasks.length - 1 && (
                                <div className="pr-conn" aria-hidden><div className="pr-cfill" /></div>
                              )}
                            </div>
                            <span className="pr-tx">{text}</span>
                          </li>
                        );
                      })}
                  </ol>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
