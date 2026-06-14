import { motion } from 'motion/react';
import { Award, Users, FileCheck, Globe, Package, DollarSign, Check, Shield, Eye, Target, Zap, Briefcase, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

export default function About() {
  const { t } = useTranslation();
  const stats = [
    { label: t('about.stats.experience'), value: '10+', icon: Award },
    { label: t('about.stats.clients'), value: '100+', icon: Users },
    { label: t('about.stats.cargo'), value: '15 000+', icon: FileCheck },
    { label: t('about.stats.countries'), value: '30+', icon: Globe },
    { label: t('about.stats.exportVolume'), value: '300M+', icon: Package },
    { label: t('about.stats.exportValue'), value: '400M+', icon: DollarSign },
  ];
  const valueIcons = [Shield, Eye, Target, Zap, Briefcase];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 overflow-hidden">
      {/* Dynamic Hero Section */}
      <section className="relative z-10 text-white min-h-[60vh] flex items-center justify-center overflow-hidden">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute inset-0 z-0"
        >
          <picture>
            <source
              type="image/webp"
              srcSet="/images/p264537-640.webp 640w, /images/p264537-1280.webp 1280w, /images/p264537-1920.webp 1920w"
              sizes="100vw"
            />
            <img
              src="/images/p264537-1280.jpg"
              srcSet="/images/p264537-640.jpg 640w, /images/p264537-1280.jpg 1280w, /images/p264537-1920.jpg 1920w"
              sizes="100vw"
              alt=""
              width={1920}
              height={1080}
              className="w-full h-full object-cover"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/80 via-brand-dark/60 to-brand-dark/90" aria-hidden="true" />
        </motion.div>

        <div className="container mx-auto px-4 relative z-10 text-center mt-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <span className="px-5 py-2 rounded-full bg-accent/20 text-accent font-bold uppercase tracking-widest text-sm mb-6 inline-block border border-accent/20 shadow-sm">
              Prodeklarant
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">
              {t('about.title')}
            </h1>
            <p className="text-lg md:text-xl md:leading-relaxed text-slate-300 max-w-2xl mx-auto font-medium">
              {t('about.subtitle')}
            </p>
          </motion.div>
        </div>

        {/* Wave decoration SVG at the bottom */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none block">
          <svg className="relative block w-full h-[40px] md:h-[80px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118,130.83,122.5,193.5,107.5C236.72,97.16,280.4,75.9,321.39,56.44Z" className="fill-slate-50"></path>
          </svg>
        </div>
      </section>

      {/* Modern Intro with Image Split */}
      <section className="py-20 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-brand/5 blur-3xl rounded-full"></div>
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="lg:w-1/2 w-full"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-brand translate-x-4 translate-y-4 md:translate-x-6 md:translate-y-6 rounded-2xl -z-10"></div>
                <picture>
                  <source srcSet="/images/p3184291-800.webp" type="image/webp" />
                  <img
                    src="/images/p3184291-800.jpg"
                    width={800}
                    height={533}
                    alt="Team collaboration"
                    className="rounded-2xl shadow-2xl w-full h-auto object-cover relative z-10"
                  />
                </picture>
                <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-xl shadow-xl z-20 hidden md:block border-l-4 border-accent max-w-xs ring-1 ring-slate-100">
                  <p className="font-bold text-slate-800 text-lg">«{t('about.quote')}»</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:w-1/2 w-full space-y-8"
            >
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand/10 text-brand font-bold uppercase tracking-wider text-sm mb-4">
                  <Users size={16} /> {t('about.intro.badge')}
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight mb-6 tracking-tight">
                  <span dangerouslySetInnerHTML={{ __html: t('about.intro.slogan1') }} /> <span className="text-brand">{t('about.intro.slogan2')}</span>
                </h2>
                <p className="text-slate-600 leading-relaxed text-lg font-medium">
                  {t('about.intro.p1')}
                </p>
              </div>

              <div className="pt-8 border-t border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                  <div className="p-2 bg-accent/20 rounded-lg text-accent">
                    <Target size={24} />
                  </div>
                  {t('about.mission.title')}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {t('about.mission.text')}
                </p>
              </div>

              <div className="md:hidden bg-white p-6 rounded-xl shadow-sm border-l-4 border-accent mt-6">
                <p className="font-bold text-slate-800">«{t('about.quote')}»</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Floating Animated Stats */}
      <section className="py-24 bg-gradient-to-b from-brand-dark to-[#001f3f] text-white relative overflow-hidden shadow-inner">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-accent/20 blur-[150px] rounded-full pointer-events-none"></div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">{t('about.stats.title')}</h2>
            <div className="w-24 h-1.5 bg-accent mx-auto rounded-full"></div>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 max-w-6xl mx-auto">
            {stats.map(({ label, value, icon: Icon }, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 flex flex-col items-center justify-center text-center border border-white/10 hover:border-accent/40 hover:bg-white/10 transition-all group shadow-xl"
              >
                <div className="text-white/60 group-hover:text-accent group-hover:-translate-y-2 transition-all duration-300 mb-6 bg-white/5 group-hover:bg-accent/10 p-4 rounded-full">
                  <Icon size={32} strokeWidth={2} />
                </div>
                <div className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 text-white drop-shadow-md tracking-tight">{value}</div>
                <div className="text-slate-300 text-xs md:text-sm font-bold uppercase tracking-widest">{label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Approach with Grid Cards */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">{t('about.approach.title')}</h2>
            <p className="text-slate-600 text-lg md:text-xl font-medium leading-relaxed">{t('about.approach.lead')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {(t('about.approach.items', { returnObjects: true }) as string[]).map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-50 rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-2xl hover:border-brand/20 transition-all duration-500 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                <div className="w-14 h-14 bg-white shadow-sm ring-1 ring-slate-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand group-hover:text-white group-hover:ring-brand text-slate-400 transition-all duration-300">
                  <span className="text-2xl font-black">{i + 1}</span>
                </div>
                <p className="text-slate-700 font-semibold leading-relaxed text-lg">{item}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-brand to-brand-light rounded-3xl p-10 md:p-14 text-center text-white shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-accent/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

            <p className="relative z-10 text-xl md:text-3xl font-extrabold leading-tight max-w-4xl mx-auto drop-shadow-md">
              {t('about.approach.goal')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us & Values Split Section */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

            {/* Why Us List */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-10 inline-block relative tracking-tight">
                {t('about.why.title')}
                <span className="absolute -bottom-3 left-0 w-1/3 h-1.5 bg-accent rounded-full"></span>
              </h2>
              <div className="space-y-5">
                {(t('about.why.items', { returnObjects: true }) as string[]).map((item, i) => (
                  <div key={i} className="flex items-start gap-5 bg-white p-5 rounded-2xl hover:shadow-lg transition-all border border-slate-100 group">
                    <div className="bg-green-50 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 group-hover:bg-green-100 transition-all">
                      <Check className="text-green-600" size={20} strokeWidth={3} />
                    </div>
                    <span className="text-slate-700 font-bold text-lg leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Core Values Grid */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-10 inline-block relative tracking-tight">
                {t('about.values.title')}
                <span className="absolute -bottom-3 left-0 w-1/3 h-1.5 bg-brand rounded-full"></span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-5">
                {(t('about.values.items', { returnObjects: true }) as string[]).map((item, i) => {
                  const Icon = valueIcons[i] ?? Award;
                  return (
                    <div
                      key={i}
                      className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-brand/30 transition-all duration-300 flex flex-col items-center text-center"
                    >
                      <div className="w-16 h-16 bg-brand/5 rounded-2xl flex items-center justify-center text-brand group-hover:bg-brand group-hover:text-white transition-colors mb-4 transform group-hover:rotate-6">
                        <Icon size={32} strokeWidth={2} />
                      </div>
                      <span className="font-bold text-slate-800 text-lg">{item}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-10 bg-brand/5 p-6 rounded-2xl border-l-4 border-brand">
                <p className="text-slate-800 font-bold italic text-lg leading-relaxed">
                  "{t('about.mission.trust')}"
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-brand-dark relative overflow-hidden text-center text-white">
        <div className="absolute inset-0 z-0 opacity-20">
          <picture>
            <source srcSet="/images/p5842828-1280.webp" type="image/webp" />
            <img src="/images/p5842828-1280.jpg" alt="" aria-hidden="true" loading="lazy" className="w-full h-full object-cover" />
          </picture>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/95 to-brand-dark/90 z-0"></div>
        <div className="container mx-auto px-4 relative z-10 max-w-4xl">
          <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-8 ring-4 ring-accent/30">
            <Award size={40} className="text-accent" />
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-10 tracking-tight leading-tight">{t('about.closing')}</h2>
          <Link
            to="/contact"
            className="group inline-flex items-center gap-3 bg-accent hover:bg-white text-brand-dark font-black uppercase px-10 py-5 rounded-2xl text-lg transition-all hover:scale-105 active:scale-95 shadow-[0_10px_40px_rgba(232,168,56,0.3)] hover:shadow-[0_15px_50px_rgba(255,255,255,0.4)]"
          >
            {t('layout.footer.contactTitle')}
            <ChevronRight size={24} className="group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
