import { useState, useEffect, useRef } from 'react';
import {
  adminGetSlides, adminCreateSlide, adminUpdateSlide, adminDeleteSlide,
  adminUploadSlideImage, adminDeleteSlideImage,
} from '../../api/admin';
import {
  Plus, Save, Trash2, X, Upload, ImageOff, Eye, EyeOff,
  ChevronUp, ChevronDown, AlertTriangle, Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';

const INPUT = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500';
const LABEL = 'block text-xs font-medium text-gray-600 mb-1';

const EMPTY = {
  tag: '', badge: '', title: '', desc: '', link: '/',
  external: false,
  gradient: 'linear-gradient(135deg, #0a0a0a 0%, #1a1208 50%, #0d0a00 100%)',
  accent: '#C9A84C', emoji: '', sort_order: 0, active: true,
};

function SlideModal({ slide, onSave, onClose, isNew }) {
  const [form, setForm]           = useState(slide ? { ...slide } : { ...EMPTY });
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview]     = useState(slide?.image_url || null);
  const fileRef = useRef(null);

  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { toast.error('Файл слишком большой (макс. 8 МБ)'); return; }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        if (isNew || !slide?.id) {
          // Store base64 temporarily; will be uploaded after slide creation
          setForm((f) => ({ ...f, _pending_image: ev.target.result }));
          setPreview(ev.target.result);
          toast('Фото будет загружено при сохранении', { icon: 'ℹ️' });
        } else {
          const { image_url } = await adminUploadSlideImage(slide.id, ev.target.result);
          setPreview(image_url + '?t=' + Date.now());
          setForm((f) => ({ ...f, image_url }));
          toast.success('Фото загружено');
        }
      } catch { toast.error('Ошибка загрузки фото'); }
      finally { setUploading(false); e.target.value = ''; }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = async () => {
    if (isNew || !slide?.id) {
      setForm((f) => ({ ...f, _pending_image: null }));
      setPreview(null);
      return;
    }
    try {
      await adminDeleteSlideImage(slide.id);
      setPreview(null);
      setForm((f) => ({ ...f, image_url: null }));
      toast.success('Фото удалено');
    } catch { toast.error('Ошибка удаления фото'); }
  };

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error('Введите заголовок');
    setSaving(true);
    try {
      const payload = {
        tag: form.tag, badge: form.badge, title: form.title, desc: form.desc,
        link: form.link, external: form.external, gradient: form.gradient,
        accent: form.accent, emoji: form.emoji,
        sort_order: Number(form.sort_order) || 0, active: form.active,
      };
      let saved;
      if (isNew) {
        const { slide: s } = await adminCreateSlide(payload);
        // Upload pending image if any
        if (form._pending_image) {
          try {
            await adminUploadSlideImage(s.id, form._pending_image);
          } catch { toast.error('Слайд создан, но фото не удалось загрузить'); }
        }
        saved = s;
      } else {
        const { slide: s } = await adminUpdateSlide(slide.id, payload);
        saved = s;
      }
      onSave(saved);
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">{isNew ? 'Новый слайд' : 'Редактировать слайд'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Background image */}
          <div>
            <p className={LABEL}>Фоновое изображение</p>
            <div className="flex items-start gap-4">
              <div
                className="w-40 h-24 rounded-xl overflow-hidden shrink-0 flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-200 hover:border-purple-400 transition-colors relative"
                style={preview ? { backgroundImage: `url(${preview})`, backgroundSize: 'cover', backgroundPosition: 'center', borderStyle: 'solid' } : {}}
                onClick={() => fileRef.current?.click()}
              >
                {!preview && <Upload className="w-6 h-6 text-gray-400" />}
                {uploading && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="flex items-center gap-2 text-sm px-3 py-1.5 border border-gray-300 rounded-lg hover:border-purple-400 hover:text-purple-600 transition-colors disabled:opacity-50">
                  <Upload className="w-3.5 h-3.5" /> Загрузить фото
                </button>
                {preview && (
                  <button type="button" onClick={handleRemoveImage}
                    className="flex items-center gap-2 text-sm px-3 py-1.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                    <ImageOff className="w-3.5 h-3.5" /> Удалить фото
                  </button>
                )}
                <p className="text-xs text-gray-400">Если фото не загружено — используется градиент ниже</p>
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>
          </div>

          {/* Gradient (shown only if no image) */}
          {!preview && (
            <div>
              <label className={LABEL}>CSS Градиент фона</label>
              <div className="flex gap-2 items-center">
                <input type="text" value={form.gradient} onChange={set('gradient')} className={INPUT} />
                <div className="w-10 h-9 rounded-lg shrink-0 border border-gray-200" style={{ background: form.gradient }} />
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className={LABEL}>Заголовок *</label>
            <input type="text" value={form.title} onChange={set('title')} placeholder="Заголовок слайда" className={INPUT} />
          </div>

          {/* Tag + Badge */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Тег (надпись сверху)</label>
              <input type="text" value={form.tag} onChange={set('tag')} placeholder="Эксклюзив" className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Бейдж</label>
              <input type="text" value={form.badge} onChange={set('badge')} placeholder="Лимит" className={INPUT} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={LABEL}>Описание</label>
            <textarea value={form.desc} onChange={set('desc')} rows={2} placeholder="Краткое описание..." className={INPUT} />
          </div>

          {/* Link */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Ссылка</label>
              <input type="text" value={form.link} onChange={set('link')} placeholder="/catalog" className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Эмодзи</label>
              <input type="text" value={form.emoji} onChange={set('emoji')} placeholder="🌸" className={INPUT} />
            </div>
          </div>

          {/* Accent color + Sort */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={LABEL}>Цвет акцента</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={form.accent} onChange={set('accent')} className="w-9 h-9 rounded border border-gray-300 cursor-pointer p-0.5" />
                <input type="text" value={form.accent} onChange={set('accent')} className={INPUT} />
              </div>
            </div>
            <div>
              <label className={LABEL}>Порядок сортировки</label>
              <input type="number" value={form.sort_order} onChange={set('sort_order')} className={INPUT} />
            </div>
            <div className="flex flex-col justify-end gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.external} onChange={set('external')} className="accent-purple-600 w-4 h-4" />
                <span className="text-sm text-gray-700">Внешняя ссылка</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={set('active')} className="accent-purple-600 w-4 h-4" />
                <span className="text-sm text-gray-700">Активен</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">Отмена</button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 disabled:opacity-60 transition-colors">
            <Save className="w-4 h-4" />
            {saving ? 'Сохранение...' : isNew ? 'Создать' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminSlidesPage() {
  const [slides, setSlides]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [editSlide, setEditSlide] = useState(null);   // null | slide | 'new'
  const [toDelete, setToDelete]   = useState(null);
  const [deleting, setDeleting]   = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { slides: s } = await adminGetSlides();
      setSlides(s);
    } catch { toast.error('Ошибка загрузки'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSaved = (saved) => {
    toast.success(editSlide === 'new' ? 'Слайд создан' : 'Слайд обновлён');
    setEditSlide(null);
    load();
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await adminDeleteSlide(toDelete.id);
      toast.success('Слайд удалён');
      setToDelete(null);
      load();
    } catch { toast.error('Ошибка удаления'); }
    finally { setDeleting(false); }
  };

  const handleToggleActive = async (slide) => {
    try {
      const { slide: s } = await adminUpdateSlide(slide.id, { active: !slide.active });
      setSlides((prev) => prev.map((p) => p.id === s.id ? s : p));
    } catch { toast.error('Ошибка'); }
  };

  const handleMove = async (idx, dir) => {
    const next = [...slides];
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= next.length) return;
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    // Update sort_order for both
    try {
      await Promise.all([
        adminUpdateSlide(next[idx].id,    { sort_order: idx }),
        adminUpdateSlide(next[swapIdx].id, { sort_order: swapIdx }),
      ]);
      next[idx].sort_order = idx;
      next[swapIdx].sort_order = swapIdx;
      setSlides(next);
    } catch { toast.error('Ошибка сортировки'); }
  };

  return (
    <div className="p-8 max-w-4xl">
      {/* Modals */}
      {(editSlide === 'new' || (editSlide && editSlide !== 'new')) && (
        <SlideModal
          slide={editSlide === 'new' ? null : editSlide}
          isNew={editSlide === 'new'}
          onSave={handleSaved}
          onClose={() => setEditSlide(null)}
        />
      )}

      {toDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !deleting && setToDelete(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Удалить слайд?</h3>
                <p className="text-sm text-gray-500 truncate max-w-[220px]">{toDelete.title}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setToDelete(null)} disabled={deleting}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50">
                Отмена
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2">
                {deleting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Удаление...</> : <><Trash2 className="w-4 h-4" />Удалить</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Карусель главной страницы</h1>
          <p className="text-sm text-gray-500 mt-0.5">{slides.length} слайд(ов)</p>
        </div>
        <button onClick={() => setEditSlide('new')}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors">
          <Plus className="w-4 h-4" /> Добавить слайд
        </button>
      </div>

      {/* Slide list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : slides.length === 0 ? (
        <div className="flex flex-col items-center py-24 text-center">
          <Layers className="w-12 h-12 text-gray-200 mb-4" />
          <p className="text-gray-400 text-sm mb-4">Слайдов пока нет</p>
          <button onClick={() => setEditSlide('new')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50">
            <Plus className="w-4 h-4" /> Добавить первый слайд
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {slides.map((slide, idx) => (
            <div key={slide.id}
              className={`flex items-center gap-4 p-4 bg-white rounded-xl border transition-colors ${slide.active ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>

              {/* Preview thumbnail */}
              <div className="w-20 h-14 rounded-lg overflow-hidden shrink-0 flex items-center justify-center text-2xl"
                style={slide.image_url
                  ? { backgroundImage: `url(${slide.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : { background: slide.gradient }}>
                {!slide.image_url && slide.emoji}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  {slide.tag && <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">{slide.tag}</span>}
                  {slide.badge && <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{slide.badge}</span>}
                  {!slide.active && <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-600">Скрыт</span>}
                </div>
                <p className="text-sm font-semibold text-gray-900 truncate">{slide.title}</p>
                <p className="text-xs text-gray-400 truncate">{slide.link}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Move up/down */}
                <button onClick={() => handleMove(idx, -1)} disabled={idx === 0}
                  className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-20 transition-colors" title="Вверх">
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button onClick={() => handleMove(idx, 1)} disabled={idx === slides.length - 1}
                  className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-20 transition-colors" title="Вниз">
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Toggle active */}
                <button onClick={() => handleToggleActive(slide)}
                  className={`p-1.5 transition-colors ${slide.active ? 'text-green-500 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'}`}
                  title={slide.active ? 'Скрыть' : 'Показать'}>
                  {slide.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                {/* Edit */}
                <button onClick={() => setEditSlide(slide)}
                  className="px-3 py-1.5 text-xs text-purple-600 border border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors">
                  Изменить
                </button>

                {/* Delete */}
                <button onClick={() => setToDelete(slide)}
                  className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
