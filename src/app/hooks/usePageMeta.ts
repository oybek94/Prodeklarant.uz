import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';

const ROUTE_SEO_KEYS: Record<string, string> = {
  '/': 'home',
  '/services': 'services',
  '/about': 'about',
  '/blog': 'blog',
  '/contact': 'contact',
};

/** BlogPost o‘zi meta o‘rnatadi; faqat /blog/:slug dan boshqa sahifalarda ishlaymiz */
function isBlogPostPath(pathname: string): boolean {
  return pathname.startsWith('/blog/') && pathname !== '/blog';
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

export function usePageMeta(): void {
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'uz';

  useEffect(() => {
    if (isBlogPostPath(pathname)) return;
    const seoKey = ROUTE_SEO_KEYS[pathname];
    if (!seoKey) return;

    const title = t(`seo.${seoKey}.title`);
    const description = t(`seo.${seoKey}.description`);
    const canonicalUrl = `${window.location.origin}${pathname}`;
    const ogLocale = lang === 'ru' ? 'ru_RU' : lang === 'en' ? 'en_US' : 'uz_UZ';

    document.title = title;
    ensureMeta('name', 'description', description);
    ensureCanonical(canonicalUrl);

    // OG / Twitter teglarni client-navigatsiyada sinxron ushlaymiz
    ensureMeta('property', 'og:title', title);
    ensureMeta('property', 'og:description', description);
    ensureMeta('property', 'og:url', canonicalUrl);
    ensureMeta('property', 'og:type', 'website');
    ensureMeta('property', 'og:locale', ogLocale);
    ensureMeta('name', 'twitter:title', title);
    ensureMeta('name', 'twitter:description', description);
  }, [pathname, lang, t, i18n.language]);
}
