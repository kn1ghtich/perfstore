import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { adminGetProduct, adminUpdateProduct, adminGetBrands, adminGetCategories } from '../../api/admin';
import { ArrowLeft, Save, Package, Upload, X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const adminApi = axios.create({ baseURL: '/api/admin' });
adminApi.interceptors.request.use((c) => { const t = localStorage.getItem('token'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });

const INPUT = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent';
const LABEL = 'block text-sm font-medium text-gray-700 mb-1';

export default function AdminProductEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [uploading, setUploading]     = useState(false);
  const [uploadingExtra, setUpExtra]  = useState(false);
  const [brands, setBrands]           = useState([]);
  const [categories, setCats]         = useState([]);
  const [form, setForm]               = useState(null);
  const [extraImages, setExtraImages] = useState([]);
  const imgFileRef      = useRef(null);
  const extraImgFileRef = useRef(null);

  useEffect(() => {
    Promise.all([
      adminGetProduct(id),
      adminGetBrands(),
      adminGetCategories(),
    ]).then(([{ product }, { brands: b }, { categories: c }]) => {
      setBrands(b);
      setCats(c);
      setExtraImages(product.images || []);
      setForm({
        name:           product.name || '',
        slug:           product.slug || '',
        description:    product.description || '',
        price:          product.price ?? '',
        original_price: product.original_price ?? '',
        gender:         product.gender || 'unisex',
        concentration:  product.concentration || '',
        volume_ml:      product.volume_ml ?? '',
        in_stock:       product.in_stock !== false,
        quantity:       product.quantity ?? 0,
        brand:          product.brand?.id || product.brand?._id || '',
        categories:     (product.categories || []).map((c) => c.id || c._id || c),
        notes_top:      (product.notes?.top || []).join(', '),
        notes_middle:   (product.notes?.middle || []).join(', '),
        notes_base:     (product.notes?.base || []).join(', '),
        image_url:      product.image_url || '',
      });
    }).catch(() => {
      toast.error('Не удалось загрузить товар');
      navigate('/admin/products');
    }).finally(() => setLoading(false));
  }, [id]);

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: val }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Файл слишком большой (макс. 5 МБ)'); return; }
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const { data } = await adminApi.post(`/products/${id}/image`, { image_base64: ev.target.result });
          setForm((f) => ({ ...f, image_url: data.image_url }));
          toast.success('Фото загружено');
        } catch { toast.error('Не удалось загрузить фото'); }
        finally { setUploading(false); }
      };
      reader.readAsDataURL(file);
    } catch { setUploading(false); }
  };

  const handleExtraImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Файл слишком большой (макс. 5 МБ)'); return; }
    setUpExtra(true);
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const { data } = await adminApi.post(`/products/${id}/images`, { image_base64: ev.target.result });
          setExtraImages(data.images);
          toast.success('Фото добавлено');
        } catch { toast.error('Не удалось загрузить фото'); }
        finally { setUpExtra(false); e.target.value = ''; }
      };
      reader.readAsDataURL(file);
    } catch { setUpExtra(false); }
  };

  const handleDeleteExtraImage = async (idx) => {
    try {
      const { data } = await adminApi.delete(`/products/${id}/images/${idx}`);
      setExtraImages(data.images);
      toast.success('Фото удалено');
    } catch { toast.error('Не удалось удалить фото'); }
  };

  const toggleCategory = (catId) => {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(catId)
        ? f.categories.filter((c) => c !== catId)
        : [...f.categories, catId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const splitNotes = (str) => str.split(',').map((s) => s.trim()).filter(Boolean);
      await adminUpdateProduct(id, {
        name:          form.name,
        slug:          form.slug,
        description:   form.description,
        price:         parseFloat(form.price),
        original_price: form.original_price !== '' ? parseFloat(form.original_price) : null,
        gender:        form.gender,
        concentration: form.concentration,
        volume_ml:     form.volume_ml ? Number(form.volume_ml) : undefined,
        in_stock:      form.in_stock,
        quantity:      form.quantity !== '' ? Number(form.quantity) : 0,
        brand:         form.brand,
        categories:    form.categories,
        notes: {
          top:    splitNotes(form.notes_top),
          middle: splitNotes(form.notes_middle),
          base:   splitNotes(form.notes_base),
        },
      });
      toast.success('Товар сохранён');
    } catch {
      toast.error('Не удалось сохранить товар');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <Package className="w-8 h-8 text-purple-400 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/admin/products"
          className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
        >
          <ArrowLeft className="w-4 h-4" /> Назад
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Редактирование товара</h1>
          <p className="text-sm text-gray-500 font-mono">{id}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Основная информация</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={LABEL}>Название</label>
              <input type="text" value={form.name} onChange={set('name')} required className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Slug (URL)</label>
              <input type="text" value={form.slug} onChange={set('slug')} required className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Бренд</label>
              <select value={form.brand} onChange={set('brand')} className={INPUT}>
                <option value="">— Выбрать —</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={LABEL}>Описание</label>
              <textarea value={form.description} onChange={set('description')} rows={4} className={INPUT} />
            </div>
          </div>
        </section>

        {/* Details */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Характеристики</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className={LABEL}>Цена ($)</label>
              <input type="number" step="0.01" min="0" value={form.price} onChange={set('price')} required className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Цена до скидки ($)</label>
              <input type="number" step="0.01" min="0" value={form.original_price} onChange={set('original_price')} placeholder="Оставьте пустым, если нет скидки" className={INPUT} />
              {form.original_price && parseFloat(form.original_price) > parseFloat(form.price) && (
                <p className="text-xs text-green-600 mt-1">
                  Скидка: {Math.round((1 - parseFloat(form.price) / parseFloat(form.original_price)) * 100)}%
                </p>
              )}
            </div>
            <div>
              <label className={LABEL}>Пол</label>
              <select value={form.gender} onChange={set('gender')} className={INPUT}>
                <option value="female">Женский</option>
                <option value="male">Мужской</option>
                <option value="unisex">Унисекс</option>
              </select>
            </div>
            <div>
              <label className={LABEL}>Концентрация</label>
              <input type="text" value={form.concentration} onChange={set('concentration')} placeholder="Eau de Parfum" className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Объём (мл)</label>
              <input type="number" min="0" value={form.volume_ml} onChange={set('volume_ml')} className={INPUT} />
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Семейства ароматов</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {categories.map((cat) => {
              const checked = form.categories.includes(cat.id);
              return (
                <label
                  key={cat.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                    checked ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCategory(cat.id)}
                    className="accent-purple-600"
                  />
                  <span className="text-sm text-gray-700">{cat.name}</span>
                </label>
              );
            })}
          </div>
        </section>

        {/* Notes */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Ноты аромата</h2>
          <p className="text-xs text-gray-500 mb-4">Через запятую: Бергамот, Лимон, Имбирь</p>
          <div className="space-y-3">
            <div>
              <label className={LABEL}>Верхние ноты</label>
              <input type="text" value={form.notes_top} onChange={set('notes_top')} className={INPUT} placeholder="Bergamot, Lemon" />
            </div>
            <div>
              <label className={LABEL}>Ноты сердца</label>
              <input type="text" value={form.notes_middle} onChange={set('notes_middle')} className={INPUT} placeholder="Rose, Jasmine" />
            </div>
            <div>
              <label className={LABEL}>Базовые ноты</label>
              <input type="text" value={form.notes_base} onChange={set('notes_base')} className={INPUT} placeholder="Sandalwood, Musk" />
            </div>
          </div>
        </section>

        {/* Image */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Изображение</h2>
          <div className="flex items-start gap-5">
            {/* Preview */}
            <div
              onClick={() => imgFileRef.current?.click()}
              className="w-32 h-40 rounded-xl border-2 border-dashed border-gray-200 hover:border-purple-400 overflow-hidden flex items-center justify-center cursor-pointer transition-colors shrink-0 relative"
            >
              {form.image_url
                ? <img src={form.image_url} alt="preview" className="w-full h-full object-cover" />
                : <span className="text-4xl">🧴</span>}
              {uploading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-3">Нажмите на превью или кнопку ниже для загрузки нового фото. Файл сохраняется в MongoDB GridFS.</p>
              <button
                type="button"
                onClick={() => imgFileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:border-purple-400 hover:text-purple-600 transition-colors disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                {uploading ? 'Загрузка...' : 'Загрузить фото'}
              </button>
              <input ref={imgFileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              {form.image_url && (
                <p className="text-xs text-gray-400 mt-2 font-mono truncate">{form.image_url}</p>
              )}
            </div>
          </div>
        </section>

        {/* Extra images gallery */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Галерея фотографий</h2>
          <p className="text-xs text-gray-500 mb-4">Дополнительные фото для карусели на странице товара. Основное фото — выше.</p>

          <div className="flex flex-wrap gap-3 mb-4">
            {extraImages.map((url, idx) => (
              <div key={idx} className="relative group w-24 h-24 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                <img src={url} alt={`extra ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleDeleteExtraImage(idx)}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1 rounded">
                  {idx + 1}
                </span>
              </div>
            ))}

            {/* Upload button */}
            <button
              type="button"
              onClick={() => extraImgFileRef.current?.click()}
              disabled={uploadingExtra}
              className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-200 hover:border-purple-400 flex flex-col items-center justify-center gap-1 transition-colors disabled:opacity-50 shrink-0"
            >
              {uploadingExtra
                ? <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                : <><Plus className="w-5 h-5 text-gray-400" /><span className="text-xs text-gray-400">Добавить</span></>}
            </button>
            <input ref={extraImgFileRef} type="file" accept="image/*" onChange={handleExtraImageUpload} className="hidden" />
          </div>

          {extraImages.length === 0 && (
            <p className="text-xs text-gray-400">Дополнительных фото нет. Нажмите «+», чтобы добавить.</p>
          )}
        </section>

        {/* Save */}
        <div className="flex items-center justify-between pb-8">
          <Link to="/admin/products" className="text-sm text-gray-500 hover:text-gray-700">
            Отмена
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Сохранение...' : 'Сохранить товар'}
          </button>
        </div>
      </form>
    </div>
  );
}
