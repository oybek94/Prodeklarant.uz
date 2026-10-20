import { useState, useEffect, useMemo } from 'react';
import { Link, useLoaderData } from 'react-router';
import { ArrowRight, ChevronLeft, ChevronRight, Eye, Search, User, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { PostsData, PostSummary } from '../data';
import { blogPostPath } from '../utils/slugify';
import { useLocalePath } from '../utils/locale';
import { fallbackBlogImage } from '../utils/blogImages';

const POSTS_PER_PAGE = 7;

type DisplayPost = { id: number; slug: string; title: string; excerpt: string; date: string; author: string; category: string; image: string; views: number };

function toDisplayPost(post: PostSummary, lang: string): DisplayPost {
  const l = (lang === 'uz' || lang === 'ru' || lang === 'en') ? lang : 'uz';
  return {
    id: post.id,
    slug: post.slug,
    title: post.title[l],
    excerpt: post.excerpt[l],
    date: post.date,
    author: post.author || 'Prodeklarant',
    category: post.category[l],
    image: post.image || fallbackBlogImage(post.id),
    views: post.views ?? 0,
  };
}

/** Loader (data.ts: blogLoader) ma'lumotini joriy tilga moslab qaytaradi. */
function useBlogPosts() {
  const { i18n } = useTranslation();
  const { posts } = useLoaderData() as PostsData;
  const lang = i18n.language?.split('-')[0] || 'uz';
  const display = useMemo(() => posts.map((p) => toDisplayPost(p, lang)), [posts, lang]);
  return { posts: display, loading: false };
}

export default function Blog() {
  const { t } = useTranslation();
  const { posts: blogPosts, loading } = useBlogPosts();
  const lp = useLocalePath();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const categoriesWithCount = useMemo(() => {
    const map = new Map<string, number>();
    blogPosts.forEach((p) => {
      const cat = p.category?.trim() || t('blog.uncategorized');
      map.set(cat, (map.get(cat) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [blogPosts, t]);

  const filteredPosts = useMemo(() => {
    let list = blogPosts;
    if (selectedCategory) {
      list = list.filter((p) => (p.category?.trim() || t('blog.uncategorized')) === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((p) => {
        const titleMatch = p.title?.toLowerCase().includes(q);
        const excerptClean = p.excerpt?.replace(/<[^>]*>/g, '').toLowerCase() ?? '';
        const excerptMatch = excerptClean.includes(q);
        const categoryMatch = p.category?.toLowerCase().includes(q);
        return titleMatch || excerptMatch || categoryMatch;
      });
    }
    return list;
  }, [blogPosts, selectedCategory, searchQuery, t]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const postsForPage = useMemo(
    () => filteredPosts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE),
    [filteredPosts, currentPage]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  const pageNumbers: number[] = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: number[] = [];
    if (currentPage <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push(-1);
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1);
      pages.push(-1);
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push(-1);
      for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
      pages.push(-1);
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, currentPage]);

  // Birinchi sahifada eng yangi maqola katta ko'rsatiladi, qolganlari jadvalda
  const featured = currentPage === 1 ? postsForPage[0] : undefined;
  const rest = featured ? postsForPage.slice(1) : postsForPage;

  const clean = (html: string) => html?.replace(/<[^>]*>/g, '') ?? '';
  const categoryLabel = (p: DisplayPost) => p.category?.trim() || t('blog.uncategorized');

  const meta = (post: DisplayPost) => (
    <div className="bl-meta">
      <span className="mono bl-cat">{categoryLabel(post)}</span>
      <span className="mono bl-date">{post.date}</span>
    </div>
  );
  const byline = (post: DisplayPost) => (
    <div className="bl-by">
      <span><User size={16} aria-hidden />{post.author}</span>
      <span><Eye size={16} aria-hidden />{post.views}</span>
    </div>
  );

  return (
    <div className="pd">
      <section className="bl-hero">
        <div className="wrap bl-hero-in">
          <div style={{ minWidth: 0, flex: '1 1 560px' }}>
            <div className="bl-kick">
              <span className="bl-kick-l" />
              <span className="mono">{t('pd.blog.label')}</span>
            </div>
            <h1 className="serif bl-h1">{t('blog.title')}</h1>
            <p className="bl-lede">{t('blog.subtitle')}</p>
          </div>
          <label className="bl-search">
            <Search size={20} strokeWidth={1.8} aria-hidden />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('blog.searchPlaceholder')}
              aria-label={t('blog.search')}
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} aria-label={t('blog.clearSearch')}>
                <X size={18} aria-hidden />
              </button>
            )}
          </label>
        </div>
      </section>

      <section className="bl-cats">
        <div className="wrap bl-cats-in">
          <span className="mono bl-cats-l">{t('blog.categories')}</span>
          <div className="bl-chips">
            <button type="button" className={`bl-chip${selectedCategory === null ? ' on' : ''}`} onClick={() => setSelectedCategory(null)} aria-pressed={selectedCategory === null}>
              {t('blog.allCategories')} <span className="mono bl-n">{blogPosts.length}</span>
            </button>
            {categoriesWithCount.map(({ name, count }) => (
              <button key={name} type="button" className={`bl-chip${selectedCategory === name ? ' on' : ''}`} onClick={() => setSelectedCategory(name)} aria-pressed={selectedCategory === name}>
                {name} <span className="mono bl-n">{count}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="bl-sec">
        <div className="wrap">
          {loading ? (
            <div className="bl-empty">{t('blog.loading')}</div>
          ) : filteredPosts.length === 0 ? (
            <div className="bl-empty">{t('blog.noResults')}</div>
          ) : (
            <>
              {featured && (
                <article className="bl-post bl-feat">
                  <div className="bl-ph" style={{ aspectRatio: '16 / 11' }}>
                    <img src={featured.image} alt={featured.title} loading="eager" decoding="async" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    {meta(featured)}
                    <h2 className="serif bl-ft">
                      <Link to={lp(blogPostPath(featured))}>{featured.title}</Link>
                    </h2>
                    <p className="bl-fx">{clean(featured.excerpt)}</p>
                    {byline(featured)}
                    <span className="bl-rd">
                      {t('blog.readMore')} <ArrowRight size={16} aria-hidden />
                    </span>
                  </div>
                </article>
              )}

              {rest.length > 0 && (
                <>
                  {featured && (
                    <div className="bl-div" aria-hidden>
                      <span /><span className="mono">{t('blog.allCategories')}</span><span />
                    </div>
                  )}
                  <div className="bl-cards">
                    {rest.map((post) => (
                      <article key={post.id} className="bl-post bl-card">
                        <div className="bl-ph" style={{ aspectRatio: '16 / 10' }}>
                          <img src={post.image} alt={post.title} loading="lazy" decoding="async" />
                        </div>
                        {meta(post)}
                        <h3 className="serif bl-ct">
                          <Link to={lp(blogPostPath(post))}>{post.title}</Link>
                        </h3>
                        <p className="bl-cx">{clean(post.excerpt)}</p>
                        {byline(post)}
                        <span className="bl-rd">
                          {t('blog.readMore')} <ArrowRight size={16} aria-hidden />
                        </span>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {!loading && filteredPosts.length > 0 && totalPages > 1 && (
            <nav className="bl-pgs" aria-label={t('blog.paginationLabel')}>
              <button type="button" className="bl-pg" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} aria-label={t('blog.prevPage')}>
                <ChevronLeft size={20} aria-hidden />
              </button>
              {pageNumbers.map((num, idx) =>
                num === -1 ? (
                  <span key={`ellipsis-${idx}`} className="bl-pg bl-dots">…</span>
                ) : (
                  <button
                    key={num}
                    type="button"
                    className={`bl-pg${currentPage === num ? ' on' : ''}`}
                    onClick={() => setCurrentPage(num)}
                    aria-label={t('blog.pageNumber', { page: num })}
                    aria-current={currentPage === num ? 'page' : undefined}
                  >
                    {num}
                  </button>
                )
              )}
              <button type="button" className="bl-pg" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} aria-label={t('blog.nextPage')}>
                <ChevronRight size={20} aria-hidden />
              </button>
            </nav>
          )}
        </div>
      </section>
    </div>
  );
}
