import { createBrowserRouter } from 'react-router';
import Layout from './Layout';
import Home from './pages/Home';
import Services from './pages/Services';
import About from './pages/About';
import Contact from './pages/Contact';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import AdminLogin from './pages/AdminLogin';
import AdminBlog from './pages/AdminBlog';
import AdminPostForm from './pages/AdminPostForm';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: 'services',
        Component: Services,
      },
      {
        path: 'about',
        Component: About,
      },
      {
        path: 'contact',
        Component: Contact,
      },
      {
        path: 'blog',
        Component: Blog,
      },
      {
        path: 'blog/:id',
        Component: BlogPost,
      },
      {
        path: 'admin',
        Component: AdminLogin,
      },
      {
        path: 'admin/blog',
        Component: AdminBlog,
      },
      {
        path: 'admin/blog/new',
        Component: AdminPostForm,
      },
      {
        path: 'admin/blog/:id/edit',
        Component: AdminPostForm,
      },
    ],
  },
]);
