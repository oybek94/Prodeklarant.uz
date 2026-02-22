const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const db = require('./db');
const { slugify } = require('./utils/slugify');
const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const uploadRoutes = require('./routes/upload');
const translateRoutes = require('./routes/translate');

const SITE_URL = process.env.SITE_URL || 'https://prodeklarant.uz';

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://prodeklarant.uz',
  'https://www.prodeklarant.uz',
  'http://prodeklarant.uz',
  'http://www.prodeklarant.uz',
];
if (process.env.CORS_ORIGIN) {
  allowedOrigins.push(...process.env.CORS_ORIGIN.split(',').map((s) => s.trim()));
}
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/translate', translateRoutes);

app.get('/sitemap.xml', (req, res) => {
  const staticPaths = [
    { path: '/', changefreq: 'weekly', priority: '1.0' },
    { path: '/services', changefreq: 'monthly', priority: '0.8' },
    { path: '/about', changefreq: 'monthly', priority: '0.8' },
    { path: '/contact', changefreq: 'monthly', priority: '0.8' },
    { path: '/blog', changefreq: 'weekly', priority: '0.9' },
  ];
  let posts = [];
  try {
    posts = db.prepare('SELECT id, title_uz, created_at FROM posts ORDER BY created_at DESC').all();
  } catch (e) {
    // ignore
  }
  const escapeXml = (s) => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
  const urlEntries = [
    ...staticPaths.map(({ path: p, changefreq, priority }) =>
      `  <url><loc>${escapeXml(SITE_URL + p)}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`
    ),
    ...posts.map((row) => {
      const slug = slugify(row.title_uz) || `post-${row.id}`;
      const loc = `${SITE_URL}/blog/${encodeURIComponent(slug)}`;
      const lastmod = row.created_at ? new Date(row.created_at).toISOString().slice(0, 10) : '';
      return `  <url><loc>${escapeXml(loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}<changefreq>monthly</changefreq><priority>0.7</priority></url>`;
    }),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join('\n')}
</urlset>`;
  res.set('Content-Type', 'application/xml; charset=utf-8');
  res.send(xml);
});

const distPath = path.join(__dirname, '..', 'dist');
const indexHtml = path.join(distPath, 'index.html');
if (fs.existsSync(indexHtml)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(indexHtml);
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
