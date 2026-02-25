import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Clock, Globe, ShieldCheck, ArrowRight, FileText, Truck, Users, Award, FileCheck, Phone, X, MousePointerClick, Ship, Plane, Package, Leaf } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { getPosts, type BlogPost } from '../api';
import { blogPostPath } from '../utils/slugify';

const BLOG_IMAGES = [
  'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/264537/pexels-photo-264537.jpeg?auto=compress&cs=tinysrgb&w=600',
];

const HERO_SLIDES = [
  {
    image: 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=1920',
    alt: 'Sifatli meva va sabzavotlar eksporti'
  },
  {
    image: 'https://images.pexels.com/photos/1367243/pexels-photo-1367243.jpeg?auto=compress&cs=tinysrgb&w=1920',
    alt: 'Qishloq xo\'jaligi mahsulotlari hosili'
  },
  {
    image: 'https://images.pexels.com/photos/109274/pexels-photo-109274.jpeg?auto=compress&cs=tinysrgb&w=1920',
    alt: 'Eksportbop sifatli giloslar'
  }
];

function formatPostDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year} `;
}

export default function Home() {
  const { t } = useTranslation();
  const [latestPosts, setLatestPosts] = useState<{ id: number; title: string; excerpt: string; date: string; image: string }[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  const [currentSlide, setCurrentSlide] = useState(0);

  const lang = (i18n.language?.split('-')[0] || 'uz') as 'uz' | 'ru' | 'en';

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000); // 6 seconds per slide
    return () => clearInterval(timer);
  }, []);

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
      {/* Hero Section */}
      <section className="relative h-[400px] md:h-[600px] flex items-center justify-center text-white overflow-hidden bg-slate-900 border-b-4 border-accent">

        {/* Cinematic Slider Background */}
        <AnimatePresence initial={false}>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 z-0 w-full h-full"
          >
            <div
              className="absolute inset-0 bg-cover bg-center w-full h-full"
              style={{ backgroundImage: `url(${HERO_SLIDES[currentSlide].image})` }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Premium Dark Gradient Overlay */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#001226]/90 via-[#001226]/50 to-black/20" aria-hidden="true" />

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
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event('openContactModal')); }}
              className="bg-accent hover:bg-accent-light text-brand-dark font-bold py-3 px-8 rounded-sm uppercase tracking-wide transition-all shadow-[0_0_15px_rgba(232,168,56,0.4)] hover:shadow-[0_0_25px_rgba(232,168,56,0.8)] hover:-translate-y-1 block sm:inline-block text-center"
            >
              {t('home.hero.consultation')}
            </a>
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
      <section className="py-20 md:py-24 bg-brand-dark text-white relative overflow-hidden shadow-2xl" aria-labelledby="stats-heading">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)]"></div>

          {/* Animated blurred shapes */}
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.05, 0.2, 0.05],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-60 -left-60 w-[500px] h-[500px] bg-accent/30 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.05, 0.15, 0.05],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute -bottom-60 -right-60 w-[500px] h-[500px] bg-brand-light/30 rounded-full blur-[120px]"
          />

          {/* Floating Theme Icons in Stats Section */}
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 left-[10%] text-white/5"
            aria-hidden="true"
          >
            <Ship size={120} strokeWidth={1} />
          </motion.div>

          <motion.div
            animate={{ y: [0, 20, 0], rotate: [0, -15, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-10 right-[10%] text-white/5"
            aria-hidden="true"
          >
            <Plane size={150} strokeWidth={1} />
          </motion.div>

          <motion.div
            animate={{ y: [0, -15, 0], rotate: [0, 20, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute top-[10%] right-[30%] text-white/5"
            aria-hidden="true"
          >
            <Package size={80} strokeWidth={1} />
          </motion.div>

          <motion.div
            animate={{ y: [0, 15, 0], rotate: [0, -30, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="absolute bottom-[5%] left-[35%] text-white/5"
            aria-hidden="true"
          >
            <Leaf size={100} strokeWidth={1} />
          </motion.div>

          {/* Added Truck Icon */}
          <motion.div
            animate={{ y: [0, -25, 0], rotate: [0, 12, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[5%] right-[35%] text-white/5"
            aria-hidden="true"
          >
            <Truck size={130} strokeWidth={1} />
          </motion.div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 id="stats-heading" className="text-3xl md:text-5xl font-extrabold text-center mb-4 tracking-tight">
              {t('home.stats.title')}
            </h2>
            <div className="w-24 h-1 bg-accent rounded-full mx-auto mb-16" />
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.15
                }
              }
            }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto"
          >
            {[
              { label: t('home.stats.experience'), value: '10+', icon: Award },
              { label: t('home.stats.clients'), value: '100+', icon: Users },
              { label: t('home.stats.cargo'), value: '15k+', icon: FileCheck },
              { label: t('home.stats.countries'), value: '15+', icon: Globe },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 30, scale: 0.9 },
                  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100 } }
                }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group flex flex-col items-center text-center p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:bg-white/10 hover:border-white/20 hover:shadow-[0_8px_30px_rgba(232,168,56,0.15)] transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-300">
                  <item.icon size={32} className="text-accent drop-shadow-md" aria-hidden />
                </div>
                <span className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight group-hover:text-accent transition-colors">{item.value}</span>
                <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-slate-400 group-hover:text-slate-200 transition-colors w-full break-words">{item.label}</span>
              </motion.div>
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
      <section className="py-24 md:py-32 bg-slate-50 relative overflow-hidden shadow-inner" aria-labelledby="tariffs-heading">
        {/* Decorative background for Tariffs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand/5 rounded-full blur-[100px]"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[-10%] -left-[10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px]"
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[80px]"
          />
          {/* Subtle grid pattern for light theme */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_20%,transparent_100%)]"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16 md:mb-20"
          >
            <h2 id="tariffs-heading" className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight drop-shadow-sm">
              {t('home.tariffs.title')}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-brand to-accent rounded-full mx-auto mb-6" />
            <p className="text-slate-600 text-lg md:text-xl font-medium">
              {t('home.tariffs.subtitle')}
            </p>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-4 xl:gap-8 max-w-6xl mx-auto items-center">
            {(['start', 'optimal', 'vip'] as const).map((key, idx) => {
              const tariff = t(`home.tariffs.${key}`, { returnObjects: true }) as { name: string; features: string[] };
              const features = Array.isArray(tariff?.features) ? tariff.features : [];
              const isRecommended = key === 'optimal';
              const isVip = key === 'vip';
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -10, transition: { duration: 0.2 } }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.15 }}
                  className={`relative flex flex-col rounded-[2rem] overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl ring-1 ring-black/5 hover:ring-brand/30 ${isRecommended
                    ? 'ring-2 ring-accent ring-offset-4 ring-offset-slate-50 lg:-mt-8 lg:mb-8 lg:scale-[1.05] backdrop-blur-md bg-white z-10 shadow-[0_20px_40px_rgba(232,168,56,0.15)]'
                    : 'bg-white/90 backdrop-blur-sm shadow-[0_10px_30px_rgba(0,0,0,0.05)]'
                    } ${isVip ? 'bg-gradient-to-b from-slate-900 to-brand-dark text-white ring-0 shadow-[0_10px_30px_rgba(15,23,42,0.3)]' : ''}`}
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
                      onClick={() => window.dispatchEvent(new Event('openContactModal'))}
                      className={`group w-full font-bold py-4 px-6 rounded-xl uppercase tracking-wider text-sm transition-all duration-200 flex items-center justify-center gap-2 ${isVip
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
      <section className="py-24 bg-brand-dark text-white relative overflow-hidden shadow-2xl">

        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Radial Gradient overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_100%)]"></div>

          {/* Animated blurred shapes */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-40 -right-40 w-96 h-96 bg-accent/20 rounded-full blur-[100px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-light/30 rounded-full blur-[100px]"
          />

          {/* Floating Icons */}
          <motion.div
            animate={{ y: [0, -15, 0], rotate: [0, 8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 right-[15%] text-white/5"
            aria-hidden="true"
          >
            <Globe size={180} strokeWidth={1} />
          </motion.div>

          <motion.div
            animate={{ y: [0, 15, 0], rotate: [0, -8, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-10 left-[15%] text-white/5"
            aria-hidden="true"
          >
            <Truck size={140} strokeWidth={1} />
          </motion.div>

          <motion.div
            animate={{ y: [0, -10, 0], rotate: [0, 15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute top-[40%] left-[45%] text-white/5"
            aria-hidden="true"
          >
            <FileCheck size={80} strokeWidth={1} />
          </motion.div>

          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)]"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-2/3 text-center md:text-left">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight tracking-tight text-white drop-shadow-sm"
              >
                {t('home.cta.title')}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-slate-300 text-lg md:text-xl font-medium mb-0 max-w-2xl mx-auto md:mx-0"
              >
                {t('home.cta.desc')}
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="md:w-1/3 text-center md:text-right"
            >
              <a href="#" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event('openContactModal')); }} className="group inline-flex items-center justify-center gap-3 bg-accent hover:bg-accent-light text-brand-dark font-bold py-4 px-10 rounded-xl text-lg transition-all duration-300 shadow-[0_0_20px_rgba(232,168,56,0.3)] hover:shadow-[0_0_35px_rgba(232,168,56,0.6)] hover:-translate-y-1 active:translate-y-0">
                <span>{t('home.cta.btn')}</span>
                <Phone size={20} className="transition-transform duration-300 group-hover:rotate-12" />
              </a>
            </motion.div>
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
