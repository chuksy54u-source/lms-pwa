'use client';

// A soft arrow drawn over a square board (chess or checkers) from one square to another. The bear uses it to show the move it is
// talking about. It never takes taps (pointer-events: none), so it cannot get in the way of playing.

export default function FocusArrow({ from, to, size = 8 }) {
  if (!from || !to || (from[0] === to[0] && from[1] === to[1])) return null;
  const [x1, y1] = from;
  const [x2, y2] = to;
  const length = Math.hypot(x2 - x1, y2 - y1) || 1;
  const head = 0.34;
  // Stop the shaft just short of the arrow head so the tip lands in the middle of the target square.
  const sx = x2 - ((x2 - x1) / length) * head;
  const sy = y2 - ((y2 - y1) / length) * head;
  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  return (
    <svg className="pg-arrow-layer" viewBox={`0 0 ${size} ${size}`} aria-hidden focusable="false">
      <line x1={x1} y1={y1} x2={sx} y2={sy} className="pg-arrow-shaft" />
      <polygon points="0,-0.3 0.5,0 0,0.3" className="pg-arrow-head" transform={`translate(${x2 - ((x2 - x1) / length) * 0.38} ${y2 - ((y2 - y1) / length) * 0.38}) rotate(${angle})`} />
    </svg>
  );
}
