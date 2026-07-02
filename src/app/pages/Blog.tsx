import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Calendar, User, ArrowRight, Eye, X, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { getPosts, type BlogPost } from '../api';
import { blogPostPath } from '../utils/slugify';
import { useLocalePath } from '../utils/locale';
import { BLOG_IMAGES, fallbackBlogImage } from '../utils/blogImages';

const POSTS_PER_PAGE = 7;

function toDisplayPost(post: BlogPost, lang: string): { id: number; slug: string; title: string; excerpt: string; date: string; author: string; category: string; image: string; views: number } {
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

export function useBlogPosts() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<{ id: number; slug: string; title: string; excerpt: string; date: string; author: string; category: string; image: string; views: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const lang = i18n.language?.split('-')[0] || 'uz';

  useEffect(() => {
    getPosts()
      .then((data) => setPosts(data.map((p) => toDisplayPost(p, lang))))
      .catch(() => {
        const fallback = [1, 2, 3, 4].map((id, i) => ({
          id,
          slug: '',
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

  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-sans">
      {/* Dynamic Hero Section */}
      <section className="relative z-10 text-white min-h-[45vh] flex items-center justify-center overflow-hidden">
        <motion.div
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute inset-0 z-0"
        >
          <picture>
            <source srcSet="/images/p265087-1280.webp" type="image/webp" />
            <img
              src="/images/p265087-1280.jpg"
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover"
              loading="eager"
              fetchPriority="high"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/90 via-brand-dark/70 to-brand-dark/90 mix-blend-multiply" aria-hidden="true" />
        </motion.div>

        {/* Abstract shapes */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-brand/30 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="container mx-auto px-4 relative z-10 text-center mt-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-black tracking-widest text-sm mb-6 uppercase shadow-lg">
              <BookOpen size={16} className="text-accent" /> Prodeklarant
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold mb-6 tracking-tight drop-shadow-lg">
              {t('blog.title')}
            </h1>
            <p className="text-lg md:text-xl text-slate-200 max-w-2xl mx-auto font-medium leading-relaxed">
              {t('blog.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-12">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-2/3">
            {loading ? (
              <div className="text-center py-20 text-slate-600">{t('blog.loading')}</div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-20 text-slate-600">{t('blog.noResults')}</div>
            ) : (
              <div className="grid gap-10">
                <AnimatePresence>
                  {postsForPage.map((post, idx) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className="group bg-white rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col md:flex-row transition-all duration-500 border border-slate-100 transform hover:-translate-y-1"
                    >
                      <div className="md:w-5/12 h-64 md:h-auto relative overflow-hidden">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover absolute inset-0 group-hover:scale-110 transition-transform duration-700"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent md:hidden" />
                      </div>
                      <div className="p-8 md:p-10 md:w-7/12 flex flex-col justify-between relative">
                        {/* Interactive accent corner */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-brand/5 to-transparent rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>

                        <div>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mb-5 uppercase font-black tracking-wider">
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-brand/5 text-brand rounded-full"><Calendar size={14} /> {post.date}</span>
                            <span className="flex items-center gap-1.5"><User size={14} className="text-slate-400" /> {post.author}</span>
                            <span className="flex items-center gap-1.5"><Eye size={14} className="text-slate-400" /> {post.views}</span>
                          </div>
                          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4 group-hover:text-brand transition-colors tracking-tight leading-snug">
                            <Link to={lp(blogPostPath(post))} className="focus:outline-none before:absolute before:inset-0">
                              {post.title}
                            </Link>
                          </h2>
                          <p className="text-slate-600 font-medium text-base mb-6 line-clamp-3 leading-relaxed">
                            {post.excerpt}
                          </p>
                        </div>
                        <div className="inline-flex items-center gap-2 text-brand font-black text-sm uppercase tracking-widest hover:text-accent-dark transition-colors self-start group/btn">
                          {t('blog.readMore')}
                          <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {!loading && filteredPosts.length > 0 && totalPages > 1 && (
              <nav className="flex justify-center items-center mt-16 gap-3 flex-wrap" aria-label={t('blog.paginationLabel')}>
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="w-12 h-12 flex items-center justify-center bg-white text-slate-700 font-bold border border-slate-200 hover:border-brand hover:text-brand shadow-sm rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  aria-label={t('blog.prevPage')}
                >
                  <ChevronLeft size={20} />
                </button>
                {pageNumbers.map((num, idx) =>
                  num === -1 ? (
                    <span key={`ellipsis-${idx}`} className="w-12 h-12 flex items-center justify-center text-slate-400 font-bold">…</span>
                  ) : (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCurrentPage(num)}
                      className={`w-12 h-12 flex items-center justify-center font-bold rounded-xl transition-all shadow-sm ${currentPage === num
                        ? 'bg-brand text-white border-transparent shadow-[0_5px_15px_rgba(0,54,102,0.3)]'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-brand hover:text-brand'
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
                  className="w-12 h-12 flex items-center justify-center bg-white text-slate-700 font-bold border border-slate-200 hover:border-brand hover:text-brand shadow-sm rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  aria-label={t('blog.nextPage')}
                >
                  <ChevronRight size={20} />
                </button>
              </nav>
            )}
          </div>

          <div className="lg:w-1/3 space-y-8 relative">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="sticky top-24 space-y-8"
            >
              <div className="bg-white p-8 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-6 uppercase tracking-wide flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-accent rounded-full"></div>
                  {t('blog.search')}
                </h3>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('blog.searchPlaceholder')}
                    className="w-full pl-5 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all font-medium text-slate-800 placeholder:text-slate-400"
                    aria-label={t('blog.searchPlaceholder')}
                  />
                  {searchQuery ? (
                    <button type="button" onClick={() => setSearchQuery('')} className="absolute right-4 top-4 text-slate-400 hover:text-brand transition-colors" aria-label={t('blog.clearSearch')}>
                      <X size={20} />
                    </button>
                  ) : (
                    <span className="absolute right-4 top-4 text-brand bg-brand/10 p-1 rounded-md pointer-events-none" aria-hidden="true">
                      <Search size={18} />
                    </span>
                  )}
                </div>
              </div>
              <div className="bg-white p-8 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-6 uppercase tracking-wide flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-brand rounded-full"></div>
                  {t('blog.categories')}
                </h3>
                <ul className="space-y-2 text-sm font-medium">
                  <li
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedCategory(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedCategory(null)}
                    className={`flex justify-between items-center cursor-pointer p-3 rounded-xl transition-all ${selectedCategory === null ? 'bg-brand text-white shadow-md shadow-brand/20' : 'text-slate-600 hover:bg-slate-50 hover:text-brand'}`}
                  >
                    <span className="font-bold">{t('blog.allCategories')}</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${selectedCategory === null ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{blogPosts.length}</span>
                  </li>
                  {categoriesWithCount.map(({ name, count }) => (
                    <li
                      key={name}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedCategory(name)}
                      onKeyDown={(e) => e.key === 'Enter' && setSelectedCategory(name)}
                      className={`flex justify-between items-center cursor-pointer p-3 rounded-xl transition-all ${selectedCategory === name ? 'bg-brand text-white shadow-md shadow-brand/20' : 'text-slate-600 hover:bg-slate-50 hover:text-brand'}`}
                    >
                      <span className="font-bold">{name}</span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${selectedCategory === name ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
