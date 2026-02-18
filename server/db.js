const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'blog.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title_uz TEXT NOT NULL,
    title_ru TEXT NOT NULL,
    title_en TEXT NOT NULL,
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

module.exports = db;
