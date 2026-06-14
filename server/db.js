const Database = require('better-sqlite3');
const path = require('path');
const { slugify } = require('./utils/slugify');

const db = new Database(path.join(__dirname, 'blog.db'));

// WAL mode yoqish (yuqori unumdorlik va lock muammolarini oldini olish uchun)
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title_uz TEXT NOT NULL,
    title_ru TEXT NOT NULL,
    title_en TEXT NOT NULL,
    slug TEXT UNIQUE,
    excerpt_uz TEXT NOT NULL,
    excerpt_ru TEXT NOT NULL,
    excerpt_en TEXT NOT NULL,
    body_uz TEXT DEFAULT '',
    body_ru TEXT DEFAULT '',
    body_en TEXT DEFAULT '',
    date TEXT NOT NULL,
    category_uz TEXT NOT NULL,
    category_ru TEXT NOT NULL,
    category_en TEXT NOT NULL,
    image TEXT DEFAULT '',
    author TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

try {
  db.exec('ALTER TABLE posts ADD COLUMN views INTEGER DEFAULT 0');
} catch (e) {
  if (!e.message?.includes('duplicate column name')) throw e;
}

// Eski ustunlarda slug yo'q bo'lsa, uni qo'shish (Migratsiya)
try {
  db.exec('ALTER TABLE posts ADD COLUMN slug TEXT UNIQUE');
  
  // Eski postlar uchun slug generatsiya qilish
  const posts = db.prepare('SELECT id, title_uz FROM posts WHERE slug IS NULL').all();
  const updateSlug = db.prepare('UPDATE posts SET slug = ? WHERE id = ?');
  
  const modifySlug = db.transaction((posts) => {
    for (const post of posts) {
      let generatedSlug = slugify(post.title_uz) || `post-${post.id}`;
      updateSlug.run(generatedSlug, post.id);
    }
  });
  modifySlug(posts);
} catch (e) {
  if (!e.message?.includes('duplicate column name')) throw e;
}

module.exports = db;
