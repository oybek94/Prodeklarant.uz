import { useTranslation } from 'react-i18next';
import { formatInt, formatStatsDate, formatTonnes, hasStatsToShow, type SiteStats } from '../../utils/siteStats';
import { Count, SectionLabel, type CssVars } from './shared';

type Kpi = { label: string; note?: string; value?: number; text?: string; unit?: string; plus?: boolean };

/** Qiymat: butun son — CSS counter bilan (SSR-mos), kasr yoki matn — oddiy matn. */
function Big({ k }: { k: Kpi }) {
  return (
    <div className="rs-num serif">
      {k.value !== undefined && Number.isInteger(k.value) ? <Count value={k.value} /> : k.text ?? formatTonnes(k.value ?? 0)}
      {k.plus && <span className="rs-plus">+</span>}
      {k.unit && <span className="rs-unit">{k.unit}</span>}
    </div>
  );
}

/**
 * "Natijalar" — Prodeklarant CRM'ning haqiqiy jamlangan ko'rsatkichlari (server/services/siteStats.js).
 * CRM ma'lumoti kelmasa faqat kompaniya ko'rsatkichlari chiziladi — to'qilgan raqam ko'rsatilmaydi.
 */
export default function Results({ stats }: { stats: SiteStats | null }) {
  const { t } = useTranslation();
  const live = hasStatsToShow(stats);

  const kpis: Kpi[] = live
    ? [
        { label: t('trust.stats.kpi.declarations'), value: stats.declarations.total, note: t('trust.stats.kpi.declarationsNote', { count: stats.declarations.thisMonth }) },
        { label: t('trust.stats.kpi.cargo'), value: stats.cargo.tonnes, unit: t('trust.stats.unitTonne'), note: t('trust.stats.kpi.cargoNote') },
        { label: t('trust.stats.kpi.clients'), value: stats.clients.active, note: t('trust.stats.kpi.clientsNote') },
      ]
    : [
        // Kompaniya ko'rsatkichlari — qo'lda yuritiladigan umumiy raqamlar (CRM'dan emas).
        { label: t('home.stats.experience'), text: '10', plus: true },
        { label: t('home.stats.clients'), text: '100', plus: true },
        { label: t('home.stats.cargo'), text: '15k', plus: true },
        { label: t('home.stats.countries'), text: '30', plus: true },
      ];

  const done = live ? stats.invoices : undefined;
  const showDone = Boolean(done && done.total > 0);

  return (
    <section id="results" aria-labelledby="results-heading" className="rs-sec">
      <div className="wrap sys-wrap">
        <div className="rs-head rv">
          <div style={{ minWidth: 0 }}>
            <SectionLabel num="05" dark>{t('pd.results.label')}</SectionLabel>
            <h2 id="results-heading" className="serif h2 h2-d">{live ? t('pd.results.title') : t('home.stats.title')}</h2>
          </div>
          {live && <span className="rs-live"><i />{t('pd.results.synced')}</span>}
        </div>

        <div className="rs-grid">
          {kpis.map((k, i) => (
            <div key={k.label} className="rs-kpi rv" style={{ '--s': `${i * 5}%` } as CssVars}>
              <div className="mono rs-lab">{k.label}</div>
              <Big k={k} />
              {k.note && <div className="rs-note">{k.note}</div>}
            </div>
          ))}
        </div>

        {showDone && done && (
          <div className="rs-done rv">
            <span className="rs-done-l">{t('pd.results.completed')}</span>
            <div className="rs-track" role="img" aria-label={`${formatInt(done.done)} / ${formatInt(done.total)}`}>
              <i style={{ width: `${Math.min(100, (done.done / done.total) * 100)}%` }} />
            </div>
            <span className="rs-done-n serif">{formatInt(done.done)} <span>/ {formatInt(done.total)}</span></span>
          </div>
        )}

        {live && <p className="mono rs-src">{t('trust.stats.source', { date: formatStatsDate(stats.generatedAt) })}</p>}
      </div>
    </section>
  );
}
