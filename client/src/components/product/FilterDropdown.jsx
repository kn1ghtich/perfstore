import { useRef, useState, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

export default function FilterDropdown({ label, active, onClear, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const leaveTimer = useRef(null);

  const enter = () => { clearTimeout(leaveTimer.current); setOpen(true); };
  const leave = () => { leaveTimer.current = setTimeout(() => setOpen(false), 160); };

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} className="relative" onMouseEnter={enter} onMouseLeave={leave}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-4 py-2 text-xs tracking-[0.12em] uppercase font-medium transition-all duration-200"
        style={{
          background:  active ? 'var(--gold)'       : 'transparent',
          color:       active ? '#000'               : '#a0a0a0',
          border:      `1px solid ${active ? 'var(--gold)' : 'rgba(255,255,255,0.1)'}`,
        }}
        onMouseEnter={(e) => { if (!active) { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)'; }}}
        onMouseLeave={(e) => { if (!active) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#a0a0a0'; }}}
      >
        {label}
        {active ? (
          <span onClick={(e) => { e.stopPropagation(); onClear?.(); setOpen(false); }} className="ml-0.5 opacity-70 hover:opacity-100">
            <X className="w-3 h-3" />
          </span>
        ) : (
          <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
        )}
      </button>

      <div className={`absolute top-full left-0 mt-2 z-40 transition-all duration-150 ${open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-1 pointer-events-none'}`}>
        <div className="py-1 min-w-[180px] shadow-2xl" style={{ background: '#141414', border: '1px solid var(--dark-border)' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
