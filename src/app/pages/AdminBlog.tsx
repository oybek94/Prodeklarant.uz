import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';

function useAuthGuard() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!localStorage.getItem('admin_token')) navigate('/admin', { replace: true });
  }, [navigate]);
}
import { Plus, Edit, Trash2, ArrowLeft, Eye, CheckCircle } from 'lucide-react';
import { getPosts, deletePost, updatePost, type BlogPost } from '../api';

export default function AdminBlog() {
  useAuthGuard();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [onlyDrafts, setOnlyDrafts] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    try {
      // 'all' — qoralamalar ham (faqat admin tokeni bilan ishlaydi)
      const data = await getPosts(50, 'all');
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('O\'chirishni xohlaysizmi?')) return;
    try {
      await deletePost(id);
      setPosts((p) => p.filter((x) => x.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed');
    }
  }

  async function handlePublish(id: number) {
    try {
      await updatePost(id, { status: 'published' });
      await loadPosts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed');
    }
  }

  const draftCount = posts.filter((p) => p.status === 'draft').length;
  const visiblePosts = onlyDrafts ? posts.filter((p) => p.status === 'draft') : posts;

  function handleLogout() {
    localStorage.removeItem('admin_token');
    navigate('/admin');
  }

  if (loading) return <div className="container mx-auto px-4 py-20 text-center">Yuklanmoqda...</div>;
  if (error) return <div className="container mx-auto px-4 py-20 text-center text-red-600">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link to="/blog" className="text-slate-600 hover:text-brand flex items-center gap-2">
            <ArrowLeft size={20} /> Blog
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 uppercase">Maqolalar boshqaruvi</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/admin/leads" className="text-sm font-bold text-brand hover:text-brand-dark">
            Arizalar
          </Link>
          <button onClick={handleLogout} className="text-sm text-slate-600 hover:text-red-600">
            Chiqish
          </button>
          <Link
            to="/admin/blog/new"
            className="bg-accent hover:bg-accent-light text-brand-dark font-bold py-2 px-6 rounded-sm flex items-center gap-2"
          >
            <Plus size={18} /> Yangi maqola
          </Link>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setOnlyDrafts(false)}
          className={`px-4 py-1.5 text-sm font-medium border ${!onlyDrafts ? 'bg-brand text-white border-brand' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}
        >
          Hammasi ({posts.length})
        </button>
        <button
          onClick={() => setOnlyDrafts(true)}
          className={`px-4 py-1.5 text-sm font-medium border ${onlyDrafts ? 'bg-brand text-white border-brand' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}
        >
          Qoralamalar ({draftCount})
        </button>
      </div>

      <div className="bg-white rounded-sm shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left py-4 px-4 font-bold text-slate-900 uppercase text-sm">ID</th>
              <th className="text-left py-4 px-4 font-bold text-slate-900 uppercase text-sm">Sarlavha</th>
              <th className="text-left py-4 px-4 font-bold text-slate-900 uppercase text-sm">Sana</th>
              <th className="text-left py-4 px-4 font-bold text-slate-900 uppercase text-sm">Ko'rilgan</th>
              <th className="text-left py-4 px-4 font-bold text-slate-900 uppercase text-sm">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {visiblePosts.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">
                  {onlyDrafts ? "Qoralamalar yo'q." : "Maqolalar yo'q. Yangi maqola qo'shing."}
                </td>
              </tr>
            ) : (
              visiblePosts.map((post) => (
                <tr key={post.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-4 text-slate-600">{post.id}</td>
                  <td className="py-4 px-4 font-medium text-slate-900">
                    {post.title.uz}
                    {post.status === 'draft' && (
                      <span className="ml-2 px-2 py-0.5 text-xs font-bold uppercase bg-amber-100 text-amber-800">
                        Qoralama
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-slate-600">{post.date}</td>
                  <td className="py-4 px-4 text-slate-600 flex items-center gap-1">
                    <Eye size={14} /> {post.views ?? 0}
                  </td>
                  <td className="py-4 px-4 flex gap-2">
                    {post.status === 'draft' && (
                      <button
                        onClick={() => handlePublish(post.id)}
                        title="Nashr qilish"
                        className="p-2 text-green-700 hover:bg-green-50"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}
                    <Link
                      to={`/admin/blog/${post.id}/edit`}
                      className="p-2 text-brand hover:bg-brand/10"
                    >
                      <Edit size={18} />
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-2 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
