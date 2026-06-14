import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Phone, Mail, MapPin, Clock, Send, ChevronRight, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Contact() {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    // Xabar serverga (/api/contact) yuboriladi — Telegram tokeni faqat serverda qoladi.
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || t('contact.form.error') || "Xatolik yuz berdi. Qayta urinib ko'ring.");
      }

      setIsSubmitted(true);
      setFormData({ name: '', phone: '', message: '' }); // tozalash
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (err) {
      setErrorMsg(
        err instanceof Error && err.message
          ? err.message
          : (t('contact.form.error') || "Xatolik yuz berdi. Qayta urinib ko'ring.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-0 font-sans">
      {/* Dynamic Hero Section */}
      <section className="relative z-10 text-white min-h-[45vh] flex items-center justify-center overflow-hidden">
        <motion.div
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute inset-0 z-0"
        >
          <img
            src="/images/p3184360-1280.jpg"
            srcSet="/images/p3184360-640.jpg 640w, /images/p3184360-1280.jpg 1280w, /images/p3184360-1920.jpg 1920w"
            sizes="100vw"
            alt="Contact Us"
            width={1920}
            height={1080}
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/90 via-brand-dark/70 to-brand-dark/90 mix-blend-multiply" aria-hidden="true" />
        </motion.div>

        {/* Abstract shapes */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-brand/30 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="container mx-auto px-4 relative z-10 text-center mt-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-black tracking-widest text-sm mb-6 uppercase shadow-lg">
              <MessageSquare size={16} className="text-accent" /> Prodeklarant
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold mb-6 tracking-tight drop-shadow-lg">
              {t('contact.title')}
            </h1>
            <p className="text-lg md:text-xl text-slate-200 max-w-2xl mx-auto font-medium leading-relaxed">
              {t('contact.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-20 relative -mt-10 md:-mt-20 z-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">

            {/* Contact Info Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              <div className="bg-white rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-brand/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>

                <h2 className="text-2xl font-extrabold text-slate-900 mb-8 uppercase tracking-wide flex items-center gap-3">
                  <div className="w-2 h-8 bg-accent rounded-full"></div>
                  {t('contact.info.title')}
                </h2>

                <div className="space-y-8 relative z-10">
                  <div className="flex items-start gap-5 group/item cursor-default">
                    <div className="w-14 h-14 bg-slate-50 text-brand rounded-2xl flex items-center justify-center flex-shrink-0 group-hover/item:bg-brand group-hover/item:text-white transition-all duration-300 shadow-sm border border-slate-100 group-hover/item:border-transparent group-hover/item:rotate-6 group-hover/item:shadow-lg">
                      <MapPin size={24} strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1 uppercase text-xs tracking-widest text-brand/60">{t('contact.info.address')}</h3>
                      <p className="text-slate-700 font-medium leading-relaxed">{t('contact.info.addressValue')}</p>
                      {t('contact.info.addressHint') && <p className="text-slate-500 text-sm mt-1">{t('contact.info.addressHint')}</p>}
                    </div>
                  </div>

                  <div className="flex items-start gap-5 group/item">
                    <div className="w-14 h-14 bg-slate-50 text-brand rounded-2xl flex items-center justify-center flex-shrink-0 group-hover/item:bg-brand group-hover/item:text-white transition-all duration-300 shadow-sm border border-slate-100 group-hover/item:border-transparent group-hover/item:-rotate-6 group-hover/item:shadow-lg">
                      <Phone size={24} strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1 uppercase text-xs tracking-widest text-brand/60">{t('contact.info.phones')}</h3>
                      <a href="tel:+998911187007" className="inline-block text-slate-800 font-bold text-lg hover:text-brand transition-colors">+998 91 118 70 07</a>
                    </div>
                  </div>

                  <div className="flex items-start gap-5 group/item">
                    <div className="w-14 h-14 bg-slate-50 text-brand rounded-2xl flex items-center justify-center flex-shrink-0 group-hover/item:bg-brand group-hover/item:text-white transition-all duration-300 shadow-sm border border-slate-100 group-hover/item:border-transparent group-hover/item:rotate-6 group-hover/item:shadow-lg">
                      <Mail size={24} strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1 uppercase text-xs tracking-widest text-brand/60">{t('contact.info.email')}</h3>
                      <a href="mailto:info@prodeklarant.uz" className="inline-block text-slate-800 font-bold hover:text-brand transition-colors">info@prodeklarant.uz</a>
                    </div>
                  </div>

                  <div className="flex items-start gap-5 group/item cursor-default border-t border-slate-100 pt-6">
                    <div className="w-14 h-14 bg-slate-50 text-brand rounded-2xl flex items-center justify-center flex-shrink-0 group-hover/item:bg-brand group-hover/item:text-white transition-all duration-300 shadow-sm border border-slate-100 group-hover/item:border-transparent group-hover/item:-rotate-6 group-hover/item:shadow-lg">
                      <Clock size={24} strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1 uppercase text-xs tracking-widest text-brand/60">{t('contact.info.hours')}</h3>
                      <p className="text-slate-800 font-bold text-lg">{t('contact.info.hours1')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Form / Action Area */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:col-span-3"
            >
              <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-slate-100 relative h-full">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand via-accent to-brand-light"></div>

                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2 uppercase tracking-tight">
                  {t('contact.form.title') || "Xabar yuborish"}
                </h2>
                <p className="text-slate-500 mb-8 font-medium">{t('contact.form.desc') || "Barcha savollaringizga tezda javob beramiz."}</p>

                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-16 text-center space-y-4"
                  >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                      <Send size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">{t('contact.form.success.title')}</h3>
                    <p className="text-slate-600">{t('contact.form.success.desc')}</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                          {t('contact.form.name') || "Ismingiz"}
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder={t('contact.form.namePlaceholder') || "John Doe"}
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all font-medium text-slate-800 placeholder:text-slate-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                          {t('contact.form.phone') || "Telefon raqamingiz"}
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder={t('contact.form.phonePlaceholder')}
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all font-medium text-slate-800 placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                        {t('contact.form.message') || "Xabar matni"}
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder={t('contact.form.messagePlaceholder') || "So'rovingizni yozib qoldiring..."}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all font-medium text-slate-800 placeholder:text-slate-400 resize-none"
                      ></textarea>
                    </div>

                    {errorMsg && (
                      <p role="alert" aria-live="assertive" className="text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                        {errorMsg}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group w-full md:w-auto inline-flex items-center justify-center gap-2 bg-brand text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider transition-all duration-300 shadow-lg shadow-brand/20 hover:shadow-brand/40 hover:bg-brand-dark hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? t('contact.form.submitting') : t('contact.form.submit')}
                      <Send size={18} className={`transition-transform ${isSubmitting ? 'animate-pulse' : 'group-hover:translate-x-1 group-hover:-translate-y-1'}`} />
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Full Width Map Section */}
      <section className="relative h-[500px] w-full mt-10 filter grayscale-[20%] contrast-125">
        <iframe
          src="https://maps.google.com/maps?q=40.3736,71.6794&z=14&hl=uz&output=embed"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={true}
          loading="lazy"
          title="Google Maps"
          className="absolute inset-0 w-full h-full"
        ></iframe>
        {/* Floating marker overlay */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none drop-shadow-2xl">
          <div className="bg-brand-dark text-white p-4 rounded-2xl shadow-xl flex items-center gap-3">
            <div className="bg-accent text-brand-dark p-2 rounded-xl">
              <MapPin size={24} strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-extrabold text-sm uppercase">Prodeklarant</p>
              <p className="text-xs text-slate-300">Farg'ona, Oltiariq</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
