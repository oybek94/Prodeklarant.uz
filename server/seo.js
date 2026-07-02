/**
 * Server-side SEO meta injection (ko'p tilli).
 *
 * Sahifa sof client-side (React SPA) bo'lgani uchun ijtimoiy tarmoq va qidiruv
 * crawlerlari (Telegram, Facebook, Yandex, ...) JS'ni ishlatmaydi va meta teglarni
 * ko'rmaydi. Shu sabab index.html ichidagi `<!-- SEO:start -->` / `<!-- SEO:end -->`
 * markerlari orasiga har bir marshrut uchun to'g'ri title/description/canonical/OG/hreflang
 * teglarni server tomonda joylaymiz.
 *
 * URL strukturasi: uz — prefikssiz (`/services`), ru/en — prefiksli (`/ru/services`).
 * Har til alohida URL bo'lgani uchun hreflang orqali Google ularni alohida indekslaydi.
 */

const { slugify } = require('./utils/slugify');

const SITE_NAME = 'PRO DEKLARANT';
const DEFAULT_IMAGE = '/logo.png'; // JSON-LD publisher/organization logotipi uchun
const DEFAULT_OG_IMAGE = '/og-cover.jpg'; // ijtimoiy ulashish (1200x630) muqovasi uchun
const LOCALES = ['uz', 'ru', 'en'];
const DEFAULT_LOCALE = 'uz';
const OG_LOCALE = { uz: 'uz_UZ', ru: 'ru_RU', en: 'en_US' };

// Statik marshrutlar SEO ma'lumotlari — til bo'yicha (crawler default sifatida uz'ni ko'radi).
const STATIC_ROUTES = {
  uz: {
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
  },
  ru: {
    '/': {
      title: 'PRO DEKLARANT — Таможенное оформление для экспорта фруктов и овощей',
      description:
        'Профессиональные таможенные брокерские услуги для экспортёров фруктов и овощей. Оформление ГТД, сертификаты, логистика. Ферганская область.',
    },
    '/services': {
      title: 'Услуги — PRO DEKLARANT',
      description:
        'Таможенная грузовая декларация, фитосанитария, сертификация и экспортная логистика. Полный спектр услуг по экспорту фруктов и овощей.',
    },
    '/about': {
      title: 'О компании — PRO DEKLARANT',
      description:
        'PRO DEKLARANT — таможенные услуги для экспорта фруктов и овощей. Профессиональная команда, законная гарантия, международный опыт.',
    },
    '/contact': {
      title: 'Контакты — PRO DEKLARANT',
      description:
        'Свяжитесь с PRO DEKLARANT: Ферганская область, Алтыарык. Бесплатная консультация и помощь по таможенным услугам.',
    },
    '/blog': {
      title: 'Блог — PRO DEKLARANT',
      description:
        'Полезные статьи и новости об экспорте, таможенном оформлении, сертификатах и рынках фруктов и овощей.',
    },
  },
  en: {
    '/': {
      title: 'PRO DEKLARANT — Customs clearance for fruit and vegetable export',
      description:
        'Professional customs brokerage for fruit and vegetable exporters. GTD clearance, certificates, logistics. Fergana region, Uzbekistan.',
    },
    '/services': {
      title: 'Services — PRO DEKLARANT',
      description:
        'Customs cargo declaration, phytosanitary, certification and export logistics. Full range of services for fruit and vegetable export.',
    },
    '/about': {
      title: 'About Us — PRO DEKLARANT',
      description:
        'PRO DEKLARANT — customs services for fruit and vegetable export. Professional team, legal guarantee, international experience.',
    },
    '/contact': {
      title: 'Contact — PRO DEKLARANT',
      description:
        'Contact PRO DEKLARANT: Fergana region, Oltiariq. Free consultation and assistance with customs services.',
    },
    '/blog': {
      title: 'Blog — PRO DEKLARANT',
      description:
        'Useful articles and news on export, customs clearance, certificates and fruit and vegetable markets.',
    },
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

/** Pathname'dan til prefiksini ajratadi. */
function parseLocale(pathname) {
  const seg = pathname.split('/')[1];
  if (seg === 'ru' || seg === 'en') {
    const rest = pathname.slice(3) || '/';
    return { locale: seg, basePath: rest };
  }
  return { locale: DEFAULT_LOCALE, basePath: pathname || '/' };
}

/** Toza yo'lga til prefiksini qo'shadi (uz — prefikssiz). */
function withLocalePath(basePath, locale) {
  const clean = basePath.startsWith('/') ? basePath : `/${basePath}`;
  if (locale === DEFAULT_LOCALE) return clean;
  if (clean === '/') return `/${locale}`;
  return `/${locale}${clean}`;
}

/** basePath uchun uz/ru/en + x-default hreflang alternate teglarini quradi. */
function buildAlternates(siteUrl, basePath) {
  const lines = LOCALES.map(
    (loc) =>
      `<link rel="alternate" hreflang="${loc}" href="${escapeHtml(siteUrl + withLocalePath(basePath, loc))}" />`
  );
  lines.push(
    `<link rel="alternate" hreflang="x-default" href="${escapeHtml(siteUrl + withLocalePath(basePath, DEFAULT_LOCALE))}" />`
  );
  return lines;
}

/**
 * Marshrut uchun <head> ichiga joylanadigan SEO teglar bloki (markerlar orasidagi qism).
 */
function buildSeoBlock({ siteUrl, title, description, canonical, ogType, ogImage, robots, jsonLd, locale, alternates }) {
  const loc = locale || DEFAULT_LOCALE;
  const usingDefaultOg = !ogImage;
  const img = absUrl(siteUrl, ogImage || DEFAULT_OG_IMAGE);
  const desc = stripTags(description).slice(0, 300);
  const altLocales = LOCALES.filter((l) => l !== loc);
  const lines = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(desc)}" />`,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    `<meta name="robots" content="${escapeHtml(robots || 'index, follow')}" />`,
    `<meta property="og:type" content="${escapeHtml(ogType || 'website')}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:locale" content="${OG_LOCALE[loc]}" />`,
    ...altLocales.map((l) => `<meta property="og:locale:alternate" content="${OG_LOCALE[l]}" />`),
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(desc)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
    `<meta property="og:image" content="${escapeHtml(img)}" />`,
    ...(usingDefaultOg
      ? [
          `<meta property="og:image:width" content="1200" />`,
          `<meta property="og:image:height" content="630" />`,
        ]
      : []),
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(desc)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(img)}" />`,
  ];
  if (alternates && alternates.length) {
    lines.push(...alternates);
  }
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
  const cleanFull = pathname.replace(/\/+$/, '') || '/';
  const { locale, basePath: rawBase } = parseLocale(cleanFull);
  const basePath = rawBase.replace(/\/+$/, '') || '/';
  const canonicalBase = `${siteUrl}${withLocalePath(basePath, locale)}`;

  // Admin — indekslamaymiz (tilga bog'liq emas)
  if (basePath === '/admin' || basePath.startsWith('/admin/')) {
    return {
      status: 200,
      block: buildSeoBlock({
        siteUrl,
        title: `Admin — ${SITE_NAME}`,
        description: '',
        canonical: canonicalBase,
        robots: 'noindex, nofollow',
        locale,
      }),
    };
  }

  // Statik marshrutlar
  const routeForLocale = (STATIC_ROUTES[locale] || STATIC_ROUTES[DEFAULT_LOCALE])[basePath];
  if (routeForLocale) {
    return {
      status: 200,
      block: buildSeoBlock({
        siteUrl,
        title: routeForLocale.title,
        description: routeForLocale.description,
        canonical: canonicalBase,
        ogType: 'website',
        locale,
        alternates: buildAlternates(siteUrl, basePath),
      }),
    };
  }

  // Blog maqolasi: /blog/:slug (yoki /ru/blog/:slug)
  const blogMatch = basePath.match(/^\/blog\/(.+)$/);
  if (blogMatch) {
    const slug = decodeURIComponent(blogMatch[1]).trim().toLowerCase();
    const post = findPostBySlug(db, slug);
    if (post) {
      const title = post[`title_${locale}`] || post.title_uz;
      const excerptRaw = post[`excerpt_${locale}`] || post.excerpt_uz;
      const excerpt = stripTags(excerptRaw).slice(0, 160);
      const blogBase = `/blog/${post.slug}`;
      const canonical = `${siteUrl}${withLocalePath(blogBase, locale)}`;
      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: title,
        description: excerpt,
        image: absUrl(siteUrl, post.image),
        datePublished: post.date || post.created_at,
        dateModified: post.created_at || post.date,
        inLanguage: locale,
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
          locale,
          alternates: buildAlternates(siteUrl, blogBase),
        }),
      };
    }
    // Topilmadi — haqiqiy 404 + noindex
    return {
      status: 404,
      block: buildSeoBlock({
        siteUrl,
        title: `Sahifa topilmadi — ${SITE_NAME}`,
        description: '',
        canonical: canonicalBase,
        robots: 'noindex, follow',
        locale,
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
      locale,
    }),
  };
}

function findPostBySlug(db, slug) {
  if (!db) return null;
  // Legacy format: "<id>-..." → id bo'yicha
  const legacy = slug.match(/^(\d+)-(.+)$/);
  if (legacy) {
    try {
        const row = db.prepare('SELECT * FROM posts WHERE id = ?').get(Number(legacy[1]));
        if (row) return row;
    } catch(e) {}
  }

  try {
      const row = db.prepare('SELECT * FROM posts WHERE slug = ?').get(slug);
      return row || null;
  } catch (e) {
      return null;
  }
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
