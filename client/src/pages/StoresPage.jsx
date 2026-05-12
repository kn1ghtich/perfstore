import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchStores } from '../api/stores';
import { MapPin, Phone, Clock, ArrowRight } from 'lucide-react';

export default function StoresPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStores()
      .then((d) => setStores(d.stores))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-12" style={{ borderBottom: '1px solid var(--dark-border)', paddingBottom: '1.5rem' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px w-8" style={{ background: 'var(--gold)' }} />
            <span className="text-[10px] tracking-[0.35em] uppercase" style={{ color: 'var(--gold)' }}>
              Наши магазины
            </span>
          </div>
          <div className="flex items-end justify-between">
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-white">Адреса магазинов</h1>
            <p className="text-xs text-gray-600 tracking-wide">{stores.length} {stores.length === 1 ? 'магазин' : stores.length < 5 ? 'магазина' : 'магазинов'}</p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--dark-border)', borderTopColor: 'var(--gold)' }} />
          </div>
        ) : stores.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-gray-600 mb-2">Магазины пока не добавлены</p>
            <p className="text-xs text-gray-700 tracking-wide">Заходите позже</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <StoreCard
                key={store.id}
                store={store}
                onClick={() => navigate(`/catalog?store=${store.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StoreCard({ store, onClick }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={onClick}
      className="flex flex-col overflow-hidden transition-all duration-300 group cursor-pointer"
      style={{
        background: 'var(--dark-card)',
        border: '1px solid var(--dark-border)',
      }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--gold)'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--dark-border)'}
    >
      {/* Photo */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
        {store.image_url && !imgError ? (
          <img
            src={store.image_url}
            alt={store.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: '#1a1a1a' }}>
            <span className="font-serif text-4xl" style={{ color: 'var(--dark-border)' }}>P</span>
          </div>
        )}
        {/* Gold overlay line at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'var(--gold)', opacity: 0 }}
          ref={(el) => { if (el) { el.closest('.group')?.addEventListener('mouseenter', () => el.style.opacity = '1'); el.closest('.group')?.addEventListener('mouseleave', () => el.style.opacity = '0'); }}} />
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col gap-4 flex-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-px w-4" style={{ background: 'var(--gold)' }} />
            <span className="text-[9px] tracking-[0.3em] uppercase" style={{ color: 'var(--gold)' }}>PerfStore</span>
          </div>
          <h2 className="font-serif text-lg font-semibold text-white leading-snug">{store.name}</h2>
        </div>

        {store.description && (
          <p className="text-xs text-gray-500 leading-relaxed font-light">{store.description}</p>
        )}

        <div className="space-y-2 mt-auto">
          {store.address && (
            <div className="flex items-start gap-2.5">
              <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} />
              <span className="text-xs text-gray-400 leading-relaxed">{store.address}</span>
            </div>
          )}
          {store.phone && (
            <div className="flex items-center gap-2.5">
              <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--gold)' }} />
              <a
                href={`tel:${store.phone}`}
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                {store.phone}
              </a>
            </div>
          )}
          {store.working_hours && (
            <div className="flex items-start gap-2.5">
              <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} />
              <span className="text-xs text-gray-400 leading-relaxed">{store.working_hours}</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <div
          className="mt-5 pt-4 flex items-center justify-between transition-colors"
          style={{ borderTop: '1px solid var(--dark-border)' }}
        >
          <span className="text-[10px] tracking-[0.2em] uppercase font-medium transition-colors"
            style={{ color: 'var(--gold)' }}>
            Смотреть товары
          </span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1"
            style={{ color: 'var(--gold)' }} />
        </div>
      </div>
    </div>
  );
}
