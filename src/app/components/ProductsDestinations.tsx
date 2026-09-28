import { Package, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { siteData, pickLocale } from '../utils/siteData';

/**
 * "Mahsulotlar / Yo'nalishlar" — src/content/site-data.json (productsHandled, destinations).
 * Har bir ro'yxat bo'sh bo'lsa o'sha qism, ikkalasi bo'sh bo'lsa butun blok chizilmaydi.
 */
export default function ProductsDestinations() {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language || 'uz').split('-')[0];
  const products = siteData.productsHandled
    .filter((key) => i18n.exists(`leadForm.products.${key}`))
    .map((key) => ({ key, label: t(`leadForm.products.${key}`) }));
  const destinations = siteData.destinations.map((d) => pickLocale(d, lang)).filter(Boolean);
  if (products.length === 0 && destinations.length === 0) return null;

  const groups = [
    { id: 'products', icon: Package, label: t('trust.products.productsLabel'), items: products.map((p) => p.label) },
    { id: 'destinations', icon: Globe, label: t('trust.products.destinationsLabel'), items: destinations },
  ].filter((g) => g.items.length > 0);

  return (
    <section className="py-20 bg-white" aria-labelledby="products-heading">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 id="products-heading" className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 uppercase">
            {t('trust.products.title')}
          </h2>
          <div className="w-20 h-1 bg-accent mx-auto"></div>
        </div>
        <div className={`grid grid-cols-1 ${groups.length > 1 ? 'md:grid-cols-2' : ''} gap-8 max-w-5xl mx-auto`}>
          {groups.map((g) => (
            <div key={g.id} className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
              <h3 className="flex items-center gap-3 text-lg font-extrabold text-slate-900 uppercase tracking-wide mb-6">
                <span className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center">
                  <g.icon size={20} aria-hidden />
                </span>
                {g.label}
              </h3>
              <ul className="flex flex-wrap gap-3">
                {g.items.map((item) => (
                  <li key={item} className="px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-700 font-semibold text-sm">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
