import { motion } from 'motion/react';
import { FileText, Truck, ShieldCheck, Globe, Package, CheckSquare, BarChart, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

// Make icons map to service keys
const SERVICE_ICONS: Record<string, any> = {
  export: FileText,
  import: Truck,
  transit: Globe,
  certification: ShieldCheck,
  warehouse: Package,
  consulting: BarChart,
};

const SERVICE_KEYS = ['export', 'import', 'transit', 'certification', 'warehouse', 'consulting'] as const;

export default function Services() {
  const { t } = useTranslation();

  const services = SERVICE_KEYS.map((key, index) => {
    const IconComponent = SERVICE_ICONS[key];
    return {
      id: index + 1,
      key,
      icon: <IconComponent size={40} strokeWidth={1.5} />,
      title: t(`services.items.${key}.title`),
      description: t(`services.items.${key}.desc`),
      features: (t(`services.items.${key}.features`, { returnObjects: true }) as string[]),
    };
  });

  return (
    <div className="bg-slate-50 min-h-screen pb-0">
      {/* Dynamic Hero Section */}
      <section className="relative z-10 text-white min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <picture>
            <source
              type="image/webp"
              srcSet="/images/p4483610-640.webp 640w, /images/p4483610-1280.webp 1280w, /images/p4483610-1920.webp 1920w"
              sizes="100vw"
            />
            <img
              src="/images/p4483610-1280.jpg"
              srcSet="/images/p4483610-640.jpg 640w, /images/p4483610-1280.jpg 1280w, /images/p4483610-1920.jpg 1920w"
              alt="Services Cargo"
              sizes="100vw"
              width={1920}
              height={1080}
              className="w-full h-full object-cover scale-105"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </picture>
        </div>
        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-brand-dark/95 via-brand-dark/80 to-transparent" aria-hidden="true" />

        <div className="container mx-auto px-4 text-left relative z-10 mt-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-brand-dark font-black tracking-widest text-sm mb-6 uppercase shadow-lg">
              <Package size={16} /> Prodeklarant
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight drop-shadow-md leading-tight">
              {t('services.title')}
            </h1>
            <p className="text-xl text-slate-200 font-medium leading-relaxed max-w-2xl border-l-4 border-accent pl-5">
              {t('services.subtitle')}
            </p>
          </motion.div>
        </div>

        {/* Modern Geometric Slanted Transition */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10 drop-shadow-[0_-15px_15px_rgba(0,0,0,0.15)]">
          <svg className="relative block w-full h-[60px] md:h-[120px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            {/* Main Slate-50 Background cut */}
            <polygon points="0,120 1200,120 1200,20 0,120" fill="#f8fafc" />
            {/* Accent overlapping glow line */}
            <polygon points="1200,20 1200,26 0,120 0,114" fill="#e8a838" />
            <polygon points="1200,10 1200,20 0,120 0,110" fill="rgba(232, 168, 56, 0.2)" />
            {/* Subtle brand dark corner */}
            <polygon points="0,120 0,100 150,120" fill="transparent" />
          </svg>
        </div>
      </section>

      {/* Modern Services Cards Grid */}
      <section className="py-20 bg-slate-50 relative">
        <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute left-0 bottom-40 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="container mx-auto px-4 relative z-10 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-white rounded-2xl p-8 lg:p-10 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500 border border-slate-100 flex flex-col h-full transform hover:-translate-y-1"
              >
                {/* Visual Accent behind icon */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-brand/5 to-transparent rounded-bl-full rounded-tr-2xl -z-10 group-hover:scale-110 transition-transform duration-500"></div>

                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-brand mb-8 group-hover:bg-brand group-hover:text-white transition-all duration-500 shadow-sm ring-1 ring-slate-100 group-hover:ring-brand/50 group-hover:shadow-[0_10px_20px_rgba(0,54,102,0.2)]">
                  {service.icon}
                </div>

                <h2 className="text-2xl font-extrabold text-slate-900 mb-4 group-hover:text-brand transition-colors tracking-tight">
                  {service.title}
                </h2>

                <p className="text-slate-600 mb-8 leading-relaxed font-medium flex-grow">
                  {service.description}
                </p>

                <div className="space-y-4 pt-6 border-t border-slate-100 mt-auto">
                  {service.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="bg-accent/10 rounded-full p-1 mt-0.5 flex-shrink-0 text-accent group-hover:bg-accent group-hover:text-white transition-colors duration-300">
                        <CheckCircle2 size={14} strokeWidth={3} />
                      </div>
                      <span className="text-sm text-slate-700 font-semibold leading-snug">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Beautiful Process Section */}
      <section className="py-24 relative bg-brand-dark text-white overflow-hidden">
        {/* Abstract Background pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }}></div>
        <div className="absolute -left-[200px] top-[20%] w-[500px] h-[500px] rounded-full bg-accent/20 blur-[120px] pointer-events-none"></div>
        <div className="absolute -right-[200px] bottom-[10%] w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[150px] pointer-events-none"></div>

        <div className="container mx-auto px-4 relative z-10 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="text-accent font-bold uppercase tracking-widest text-sm mb-4 inline-block">{t('services.process.badge')}</span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 uppercase tracking-tight">{t('services.process.title')}</h2>
            <div className="w-20 h-1.5 bg-accent mx-auto rounded-full"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 relative">
            {/* Connector Line (Desktop) with gradient */}
            <div className="hidden md:block absolute top-[44px] left-0 w-full h-1 bg-white/10 -z-10 rounded-full">
              <div className="h-full bg-gradient-to-r from-accent via-brand-light to-accent w-full opacity-50"></div>
            </div>

            {[1, 2, 3, 4].map((step, idx) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="flex flex-col items-center text-center relative group"
              >
                {/* Step Circle */}
                <div className={`w-[88px] h-[88px] rounded-full flex items-center justify-center text-3xl font-black mb-8 shadow-[0_0_30px_rgba(0,0,0,0.3)] z-10 transition-all duration-500 group-hover:scale-110 relative ${step === 4
                  ? 'bg-accent text-brand-dark ring-8 ring-accent/30'
                  : 'bg-brand-dark border-4 border-slate-700 text-slate-300 group-hover:border-accent group-hover:text-white'
                  }`}>
                  {step}
                  {/* Subtle glow behind circle */}
                  <div className={`absolute inset-0 rounded-full blur-md -z-10 bg-accent/0 group-hover:bg-accent/40 transition-colors duration-500`}></div>
                </div>

                {/* Step Content */}
                <h3 className="font-extrabold text-xl mb-3 text-white tracking-wide">{t(`services.process.steps.${step}.title`)}</h3>
                <p className="text-slate-400 font-medium leading-relaxed max-w-xs">{t(`services.process.steps.${step}.desc`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Call to Action */}
      <section className="py-20 bg-accent relative overflow-hidden text-brand-dark text-center">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-8 max-w-3xl mx-auto uppercase tracking-tighter">
            {t('services.cta.title')}
          </h2>
          <p className="text-lg md:text-xl font-medium mb-10 max-w-2xl mx-auto text-brand-dark/80">
            {t('services.cta.desc')}
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-3 bg-brand-dark text-white hover:bg-white hover:text-brand-dark px-8 py-4 rounded-xl font-bold uppercase transition-all duration-300 shadow-xl hover:-translate-y-1 hover:shadow-2xl hover:ring-2 hover:ring-white ring-offset-2 ring-offset-accent"
          >
            {t('layout.contactBtn')} <ChevronRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
