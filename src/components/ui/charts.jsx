'use client';

// Recent quiz scores as small bars (the "recent scores chart" progress widget). Pass mark drawn as a dashed line.
export function ScoreBars({ results = [], passMark = 50, height = 120 }) {
  const items = results.filter((r) => r.percent !== null && r.percent !== undefined).slice(0, 6).reverse();
  if (!items.length) return <p className="muted small">Your quiz scores will show here.</p>;
  const w = 100 / items.length;
  return (
    <figure style={{ margin: 0 }}>
      <svg viewBox={`0 0 100 ${height}`} width="100%" height={height} preserveAspectRatio="none" role="img" aria-label={`Recent scores: ${items.map((r) => `${Math.round(r.percent)}%`).join(', ')}`}>
        <line x1="0" x2="100" y1={height - (passMark / 100) * (height - 14)} y2={height - (passMark / 100) * (height - 14)} stroke="var(--line-strong)" strokeDasharray="2 2" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
        {items.map((r, i) => {
          const h = Math.max(4, (r.percent / 100) * (height - 14));
          return <rect key={r.submission_id || i} x={i * w + w * 0.22} width={w * 0.56} y={height - h} height={h} rx="2" fill={r.passed ? 'var(--brand)' : 'var(--accent)'} />;
        })}
      </svg>
      <figcaption className="row-between tiny muted" style={{ marginTop: 6 }}>
        {items.map((r, i) => (
          <span key={i} style={{ width: `${w}%`, textAlign: 'center' }}>
            {Math.round(r.percent)}%
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
