import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, User, Phone, MapPin, CreditCard, Save, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const PAYMENT_OPTIONS = [
  { value: 'card',          label: 'Банковская карта' },
  { value: 'cash',          label: 'Наличными при получении' },
  { value: 'bank_transfer', label: 'Банковский перевод' },
];

const FIELD_STYLE = {
  background: 'var(--input-bg)',
  border: '1px solid var(--input-border)',
  color: 'var(--text-primary)',
  borderRadius: 0,
  padding: '10px 14px',
  fontSize: '14px',
  width: '100%',
  outline: 'none',
  boxSizing: 'border-box',
};

const LABEL_STYLE = {
  display: 'block',
  fontSize: '11px',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--text-secondary)',
  marginBottom: 6,
  fontWeight: 500,
};

function resizeImage(file, maxSize = 256) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        canvas.width  = img.width  * scale;
        canvas.height = img.height * scale;
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function Section({ icon: Icon, title, children }) {
  return (
    <section className="p-6" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
      <div className="flex items-center gap-2.5 mb-5" style={{ borderBottom: '1px solid var(--dark-border)', paddingBottom: '1rem' }}>
        <Icon className="w-4 h-4" style={{ color: 'var(--gold)' }} />
        <h2 className="text-xs tracking-[0.18em] uppercase font-semibold" style={{ color: 'var(--gold)' }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label style={LABEL_STYLE}>{label}</label>
      {children}
    </div>
  );
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileRef  = useRef(null);

  const [form, setForm] = useState({
    first_name:       user?.first_name       || '',
    last_name:        user?.last_name        || '',
    gender:           user?.gender           || '',
    phone:            user?.phone            || '',
    city:             user?.city             || '',
    delivery_address: user?.delivery_address || '',
    payment_method:   user?.payment_method   || '',
    avatar:           user?.avatar           || '',
  });
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Файл слишком большой. Максимум 5 МБ.'); return; }
    const base64 = await resizeImage(file, 256);
    setForm((f) => ({ ...f, avatar: base64 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const name = [form.first_name, form.last_name].filter(Boolean).join(' ');
      await updateUser({ ...form, name });
      toast.success('Профиль сохранён');
    } catch {
      toast.error('Не удалось сохранить профиль');
    } finally {
      setSaving(false);
    }
  };

  const focusStyle = (e) => (e.target.style.borderColor = 'var(--gold)');
  const blurStyle  = (e) => (e.target.style.borderColor = 'var(--input-border)');

  return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

        {/* Back */}
        <button onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs tracking-wide mb-8 transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gold)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
          <ArrowLeft className="w-3.5 h-3.5" /> Назад
        </button>

        {/* Page title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px w-8" style={{ background: 'var(--gold)' }} />
            <span className="text-[10px] tracking-[0.35em] uppercase" style={{ color: 'var(--gold)' }}>Аккаунт</span>
          </div>
          <h1 className="font-serif text-3xl font-semibold text-white">Мой профиль</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Avatar */}
          <div className="p-6 flex items-center gap-6" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
            <div className="relative shrink-0">
              <div
                className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center cursor-pointer group"
                style={{ background: '#1e1e1e', border: '2px solid var(--dark-border)' }}
                onClick={() => fileRef.current?.click()}>
                {form.avatar
                  ? <img src={form.avatar} alt="avatar" className="w-full h-full object-cover" />
                  : <User className="w-10 h-10" style={{ color: 'var(--text-muted)' }} />}
                <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(0,0,0,0.55)' }}>
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-white mb-0.5">
                {[user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.name || 'Пользователь'}
              </p>
              <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
              <button type="button" onClick={() => fileRef.current?.click()}
                className="text-xs tracking-wide px-3 py-1.5 transition-colors"
                style={{ border: '1px solid var(--dark-border)', color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--dark-border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                Изменить фото
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          {/* Personal info */}
          <Section icon={User} title="Личные данные">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Имя">
                  <input type="text" value={form.first_name} onChange={set('first_name')}
                    placeholder="Аскар" style={FIELD_STYLE} onFocus={focusStyle} onBlur={blurStyle} />
                </Field>
                <Field label="Фамилия">
                  <input type="text" value={form.last_name} onChange={set('last_name')}
                    placeholder="Аскаров" style={FIELD_STYLE} onFocus={focusStyle} onBlur={blurStyle} />
                </Field>
              </div>
              <Field label="Пол">
                <div className="flex gap-2">
                  {[
                    { value: 'male',   label: 'Мужской' },
                    { value: 'female', label: 'Женский' },
                    { value: 'other',  label: 'Другой' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, gender: f.gender === opt.value ? '' : opt.value }))}
                      style={{
                        flex: 1,
                        padding: '10px 0',
                        fontSize: '12px',
                        letterSpacing: '0.08em',
                        border: `1px solid ${form.gender === opt.value ? 'var(--gold)' : 'var(--input-border)'}`,
                        background: form.gender === opt.value ? 'rgba(201,168,76,0.1)' : 'var(--input-bg)',
                        color: form.gender === opt.value ? 'var(--gold)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          </Section>

          {/* Contact */}
          <Section icon={Phone} title="Контакты">
            <Field label="Номер телефона">
              <input type="tel" value={form.phone} onChange={set('phone')}
                placeholder="+7 (777) 000-00-00" style={FIELD_STYLE} onFocus={focusStyle} onBlur={blurStyle} />
            </Field>
          </Section>

          {/* Delivery */}
          <Section icon={MapPin} title="Адрес доставки">
            <div className="space-y-4">
              <Field label="Город">
                <input type="text" value={form.city} onChange={set('city')}
                  placeholder="Астана" style={FIELD_STYLE} onFocus={focusStyle} onBlur={blurStyle} />
              </Field>
              <Field label="Адрес">
                <textarea value={form.delivery_address} onChange={set('delivery_address')}
                  placeholder="ул. Мангилик Ел, д. 10, кв. 5" rows={2}
                  style={{ ...FIELD_STYLE, resize: 'none' }} onFocus={focusStyle} onBlur={blurStyle} />
              </Field>
            </div>
          </Section>

          {/* Payment */}
          <Section icon={CreditCard} title="Способ оплаты">
            <div className="space-y-2">
              {PAYMENT_OPTIONS.map((opt) => (
                <label key={opt.value}
                  className="flex items-center gap-3 p-3 cursor-pointer transition-all"
                  style={{
                    border: `1px solid ${form.payment_method === opt.value ? 'var(--gold)' : 'var(--input-border)'}`,
                    background: form.payment_method === opt.value ? 'rgba(201,168,76,0.07)' : 'transparent',
                  }}>
                  <input type="radio" name="payment_method" value={opt.value}
                    checked={form.payment_method === opt.value}
                    onChange={set('payment_method')}
                    className="accent-yellow-600" />
                  <span className="text-sm" style={{ color: form.payment_method === opt.value ? '#fff' : 'var(--text-secondary)' }}>
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </Section>

          {/* Save */}
          <button type="submit" disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3.5 text-xs tracking-[0.15em] uppercase font-semibold transition-all disabled:opacity-50"
            style={{ background: saving ? 'var(--gold-dim)' : 'var(--gold)', color: '#000' }}>
            <Save className="w-4 h-4" />
            {saving ? 'Сохранение...' : 'Сохранить профиль'}
          </button>

        </form>
      </div>
    </div>
  );
}
