import { useEffect } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Home, ArrowRight, FileQuestion } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocalePath } from '../utils/locale';

export default function NotFound() {
  const { t } = useTranslation();
  const lp = useLocalePath();

  useEffect(() => {
    document.title = t('seo.notFound.title');
    const desc = t('seo.notFound.description');
    let el = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (el) el.setAttribute('content', desc);
    else {
      el = document.createElement('meta');
      el.name = 'description';
      el.content = desc;
      document.head.appendChild(el);
    }
    // 404 sahifasi indekslanmasligi kerak (soft 404'ni oldini olish)
    let robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    const prev = robots?.getAttribute('content') ?? null;
    if (!robots) {
      robots = document.createElement('meta');
      robots.name = 'robots';
      document.head.appendChild(robots);
    }
    robots.setAttribute('content', 'noindex, follow');
    return () => {
      // Boshqa sahifaga o'tilganda indekslashni tiklaymiz
      if (robots) robots.setAttribute('content', prev ?? 'index, follow');
    };
  }, [t]);

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <div className="flex-grow flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-xl"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="relative bg-gradient-to-br from-brand-dark via-brand to-brand-dark px-8 py-12 text-center">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(250,204,21,0.15),transparent)]" aria-hidden="true" />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="relative z-10"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 text-yellow-400 mb-6">
                  <FileQuestion size={40} strokeWidth={1.5} />
                </div>
                <p className="text-6xl md:text-7xl font-black text-white tracking-tighter tabular-nums">404</p>
                <p className="text-slate-300 font-semibold uppercase tracking-widest text-sm mt-2">{t('notFound.oops')}</p>
              </motion.div>
            </div>
            <div className="px-8 py-10 text-center">
              <h1 className="text-2xl font-bold text-slate-900 mb-3">{t('notFound.title')}</h1>
              <p className="text-slate-600 mb-8 max-w-sm mx-auto">{t('notFound.message')}</p>
              <Link
                to={lp('/')}
                className="inline-flex items-center justify-center gap-2 bg-brand-dark text-white font-bold uppercase tracking-wide px-8 py-4 rounded-xl hover:bg-brand hover:text-accent-light transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
              >
                <Home size={20} />
                {t('notFound.backHome')}
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
          <p className="text-center text-slate-500 text-sm mt-8">
            <Link to={lp('/contact')} className="underline hover:text-brand">{t('notFound.needHelp')}</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
