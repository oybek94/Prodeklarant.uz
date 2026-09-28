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
  slug: string;
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

/** Postlar ro'yxati. Server `{ data, pagination }` qaytaradi (limit ≤ 50). */
export async function getPosts(limit = 50): Promise<BlogPost[]> {
  const res = await apiFetch(`/posts?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch posts');
  const json = await res.json();
  return Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : [];
}

export async function getPost(id: number): Promise<BlogPost> {
  const res = await apiFetch(`/posts/${id}`);
  if (!res.ok) throw new Error('Failed to fetch post');
  return res.json();
}

export async function getPostBySlug(slug: string): Promise<BlogPost> {
  const res = await apiFetch(`/posts/slug/${encodeURIComponent(slug)}`);
  if (!res.ok) throw new Error('Failed to fetch post');
  return res.json();
}

/** Maqola sahifasi ochilganda ko'rishlar sonini bir marta oshiradi (best-effort). */
export async function incrementView(id: number): Promise<void> {
  try {
    await apiFetch(`/posts/${id}/view`, { method: 'POST' });
  } catch {
    // view hisoblash muhim emas — xatoni yutamiz
  }
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
  const text = await res.text();
  if (res.status === 504) {
    throw new Error(
      "Tarjima vaqti tugadi (504). Matnni qisqartirib yoki keyinroq qayta urinib ko'ring."
    );
  }
  let data: TranslateResult & { error?: string };
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      "Tarjima xatosi: server javob bermadi. Keyinroq qayta urinib ko'ring."
    );
  }
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

// ---- Arizalar (leads) ----

export type LeadPayload = {
  name: string;
  phone: string;
  product: string;
  country?: string;
  comment?: string;
  tariff?: string | null;
  locale: string;
  sourcePath: string;
  /** honeypot — odam uchun doim bo'sh */
  website?: string;
};

/** Server xatosi: `code` — validation | rate | server; `fields` — maydon → xato kodi. */
export class LeadError extends Error {
  constructor(public code: 'validation' | 'rate' | 'server', public fields: Record<string, string> = {}) {
    super(code);
  }
}

/** Ommaviy forma — admin token yuborilmaydi. */
export async function submitLead(payload: LeadPayload): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new LeadError('server');
  }
  if (res.ok) return;
  if (res.status === 429) throw new LeadError('rate');
  const data = await res.json().catch(() => ({}));
  if (res.status === 400 && data?.fields) throw new LeadError('validation', data.fields);
  throw new LeadError('server');
}

export type LeadStatus = 'new' | 'contacted' | 'closed';
export type Lead = {
  id: number;
  name: string;
  phone: string;
  product: string | null;
  country: string | null;
  comment: string | null;
  tariff: string | null;
  source_path: string | null;
  locale: string | null;
  status: LeadStatus;
  telegram_sent: number;
  created_at: string;
};

export async function getLeads(page = 1, status?: LeadStatus): Promise<{ data: Lead[]; pagination: { total: number; page: number; totalPages: number } }> {
  const q = new URLSearchParams({ page: String(page), limit: '50' });
  if (status) q.set('status', status);
  const res = await apiFetch(`/leads?${q}`);
  if (!res.ok) throw new Error('Arizalarni yuklab bo\'lmadi');
  return res.json();
}

export async function updateLeadStatus(id: number, status: LeadStatus): Promise<void> {
  const res = await apiFetch(`/leads/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
  if (!res.ok) throw new Error('Holatni saqlab bo\'lmadi');
}
