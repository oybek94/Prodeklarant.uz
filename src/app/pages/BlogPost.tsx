import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, Calendar, User, Tag, Share2, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { getPost, getPosts, type BlogPost } from '../api';

const BLOG_IMAGES = [
  "https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/264537/pexels-photo-264537.jpeg?auto=compress&cs=tinysrgb&w=800",
];

export default function BlogPost() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const lang = (i18n.language?.split('-')[0] || 'uz') as 'uz' | 'ru' | 'en';

  useEffect(() => {
    const numId = Number(id);
    if (!numId) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    getPost(numId)
      .then((p) => {
        setPost(p);
        return getPosts();
      })
      .then((all) => setRelated(all.filter((p) => p.id !== numId).slice(0, 3)))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

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

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="h-[400px] relative">
        <img src={image} alt={title} width={1200} height={600} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-slate-900/50"></div>
        <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-slate-900 to-transparent">
          <div className="container mx-auto px-4">
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
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-2/3">
            <div className="prose prose-lg max-w-none text-slate-700">
              <p className="lead text-xl font-medium text-slate-900 mb-8 italic border-l-4 border-yellow-500 pl-4">{excerpt}</p>
              {body ? (
                <div className="whitespace-pre-wrap">{body}</div>
              ) : (
                <p>{t('blogPost.quote')}</p>
              )}
            </div>
            <div className="mt-12 pt-8 border-t border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-900 uppercase text-sm">{t('blogPost.share')}</span>
              <div className="flex space-x-4">
                <button className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-blue-900 hover:text-white transition-colors">
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="lg:w-1/3">
            <div className="bg-slate-50 p-8 rounded-sm sticky top-24 border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6 uppercase">{t('blogPost.related')}</h3>
              <div className="space-y-6">
                {related.map((r) => (
                  <div key={r.id} className="group cursor-pointer">
                    <div className="text-xs text-slate-500 mb-1">{r.date}</div>
                    <Link to={`/blog/${r.id}`} className="font-bold text-slate-900 hover:text-blue-900 transition-colors block mb-2 leading-tight">
                      {r.title[lang]}
                    </Link>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-8 border-t border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-4 uppercase">{t('blogPost.tags')}</h3>
                <div className="flex flex-wrap gap-2">
                  {['Eksport', 'Bojxona', 'Logistika', 'Qonunchilik', 'Imtiyozlar', 'Transport', 'TIF'].map((tag) => (
                    <span key={tag} className="bg-white border border-slate-200 px-3 py-1 text-xs text-slate-600 uppercase hover:bg-blue-900 hover:text-white hover:border-blue-900 transition-colors cursor-pointer">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
