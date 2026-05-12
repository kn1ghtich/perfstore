import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminCreateProduct, adminGetBrands, adminGetCategories } from '../../api/admin';
import { ArrowLeft, Save, Package, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const INPUT = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent';
const LABEL = 'block text-sm font-medium text-gray-700 mb-1';

const EMPTY_FORM = {
  name:           '',
  slug:           '',
  description:    '',
  price:          '',
  original_price: '',
  gender:         'unisex',
  concentration:  '',
  volume_ml:      '',
  brand:          '',
  categories:     [],
  notes_top:      '',
  notes_middle:   '',
  notes_base:     '',
};

function toSlug(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function AdminProductCreatePage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [brands, setBrands]   = useState([]);
  const [categories, setCats] = useState([]);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [slugEdited, setSlugEdited] = useState(false);

  useEffect(() => {
    Promise.all([adminGetBrands(), adminGetCategories()])
      .then(([{ brands: b }, { categories: c }]) => {
        setBrands(b);
        setCats(c);
      })
      .catch(() => toast.error('Не удалось загрузить справочники'))
      .finally(() => setLoading(false));
  }, []);

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

    setForm((f) => {
      const next = { ...f, [field]: val };
      // Auto-generate slug from name unless user has manually edited it
      if (field === 'name' && !slugEdited) {
        next.slug = toSlug(val);
      }
      return next;
    });
  };

  const handleSlugChange = (e) => {
    setSlugEdited(true);
    setForm((f) => ({ ...f, slug: e.target.value }));
  };

  const autoSlug = () => {
    setForm((f) => ({ ...f, slug: toSlug(f.name) }));
    setSlugEdited(false);
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
    if (!form.name.trim()) return toast.error('Введите название');
    if (!form.slug.trim()) return toast.error('Введите slug');
    if (!form.price)       return toast.error('Введите цену');

    setSaving(true);
    try {
      const splitNotes = (str) => str.split(',').map((s) => s.trim()).filter(Boolean);
      const { product } = await adminCreateProduct({
        name:           form.name.trim(),
        slug:           form.slug.trim(),
        description:    form.description.trim(),
        price:          parseFloat(form.price),
        original_price: form.original_price !== '' ? parseFloat(form.original_price) : null,
        gender:         form.gender,
        concentration:  form.concentration.trim(),
        volume_ml:      form.volume_ml ? Number(form.volume_ml) : undefined,
        in_stock:       false,
        quantity:       0,
        brand:          form.brand || undefined,
        categories:     form.categories,
        notes: {
          top:    splitNotes(form.notes_top),
          middle: splitNotes(form.notes_middle),
          base:   splitNotes(form.notes_base),
        },
      });

      toast.success('Товар создан! Теперь добавьте фотографии.');
      navigate(`/admin/products/${product.id}/edit`);
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Не удалось создать товар');
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
          <h1 className="text-2xl font-bold text-gray-900">Новый товар</h1>
          <p className="text-sm text-gray-500">После создания сможете загрузить фотографии</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Basic info */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Основная информация</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={LABEL}>Название *</label>
              <input
                type="text"
                value={form.name}
                onChange={set('name')}
                required
                placeholder="Chanel No. 5"
                className={INPUT}
              />
            </div>
            <div>
              <label className={LABEL}>Slug (URL) *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.slug}
                  onChange={handleSlugChange}
                  required
                  placeholder="chanel-no-5"
                  className={INPUT}
                />
                <button
                  type="button"
                  onClick={autoSlug}
                  title="Сгенерировать из названия"
                  className="flex items-center gap-1 px-3 py-2 text-xs border border-gray-300 rounded-lg hover:border-purple-400 hover:text-purple-600 transition-colors shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Генерируется автоматически из названия (только латиница)</p>
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
              <textarea
                value={form.description}
                onChange={set('description')}
                rows={4}
                placeholder="Краткое описание аромата..."
                className={INPUT}
              />
            </div>
          </div>
        </section>

        {/* Details */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Характеристики</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className={LABEL}>Цена ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={set('price')}
                required
                placeholder="0.00"
                className={INPUT}
              />
            </div>
            <div>
              <label className={LABEL}>Цена до скидки ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.original_price}
                onChange={set('original_price')}
                placeholder="Оставьте пустым"
                className={INPUT}
              />
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
              <input
                type="text"
                value={form.concentration}
                onChange={set('concentration')}
                placeholder="Eau de Parfum"
                className={INPUT}
              />
            </div>
            <div>
              <label className={LABEL}>Объём (мл)</label>
              <input type="number" min="0" value={form.volume_ml} onChange={set('volume_ml')} placeholder="100" className={INPUT} />
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Семейства ароматов</h2>
          {categories.length === 0 ? (
            <p className="text-sm text-gray-400">Категории не найдены</p>
          ) : (
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
          )}
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

        {/* Photo hint */}
        <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-purple-50 border border-purple-100">
          <Package className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
          <p className="text-sm text-purple-700">
            После создания товара вы будете автоматически перенаправлены на страницу редактирования, где сможете загрузить основное фото и галерею.
          </p>
        </div>

        {/* Actions */}
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
            {saving ? 'Создание...' : 'Создать товар'}
          </button>
        </div>
      </form>
    </div>
  );
}
