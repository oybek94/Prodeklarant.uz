/**
 * Server-side SEO meta injection.
 *
 * Sahifa sof client-side (React SPA) bo'lgani uchun ijtimoiy tarmoq va qidiruv
 * crawlerlari (Telegram, Facebook, Yandex, ...) JS'ni ishlatmaydi va meta teglarni
 * ko'rmaydi. Shu sabab index.html ichidagi `<!-- SEO:start -->` / `<!-- SEO:end -->`
 * markerlari orasiga har bir marshrut uchun to'g'ri title/description/canonical/OG
 * teglarni server tomonda joylaymiz.
 */

const { slugify } = require('./utils/slugify');

const SITE_NAME = 'PRO DEKLARANT';
const DEFAULT_IMAGE = '/logo.png';

// Statik marshrutlar uchun SEO ma'lumotlari (default til: uz — crawler shu tilni ko'radi)
const STATIC_ROUTES = {
  '/': {
    title: 'PRO DEKLARANT — Meva va sabzavot eksporti uchun bojxona rasmiylashtiruv',
    description:
      "Meva-sabzavot eksportchilari uchun professional bojxona brokerlik xizmatlari. GTD rasmiylashtirish, sertifikatlar, logistika. Farg'ona viloyati.",
  },
  '/services': {
    title: 'Xizmatlar — PRO DEKLARANT',
    description:
      "Bojxona yuk deklaratsiyasi, fitosanitariya, sertifikatlashtirish va eksport logistikasi. Meva-sabzavot eksporti bo'yicha to'liq xizmatlar.",
  },
  '/about': {
    title: 'Kompaniya haqida — PRO DEKLARANT',
    description:
      'PRO DEKLARANT — meva va sabzavot eksporti uchun ixtisoslashtirilgan bojxona xizmatlari. Professional jamoa, qonuniy kafolat, xalqaro tajriba.',
  },
  '/contact': {
    title: 'Aloqa — PRO DEKLARANT',
    description:
      "PRO DEKLARANT bilan bog'laning: Farg'ona viloyati, Oltiariq. Bepul konsultatsiya va bojxona xizmatlari bo'yicha yordam.",
  },
  '/blog': {
    title: 'Blog — PRO DEKLARANT',
    description:
      'Eksport, bojxona rasmiylashtirish, sertifikatlar va meva-sabzavot bozorlari haqida foydali maqolalar va yangiliklar.',
  },
};

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function absUrl(siteUrl, src) {
  if (!src) return `${siteUrl}${DEFAULT_IMAGE}`;
  if (/^https?:\/\//i.test(src)) return src;
  return `${siteUrl}${src.startsWith('/') ? '' : '/'}${src}`;
}

function stripTags(s) {
  return String(s || '').replace(/<[^>]*>/g, '');
}

/**
 * Marshrut uchun <head> ichiga joylanadigan SEO teglar bloki (markerlar orasidagi qism).
 */
function buildSeoBlock({ siteUrl, title, description, canonical, ogType, ogImage, robots, jsonLd }) {
  const img = absUrl(siteUrl, ogImage);
  const desc = stripTags(description).slice(0, 300);
  const lines = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(desc)}" />`,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    `<meta name="robots" content="${escapeHtml(robots || 'index, follow')}" />`,
    `<meta property="og:type" content="${escapeHtml(ogType || 'website')}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:locale" content="uz_UZ" />`,
    `<meta property="og:locale:alternate" content="ru_RU" />`,
    `<meta property="og:locale:alternate" content="en_US" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(desc)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
    `<meta property="og:image" content="${escapeHtml(img)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(desc)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(img)}" />`,
  ];
  if (jsonLd) {
    // id beramiz — client (BlogPost.tsx) shu skriptni topib, til bo'yicha yangilaydi
    // (dublikat JSON-LD bo'lmasligi uchun).
    lines.push(
      `<script type="application/ld+json" id="json-ld-article">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`
    );
  }
  return lines.join('\n    ');
}

/**
 * Berilgan path bo'yicha SEO ma'lumotlarini aniqlaydi.
 * @returns {{ block: string, status: number }}
 */
function resolveSeo({ pathname, siteUrl, db }) {
  const cleanPath = pathname.replace(/\/+$/, '') || '/';
  const canonicalBase = `${siteUrl}${cleanPath === '/' ? '/' : cleanPath}`;

  // Admin — indekslamaymiz
  if (cleanPath === '/admin' || cleanPath.startsWith('/admin/')) {
    return {
      status: 200,
      block: buildSeoBlock({
        siteUrl,
        title: `Admin — ${SITE_NAME}`,
        description: '',
        canonical: canonicalBase,
        robots: 'noindex, nofollow',
      }),
    };
  }

  // Statik marshrutlar
  if (STATIC_ROUTES[cleanPath]) {
    const r = STATIC_ROUTES[cleanPath];
    return {
      status: 200,
      block: buildSeoBlock({
        siteUrl,
        title: r.title,
        description: r.description,
        canonical: canonicalBase,
        ogType: 'website',
      }),
    };
  }

  // Blog maqolasi: /blog/:slug
  const blogMatch = cleanPath.match(/^\/blog\/(.+)$/);
  if (blogMatch) {
    const slug = decodeURIComponent(blogMatch[1]).trim().toLowerCase();
    const post = findPostBySlug(db, slug);
    if (post) {
      const title = post.title_uz;
      const excerpt = stripTags(post.excerpt_uz).slice(0, 160);
      const canonical = `${siteUrl}/blog/${slugify(post.title_uz) || `post-${post.id}`}`;
      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: title,
        description: excerpt,
        image: absUrl(siteUrl, post.image),
        datePublished: post.date || post.created_at,
        dateModified: post.created_at || post.date,
        author: { '@type': 'Organization', name: post.author || SITE_NAME },
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          logo: { '@type': 'ImageObject', url: `${siteUrl}${DEFAULT_IMAGE}` },
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
      };
      return {
        status: 200,
        block: buildSeoBlock({
          siteUrl,
          title: `${title} | ${SITE_NAME}`,
          description: excerpt,
          canonical,
          ogType: 'article',
          ogImage: post.image,
          jsonLd,
        }),
      };
    }
    // Topilmadi — soft 404 emas, haqiqiy 404 + noindex
    return {
      status: 404,
      block: buildSeoBlock({
        siteUrl,
        title: `Sahifa topilmadi — ${SITE_NAME}`,
        description: '',
        canonical: canonicalBase,
        robots: 'noindex, follow',
      }),
    };
  }

  // Noma'lum marshrut — 404 + noindex
  return {
    status: 404,
    block: buildSeoBlock({
      siteUrl,
      title: `Sahifa topilmadi — ${SITE_NAME}`,
      description: '',
      canonical: canonicalBase,
      robots: 'noindex, follow',
    }),
  };
}

function findPostBySlug(db, slug) {
  if (!db) return null;
  // Legacy format: "<id>-..." → id bo'yicha
  const legacy = slug.match(/^(\d+)-(.+)$/);
  if (legacy) {
    const row = db.prepare('SELECT * FROM posts WHERE id = ?').get(Number(legacy[1]));
    if (row) return row;
  }
  let rows = [];
  try {
    rows = db.prepare('SELECT * FROM posts').all();
  } catch (e) {
    return null;
  }
  return (
    rows.find(
      (r) =>
        slugify(r.title_uz) === slug ||
        slugify(r.title_ru) === slug ||
        slugify(r.title_en) === slug
    ) || null
  );
}

const SEO_MARKER = /<!--\s*SEO:start\s*-->[\s\S]*?<!--\s*SEO:end\s*-->/;

/**
 * index.html ichidagi marker blokini marshrutga mos SEO teglar bilan almashtiradi.
 */
function injectSeo(html, block) {
  const replacement = `<!-- SEO:start -->\n    ${block}\n    <!-- SEO:end -->`;
  if (SEO_MARKER.test(html)) return html.replace(SEO_MARKER, replacement);
  // Marker bo'lmasa </head> dan oldin qo'shamiz
  return html.replace('</head>', `    ${block}\n  </head>`);
}

module.exports = { resolveSeo, injectSeo };
