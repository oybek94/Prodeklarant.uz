import { MapPin, Phone, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LeadForm from '../LeadForm';
import { SectionLabel } from './shared';

const rowStyle = { display: 'flex', alignItems: 'center', gap: 18, padding: '20px 0', borderTop: '1px solid rgba(255, 255, 255, .16)' } as const;
const kicker = { color: 'rgba(255, 255, 255, .55)', fontSize: 11.5 } as const;

export default function ContactSection({ num = '06' }: { num?: string }) {
  const { t } = useTranslation();
  return (
    <section id="contact" style={{ position: 'relative', overflow: 'hidden', background: 'var(--deep)', color: '#fff', padding: '120px 0' }}>
      <img
        src="/images/p4483610-1280.jpg"
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.16, filter: 'grayscale(1)' }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(6, 27, 51, .96), rgba(6, 27, 51, .8))' }} />
      <div className="wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: '64px 80px', alignItems: 'flex-start' }}>
        <div className="rv" style={{ flex: '1 1 440px', minWidth: 0 }}>
          <SectionLabel num={num} dark>{t('pd.contact.label')}</SectionLabel>
          <h2 className="serif h2 h2-d" style={{ maxWidth: 560 }}>{t('pd.contact.title')}</h2>
          <p className="lede lede-d">{t('pd.contact.lede')}</p>
          <div style={{ marginTop: 44, borderBottom: '1px solid rgba(255, 255, 255, .16)' }}>
            <a href="tel:+998911187007" style={rowStyle}>
              <div className="ibox ibox-d"><Phone size={22} strokeWidth={1.6} aria-hidden /></div>
              <div>
                <div className="mono" style={kicker}>{t('pd.contact.phone')}</div>
                <div className="serif" style={{ fontSize: 26, lineHeight: 1.2 }}>+998 91 118 70 07</div>
              </div>
            </a>
            <a href="https://t.me/+998911187007" target="_blank" rel="noopener noreferrer" style={rowStyle}>
              <div className="ibox ibox-d"><Send size={22} strokeWidth={1.6} aria-hidden /></div>
              <div>
                <div className="mono" style={kicker}>{t('pd.contact.telegram')}</div>
                <div className="serif" style={{ fontSize: 26, lineHeight: 1.2 }}>{t('pd.contact.write')}</div>
              </div>
            </a>
            <div style={rowStyle}>
              <div className="ibox ibox-d"><MapPin size={22} strokeWidth={1.6} aria-hidden /></div>
              <div>
                <div className="mono" style={kicker}>{t('pd.contact.address')}</div>
                <div style={{ fontSize: 17, lineHeight: 1.4 }}>{t('pd.contact.addressText')}</div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="rv"
          style={{ '--s': '10%', flex: '1 1 420px', minWidth: 0, maxWidth: 560, background: '#fff', color: 'var(--ink)', padding: '44px 40px', borderRadius: 2, boxShadow: '0 40px 80px -30px rgba(0, 0, 0, .6)', borderTop: '4px solid var(--gold)' } as React.CSSProperties}
        >
          <div className="mono" style={{ color: 'var(--gold-d)' }}>{t('pd.contact.formKicker')}</div>
          <h3 className="serif" style={{ margin: '10px 0 8px', fontSize: 32, lineHeight: 1.15 }}>{t('pd.contact.formTitle')}</h3>
          <p style={{ margin: '0 0 28px', color: 'var(--mut)', fontSize: 16 }}>{t('pd.contact.formSub')}</p>
          <LeadForm tariff={null} compact idPrefix="home" />
        </div>
      </div>
    </section>
  );
}
