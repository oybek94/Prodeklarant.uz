import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import products from '../../content/products.json';
import { submitLead, LeadError } from '../api';
import type { Tariff } from '../utils/contactModal';

type FieldErrors = Partial<Record<'name' | 'phone' | 'product' | 'country' | 'comment', string>>;

/** Kiritilgan qatordan 9 ta mahalliy raqamni ajratadi (+998 prefiksi alohida ko'rsatiladi). */
function toLocalDigits(raw: string): string {
  let d = raw.replace(/\D/g, '');
  if (d.length > 9 && d.startsWith('998')) d = d.slice(3);
  return d.slice(0, 9);
}

/** "901234567" → "90 123 45 67" */
function formatLocal(d: string): string {
  return [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean).join(' ');
}

/**
 * Ariza formasi (dizayn: .field uslubi). `compact` — faqat ism, telefon, mahsulot (bosh sahifa);
 * aks holda davlat va izoh maydonlari ham bor (modal). `idPrefix` — bir sahifada ikki forma
 * bo'lganda id'lar to'qnashmasligi uchun.
 */
export default function LeadForm({
  tariff,
  onClose,
  compact = false,
  idPrefix = 'lead',
}: {
  tariff: Tariff | null;
  onClose?: () => void;
  compact?: boolean;
  idPrefix?: string;
}) {
  const { t, i18n } = useTranslation();
  const [name, setName] = useState('');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [product, setProduct] = useState('');
  const [country, setCountry] = useState('');
  const [comment, setComment] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const errorText = (code?: string) => (code ? t(`leadForm.errors.${code}`) : '');
  const id = (field: string) => `${idPrefix}-${field}`;

  function validate(): FieldErrors {
    const e: FieldErrors = {};
    if (name.trim().length < 2) e.name = 'required';
    if (phoneDigits.length !== 9) e.phone = 'invalid_phone';
    if (!product) e.product = 'required';
    return e;
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    setFormError('');
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    setStatus('submitting');
    try {
      await submitLead({
        name: name.trim(),
        phone: `+998${phoneDigits}`,
        product,
        country: country.trim(),
        comment: comment.trim(),
        tariff,
        locale: (i18n.language || 'uz').split('-')[0],
        sourcePath: window.location.pathname,
        website,
      });
      setStatus('success');
    } catch (err) {
      setStatus('idle');
      if (err instanceof LeadError && err.code === 'validation') {
        setErrors(err.fields as FieldErrors);
      } else {
        setFormError(t(err instanceof LeadError && err.code === 'rate' ? 'leadForm.errors.rate' : 'leadForm.errors.server'));
      }
    }
  }

  if (status === 'success') {
    return (
      <div className="spanel" role="status" style={{ padding: '24px 0' }}>
        <div className="ibox" style={{ background: 'var(--blue)', color: '#fff', borderColor: 'var(--blue)' }}>
          <Check size={26} strokeWidth={2} aria-hidden />
        </div>
        <h3 className="serif" style={{ margin: '24px 0 10px', fontSize: 32, lineHeight: 1.15 }}>{t('leadForm.success.title')}</h3>
        <p style={{ margin: 0, color: 'var(--mut)' }}>{t('leadForm.success.desc')}</p>
        {onClose && (
          <button type="button" onClick={onClose} className="btn btn-line-l" style={{ marginTop: 28 }}>
            {t('home.tariffs.close')}
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'grid', gap: 18 }}>
      {tariff && (
        <p className="mono" style={{ margin: 0, color: 'var(--gold-d)', fontSize: 12 }}>
          {t('leadForm.tariffLabel')}: {t(`home.tariffs.${tariff}.name`)}
        </p>
      )}

      <div className="field">
        <label htmlFor={id('name')}>{t('leadForm.name')}</label>
        <input
          id={id('name')}
          type="text"
          autoComplete="name"
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? id('name-err') : undefined}
        />
        {errors.name && <span id={id('name-err')} className="err">{errorText(errors.name)}</span>}
      </div>

      <div className="field">
        <label htmlFor={id('phone')}>{t('leadForm.phone')}</label>
        <div style={{ display: 'flex' }}>
          <span className="phone-pre">+998</span>
          <input
            id={id('phone')}
            className="phone-in"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="90 123 45 67"
            value={formatLocal(phoneDigits)}
            onChange={(e) => setPhoneDigits(toLocalDigits(e.target.value))}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? id('phone-err') : undefined}
          />
        </div>
        {errors.phone && <span id={id('phone-err')} className="err">{errorText(errors.phone)}</span>}
      </div>

      <div className="field">
        <label htmlFor={id('product')}>{t('leadForm.product')}</label>
        <select
          id={id('product')}
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          aria-invalid={!!errors.product}
          aria-describedby={errors.product ? id('product-err') : undefined}
        >
          <option value="">{t('leadForm.productPlaceholder')}</option>
          {products.map((p) => (
            <option key={p.key} value={p.key}>{t(`leadForm.products.${p.key}`)}</option>
          ))}
        </select>
        {errors.product && <span id={id('product-err')} className="err">{errorText(errors.product)}</span>}
      </div>

      {!compact && (
        <>
          <div className="field">
            <label htmlFor={id('country')}>{t('leadForm.country')}</label>
            <input
              id={id('country')}
              type="text"
              autoComplete="country-name"
              maxLength={80}
              placeholder={t('leadForm.countryPlaceholder')}
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
            {errors.country && <span className="err">{errorText(errors.country)}</span>}
          </div>

          <div className="field">
            <label htmlFor={id('comment')}>{t('leadForm.comment')}</label>
            <textarea id={id('comment')} rows={2} maxLength={1000} value={comment} onChange={(e) => setComment(e.target.value)} />
            {errors.comment && <span className="err">{errorText(errors.comment)}</span>}
          </div>
        </>
      )}

      {/* Honeypot: odamlarga ko'rinmaydi, botlar to'ldiradi — server bunday arizani saqlamaydi */}
      <div aria-hidden="true" style={{ position: 'absolute', left: -9999, width: 1, height: 1, overflow: 'hidden' }}>
        <label htmlFor={id('website')}>Website</label>
        <input id={id('website')} type="text" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>

      {formError && <p role="alert" style={{ margin: 0, color: '#B3261E', fontSize: 15, fontWeight: 500 }}>{formError}</p>}

      <button type="submit" disabled={status === 'submitting'} className="btn btn-ink" style={{ marginTop: 6, width: '100%' }}>
        {status === 'submitting' ? t('leadForm.sending') : t('leadForm.submit')}
        {status === 'submitting' ? <Loader2 size={20} className="animate-spin" aria-hidden /> : <ArrowRight size={20} strokeWidth={1.8} aria-hidden />}
      </button>
    </form>
  );
}
