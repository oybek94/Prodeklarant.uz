import { motion } from 'motion/react';
import { Quote } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { siteData, pickLocale } from '../utils/siteData';

/** Mijozlar fikri — src/content/site-data.json (testimonials). Ma'lumot bo'lmasa chizilmaydi. */
export default function Testimonials() {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language || 'uz').split('-')[0];
  const items = siteData.testimonials
    .map((item) => ({ ...item, quote: pickLocale(item.text, lang) }))
    .filter((item) => item.name && item.quote);
  if (items.length === 0) return null;

  return (
    <section className="py-20 bg-slate-50 border-t border-slate-100" aria-labelledby="testimonials-heading">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 id="testimonials-heading" className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 uppercase">
            {t('trust.testimonials.title')}
          </h2>
          <div className="w-20 h-1 bg-accent mx-auto"></div>
        </div>
        {/* flex + justify-center: 1–2 ta fikr bo'lsa ham markazda turadi */}
        <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
          {items.map((item, i) => (
            <motion.figure
              key={`${item.name}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm flex flex-col w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.34rem)]"
            >
              <Quote size={28} className="text-accent mb-4" aria-hidden />
              <blockquote className="text-slate-700 leading-relaxed flex-grow whitespace-pre-line">{item.quote}</blockquote>
              <figcaption className="flex items-center gap-4 mt-6 pt-6 border-t border-slate-100">
                {item.photo ? (
                  <img src={item.photo} alt="" width={48} height={48} loading="lazy" decoding="async" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <span className="w-12 h-12 rounded-full bg-brand/10 text-brand font-bold flex items-center justify-center" aria-hidden>
                    {item.name.trim().charAt(0).toUpperCase()}
                  </span>
                )}
                <span>
                  <span className="block font-bold text-slate-900">{item.name}</span>
                  {item.company && <span className="block text-sm text-slate-500">{item.company}</span>}
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
