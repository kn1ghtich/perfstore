import { useTranslation } from '../../hooks/useTranslation';

export default function NotesPyramid({ notes }) {
  const { t } = useTranslation();

  if (!notes) return null;

  const layers = [
    { key: 'top', label: t('notes.top'), color: 'from-yellow-100 to-yellow-50', text: 'text-yellow-800', dot: 'bg-yellow-400' },
    { key: 'middle', label: t('notes.heart'), color: 'from-pink-100 to-pink-50', text: 'text-pink-800', dot: 'bg-pink-400' },
    { key: 'base', label: t('notes.base'), color: 'from-amber-100 to-amber-50', text: 'text-amber-800', dot: 'bg-amber-400' },
  ];

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-900">{t('notes.title')}</h3>
      {layers.map(({ key, label, color, text, dot }) => (
        notes[key]?.length > 0 && (
          <div key={key} className={`bg-gradient-to-r ${color} rounded-lg p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${dot}`} />
              <span className={`text-sm font-medium ${text}`}>{label}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {notes[key].map((note, i) => (
                <span key={i} className={`text-xs ${text} bg-white/60 px-2 py-1 rounded-full`}>
                  {note}
                </span>
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  );
}
