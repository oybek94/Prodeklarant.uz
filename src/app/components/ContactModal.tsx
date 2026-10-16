import { useState, useEffect } from 'react';
import { X, Phone, Send, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LeadForm from './LeadForm';
import { CONTACT_MODAL_EVENT, TARIFFS, type ContactModalDetail, type Tariff } from '../utils/contactModal';

const linkRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  padding: '14px 0',
  borderTop: '1px solid var(--line)',
};

export default function ContactModal() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [tariff, setTariff] = useState<Tariff | null>(null);
  // Har ochilishda forma yangidan boshlansin (oldingi muvaffaqiyat/xato holati qolmasin)
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const requested = (e as CustomEvent<ContactModalDetail>).detail?.tariff;
      setTariff(requested && TARIFFS.includes(requested) ? requested : null);
      setFormKey((k) => k + 1);
      setIsOpen(true);
    };
    window.addEventListener(CONTACT_MODAL_EVENT, handleOpen);
    return () => window.removeEventListener(CONTACT_MODAL_EVENT, handleOpen);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="pd">
      <div className="modal-back" onClick={() => setIsOpen(false)} role="dialog" aria-modal="true" aria-labelledby="contact-modal-title">
        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
          <button type="button" className="modal-x" onClick={() => setIsOpen(false)} aria-label={t('home.tariffs.close')}>
            <X size={22} strokeWidth={1.6} />
          </button>

          <div className="mono" style={{ color: 'var(--gold-d)' }}>{t('pd.contact.formKicker')}</div>
          <h3 id="contact-modal-title" className="serif" style={{ margin: '10px 0 8px', fontSize: 32, lineHeight: 1.15 }}>
            {t('pd.contact.formTitle')}
          </h3>
          <p style={{ margin: '0 0 26px', color: 'var(--mut)', fontSize: 16 }}>{t('leadForm.subtitle')}</p>

          <LeadForm key={formKey} tariff={tariff} onClose={() => setIsOpen(false)} idPrefix="modal" />

          <div className="mono" style={{ margin: '30px 0 6px', color: 'var(--mut)', fontSize: 11.5 }}>{t('leadForm.orMessenger')}</div>
          <div style={{ borderBottom: '1px solid var(--line)' }}>
            <a href="https://t.me/+998911187007" target="_blank" rel="noopener noreferrer" style={linkRow}>
              <span className="ibox" style={{ width: 44, height: 44 }}><Send size={20} strokeWidth={1.6} aria-hidden /></span>
              <span style={{ fontWeight: 600, flex: 1 }}>Telegram</span>
              <span style={{ color: 'var(--mut)', fontSize: 15 }}>+998 91 118 70 07</span>
            </a>
            <a href="https://wa.me/998911187007" target="_blank" rel="noopener noreferrer" style={linkRow}>
              <span className="ibox" style={{ width: 44, height: 44 }}><MessageCircle size={20} strokeWidth={1.6} aria-hidden /></span>
              <span style={{ fontWeight: 600, flex: 1 }}>WhatsApp</span>
              <span style={{ color: 'var(--mut)', fontSize: 15 }}>+998 91 118 70 07</span>
            </a>
            <a href="tel:+998911187007" style={linkRow}>
              <span className="ibox" style={{ width: 44, height: 44 }}><Phone size={20} strokeWidth={1.6} aria-hidden /></span>
              <span style={{ fontWeight: 600, flex: 1 }}>{t('contact.modal.call')}</span>
              <span style={{ color: 'var(--mut)', fontSize: 15 }}>+998 91 118 70 07</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
