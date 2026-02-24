import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Clock, Globe, ShieldCheck, ArrowRight, FileText, Truck, Users, Award, FileCheck, Phone, X, MousePointerClick } from 'lucide-react';
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
  const [showPhoneModal, setShowPhoneModal] = useState(false);
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
        <div className="absolute inset-0 z-0 bg-brand-dark">
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
        <div className="absolute inset-0 z-[1] bg-black/70" aria-hidden="true" />

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
              className="bg-accent hover:bg-accent-light text-brand-dark font-bold py-3 px-8 rounded-sm uppercase tracking-wide transition-colors"
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
              <div className="w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center mb-6">
                <Clock size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t('home.features.fast.title')}</h3>
              <p className="text-slate-600">{t('home.features.fast.desc')}</p>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex flex-col items-center text-center p-6 border border-slate-100 shadow-lg hover:shadow-xl transition-shadow rounded-sm bg-white">
              <div className="w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center mb-6">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t('home.features.legal.title')}</h3>
              <p className="text-slate-600">{t('home.features.legal.desc')}</p>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex flex-col items-center text-center p-6 border border-slate-100 shadow-lg hover:shadow-xl transition-shadow rounded-sm bg-white">
              <div className="w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center mb-6">
                <Users size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t('home.features.team.title')}</h3>
              <p className="text-slate-600">{t('home.features.team.desc')}</p>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex flex-col items-center text-center p-6 border border-slate-100 shadow-lg hover:shadow-xl transition-shadow rounded-sm bg-white">
              <div className="w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center mb-6">
                <Globe size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t('home.features.global.title')}</h3>
              <p className="text-slate-600">{t('home.features.global.desc')}</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Ish faoliyatimiz raqamlarda */}
      <section className="py-16 md:py-20 bg-brand-dark text-white" aria-labelledby="stats-heading">
        <div className="container mx-auto px-4">
          <h2 id="stats-heading" className="text-2xl md:text-3xl font-bold text-center mb-12 uppercase tracking-wide">
            {t('home.stats.title')}
          </h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
          >
            {[
              { label: t('home.stats.experience'), value: '10+', icon: Award },
              { label: t('home.stats.clients'), value: '100+', icon: Users },
              { label: t('home.stats.cargo'), value: '15k+', icon: FileCheck },
              { label: t('home.stats.countries'), value: '15+', icon: Globe },
            ].map((item, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center p-6 rounded-sm bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <item.icon size={32} className="text-accent mb-4" aria-hidden />
                <span className="text-3xl md:text-4xl font-bold text-white mb-1">{item.value}</span>
                <span className="text-slate-300 text-sm uppercase tracking-wider">{item.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 uppercase">{t('home.services.title')}</h2>
            <div className="w-20 h-1 bg-accent mx-auto"></div>
            <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
              {t('home.services.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 shadow-sm hover:shadow-md transition-shadow border-t-4 border-accent">
              <FileText size={48} className="text-slate-900 mb-6" />
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{t('home.services.export.title')}</h3>
              <p className="text-slate-600 mb-6">
                {t('home.services.export.desc')}
              </p>
              <Link to="/services" className="text-brand font-bold hover:text-accent-light flex items-center gap-2">
                {t('home.services.more')} <ArrowRight size={16} />
              </Link>
            </div>

            <div className="bg-white p-8 shadow-sm hover:shadow-md transition-shadow border-t-4 border-brand">
              <Truck size={48} className="text-slate-900 mb-6" />
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{t('home.services.import.title')}</h3>
              <p className="text-slate-600 mb-6">
                {t('home.services.import.desc')}
              </p>
              <Link to="/services" className="text-brand font-bold hover:text-accent-light flex items-center gap-2">
                {t('home.services.more')} <ArrowRight size={16} />
              </Link>
            </div>

            <div className="bg-white p-8 shadow-sm hover:shadow-md transition-shadow border-t-4 border-accent">
              <CheckCircle size={48} className="text-slate-900 mb-6" />
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{t('home.services.certification.title')}</h3>
              <p className="text-slate-600 mb-6">
                {t('home.services.certification.desc')}
              </p>
              <Link to="/services" className="text-brand font-bold hover:text-accent-light flex items-center gap-2">
                {t('home.services.more')} <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link to="/services" className="inline-block bg-brand-dark hover:bg-brand text-white font-bold py-3 px-8 rounded-sm transition-colors">
              {t('home.services.viewAll')}
            </Link>
          </div>
        </div>
      </section>

      {/* Tariflar haqida ma'lumot */}
      <section className="py-20 md:py-24 bg-gradient-to-b from-slate-50 to-white" aria-labelledby="tariffs-heading">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 id="tariffs-heading" className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 tracking-tight">
              {t('home.tariffs.title')}
            </h2>
            <div className="w-16 h-1 bg-accent rounded-full mx-auto mb-4" />
            <p className="text-slate-600 text-lg">
              {t('home.tariffs.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6 max-w-6xl mx-auto">
            {(['start', 'optimal', 'vip'] as const).map((key, idx) => {
              const tariff = t(`home.tariffs.${key}`, { returnObjects: true }) as { name: string; features: string[] };
              const features = Array.isArray(tariff?.features) ? tariff.features : [];
              const isRecommended = key === 'optimal';
              const isVip = key === 'vip';
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -6, transition: { duration: 0.05 } }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className={`relative flex flex-col rounded-2xl overflow-hidden shadow-lg transition-all duration-150 hover:shadow-2xl hover:ring-2 hover:ring-brand/20 ${
                    isRecommended ? 'ring-2 ring-accent ring-offset-4 ring-offset-slate-50 lg:-mt-2 lg:mb-2 lg:scale-[1.02]' : ''
                  } ${isVip ? 'bg-slate-900 text-white' : 'bg-white border border-slate-100 hover:border-brand/30'}`}
                >
                  <div className={`px-8 pt-6 pb-5 ${isVip ? 'bg-slate-800/50' : key === 'optimal' ? 'bg-brand/10' : 'bg-slate-100'}`}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`text-2xl font-bold tracking-tight ${isVip ? 'text-white' : 'text-slate-900'}`}>
                        {tariff?.name || key}
                      </h3>
                      {isRecommended && (
                        <span className="text-xs font-bold uppercase tracking-wider text-accent">
                          {t('home.tariffs.recommended')}
                        </span>
                      )}
                    </div>
                  </div>
                  <ul className="flex-1 px-8 py-6 space-y-4">
                    {features.map((item, i) => {
                      const isBonus = item.toLowerCase().startsWith('bonus');
                      return (
                        <li key={i} className="flex items-start gap-3">
                          <span className={`flex-shrink-0 mt-1 w-5 h-5 rounded-full flex items-center justify-center ${isVip ? 'bg-accent/20 text-accent' : 'bg-brand/10 text-brand'}`}>
                            <CheckCircle size={14} strokeWidth={2.5} aria-hidden />
                          </span>
                          <span className={`text-sm leading-relaxed ${isVip ? 'text-slate-300' : 'text-slate-600'} ${isBonus ? 'font-semibold text-accent' : ''}`}>
                            {item}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="p-8 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowPhoneModal(true)}
                      className={`group w-full font-bold py-4 px-6 rounded-xl uppercase tracking-wider text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                        isVip
                          ? 'bg-accent hover:bg-accent-light text-brand-dark hover:scale-[1.02] active:scale-[0.98]'
                          : isRecommended
                            ? 'bg-brand hover:bg-brand-light text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                            : 'bg-slate-900 hover:bg-slate-800 text-white hover:scale-[1.02] active:scale-[0.98]'
                      }`}
                    >
                      <MousePointerClick size={18} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" aria-hidden />
                      {t('home.tariffs.askPrice')}
                      <Phone size={18} className="opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" aria-hidden />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Phone modal */}
      <AnimatePresence>
        {showPhoneModal && (
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
            onClick={() => setShowPhoneModal(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="phone-modal-title"
          >
            <motion.div
              key="modal-content"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-8 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowPhoneModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full transition-colors hover:bg-slate-100"
                  aria-label={t('home.tariffs.close')}
                >
                  <X size={24} />
                </button>
              </div>
              <h3 id="phone-modal-title" className="text-2xl font-bold text-slate-900 mb-2">
                {t('home.tariffs.modalTitle')}
              </h3>
              <p className="text-slate-600 mb-6">{t('home.tariffs.modalDesc')}</p>
              <a
                href="tel:+998911187007"
                className="inline-flex items-center justify-center gap-3 bg-accent hover:bg-accent-light text-brand-dark font-bold py-4 px-8 rounded-xl text-lg transition-colors hover:scale-105 active:scale-100"
              >
                <Phone size={24} />
                +998 91 118 70 07
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Partners Section */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 uppercase">{t('home.partners.title')}</h2>
            <div className="w-20 h-1 bg-accent mx-auto mb-4"></div>
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
      <section className="py-20 bg-brand-dark text-white relative overflow-hidden">
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
              <Link to="/contact" className="inline-block bg-accent hover:bg-accent-light text-brand-dark font-bold py-4 px-10 rounded-sm text-lg transition-colors shadow-lg">
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
              <div className="w-20 h-1 bg-accent mt-4"></div>
            </div>
            <Link to="/blog" className="hidden md:flex items-center gap-2 text-brand font-bold hover:text-accent-light transition-colors">
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
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-brand transition-colors">
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
            <Link to="/blog" className="text-brand font-bold hover:text-accent-light flex items-center justify-center gap-2">
              {t('home.blog.readAll')} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
