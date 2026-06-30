import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle, Globe, ShieldCheck, ArrowRight, FileText, Truck,
  Users, Award, FileCheck, Phone, MousePointerClick, BarChart
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { getPosts, type BlogPost } from '../api';
import { blogPostPath } from '../utils/slugify';
import { fallbackBlogImage } from '../utils/blogImages';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { Pause, Play } from 'lucide-react';

const HERO_SLIDES = [
  { id: '1132047', alt: 'Sifatli meva va sabzavotlar eksporti' },
  { id: '1367243', alt: 'Qishloq xo\'jaligi mahsulotlari hosili' },
  { id: '109274', alt: 'Eksportbop sifatli giloslar' },
];

// Local rasmni berilgan kenglikka moslash + responsive srcset (mobilga kichik fayl)
const localAt = (id: string, w: number, ext = 'jpg') => `/images/p${id}-${w}.${ext}`;
const localSrcSet = (id: string, ext = 'jpg') =>
  [640, 1280, 1920].map((w) => `${localAt(id, w, ext)} ${w}w`).join(', ');

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
  const reducedMotion = usePrefersReducedMotion();
  // Foydalanuvchi avtomatik aylanishni to'xtatib qo'ya oladi (WCAG 2.2.2 — Pause/Stop).
  // Kamaytirilgan animatsiya yoqilgan bo'lsa, boshidan pauza qilingan.
  const [heroPaused, setHeroPaused] = useState(false);
  const heroAutoplay = !reducedMotion && !heroPaused;

  const lang = (i18n.language?.split('-')[0] || 'uz') as 'uz' | 'ru' | 'en';

  useEffect(() => {
    if (!heroAutoplay) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000); // 6 seconds per slide
    return () => clearInterval(timer);
  }, [heroAutoplay]);

  useEffect(() => {
    getPosts()
      .then((data) => {
        const display = data.slice(0, 3).map((p: BlogPost) => ({
          id: p.id,
          title: p.title[lang],
          excerpt: (p.excerpt[lang] || '').replace(/<[^>]*>/g, '').slice(0, 160),
          date: p.date || p.created_at || '',
          image: p.image || fallbackBlogImage(p.id),
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
      <section className="relative h-[650px] md:h-[80vh] flex items-center justify-center text-white overflow-hidden bg-slate-900 border-b-4 border-brand">
        <AnimatePresence initial={false}>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
            className="absolute inset-0 z-0 w-full h-full"
          >
            <picture>
              <source
                type="image/webp"
                srcSet={localSrcSet(HERO_SLIDES[currentSlide].id, 'webp')}
                sizes="100vw"
              />
              <img
                src={localAt(HERO_SLIDES[currentSlide].id, 1280)}
                srcSet={localSrcSet(HERO_SLIDES[currentSlide].id)}
                sizes="100vw"
                alt={HERO_SLIDES[currentSlide].alt}
                fetchPriority={currentSlide === 0 ? 'high' : 'low'}
                loading="eager"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            </picture>
          </motion.div>
        </AnimatePresence>

        {/* Multi-layered Premium Gradient */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-brand-dark via-brand-dark/60 to-transparent" aria-hidden="true" />
        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-brand-dark/90 via-transparent to-brand-dark/90" aria-hidden="true" />

        <div className="container mx-auto px-4 z-10 relative text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-black tracking-widest text-xs md:text-sm mb-8 uppercase shadow-2xl"
          >
            <Globe className="text-accent h-4 w-4" /> {t('home.hero.badge')}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight max-w-5xl mx-auto tracking-tight drop-shadow-2xl"
          >
            {t('home.hero.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-2xl text-slate-200 mb-10 max-w-3xl mx-auto font-medium"
          >
            {t('home.hero.subtitle')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row justify-center gap-5"
          >
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event('openContactModal'))}
              className="group bg-accent hover:bg-accent-light text-brand-dark font-black py-4 px-6 sm:px-10 rounded-xl uppercase tracking-wide sm:tracking-widest transition-all shadow-[0_0_30px_rgba(232,168,56,0.3)] hover:shadow-[0_0_40px_rgba(232,168,56,0.5)] hover:-translate-y-1 w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm"
            >
              {t('home.hero.consultation')}
            </button>
            <Link
              to="/services"
              className="group bg-white/10 backdrop-blur-sm border border-white/30 hover:bg-white hover:text-brand-dark text-white font-black py-4 px-6 sm:px-10 rounded-xl uppercase tracking-wide sm:tracking-widest transition-all w-full sm:w-auto inline-flex items-center justify-center gap-2 hover:-translate-y-1 text-sm"
            >
              {t('home.hero.services')}
            </Link>
          </motion.div>
        </div>

        {/* Hero slayd boshqaruvi — barcha foydalanuvchilar avtomatik aylanishni
            boshqara oladi (a11y: WCAG 2.2.2). */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
          <div className="flex items-center gap-2" role="tablist" aria-label={t('home.hero.badge')}>
            {HERO_SLIDES.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={currentSlide === i}
                aria-label={slide.alt}
                onClick={() => setCurrentSlide(i)}
                className={`h-2 rounded-full transition-all duration-300 ${currentSlide === i ? 'w-8 bg-accent' : 'w-2 bg-white/50 hover:bg-white/80'}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setHeroPaused((p) => !p)}
            aria-pressed={heroPaused}
            aria-label={heroPaused ? t('home.hero.play') : t('home.hero.pause')}
            className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            {heroPaused ? <Play size={14} /> : <Pause size={14} />}
          </button>
        </div>
      </section>

      {/* Carousel Features Section */}
      <section className="py-16 md:py-24 bg-slate-50 relative -mt-10 z-20" aria-labelledby="features-heading">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 id="features-heading" className="sr-only">{t('home.features.title')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Globe, titleKey: 'home.features.global.title', descKey: 'home.features.global.desc' },
              { icon: ShieldCheck, titleKey: 'home.features.legal.title', descKey: 'home.features.legal.desc' },
              { icon: Users, titleKey: 'home.features.team.title', descKey: 'home.features.team.desc' },
              { icon: BarChart, titleKey: 'home.features.fast.title', descKey: 'home.features.fast.desc' },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-100 transition-all duration-300 h-full group flex flex-col items-center text-center transform hover:-translate-y-2">
                <div className="w-20 h-20 bg-brand/5 group-hover:bg-brand text-brand group-hover:text-white rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 shadow-sm group-hover:shadow-[0_10px_20px_rgba(0,54,102,0.2)] rotate-3 group-hover:-rotate-3">
                  <f.icon size={36} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-3 group-hover:text-brand transition-colors">{t(f.titleKey)}</h3>
                <p className="text-slate-500 font-medium leading-relaxed text-sm">{t(f.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ish faoliyatimiz raqamlarda */}
      <section className="py-20 md:py-24 bg-brand-dark text-white relative overflow-hidden shadow-2xl" aria-labelledby="stats-heading">
        {/* Clean Modern Background Elements for Stats with Brand Logo */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 skew-x-12 translate-x-32" />
          <div className="absolute top-0 left-0 w-1/3 h-full bg-white/5 -skew-x-12 -translate-x-32" />
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
              { label: t('home.stats.countries'), value: '30+', icon: Globe },
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
              <Link to="/services" className="text-brand font-bold hover:text-accent-dark flex items-center gap-2">
                {t('home.services.more')} <ArrowRight size={16} />
              </Link>
            </div>

            <div className="bg-white p-8 shadow-sm hover:shadow-md transition-shadow border-t-4 border-brand">
              <Truck size={48} className="text-slate-900 mb-6" />
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{t('home.services.import.title')}</h3>
              <p className="text-slate-600 mb-6">
                {t('home.services.import.desc')}
              </p>
              <Link to="/services" className="text-brand font-bold hover:text-accent-dark flex items-center gap-2">
                {t('home.services.more')} <ArrowRight size={16} />
              </Link>
            </div>

            <div className="bg-white p-8 shadow-sm hover:shadow-md transition-shadow border-t-4 border-accent">
              <CheckCircle size={48} className="text-slate-900 mb-6" />
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{t('home.services.certification.title')}</h3>
              <p className="text-slate-600 mb-6">
                {t('home.services.certification.desc')}
              </p>
              <Link to="/services" className="text-brand font-bold hover:text-accent-dark flex items-center gap-2">
                {t('home.services.more')} <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link to="/services" className="inline-block bg-brand-dark hover:bg-brand text-white font-bold py-3 px-8 rounded-xl transition-colors">
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
                        <span className="text-xs font-bold uppercase tracking-wider bg-accent text-brand-dark px-2.5 py-1 rounded-full">
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
                          <span className={`text-sm leading-relaxed ${isVip ? 'text-slate-300' : 'text-slate-600'} ${isBonus ? (isVip ? 'font-semibold text-accent' : 'font-semibold text-accent-dark') : ''}`}>
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
            {partners.map((partner, i) => {
              const webpSrc = partner.src.replace(/\.png$/, '.webp');
              return (
                <div
                  key={i}
                  className="w-full max-w-[160px] h-20 flex items-center justify-center p-4 grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all duration-300"
                >
                  <picture>
                    <source srcSet={webpSrc} type="image/webp" />
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
              );
            })}
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
              <button type="button" onClick={() => window.dispatchEvent(new Event('openContactModal'))} className="group inline-flex items-center justify-center gap-3 bg-accent hover:bg-accent-light text-brand-dark font-bold py-4 px-10 rounded-xl text-lg transition-all duration-300 shadow-[0_0_20px_rgba(232,168,56,0.3)] hover:shadow-[0_0_35px_rgba(232,168,56,0.6)] hover:-translate-y-1 active:translate-y-0">
                <span>{t('home.cta.btn')}</span>
                <Phone size={20} className="transition-transform duration-300 group-hover:rotate-12" />
              </button>
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
            <Link to="/blog" className="hidden md:flex items-center gap-2 text-brand font-bold hover:text-accent-dark transition-colors">
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
            <Link to="/blog" className="text-brand font-bold hover:text-accent-dark flex items-center justify-center gap-2">
              {t('home.blog.readAll')} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
