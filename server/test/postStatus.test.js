// Ishga tushirish: cd server && npm test
// Qoralama (status='draft') ommaviy API/SSR'da ko'rinmasligi va admin nashr qilgach paydo bo'lishi.
process.env.BLOG_DB_PATH = ':memory:';

const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../db');
const postsRouter = require('../routes/posts');
const { listPosts, findPost } = require('../services/posts');

const app = express();
app.use(express.json());
app.use('/api/posts', postsRouter);

let server;
let base;
const adminToken = jwt.sign({ admin: true }, config.JWT_SECRET);
const auth = { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' };

test.before(async () => {
  await new Promise((resolve) => { server = app.listen(0, resolve); });
  base = `http://127.0.0.1:${server.address().port}/api/posts`;
});
test.after(() => server.close());

const body = (title, status) => JSON.stringify({
  title_uz: title, title_ru: `${title} ru`, title_en: `${title} en`,
  excerpt_uz: 'e', excerpt_ru: 'e', excerpt_en: 'e',
  body_uz: 'b', body_ru: 'b', body_en: 'b',
  date: '2026-01-01', ...(status ? { status } : {}),
});

let pubId; let draftId; let draftSlug;

test('POST: status default published, draft saqlanadi, noto\'g\'ri status 400', async () => {
  const pub = await (await fetch(base, { method: 'POST', headers: auth, body: body('Nashr qilingan maqola') })).json();
  assert.equal(pub.status, 'published');
  pubId = pub.id;

  const draft = await (await fetch(base, { method: 'POST', headers: auth, body: body('Qoralama maqola', 'draft') })).json();
  assert.equal(draft.status, 'draft');
  draftId = draft.id; draftSlug = draft.slug;

  const bad = await fetch(base, { method: 'POST', headers: auth, body: body('Xato status', 'secret') });
  assert.equal(bad.status, 400);
});

test('ommaviy ro\'yxat, slug va id qoralamani ko\'rsatmaydi', async () => {
  const list = await (await fetch(`${base}?limit=50`)).json();
  assert.deepEqual(list.data.map((p) => p.id), [pubId]);
  assert.equal(list.pagination.total, 1);

  // ?status=all token bo'lmasa e'tiborga olinmaydi
  const sneaky = await (await fetch(`${base}?status=all`)).json();
  assert.deepEqual(sneaky.data.map((p) => p.id), [pubId]);

  assert.equal((await fetch(`${base}/slug/${draftSlug}`)).status, 404);
  assert.equal((await fetch(`${base}/${draftId}`)).status, 404);
  assert.equal((await fetch(`${base}/${pubId}`)).status, 200);
});

test('admin tokeni bilan qoralama ko\'rinadi', async () => {
  const all = await (await fetch(`${base}?status=all`, { headers: auth })).json();
  assert.equal(all.data.length, 2);
  const drafts = await (await fetch(`${base}?status=draft`, { headers: auth })).json();
  assert.deepEqual(drafts.data.map((p) => p.id), [draftId]);
  assert.equal((await fetch(`${base}/${draftId}`, { headers: auth })).status, 200);
  // token bo'lsa ham status ko'rsatilmasa ommaviy ro'yxat (blog sahifasi) qoralamasiz
  const plain = await (await fetch(base, { headers: auth })).json();
  assert.deepEqual(plain.data.map((p) => p.id), [pubId]);
});

test('view endpoint qoralama uchun 404 beradi va hisoblagichni oshirmaydi', async () => {
  const draft = await fetch(`${base}/${draftId}/view`, { method: 'POST' });
  assert.equal(draft.status, 404);
  assert.equal(db.prepare('SELECT views FROM posts WHERE id = ?').get(draftId).views, 0);

  const pub = await fetch(`${base}/${pubId}/view`, { method: 'POST' });
  assert.equal(pub.status, 200);
  assert.equal((await pub.json()).views, 1);
});

test('SSR servislari (listPosts/findPost) qoralamani qaytarmaydi', () => {
  assert.deepEqual(listPosts(50).map((p) => p.id), [pubId]);
  assert.equal(findPost(draftSlug), null);
  assert.equal(findPost(`${draftId}-qoralama`), null);
  assert.ok(findPost(db.prepare('SELECT slug FROM posts WHERE id = ?').get(pubId).slug));
});

test('PUT status=published: qoralama nashr bo\'ladi, created_at va sana yangilanadi', async () => {
  db.prepare("UPDATE posts SET created_at = '2020-01-01 00:00:00' WHERE id = ?").run(draftId);
  const res = await fetch(`${base}/${draftId}`, { method: 'PUT', headers: auth, body: JSON.stringify({ status: 'published' }) });
  const post = await res.json();
  assert.equal(post.status, 'published');
  assert.notEqual(post.created_at, '2020-01-01 00:00:00');
  assert.equal(post.date, new Date().toISOString().slice(0, 10));

  assert.equal((await fetch(`${base}/slug/${draftSlug}`)).status, 200);
  const list = await (await fetch(base)).json();
  assert.equal(list.data.length, 2);
});

test('PUT noto\'g\'ri status 400, qoralamaga qaytarish ishlaydi', async () => {
  const bad = await fetch(`${base}/${draftId}`, { method: 'PUT', headers: auth, body: JSON.stringify({ status: 'x' }) });
  assert.equal(bad.status, 400);
  await fetch(`${base}/${draftId}`, { method: 'PUT', headers: auth, body: JSON.stringify({ status: 'draft' }) });
  assert.equal((await fetch(`${base}/slug/${draftSlug}`)).status, 404);
});
