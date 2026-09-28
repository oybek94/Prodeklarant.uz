import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import uz from './locales/uz.json';
import ru from './locales/ru.json';
import en from './locales/en.json';

const resources = {
  uz: { translation: uz },
  ru: { translation: ru },
  en: { translation: en },
};

// Boshlang'ich til faqat URL prefiksidan (/ru, /en; prefikssiz — uz). URL — tilning
// yagona manbai: server (SSR) ham shu qoida bilan render qiladi, localStorage'dagi til
// ishlatilsa hydration'da server HTML bilan mos kelmay qoladi.
function initialLang(): string {
  if (typeof window !== 'undefined') {
    const seg = window.location.pathname.split('/')[1];
    if (seg === 'ru' || seg === 'en') return seg;
  }
  return 'uz';
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLang(),
    fallbackLng: 'uz',
    interpolation: {
      escapeValue: false,
    },
  });

const updateDocumentLang = (lng: string) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng.split('-')[0];
  }
};
updateDocumentLang(i18n.language || 'uz');

i18n.on('languageChanged', (lng) => {
  updateDocumentLang(lng);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('language', lng);
  }
});

export default i18n;
