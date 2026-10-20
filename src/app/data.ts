import type { LoaderFunctionArgs } from 'react-router';
import { getPosts, getPost, getPostBySlug, type BlogPost } from './api';
import { getSiteStats, type SiteStats } from './utils/siteStats';

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
  /** CRM statistikasi (ixtiyoriy). Yo'q yoki null bo'lsa "Raqamlarda" bloki chizilmaydi. */
  getStats?: () => SiteStats | null | Promise<SiteStats | null>;
};

/** Ro'yxat sahifalari uchun — to'liq matn (body) kerak emas. */
export type PostSummary = Omit<BlogPost, 'body'>;
export type PostsData = { posts: PostSummary[] };
export type HomeData = PostsData & { stats: SiteStats | null };
export type PostData = { post: BlogPost | null; related: PostSummary[] };

function serverData(context: unknown): DataContext | null {
  const c = context as Partial<DataContext> | null | undefined;
  return c && typeof c.listPosts === 'function' && typeof c.findPost === 'function' ? (c as DataContext) : null;
}

async function loadPosts(context: unknown, limit: number): Promise<PostsData> {
  try {
    const server = serverData(context);
    const posts = server ? await server.listPosts(limit) : await getPosts(limit);
    // body'ni tashlaymiz: SSR hydration JSON'i (HTML ichida) keraksiz kattalashmasin
    return { posts: posts.map(({ body: _body, ...summary }) => summary) };
  } catch {
    return { posts: [] };
  }
}

export async function homeLoader({ context }: LoaderFunctionArgs): Promise<HomeData> {
  const [{ posts }, stats] = await Promise.all([loadPosts(context, 3), loadStats(context)]);
  return { posts, stats };
}

async function loadStats(context: unknown): Promise<SiteStats | null> {
  try {
    const server = serverData(context);
    if (server) return (await server.getStats?.()) ?? null;
    return await getSiteStats();
  } catch {
    return null;
  }
}

export function blogLoader({ context }: LoaderFunctionArgs): Promise<PostsData> {
  return loadPosts(context, 50);
}

export async function blogPostLoader({ context, params }: LoaderFunctionArgs): Promise<PostData> {
  const slug = String(params.slug || '').trim().toLowerCase();
  if (!slug) return { post: null, related: [] };
  try {
    const server = serverData(context);
    let post: BlogPost | null;
    if (server) {
      post = await server.findPost(slug);
    } else {
      // Eski format: "<id>-..." → id bo'yicha
      const legacy = slug.match(/^(\d+)-(.+)$/);
      post = legacy ? await getPost(Number(legacy[1])) : await getPostBySlug(slug);
    }
    if (!post) return { post: null, related: [] };
    // "O'xshash maqolalar": joriy maqoladan boshqa eng yangi 2 tasi
    const { posts } = await loadPosts(context, 4);
    return { post, related: posts.filter((p) => p.id !== post!.id).slice(0, 2) };
  } catch {
    return { post: null, related: [] };
  }
}
