const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

function rowToPost(row) {
  return {
    id: row.id,
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

router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM posts ORDER BY created_at DESC').all();
    res.json(rows.map(rowToPost));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const row = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
    if (!row) return res.status(404).json({ error: 'Post not found' });
    db.prepare('UPDATE posts SET views = COALESCE(views, 0) + 1 WHERE id = ?').run(id);
    const updated = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
    res.json(rowToPost(updated));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authMiddleware, (req, res) => {
  try {
    const {
      title_uz, title_ru, title_en,
      excerpt_uz, excerpt_ru, excerpt_en,
      body_uz = '', body_ru = '', body_en = '',
      date, category_uz, category_ru, category_en,
      image = '', author = ''
    } = req.body;

    if (!title_uz || !title_ru || !title_en || !excerpt_uz || !excerpt_ru || !excerpt_en || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const stmt = db.prepare(`
      INSERT INTO posts (title_uz, title_ru, title_en, excerpt_uz, excerpt_ru, excerpt_en,
        body_uz, body_ru, body_en, date, category_uz, category_ru, category_en, image, author, views)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `);
    const result = stmt.run(
      title_uz, title_ru, title_en,
      excerpt_uz, excerpt_ru, excerpt_en,
      body_uz || '', body_ru || '', body_en || '',
      date,
      category_uz || 'Blog', category_ru || 'Блог', category_en || 'Blog',
      image || '', author || ''
    );
    const row = db.prepare('SELECT * FROM posts WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(rowToPost(row));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authMiddleware, (req, res) => {
  try {
    const id = Number(req.params.id);
    const row = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
    if (!row) return res.status(404).json({ error: 'Post not found' });

    const {
      title_uz, title_ru, title_en,
      excerpt_uz, excerpt_ru, excerpt_en,
      body_uz, body_ru, body_en,
      date, category_uz, category_ru, category_en,
      image, author
    } = req.body;

    db.prepare(`
      UPDATE posts SET
        title_uz = ?, title_ru = ?, title_en = ?,
        excerpt_uz = ?, excerpt_ru = ?, excerpt_en = ?,
        body_uz = ?, body_ru = ?, body_en = ?,
        date = ?, category_uz = ?, category_ru = ?, category_en = ?,
        image = ?, author = ?
      WHERE id = ?
    `).run(
      title_uz ?? row.title_uz, title_ru ?? row.title_ru, title_en ?? row.title_en,
      excerpt_uz ?? row.excerpt_uz, excerpt_ru ?? row.excerpt_ru, excerpt_en ?? row.excerpt_en,
      body_uz ?? row.body_uz, body_ru ?? row.body_ru, body_en ?? row.body_en,
      date ?? row.date,
      category_uz ?? row.category_uz, category_ru ?? row.category_ru, category_en ?? row.category_en,
      image ?? row.image, author ?? row.author,
      id
    );

    const updated = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
    res.json(rowToPost(updated));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = db.prepare('DELETE FROM posts WHERE id = ?').run(id);
    if (result.changes === 0) return res.status(404).json({ error: 'Post not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
