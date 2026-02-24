import { Outlet, Link, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Phone, Mail, MapPin, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { usePageMeta } from './hooks/usePageMeta';

const LANGUAGES = [
  { code: 'uz', label: 'O\'zbek' },
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
] as const;

const HREFLANG_IDS = { uz: 'hreflang-uz', ru: 'hreflang-ru', en: 'hreflang-en', 'x-default': 'hreflang-x-default' };

export default function Layout() {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const currentLang = i18n.language?.split('-')[0] || 'uz';

  usePageMeta();

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('language', code);
  };

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const fullUrl = `${window.location.origin}${location.pathname}`;
    const langs: Array<{ code: string; id: string }> = [
      { code: 'uz', id: HREFLANG_IDS.uz },
      { code: 'ru', id: HREFLANG_IDS.ru },
      { code: 'en', id: HREFLANG_IDS.en },
      { code: 'x-default', id: HREFLANG_IDS['x-default'] },
    ];
    langs.forEach(({ code, id }) => {
      let link = document.getElementById(id) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'alternate';
        link.id = id;
        document.head.appendChild(link);
      }
      link.setAttribute('hreflang', code);
      link.setAttribute('href', fullUrl);
    });
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname !== '/') {
      const existing = document.getElementById('json-ld-organization');
      if (existing) existing.remove();
      return;
    }
    const baseUrl = window.location.origin;
    const orgId = `${baseUrl}/#organization`;
    const jsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': orgId,
          name: 'PRO DEKLARANT',
          url: baseUrl,
          logo: `${baseUrl}/logo.png`,
          description: t('layout.footer.aboutDesc'),
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+998-91-118-70-07',
            email: 'info@prodeklarant.uz',
            contactType: 'customer service',
            areaServed: 'UZ',
          },
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Oltiariq',
            addressRegion: "Farg'ona viloyati",
            addressCountry: 'UZ',
          },
        },
        {
          '@type': 'WebSite',
          name: 'PRO DEKLARANT',
          url: baseUrl,
          description: t('layout.footer.aboutDesc'),
          publisher: { '@id': orgId },
        },
      ],
    };
    let script = document.getElementById('json-ld-organization') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'json-ld-organization';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(jsonLd);
  }, [location.pathname, t]);

  const navLinks = [
    { name: t('layout.nav.home'), path: '/' },
    { name: t('layout.nav.services'), path: '/services' },
    { name: t('layout.nav.about'), path: '/about' },
    { name: t('layout.nav.blog'), path: '/blog' },
    { name: t('layout.nav.contact'), path: '/contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800 bg-white">
      {/* Top Bar - Official Info */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 border-b border-slate-800 hidden md:block">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex space-x-6">
            <span className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
              <Phone size={14} className="text-yellow-500" /> +998 91 118 70 07
            </span>
            <span className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
              <Mail size={14} className="text-yellow-500" /> info@prodeklarant.uz
            </span>
            <span className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
              <MapPin size={14} className="text-yellow-500" /> {t('layout.address')}
            </span>
          </div>
          <div className="flex space-x-4">
            {LANGUAGES.map(({ code, label }) => (
              <button
                key={code}
                type="button"
                onClick={() => changeLanguage(code)}
                className={`hover:text-white cursor-pointer transition-colors ${currentLang === code ? 'text-white font-semibold' : 'opacity-70 hover:opacity-100'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-50 bg-white shadow-md border-b border-slate-100">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            {/* Logo: WebP when available, PNG fallback; sized to avoid layout shift */}
            <Link to="/" className="flex items-center gap-2 group">
              <picture>
                <source type="image/webp" srcSet="/logo.webp" />
                <img src="/logo.png" alt="PRO DEKLARANT - Bojxonadagi ishonchli vakilingiz" width={168} height={40} className="h-10 w-auto object-contain" decoding="async" fetchPriority="high" />
              </picture>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-semibold uppercase tracking-wide py-2 border-b-2 transition-colors duration-300 ${
                    location.pathname === link.path
                      ? 'text-blue-900 border-yellow-500'
                      : 'text-slate-600 border-transparent hover:text-blue-900 hover:border-blue-900'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* CTA Button */}
            <div className="hidden md:block">
              <Link to="/contact" className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-2.5 px-6 rounded-sm transition-colors uppercase text-xs tracking-wider flex items-center gap-2">
                {t('layout.contactBtn')} <ArrowRight size={14} />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-slate-900 p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
          >
            <nav className="flex flex-col p-4 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-base font-medium py-2 px-4 rounded-md transition-colors ${
                    location.pathname === link.path
                      ? 'bg-blue-50 text-blue-900'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/contact"
                className="bg-yellow-500 text-slate-900 font-bold py-3 px-4 rounded-md text-center mt-4"
              >
                {t('layout.contactBtn')}
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t-4 border-yellow-500">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Column 1: About */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <picture>
                  <source type="image/webp" srcSet="/logo.webp" />
                  <img
                    src="/logo.png"
                    alt="PRO DEKLARANT"
                    width={128}
                    height={32}
                    className="h-8 w-auto object-contain brightness-0 invert"
                    decoding="async"
                  />
                </picture>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                {t('layout.footer.aboutDesc')}
              </p>
              <div className="flex space-x-4">
                {/* Social Icons Placeholder */}
                <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center hover:bg-yellow-500 hover:text-slate-900 transition-colors cursor-pointer">FB</div>
                <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center hover:bg-yellow-500 hover:text-slate-900 transition-colors cursor-pointer">TG</div>
                <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center hover:bg-yellow-500 hover:text-slate-900 transition-colors cursor-pointer">IG</div>
              </div>
            </div>

            {/* Column 2: Sahifalar — navdagi mavjud sahifalar */}
            <div>
              <h3 className="text-white font-bold text-lg mb-6 uppercase">{t('layout.footer.pages')}</h3>
              <ul className="space-y-3 text-sm">
                {navLinks.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className="hover:text-yellow-500 transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Services — Xizmatlar sahifasidagi nomlar bilan bir xil */}
            <div>
              <h3 className="text-white font-bold text-lg mb-6 uppercase">{t('layout.footer.services')}</h3>
              <ul className="space-y-3 text-sm">
                {(['export', 'import', 'transit', 'certification', 'warehouse', 'consulting'] as const).map((key) => (
                  <li key={key}>
                    <Link to="/services" className="hover:text-yellow-500 transition-colors">
                      {t(`services.items.${key}.title`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Contact */}
            <div>
              <h3 className="text-white font-bold text-lg mb-6 uppercase">{t('layout.footer.contactTitle')}</h3>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span>{t('layout.footer.address')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-yellow-500 flex-shrink-0" />
                  <span>+998 91 118 70 07</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={18} className="text-yellow-500 flex-shrink-0" />
                  <span>info@prodeklarant.uz</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
            <p>{t('layout.footer.copyright')}</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <span className="hover:text-white cursor-pointer transition-colors">{t('layout.footer.privacy')}</span>
              <span className="hover:text-white cursor-pointer transition-colors">{t('layout.footer.terms')}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
