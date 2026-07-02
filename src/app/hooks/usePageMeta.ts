import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { localeFromPath, stripLocale, withLocale, SUPPORTED_LOCALES, type Locale } from '../utils/locale';

const ROUTE_SEO_KEYS: Record<string, string> = {
  '/': 'home',
  '/services': 'services',
  '/about': 'about',
  '/blog': 'blog',
  '/contact': 'contact',
};

/** BlogPost o‘zi meta o‘rnatadi; faqat /blog/:slug dan boshqa sahifalarda ishlaymiz */
function isBlogPostPath(pathname: string): boolean {
  const base = stripLocale(pathname);
  return base.startsWith('/blog/') && base !== '/blog';
}

function ensureMeta(nameOrProp: 'name' | 'property', key: string, content: string): void {
  const attr = nameOrProp;
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (el) el.setAttribute('content', content);
  else {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    el.setAttribute('content', content);
    document.head.appendChild(el);
  }
}

function ensureCanonical(href: string): void {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (link) link.setAttribute('href', href);
  else {
    link = document.createElement('link');
    link.rel = 'canonical';
    link.href = href;
    document.head.appendChild(link);
  }
}

function ensureAlternate(hreflang: string, href: string): void {
  let el = document.querySelector(`link[rel="alternate"][hreflang="${hreflang}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.rel = 'alternate';
    el.hreflang = hreflang;
    document.head.appendChild(el);
  }
  el.href = href;
}

export function usePageMeta(): void {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    if (isBlogPostPath(pathname)) return;
    const basePath = stripLocale(pathname);
    const seoKey = ROUTE_SEO_KEYS[basePath];
    if (!seoKey) return;

    const lang = localeFromPath(pathname);
    const title = t(`seo.${seoKey}.title`);
    const description = t(`seo.${seoKey}.description`);
    const origin = window.location.origin;
    const canonicalUrl = `${origin}${withLocale(basePath, lang)}`;
    const ogLocale = lang === 'ru' ? 'ru_RU' : lang === 'en' ? 'en_US' : 'uz_UZ';

    document.title = title;
    ensureMeta('name', 'description', description);
    ensureCanonical(canonicalUrl);

    // hreflang alternates — har bir til uchun alohida URL + x-default (uz).
    (SUPPORTED_LOCALES as readonly Locale[]).forEach((loc) =>
      ensureAlternate(loc, `${origin}${withLocale(basePath, loc)}`)
    );
    ensureAlternate('x-default', `${origin}${basePath}`);

    // OG / Twitter teglarni client-navigatsiyada sinxron ushlaymiz
    ensureMeta('property', 'og:title', title);
    ensureMeta('property', 'og:description', description);
    ensureMeta('property', 'og:url', canonicalUrl);
    ensureMeta('property', 'og:type', 'website');
    ensureMeta('property', 'og:locale', ogLocale);
    ensureMeta('name', 'twitter:title', title);
    ensureMeta('name', 'twitter:description', description);
  }, [pathname, t]);
}
