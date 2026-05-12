import { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';

function useVisibleCount() {
  const [count, setCount] = useState(4);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640)       setCount(1);
      else if (w < 768)  setCount(2);
      else if (w < 1024) setCount(3);
      else               setCount(4);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return count;
}

export default function ProductCarousel({ products, autoPlay = true, interval = 4500 }) {
  const [current, setCurrent] = useState(0);
  const timerRef  = useRef(null);
  const dragStart = useRef(null);
  const visible   = useVisibleCount();
  const maxIndex  = Math.max(0, products.length - visible);

  const goTo = useCallback((idx) => setCurrent(Math.max(0, Math.min(idx, maxIndex))), [maxIndex]);
  const prev = () => goTo(current - 1);
  const next = () => goTo(current + 1);

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    if (autoPlay && products.length > visible) {
      timerRef.current = setInterval(() => setCurrent((c) => c >= maxIndex ? 0 : c + 1), interval);
    }
  }, [autoPlay, interval, products.length, visible, maxIndex]);

  useEffect(() => { resetTimer(); return () => clearInterval(timerRef.current); }, [resetTimer]);
  useEffect(() => { setCurrent((c) => Math.min(c, maxIndex)); }, [maxIndex]);

  const onDragEnd = (clientX) => {
    if (dragStart.current === null) return;
    const d = dragStart.current - clientX;
    if (Math.abs(d) > 50) { d > 0 ? next() : prev(); resetTimer(); }
    dragStart.current = null;
  };

  if (!products.length) return null;
  const offset = (100 / visible) * current;

  return (
    <div className="relative group/car">
      {/* Prev */}
      {current > 0 && (
        <button onClick={() => { prev(); resetTimer(); }}
          className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center
                     opacity-0 group-hover/car:opacity-100 transition-all duration-200 hover:scale-110"
          style={{ background: '#141414', border: '1px solid var(--dark-border)' }}>
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
      )}
      {/* Next */}
      {current < maxIndex && (
        <button onClick={() => { next(); resetTimer(); }}
          className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center
                     opacity-0 group-hover/car:opacity-100 transition-all duration-200 hover:scale-110"
          style={{ background: '#141414', border: '1px solid var(--dark-border)' }}>
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      )}

      {/* Track */}
      <div className="overflow-hidden"
        onMouseEnter={() => clearInterval(timerRef.current)}
        onMouseLeave={resetTimer}
        onMouseDown={(e) => { dragStart.current = e.clientX; }}
        onMouseUp={(e) => onDragEnd(e.clientX)}
        onTouchStart={(e) => { dragStart.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => onDragEnd(e.changedTouches[0].clientX)}
      >
        <div className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${offset}%)` }}>
          {products.map((p) => (
            <div key={p.id} className="shrink-0 px-2" style={{ width: `${100 / visible}%` }}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      {products.length > visible && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: maxIndex + 1 }, (_, i) => (
            <button key={i} onClick={() => { goTo(i); resetTimer(); }}
              className="transition-all duration-300"
              style={{
                height: '2px',
                width: i === current ? '28px' : '10px',
                background: i === current ? 'var(--gold)' : 'rgba(255,255,255,0.15)',
              }} />
          ))}
        </div>
      )}
    </div>
  );
}
