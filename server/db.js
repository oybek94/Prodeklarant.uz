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

// Eski DB'larda slug ustuni yo'q bo'lsa, uni qo'shish (Migratsiya).
// MUHIM: SQLite ALTER TABLE orqali UNIQUE ustun qo'shishni qo'llab-quvvatlamaydi
// ("Cannot add a UNIQUE column"). Shuning uchun ustun oddiy qo'shiladi va
// UNIQUE alohida indeks orqali ta'minlanadi.
try {
  db.exec('ALTER TABLE posts ADD COLUMN slug TEXT');
} catch (e) {
  if (!e.message?.includes('duplicate column name')) throw e;
}

// Slug'i yo'q eski postlarga slug generatsiya qilish (takrorlanmaslikni ta'minlab)
const postsWithoutSlug = db
  .prepare("SELECT id, title_uz FROM posts WHERE slug IS NULL OR slug = ''")
  .all();
if (postsWithoutSlug.length > 0) {
  const usedSlugs = new Set(
    db
      .prepare("SELECT slug FROM posts WHERE slug IS NOT NULL AND slug != ''")
      .all()
      .map((r) => r.slug)
  );
  const updateSlug = db.prepare('UPDATE posts SET slug = ? WHERE id = ?');
  const modifySlug = db.transaction((rows) => {
    for (const post of rows) {
      const base = slugify(post.title_uz) || `post-${post.id}`;
      // Takrorlansa, id qo'shib noyob qilamiz
      const candidate = usedSlugs.has(base) ? `${base}-${post.id}` : base;
      usedSlugs.add(candidate);
      updateSlug.run(candidate, post.id);
    }
  });
  modifySlug(postsWithoutSlug);
}

// UNIQUE cheklovni alohida indeks orqali ta'minlash (idempotent — eski DB'lar uchun)
db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug)');

// Slug o'zgarganda eski URL'lar 404 bo'lib qolmasligi uchun eski→yangi xaritasi.
// Server /blog/<eski-slug> so'rovini joriy slug'ga 301 redirect qiladi (SEO: link equity saqlanadi).
db.exec(`
  CREATE TABLE IF NOT EXISTS post_redirects (
    old_slug TEXT PRIMARY KEY,
    post_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

module.exports = db;
