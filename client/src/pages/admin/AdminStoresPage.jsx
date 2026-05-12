import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { adminGetStores, adminCreateStore, adminUpdateStore, adminDeleteStore } from '../../api/admin';
import { Plus, Pencil, Trash2, Store, X, Save, MapPin, Phone, Clock, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  name: '', description: '', address: '', phone: '',
  working_hours: '', sort_order: 0, image_base64: null, image_url: null,
};

const INPUT = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white';
const LABEL = 'block text-sm font-medium text-gray-700 mb-1';

export default function AdminStoresPage() {
  const [stores, setStores]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modalOpen, setModal]   = useState(false);
  const [editId, setEditId]     = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(null);
  const fileRef = useRef(null);

  const load = () => {
    setLoading(true);
    adminGetStores()
      .then((d) => setStores(d.stores))
      .catch(() => toast.error('Не удалось загрузить магазины'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setModal(true);
  };

  const openEdit = (store) => {
    setForm({
      name:          store.name || '',
      description:   store.description || '',
      address:       store.address || '',
      phone:         store.phone || '',
      working_hours: store.working_hours || '',
      sort_order:    store.sort_order ?? 0,
      image_base64:  null,
      image_url:     store.image_url || null,
    });
    setEditId(store.id);
    setModal(true);
  };

  const closeModal = () => { setModal(false); setEditId(null); setForm(EMPTY_FORM); };

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Файл слишком большой (макс. 5 МБ)'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setForm((f) => ({ ...f, image_base64: ev.target.result, image_url: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Укажите название магазина'); return; }
    setSaving(true);
    try {
      const payload = {
        name:          form.name.trim(),
        description:   form.description.trim(),
        address:       form.address.trim(),
        phone:         form.phone.trim(),
        working_hours: form.working_hours.trim(),
        sort_order:    Number(form.sort_order) || 0,
        ...(form.image_base64 ? { image_base64: form.image_base64 } : {}),
      };

      if (editId) {
        await adminUpdateStore(editId, payload);
        toast.success('Магазин обновлён');
      } else {
        await adminCreateStore(payload);
        toast.success('Магазин добавлен');
      }
      closeModal();
      load();
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || '';
      toast.error(msg ? `Ошибка: ${msg}` : 'Не удалось сохранить магазин');
      console.error('Save store error:', err?.response?.data || err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (store) => {
    if (!window.confirm(`Удалить магазин «${store.name}»?`)) return;
    setDeleting(store.id);
    try {
      await adminDeleteStore(store.id);
      toast.success('Магазин удалён');
      setStores((s) => s.filter((x) => x.id !== store.id));
    } catch {
      toast.error('Не удалось удалить магазин');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Магазины</h1>
          <p className="text-sm text-gray-500 mt-0.5">{stores.length} {stores.length === 1 ? 'магазин' : 'магазинов'}</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Добавить магазин
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-24 text-gray-400">
          <Store className="w-8 h-8 animate-pulse" />
        </div>
      ) : stores.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <Store className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Нет магазинов</p>
          <p className="text-sm mt-1">Нажмите «Добавить магазин», чтобы создать первый</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {stores.map((store) => (
            <StoreAdminCard
              key={store.id}
              store={store}
              onEdit={() => openEdit(store)}
              onDelete={() => handleDelete(store)}
              deleting={deleting === store.id}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={closeModal} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {editId ? 'Редактировать магазин' : 'Новый магазин'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
              <div className="px-6 py-5 space-y-4">

                {/* Image upload */}
                <div>
                  <label className={LABEL}>Фотография магазина</label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="cursor-pointer rounded-xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-purple-400 transition-colors"
                    style={{ aspectRatio: '16/9' }}
                  >
                    {form.image_url ? (
                      <img src={form.image_url} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400">
                        <Store className="w-8 h-8 opacity-40" />
                        <span className="text-sm">Нажмите для загрузки фото</span>
                        <span className="text-xs text-gray-300">JPG, PNG, WebP · до 5 МБ</span>
                      </div>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
                  {form.image_url && (
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, image_base64: null, image_url: null }))}
                      className="mt-1.5 text-xs text-red-400 hover:text-red-600 transition-colors"
                    >
                      Удалить фото
                    </button>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label className={LABEL}>Название <span className="text-red-400">*</span></label>
                  <input className={INPUT} value={form.name} onChange={set('name')} placeholder="PERFSTORE Алматы" required />
                </div>

                {/* Description */}
                <div>
                  <label className={LABEL}>Описание</label>
                  <textarea
                    className={`${INPUT} resize-none`}
                    rows={3}
                    value={form.description}
                    onChange={set('description')}
                    placeholder="Флагманский бутик в центре города..."
                  />
                </div>

                {/* Address */}
                <div>
                  <label className={LABEL}>
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gray-400" /> Адрес</span>
                  </label>
                  <input className={INPUT} value={form.address} onChange={set('address')} placeholder="г. Алматы, ул. Арбат, 12" />
                </div>

                {/* Phone */}
                <div>
                  <label className={LABEL}>
                    <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-400" /> Телефон</span>
                  </label>
                  <input className={INPUT} value={form.phone} onChange={set('phone')} placeholder="+7 (700) 000-00-00" />
                </div>

                {/* Working hours */}
                <div>
                  <label className={LABEL}>
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gray-400" /> Режим работы</span>
                  </label>
                  <input className={INPUT} value={form.working_hours} onChange={set('working_hours')} placeholder="Пн–Вс: 10:00 – 21:00" />
                </div>

                {/* Sort order */}
                <div>
                  <label className={LABEL}>Порядок сортировки</label>
                  <input type="number" className={INPUT} value={form.sort_order} onChange={set('sort_order')} min={0} />
                  <p className="text-xs text-gray-400 mt-1">Меньше — выше в списке</p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={closeModal}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Отмена
                </button>
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50">
                  <Save className="w-4 h-4" />
                  {saving ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StoreAdminCard({ store, onEdit, onDelete, deleting }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative" style={{ aspectRatio: '16/9', background: '#f5f5f5' }}>
        {store.image_url ? (
          <img src={store.image_url} alt={store.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Store className="w-8 h-8 text-gray-300" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 truncate">{store.name}</h3>
        {store.description && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{store.description}</p>
        )}
        <div className="space-y-1 mb-4">
          {store.address && (
            <p className="flex items-start gap-1.5 text-xs text-gray-500">
              <MapPin className="w-3 h-3 shrink-0 mt-0.5 text-gray-400" />
              <span className="line-clamp-1">{store.address}</span>
            </p>
          )}
          {store.phone && (
            <p className="flex items-center gap-1.5 text-xs text-gray-500">
              <Phone className="w-3 h-3 shrink-0 text-gray-400" />
              {store.phone}
            </p>
          )}
          {store.working_hours && (
            <p className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock className="w-3 h-3 shrink-0 text-gray-400" />
              {store.working_hours}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <Link
            to={`/admin/stores/${store.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            <Package className="w-3.5 h-3.5" />
            Товары {store.inventory?.length > 0 && <span className="bg-indigo-100 text-indigo-700 rounded-full px-1.5 py-0.5 text-[10px] font-bold">{store.inventory.length}</span>}
          </Link>
          <button
            onClick={onEdit}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            disabled={deleting}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
