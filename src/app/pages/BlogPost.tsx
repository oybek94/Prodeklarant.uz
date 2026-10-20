import { useState, useEffect, useRef } from 'react';
import { Link, useLoaderData } from 'react-router';
import { ArrowLeft, ArrowRight, Eye, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { incrementView } from '../api';
import type { PostData } from '../data';
import { useLocalePath, withLocale, type Locale } from '../utils/locale';
import { fallbackBlogImage } from '../utils/blogImages';
import { blogPostPath } from '../utils/slugify';

export default function BlogPost() {
  const { t, i18n } = useTranslation();
  const lp = useLocalePath();
  // Loader (data.ts: blogPostLoader) — serverda DB'dan, brauzerda /api orqali
  const { post, related } = useLoaderData() as PostData;
  const [sharedFeedback, setSharedFeedback] = useState(false);
  const lang = (i18n.language?.split('-')[0] || 'uz') as 'uz' | 'ru' | 'en';

  // Ko'rishlar sonini har bir maqola uchun bir marta oshiramiz (qayta render'da emas)
  const viewedIdRef = useRef<number | null>(null);
  useEffect(() => {
    if (post && viewedIdRef.current !== post.id) {
      viewedIdRef.current = post.id;
      incrementView(post.id);
    }
  }, [post]);

  // SEO: har doim bir xil hook soni bo‘lishi uchun early return lardan oldin; post bo‘lganda meta yangilanadi
  useEffect(() => {
    if (!post) return;
    const siteTitle = 'PRO DEKLARANT - Bojxonadagi ishonchli vakilingiz';
    const langKey = lang;
    const title = post.title[langKey];
    const excerpt = post.excerpt[langKey];
    const image = post.image || fallbackBlogImage(post.id);
    const prevTitle = document.title;
    document.title = `${title} | ${siteTitle}`;

    // Saqlangan slug (yagona manba) + joriy til prefiksi bilan kanonik yo'l.
    const canonicalPath = withLocale(`/blog/${post.slug}`, langKey);
    const canonicalUrl = `${window.location.origin}${canonicalPath}`;
    if (window.location.pathname !== canonicalPath) {
      window.history.replaceState(null, '', canonicalPath);
    }

    const metaDescription = (excerpt || title).replace(/<[^>]*>/g, '').slice(0, 160);

    const setMeta = (attr: 'name' | 'property', key: string, value: string) => {
      const el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (el) el.setAttribute('content', value);
      else {
        const meta = document.createElement('meta');
        meta.setAttribute(attr, key);
        meta.setAttribute('content', value);
        document.head.appendChild(meta);
      }
    };

    const linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (linkCanonical) linkCanonical.setAttribute('href', canonicalUrl);
    else {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = canonicalUrl;
      document.head.appendChild(link);
    }

    // hreflang alternates — har til uchun bir xil slug, alohida URL.
    const setAlternate = (hreflang: string, href: string) => {
      let el = document.querySelector(`link[rel="alternate"][hreflang="${hreflang}"]`) as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement('link');
        el.rel = 'alternate';
        el.hreflang = hreflang;
        document.head.appendChild(el);
      }
      el.href = href;
    };
    const origin = window.location.origin;
    (['uz', 'ru', 'en'] as Locale[]).forEach((loc) =>
      setAlternate(loc, `${origin}${withLocale(`/blog/${post.slug}`, loc)}`)
    );
    setAlternate('x-default', `${origin}/blog/${post.slug}`);

    setMeta('name', 'description', metaDescription);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', metaDescription);
    setMeta('property', 'og:image', image);
    setMeta('property', 'og:url', canonicalUrl);
    setMeta('property', 'og:type', 'article');
    setMeta('property', 'og:locale', langKey === 'ru' ? 'ru_RU' : langKey === 'en' ? 'en_US' : 'uz_UZ');
    if (post.date) setMeta('property', 'article:published_time', post.date);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', metaDescription);
    setMeta('name', 'twitter:image', image);

    // Article (BlogPosting) JSON-LD
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: title,
      description: metaDescription,
      image,
      datePublished: post.date || post.created_at,
      dateModified: post.created_at || post.date,
      author: { '@type': 'Organization', name: post.author || 'PRO DEKLARANT' },
      publisher: {
        '@type': 'Organization',
        name: 'PRO DEKLARANT',
        logo: { '@type': 'ImageObject', url: `${window.location.origin}/logo.png` },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
    };
    let ldScript = document.getElementById('json-ld-article') as HTMLScriptElement | null;
    if (!ldScript) {
      ldScript = document.createElement('script');
      ldScript.id = 'json-ld-article';
      ldScript.type = 'application/ld+json';
      document.head.appendChild(ldScript);
    }
    ldScript.textContent = JSON.stringify(jsonLd);

    return () => {
      document.title = prevTitle;
      const el = document.getElementById('json-ld-article');
      if (el) el.remove();
    };
  }, [post, lang]);

  if (!post) {
    return (
      <div className="pd bp-nf">
        <h1 className="serif">{t('blogPost.notFound')}</h1>
        <Link to={lp('/blog')} className="bp-back">
          <ArrowLeft size={18} aria-hidden /> {t('blogPost.back')}
        </Link>
      </div>
    );
  }

  const title = post.title[lang];
  const excerpt = post.excerpt[lang];
  const category = post.category[lang];
  const body = post.body[lang];
  const image = post.image || fallbackBlogImage(post.id);
  const author = post.author || 'Prodeklarant';
  const initials = author.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');

  const handleShare = async () => {
    const url = window.location.href;
    const text = `${title} — Prodeklarant`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: text + '\n' + (excerpt || ''),
          url,
        });
        setSharedFeedback(true);
        setTimeout(() => setSharedFeedback(false), 2000);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') copyLinkFallback(url);
      }
    } else {
      copyLinkFallback(url);
    }
  };

  function copyLinkFallback(url: string) {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setSharedFeedback(true);
        setTimeout(() => setSharedFeedback(false), 2000);
      });
    }
  }

  const shareBtn = (
    <button type="button" className="bp-shr" onClick={handleShare} title={t('blogPost.share')} aria-label={t('blogPost.share')}>
      <Share2 size={20} strokeWidth={1.8} aria-hidden />
    </button>
  );

  return (
    <div className="pd bp">
      <div className="bp-top">
        <div className="bp-w">
          <Link to={lp('/blog')} className="bp-back">
            <ArrowLeft size={18} strokeWidth={2} aria-hidden /> {t('blogPost.back')}
          </Link>
        </div>
      </div>

      <header className="bp-head">
        <div className="bp-hin">
          <div className="bp-meta">
            <span className="mono bp-cat">{category}</span>
            <span className="mono bp-date">{post.date}</span>
          </div>
          <h1 className="serif bp-h1">{title}</h1>
          {excerpt && <p className="bp-lede">{excerpt}</p>}
          <div className="bp-by">
            <span className="bp-au"><span className="bp-av mono" aria-hidden>{initials}</span>{author}</span>
            <span className="bp-vw"><Eye size={18} strokeWidth={1.8} aria-hidden />{post.views ?? 0} {t('blogPost.views')}</span>
          </div>
        </div>
      </header>

      <div className="bp-cover">
        <div className="bp-w">
          <div className="bp-cimg">
            <img src={image} alt={title} width={1200} height={600} loading="eager" decoding="async" />
          </div>
        </div>
      </div>

      <div className="bp-main">
        <div className="bp-w bp-grid">
          <div className="bp-railc">
            <div className="bp-rail">
              <span className="mono bp-rl">{t('blogPost.share')}</span>
              {shareBtn}
            </div>
          </div>

          <article className="bp-art">
            {body ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
            ) : (
              <p>{t('blogPost.quote')}</p>
            )}
            <div className="bp-end">
              <span className="mono bp-rl">{t('blogPost.share')}</span>
              <div className="bp-endr">
                {sharedFeedback && <span className="bp-ok" role="status">{t('blogPost.linkCopied')}</span>}
                {shareBtn}
              </div>
            </div>
          </article>

          <div className="bp-railc" />
        </div>
      </div>

      {related && related.length > 0 && (
        <section className="bp-rel">
          <div className="bp-w">
            <div className="bp-kick">
              <span className="bp-kick-l" />
              <span className="mono">{t('pd.blog.label')}</span>
            </div>
            <h2 className="serif bp-rh">{t('blogPost.related')}</h2>
            <div className="bp-cards">
              {related.map((p) => (
                <article key={p.id} className="bp-pc">
                  <div className="bp-pph">
                    <img src={p.image || fallbackBlogImage(p.id)} alt={p.title[lang]} loading="lazy" decoding="async" />
                  </div>
                  <div className="bp-pm">
                    <span className="mono bp-cat">{p.category[lang]}</span>
                    <span className="mono bp-date">{p.date}</span>
                  </div>
                  <h3 className="serif bp-pt">
                    <Link to={lp(blogPostPath({ id: p.id, slug: p.slug }))}>{p.title[lang]}</Link>
                  </h3>
                  <span className="bp-rd">
                    {t('blog.readMore')} <ArrowRight size={16} aria-hidden />
                  </span>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
