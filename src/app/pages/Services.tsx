import { motion } from 'motion/react';
import { FileText, Truck, ShieldCheck, Globe, Package, CheckSquare, BarChart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SERVICE_KEYS = ['export', 'import', 'transit', 'certification', 'warehouse', 'consulting'] as const;
const SERVICE_ICONS = [FileText, Truck, Globe, ShieldCheck, Package, BarChart];

export default function Services() {
  const { t } = useTranslation();
  const services = SERVICE_KEYS.map((key, index) => {
    const IconComponent = SERVICE_ICONS[index];
    return {
      id: index + 1,
      icon: <IconComponent size={48} />,
      title: t(`services.items.${key}.title`),
      description: t(`services.items.${key}.desc`),
      features: (t(`services.items.${key}.features`, { returnObjects: true }) as string[]),
    };
  });

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Header */}
      <div className="relative z-10 text-white py-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.pexels.com/photos/4483610/pexels-photo-4483610.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt=""
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>
        <div className="absolute inset-0 z-[1] bg-slate-900/75" aria-hidden="true" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl font-bold mb-4 uppercase">{t('services.title')}</h1>
          <p className="text-slate-200 max-w-2xl mx-auto">
            {t('services.subtitle')}
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div 
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-sm shadow-md p-8 hover:shadow-xl transition-shadow border-t-4 border-transparent hover:border-yellow-500 group"
            >
              <div className="text-blue-900 group-hover:text-yellow-500 transition-colors mb-6">
                {service.icon}
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">{service.title}</h2>
              <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                {service.description}
              </p>
              
              <div className="space-y-3">
                {service.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckSquare size={16} className="text-yellow-500 mt-1 flex-shrink-0" />
                    <span className="text-sm text-slate-700 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Process Section */}
      <div className="container mx-auto px-4 mt-20">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-12 uppercase">{t('services.process.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-0 w-full h-1 bg-slate-200 -z-10"></div>

          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex flex-col items-center text-center bg-slate-50 p-4">
              <div className={`w-24 h-24 bg-white border-4 rounded-full flex items-center justify-center text-3xl font-bold mb-6 shadow-sm z-10 ${step === 4 ? 'border-yellow-500 text-slate-900' : 'border-blue-900 text-blue-900'}`}>{step}</div>
              <h3 className="font-bold text-lg mb-2">{t(`services.process.steps.${step}.title`)}</h3>
              <p className="text-sm text-slate-600">{t(`services.process.steps.${step}.desc`)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
