const variants = {
  purple: { background: 'rgba(167,139,250,0.15)', color: '#c4b5fd', border: '1px solid rgba(167,139,250,0.3)' },
  blue:   { background: 'rgba(96,165,250,0.12)',  color: '#93c5fd', border: '1px solid rgba(96,165,250,0.25)' },
  green:  { background: 'rgba(34,197,94,0.12)',   color: '#86efac', border: '1px solid rgba(34,197,94,0.25)' },
  gray:   { background: 'rgba(255,255,255,0.07)', color: '#c0bcb4', border: '1px solid rgba(255,255,255,0.12)' },
  pink:   { background: 'rgba(244,114,182,0.12)', color: '#f9a8d4', border: '1px solid rgba(244,114,182,0.25)' },
  gold:   { background: 'rgba(201,168,76,0.15)',  color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)' },
};

export default function Badge({ children, variant = 'gray', className = '' }) {
  const style = variants[variant] || variants.gray;
  return (
    <span
      className={`inline-block px-2.5 py-0.5 text-xs font-medium ${className}`}
      style={{ ...style, borderRadius: 4 }}
    >
      {children}
    </span>
  );
}
