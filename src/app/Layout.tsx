import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { Menu, X, Phone, MapPin, Send, MessageCircle, ArrowRight } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { usePageMeta } from './hooks/usePageMeta';
import { useLocalePath, localeFromPath, stripLocale, withLocale, type Locale } from './utils/locale';
import { SITE_URL } from './utils/site';
import { findServicePage, servicePath } from './utils/services';
import ContactModal from './components/ContactModal';
import { openContactModal } from './utils/contactModal';
import { JsonLd } from './components/JsonLd';

const LANGUAGES = [
  { code: 'uz', label: 'O\'zbek' },
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
] as const;

// Eslatma: sayt barcha tillarda bir xil URL'dan xizmat qiladi (til JS orqali almashadi),
// shu sabab har xil tilga alohida URL bo'lmagani uchun hreflang qo'llanilmaydi —
// aks holda Google buni xato deb belgilaydi. Til bo'yicha SEO kerak bo'lsa,
// /uz/ /ru/ /en/ kabi alohida yo'llar tuzilmasi joriy qilinishi kerak.

// Sahifa nomlari → breadcrumb yorlig'i uchun
const BREADCRUMB_KEYS: Record<string, string> = {
  '/services': 'layout.nav.services',
  '/about': 'layout.nav.about',
  '/blog': 'layout.nav.blog',
  '/contact': 'layout.nav.contact',
};

export default function Layout() {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentLang = localeFromPath(location.pathname);
  const lp = useLocalePath();
  const activePath = stripLocale(location.pathname);

  usePageMeta();

  // URL — tilning yagona manbai: prefiks o'zgarsa i18n'ni unga moslashtiramiz.
  useEffect(() => {
    if ((i18n.language?.split('-')[0] || 'uz') !== currentLang) {
      i18n.changeLanguage(currentLang);
    }
  }, [currentLang]);

  const changeLanguage = (code: string) => {
    localStorage.setItem('language', code);
    const base = stripLocale(location.pathname);
    navigate(withLocale(base, code as Locale) + location.search);
  };

  useEffect(() => {
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Organization + WebSite + BreadcrumbList JSON-LD — render qilinadi (SSR'da xom HTML'da bo'ladi).
  const jsonLd = useMemo(() => {
    const baseUrl = SITE_URL;
    const orgId = `${baseUrl}/#organization`;
    const graph: Record<string, unknown>[] = [
      {
        '@type': ['Organization', 'ProfessionalService', 'LocalBusiness'],
        '@id': orgId,
        name: 'PRO DEKLARANT',
        url: baseUrl,
        logo: `${baseUrl}/logo.png`,
        image: `${baseUrl}/logo.png`,
        description: t('layout.footer.aboutDesc'),
        priceRange: '$$',
        telephone: '+998-91-118-70-07',
        email: 'info@prodeklarant.uz',
        // Ijtimoiy/messenjer profillar — lokal SEO va Knowledge Graph uchun
        sameAs: [
          'https://t.me/+998911187007',
          'https://wa.me/998911187007',
        ],
        areaServed: { '@type': 'Country', name: 'Uzbekistan' },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+998-91-118-70-07',
          email: 'info@prodeklarant.uz',
          contactType: 'customer service',
          availableLanguage: ['uz', 'ru', 'en'],
          areaServed: 'UZ',
        },
        address: {
          '@type': 'PostalAddress',
          streetAddress: "Mustaqillik ko'chasi, 124",
          addressLocality: 'Oltiariq',
          addressRegion: "Farg'ona viloyati",
          addressCountry: 'UZ',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 40.357075,
          longitude: 71.494720,
        },
        // 24/7 ochiq — Google konvensiyasi: opens 00:00, closes 23:59, barcha kunlar.
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            opens: '00:00',
            closes: '23:59',
          },
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        name: 'PRO DEKLARANT',
        url: baseUrl,
        description: t('layout.footer.aboutDesc'),
        inLanguage: ['uz', 'ru', 'en'],
        publisher: { '@id': orgId },
      },
    ];

    // BreadcrumbList — bosh sahifadan tashqari sahifalarda (til prefiksini hisobga olamiz)
    const basePath = stripLocale(location.pathname);
    const crumbKey = BREADCRUMB_KEYS[basePath];
    const home = { '@type': 'ListItem', position: 1, name: t('layout.nav.home'), item: `${baseUrl}${withLocale('/', currentLang)}` };
    if (crumbKey) {
      graph.push({
        '@type': 'BreadcrumbList',
        itemListElement: [
          home,
          {
            '@type': 'ListItem',
            position: 2,
            name: t(crumbKey),
            item: `${baseUrl}${location.pathname}`,
          },
        ],
      });
    }
    // Xizmat sahifasi: Bosh sahifa → Xizmatlar → <xizmat>
    const servicePage = findServicePage(basePath.match(/^\/services\/([^/]+)$/)?.[1]);
    if (servicePage) {
      graph.push({
        '@type': 'BreadcrumbList',
        itemListElement: [
          home,
          { '@type': 'ListItem', position: 2, name: t('layout.nav.services'), item: `${baseUrl}${withLocale('/services', currentLang)}` },
          {
            '@type': 'ListItem',
            position: 3,
            name: t(`services.items.${servicePage.itemKey}.title`),
            item: `${baseUrl}${withLocale(`/services/${servicePage.slug}`, currentLang)}`,
          },
        ],
      });
    }

    return { '@context': 'https://schema.org', '@graph': graph };
  }, [location.pathname, currentLang, t]);

  const navLinks = [
    { name: t('layout.nav.home'), path: '/' },
    { name: t('layout.nav.services'), path: '/services' },
    { name: t('layout.nav.about'), path: '/about' },
    { name: t('layout.nav.blog'), path: '/blog' },
    { name: t('layout.nav.contact'), path: '/contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800 bg-white">
      <JsonLd id="json-ld-organization" data={jsonLd} />
      <ContactModal />

      {/* Yuqori yordamchi panel: manzil, telefon, til */}
      <div className="pd" style={{ background: 'var(--deep)', color: 'rgba(255, 255, 255, .78)', fontSize: 14 }}>
        <div className="wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, minHeight: 42, flexWrap: 'wrap' }}>
          <span className="util-addr" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={16} strokeWidth={1.6} style={{ color: 'var(--gold)' }} aria-hidden />
            {t('layout.address')}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 26, marginLeft: 'auto' }}>
            <a href="tel:+998911187007" className="lnk" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#fff' }}>
              <Phone size={16} strokeWidth={1.6} style={{ color: 'var(--gold)' }} aria-hidden />
              +998 91 118 70 07
            </a>
            <span style={{ display: 'inline-flex', gap: 14, fontWeight: 500 }}>
              {LANGUAGES.map(({ code, label }) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => changeLanguage(code)}
                  aria-pressed={currentLang === code}
                  aria-label={label}
                  lang={code}
                  className={`lang${currentLang === code ? ' on' : ''}`}
                >
                  {code.toUpperCase()}
                </button>
              ))}
            </span>
          </span>
        </div>
      </div>

      {/* Asosiy navigatsiya */}
      <header className="pd hdr">
        <div className="wrap hdr-row">
          {/* Logo: 768px palitrali PNG (~6 KB, 4x); width/height haqiqiy nisbatda (4.8:1) — layout shift yo'q */}
          <Link to={lp('/')} aria-label="PRO DEKLARANT — Bojxonadagi ishonchli vakilingiz">
            <img src="/logo.png" alt="PRO DEKLARANT" width={192} height={40} style={{ height: 40, width: 'auto' }} decoding="async" />
          </Link>

          <nav className="nav-links" aria-label={t('layout.menu')}>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={lp(link.path)}
                aria-current={activePath === link.path ? 'page' : undefined}
                className={`nl${activePath === link.path ? ' on' : ''}`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => openContactModal()}
            className="btn btn-blue nav-cta"
            style={{ minHeight: 50, padding: '0 26px', fontSize: 16, whiteSpace: 'nowrap' }}
          >
            {t('pd.header.cta')} <ArrowRight size={18} strokeWidth={1.8} aria-hidden />
          </button>

          <button
            type="button"
            className="burger"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={t('layout.menu')}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        <div className="sprog" />

        {isMenuOpen && (
          <div id="mobile-menu" className="mnav">
            <nav aria-label={t('layout.menu')}>
              {navLinks.map((link) => (
                <Link key={link.path} to={lp(link.path)} className={`ml${activePath === link.path ? ' on' : ''}`}>
                  {link.name}
                  <ArrowRight size={18} strokeWidth={1.6} aria-hidden />
                </Link>
              ))}
            </nav>
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                openContactModal();
              }}
              className="btn btn-blue"
              style={{ width: '100%', marginTop: 22 }}
            >
              {t('pd.header.cta')} <ArrowRight size={18} strokeWidth={1.8} aria-hidden />
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="pd" style={{ background: '#041224', color: 'rgba(255, 255, 255, .72)', padding: '72px 0 36px', fontSize: 15.5 }}>
        <div className="wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: '48px 64px', justifyContent: 'space-between' }}>
          <div style={{ flex: '1.4 1 320px', maxWidth: 420 }}>
            <img
              src="/logo.png"
              alt="PRO DEKLARANT"
              width={154}
              height={32}
              style={{ height: 34, width: 'auto', filter: 'brightness(0) invert(1)' }}
              decoding="async"
            />
            <p style={{ margin: '22px 0 0', lineHeight: 1.65 }}>{t('layout.footer.aboutDesc')}</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <a className="ibox ibox-d" style={{ width: 44, height: 44 }} href="https://t.me/+998911187007" target="_blank" rel="noopener noreferrer" aria-label="Telegram">
                <Send size={18} strokeWidth={1.6} aria-hidden />
              </a>
              <a className="ibox ibox-d" style={{ width: 44, height: 44 }} href="https://wa.me/998911187007" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <MessageCircle size={18} strokeWidth={1.6} aria-hidden />
              </a>
              <a className="ibox ibox-d" style={{ width: 44, height: 44 }} href="tel:+998911187007" aria-label={t('contact.modal.call')}>
                <Phone size={18} strokeWidth={1.6} aria-hidden />
              </a>
            </div>
          </div>

          <div style={{ flex: '1 1 140px' }}>
            <div className="mono" style={{ color: 'var(--gold)', marginBottom: 20 }}>{t('layout.footer.pages')}</div>
            <div style={{ display: 'grid', gap: 10 }}>
              {navLinks.map((link) => (
                <Link key={link.path} to={lp(link.path)} className="lnk" style={{ width: 'fit-content' }}>
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div style={{ flex: '1 1 220px' }}>
            <div className="mono" style={{ color: 'var(--gold)', marginBottom: 20 }}>{t('layout.footer.services')}</div>
            <div style={{ display: 'grid', gap: 10 }}>
              {(['export', 'import', 'transit', 'certification', 'warehouse', 'consulting'] as const).map((key) => (
                <Link key={key} to={lp(servicePath(key))} className="lnk" style={{ width: 'fit-content' }}>
                  {t(`services.items.${key}.title`)}
                </Link>
              ))}
            </div>
          </div>

          <div style={{ flex: '1 1 240px' }}>
            <div className="mono" style={{ color: 'var(--gold)', marginBottom: 20 }}>{t('layout.footer.contactTitle')}</div>
            <div style={{ display: 'grid', gap: 12 }}>
              <a href="tel:+998911187007" style={{ color: '#fff', width: 'fit-content' }}>+998 91 118 70 07</a>
              <a href="mailto:info@prodeklarant.uz" className="lnk" style={{ width: 'fit-content' }}>info@prodeklarant.uz</a>
              <span>{t('layout.footer.address')}</span>
            </div>
          </div>
        </div>
        <div className="wrap" style={{ marginTop: 56, paddingTop: 24, borderTop: '1px solid rgba(255, 255, 255, .12)', fontSize: 14, color: 'rgba(255, 255, 255, .55)' }}>
          {t('layout.footer.copyright', { year: new Date().getFullYear() })}
        </div>
      </footer>
    </div>
  );
}
