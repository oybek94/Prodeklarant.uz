import { lazy, Suspense, type ComponentType } from 'react';
import type { RouteObject } from 'react-router';
import Layout from './Layout';
import Home from './pages/Home';
import { ErrorPage } from './pages/ErrorPage';
import { homeLoader, blogLoader, blogPostLoader } from './data';

type PageModule = { default: ComponentType };

/**
 * Lazy sahifa + oldindan yuklash (preload).
 *
 * SSR'dan keyin hydration paytida lazy chunk hali yuklanmagan bo'lsa, React server HTML'ni
 * saqlab turadi, lekin shu vaqtda yuqoridagi komponent yangilansa Suspense fallback'ga
 * qaytib ketishi (miltillash/CLS) mumkin. Shuning uchun main.tsx hydration'dan OLDIN
 * joriy marshrut sahifasini `handle.preload()` orqali yuklab oladi — keyin sahifa
 * sinxron render bo'ladi.
 */
function lazyPage(factory: () => Promise<PageModule>) {
  let Loaded: ComponentType | null = null;
  const Lazy = lazy(factory);
  const preload = () =>
    factory().then((m) => {
      Loaded = m.default;
    });
  function Page() {
    const C = Loaded ?? Lazy;
    return (
      <Suspense fallback={<PageFallback />}>
        <C />
      </Suspense>
    );
  }
  return { Component: Page, handle: { preload } };
}

// Home — eng muhim (landing) sahifa: eager yuklanadi, shunda Suspense fallback'dan
// to'liq sahifaga almashish (CLS) bo'lmaydi va LCP'da qo'shimcha chunk round-trip yo'qoladi.
// Qolgan sahifalar lazy — boshlang'ich bundle kichik qoladi.
const Services = lazyPage(() => import('./pages/Services'));
const ServicePage = lazyPage(() => import('./pages/ServicePage'));
const About = lazyPage(() => import('./pages/About'));
const Contact = lazyPage(() => import('./pages/Contact'));
const Blog = lazyPage(() => import('./pages/Blog'));
const BlogPost = lazyPage(() => import('./pages/BlogPost'));
const AdminLogin = lazyPage(() => import('./pages/AdminLogin'));
const AdminBlog = lazyPage(() => import('./pages/AdminBlog'));
const AdminPostForm = lazyPage(() => import('./pages/AdminPostForm'));
const AdminLeads = lazyPage(() => import('./pages/AdminLeads'));
const NotFound = lazyPage(() => import('./pages/NotFound'));

function PageFallback() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" aria-hidden="true" />
    </div>
  );
}

// Ko'p tilli public sahifalar. Har til daraxtida yangi obyektlar bilan ishlatiladi
// (react-router route obyektlarini qayta ishlatishdan qochamiz).
function publicChildren(): RouteObject[] {
  return [
    { index: true, Component: Home, loader: homeLoader },
    { path: 'services', ...Services },
    { path: 'services/:slug', ...ServicePage },
    { path: 'about', ...About },
    { path: 'contact', ...Contact },
    { path: 'blog', ...Blog, loader: blogLoader },
    { path: 'blog/:slug', ...BlogPost, loader: blogPostLoader },
    { path: '*', ...NotFound },
  ];
}

// Admin — faqat default (uz) yo'lda, tilga bog'liq emas. Server admin sahifalarini
// SSR qilmaydi (faqat brauzerda render bo'ladi).
function adminChildren(): RouteObject[] {
  return [
    { path: 'admin', ...AdminLogin },
    { path: 'admin/blog', ...AdminBlog },
    { path: 'admin/blog/new', ...AdminPostForm },
    { path: 'admin/blog/:id/edit', ...AdminPostForm },
    { path: 'admin/leads', ...AdminLeads },
  ];
}

function layoutRoute(path: string, children: RouteObject[]): RouteObject {
  return {
    path,
    Component: Layout,
    errorElement: <ErrorPage />,
    // SSR bo'lmagan (dev / admin) holatda loader'lar tugaguncha ko'rsatiladi
    HydrateFallback: PageFallback,
    children,
  };
}

export const routes: RouteObject[] = [
  layoutRoute('/ru', publicChildren()),
  layoutRoute('/en', publicChildren()),
  layoutRoute('/', [...adminChildren(), ...publicChildren()]),
];
