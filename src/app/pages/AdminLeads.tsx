import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, Send, RefreshCw } from 'lucide-react';
import { getLeads, updateLeadStatus, type Lead, type LeadStatus } from '../api';
import uz from '../../i18n/locales/uz.json';

function useAuthGuard() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!localStorage.getItem('admin_token')) navigate('/admin', { replace: true });
  }, [navigate]);
}

// Admin panel o'zbek tilida (boshqa admin sahifalari kabi)
const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'Yangi',
  contacted: 'Bog\'lanildi',
  closed: 'Yopildi',
};
const STATUS_STYLES: Record<LeadStatus, string> = {
  new: 'bg-accent/20 text-accent-dark',
  contacted: 'bg-brand/10 text-brand',
  closed: 'bg-slate-100 text-slate-500',
};

const productLabel = (key: string | null) =>
  key ? (uz.leadForm.products as Record<string, string>)[key] || key : '—';
const tariffLabel = (key: string | null) =>
  key ? (uz.home.tariffs as unknown as Record<string, { name?: string }>)[key]?.name || key : '—';

function formatPhone(p: string) {
  const m = p.match(/^\+998(\d{2})(\d{3})(\d{2})(\d{2})$/);
  return m ? `+998 ${m[1]} ${m[2]} ${m[3]} ${m[4]}` : p;
}

export default function AdminLeads() {
  useAuthGuard();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<LeadStatus | ''>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getLeads(page, filter || undefined);
      setLeads(res.data);
      setTotalPages(Math.max(1, res.pagination.totalPages));
      setTotal(res.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xatolik');
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    load();
  }, [load]);

  async function changeStatus(id: number, status: LeadStatus) {
    try {
      await updateLeadStatus(id, status);
      setLeads((list) => list.map((l) => (l.id === id ? { ...l, status } : l)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xatolik');
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link to="/admin/blog" className="text-slate-600 hover:text-brand flex items-center gap-2">
            <ArrowLeft size={20} /> Maqolalar
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 uppercase">Arizalar ({total})</h1>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => {
              setPage(1);
              setFilter(e.target.value as LeadStatus | '');
            }}
            className="border border-slate-200 rounded-sm px-3 py-2 text-sm"
            aria-label="Holat bo'yicha filtr"
          >
            <option value="">Barchasi</option>
            {(Object.keys(STATUS_LABELS) as LeadStatus[]).map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          <button onClick={load} className="p-2 text-slate-600 hover:text-brand" aria-label="Yangilash">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      <div className="bg-white rounded-sm shadow-sm border border-slate-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Sana', 'Ism', 'Telefon', 'Mahsulot', 'Davlat', 'Tarif', 'Izoh', 'Sahifa', 'Holat'].map((h) => (
                <th key={h} className="text-left py-3 px-3 font-bold text-slate-900 uppercase text-xs whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="py-12 text-center text-slate-500">Yuklanmoqda...</td></tr>
            ) : leads.length === 0 ? (
              <tr><td colSpan={9} className="py-12 text-center text-slate-500">Arizalar yo'q.</td></tr>
            ) : (
              leads.map((l) => (
                <tr key={l.id} className="border-b border-slate-100 hover:bg-slate-50 align-top">
                  <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                    {l.created_at}
                    {!l.telegram_sent && (
                      <span className="block text-xs text-red-600" title="Telegram xabari yuborilmagan">
                        <Send size={12} className="inline" /> yuborilmagan
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-900">{l.name}</td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <a href={`tel:${l.phone}`} className="text-brand hover:underline">{formatPhone(l.phone)}</a>
                  </td>
                  <td className="py-3 px-3 text-slate-700">{productLabel(l.product)}</td>
                  <td className="py-3 px-3 text-slate-700">{l.country || '—'}</td>
                  <td className="py-3 px-3 text-slate-700">{tariffLabel(l.tariff)}</td>
                  <td className="py-3 px-3 text-slate-700 max-w-xs whitespace-pre-line break-words">{l.comment || '—'}</td>
                  <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{l.source_path || '/'} <span className="uppercase">({l.locale})</span></td>
                  <td className="py-3 px-3">
                    <select
                      value={l.status}
                      onChange={(e) => changeStatus(l.id, e.target.value as LeadStatus)}
                      className={`rounded-full px-2 py-1 text-xs font-bold border-0 ${STATUS_STYLES[l.status]}`}
                      aria-label={`Ariza #${l.id} holati`}
                    >
                      {(Object.keys(STATUS_LABELS) as LeadStatus[]).map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6 text-sm">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 border rounded-sm disabled:opacity-40">←</button>
          <span>{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 border rounded-sm disabled:opacity-40">→</button>
        </div>
      )}
    </div>
  );
}
