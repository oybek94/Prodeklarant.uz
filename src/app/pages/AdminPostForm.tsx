import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';

function useAuthGuard() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!localStorage.getItem('admin_token')) navigate('/admin', { replace: true });
  }, [navigate]);
}
import { ArrowLeft, Upload, Languages } from 'lucide-react';
import { getPost, createPost, updatePost, uploadImage, translatePost, type BlogPost } from '../api';

const emptyPost: Omit<BlogPost, 'id' | 'created_at'> = {
  title: { uz: '', ru: '', en: '' },
  excerpt: { uz: '', ru: '', en: '' },
  body: { uz: '', ru: '', en: '' },
  date: new Date().toISOString().slice(0, 10),
  category: { uz: 'Blog', ru: 'Блог', en: 'Blog' },
  image: '',
  author: '',
};

const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas error'));
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('Blob error'));
          const newFileName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
          const newFile = new File([blob], newFileName, {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          resolve(newFile);
        }, 'image/webp', 0.85);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

export default function AdminPostForm() {
  useAuthGuard();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState<Omit<BlogPost, 'id' | 'created_at'>>(emptyPost);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [translating, setTranslating] = useState<'uz' | 'ru' | 'en' | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit && id) {
      getPost(Number(id))
        .then((p) =>
          setForm({
            title: p.title,
            excerpt: p.excerpt,
            body: p.body,
            date: p.date.slice(0, 10),
            category: p.category,
            image: p.image,
            author: p.author,
          })
        )
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, [isEdit, id]);

  const update = (lang: 'uz' | 'ru' | 'en', field: 'title' | 'excerpt' | 'body' | 'category', value: string) => {
    setForm((f) => ({ ...f, [field]: { ...f[field], [lang]: value } }));
  };

  const handleTranslate = async (sourceLang: 'uz' | 'ru' | 'en') => {
    const title = form.title[sourceLang]?.trim() || '';
    const excerpt = form.excerpt[sourceLang]?.trim() || '';
    const body = form.body[sourceLang]?.trim() || '';
    const category = form.category[sourceLang]?.trim() || '';
    if (!title && !excerpt && !body && !category) {
      setError('Kamida bitta maydonni to\'ldiring');
      return;
    }
    setError('');
    setTranslating(sourceLang);
    try {
      const result = await translatePost(sourceLang, { title, excerpt, body, category });
      setForm((f) => {
        const next = { ...f };
        if (result.uz) {
          next.title = { ...next.title, uz: result.uz.title };
          next.excerpt = { ...next.excerpt, uz: result.uz.excerpt };
          next.body = { ...next.body, uz: result.uz.body };
          next.category = { ...next.category, uz: result.uz.category };
        }
        if (result.ru) {
          next.title = { ...next.title, ru: result.ru.title };
          next.excerpt = { ...next.excerpt, ru: result.ru.excerpt };
          next.body = { ...next.body, ru: result.ru.body };
          next.category = { ...next.category, ru: result.ru.category };
        }
        if (result.en) {
          next.title = { ...next.title, en: result.en.title };
          next.excerpt = { ...next.excerpt, en: result.en.excerpt };
          next.body = { ...next.body, en: result.en.body };
          next.category = { ...next.category, en: result.en.category };
        }
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tarjima xatosi');
    } finally {
      setTranslating(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = { ...form, date: form.date };
      if (isEdit && id) {
        await updatePost(Number(id), payload);
      } else {
        await createPost(payload);
      }
      navigate('/admin/blog');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xatolik');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container mx-auto px-4 py-20 text-center">Yuklanmoqda...</div>;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Link to="/admin/blog" className="inline-flex items-center gap-2 text-slate-600 hover:text-brand mb-8">
        <ArrowLeft size={20} /> Orqaga
      </Link>
      <h1 className="text-2xl font-bold text-slate-900 mb-8 uppercase">
        {isEdit ? "Maqolani tahrirlash" : "Yangi maqola"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && <p className="text-red-600">{error}</p>}

        {(['uz', 'ru', 'en'] as const).map((lang) => (
          <div key={lang} className="bg-white p-6 border border-slate-200 rounded-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900 uppercase text-sm">
                {lang === 'uz' ? "O'zbek" : lang === 'ru' ? 'Rus' : 'Ingliz'}
              </h3>
              <button
                type="button"
                onClick={() => handleTranslate(lang)}
                disabled={!!translating || (!form.title[lang]?.trim() && !form.excerpt[lang]?.trim() && !form.body[lang]?.trim())}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-brand border border-brand hover:bg-brand/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Languages size={16} />
                {translating === lang ? 'Tarjilanmoqda...' : 'Tarjima qilish'}
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Sarlavha</label>
                <input
                  value={form.title[lang]}
                  onChange={(e) => update(lang, 'title', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 focus:outline-none focus:border-brand"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Qisqa matn</label>
                <textarea
                  value={form.excerpt[lang]}
                  onChange={(e) => update(lang, 'excerpt', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-slate-300 focus:outline-none focus:border-brand"
                  required
                />
              </div>
              <div data-color-mode="light">
                <label className="block text-sm text-slate-600 mb-2">Asosiy matn</label>
                <MDEditor
                  value={form.body[lang]}
                  onChange={(v) => update(lang, 'body', v ?? '')}
                  height={300}
                  preview="live"
                  hideToolbar={false}
                  visibleDragbar={false}
                  enableScroll={true}
                  className="border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Kategoriya</label>
                <input
                  value={form.category[lang]}
                  onChange={(e) => update(lang, 'category', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 focus:outline-none focus:border-brand"
                />
              </div>
            </div>
          </div>
        ))}

        <div className="bg-white p-6 border border-slate-200 rounded-sm space-y-4">
          <h3 className="font-bold text-slate-900 uppercase text-sm">Umumiy</h3>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Sana</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-300 focus:outline-none focus:border-brand"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Rasm</label>
            <div className="flex gap-3 flex-wrap items-start">
              <div className="flex-1 min-w-[200px]">
                <input
                  value={form.image}
                  onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-300 focus:outline-none focus:border-brand"
                  placeholder="URL yoki yuklangan rasm"
                />
              </div>
              <label className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer text-sm text-slate-700">
                <Upload size={18} />
                {uploading ? 'Yuklanmoqda...' : 'Rasm yuklash'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp,.webp,.jpg,.jpeg,.png"
                  className="hidden"
                  disabled={uploading}
                  onChange={async (e) => {
                    let file = e.target.files?.[0];
                    if (!file) return;
                    setError('');
                    setUploading(true);
                    try {
                      // Compress image before upload to solve 413 Payload Too Large limits & save bandwidth
                      try {
                        file = await compressImage(file);
                      } catch (err) {
                        console.error('Compression failed, using original file', err);
                      }
                      const url = await uploadImage(file);
                      setForm((f) => ({ ...f, image: url }));
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Yuklash xatosi (Rasm hajmi juda katta bo\'lishi mumkin)');
                    } finally {
                      setUploading(false);
                      e.target.value = '';
                    }
                  }}
                />
              </label>
            </div>
            {form.image && (
              <div className="mt-2 flex items-center gap-2">
                <img src={form.image} alt="" width={96} height={64} className="h-16 w-24 object-cover border border-slate-200" />
                <span className="text-sm text-slate-500 truncate max-w-[200px]">{form.image}</span>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Muallif</label>
            <input
              value={form.author}
              onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-300 focus:outline-none focus:border-brand"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-brand hover:bg-brand-light text-white font-bold py-3 px-8 uppercase disabled:opacity-50"
          >
            {saving ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
          <Link to="/admin/blog" className="bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold py-3 px-8 uppercase">
            Bekor qilish
          </Link>
        </div>
      </form>
    </div>
  );
}
