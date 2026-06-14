import { Outlet, Link, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Phone, Mail, MapPin, Send, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { usePageMeta } from './hooks/usePageMeta';
import ContactModal from './components/ContactModal';

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
  const currentLang = i18n.language?.split('-')[0] || 'uz';

  usePageMeta();

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('language', code);
  };

  useEffect(() => {
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const baseUrl = window.location.origin;
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
          addressLocality: 'Oltiariq',
          addressRegion: "Farg'ona viloyati",
          addressCountry: 'UZ',
        },
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

    // BreadcrumbList — bosh sahifadan tashqari sahifalarda
    const crumbKey = BREADCRUMB_KEYS[location.pathname];
    if (crumbKey) {
      graph.push({
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: t('layout.nav.home'), item: `${baseUrl}/` },
          {
            '@type': 'ListItem',
            position: 2,
            name: t(crumbKey),
            item: `${baseUrl}${location.pathname}`,
          },
        ],
      });
    }

    const jsonLd = { '@context': 'https://schema.org', '@graph': graph };
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
      <ContactModal />
      {/* Top Bar - Official Info */}
      <div className="bg-brand-dark text-slate-300 text-xs py-2 border-b border-brand-dark/80 hidden md:block">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex space-x-6">
            <a href="tel:+998911187007" className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
              <Phone size={14} className="text-accent" /> +998 91 118 70 07
            </a>
            <a href="mailto:info@prodeklarant.uz" className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
              <Mail size={14} className="text-accent" /> info@prodeklarant.uz
            </a>
            <span className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
              <MapPin size={14} className="text-accent" /> {t('layout.address')}
            </span>
          </div>
          <div className="flex space-x-4">
            {LANGUAGES.map(({ code, label }) => (
              <button
                key={code}
                type="button"
                onClick={() => changeLanguage(code)}
                aria-pressed={currentLang === code}
                lang={code}
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
                <img src="/logo.png" alt="PRO DEKLARANT - Bojxonadagi ishonchli vakilingiz" width={168} height={40} className="h-10 w-auto object-contain" decoding="async" />
              </picture>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-semibold uppercase tracking-wide py-2 border-b-2 transition-colors duration-300 ${location.pathname === link.path
                    ? 'text-brand border-accent'
                    : 'text-slate-600 border-transparent hover:text-brand hover:border-brand'
                    }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* CTA Button */}
            <div className="hidden md:block">
              <button type="button" onClick={() => window.dispatchEvent(new Event('openContactModal'))} className="bg-accent hover:bg-accent-light text-brand-dark font-bold py-2.5 px-6 rounded-xl transition-all duration-300 uppercase text-xs tracking-wider flex items-center gap-2 shadow-[0_0_10px_rgba(232,168,56,0.3)] hover:shadow-[0_0_20px_rgba(232,168,56,0.6)] hover:-translate-y-1">
                {t('layout.contactBtn')} <Phone size={14} />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="md:hidden text-slate-900 p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={t('layout.menu')}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
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
            id="mobile-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden fixed top-20 left-0 right-0 bg-white border-b border-slate-200 shadow-md z-40 overflow-hidden"
          >
            <nav className="flex flex-col p-4 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-base font-medium py-2 px-4 rounded-md transition-colors ${location.pathname === link.path
                    ? 'bg-brand/10 text-brand'
                    : 'text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  {link.name}
                </Link>
              ))}

              {/* Til almashtirgich — mobil (yuqori panel mobilda yashirin) */}
              <div className="flex items-center gap-2 pt-4 mt-2 border-t border-slate-100">
                {LANGUAGES.map(({ code, label }) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => changeLanguage(code)}
                    aria-pressed={currentLang === code}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${currentLang === code
                      ? 'bg-brand text-white'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event('openContactModal'))}
                className="bg-accent text-brand-dark font-bold py-3 px-4 rounded-xl text-center mt-2 flex items-center justify-center gap-2"
              >
                <Phone size={18} /> {t('layout.contactBtn')}
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-brand-dark text-slate-300 pt-16 pb-8 border-t-4 border-accent">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Column 1: About */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <picture>
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
                <a
                  href="https://t.me/+998911187007"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram"
                  className="w-9 h-9 bg-brand rounded-full flex items-center justify-center hover:bg-accent hover:text-brand-dark transition-colors"
                >
                  <Send size={16} />
                </a>
                <a
                  href="https://wa.me/998911187007"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="w-9 h-9 bg-brand rounded-full flex items-center justify-center hover:bg-accent hover:text-brand-dark transition-colors"
                >
                  <MessageCircle size={16} />
                </a>
                <a
                  href="tel:+998911187007"
                  aria-label={t('contact.modal.call')}
                  className="w-9 h-9 bg-brand rounded-full flex items-center justify-center hover:bg-accent hover:text-brand-dark transition-colors"
                >
                  <Phone size={16} />
                </a>
              </div>
            </div>

            {/* Column 2: Sahifalar — navdagi mavjud sahifalar */}
            <div>
              <h3 className="text-white font-bold text-lg mb-6 uppercase">{t('layout.footer.pages')}</h3>
              <ul className="space-y-3 text-sm">
                {navLinks.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className="hover:text-accent transition-colors">
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
                    <Link to="/services" className="hover:text-accent transition-colors">
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
                  <MapPin size={18} className="text-accent mt-0.5 flex-shrink-0" />
                  <span>{t('layout.footer.address')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-accent flex-shrink-0" />
                  <a href="tel:+998911187007" className="hover:text-accent transition-colors">+998 91 118 70 07</a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={18} className="text-accent flex-shrink-0" />
                  <a href="mailto:info@prodeklarant.uz" className="hover:text-accent transition-colors">info@prodeklarant.uz</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-brand/50 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
            <p>{t('layout.footer.copyright', { year: new Date().getFullYear() })}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
