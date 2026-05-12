import { useTranslation } from '../../hooks/useTranslation';

const LAYERS = [
  {
    key: 'top',
    labelKey: 'notes.top',
    dot:  '#C9A84C',
    bg:   'rgba(201,168,76,0.08)',
    border: 'rgba(201,168,76,0.2)',
    tagBg:  'rgba(201,168,76,0.12)',
    tagColor: '#e2c97e',
    labelColor: '#C9A84C',
  },
  {
    key: 'middle',
    labelKey: 'notes.heart',
    dot:  '#f9a8d4',
    bg:   'rgba(244,114,182,0.08)',
    border: 'rgba(244,114,182,0.2)',
    tagBg:  'rgba(244,114,182,0.12)',
    tagColor: '#fbcfe8',
    labelColor: '#f9a8d4',
  },
  {
    key: 'base',
    labelKey: 'notes.base',
    dot:  '#93c5fd',
    bg:   'rgba(96,165,250,0.08)',
    border: 'rgba(96,165,250,0.2)',
    tagBg:  'rgba(96,165,250,0.12)',
    tagColor: '#bfdbfe',
    labelColor: '#93c5fd',
  },
];

export default function NotesPyramid({ notes }) {
  const { t } = useTranslation();
  if (!notes) return null;

  const hasAny = LAYERS.some(l => notes[l.key]?.length > 0);
  if (!hasAny) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-xs tracking-[0.18em] uppercase font-semibold" style={{ color: 'var(--gold)' }}>
        {t('notes.title')}
      </h3>
      {LAYERS.map(({ key, labelKey, dot, bg, border, tagBg, tagColor, labelColor }) =>
        notes[key]?.length > 0 && (
          <div key={key} className="p-4"
            style={{ background: bg, border: `1px solid ${border}` }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full" style={{ background: dot }} />
              <span className="text-xs tracking-[0.12em] uppercase font-semibold" style={{ color: labelColor }}>
                {t(labelKey)}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {notes[key].map((note, i) => (
                <span key={i} className="text-xs px-2.5 py-1"
                  style={{ background: tagBg, color: tagColor, border: `1px solid ${border}` }}>
                  {note}
                </span>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
