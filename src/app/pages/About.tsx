import React from 'react';
import { motion } from 'motion/react';
import { Award, Users, FileCheck, Globe, Package, DollarSign, Check, Shield, Eye, Target, Zap, Briefcase } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

export default function About() {
  const { t } = useTranslation();
  const stats = [
    { label: t('about.stats.experience'), value: '10', icon: Award },
    { label: t('about.stats.clients'), value: '100+', icon: Users },
    { label: t('about.stats.cargo'), value: '15 000+', icon: FileCheck },
    { label: t('about.stats.countries'), value: '30+', icon: Globe },
    { label: t('about.stats.exportVolume'), value: '300M+', icon: Package },
    { label: t('about.stats.exportValue'), value: '400M+', icon: DollarSign },
  ];
  const valueIcons = [Shield, Eye, Target, Zap, Briefcase];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Hero */}
      <section className="relative z-10 text-white py-16 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.pexels.com/photos/264537/pexels-photo-264537.jpeg?auto=compress&cs=tinysrgb&w=1920"
            srcSet="https://images.pexels.com/photos/264537/pexels-photo-264537.jpeg?auto=compress&cs=tinysrgb&w=640 640w, https://images.pexels.com/photos/264537/pexels-photo-264537.jpeg?auto=compress&cs=tinysrgb&w=1024 1024w, https://images.pexels.com/photos/264537/pexels-photo-264537.jpeg?auto=compress&cs=tinysrgb&w=1920 1920w"
            sizes="100vw"
            alt=""
            width={1920}
            height={1080}
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-brand-dark/75" aria-hidden="true" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-5xl font-bold mb-4 tracking-tight"
          >
            {t('about.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg md:text-xl text-slate-200 max-w-2xl mx-auto font-light"
          >
            {t('about.subtitle')}
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 md:py-20 max-w-5xl">
        {/* Intro + Quote */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 md:mb-24"
        >
          <p className="text-slate-600 leading-relaxed text-lg mb-6">
            {t('about.intro.p1')}
          </p>
          <div className="bg-white border-l-4 border-accent pl-6 pr-6 py-5 rounded-r-lg shadow-sm">
            <p className="text-slate-800 text-lg md:text-xl font-medium italic">
              «{t('about.quote')}»
            </p>
          </div>
        </motion.section>

        {/* Approach */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 md:mb-24"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 border-l-4 border-accent pl-4">
            {t('about.approach.title')}
          </h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            {t('about.approach.lead')}
          </p>
          <ul className="space-y-3 mb-8">
            {(t('about.approach.items', { returnObjects: true }) as string[]).map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-700">
                <Check className="flex-shrink-0 text-accent mt-0.5" size={20} strokeWidth={2.5} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-slate-800 font-semibold text-lg">
            {t('about.approach.goal')}
          </p>
        </motion.section>
      </div>

      {/* Stats */}
      <section className="bg-brand-dark text-white py-14">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-10">
            {t('about.stats.title')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8 text-center">
            {stats.map(({ label, value, icon: Icon }, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="flex flex-col items-center"
              >
                <div className="text-accent mb-3">
                  <Icon size={26} strokeWidth={1.5} />
                </div>
                <div className="text-2xl md:text-3xl font-bold mb-1">{value}</div>
                <div className="text-slate-400 text-xs md:text-sm uppercase tracking-wider leading-tight">{label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 md:py-20 max-w-5xl">
        {/* Why choose us */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 md:mb-24"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 border-l-4 border-accent pl-4">
            {t('about.why.title')}
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(t('about.why.items', { returnObjects: true }) as string[]).map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-slate-700 bg-white px-4 py-3 rounded-lg shadow-sm border border-slate-100">
                <Check className="flex-shrink-0 text-green-600" size={20} strokeWidth={2.5} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.section>

        {/* Mission */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 md:mb-24"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 border-l-4 border-accent pl-4">
            {t('about.mission.title')}
          </h2>
          <p className="text-slate-600 leading-relaxed text-lg mb-4">
            {t('about.mission.text')}
          </p>
          <p className="text-slate-700 font-medium italic">
            {t('about.mission.trust')}
          </p>
        </motion.section>

        {/* Values */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 md:mb-24"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 border-l-4 border-accent pl-4">
            {t('about.values.title')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {(t('about.values.items', { returnObjects: true }) as string[]).map((item, i) => {
              const Icon = valueIcons[i] ?? Award;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-xl p-5 text-center shadow-sm border border-slate-100 hover:border-accent/30 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex justify-center mb-3 text-accent">
                    <Icon size={28} strokeWidth={1.5} />
                  </div>
                  <span className="text-slate-800 font-semibold text-sm">{item}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Closing CTA */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xl font-semibold text-slate-800 mb-12"
        >
          {t('about.closing')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-brand-dark text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-dark/90 transition-colors"
          >
            {t('layout.footer.contactTitle')}
            <span aria-hidden="true">→</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
