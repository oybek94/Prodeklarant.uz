import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import { Search, Calendar, User, ArrowRight, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { getPosts, type BlogPost } from '../api';
import { blogPostPath } from '../utils/slugify';

const POSTS_PER_PAGE = 7;

const BLOG_IMAGES = [
  "https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/264537/pexels-photo-264537.jpeg?auto=compress&cs=tinysrgb&w=800",
];

function toDisplayPost(post: BlogPost, lang: string): { id: number; title: string; excerpt: string; date: string; author: string; category: string; image: string; views: number } {
  const l = (lang === 'uz' || lang === 'ru' || lang === 'en') ? lang : 'uz';
  return {
    id: post.id,
    title: post.title[l],
    excerpt: post.excerpt[l],
    date: post.date,
    author: post.author || 'Prodeklarant',
    category: post.category[l],
    image: post.image || BLOG_IMAGES[(post.id - 1) % BLOG_IMAGES.length],
    views: post.views ?? 0,
  };
}

export function useBlogPosts() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<{ id: number; title: string; excerpt: string; date: string; author: string; category: string; image: string; views: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const lang = i18n.language?.split('-')[0] || 'uz';

  useEffect(() => {
    getPosts()
      .then((data) => setPosts(data.map((p) => toDisplayPost(p, lang))))
      .catch(() => {
        const fallback = [1, 2, 3, 4].map((id, i) => ({
          id,
          title: t(`blog.posts.${id}.title`),
          excerpt: t(`blog.posts.${id}.excerpt`),
          date: t(`blog.posts.${id}.date`),
          author: ['Azizbek Rahimov', 'Dilnoza Karimova', 'Jamshid Aliyev', 'Azizbek Rahimov'][i],
          category: t(`blog.posts.${id}.category`),
          image: BLOG_IMAGES[i],
          views: 0,
        }));
        setPosts(fallback);
      })
      .finally(() => setLoading(false));
  }, [lang, t]);

  return { posts, loading };
}

export default function Blog() {
  const { t } = useTranslation();
  const { posts: blogPosts, loading } = useBlogPosts();
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

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="relative text-white py-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt=""
            width={1920}
            height={1080}
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
          />
        </div>
        <div className="absolute inset-0 z-[1] bg-brand-dark/75" aria-hidden="true" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl font-bold mb-4 uppercase">{t('blog.title')}</h1>
          <p className="text-slate-200 max-w-2xl mx-auto">{t('blog.subtitle')}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-12">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-2/3">
            {loading ? (
              <div className="text-center py-20 text-slate-600">Yuklanmoqda...</div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-20 text-slate-600">{t('blog.noResults')}</div>
            ) : (
              <div className="grid gap-10">
                {postsForPage.map((post) => (
                  <div key={post.id} className="bg-white rounded-sm shadow-sm overflow-hidden flex flex-col md:flex-row hover:shadow-lg transition-shadow border border-slate-100">
                    <div className="md:w-1/3 h-48 md:h-auto relative">
                      <img src={post.image} alt={post.title} width={400} height={300} className="w-full h-full object-cover absolute inset-0" loading="lazy" decoding="async" />
                    </div>
                    <div className="p-6 md:w-2/3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-4 text-xs text-slate-500 mb-3 uppercase font-bold tracking-wide">
                          <span className="flex items-center gap-1 text-accent-light"><Calendar size={12} /> {post.date}</span>
                          <span className="flex items-center gap-1"><User size={12} /> {post.author}</span>
                          <span className="flex items-center gap-1"><Eye size={12} /> {post.views} {t('blogPost.views')}</span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-3 hover:text-brand transition-colors">
                          <Link to={blogPostPath(post.id, post.title)}>{post.title}</Link>
                        </h2>
                        <p className="text-slate-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                      </div>
                      <Link to={blogPostPath(post.id, post.title)} className="text-brand font-bold text-sm uppercase flex items-center gap-2 hover:text-accent-light transition-colors self-start">
                        {t('blog.readMore')} <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && filteredPosts.length > 0 && totalPages > 1 && (
              <nav className="flex justify-center items-center mt-12 gap-2 flex-wrap" aria-label={t('blog.paginationLabel')}>
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="w-10 h-10 flex items-center justify-center bg-white text-slate-900 font-bold border border-slate-200 hover:bg-slate-100 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                  aria-label={t('blog.prevPage')}
                >
                  <ChevronLeft size={18} />
                </button>
                {pageNumbers.map((num, idx) =>
                  num === -1 ? (
                    <span key={`ellipsis-${idx}`} className="w-10 h-10 flex items-center justify-center text-slate-400">…</span>
                  ) : (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCurrentPage(num)}
                      className={`w-10 h-10 flex items-center justify-center font-bold rounded-sm ${currentPage === num
                          ? 'bg-brand-dark text-white'
                          : 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-100'
                        }`}
                      aria-label={t('blog.pageNumber', { page: num })}
                      aria-current={currentPage === num ? 'page' : undefined}
                    >
                      {num}
                    </button>
                  )
                )}
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="w-10 h-10 flex items-center justify-center bg-white text-slate-900 font-bold border border-slate-200 hover:bg-slate-100 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                  aria-label={t('blog.nextPage')}
                >
                  <ChevronRight size={18} />
                </button>
              </nav>
            )}
          </div>

          <div className="lg:w-1/3 space-y-8">
            <div className="bg-white p-6 rounded-sm shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-4 uppercase">{t('blog.search')}</h3>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('blog.searchPlaceholder')}
                  className="w-full pl-4 pr-10 py-3 border border-slate-300 focus:outline-none focus:border-brand text-sm"
                  aria-label={t('blog.searchPlaceholder')}
                />
                {searchQuery ? (
                  <button type="button" onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-slate-400 hover:text-brand" aria-label={t('blog.clearSearch')}>
                    <X size={18} />
                  </button>
                ) : (
                  <span className="absolute right-3 top-3 text-slate-400 pointer-events-none" aria-hidden="true">
                    <Search size={18} />
                  </span>
                )}
              </div>
            </div>
            <div className="bg-white p-6 rounded-sm shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-4 uppercase">{t('blog.categories')}</h3>
              <ul className="space-y-3 text-sm">
                <li
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedCategory(null)}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedCategory(null)}
                  className={`flex justify-between items-center cursor-pointer border-b border-slate-100 pb-2 ${selectedCategory === null ? 'text-brand font-semibold' : 'text-slate-600 hover:text-brand'}`}
                >
                  <span>{t('blog.allCategories')}</span>
                  <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-xs">{blogPosts.length}</span>
                </li>
                {categoriesWithCount.map(({ name, count }) => (
                  <li
                    key={name}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedCategory(name)}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedCategory(name)}
                    className={`flex justify-between items-center cursor-pointer border-b border-slate-100 pb-2 ${selectedCategory === name ? 'text-brand font-semibold' : 'text-slate-600 hover:text-brand'}`}
                  >
                    <span>{name}</span>
                    <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-xs">{count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
