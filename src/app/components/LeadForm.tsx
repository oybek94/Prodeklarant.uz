import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import products from '../../content/products.json';
import { submitLead, LeadError } from '../api';
import type { Tariff } from '../utils/contactModal';

type FieldErrors = Partial<Record<'name' | 'phone' | 'product' | 'country' | 'comment', string>>;

const inputClass =
  'w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all font-medium text-slate-800 placeholder:text-slate-400';
const labelClass = 'block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5';

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

export default function LeadForm({ tariff, onClose }: { tariff: Tariff | null; onClose: () => void }) {
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
      <div className="py-6 text-center" role="status">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} />
        </div>
        <h4 className="text-xl font-extrabold text-slate-900 mb-2">{t('leadForm.success.title')}</h4>
        <p className="text-slate-500 text-sm font-medium mb-6">{t('leadForm.success.desc')}</p>
        <button
          type="button"
          onClick={onClose}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-xl text-sm transition-colors"
        >
          {t('home.tariffs.close')}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4 text-left">
      {tariff && (
        <p className="text-xs font-bold uppercase tracking-wider text-brand bg-brand/10 rounded-full px-3 py-1.5 inline-block">
          {t('leadForm.tariffLabel')}: {t(`home.tariffs.${tariff}.name`)}
        </p>
      )}

      <div>
        <label htmlFor="lead-name" className={labelClass}>{t('leadForm.name')}</label>
        <input
          id="lead-name"
          type="text"
          autoComplete="name"
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'lead-name-err' : undefined}
          className={inputClass}
        />
        {errors.name && <p id="lead-name-err" className="text-red-600 text-xs font-semibold mt-1">{errorText(errors.name)}</p>}
      </div>

      <div>
        <label htmlFor="lead-phone" className={labelClass}>{t('leadForm.phone')}</label>
        <div className="flex">
          <span className="inline-flex items-center px-3 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl font-bold text-slate-600">
            +998
          </span>
          <input
            id="lead-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="90 123 45 67"
            value={formatLocal(phoneDigits)}
            onChange={(e) => setPhoneDigits(toLocalDigits(e.target.value))}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'lead-phone-err' : undefined}
            className={`${inputClass} rounded-l-none`}
          />
        </div>
        {errors.phone && <p id="lead-phone-err" className="text-red-600 text-xs font-semibold mt-1">{errorText(errors.phone)}</p>}
      </div>

      <div>
        <label htmlFor="lead-product" className={labelClass}>{t('leadForm.product')}</label>
        <select
          id="lead-product"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          aria-invalid={!!errors.product}
          aria-describedby={errors.product ? 'lead-product-err' : undefined}
          className={inputClass}
        >
          <option value="">{t('leadForm.productPlaceholder')}</option>
          {products.map((p) => (
            <option key={p.key} value={p.key}>{t(`leadForm.products.${p.key}`)}</option>
          ))}
        </select>
        {errors.product && <p id="lead-product-err" className="text-red-600 text-xs font-semibold mt-1">{errorText(errors.product)}</p>}
      </div>

      <div>
        <label htmlFor="lead-country" className={labelClass}>{t('leadForm.country')}</label>
        <input
          id="lead-country"
          type="text"
          autoComplete="country-name"
          maxLength={80}
          placeholder={t('leadForm.countryPlaceholder')}
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className={inputClass}
        />
        {errors.country && <p className="text-red-600 text-xs font-semibold mt-1">{errorText(errors.country)}</p>}
      </div>

      <div>
        <label htmlFor="lead-comment" className={labelClass}>{t('leadForm.comment')}</label>
        <textarea
          id="lead-comment"
          rows={2}
          maxLength={1000}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className={`${inputClass} resize-none`}
        />
        {errors.comment && <p className="text-red-600 text-xs font-semibold mt-1">{errorText(errors.comment)}</p>}
      </div>

      {/* Honeypot: odamlarga ko'rinmaydi, botlar to'ldiradi — server bunday arizani saqlamaydi */}
      <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
        <label htmlFor="lead-website">Website</label>
        <input id="lead-website" type="text" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>

      {formError && <p className="text-red-600 text-sm font-semibold" role="alert">{formError}</p>}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-light text-brand-dark font-bold py-3.5 px-6 rounded-xl uppercase tracking-wider text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'submitting' ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        {status === 'submitting' ? t('leadForm.sending') : t('leadForm.submit')}
      </button>
    </form>
  );
}
