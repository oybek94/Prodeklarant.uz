const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('admin_token');
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (res.status === 401) {
    localStorage.removeItem('admin_token');
    window.location.href = '/admin';
  }
  return res;
}

export async function login(password: string): Promise<{ token: string }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export type BlogPost = {
  id: number;
  title: { uz: string; ru: string; en: string };
  excerpt: { uz: string; ru: string; en: string };
  body: { uz: string; ru: string; en: string };
  date: string;
  category: { uz: string; ru: string; en: string };
  image: string;
  author: string;
  views?: number;
  created_at: string;
};

export async function getPosts(): Promise<BlogPost[]> {
  const res = await apiFetch('/posts');
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
}

export async function getPost(id: number): Promise<BlogPost> {
  const res = await apiFetch(`/posts/${id}`);
  if (!res.ok) throw new Error('Failed to fetch post');
  return res.json();
}

export async function createPost(data: Omit<BlogPost, 'id' | 'created_at'>): Promise<BlogPost> {
  const payload = {
    title_uz: data.title.uz, title_ru: data.title.ru, title_en: data.title.en,
    excerpt_uz: data.excerpt.uz, excerpt_ru: data.excerpt.ru, excerpt_en: data.excerpt.en,
    body_uz: data.body.uz, body_ru: data.body.ru, body_en: data.body.en,
    date: data.date,
    category_uz: data.category.uz, category_ru: data.category.ru, category_en: data.category.en,
    image: data.image, author: data.author,
  };
  const res = await apiFetch('/posts', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create post');
  }
  return res.json();
}

export async function updatePost(id: number, data: Partial<Omit<BlogPost, 'id' | 'created_at'>>): Promise<BlogPost> {
  const payload: Record<string, string> = {};
  if (data.title) Object.assign(payload, { title_uz: data.title.uz, title_ru: data.title.ru, title_en: data.title.en });
  if (data.excerpt) Object.assign(payload, { excerpt_uz: data.excerpt.uz, excerpt_ru: data.excerpt.ru, excerpt_en: data.excerpt.en });
  if (data.body) Object.assign(payload, { body_uz: data.body.uz, body_ru: data.body.ru, body_en: data.body.en });
  if (data.date) payload.date = data.date;
  if (data.category) Object.assign(payload, { category_uz: data.category.uz, category_ru: data.category.ru, category_en: data.category.en });
  if (data.image !== undefined) payload.image = data.image;
  if (data.author !== undefined) payload.author = data.author;

  const res = await apiFetch(`/posts/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update post');
  }
  return res.json();
}

export async function deletePost(id: number): Promise<void> {
  const res = await apiFetch(`/posts/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete post');
}

export type TranslateResult = {
  uz: { title: string; excerpt: string; body: string; category: string } | null;
  ru: { title: string; excerpt: string; body: string; category: string } | null;
  en: { title: string; excerpt: string; body: string; category: string } | null;
};

export async function translatePost(
  sourceLang: 'uz' | 'ru' | 'en',
  fields: { title: string; excerpt: string; body: string; category: string }
): Promise<TranslateResult> {
  const res = await apiFetch('/translate', {
    method: 'POST',
    body: JSON.stringify({
      sourceLang,
      title: fields.title,
      excerpt: fields.excerpt,
      body: fields.body,
      category: fields.category,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Tarjima xatosi');
  return data;
}

export async function uploadImage(file: File): Promise<string> {
  const token = getToken();
  if (!token) throw new Error('Avtorizatsiya talab qilinadi');
  const form = new FormData();
  form.append('image', file);
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Yuklash xatosi');
  return data.url;
}
