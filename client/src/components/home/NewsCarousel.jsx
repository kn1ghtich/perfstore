import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchSlides } from '../../api/slides';

// Fallback slides shown if API returns nothing
const FALLBACK = [
  {
    id: 'f1',
    tag: 'Новая коллекция',
    title: 'Весна 2025: ароматы цветущих садов',
    desc: 'Свежие цветочные композиции, вдохновлённые садами Прованса и японскими сакурами.',
    link: '/catalog?categories=floral',
    gradient: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 40%, #1a2a1a 100%)',
    accent: '#C9A84C',
    emoji: '🌸',
    badge: 'Хит сезона',
    image_url: null,
    external: false,
  },
  {
    id: 'f2',
    tag: 'Эксклюзив',
    title: 'Tom Ford: лимитированная серия Noir Extrême',
    desc: 'Насыщенные восточные ноты амбры и чёрной орхидеи. Только 50 флаконов в наличии.',
    link: '/catalog?brands=tom-ford',
    gradient: 'linear-gradient(135deg, #0a0a0a 0%, #1a1208 50%, #0d0a00 100%)',
    accent: '#C9A84C',
    emoji: '🖤',
    badge: 'Лимит',
    image_url: null,
    external: false,
  },
];

export default function NewsCarousel() {
  const [slides, setSlides]     = useState([]);
  const [current, setCurrent]   = useState(0);
  const [animating, setAnimating] = useState(false);
  const [dir, setDir]           = useState(1);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchSlides()
      .then((data) => setSlides(data && data.length > 0 ? data : FALLBACK))
      .catch(() => setSlides(FALLBACK));
  }, []);

  const total = slides.length;

  const goTo = useCallback((idx, direction = 1) => {
    if (animating || total === 0) return;
    setDir(direction);
    setAnimating(true);
    setTimeout(() => {
      setCurrent((idx + total) % total);
      setAnimating(false);
    }, 350);
  }, [animating, total]);

  const next = () => goTo(current + 1, 1);
  const prev = () => goTo(current - 1, -1);

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => goTo(current + 1, 1), 6000);
  }, [current, goTo]);

  useEffect(() => { resetTimer(); return () => clearInterval(timerRef.current); }, [resetTimer]);

  if (total === 0) return null;

  const slide = slides[current];

  return (
    <div className="relative overflow-hidden group/news select-none" style={{ height: '520px' }}>
      {/* Background: image takes priority over gradient */}
      {slide.image_url ? (
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            backgroundImage: `url(${slide.image_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: animating ? 0.6 : 1,
          }}
        >
          {/* Dark overlay so text stays readable */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 100%)' }} />
        </div>
      ) : (
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{ background: slide.gradient, opacity: animating ? 0.6 : 1 }}
        />
      )}

      {/* Noise overlay for texture */}
      <div className="absolute inset-0 opacity-30"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.15\'/%3E%3C/svg%3E")' }}
      />

      {/* Gold line top */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'var(--gold)', opacity: 0.4 }} />

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-8 sm:px-12 flex flex-col justify-center">
        <div className={`transition-all duration-350 ${animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
          style={{ transitionDuration: '350ms' }}>

          {/* Tag + badge */}
          {(slide.tag || slide.badge) && (
            <div className="flex items-center gap-4 mb-6">
              {slide.tag && (
                <span className="text-xs tracking-[0.3em] uppercase font-medium" style={{ color: slide.accent || 'var(--gold)' }}>
                  {slide.tag}
                </span>
              )}
              {slide.badge && (
                <span className="text-[10px] tracking-[0.2em] uppercase px-3 py-1 border"
                  style={{ borderColor: 'var(--dark-border)', color: 'var(--gold)', background: 'rgba(201,168,76,0.08)' }}>
                  {slide.badge}
                </span>
              )}
            </div>
          )}

          {/* Emoji */}
          {slide.emoji && <div className="text-5xl mb-5">{slide.emoji}</div>}

          {/* Title */}
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-tight mb-4 max-w-3xl">
            {slide.title}
          </h2>

          {/* Description */}
          {slide.desc && (
            <p className="text-sm sm:text-base text-gray-400 max-w-xl leading-relaxed mb-8 font-light">
              {slide.desc}
            </p>
          )}

          {/* CTA */}
          {slide.link && (
            slide.external ? (
              <a href={slide.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 group/btn">
                <span className="text-xs tracking-[0.2em] uppercase font-medium pb-px"
                  style={{ color: 'var(--gold)', borderBottom: '1px solid var(--gold)' }}>
                  Читать статью
                </span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" style={{ color: 'var(--gold)' }} />
              </a>
            ) : (
              <Link to={slide.link} className="inline-flex items-center gap-3 group/btn">
                <span className="text-xs tracking-[0.2em] uppercase font-medium pb-px"
                  style={{ color: 'var(--gold)', borderBottom: '1px solid var(--gold)' }}>
                  Смотреть
                </span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" style={{ color: 'var(--gold)' }} />
              </Link>
            )
          )}
        </div>
      </div>

      {/* Arrows */}
      <button onClick={() => { prev(); resetTimer(); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center transition-all opacity-0 group-hover/news:opacity-100 hover:scale-110"
        style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid var(--dark-border)' }}>
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>
      <button onClick={() => { next(); resetTimer(); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center transition-all opacity-0 group-hover/news:opacity-100 hover:scale-110"
        style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid var(--dark-border)' }}>
        <ChevronRight className="w-5 h-5 text-white" />
      </button>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-3">
        {slides.map((_, i) => (
          <button key={i} onClick={() => { goTo(i, i > current ? 1 : -1); resetTimer(); }}
            className="transition-all duration-300"
            style={{ height: '2px', width: i === current ? '32px' : '12px', background: i === current ? 'var(--gold)' : 'rgba(255,255,255,0.25)' }}
          />
        ))}
      </div>

      {/* Counter */}
      <div className="absolute bottom-8 right-8 text-xs text-gray-600 font-mono tracking-widest">
        {String(current + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </div>
    </div>
  );
}
