import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, Sparkles, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const adminApi = axios.create({ baseURL: '/api/admin' });
adminApi.interceptors.request.use((c) => { const t = localStorage.getItem('token'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });

const EMPTY = { name: '', slug: '', country: '', description: '' };
const INPUT = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500';
const LABEL = 'block text-sm font-medium text-gray-700 mb-1';

function slugify(s) { return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''); }

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal]   = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm]     = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    adminApi.get('/dict/brands').then(({ data }) => setBrands(data.brands)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = brands.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()));

  const open = (brand = null) => {
    setEditId(brand?.id || null);
    setForm(brand ? { name: brand.name, slug: brand.slug, country: brand.country || '', description: brand.description || '' } : EMPTY);
    setModal(true);
  };

  const set = (f) => (e) => {
    const val = e.target.value;
    setForm((prev) => {
      const next = { ...prev, [f]: val };
      if (f === 'name' && !editId) next.slug = slugify(val);
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) await adminApi.put(`/dict/brands/${editId}`, form);
      else        await adminApi.post('/dict/brands', form);
      toast.success(editId ? 'Бренд обновлён' : 'Бренд добавлен');
      setModal(false); load();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Ошибка сохранения');
    } finally { setSaving(false); }
  };

  const del = async (brand) => {
    if (!window.confirm(`Удалить «${brand.name}»?`)) return;
    try { await adminApi.delete(`/dict/brands/${brand.id}`); toast.success('Удалено'); load(); }
    catch { toast.error('Не удалось удалить'); }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Бренды</h1>
          <p className="text-sm text-gray-500 mt-0.5">{brands.length} брендов</p>
        </div>
        <button onClick={() => open()} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
          <Plus className="w-4 h-4" /> Добавить
        </button>
      </div>

      <input
        type="text" placeholder="Поиск по названию..." value={search} onChange={(e) => setSearch(e.target.value)}
        className="mb-5 w-full max-w-xs border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
      />

      {loading ? (
        <div className="text-center py-12 text-gray-400"><Sparkles className="w-8 h-8 mx-auto animate-pulse" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {filtered.length === 0 && <p className="py-12 text-center text-gray-400">Ничего не найдено</p>}
          {filtered.map((brand) => (
            <div key={brand.id} className="flex items-center px-5 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{brand.name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-gray-400 font-mono">{brand.slug}</span>
                  {brand.country && <span className="text-xs text-gray-400">· {brand.country}</span>}
                </div>
                {brand.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{brand.description}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => open(brand)} className="p-1.5 text-gray-400 hover:text-purple-600 transition-colors"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => del(brand)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{editId ? 'Редактировать бренд' : 'Новый бренд'}</h2>
              <button onClick={() => setModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div><label className={LABEL}>Название <span className="text-red-400">*</span></label>
                <input className={INPUT} value={form.name} onChange={set('name')} required /></div>
              <div><label className={LABEL}>Slug (URL) <span className="text-red-400">*</span></label>
                <input className={INPUT} value={form.slug} onChange={set('slug')} required /></div>
              <div><label className={LABEL}>Страна</label>
                <input className={INPUT} value={form.country} onChange={set('country')} placeholder="France" /></div>
              <div><label className={LABEL}>Описание</label>
                <textarea className={INPUT} rows={2} value={form.description} onChange={set('description')} /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Отмена</button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50">
                  <Save className="w-4 h-4" />{saving ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
