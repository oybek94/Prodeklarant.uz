import { motion } from 'motion/react';
import { Award, Users, FileCheck, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function About() {
  const { t } = useTranslation();
  const stats = [
    { label: t('about.stats.experience'), value: "10+", icon: <Award size={24} /> },
    { label: t('about.stats.clients'), value: "500+", icon: <Users size={24} /> },
    { label: t('about.stats.cargo'), value: "15k+", icon: <FileCheck size={24} /> },
    { label: t('about.stats.countries'), value: "30+", icon: <Globe size={24} /> },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Header with Image Background */}
      <div className="relative h-[400px] flex items-center justify-center text-white">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1566385103102-619cb6425f20?q=80&w=1920&auto=format&fit=crop" 
            alt="Meva-sabzavot eksporti" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/80"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 uppercase tracking-wider">{t('about.title')}</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto font-light">
            {t('about.subtitle')}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col md:flex-row gap-16 items-center">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold text-slate-900 mb-6 uppercase border-l-4 border-yellow-500 pl-4">{t('about.history.title')}</h2>
            <p className="text-slate-600 mb-6 leading-relaxed text-justify">
              {t('about.history.p1')}
            </p>
            <p className="text-slate-600 mb-6 leading-relaxed text-justify">
              {t('about.history.p2')}
            </p>
            <div className="bg-slate-50 p-6 border-l-4 border-blue-900 italic text-slate-700">
              "{t('about.history.quote')}"
            </div>
          </div>
          
          <div className="md:w-1/2 grid grid-cols-2 gap-6">
            <img 
              src="https://images.unsplash.com/photo-1574484284002-9520c62fd34f?q=80&w=600&auto=format&fit=crop" 
              alt="Meva qadoqlash" 
              className="rounded-sm shadow-lg w-full h-48 object-cover"
            />
            <div className="bg-slate-900 p-6 flex items-center justify-center text-white text-center rounded-sm">
              <div>
                <span className="text-4xl font-bold text-yellow-500 block mb-2">100%</span>
                <span className="uppercase text-sm tracking-widest">{t('about.guarantee')}</span>
              </div>
            </div>
            <div className="bg-yellow-500 p-6 flex items-center justify-center text-slate-900 text-center rounded-sm">
              <div>
                <span className="text-4xl font-bold block mb-2">24/7</span>
                <span className="uppercase text-sm tracking-widest font-bold">{t('about.service24')}</span>
              </div>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop" 
              alt="Sabzavotlar" 
              className="rounded-sm shadow-lg w-full h-48 object-cover"
            />
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="text-yellow-500 mb-4">{stat.icon}</div>
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-slate-400 text-sm uppercase tracking-wide">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-6 uppercase">{t('about.mission.title')}</h3>
            <p className="text-slate-600 leading-relaxed">
              {t('about.mission.text')}
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-6 uppercase">{t('about.vision.title')}</h3>
            <p className="text-slate-600 leading-relaxed">
              {t('about.vision.text')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
