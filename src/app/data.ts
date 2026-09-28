import type { LoaderFunctionArgs } from 'react-router';
import { getPosts, getPost, getPostBySlug, type BlogPost } from './api';

/**
 * Route loader'lar — sahifa ma'lumotlari render'dan OLDIN tayyor bo'lishi uchun.
 *
 * Serverda (SSR) Express `requestContext` sifatida DB'dan to'g'ridan-to'g'ri o'qiydigan
 * funksiyalarni beradi (o'ziga HTTP so'rov yubormaydi). Brauzerda esa /api orqali olinadi.
 * Loader'lar hech qachon xato tashlamaydi: API ishlamasa sahifa bo'sh ro'yxat bilan ochiladi.
 */
export type DataContext = {
  listPosts: (limit: number) => BlogPost[] | Promise<BlogPost[]>;
  findPost: (slug: string) => BlogPost | null | Promise<BlogPost | null>;
};

export type PostsData = { posts: BlogPost[] };
export type PostData = { post: BlogPost | null };

function serverData(context: unknown): DataContext | null {
  const c = context as Partial<DataContext> | null | undefined;
  return c && typeof c.listPosts === 'function' && typeof c.findPost === 'function' ? (c as DataContext) : null;
}

async function loadPosts(context: unknown, limit: number): Promise<PostsData> {
  try {
    const server = serverData(context);
    const posts = server ? await server.listPosts(limit) : await getPosts(limit);
    return { posts };
  } catch {
    return { posts: [] };
  }
}

export function homeLoader({ context }: LoaderFunctionArgs): Promise<PostsData> {
  return loadPosts(context, 3);
}

export function blogLoader({ context }: LoaderFunctionArgs): Promise<PostsData> {
  return loadPosts(context, 50);
}

export async function blogPostLoader({ context, params }: LoaderFunctionArgs): Promise<PostData> {
  const slug = String(params.slug || '').trim().toLowerCase();
  if (!slug) return { post: null };
  try {
    const server = serverData(context);
    if (server) return { post: await server.findPost(slug) };
    // Eski format: "<id>-..." → id bo'yicha
    const legacy = slug.match(/^(\d+)-(.+)$/);
    return { post: legacy ? await getPost(Number(legacy[1])) : await getPostBySlug(slug) };
  } catch {
    return { post: null };
  }
}
