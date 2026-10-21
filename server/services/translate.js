/**
 * Blog maydonlarini uz/ru/en o'rtasida tarjima qilish (OpenAI).
 * Ishlatadi: routes/translate.js (admin tugmasi) va scripts/generate-post.js (SI generator).
 */
const { OPENAI_API_KEY } = require('../config');
const { OpenAI } = require('openai');

// Lazy-init: kalit yo'q bo'lsa ham server ishga tushaversin — faqat tarjima
// ishlamaydi (modul yuklanishida emas, so'rov vaqtida xato beradi).
let openai = null;
function getOpenAI() {
  if (!openai) openai = new OpenAI({ apiKey: OPENAI_API_KEY });
  return openai;
}

const LANG_NAMES = {
  uz: "o'zbek",
  ru: 'rus',
  en: 'ingliz',
};

const LANGS = ['uz', 'ru', 'en'];

const DEFAULT_MODEL = 'gpt-4o-mini';

// gpt-5/gpt-6/o-seriya fikrlovchi modellar: `temperature` ni qabul qilmaydi (faqat default).
const isReasoningModel = (model) => /^(gpt-[56]|o\d)/.test(model);

/**
 * chat.completions.create uchun o'ram: fikrlovchi modelga temperature yubormaydi va model
 * `response_format` ni rad etsa (400) o'sha parametrsiz bir marta qayta urinadi (JSON baribir
 * parseModelJson orqali ajratib olinadi).
 */
async function chatCompletion(client, { model, temperature, ...rest }) {
  const params = { model, ...rest };
  if (temperature !== undefined && !isReasoningModel(model)) params.temperature = temperature;
  try {
    return await client.chat.completions.create(params);
  } catch (err) {
    if (err && err.status === 400 && params.response_format && /response_format/i.test(err.message || '')) {
      const { response_format, ...plain } = params;
      return client.chat.completions.create(plain);
    }
    throw err;
  }
}

/** Xato tashlaydi (status maydoni bilan) — route 400/500 ga o'giradi. */
class TranslateError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

/** Model javobidan JSON ajratadi (```json ... ``` o'ramini olib tashlab). */
function parseModelJson(raw) {
  const cleaned = String(raw).replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  return JSON.parse(cleaned);
}

/**
 * @param {{ sourceLang: 'uz'|'ru'|'en', title?: string, excerpt?: string, body?: string, category?: string }} input
 * @param {{ client?: { chat: { completions: { create: Function } } }, model?: string }} [deps] mock klient (test) va model (default gpt-4o-mini)
 * @returns {Promise<{uz: object, ru: object, en: object}>} har til uchun { title, excerpt, body, category }
 */
async function translateFields(input, deps = {}) {
  const { sourceLang, title, excerpt, body, category } = input;
  if (!sourceLang || !LANGS.includes(sourceLang)) {
    throw new TranslateError("sourceLang uz, ru yoki en bo'lishi kerak", 400);
  }
  const client = deps.client || (OPENAI_API_KEY ? getOpenAI() : null);
  if (!client) throw new TranslateError('OPENAI_API_KEY sozlanmagan');

  const sourceName = LANG_NAMES[sourceLang];
  const targets = LANGS.filter((l) => l !== sourceLang);
  const targetNames = targets.map((l) => LANG_NAMES[l]).join(' va ');

  const systemPrompt = `Siz blog maqolasi uchun tarjima qilasiz. Manba til: ${sourceName}. Maqsad tillar: ${targetNames}. Faqat tarjima qiling. JSON formatida qaytaring, hech qanday markdown yoki qo'shimcha matn yozmang.`;
  const userPrompt = `Quyidagi blog maydonlarini ${targetNames} tiliga tarjima qiling:

title: ${title || ''}
excerpt: ${excerpt || ''}
body: ${body || ''}
category: ${category || ''}

body Markdown formatda bo'lishi mumkin — Markdown strukturani saqlab tarjima qiling.
JSON qaytaring: { "${targets[0]}": { "title": "...", "excerpt": "...", "body": "...", "category": "..." }, "${targets[1]}": { "title": "...", "excerpt": "...", "body": "...", "category": "..." } }`;

  const completion = await chatCompletion(client, {
    model: deps.model || DEFAULT_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.3,
  });
  const raw = completion.choices[0]?.message?.content?.trim();
  if (!raw) throw new TranslateError('OpenAI javob bermadi');

  let parsed;
  try {
    parsed = parseModelJson(raw);
  } catch {
    throw new TranslateError("OpenAI javobini parse qilib bo'lmadi");
  }

  const result = { uz: null, ru: null, en: null };
  result[sourceLang] = { title: title || '', excerpt: excerpt || '', body: body || '', category: category || '' };
  for (const lang of targets) {
    const t = parsed[lang];
    result[lang] = t && typeof t === 'object'
      ? { title: t.title ?? '', excerpt: t.excerpt ?? '', body: t.body ?? '', category: t.category ?? '' }
      : { title: '', excerpt: '', body: '', category: '' };
  }
  return result;
}

module.exports = { translateFields, chatCompletion, TranslateError, parseModelJson, getOpenAI };
