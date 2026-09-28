// Ishga tushirish: cd server && npm test
const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeUzPhone, validateLead } = require('../services/leadValidation');

test('normalizeUzPhone: valid Uzbek numbers in different formats', () => {
  assert.equal(normalizeUzPhone('+998 90 123 45 67'), '+998901234567');
  assert.equal(normalizeUzPhone('998901234567'), '+998901234567');
  assert.equal(normalizeUzPhone('90 123-45-67'), '+998901234567');
  assert.equal(normalizeUzPhone('(91) 118 70 07'), '+998911187007');
});

test('normalizeUzPhone: rejects wrong length, other countries and empty input', () => {
  for (const bad of ['', null, undefined, '12345', '+998 90 123 45', '+998 90 123 45 678', '+7 912 345 67 89', '+1 202 555 0123', 'abc']) {
    assert.equal(normalizeUzPhone(bad), null, `should reject ${String(bad)}`);
  }
});

const valid = { name: 'Aziz', phone: '+998 90 123 45 67', product: 'gilos' };

test('validateLead: minimal valid lead, optional fields default to null', () => {
  const r = validateLead(valid);
  assert.equal(r.ok, true);
  assert.deepEqual(r.value, {
    name: 'Aziz', phone: '+998901234567', product: 'gilos',
    country: null, comment: null, tariff: null, locale: 'uz', sourcePath: '',
  });
});

test('validateLead: keeps tariff/locale only from the allowed lists', () => {
  assert.equal(validateLead({ ...valid, tariff: 'optimal', locale: 'ru' }).value.tariff, 'optimal');
  assert.equal(validateLead({ ...valid, tariff: 'gold' }).value.tariff, null);
  assert.equal(validateLead({ ...valid, locale: 'de' }).value.locale, 'uz');
});

test('validateLead: reports field errors', () => {
  const r = validateLead({ name: ' ', phone: '123', product: 'banana', country: 'x'.repeat(81), comment: 'y'.repeat(1001) });
  assert.equal(r.ok, false);
  assert.deepEqual(r.errors, {
    name: 'required', phone: 'invalid_phone', product: 'required', country: 'too_long', comment: 'too_long',
  });
});

test('validateLead: handles missing body', () => {
  assert.equal(validateLead(undefined).ok, false);
  assert.equal(validateLead(null).ok, false);
});
