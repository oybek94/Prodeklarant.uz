import { lazy, Suspense, type ComponentType } from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router';
import Layout from './Layout';
import Home from './pages/Home';
import { ErrorPage } from './pages/ErrorPage';

// Home — eng muhim (landing) sahifa: eager yuklanadi, shunda Suspense fallback'dan
// to'liq sahifaga almashish (CLS) bo'lmaydi va LCP'da qo'shimcha chunk round-trip yo'qoladi.
// Qolgan sahifalar lazy — boshlang'ich bundle kichik qoladi.
const Services = lazy(() => import('./pages/Services'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminBlog = lazy(() => import('./pages/AdminBlog'));
const AdminPostForm = lazy(() => import('./pages/AdminPostForm'));
const NotFound = lazy(() => import('./pages/NotFound'));

function PageFallback() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" aria-hidden="true" />
    </div>
  );
}

/** lazy komponentni Suspense bilan o'raydi */
function wrap(C: ComponentType) {
  return () => (
    <Suspense fallback={<PageFallback />}>
      <C />
    </Suspense>
  );
}

// Ko'p tilli public sahifalar. Har til daraxtida yangi obyektlar bilan ishlatiladi
// (react-router route obyektlarini qayta ishlatishdan qochamiz).
function publicChildren(): RouteObject[] {
  return [
    { index: true, Component: Home },
    { path: 'services', Component: wrap(Services) },
    { path: 'about', Component: wrap(About) },
    { path: 'contact', Component: wrap(Contact) },
    { path: 'blog', Component: wrap(Blog) },
    { path: 'blog/:slug', Component: wrap(BlogPost) },
    { path: '*', Component: wrap(NotFound) },
  ];
}

// Admin — faqat default (uz) yo'lda, tilga bog'liq emas.
function adminChildren(): RouteObject[] {
  return [
    { path: 'admin', Component: wrap(AdminLogin) },
    { path: 'admin/blog', Component: wrap(AdminBlog) },
    { path: 'admin/blog/new', Component: wrap(AdminPostForm) },
    { path: 'admin/blog/:id/edit', Component: wrap(AdminPostForm) },
  ];
}

export const router = createBrowserRouter([
  {
    path: '/ru',
    Component: Layout,
    errorElement: <ErrorPage />,
    children: publicChildren(),
  },
  {
    path: '/en',
    Component: Layout,
    errorElement: <ErrorPage />,
    children: publicChildren(),
  },
  {
    path: '/',
    Component: Layout,
    errorElement: <ErrorPage />,
    children: [...adminChildren(), ...publicChildren()],
  },
]);
