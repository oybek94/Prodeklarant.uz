const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');
const { slugify } = require('../utils/slugify');
const router = express.Router();

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

// Xotirada saqlanadigan oddiy view cheklovi (IP bo'yicha)
const viewedPosts = new Set();

router.get('/', (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10)); // Max 50
    const offset = (page - 1) * limit;

    const rows = db.prepare('SELECT * FROM posts ORDER BY created_at DESC LIMIT ? OFFSET ?').all(limit, offset);
    const totalStmt = db.prepare('SELECT COUNT(*) as count FROM posts').get();
    
    res.json({
      data: rows.map(rowToPost),
      pagination: {
        total: totalStmt.count,
        page,
        limit,
        totalPages: Math.ceil(totalStmt.count / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Slug bo'yicha topish (Optimallashtirilgan SQL orqali)
router.get('/slug/:slug', (req, res) => {
  try {
    const slug = String(req.params.slug || '').trim().toLowerCase();
    if (!slug) return res.status(404).json({ error: 'Post not found' });
    
    const row = db.prepare('SELECT * FROM posts WHERE slug = ?').get(slug);
    if (!row) return res.status(404).json({ error: 'Post not found' });
    res.json(rowToPost(row));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id — endi views'ni OSHIRMAYDI (admin tahrir/preview soxta view bermasin).
// Haqiqiy o'qishlar POST /:id/view orqali hisoblanadi.
router.get('/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const row = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
    if (!row) return res.status(404).json({ error: 'Post not found' });
    res.json(rowToPost(row));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ko'rishlar hisoblagichi — IP bo'yicha spamdan himoyalangan
router.post('/:id/view', (req, res) => {
  try {
    const id = Number(req.params.id);
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const viewKey = `${ip}-${id}`;

    // Har bir IP uchun ma'lum bir postni faqat bir marta hisoblash
    if (!viewedPosts.has(viewKey)) {
        const result = db.prepare('UPDATE posts SET views = COALESCE(views, 0) + 1 WHERE id = ?').run(id);
        if (result.changes > 0) {
           viewedPosts.add(viewKey);
           
           // Vaqt o'tishi bilan xotirani tozalash uchun oddiy mexanizm
           if (viewedPosts.size > 10000) viewedPosts.clear();
        } else {
            return res.status(404).json({ error: 'Post not found' });
        }
    }
    
    const row = db.prepare('SELECT views FROM posts WHERE id = ?').get(id);
    if (!row) return res.status(404).json({ error: 'Post not found' });
    
    res.json({ views: row.views });
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

    let slug = slugify(title_uz);
    // Unikal slugni ta'minlash
    let exists = db.prepare('SELECT id FROM posts WHERE slug = ?').get(slug);
    if (exists) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const stmt = db.prepare(`
      INSERT INTO posts (title_uz, title_ru, title_en, slug, excerpt_uz, excerpt_ru, excerpt_en,
        body_uz, body_ru, body_en, date, category_uz, category_ru, category_en, image, author, views)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `);
    const result = stmt.run(
      title_uz, title_ru, title_en, slug,
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

    let newSlug = row.slug;
    if (title_uz && title_uz !== row.title_uz) {
        newSlug = slugify(title_uz);
        let exists = db.prepare('SELECT id FROM posts WHERE slug = ? AND id != ?').get(newSlug, id);
        if (exists) {
            newSlug = `${newSlug}-${Date.now().toString().slice(-4)}`;
        }
    }

    // Slug o'zgargan bo'lsa — eski slug'ni redirect xaritasiga yozamiz (301 uchun).
    if (newSlug !== row.slug && row.slug) {
      try {
        db.prepare('INSERT OR REPLACE INTO post_redirects (old_slug, post_id) VALUES (?, ?)').run(row.slug, id);
        // Yangi slug ilgari redirect sifatida yozilgan bo'lsa — loop bo'lmasligi uchun o'chiramiz.
        db.prepare('DELETE FROM post_redirects WHERE old_slug = ?').run(newSlug);
      } catch (e) {
        // redirect yozib bo'lmasa ham postni yangilashni to'xtatmaymiz
      }
    }

    db.prepare(`
      UPDATE posts SET
        title_uz = ?, title_ru = ?, title_en = ?, slug = ?,
        excerpt_uz = ?, excerpt_ru = ?, excerpt_en = ?,
        body_uz = ?, body_ru = ?, body_en = ?,
        date = ?, category_uz = ?, category_ru = ?, category_en = ?,
        image = ?, author = ?
      WHERE id = ?
    `).run(
      title_uz ?? row.title_uz, title_ru ?? row.title_ru, title_en ?? row.title_en, newSlug,
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
