// Ishga tushirish: cd server && npm test
// SI generator: OpenAI va Pixabay mock qilingan, haqiqiy tarmoq/kalit ishlatilmaydi.
process.env.BLOG_DB_PATH = ':memory:';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const db = require('../db');
const gen = require('../services/postGenerator');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pd-gen-'));
const topicsFile = path.join(tmp, 'topics.json');
const seedFile = path.join(tmp, 'seed.json');
const uploadDir = path.join(tmp, 'uploads');
test.after(() => fs.rmSync(tmp, { recursive: true, force: true }));

const LONG_BODY = '## Birinchi bo\'lim\n' + 'Matn. '.repeat(150) + '\n\n## Ikkinchi bo\'lim\n' + 'Yana matn. '.repeat(100);

const paramLog = []; // mock klientga kelgan barcha so'rov parametrlari

/** Prompt turiga qarab javob beradigan soxta OpenAI klienti. */
function mockClient({ article, translation, suggestions } = {}) {
  const calls = [];
  return {
    calls,
    chat: {
      completions: {
        create: async (params) => {
          const { model, messages } = params;
          calls.push(model);
          paramLog.push(params);
          const sys = messages[0].content;
          let payload;
          if (sys.includes('tarjima qilasiz')) {
            payload = translation || {
              ru: { title: 'Заголовок', excerpt: 'Кратко', body: LONG_BODY, category: 'Совет' },
              en: { title: 'Title', excerpt: 'Short', body: LONG_BODY, category: 'Advice' },
            };
          } else if (sys.includes('kontent-strateg')) {
            payload = { topics: suggestions || [] };
          } else {
            payload = article || { title: 'Eksport hujjatlari bo\'yicha qo\'llanma', excerpt: 'Qisqa tavsif', body: LONG_BODY, category: 'Maslahat' };
          }
          return { choices: [{ message: { content: JSON.stringify(payload) } }] };
        },
      },
    },
  };
}

const base = (client, extra = {}) => ({
  db, client, topicsFile, topicsSeedFile: seedFile, uploadDir, today: () => '2026-03-01', ...extra,
});

test.beforeEach(() => {
  db.exec('DELETE FROM posts');
  fs.rmSync(topicsFile, { force: true });
  fs.writeFileSync(seedFile, JSON.stringify([{ topic: 'Mavzu 1', imageQuery: 'cargo' }, { topic: 'Mavzu 2', imageQuery: 'fruit' }]));
});

test('generateDraft: qoralama yozadi, 3 til, status=draft, mavzu ishlatilgan deb belgilanadi', async () => {
  const r = await gen.generateDraft(base(mockClient()));
  const row = db.prepare('SELECT * FROM posts WHERE id = ?').get(r.id);
  assert.equal(row.status, 'draft');
  assert.equal(row.title_uz, "Eksport hujjatlari bo'yicha qo'llanma");
  assert.equal(row.title_ru, 'Заголовок');
  assert.equal(row.title_en, 'Title');
  assert.equal(row.date, '2026-03-01');
  assert.equal(row.author, 'Prodeklarant');
  assert.equal(row.image, ''); // Pixabay kaliti berilmagan
  assert.match(row.slug, /^eksport-hujjatlari/);

  const topics = JSON.parse(fs.readFileSync(topicsFile, 'utf8'));
  assert.equal(topics[0].usedAt, '2026-03-01');
  assert.equal(topics[1].usedAt, undefined);

  // keyingi ishga tushirish 2-mavzuni oladi (sarlavha takrorlanmasligi uchun boshqa maqola)
  const second = await gen.generateDraft(base(mockClient({ article: { title: 'Ikkinchi maqola', excerpt: 'x', body: LONG_BODY, category: 'Maslahat' } })));
  assert.equal(second.topic, 'Mavzu 2');
});

test('barcha so\'rovlar gpt-6-luna ga ketadi va fikrlovchi modelga temperature yuborilmaydi', async () => {
  paramLog.length = 0;
  fs.writeFileSync(topicsFile, JSON.stringify([{ topic: 'Eski', imageQuery: '', usedAt: '2026-01-01' }]));
  await gen.generateDraft(base(mockClient({ suggestions: [{ topic: 'Yangi', imageQuery: 'x' }] })));
  assert.equal(paramLog.length, 3); // mavzu taklifi + maqola + tarjima
  for (const p of paramLog) {
    assert.equal(p.model, 'gpt-6-luna');
    assert.equal('temperature' in p, false);
  }
});

test('chatCompletion: response_format rad etilsa o\'sha parametrsiz qayta uriniladi; boshqa xatolar o\'tkazib yuboriladi', async () => {
  const { chatCompletion } = require('../services/translate');
  const seen = [];
  const flaky = {
    chat: { completions: { create: async (p) => {
      seen.push(p);
      if (p.response_format) throw Object.assign(new Error("Unsupported parameter: 'response_format'"), { status: 400 });
      return { ok: true };
    } } },
  };
  const r = await chatCompletion(flaky, { model: 'gpt-6-luna', temperature: 0.7, response_format: { type: 'json_object' }, messages: [] });
  assert.deepEqual(r, { ok: true });
  assert.equal(seen.length, 2);
  assert.equal('response_format' in seen[1], false);

  // eski model temperature'ni oladi
  seen.length = 0;
  await chatCompletion(flaky, { model: 'gpt-4o-mini', temperature: 0.3, messages: [] });
  assert.equal(seen[0].temperature, 0.3);

  // 400 emas yoki boshqa sabab — xato o'tadi
  const down = { chat: { completions: { create: async () => { throw Object.assign(new Error('rate limit'), { status: 429 }); } } } };
  await assert.rejects(chatCompletion(down, { model: 'gpt-6-luna', response_format: {}, messages: [] }), /rate limit/);
});

test('generateDraft --dry-run: DB, topics.json va rasm fayliga tegmaydi', async () => {
  const r = await gen.generateDraft(base(mockClient(), { dryRun: true, imageApiKey: 'k' }));
  assert.ok(r.article.uz.title && r.article.ru.title && r.article.en.title);
  assert.equal(db.prepare('SELECT COUNT(*) c FROM posts').get().c, 0);
  assert.equal(fs.existsSync(topicsFile), false);
  assert.equal(fs.existsSync(uploadDir), false);
});

test('writeArticle: juda qisqa yoki bo\'limsiz matn rad etiladi, DB o\'zgarmaydi', async () => {
  await assert.rejects(
    gen.generateDraft(base(mockClient({ article: { title: 'T', excerpt: 'e', body: '## A\nqisqa', category: 'c' } }))),
    /juda qisqa/
  );
  await assert.rejects(
    gen.generateDraft(base(mockClient({ article: { title: 'T', excerpt: 'e', body: 'x'.repeat(2000), category: 'c' } }))),
    /bo'lim/
  );
  assert.equal(db.prepare('SELECT COUNT(*) c FROM posts').get().c, 0);
  assert.equal(fs.existsSync(topicsFile), false); // mavzu "ishlatilgan" deb belgilanmagan
});

test('tarjima bo\'sh qaytsa maqola saqlanmaydi', async () => {
  const client = mockClient({ translation: { ru: { title: '', excerpt: '', body: '', category: '' }, en: { title: 'T', excerpt: 'e', body: 'b', category: 'c' } } });
  await assert.rejects(gen.generateDraft(base(client)), /Tarjima to'liq emas/);
  assert.equal(db.prepare('SELECT COUNT(*) c FROM posts').get().c, 0);
});

test('takroriy sarlavha (slug) rad etiladi', async () => {
  await gen.generateDraft(base(mockClient()));
  await assert.rejects(gen.generateDraft(base(mockClient())), /allaqachon bor/);
  assert.equal(db.prepare('SELECT COUNT(*) c FROM posts').get().c, 1);
});

test('tekshirilmagan qoralamalar chegarasi: ortiqcha yaratilmaydi', async () => {
  for (let i = 0; i < gen.MAX_PENDING_DRAFTS; i++) {
    db.prepare("INSERT INTO posts (title_uz,title_ru,title_en,slug,excerpt_uz,excerpt_ru,excerpt_en,date,category_uz,category_ru,category_en,status) VALUES ('t','t','t',?,'e','e','e','2026-01-01','c','c','c','draft')").run(`d${i}`);
  }
  const client = mockClient();
  const r = await gen.generateDraft(base(client));
  assert.ok(r.skipped);
  assert.equal(client.calls.length, 0); // OpenAI'ga umuman murojaat qilinmagan
});

test('mavzular tugagach SI yangi mavzu taklif qiladi (takrorlar tashlab yuboriladi)', async () => {
  fs.writeFileSync(topicsFile, JSON.stringify([{ topic: 'Eski', imageQuery: '', usedAt: '2026-01-01' }]));
  const client = mockClient({
    suggestions: [
      { topic: 'Eski', imageQuery: 'a' }, // ro'yxatda bor — tashlanadi
      { topic: 'Yangi mavzu', imageQuery: 'b' },
    ],
  });
  const r = await gen.generateDraft(base(client));
  assert.equal(r.topic, 'Yangi mavzu');
  const topics = JSON.parse(fs.readFileSync(topicsFile, 'utf8'));
  assert.deepEqual(topics.map((t) => t.topic), ['Eski', 'Yangi mavzu']);
});

test('fetchStockImage: rasmni saqlaydi; xatoda bo\'sh qaytadi', async () => {
  const fakeFetch = async (url) => {
    if (url.startsWith('https://pixabay.com/api/')) {
      assert.match(url, /[?&]key=k&q=cargo&/);
      return { ok: true, json: async () => ({ hits: [{ largeImageURL: 'https://cdn.pixabay.com/p.jpg' }] }) };
    }
    return { ok: true, arrayBuffer: async () => Buffer.from('JPEGDATA').buffer.slice(0, 8) };
  };
  const url = await gen.fetchStockImage({ query: 'cargo', apiKey: 'k', uploadDir, fetchImpl: fakeFetch });
  assert.match(url, /^\/uploads\/\d+-[a-z0-9]+\.jpg$/);
  assert.ok(fs.existsSync(path.join(uploadDir, path.basename(url))));

  assert.equal(await gen.fetchStockImage({ query: 'cargo', apiKey: '', uploadDir, fetchImpl: fakeFetch }), '');
  assert.equal(await gen.fetchStockImage({ query: 'cargo', apiKey: 'k', uploadDir, fetchImpl: async () => ({ ok: false }) }), '');
  assert.equal(await gen.fetchStockImage({ query: 'cargo', apiKey: 'k', uploadDir, fetchImpl: async () => { throw new Error('net'); } }), '');
});
