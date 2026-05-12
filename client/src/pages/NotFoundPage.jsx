import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh' }} className="flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Big 404 */}
        <div className="relative mb-8">
          <p className="font-serif text-[10rem] font-bold leading-none select-none"
            style={{ color: 'transparent', WebkitTextStroke: '1px rgba(201,168,76,0.2)' }}>
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-serif text-5xl font-semibold" style={{ color: 'var(--gold)' }}>404</span>
          </div>
        </div>

        {/* Gold line */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-px w-12" style={{ background: 'var(--dark-border)' }} />
          <span className="text-[10px] tracking-[0.4em] uppercase" style={{ color: 'var(--gold)' }}>
            Страница не найдена
          </span>
          <div className="h-px w-12" style={{ background: 'var(--dark-border)' }} />
        </div>

        <p className="text-gray-500 text-sm leading-relaxed mb-8 font-light">
          Возможно, страница была удалена или вы перешли по неверной ссылке.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="px-8 py-3 text-xs tracking-[0.2em] uppercase font-medium transition-all"
            style={{ background: 'var(--gold)', color: '#000' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gold-light)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--gold)'}
          >
            На главную
          </Link>
          <Link
            to="/catalog"
            className="px-8 py-3 text-xs tracking-[0.2em] uppercase font-medium transition-all text-gray-400 hover:text-white"
            style={{ border: '1px solid var(--dark-border)' }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--gold)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--dark-border)'}
          >
            Каталог
          </Link>
        </div>
      </div>
    </div>
  );
}
