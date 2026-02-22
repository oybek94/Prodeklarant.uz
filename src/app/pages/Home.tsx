import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { CheckCircle, Clock, Globe, ShieldCheck, ArrowRight, FileText, Truck, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { getPosts, type BlogPost } from '../api';
import { blogPostPath } from '../utils/slugify';

const BLOG_IMAGES = [
  'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/264537/pexels-photo-264537.jpeg?auto=compress&cs=tinysrgb&w=600',
];

function formatPostDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

export default function Home() {
  const { t } = useTranslation();
  const [latestPosts, setLatestPosts] = useState<{ id: number; title: string; excerpt: string; date: string; image: string }[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const lang = (i18n.language?.split('-')[0] || 'uz') as 'uz' | 'ru' | 'en';

  useEffect(() => {
    getPosts()
      .then((data) => {
        const display = data.slice(0, 3).map((p: BlogPost) => ({
          id: p.id,
          title: p.title[lang],
          excerpt: (p.excerpt[lang] || '').replace(/<[^>]*>/g, '').slice(0, 160),
          date: p.date || p.created_at || '',
          image: p.image || BLOG_IMAGES[(p.id - 1) % BLOG_IMAGES.length],
        }));
        setLatestPosts(display);
      })
      .catch(() => setLatestPosts([]))
      .finally(() => setPostsLoading(false));
  }, [lang]);
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const stagger = {
    whileInView: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const partners = [
    { src: '/partners/agro505.png', alt: 'Oltiariq agro 505' },
    { src: '/partners/eximagro.png', alt: 'EXIM AGRO' },
    { src: '/partners/havvogroup.png', alt: 'HAVVO GROUP' },
    { src: '/partners/agropark-fergana.png', alt: 'Агропарк Фергана' },
    { src: '/partners/uzbagro.png', alt: 'UZBAGRO' },
    { src: '/partners/fruitvoyage.png', alt: 'Fruit Voyage' },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section — mobilda pastroq (LCP tezroq), srcset orqali kichik rasm */}
      <section className="relative h-[400px] md:h-[600px] flex items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0 z-0 bg-slate-800">
          <img 
            src="https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=1920" 
            srcSet="https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=640 640w, https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=1024 1024w, https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=1920 1920w"
            sizes="100vw"
            alt="Meva va sabzavotlar eksporti" 
            width={1920}
            height={1080}
            fetchPriority="high"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        {/* Ustki qorong‘u qatlam (matn o‘qilishi uchun) */}
        <div className="absolute inset-0 z-[1] bg-slate-900/70" aria-hidden="true" />

        <div className="container mx-auto px-4 z-10 relative text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-3xl md:text-6xl font-bold mb-4 md:mb-6 leading-tight max-w-4xl mx-auto"
          >
            {t('home.hero.title')}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="text-base md:text-xl text-slate-200 mb-8 md:mb-10 max-w-2xl mx-auto"
          >
            {t('home.hero.subtitle')}
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link 
              to="/contact" 
              className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-3 px-8 rounded-sm uppercase tracking-wide transition-colors"
            >
              {t('home.hero.consultation')}
            </Link>
            <Link 
              to="/services" 
              className="bg-transparent border-2 border-white hover:bg-white hover:text-slate-900 text-white font-bold py-3 px-8 rounded-sm uppercase tracking-wide transition-colors"
            >
              {t('home.hero.services')}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white" aria-labelledby="features-heading">
        <div className="container mx-auto px-4">
          <h2 id="features-heading" className="sr-only">{t('home.features.title')}</h2>
          <motion.div 
            variants={stagger}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            <motion.div variants={fadeInUp} className="flex flex-col items-center text-center p-6 border border-slate-100 shadow-lg hover:shadow-xl transition-shadow rounded-sm bg-white">
              <div className="w-16 h-16 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center mb-6">
                <Clock size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t('home.features.fast.title')}</h3>
              <p className="text-slate-600">{t('home.features.fast.desc')}</p>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex flex-col items-center text-center p-6 border border-slate-100 shadow-lg hover:shadow-xl transition-shadow rounded-sm bg-white">
              <div className="w-16 h-16 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center mb-6">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t('home.features.legal.title')}</h3>
              <p className="text-slate-600">{t('home.features.legal.desc')}</p>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex flex-col items-center text-center p-6 border border-slate-100 shadow-lg hover:shadow-xl transition-shadow rounded-sm bg-white">
              <div className="w-16 h-16 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center mb-6">
                <Users size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t('home.features.team.title')}</h3>
              <p className="text-slate-600">{t('home.features.team.desc')}</p>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex flex-col items-center text-center p-6 border border-slate-100 shadow-lg hover:shadow-xl transition-shadow rounded-sm bg-white">
              <div className="w-16 h-16 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center mb-6">
                <Globe size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t('home.features.global.title')}</h3>
              <p className="text-slate-600">{t('home.features.global.desc')}</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 uppercase">{t('home.services.title')}</h2>
            <div className="w-20 h-1 bg-yellow-500 mx-auto"></div>
            <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
              {t('home.services.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 shadow-sm hover:shadow-md transition-shadow border-t-4 border-yellow-500">
              <FileText size={48} className="text-slate-900 mb-6" />
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{t('home.services.export.title')}</h3>
              <p className="text-slate-600 mb-6">
                {t('home.services.export.desc')}
              </p>
              <Link to="/services" className="text-blue-900 font-bold hover:text-yellow-600 flex items-center gap-2">
                {t('home.services.more')} <ArrowRight size={16} />
              </Link>
            </div>

            <div className="bg-white p-8 shadow-sm hover:shadow-md transition-shadow border-t-4 border-slate-900">
              <Truck size={48} className="text-slate-900 mb-6" />
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{t('home.services.import.title')}</h3>
              <p className="text-slate-600 mb-6">
                {t('home.services.import.desc')}
              </p>
              <Link to="/services" className="text-blue-900 font-bold hover:text-yellow-600 flex items-center gap-2">
                {t('home.services.more')} <ArrowRight size={16} />
              </Link>
            </div>

            <div className="bg-white p-8 shadow-sm hover:shadow-md transition-shadow border-t-4 border-yellow-500">
              <CheckCircle size={48} className="text-slate-900 mb-6" />
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{t('home.services.certification.title')}</h3>
              <p className="text-slate-600 mb-6">
                {t('home.services.certification.desc')}
              </p>
              <Link to="/services" className="text-blue-900 font-bold hover:text-yellow-600 flex items-center gap-2">
                {t('home.services.more')} <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link to="/services" className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-sm transition-colors">
              {t('home.services.viewAll')}
            </Link>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 uppercase">{t('home.partners.title')}</h2>
            <div className="w-20 h-1 bg-yellow-500 mx-auto mb-4"></div>
            <p className="text-slate-600">{t('home.partners.subtitle')}</p>
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center"
          >
            {partners.map((partner, i) => (
              <div 
                key={i} 
                className="w-full max-w-[160px] h-20 flex items-center justify-center p-4 grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all duration-300"
              >
                <picture>
                  <source type="image/webp" srcSet={partner.src.replace(/\.png$/i, '.webp')} />
                  <img 
                    src={partner.src} 
                    alt={partner.alt} 
                    width={160}
                    height={80}
                    className="max-h-full max-w-full w-auto h-auto object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
           {/* Abstract shape or pattern could go here */}
           <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path fill="#FFD700" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,79.6,-46.9C87.4,-34.7,90.1,-20.4,85.8,-7.1C81.5,6.2,70.2,18.5,60.6,29.6C51,40.7,43.1,50.6,33.4,58.3C23.7,66,12.2,71.5,0.4,70.8C-11.4,70.1,-22.4,63.2,-33.3,55.8C-44.2,48.4,-55,40.5,-63.1,30.3C-71.2,20.1,-76.6,7.6,-76.5,-5.2C-76.4,-18,-70.8,-31.1,-61.6,-41.8C-52.4,-52.5,-39.6,-60.8,-26.6,-68.6C-13.6,-76.4,-0.4,-83.7,13.2,-84.6C26.8,-85.5,41,-80,44.7,-76.4Z" transform="translate(100 100)" />
            </svg>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="md:w-2/3">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('home.cta.title')}</h2>
              <p className="text-slate-300 text-lg mb-0">
                {t('home.cta.desc')}
              </p>
            </div>
            <div className="md:w-1/3 text-center md:text-right">
              <Link to="/contact" className="inline-block bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-4 px-10 rounded-sm text-lg transition-colors shadow-lg">
                {t('home.cta.btn')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Blog Posts */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 uppercase">{t('home.blog.title')}</h2>
              <div className="w-20 h-1 bg-yellow-500 mt-4"></div>
            </div>
            <Link to="/blog" className="hidden md:flex items-center gap-2 text-blue-900 font-bold hover:text-yellow-600 transition-colors">
              {t('home.blog.readAll')} <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {postsLoading ? (
              <div className="col-span-full text-center py-12 text-slate-500">{t('home.blog.loading') || 'Yuklanmoqda...'}</div>
            ) : latestPosts.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-500">{t('home.blog.noPosts') || 'Hozircha maqolalar yo\'q.'}</div>
            ) : (
              latestPosts.map((post) => (
                <Link key={post.id} to={blogPostPath(post.id, post.title)} className="group block cursor-pointer">
                  <div className="h-48 overflow-hidden rounded-sm mb-4">
                    <img
                      src={post.image}
                      alt={post.title}
                      width={600}
                      height={288}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="text-xs text-slate-500 font-bold mb-2 uppercase">{formatPostDate(post.date)}</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-900 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-slate-600 text-sm line-clamp-3">
                    {post.excerpt}
                  </p>
                </Link>
              ))
            )}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link to="/blog" className="text-blue-900 font-bold hover:text-yellow-600 flex items-center justify-center gap-2">
              {t('home.blog.readAll')} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
