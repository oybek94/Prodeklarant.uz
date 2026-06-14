const path = require('path');
// config — eng birinchi: dotenv'ni yuklaydi va env'ni validatsiya qiladi (fail-fast).
const config = require('./config');
const fs = require('fs');
const express = require('express');
const helmet = require('helmet');
const crypto = require('crypto');
const cors = require('cors');
const db = require('./db');
const { slugify } = require('./utils/slugify');
const { resolveSeo, injectSeo } = require('./seo');
const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const uploadRoutes = require('./routes/upload');
const translateRoutes = require('./routes/translate');
const contactRoutes = require('./routes/contact');

const SITE_URL = config.SITE_URL;

const app = express();
const PORT = config.PORT;

// nginx/reverse-proxy orqasida ishlaganda — rate-limit va IP'lar to'g'ri aniqlanishi uchun
app.set('trust proxy', 1);

// Har bir so'rov uchun unik nonce (CSP uchun)
app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString('base64');
  next();
});

// Xavfsizlik header'lari.
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`, "https://maps.googleapis.com"],
        "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        "img-src": ["'self'", "data:", "https:", "blob:"],
        "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
        "connect-src": ["'self'", "https://api.telegram.org"],
        "frame-src": ["'self'", "https://www.google.com", "https://maps.google.com"],
        "object-src": ["'none'"],
        "upgrade-insecure-requests": [],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://prodeklarant.uz',
  'https://www.prodeklarant.uz',
  'http://prodeklarant.uz',
  'http://www.prodeklarant.uz',
];
if (config.CORS_ORIGIN) {
  allowedOrigins.push(...config.CORS_ORIGIN.split(',').map((s) => s.trim()));
}
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/translate', translateRoutes);
app.use('/api/contact', contactRoutes);

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
  // Statik fayllar (assetlar) — lekin index.html'ni o'zimiz meta bilan beramiz
  app.use(express.static(distPath, { index: false }));

  // Fayl kengaytmasiga o'xshash so'rovlar (masalan .js, .css, .png) bu yerga tushsa,
  // demak fayl diskda yo'q — HTML emas, oddiy 404 qaytaramiz (aks holda brauzer
  // JS o'rniga HTML olib "ERR_ABORTED" beradi).
  const FILE_EXT = /\.[a-z0-9]{2,5}$/i;

  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'Not found' });
    }
    if (FILE_EXT.test(req.path)) {
      return res.status(404).type('text/plain').send('Not found');
    }
    // index.html'ni HAR so'rovda diskdan o'qiymiz — shunda rebuild qilingach
    // (yangi asset hash'lari) serverni qayta ishga tushirmasdan ham mos keladi.
    let rawHtml;
    try {
      rawHtml = fs.readFileSync(indexHtml, 'utf8');
    } catch (e) {
      return res.status(500).type('text/plain').send('Server error');
    }
    try {
      const { block, status } = resolveSeo({ pathname: req.path, siteUrl: SITE_URL, db });
      // Nonce'ni HTML ichidagi skriptlarga joylash (xavfsizlik uchun)
      let html = rawHtml.replace(/<script/g, `<script nonce="${res.locals.nonce}"`);
      html = injectSeo(html, block);
      res.status(status).set('Content-Type', 'text/html; charset=utf-8').send(html);
    } catch (e) {
      // Injection xato bersa ham sahifa ochilishi uchun original HTML
      res.status(200).set('Content-Type', 'text/html; charset=utf-8').send(rawHtml);
    }
  });
}

// Markazlashtirilgan xatolik boshqaruvchisi
app.use((err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.url}:`, err);

  const status = err.status || 500;
  const message = config.IS_PROD ? 'Serverda kutilmagan xatolik yuz berdi' : err.message;

  res.status(status).json({
    error: message,
    stack: config.IS_PROD ? undefined : err.stack
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
