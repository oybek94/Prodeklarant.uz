const db = require('../db');

/** DB qatorini API/frontend formatiga o'giradi (routes/posts.js va SSR uchun yagona manba). */
function rowToPost(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: { uz: row.title_uz, ru: row.title_ru, en: row.title_en },
    excerpt: { uz: row.excerpt_uz, ru: row.excerpt_ru, en: row.excerpt_en },
    body: { uz: row.body_uz, ru: row.body_ru, en: row.body_en },
    date: row.date,
    category: { uz: row.category_uz, ru: row.category_ru, en: row.category_en },
    image: row.image || '',
    author: row.author || '',
    views: row.views ?? 0,
    created_at: row.created_at,
  };
}

/** Eng yangi postlar (SSR loader'lari uchun). */
function listPosts(limit) {
  const n = Math.min(50, Math.max(1, Number(limit) || 10));
  return db.prepare('SELECT * FROM posts ORDER BY created_at DESC LIMIT ?').all(n).map(rowToPost);
}

/** Slug (yoki eski "<id>-..." formati) bo'yicha post; topilmasa null. */
function findPost(slug) {
  const s = String(slug || '').trim().toLowerCase();
  if (!s) return null;
  const legacy = s.match(/^(\d+)-(.+)$/);
  if (legacy) {
    const row = db.prepare('SELECT * FROM posts WHERE id = ?').get(Number(legacy[1]));
    if (row) return rowToPost(row);
  }
  const row = db.prepare('SELECT * FROM posts WHERE slug = ?').get(s);
  return row ? rowToPost(row) : null;
}

module.exports = { rowToPost, listPosts, findPost };
