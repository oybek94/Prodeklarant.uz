import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, Calendar, User, Tag, Share2, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import i18n from '../../i18n';
import { getPost, getPosts, type BlogPost } from '../api';
import { slugify } from '../utils/slugify';

const BLOG_IMAGES = [
  "https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/264537/pexels-photo-264537.jpeg?auto=compress&cs=tinysrgb&w=800",
];

export default function BlogPost() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [sharedFeedback, setSharedFeedback] = useState(false);
  const lang = (i18n.language?.split('-')[0] || 'uz') as 'uz' | 'ru' | 'en';

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    const slugNorm = slug.trim().toLowerCase();
    const legacyMatch = slugNorm.match(/^(\d+)-(.+)$/);
    if (legacyMatch) {
      const id = Number(legacyMatch[1]);
      getPost(id)
        .then(setPost)
        .catch(() => setNotFound(true))
        .finally(() => setLoading(false));
      return;
    }
    getPosts()
      .then((posts) => {
        const found = posts.find(
          (p) =>
            slugify(p.title.uz) === slugNorm ||
            slugify(p.title.ru) === slugNorm ||
            slugify(p.title.en) === slugNorm
        );
        if (found) setPost(found);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  // SEO: har doim bir xil hook soni bo‘lishi uchun early return lardan oldin; post bo‘lganda meta yangilanadi
  useEffect(() => {
    if (!post) return;
    const siteTitle = 'PRO DEKLARANT - Bojxonadagi ishonchli vakilingiz';
    const langKey = (i18n.language?.split('-')[0] || 'uz') as 'uz' | 'ru' | 'en';
    const title = post.title[langKey];
    const excerpt = post.excerpt[langKey];
    const image = post.image || BLOG_IMAGES[(post.id - 1) % BLOG_IMAGES.length];
    const prevTitle = document.title;
    document.title = `${title} | ${siteTitle}`;

    const slug = slugify(title);
    const pathWithSlug = `/blog/${slug}`;
    const canonicalUrl = `${window.location.origin}${pathWithSlug}`;
    if (window.location.pathname !== pathWithSlug) {
      window.history.replaceState(null, '', pathWithSlug);
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

    setMeta('name', 'description', metaDescription);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', metaDescription);
    setMeta('property', 'og:image', image);
    setMeta('property', 'og:url', canonicalUrl);
    setMeta('property', 'og:type', 'article');
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', metaDescription);

    return () => {
      document.title = prevTitle;
    };
  }, [post]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Yuklanmoqda...</div>;
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">{t('blogPost.notFound')}</h1>
        <Link to="/blog" className="text-blue-900 font-bold hover:underline flex items-center gap-2">
          <ArrowLeft size={20} /> {t('blogPost.back')}
        </Link>
      </div>
    );
  }

  const title = post.title[lang];
  const excerpt = post.excerpt[lang];
  const category = post.category[lang];
  const body = post.body[lang];
  const image = post.image || BLOG_IMAGES[(post.id - 1) % BLOG_IMAGES.length];

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

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="h-[400px] relative">
        <img src={image} alt={title} width={1200} height={600} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-slate-900/50"></div>
        <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-slate-900 to-transparent">
          <div className="container mx-auto px-4 max-w-4xl">
            <Link to="/blog" className="text-yellow-500 hover:text-white mb-4 inline-flex items-center gap-2 font-bold uppercase text-xs tracking-wider transition-colors">
              <ArrowLeft size={16} /> {t('blogPost.back')}
            </Link>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight max-w-4xl">{title}</h1>
            <div className="flex flex-wrap gap-6 text-white text-sm font-medium">
              <span className="flex items-center gap-2"><Calendar size={16} className="text-yellow-500" /> {post.date}</span>
              <span className="flex items-center gap-2"><User size={16} className="text-yellow-500" /> {post.author || 'Prodeklarant'}</span>
              <span className="flex items-center gap-2"><Tag size={16} className="text-yellow-500" /> {category}</span>
              <span className="flex items-center gap-2"><Eye size={16} className="text-yellow-500" /> {post.views ?? 0} {t('blogPost.views')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <article className="markdown-body">
            <p className="lead text-xl font-medium text-slate-900 mb-8 italic border-l-4 border-yellow-500 pl-4">{excerpt}</p>
            {body ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {body}
              </ReactMarkdown>
            ) : (
              <p>{t('blogPost.quote')}</p>
            )}
          </article>
          <div className="mt-12 pt-8 border-t border-slate-200 flex items-center justify-between">
            <span className="font-bold text-slate-900 uppercase text-sm">{t('blogPost.share')}</span>
            <div className="flex items-center gap-3">
              {sharedFeedback && (
                <span className="text-sm text-green-600 font-medium">
                  {t('blogPost.linkCopied')}
                </span>
              )}
              <button
                type="button"
                onClick={handleShare}
                className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-blue-900 hover:text-white transition-colors"
                title={t('blogPost.share')}
              >
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
