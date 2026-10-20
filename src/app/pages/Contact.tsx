import { useState, type FormEvent } from 'react';
import { ArrowRight, Check, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PHONE = '+998911187007';

export default function Contact() {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: ''
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    // Xabar serverga (/api/contact) yuboriladi — Telegram tokeni faqat serverda qoladi.
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || t('contact.form.error') || "Xatolik yuz berdi. Qayta urinib ko'ring.");
      }

      setIsSubmitted(true);
      setFormData({ name: '', phone: '', message: '' }); // tozalash
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (err) {
      setErrorMsg(
        err instanceof Error && err.message
          ? err.message
          : (t('contact.form.error') || "Xatolik yuz berdi. Qayta urinib ko'ring.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // "24/7" kabi qiymatda "/" oltin rangda ko'rsatiladi
  const hours = t('contact.info.hours1');
  const hoursParts = /^(\d+)\/(\d+)$/.exec(hours);

  const channels = [
    { key: 'phone', label: t('pd.contact.phone'), value: '+998 91 118 70 07', href: `tel:${PHONE}`, external: false, small: false },
    { key: 'telegram', label: t('pd.contact.telegram'), value: t('pd.contact.write'), href: 'https://t.me/+998911187007', external: true, small: false },
    { key: 'whatsapp', label: 'WhatsApp', value: t('pd.contact.write'), href: 'https://wa.me/998911187007', external: true, small: false },
    { key: 'email', label: t('contact.info.email'), value: 'info@prodeklarant.uz', href: 'mailto:info@prodeklarant.uz', external: false, small: true },
  ];

  return (
    <div className="pd">
      <section className="ct-split">
        <div className="ct-left">
          <div className="ct-kick">
            <span className="mono">{t('pd.contact.label')}</span>
            <span className="ct-kick-l" />
          </div>
          <h1 className="serif ct-h1">{t('contact.title')}</h1>
          <p className="ct-lede">{t('contact.subtitle')}</p>

          <div className="ct-list">
            {channels.map((c) => (
              <a
                key={c.key}
                className="ct-ch"
                href={c.href}
                {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                <span className="mono ct-chl">{c.label}</span>
                <span className="serif ct-chv" style={c.small ? { fontSize: 30 } : undefined}>{c.value}</span>
                <span className="ct-ar"><ArrowRight size={20} strokeWidth={1.8} aria-hidden /></span>
              </a>
            ))}
          </div>
        </div>

        <form className="ct-right" onSubmit={handleSubmit}>
          <div className="mono ct-fk">{t('pd.contact.formKicker')}</div>
          <h2 className="serif ct-ft">{t('pd.contact.formTitle')}</h2>
          <p className="ct-fs">{t('pd.contact.formSub')}</p>

          {isSubmitted ? (
            <div className="ct-ok" role="status">
              <div className="ct-ok-i"><Check size={28} strokeWidth={2} aria-hidden /></div>
              <h3 className="serif">{t('contact.form.success.title')}</h3>
              <p>{t('contact.form.success.desc')}</p>
            </div>
          ) : (
            <>
              <div className="ct-fields">
                <div className="ct-uf">
                  <label htmlFor="ct-name">{t('contact.form.name')}</label>
                  <input
                    id="ct-name"
                    type="text"
                    required
                    autoComplete="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t('contact.form.namePlaceholder')}
                  />
                </div>
                <div className="ct-uf">
                  <label htmlFor="ct-phone">{t('contact.form.phone')}</label>
                  <input
                    id="ct-phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder={t('contact.form.phonePlaceholder')}
                  />
                </div>
                <div className="ct-uf">
                  <label htmlFor="ct-msg">{t('contact.form.message')}</label>
                  <textarea
                    id="ct-msg"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={t('contact.form.messagePlaceholder')}
                  />
                </div>
              </div>

              {errorMsg && (
                <p role="alert" aria-live="assertive" className="ct-err">
                  {errorMsg}
                </p>
              )}

              <button type="submit" disabled={isSubmitting} className="ct-send">
                <span>{isSubmitting ? t('contact.form.submitting') : t('contact.form.submit')}</span>
                <ArrowRight size={22} aria-hidden />
              </button>
            </>
          )}
        </form>
      </section>

      <section className="ct-band">
        <div className="ct-info">
          <div className="mono ct-il">{t('contact.info.hours')}</div>
          <div className="serif ct-big">
            {hoursParts ? (
              <>
                {hoursParts[1]}<span className="ct-slash">/</span>{hoursParts[2]}
              </>
            ) : (
              hours
            )}
          </div>
          <div className="ct-addr">
            <div className="mono ct-il">{t('contact.info.address')}</div>
            <div className="ct-av">{t('contact.info.addressValue')}</div>
          </div>
        </div>
        <div className="ct-map">
          <iframe
            src="https://maps.google.com/maps?q=40.3736,71.6794&z=14&hl=uz&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            title="Google Maps"
          />
          <div className="ct-pin" aria-hidden="true">
            <div className="ct-pin-i"><MapPin size={24} strokeWidth={2} /></div>
            <div>
              <div className="mono">Prodeklarant</div>
              <div className="ct-pin-s">Farg'ona, Oltiariq</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
