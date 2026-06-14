import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router';
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

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: 'services',
        Component: () => (
          <Suspense fallback={<PageFallback />}>
            <Services />
          </Suspense>
        ),
      },
      {
        path: 'about',
        Component: () => (
          <Suspense fallback={<PageFallback />}>
            <About />
          </Suspense>
        ),
      },
      {
        path: 'contact',
        Component: () => (
          <Suspense fallback={<PageFallback />}>
            <Contact />
          </Suspense>
        ),
      },
      {
        path: 'blog',
        Component: () => (
          <Suspense fallback={<PageFallback />}>
            <Blog />
          </Suspense>
        ),
      },
      {
        path: 'blog/:slug',
        Component: () => (
          <Suspense fallback={<PageFallback />}>
            <BlogPost />
          </Suspense>
        ),
      },
      {
        path: 'admin',
        Component: () => (
          <Suspense fallback={<PageFallback />}>
            <AdminLogin />
          </Suspense>
        ),
      },
      {
        path: 'admin/blog',
        Component: () => (
          <Suspense fallback={<PageFallback />}>
            <AdminBlog />
          </Suspense>
        ),
      },
      {
        path: 'admin/blog/new',
        Component: () => (
          <Suspense fallback={<PageFallback />}>
            <AdminPostForm />
          </Suspense>
        ),
      },
      {
        path: 'admin/blog/:id/edit',
        Component: () => (
          <Suspense fallback={<PageFallback />}>
            <AdminPostForm />
          </Suspense>
        ),
      },
      {
        path: '*',
        Component: () => (
          <Suspense fallback={<PageFallback />}>
            <NotFound />
          </Suspense>
        ),
      },
    ],
  },
]);
