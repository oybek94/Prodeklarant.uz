import { useTranslation } from 'react-i18next';
import { formatInt, formatStatsDate, formatTonnes, hasStatsToShow, type SiteStats } from '../../utils/siteStats';
import { Count, SectionLabel, type CssVars } from './shared';

const PRODUCT_ROWS = 4;
const COUNTRY_ROWS = 4;
const SEG_COLORS = ['var(--blue)', '#4F8CC9', '#94B9E0', '#D3DFEE'];

type Row = { label: string; value: number };

/** Qiymatni son yoki matn ko'rinishida chizadi: butun son — CSS counter bilan, kasr — oddiy matn. */
function BigNumber({ value, text, unit }: { value: number; text?: string; unit?: string }) {
  return (
    <div className="serif" style={{ marginTop: 16, fontSize: 'clamp(44px, 4.4vw, 64px)', lineHeight: 1, color: 'var(--ink)' }}>
      {Number.isInteger(value) ? <Count value={value} /> : text ?? formatTonnes(value)}
      {unit && <span style={{ color: 'var(--gold-d)', fontSize: '.5em', marginLeft: '.3em' }}>{unit}</span>}
    </div>
  );
}

function Legend({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <i style={{ width: 10, height: 10, background: color, display: 'inline-block' }} />
      {children}
    </span>
  );
}

function Bars({ rows, format }: { rows: Row[]; format: (n: number) => string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div style={{ marginTop: 22 }}>
      {rows.map((r) => (
        <div key={r.label} className="hrow">
          <span className="hlabel">{r.label}</span>
          <div><div className="hbar" style={{ width: `${Math.max(2, (r.value / max) * 100)}%` }} /></div>
          <span className="mono" style={{ fontSize: 12.5, textAlign: 'right' }}>{format(r.value)}</span>
        </div>
      ))}
    </div>
  );
}

/** Kompaniya ko'rsatkichlari — qo'lda yuritiladigan umumiy raqamlar (CRM'dan emas). */
function CompanyStrip() {
  const { t } = useTranslation();
  const items = [
    { value: '10+', label: t('home.stats.experience') },
    { value: '100+', label: t('home.stats.clients') },
    { value: '15k+', label: t('home.stats.cargo') },
    { value: '30+', label: t('home.stats.countries') },
  ];
  return (
    <div className="rv" style={{ marginTop: 32, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px 48px', padding: '26px 32px', background: 'var(--ink)', color: '#fff' }}>
      <span className="mono" style={{ color: 'var(--gold)', flex: '1 1 200px', lineHeight: 1.5 }}>{t('pd.results.company')}</span>
      <div style={{ flex: '3 1 560px', display: 'flex', flexWrap: 'wrap', gap: '20px 40px' }}>
        {items.map((it) => (
          <div key={it.label} style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span className="serif" style={{ fontSize: 38, lineHeight: 1 }}>{it.value}</span>
            <span style={{ color: 'rgba(255, 255, 255, .72)', fontSize: 15 }}>{it.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * "Natijalar" — Prodeklarant CRM'ning haqiqiy jamlangan ko'rsatkichlari (server/services/siteStats.js).
 * CRM ma'lumoti kelmasa faqat kompaniya ko'rsatkichlari chiziladi — to'qilgan raqam ko'rsatilmaydi.
 */
export default function Results({ stats }: { stats: SiteStats | null }) {
  const { t, i18n } = useTranslation();
  const live = hasStatsToShow(stats);

  let body = null;
  if (live) {
    const monthly = stats.declarations.monthly;
    const maxMonth = Math.max(1, ...monthly.map((m) => m.count));
    const lastIndex = monthly.length - 1;
    const monthName = (month: string) => t(`trust.stats.months.${Number(month.slice(5, 7))}`);
    const productLabel = (key: string) => (i18n.exists(`trust.stats.products.${key}`) ? t(`trust.stats.products.${key}`) : t('trust.stats.products.other'));
    const countryLabel = (code: string) => (i18n.exists(`trust.stats.countries.${code}`) ? t(`trust.stats.countries.${code}`) : code);

    const known = stats.cargo.byProduct.filter((p) => p.key !== 'other');
    const otherT = stats.cargo.byProduct.filter((p) => p.key === 'other').reduce((s, p) => s + p.tonnes, 0);
    const restT = known.slice(PRODUCT_ROWS).reduce((s, p) => s + p.tonnes, 0) + otherT;
    const productRows: Row[] = [
      ...known.slice(0, PRODUCT_ROWS).map((p) => ({ label: productLabel(p.key), value: p.tonnes })),
      ...(restT > 0 ? [{ label: t('trust.stats.products.other'), value: Math.round(restT * 10) / 10 }] : []),
    ];

    const restC = stats.destinations.byCountry.slice(COUNTRY_ROWS).reduce((s, c) => s + c.count, 0) + stats.destinations.otherCount;
    const countryRows: Row[] = [
      ...stats.destinations.byCountry.slice(0, COUNTRY_ROWS).map((c) => ({ label: countryLabel(c.code), value: c.count })),
      ...(restC > 0 ? [{ label: t('trust.stats.countries.other'), value: restC }] : []),
    ];
    const countrySum = Math.max(1, countryRows.reduce((s, r) => s + r.value, 0));

    const kpis = [
      { label: t('trust.stats.kpi.declarations'), value: stats.declarations.total, note: t('trust.stats.kpi.declarationsNote', { count: stats.declarations.thisMonth }) },
      { label: t('trust.stats.kpi.cargo'), value: stats.cargo.tonnes, unit: t('trust.stats.unitTonne'), note: t('trust.stats.kpi.cargoNote') },
      { label: t('trust.stats.kpi.countries'), value: stats.destinations.countries, note: t('trust.stats.kpi.countriesNote') },
      { label: t('trust.stats.kpi.clients'), value: stats.clients.active, note: t('trust.stats.kpi.clientsNote') },
    ];

    body = (
      <>
        <div style={{ marginTop: 56, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', padding: '0 1px 1px 0' }}>
          {kpis.map((k, i) => (
            <div key={k.label} className="kpi rv" style={{ '--s': `${i * 5}%` } as CssVars}>
              <div className="mono" style={{ color: 'var(--mut)', fontSize: 12 }}>{k.label}</div>
              <BigNumber value={k.value} unit={k.unit} />
              <div style={{ marginTop: 14, color: 'var(--mut)', fontSize: 15.5 }}>{k.note}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'stretch' }}>
          <div className="cc rv" style={{ flex: '1.25 1 480px', minWidth: 0 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
              <h3 className="serif" style={{ margin: 0, fontSize: 26 }}>{t('trust.stats.monthlyTitle')}</h3>
              <div style={{ display: 'flex', gap: 18, fontSize: 13.5, color: 'var(--mut)' }}>
                <Legend color="var(--blue)">{t('trust.stats.legendPast')}</Legend>
                <Legend color="var(--gold)">{t('trust.stats.legendCurrent')}</Legend>
              </div>
            </div>
            <div style={{ marginTop: 28, display: 'flex', gap: 'clamp(4px, 1vw, 12px)', alignItems: 'flex-end', height: 210, borderBottom: '1px solid var(--ink)' }}>
              {monthly.map((m, i) => (
                <div key={m.month} className={`vcol${i === lastIndex ? ' vcol-now' : ''}`} title={`${monthName(m.month)} ${m.month.slice(0, 4)}: ${m.count}`}>
                  <span className="mono vnum">{m.count}</span>
                  <div className="vbar" style={{ height: `${Math.max(1.5, (m.count / maxMonth) * 78)}%` }} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 'clamp(4px, 1vw, 12px)', marginTop: 10, fontSize: 13, color: 'var(--mut)', textAlign: 'center' }} className="vmonths">
              {monthly.map((m, i) => (
                <span key={m.month} style={{ flex: 1, minWidth: 0, ...(i === lastIndex ? { color: 'var(--ink)', fontWeight: 600 } : null) }}>{monthName(m.month)}</span>
              ))}
            </div>
          </div>

          <div className="cc rv" style={{ '--s': '8%', flex: '1 1 380px', minWidth: 0 } as CssVars}>
            {productRows.length > 0 && (
              <>
                <h3 className="serif" style={{ margin: 0, fontSize: 26 }}>{t('trust.stats.productsTitle')}</h3>
                <Bars rows={productRows} format={formatTonnes} />
              </>
            )}
            {countryRows.length > 0 && (
              <div style={productRows.length > 0 ? { marginTop: 30, paddingTop: 24, borderTop: '1px solid var(--line)' } : undefined}>
                <div className="mono" style={{ color: 'var(--mut)', fontSize: 12 }}>{t('trust.stats.countriesTitle')}</div>
                <div style={{ marginTop: 14, display: 'flex', gap: 2, height: 22 }}>
                  {countryRows.map((r, i) => (
                    <div
                      key={r.label}
                      className="seg"
                      title={`${r.label}: ${r.value}`}
                      style={{ width: `${(r.value / countrySum) * 100}%`, background: SEG_COLORS[i % SEG_COLORS.length], borderRadius: i === 0 ? '2px 0 0 2px' : i === countryRows.length - 1 ? '0 2px 2px 0' : undefined }}
                    />
                  ))}
                </div>
                <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: '8px 22px', fontSize: 14, color: 'var(--mut)' }}>
                  {countryRows.map((r, i) => (
                    <Legend key={r.label} color={SEG_COLORS[i % SEG_COLORS.length]}>
                      {r.label} · <strong style={{ color: 'var(--ink)' }}>{formatInt(r.value)}</strong>
                    </Legend>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <section
      id="results"
      aria-labelledby="results-heading"
      style={{ background: 'var(--paper)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', padding: '90px 0' }}
    >
      <div className="wrap">
        <div className="rv" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 28 }}>
          <div>
            <SectionLabel num="06">{t('pd.results.label')}</SectionLabel>
            <h2 id="results-heading" className="serif h2">{live ? t('pd.results.title') : t('home.stats.title')}</h2>
            {live && <p className="lede">{t('trust.stats.subtitle', { months: stats.periodMonths })}</p>}
          </div>
          {live && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <span className="live"><i />{t('pd.results.synced')}</span>
            </div>
          )}
        </div>

        {body}
        <CompanyStrip />

        {live && (
          <p className="mono" style={{ margin: '22px 0 0', color: 'var(--mut)', fontSize: 11.5, lineHeight: 1.7, textTransform: 'none', letterSpacing: '.04em' }}>
            {t('trust.stats.source', { date: formatStatsDate(stats.generatedAt) })}
          </p>
        )}
      </div>
    </section>
  );
}
