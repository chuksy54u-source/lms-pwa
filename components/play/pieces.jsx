// The drawn parts of the Playground boards: chess pieces, checker discs, dice and Ayo seeds.
// Everything is plain SVG or CSS, so the pieces stay sharp at any size and need no image files.

const BASE = 'M9.5 38.5h26a1.5 1.5 0 0 1 1.5 1.5v2h-29v-2a1.5 1.5 0 0 1 1.5-1.5z';

// Outlines for the six chess pieces on a 45 by 45 grid. Each is one closed shape so the outline has no seams.
const PIECE_PATHS = {
  p: 'M22.5 7.5a5.3 5.3 0 0 1 3.2 9.5c2 .9 3.3 2.6 3.3 4.5 0 1.3-.6 2.4-1.7 3.1 2 3 4.6 6.2 5.5 10h2.2v3.9H10.5v-3.9h2.2c.9-3.8 3.5-7 5.5-10-1.1-.7-1.7-1.8-1.7-3.1 0-1.9 1.3-3.6 3.3-4.5a5.3 5.3 0 0 1 3.2-9.5z',
  r: 'M12 42v-3.6h2.2V34l2.6-2.6V17.6l-2.6-2.6V8h4.6v3h3.4V8h3.6v3h3.4V8h4.6v7l-2.6 2.6v13.8l2.6 2.6v4.4H33V42z',
  b: 'M22.5 4.2a2.4 2.4 0 1 1 0 4.8 2.4 2.4 0 0 1 0-4.8zM22.5 10c5.4 3 8 7.4 8 11.2 0 2.4-1.4 4-3 5 1.7 3 3.4 6.3 4 11.3h2.2V42H11.3v-3.5h2.2c.6-5 2.3-8.3 4-11.3-1.6-1-3-2.6-3-5 0-3.8 2.6-8.2 8-11.2z',
  n: 'M13.2 42c-.2-8.8 1.2-14 5.6-18.4-2-.9-3.6-.6-5.6.6l-.9-4.5c1.9-2.6 3.8-5 6-7.2l.6-5.6 3.6 3.2c5.2 0 9.6 2.2 12 7.1 2.5 5.2 2.9 14 2.9 25.4z',
  q: 'M9.5 42v-3.6h2c1.2-4.2 1.7-8.6.4-14.6l-3.6-11.4 6.4 5.2 2.4-9 3.4 8.2 3.4-8.2 2.4 9 6.4-5.2-3.6 11.4c-1.3 6-.8 10.4.4 14.6h2V42z',
  k: 'M22.5 11.2c-5.4 0-9 3-9 6.7 0 2.4 1.5 4.2 3.2 5.2-2.6 3.2-4.1 8.4-4.6 15.2h-1.6V42h24v-3.7h-1.6c-.5-6.8-2-12-4.6-15.2 1.7-1 3.2-2.8 3.2-5.2 0-3.7-3.6-6.7-9-6.7z',
};

// Small details drawn on top of each piece so the shapes read clearly.
function Details({ type }) {
  switch (type) {
    case 'n':
      return (
        <>
          <circle cx="23.6" cy="16.2" r="1.35" className="pg-piece-ink" />
          <path d="M14.6 21.2l2.4-1.4" className="pg-piece-line" />
          <path d="M27 21.6c2.4 2 3.4 5.6 3.6 10.4" className="pg-piece-line pg-piece-soft" />
        </>
      );
    case 'b':
      return <path d="M20.2 17.2l4.6 4.6M23.6 14.8l-2.8 2.8" className="pg-piece-line" />;
    case 'q':
      return (
        <>
          {[[8.6, 11.6], [15.7, 8.2], [22.5, 6.6], [29.3, 8.2], [36.4, 11.6]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="2.1" className="pg-piece-fill" />)}
          <path d="M14 29h17" className="pg-piece-line pg-piece-soft" />
        </>
      );
    case 'k':
      return (
        <>
          <path d="M22.5 3.4v7.6M19.2 6.8h6.6" className="pg-piece-line pg-piece-thick" />
          <path d="M16.2 29h12.6" className="pg-piece-line pg-piece-soft" />
        </>
      );
    case 'r':
      return <path d="M14.5 17.6h16M16.8 31.4h11.4" className="pg-piece-line pg-piece-soft" />;
    default:
      return null;
  }
}

export function ChessPiece({ type, color, className = '' }) {
  const t = type.toLowerCase();
  return (
    <svg viewBox="0 0 45 45" className={`pg-piece pg-piece--${color} ${className}`} aria-hidden focusable="false">
      <path d={BASE} className="pg-piece-fill" />
      <path d={PIECE_PATHS[t]} className="pg-piece-fill" />
      <Details type={t} />
    </svg>
  );
}

export function CheckerPiece({ side, king = false, className = '' }) {
  return (
    <svg viewBox="0 0 48 48" className={`pg-checker pg-checker--${side} ${className}`} aria-hidden focusable="false">
      <ellipse cx="24" cy="29" rx="19" ry="17" className="pg-checker-edge" />
      <circle cx="24" cy="24" r="19" className="pg-checker-face" />
      <circle cx="24" cy="24" r="14.2" className="pg-checker-ring" />
      <circle cx="24" cy="24" r="9.6" className="pg-checker-core" />
      <path d="M11 15.5a16 16 0 0 1 15-8" className="pg-checker-shine" />
      {king && <path d="M15.5 29.5l-1.6-9.2 5.4 4.2 4.7-7.3 4.7 7.3 5.4-4.2-1.6 9.2z" className="pg-checker-crown" />}
    </svg>
  );
}

const PIPS = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

export function Die({ value, rolling = false, tone = '', size = 'md' }) {
  const pips = PIPS[value] || [];
  return (
    <span className={`pg-die pg-die--${size} ${tone} ${rolling ? 'is-rolling' : ''}`} aria-label={value ? `Die showing ${value}` : 'Die'}>
      {Array.from({ length: 9 }, (_, index) => <i key={index} className={pips.includes(index) ? 'on' : ''} />)}
    </span>
  );
}

// Seeds inside an Ayo pit: laid out in a sunflower pattern so any number of them looks natural.
export function Seeds({ count, max = 26 }) {
  const shown = Math.min(count, max);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const dots = [];
  for (let i = 0; i < shown; i++) {
    const radius = Math.sqrt((i + 0.6) / (Math.max(shown, 8) + 0.6)) * 31;
    const angle = i * golden;
    dots.push(<i key={i} style={{ left: `${50 + radius * Math.cos(angle)}%`, top: `${50 + radius * Math.sin(angle)}%`, '--seed': (i * 37) % 5 }} />);
  }
  return <span className="pg-seeds" aria-hidden>{dots}</span>;
}
