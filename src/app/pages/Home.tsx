import { useMemo } from 'react';
import { useLoaderData } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { HomeData } from '../data';
import { fallbackBlogImage } from '../utils/blogImages';
import Testimonials from '../components/Testimonials';
import Hero from '../components/home/Hero';
import Partners from '../components/home/Partners';
import Why from '../components/home/Why';
import ServicesPicker from '../components/home/ServicesPicker';
import Process from '../components/home/Process';
import Products from '../components/home/Products';
import Results from '../components/home/Results';
import Tariffs from '../components/home/Tariffs';
import BlogPreview from '../components/home/BlogPreview';
import ContactSection from '../components/home/ContactSection';

export default function Home() {
  const { i18n } = useTranslation();
  const { posts, stats } = useLoaderData() as HomeData;
  const lang = (i18n.language?.split('-')[0] || 'uz') as 'uz' | 'ru' | 'en';

  const latestPosts = useMemo(
    () =>
      posts.slice(0, 3).map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title[lang],
        excerpt: (p.excerpt[lang] || '').replace(/<[^>]*>/g, '').slice(0, 160),
        date: p.date || p.created_at || '',
        image: p.image || fallbackBlogImage(p.id),
      })),
    [posts, lang]
  );

  return (
    <div className="pd pd-home" style={{ position: 'relative', overflowX: 'hidden', background: '#fff' }}>
      <Hero />
      <Partners />
      <Why />
      <ServicesPicker />
      <Process />
      <Products />
      <Results stats={stats} />
      <Tariffs />

      {/* site-data.json'dan: mijozlar fikri — bo'sh bo'lsa chizilmaydi */}
      <Testimonials />

      {/* Maqola bo'lmasa blok chizilmaydi; raqamlash shunga moslashadi */}
      {latestPosts.length > 0 && <BlogPreview posts={latestPosts} num="07" />}
      <ContactSection num={latestPosts.length > 0 ? '08' : '07'} />
    </div>
  );
}
