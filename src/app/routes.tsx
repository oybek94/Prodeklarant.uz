import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router';
import Layout from './Layout';

// Lazy-load pages so initial bundle is smaller (~234 KiB savings)
const Home = lazy(() => import('./pages/Home'));
const Services = lazy(() => import('./pages/Services'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminBlog = lazy(() => import('./pages/AdminBlog'));
const AdminPostForm = lazy(() => import('./pages/AdminPostForm'));

function PageFallback() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      {
        index: true,
        Component: () => (
          <Suspense fallback={<PageFallback />}>
            <Home />
          </Suspense>
        ),
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
    ],
  },
]);
