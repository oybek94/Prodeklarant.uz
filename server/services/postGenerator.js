/**
 * SI orqali blog qoralamasi yaratish. Hamma tashqi bog'liqliklar (OpenAI, Pixabay, DB, fayl tizimi)
 * parametr orqali beriladi — shuning uchun server/test/postGenerator.test.js'da mock bilan sinaladi.
 * Ishga tushirish: scripts/generate-post.js
 */
const fs = require('fs');
const path = require('path');
const { slugify } = require('../utils/slugify');
const { parseModelJson, translateFields, chatCompletion } = require('./translate');

// Maqola yozish, mavzu taklifi va tarjima uchun bitta model (admin paneldagi "Tarjima qilish" tugmasi bunga bog'liq emas).
const WRITER_MODEL = 'gpt-6-luna';
const MAX_PENDING_DRAFTS = 5; // tekshirilmagan qoralamalar yig'ilib qolmasin (xarajat + sifat nazorati)
const MIN_BODY_CHARS = 1500;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // upload.js limiti bilan bir xil

const SITE_CONTEXT =
  "PRO DEKLARANT — O'zbekistondagi (Farg'ona viloyati) bojxona broker kompaniyasi: meva-sabzavot eksporti, " +
  "bojxona deklaratsiyasi, HS kodlar, Incoterms, fitosanitar sertifikat, eksport shartnomalari, yuk logistikasi.";

class GeneratorError extends Error {}

// ---------- mavzular ----------

/**
 * Mavzular: [{ topic, imageQuery, usedAt? }].
 * `file` — ish holati (gitignore'da, serverda o'zgaradi); u yo'q bo'lsa `seedFile` (git'dagi boshlang'ich ro'yxat) o'qiladi.
 */
function loadTopics(file, seedFile) {
  for (const f of [file, seedFile]) {
    if (!f) continue;
    try {
      const list = JSON.parse(fs.readFileSync(f, 'utf8'));
      return Array.isArray(list) ? list : [];
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
    }
  }
  return [];
}

function saveTopics(file, topics) {
  fs.writeFileSync(file, JSON.stringify(topics, null, 2) + '\n', 'utf8');
}

function pickTopic(topics) {
  return topics.find((t) => t && t.topic && !t.usedAt) || null;
}

/** SI'dan yangi mavzular so'raydi; mavjud sarlavhalar va ro'yxatdagi mavzularga o'xshashlari tashlab yuboriladi. */
async function suggestTopics({ client, existingTitles, knownTopics, count = 5 }) {
  const taken = [...existingTitles, ...knownTopics.map((t) => t.topic)];
  const completion = await chatCompletion(client, {
    model: WRITER_MODEL,
    temperature: 0.9,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `Siz bojxona broker kompaniyasi blogi uchun kontent-strateg siz. Kompaniya: ${SITE_CONTEXT}`,
      },
      {
        role: 'user',
        content:
          `Blog uchun ${count} ta YANGI maqola mavzusi taklif qiling (o'zbek tilida, lotin yozuvida). ` +
          `Mavzular amaliy, mijozlar (eksportchilar) qidiradigan savollarga javob bersin. ` +
          `Quyidagi mavzular allaqachon bor, ularni takrorlamang:\n- ${taken.join('\n- ') || '(hozircha yo\'q)'}\n\n` +
          `JSON qaytaring: { "topics": [ { "topic": "...", "imageQuery": "stok rasm qidirish uchun 2-3 so'zli INGLIZCHA so'rov" } ] }`,
      },
    ],
  });
  const parsed = parseModelJson(completion.choices[0]?.message?.content || '{}');
  const takenSlugs = new Set(taken.map((t) => slugify(t)));
  return (Array.isArray(parsed.topics) ? parsed.topics : [])
    .filter((t) => t && typeof t.topic === 'string' && t.topic.trim())
    .map((t) => ({ topic: t.topic.trim(), imageQuery: String(t.imageQuery || '').trim() }))
    .filter((t) => !takenSlugs.has(slugify(t.topic)));
}

// ---------- maqola yozish ----------

/** O'zbekcha maqola: { title, excerpt, body, category }. Yaroqsiz bo'lsa GeneratorError. */
async function writeArticle({ client, topic }) {
  const completion = await chatCompletion(client, {
    model: WRITER_MODEL,
    temperature: 0.7,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          `Siz ${SITE_CONTEXT} blogi uchun tajribali kontent-muallifsiz. O'zbek tilida (lotin yozuvi) yozasiz.\n` +
          `Qoidalar:\n` +
          `- Amaliy, aniq, do'stona maslahat ohangi; eksportchilarga tushunarli til.\n` +
          `- Aniq bojxona stavkalari, qonun/qaror raqamlari, muddatlar va narxlarni O'YLAB TOPMANG. ` +
          `Aniq bilmasangiz umumiy yozing va "amaldagi qoidani bojxona yoki broker bilan aniqlashtiring" deb eslating.\n` +
          `- Matn Markdown: H1 ishlatmang (sarlavha alohida), bo'limlar uchun "## ", kerak joyda ro'yxatlar.\n` +
          `- Hajmi 800-1200 so'z. Oxirida Prodeklarant jamoasiga murojaat qilishga chaqiruvchi qisqa xulosa.`,
      },
      {
        role: 'user',
        content:
          `Mavzu: ${topic}\n\n` +
          `JSON qaytaring: { "title": "...", "excerpt": "150 belgigacha, qiziqtiruvchi qisqa tavsif", ` +
          `"body": "Markdown matn", "category": "bitta so'z, masalan Maslahat, Hujjatlar, Logistika, Qonunchilik" }`,
      },
    ],
  });
  let a;
  try {
    a = parseModelJson(completion.choices[0]?.message?.content || '');
  } catch {
    throw new GeneratorError("Maqola javobini parse qilib bo'lmadi");
  }
  const article = {
    title: String(a.title || '').trim(),
    excerpt: String(a.excerpt || '').trim(),
    body: String(a.body || '').trim(),
    category: String(a.category || '').trim() || 'Maslahat',
  };
  if (!article.title || !article.excerpt) throw new GeneratorError('Maqolada sarlavha yoki qisqa matn yo\'q');
  if (article.body.length < MIN_BODY_CHARS) throw new GeneratorError(`Maqola juda qisqa (${article.body.length} belgi)`);
  if ((article.body.match(/^## /gm) || []).length < 2) throw new GeneratorError("Maqolada kamida 2 ta '##' bo'lim bo'lishi kerak");
  return article;
}

// ---------- rasm ----------

/**
 * Pixabay'dan mos rasm yuklab uploadDir ga saqlaydi (Pixabay hotlink'ni taqiqlaydi, shuning uchun nusxa olamiz).
 * '/uploads/<fayl>' yoki '' (topilmasa/xato bo'lsa).
 */
async function fetchStockImage({ query, apiKey, uploadDir, fetchImpl = fetch, rand = Math.random }) {
  if (!apiKey || !query) return '';
  try {
    const search = await fetchImpl(
      `https://pixabay.com/api/?key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(query)}` +
        '&image_type=photo&orientation=horizontal&safesearch=true&min_width=1000&per_page=20',
      { signal: AbortSignal.timeout(15000) }
    );
    if (!search.ok) return '';
    const photos = (await search.json()).hits || [];
    if (!photos.length) return '';
    const photo = photos[Math.floor(rand() * photos.length)];
    const src = photo.largeImageURL || photo.webformatURL;
    if (!src) return '';

    const img = await fetchImpl(src, { signal: AbortSignal.timeout(30000) });
    if (!img.ok) return '';
    const buf = Buffer.from(await img.arrayBuffer());
    if (!buf.length || buf.length > MAX_IMAGE_BYTES) return '';

    fs.mkdirSync(uploadDir, { recursive: true });
    const name = `${Date.now()}-${Math.floor(rand() * 1e9).toString(36)}.jpg`; // routes/upload.js nomlash uslubi
    fs.writeFileSync(path.join(uploadDir, name), buf);
    return `/uploads/${name}`;
  } catch (e) {
    console.error('[generate-post] rasm olinmadi:', e && e.message);
    return '';
  }
}

// ---------- bazaga yozish ----------

function existingTitles(db) {
  return db.prepare('SELECT title_uz FROM posts').all().map((r) => r.title_uz);
}

function pendingDraftCount(db) {
  return db.prepare("SELECT COUNT(*) AS c FROM posts WHERE status = 'draft'").get().c;
}

/** Qoralamani yozadi (routes/posts.js POST bilan bir xil slug qoidasi). { id, slug } qaytaradi. */
function insertDraft(db, { uz, ru, en, date, image, author }) {
  let slug = slugify(uz.title);
  if (!slug) throw new GeneratorError("Sarlavhadan slug hosil bo'lmadi");
  if (db.prepare('SELECT id FROM posts WHERE slug = ?').get(slug)) {
    throw new GeneratorError(`Bunday maqola allaqachon bor: ${slug}`);
  }
  const result = db.prepare(`
    INSERT INTO posts (title_uz, title_ru, title_en, slug, excerpt_uz, excerpt_ru, excerpt_en,
      body_uz, body_ru, body_en, date, category_uz, category_ru, category_en, image, author, views, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'draft')
  `).run(
    uz.title, ru.title, en.title, slug,
    uz.excerpt, ru.excerpt, en.excerpt,
    uz.body, ru.body, en.body,
    date,
    uz.category, ru.category || uz.category, en.category || uz.category,
    image || '', author || ''
  );
  return { id: Number(result.lastInsertRowid), slug };
}

// ---------- butun jarayon ----------

/**
 * @param {object} o
 * @param {object} o.db better-sqlite3
 * @param {object} o.client OpenAI klienti (chat.completions.create)
 * @param {string} o.topicsFile ish holati fayli (yoziladi)
 * @param {string} [o.topicsSeedFile] boshlang'ich ro'yxat (faqat o'qiladi)
 * @param {string} o.uploadDir
 * @param {string} [o.imageApiKey] Pixabay kaliti; bo'sh bo'lsa rasm qo'yilmaydi
 * @param {boolean} [o.dryRun] DB, topics.json va rasm fayliga TEGMAYDI
 * @param {boolean} [o.suggest] ro'yxat tugamagan bo'lsa ham yangi mavzular so'rash
 * @param {Function} [o.fetchImpl]
 * @param {() => string} [o.today]
 * @returns {Promise<{ skipped?: string, id?: number, slug?: string, title?: string, topic?: string, article?: object }>}
 */
async function generateDraft(o) {
  const { db, client, topicsFile, topicsSeedFile, uploadDir, imageApiKey, dryRun = false, suggest = false, fetchImpl } = o;
  const today = o.today ? o.today() : new Date().toISOString().slice(0, 10);

  if (!dryRun && pendingDraftCount(db) >= MAX_PENDING_DRAFTS) {
    return { skipped: `Tekshirilmagan ${MAX_PENDING_DRAFTS} ta qoralama bor — avval ularni nashr qiling yoki o'chiring` };
  }

  let topics = loadTopics(topicsFile, topicsSeedFile);
  let topic = pickTopic(topics);
  if (!topic || suggest) {
    const fresh = await suggestTopics({ client, existingTitles: existingTitles(db), knownTopics: topics });
    if (fresh.length) {
      topics = [...topics, ...fresh];
      if (!dryRun) saveTopics(topicsFile, topics);
      topic = topic || pickTopic(topics);
    }
  }
  if (!topic) throw new GeneratorError('Yangi mavzu topilmadi');

  const uz = await writeArticle({ client, topic: topic.topic });
  const tr = await translateFields({ sourceLang: 'uz', ...uz }, { client, model: WRITER_MODEL });
  if (!tr.ru.title || !tr.en.title || !tr.ru.body || !tr.en.body) {
    throw new GeneratorError('Tarjima to\'liq emas (ru/en bo\'sh qaytdi)');
  }

  if (dryRun) {
    return { topic: topic.topic, title: uz.title, article: { uz, ru: tr.ru, en: tr.en } };
  }

  const image = await fetchStockImage({ query: topic.imageQuery, apiKey: imageApiKey, uploadDir, fetchImpl });
  const { id, slug } = insertDraft(db, { uz, ru: tr.ru, en: tr.en, date: today, image, author: 'Prodeklarant' });

  // Faqat muvaffaqiyatdan keyin mavzuni "ishlatilgan" deb belgilaymiz (xatoda keyingi safar qayta uriniladi)
  topic.usedAt = today;
  saveTopics(topicsFile, topics);
  return { id, slug, title: uz.title, topic: topic.topic };
}

module.exports = {
  GeneratorError, MAX_PENDING_DRAFTS, MIN_BODY_CHARS,
  loadTopics, saveTopics, pickTopic, suggestTopics, writeArticle, fetchStockImage, insertDraft, generateDraft,
};
