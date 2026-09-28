/**
 * Ariza (lead) validatsiyasi — DB'ga bog'liq emas (test: server/test/leads.test.js).
 * Mahsulotlar ro'yxati frontend bilan umumiy: src/content/products.json.
 */
const PRODUCTS = require('../../src/content/products.json').map((p) => p.key);

const TARIFFS = ['start', 'optimal', 'vip'];
const LOCALES = ['uz', 'ru', 'en'];
const STATUSES = ['new', 'contacted', 'closed'];
const LIMITS = { name: 100, country: 80, comment: 1000, sourcePath: 200 };

/**
 * O'zbekiston raqamini "+998XXXXXXXXX" ko'rinishiga keltiradi; noto'g'ri bo'lsa null.
 * Qabul qilinadi: "+998 90 123 45 67", "998901234567", "90 123 45 67" (9 raqam).
 */
function normalizeUzPhone(input) {
  let digits = String(input == null ? '' : input).replace(/\D/g, '');
  if (digits.length === 9) digits = `998${digits}`;
  return /^998\d{9}$/.test(digits) ? `+${digits}` : null;
}

function cleanText(v, max) {
  const s = String(v == null ? '' : v).replace(/\s+/g, ' ').trim();
  return s.length > max ? null : s;
}

/**
 * @returns {{ ok: true, value: object } | { ok: false, errors: Record<string, string> }}
 * Xato kodlari frontend'da tarjima qilinadi (leadForm.errors.*).
 */
function validateLead(body) {
  const b = body && typeof body === 'object' ? body : {};
  const errors = {};

  const name = cleanText(b.name, LIMITS.name);
  if (name === null) errors.name = 'too_long';
  else if (name.length < 2) errors.name = 'required';

  const phone = normalizeUzPhone(b.phone);
  if (!phone) errors.phone = 'invalid_phone';

  const product = String(b.product || '');
  if (!PRODUCTS.includes(product)) errors.product = 'required';

  const country = cleanText(b.country, LIMITS.country);
  if (country === null) errors.country = 'too_long';

  // Izohda qator ko'chirishlarni saqlaymiz, faqat uzunlikni tekshiramiz
  const comment = String(b.comment == null ? '' : b.comment).trim();
  if (comment.length > LIMITS.comment) errors.comment = 'too_long';

  const tariff = TARIFFS.includes(b.tariff) ? b.tariff : null;
  const locale = LOCALES.includes(b.locale) ? b.locale : 'uz';
  const sourcePath = String(b.sourcePath || '').slice(0, LIMITS.sourcePath);

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    value: { name, phone, product, country: country || null, comment: comment || null, tariff, locale, sourcePath },
  };
}

module.exports = { PRODUCTS, TARIFFS, STATUSES, normalizeUzPhone, validateLead };
