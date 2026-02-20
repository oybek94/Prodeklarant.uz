import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Search, Calendar, User, ArrowRight, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { getPosts, type BlogPost } from '../api';

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

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4 uppercase">{t('blog.title')}</h1>
          <p className="text-slate-300 max-w-2xl mx-auto">{t('blog.subtitle')}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-12">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-2/3">
            {loading ? (
              <div className="text-center py-20 text-slate-600">Yuklanmoqda...</div>
            ) : (
              <div className="grid gap-10">
                {blogPosts.map((post) => (
                  <div key={post.id} className="bg-white rounded-sm shadow-sm overflow-hidden flex flex-col md:flex-row hover:shadow-lg transition-shadow border border-slate-100">
                    <div className="md:w-1/3 h-48 md:h-auto relative">
                      <img src={post.image} alt={post.title} width={400} height={300} className="w-full h-full object-cover absolute inset-0" loading="lazy" />
                    </div>
                    <div className="p-6 md:w-2/3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-4 text-xs text-slate-500 mb-3 uppercase font-bold tracking-wide">
                          <span className="flex items-center gap-1 text-yellow-600"><Calendar size={12} /> {post.date}</span>
                          <span className="flex items-center gap-1"><User size={12} /> {post.author}</span>
                          <span className="flex items-center gap-1"><Eye size={12} /> {post.views} {t('blogPost.views')}</span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-3 hover:text-blue-900 transition-colors">
                          <Link to={`/blog/${post.id}`}>{post.title}</Link>
                        </h2>
                        <p className="text-slate-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                      </div>
                      <Link to={`/blog/${post.id}`} className="text-blue-900 font-bold text-sm uppercase flex items-center gap-2 hover:text-yellow-600 transition-colors self-start">
                        {t('blog.readMore')} <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && blogPosts.length > 0 && (
              <div className="flex justify-center mt-12 gap-2">
                <button className="w-10 h-10 flex items-center justify-center bg-slate-900 text-white font-bold rounded-sm">1</button>
                <button className="w-10 h-10 flex items-center justify-center bg-white text-slate-900 font-bold border border-slate-200 hover:bg-slate-100 rounded-sm">2</button>
                <button className="w-10 h-10 flex items-center justify-center bg-white text-slate-900 font-bold border border-slate-200 hover:bg-slate-100 rounded-sm">3</button>
              </div>
            )}
          </div>

          <div className="lg:w-1/3 space-y-8">
            <div className="bg-white p-6 rounded-sm shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-4 uppercase">{t('blog.search')}</h3>
              <div className="relative">
                <input type="text" placeholder={t('blog.searchPlaceholder')} className="w-full pl-4 pr-10 py-3 border border-slate-300 focus:outline-none focus:border-blue-900 text-sm" />
                <button className="absolute right-3 top-3 text-slate-400 hover:text-blue-900"><Search size={18} /></button>
              </div>
            </div>
            <div className="bg-white p-6 rounded-sm shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-4 uppercase">{t('blog.categories')}</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between items-center text-slate-600 hover:text-blue-900 cursor-pointer border-b border-slate-100 pb-2">
                  <span>Qonunchilik</span>
                  <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-xs">12</span>
                </li>
                <li className="flex justify-between items-center text-slate-600 hover:text-blue-900 cursor-pointer border-b border-slate-100 pb-2">
                  <span>Logistika</span>
                  <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-xs">8</span>
                </li>
                <li className="flex justify-between items-center text-slate-600 hover:text-blue-900 cursor-pointer border-b border-slate-100 pb-2">
                  <span>Bojxona rasmiylashtiruvi</span>
                  <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-xs">15</span>
                </li>
                <li className="flex justify-between items-center text-slate-600 hover:text-blue-900 cursor-pointer border-b border-slate-100 pb-2">
                  <span>Maslahatlar</span>
                  <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-xs">5</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
