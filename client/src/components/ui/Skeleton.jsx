// Shimmer base
function Shimmer({ className = '', style = {} }) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: '#1a1a1a', ...style }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.06) 50%, transparent 100%)',
          animation: 'shimmer 1.6s infinite',
        }}
      />
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
      {/* Image area */}
      <Shimmer style={{ aspectRatio: '3/4' }} />
      {/* Info */}
      <div className="p-3 space-y-2">
        <Shimmer className="h-2.5 rounded w-1/3" />
        <Shimmer className="h-3.5 rounded w-4/5" />
        <Shimmer className="h-3 rounded w-1/2 mt-1" />
        <div className="flex justify-between items-center pt-1">
          <Shimmer className="h-4 rounded w-16" />
          <Shimmer className="h-3 rounded w-10" />
        </div>
      </div>
    </div>
  );
}

export function StoreCardSkeleton() {
  return (
    <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
      <Shimmer style={{ aspectRatio: '16/9' }} />
      <div className="p-5 space-y-3">
        <Shimmer className="h-2 rounded w-1/4" />
        <Shimmer className="h-5 rounded w-3/4" />
        <Shimmer className="h-3 rounded w-full" />
        <Shimmer className="h-3 rounded w-2/3" />
      </div>
    </div>
  );
}

// Inject shimmer keyframe once
if (typeof document !== 'undefined' && !document.getElementById('shimmer-kf')) {
  const style = document.createElement('style');
  style.id = 'shimmer-kf';
  style.textContent = '@keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }';
  document.head.appendChild(style);
}

export default Shimmer;
