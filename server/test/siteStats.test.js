process.env.CRM_STATS_URL = 'http://crm.test/api/public/site-stats';
process.env.CRM_STATS_KEY = 'k'.repeat(32);

const test = require('node:test');
const assert = require('node:assert/strict');
const { getSiteStats, isValid, _reset } = require('../services/siteStats');

const sample = () => ({
  generatedAt: '2026-10-16T07:00:00.000Z',
  periodMonths: 12,
  declarations: { total: 10, thisMonth: 2, monthly: [{ month: '2026-10', count: 2 }] },
  cargo: { tonnes: 5.5, byProduct: [{ key: 'cherry', tonnes: 5.5 }] },
  destinations: { countries: 1, byCountry: [{ code: 'RU', count: 10 }], otherCount: 0 },
  clients: { active: 3 },
});

const json = (body, status = 200) => new Response(JSON.stringify(body), { status });

test('isValid: noto\'g\'ri shaklni rad etadi', () => {
  assert.equal(isValid(sample()), true);
  assert.equal(isValid(null), false);
  assert.equal(isValid({ declarations: {} }), false);
});

test('CRM kalitni sarlavhada yuboradi va javobni keshlaydi', async (t) => {
  _reset();
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, opts) => {
    calls.push({ url, key: opts.headers['x-site-stats-key'] });
    return json(sample());
  });
  const a = await getSiteStats();
  const b = await getSiteStats();
  assert.equal(a.declarations.total, 10);
  assert.equal(b, a);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, process.env.CRM_STATS_URL);
  assert.equal(calls[0].key, process.env.CRM_STATS_KEY);
});

test('CRM xato bersa va kesh yo\'q bo\'lsa — null (to\'qima raqam yo\'q)', async (t) => {
  _reset();
  t.mock.method(globalThis, 'fetch', async () => json({ error: 'x' }, 500));
  t.mock.method(console, 'error', () => {});
  assert.equal(await getSiteStats(), null);
});

test('CRM yaroqsiz shakl qaytarsa — null', async (t) => {
  _reset();
  t.mock.method(globalThis, 'fetch', async () => json({ hello: 'world' }));
  t.mock.method(console, 'error', () => {});
  assert.equal(await getSiteStats(), null);
});
