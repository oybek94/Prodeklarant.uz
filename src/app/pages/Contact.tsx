import { motion } from 'motion/react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Contact() {
  const { t } = useTranslation();
  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4 uppercase">{t('contact.title')}</h1>
          <p className="text-slate-300 max-w-2xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 uppercase">{t('contact.info.title')}</h2>
            <div className="bg-white p-8 rounded-sm shadow-sm border border-slate-100 space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1 uppercase text-sm tracking-wide">{t('contact.info.address')}</h3>
                  <p className="text-slate-600">{t('contact.info.addressValue')}</p>
                  <p className="text-slate-500 text-sm mt-1">{t('contact.info.addressHint')}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1 uppercase text-sm tracking-wide">{t('contact.info.phones')}</h3>
                  <p className="text-slate-600 font-bold text-lg">+998 71 200 00 00</p>
                  <p className="text-slate-600">+998 90 123 45 67</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1 uppercase text-sm tracking-wide">{t('contact.info.email')}</h3>
                  <p className="text-slate-600">info@prodeklarant.uz</p>
                  <p className="text-slate-600">sales@prodeklarant.uz</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1 uppercase text-sm tracking-wide">{t('contact.info.hours')}</h3>
                  <p className="text-slate-600">{t('contact.info.hours1')}</p>
                  <p className="text-slate-600">{t('contact.info.hours2')}</p>
                  <p className="text-red-500 text-sm mt-1">{t('contact.info.hours3')}</p>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="mt-8 bg-slate-200 h-64 rounded-sm overflow-hidden relative">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2998.072897210664!2d69.24056231572528!3d41.28551417927357!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38ae8b0cc379e9c3%3A0xa5a9323b4aa5cb98!2sTashkent%2C%20Uzbekistan!5e0!3m2!1sen!2s!4v1647856743840!5m2!1sen!2s" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                title="Google Maps"
              ></iframe>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 uppercase">{t('contact.form.title')}</h2>
            <div className="bg-white p-8 rounded-sm shadow-lg border-t-4 border-yellow-500">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">{t('contact.form.name')}</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 border border-slate-300 focus:outline-none focus:border-blue-900 transition-colors bg-slate-50"
                      placeholder={t('contact.form.namePlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">{t('contact.form.phone')}</label>
                    <input 
                      type="tel" 
                      className="w-full px-4 py-3 border border-slate-300 focus:outline-none focus:border-blue-900 transition-colors bg-slate-50"
                      placeholder={t('contact.form.phonePlaceholder')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">{t('contact.form.emailLabel')}</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3 border border-slate-300 focus:outline-none focus:border-blue-900 transition-colors bg-slate-50"
                    placeholder={t('contact.form.emailPlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">{t('contact.form.service')}</label>
                  <select className="w-full px-4 py-3 border border-slate-300 focus:outline-none focus:border-blue-900 transition-colors bg-slate-50 text-slate-600">
                    <option value="">{t('contact.form.servicePlaceholder')}</option>
                    <option value="export">{t('contact.form.serviceOptions.export')}</option>
                    <option value="import">{t('contact.form.serviceOptions.import')}</option>
                    <option value="certification">{t('contact.form.serviceOptions.certification')}</option>
                    <option value="consulting">{t('contact.form.serviceOptions.consulting')}</option>
                    <option value="other">{t('contact.form.serviceOptions.other')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">{t('contact.form.message')}</label>
                  <textarea 
                    rows={5}
                    className="w-full px-4 py-3 border border-slate-300 focus:outline-none focus:border-blue-900 transition-colors bg-slate-50"
                    placeholder={t('contact.form.messagePlaceholder')}
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-4 uppercase tracking-wider transition-colors shadow-lg"
                >
                  {t('contact.form.submit')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
