import { motion } from 'motion/react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Contact() {
  const { t } = useTranslation();
  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Header */}
      <div className="relative min-h-[280px] py-12 md:py-16 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1920" 
            srcSet="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=640 640w, https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1024 1024w, https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1920 1920w"
            sizes="100vw"
            alt="" 
            width={1920}
            height={1080}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-brand-dark/85" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl font-bold mb-4 uppercase">{t('contact.title')}</h1>
          <p className="text-slate-300 max-w-2xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-12 lg:mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-stretch">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col min-h-0"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6 uppercase tracking-wide border-l-4 border-accent pl-4 flex-shrink-0">{t('contact.info.title')}</h2>
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border-t-4 border-accent space-y-6 flex-1">
              <div className="flex items-start gap-5 p-4 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="w-14 h-14 bg-brand text-accent rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin size={26} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-widest text-brand">{t('contact.info.address')}</h3>
                  <p className="text-slate-700 leading-relaxed">{t('contact.info.addressValue')}</p>
                  {t('contact.info.addressHint') && <p className="text-slate-500 text-sm mt-1">{t('contact.info.addressHint')}</p>}
                </div>
              </div>

              <div className="flex items-start gap-5 p-4 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="w-14 h-14 bg-brand text-accent rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone size={26} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-widest text-brand">{t('contact.info.phones')}</h3>
                  <a href="tel:+998911187007" className="text-slate-700 font-semibold text-lg hover:text-accent-light transition-colors">+998 91 118 70 07</a>
                </div>
              </div>

              <div className="flex items-start gap-5 p-4 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="w-14 h-14 bg-brand text-accent rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail size={26} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-widest text-brand">{t('contact.info.email')}</h3>
                  <a href="mailto:info@prodeklarant.uz" className="text-slate-700 hover:text-accent-light transition-colors">info@prodeklarant.uz</a>
                </div>
              </div>

              <div className="flex items-start gap-5 p-4 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="w-14 h-14 bg-brand text-accent rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock size={26} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-widest text-brand">{t('contact.info.hours')}</h3>
                  <p className="text-slate-700">{t('contact.info.hours1')}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col min-h-0"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6 uppercase tracking-wide border-l-4 border-accent pl-4 flex-shrink-0">{t('contact.info.location')}</h2>
            <div className="bg-white h-64 lg:flex-1 lg:min-h-[400px] rounded-lg shadow-md overflow-hidden border border-slate-100">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d58279!2d71.48!3d40.39!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38bb84d62a1f8f1f%3A0x0!2sOltiariq%2C%20Uzbekistan!5e0!3m2!1sen!2s!4v1647856743840!5m2!1sen!2s" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                title="Google Maps"
              ></iframe>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
