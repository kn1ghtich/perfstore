import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, Tag, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const adminApi = axios.create({ baseURL: '/api/admin' });
adminApi.interceptors.request.use((c) => { const t = localStorage.getItem('token'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });

const EMPTY = { name: '', slug: '', description: '' };
const INPUT = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500';
const LABEL = 'block text-sm font-medium text-gray-700 mb-1';

function slugify(s) { return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''); }

export default function AdminCategoriesPage() {
  const [cats, setCats]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]   = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm]     = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    adminApi.get('/dict/categories').then(({ data }) => setCats(data.categories)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const open = (cat = null) => {
    setEditId(cat?.id || null);
    setForm(cat ? { name: cat.name, slug: cat.slug, description: cat.description || '' } : EMPTY);
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
      if (editId) await adminApi.put(`/dict/categories/${editId}`, form);
      else        await adminApi.post('/dict/categories', form);
      toast.success(editId ? 'Категория обновлена' : 'Категория добавлена');
      setModal(false); load();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Ошибка сохранения');
    } finally { setSaving(false); }
  };

  const del = async (cat) => {
    if (!window.confirm(`Удалить «${cat.name}»?`)) return;
    try { await adminApi.delete(`/dict/categories/${cat.id}`); toast.success('Удалено'); load(); }
    catch { toast.error('Не удалось удалить'); }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Семейства ароматов</h1>
          <p className="text-sm text-gray-500 mt-0.5">{cats.length} категорий</p>
        </div>
        <button onClick={() => open()} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
          <Plus className="w-4 h-4" /> Добавить
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400"><Tag className="w-8 h-8 mx-auto animate-pulse" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {cats.length === 0 && <p className="py-12 text-center text-gray-400">Нет категорий</p>}
          {cats.map((cat) => (
            <div key={cat.id} className="flex items-center px-5 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{cat.name}</p>
                <p className="text-xs text-gray-400 font-mono">{cat.slug}</p>
                {cat.description && <p className="text-xs text-gray-500 mt-0.5">{cat.description}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => open(cat)} className="p-1.5 text-gray-400 hover:text-purple-600 transition-colors"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => del(cat)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
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
              <h2 className="font-semibold text-gray-900">{editId ? 'Редактировать' : 'Новая категория'}</h2>
              <button onClick={() => setModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div><label className={LABEL}>Название <span className="text-red-400">*</span></label>
                <input className={INPUT} value={form.name} onChange={set('name')} required /></div>
              <div><label className={LABEL}>Slug (URL) <span className="text-red-400">*</span></label>
                <input className={INPUT} value={form.slug} onChange={set('slug')} required /></div>
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
