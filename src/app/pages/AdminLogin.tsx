import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { login } from '../api';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    if (localStorage.getItem('admin_token')) navigate('/admin/blog', { replace: true });
  }, [navigate]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token } = await login(password);
      localStorage.setItem('admin_token', token);
      navigate('/admin/blog');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-20">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-slate-200 w-full max-w-md">
        <h1 className="text-2xl font-bold text-slate-900 mb-6 uppercase">Admin kirish</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase">Parol</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 focus:outline-none focus:border-brand"
              placeholder="Parolni kiriting"
              required
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand hover:bg-brand-light text-white font-bold py-3 uppercase tracking-wider disabled:opacity-50"
          >
            {loading ? 'Kuting...' : 'Kirish'}
          </button>
        </form>
      </div>
    </div>
  );
}
