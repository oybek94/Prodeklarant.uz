import { useParams, Link } from 'react-router';
import { motion } from 'motion/react';
import { CheckCircle2, ChevronRight, Package, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocalePath, withLocale, type Locale } from '../utils/locale';
import { findServicePage } from '../utils/services';
import { SITE_URL } from '../utils/site';
import { openContactModal } from '../utils/contactModal';
import { JsonLd } from '../components/JsonLd';
import NotFound from './NotFound';

/**
 * Alohida xizmat sahifasi: /services/:slug (src/content/services.json).
 * Sarlavha, tavsif va tarkib — mavjud services.items.<itemKey> matnlari; qo'shimcha matn
 * servicePages.<slug>.body dan (bo'lmasa "TODO: mijozdan matn" ko'rsatiladi).
 */
export default function ServicePage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const lp = useLocalePath();
  const page = findServicePage(slug);
  if (!page) return <NotFound />;

  const lang = (i18n.language?.split('-')[0] || 'uz') as Locale;
  const base = `services.items.${page.itemKey}`;
  const title = t(`${base}.title`);
  const description = t(`${base}.desc`);
  const featuresRaw = t(`${base}.features`, { returnObjects: true });
  const features = Array.isArray(featuresRaw) ? (featuresRaw as string[]) : [];
  const bodyKey = `servicePages.${page.slug}.body`;
  const bodyRaw = i18n.exists(bodyKey) ? t(bodyKey, { returnObjects: true }) : null;
  const body = Array.isArray(bodyRaw) ? (bodyRaw as string[]).filter(Boolean) : [];

  const url = `${SITE_URL}${withLocale(`/services/${page.slug}`, lang)}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${url}#service`,
    name: title,
    serviceType: title,
    description,
    url,
    inLanguage: lang,
    provider: { '@id': `${SITE_URL}/#organization` },
    areaServed: { '@type': 'Country', name: 'Uzbekistan' },
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <JsonLd id="json-ld-service" data={jsonLd} />

      {/* Hero — Xizmatlar sahifasi uslubida */}
      <section className="relative z-10 text-white min-h-[40vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <picture>
            <source
              type="image/webp"
              srcSet="/images/p4483610-640.webp 640w, /images/p4483610-1280.webp 1280w, /images/p4483610-1920.webp 1920w"
              sizes="100vw"
            />
            <img
              src="/images/p4483610-1280.jpg"
              srcSet="/images/p4483610-640.jpg 640w, /images/p4483610-1280.jpg 1280w, /images/p4483610-1920.jpg 1920w"
              alt=""
              aria-hidden="true"
              sizes="100vw"
              width={1920}
              height={1080}
              className="w-full h-full object-cover"
              loading="eager"
              decoding="async"
            />
          </picture>
        </div>
        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-brand-dark/95 via-brand-dark/85 to-brand-dark/40" aria-hidden="true" />

        <div className="container mx-auto px-4 relative z-10 py-16 mt-6">
          <nav aria-label="breadcrumb" className="text-sm text-slate-300 mb-6 flex items-center gap-2 flex-wrap">
            <Link to={lp('/')} className="hover:text-white">{t('layout.nav.home')}</Link>
            <ChevronRight size={14} aria-hidden />
            <Link to={lp('/services')} className="hover:text-white">{t('layout.nav.services')}</Link>
          </nav>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-brand-dark font-black tracking-widest text-sm mb-6 uppercase shadow-lg">
              <Package size={16} /> Prodeklarant
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight drop-shadow-md leading-tight">{title}</h1>
            <p className="text-lg md:text-xl text-slate-200 font-medium leading-relaxed max-w-2xl border-l-4 border-accent pl-5">
              {description}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-4 max-w-6xl mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl p-8 lg:p-10 border border-slate-100 shadow-sm">
            {body.length > 0 ? (
              <div className="space-y-4 text-slate-700 leading-relaxed">
                {body.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            ) : (
              <p className="border-2 border-dashed border-amber-400 bg-amber-50 text-amber-800 rounded-xl p-6 font-semibold">
                {t('servicePages.todo')}
              </p>
            )}
          </div>

          <aside className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm h-fit">
            <h2 className="text-lg font-extrabold text-slate-900 uppercase tracking-wide mb-6">{t('servicePages.featuresTitle')}</h2>
            <ul className="space-y-4 mb-8">
              {features.map((f, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="bg-accent/10 rounded-full p-1 mt-0.5 flex-shrink-0 text-accent-dark">
                    <CheckCircle2 size={14} strokeWidth={3} />
                  </span>
                  <span className="text-sm text-slate-700 font-semibold leading-snug">{f}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => openContactModal()}
              className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-light text-brand-dark font-bold py-3.5 px-6 rounded-xl uppercase tracking-wider text-sm transition-colors"
            >
              <Phone size={16} /> {t('home.hero.consultation')}
            </button>
            <Link to={lp('/services')} className="mt-4 flex items-center justify-center gap-1 text-sm font-bold text-brand hover:text-accent-dark">
              {t('home.services.viewAll')} <ChevronRight size={16} />
            </Link>
          </aside>
        </div>
      </section>
    </div>
  );
}
