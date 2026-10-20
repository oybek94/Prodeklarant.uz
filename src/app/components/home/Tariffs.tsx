import { useTranslation } from 'react-i18next';
import { openContactModal, TARIFFS } from '../../utils/contactModal';
import { formatAmount, siteData } from '../../utils/siteData';
import { SectionLabel, TickRow, type CssVars } from './shared';

export default function Tariffs() {
  const { t } = useTranslation();
  return (
    <section id="tariffs" style={{ background: '#fff', padding: '120px 0' }}>
      <div className="wrap">
        <div className="rv">
          <SectionLabel num="06">{t('pd.tariffs.label')}</SectionLabel>
          <h2 className="serif h2">{t('pd.tariffs.title')}</h2>
          <p className="lede">{t('home.tariffs.subtitle')}</p>
        </div>
        <div style={{ marginTop: 60, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 0, alignItems: 'stretch' }}>
          {TARIFFS.map((key, i) => {
            const featured = key === 'optimal';
            const features = t(`home.tariffs.${key}.features`, { returnObjects: true }) as string[];
            // "…dan boshlab" narx — ixtiyoriy (site-data.json: tariffPrices); bo'lmasa faqat tugma
            const price = siteData.tariffPrices[key];
            return (
              <article key={key} className={`tcol${featured ? ' tcol-f' : ''} rv`} style={{ '--s': `${i * 8}%` } as CssVars}>
                {featured ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div className="mono" style={{ color: 'var(--gold)' }}>{t('pd.tariffs.tier')} 0{i + 1}</div>
                    <div className="mono" style={{ background: 'var(--gold)', color: '#1B1300', padding: '4px 10px', fontSize: 11.5 }}>{t('home.tariffs.recommended')}</div>
                  </div>
                ) : (
                  <div className="mono" style={{ color: 'var(--gold-d)' }}>{t('pd.tariffs.tier')} 0{i + 1}</div>
                )}
                <h3 className="serif" style={{ fontSize: 40, margin: '10px 0 0', lineHeight: 1.1 }}>{t(`home.tariffs.${key}.name`)}</h3>
                <div style={{ color: featured ? 'rgba(255, 255, 255, .7)' : 'var(--mut)', marginTop: 6 }}>{t(`pd.tariffs.taglines.${key}`)}</div>
                {price && (
                  <div className="serif" style={{ marginTop: 22, fontSize: 24, color: featured ? 'var(--gold)' : 'var(--ink)' }}>
                    {t('trust.priceFrom', { price: `${formatAmount(price.amount)} ${t(`trust.currency.${price.currency}`)}` })}
                  </div>
                )}
                <div style={{ margin: '30px 0 32px' }}>
                  <button type="button" className={`btn ${featured ? 'btn-gold' : 'btn-line-l'}`} style={{ width: '100%' }} onClick={() => openContactModal({ tariff: key })}>
                    {t('home.tariffs.askPrice')}
                  </button>
                </div>
                {Array.isArray(features) && features.map((f) => <TickRow key={f} dark={featured}>{f}</TickRow>)}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
