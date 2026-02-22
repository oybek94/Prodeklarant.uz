const express = require('express');
const authMiddleware = require('../middleware/auth');
const { OpenAI } = require('openai');
const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const LANG_NAMES = {
  uz: "o'zbek",
  ru: 'rus',
  en: 'ingliz',
};

router.post('/', authMiddleware, async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OPENAI_API_KEY sozlanmagan' });
    }
    const { sourceLang, title, excerpt, body, category } = req.body;
    if (!sourceLang || !['uz', 'ru', 'en'].includes(sourceLang)) {
      return res.status(400).json({ error: 'sourceLang uz, ru yoki en bo\'lishi kerak' });
    }
    const sourceName = LANG_NAMES[sourceLang];
    const targets = ['uz', 'ru', 'en'].filter((l) => l !== sourceLang);
    const targetNames = targets.map((l) => LANG_NAMES[l]).join(' va ');

    const systemPrompt = `Siz blog maqolasi uchun tarjima qilasiz. Manba til: ${sourceName}. Maqsad tillar: ${targetNames}. Faqat tarjima qiling. JSON formatida qaytaring, hech qanday markdown yoki qo'shimcha matn yozmang.`;
    const userPrompt = `Quyidagi blog maydonlarini ${targetNames} tiliga tarjima qiling:

title: ${title || ''}
excerpt: ${excerpt || ''}
body: ${body || ''}
category: ${category || ''}

body Markdown formatda bo'lishi mumkin — Markdown strukturani saqlab tarjima qiling.
JSON qaytaring: { "${targets[0]}": { "title": "...", "excerpt": "...", "body": "...", "category": "..." }, "${targets[1]}": { "title": "...", "excerpt": "...", "body": "...", "category": "..." } }`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
    });
    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) {
      return res.status(500).json({ error: 'OpenAI javob bermadi' });
    }
    let parsed;
    try {
      const cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return res.status(500).json({ error: 'OpenAI javobini parse qilib bo\'lmadi' });
    }
    const result = { uz: null, ru: null, en: null };
    result[sourceLang] = { title: title || '', excerpt: excerpt || '', body: body || '', category: category || '' };
    for (const lang of targets) {
      const t = parsed[lang];
      if (t && typeof t === 'object') {
        result[lang] = {
          title: t.title ?? '',
          excerpt: t.excerpt ?? '',
          body: t.body ?? '',
          category: t.category ?? '',
        };
      } else {
        result[lang] = { title: '', excerpt: '', body: '', category: '' };
      }
    }
    res.json(result);
  } catch (err) {
    console.error('Translate error:', err);
    const msg = err?.message || 'Tarjima xatosi';
    res.status(500).json({ error: msg });
  }
});

module.exports = router;
