'use client';

// Ludo: tap the dice to roll. Your movable tokens glow and show where they would land. Tap one to move it, or drag it to its glowing landing square.
// Tokens hop square by square so you can follow every move. A six brings a token out of its base.

import { useEffect, useMemo, useState } from 'react';
import { Die } from './pieces';
import useDrag from './useDrag.js';
import { LUDO_BASES, LUDO_COLORS, LUDO_LANES, LUDO_LOOP, LUDO_SAFE, ludoColor, ludoMovable, ludoPoint, seatName } from './logic.js';

// Colours by corner: two players take red (top-left) and gold (bottom-right); three or four also use green (top-right) and blue (bottom-left).
const START_COLOR = { 0: 0, 13: 2, 26: 1, 39: 3 };
const LANE_COLOR = new Map();
LUDO_LANES[0].forEach(([r, c]) => LANE_COLOR.set(`${r},${c}`, 0));
LUDO_LANES[1].forEach(([r, c]) => LANE_COLOR.set(`${r},${c}`, 1));
[1, 2, 3, 4, 5, 6].forEach((r) => LANE_COLOR.set(`${r},7`, 2));
[13, 12, 11, 10, 9, 8].forEach((r) => LANE_COLOR.set(`${r},7`, 3));
const STARS = LUDO_SAFE.filter((i) => !(i in START_COLOR));

export default function LudoBoard({ match, busy, onMove, previous, opp, focus = null }) {
  const state = match.state;
  const count = state.tokens.length;
  const you = Math.min(match.your_side || 0, count - 1);
  const colorOf = (side) => LUDO_COLORS[ludoColor(count, side)];
  const liveColors = new Set(Array.from({ length: count }, (_, side) => ludoColor(count, side)));
  const pointed = focus && focus.kind === 'ludo' ? focus.tokens || [] : [];
  const mover = seatName(match, state.side, opp);
  const [rolling, setRolling] = useState(false);
  const movable = useMemo(() => (busy ? [] : ludoMovable(state, you)), [state, you, busy]);
  const movableMap = new Map(movable.map((m) => [m.token, m.to]));

  // Hop each token from where it was to where it is now.
  const before = previous && previous.state && previous.state.tokens ? previous.state.tokens : null;
  const [shown, setShown] = useState(() => state.tokens.map((side, s) => side.map((p, t) => (before ? before[s][t] : p))));
  useEffect(() => {
    const timers = [];
    state.tokens.forEach((side, s) => side.forEach((goal, t) => {
      const start = before ? before[s][t] : goal;
      const set = (value) => setShown((cur) => cur.map((row, i) => (i === s ? row.map((v, j) => (j === t ? value : v)) : row)));
      if (start === goal) { set(goal); return; }
      const delay = s === you ? 0 : 700;
      if (goal > start && start >= 0) {
        for (let step = 1; step <= goal - start; step++) timers.push(setTimeout(() => set(start + step), delay + 120 * step));
      } else {
        timers.push(setTimeout(() => set(goal), delay + 120));
      }
    }));
    return () => timers.forEach(clearTimeout);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const go = (token) => { if (busy || !movableMap.has(token)) return; onMove({ action: 'move', token }); };
  const roll = () => { if (busy || state.dice !== null) return; setRolling(true); onMove({ action: 'roll' }); };

  const drag = useDrag({
    renderGhost: ({ side }) => <span className="pg-ghost-token" style={{ '--c': colorOf(side).fill, '--d': colorOf(side).deep }} />,
    onTap: ({ token }) => go(token),
    onDrop: ({ token }, target) => { if (target === `dest:${token}`) go(token); },
    size: 44,
  });

  // Where every token is drawn, with a small shift when several share a square.
  const placed = [];
  const crowd = new Map();
  state.tokens.forEach((side, s) => side.forEach((_, t) => {
    const position = shown[s][t];
    const [row, col] = ludoPoint(s, position, t, count);
    const k = position < 0 ? `base${s}${t}` : `${row},${col}`;
    const n = crowd.get(k) || 0;
    crowd.set(k, n + 1);
    placed.push({ s, t, position, row, col, k, n });
  }));
  const shift = [[0, 0], [0.2, 0.2], [-0.2, 0.2], [0.2, -0.2]];

  const dice = state.dice;
  const message = busy
    ? (match.status !== 'active' ? 'Game over' : `Waiting for ${mover}`)
    : dice === null ? 'Your turn: roll the dice' : movable.length ? `You rolled a ${dice}. Tap a glowing token.` : `You rolled a ${dice}`;

  return (
    <div className="pg-game pg-game--ludo">
      <div className="pg-stage">
        <div className={`pg-board pg-ludo ${drag.dragging ? 'is-dragging' : ''}`}>
          <svg viewBox="0 0 15 15" role="group" aria-label="Ludo board">
            <rect x="0" y="0" width="15" height="15" rx="0.7" className="pg-ludo-bg" />
            {LUDO_BASES.map((base, b) => {
              const color = LUDO_COLORS[b];
              const live = liveColors.has(b);
              return (
                <g key={b} className={live ? '' : 'is-idle'}>
                  <rect x={base.corner[1]} y={base.corner[0]} width="6" height="6" rx="0.7" fill={color.fill} />
                  <rect x={base.corner[1] + 0.9} y={base.corner[0] + 0.9} width="4.2" height="4.2" rx="0.6" fill="#fff" opacity="0.92" />
                  {base.spots.map(([r, c], i) => <circle key={i} cx={c} cy={r} r="0.62" fill={color.soft} stroke={color.fill} strokeWidth="0.1" />)}
                </g>
              );
            })}
            {LUDO_LOOP.map(([r, c], i) => {
              const start = START_COLOR[i];
              return <rect key={i} x={c + 0.04} y={r + 0.04} width="0.92" height="0.92" rx="0.14" className="pg-ludo-cell" fill={start !== undefined ? LUDO_COLORS[start].fill : undefined} />;
            })}
            {[...LANE_COLOR.entries()].map(([k, color]) => {
              const [r, c] = k.split(',').map(Number);
              return <rect key={k} x={c + 0.04} y={r + 0.04} width="0.92" height="0.92" rx="0.14" fill={LUDO_COLORS[color].fill} opacity="0.78" />;
            })}
            {STARS.map((i) => <path key={i} className="pg-ludo-star" d="m12 3.4 2.6 5.4 5.9.8-4.3 4.2 1 5.9L12 16.9l-5.2 2.8 1-5.9-4.3-4.2 5.9-.8z" transform={`translate(${LUDO_LOOP[i][1] + 0.5 - 0.37} ${LUDO_LOOP[i][0] + 0.5 - 0.37}) scale(0.0308)`} />)}
            {[0, 13, 26, 39].map((i) => <circle key={i} cx={LUDO_LOOP[i][1] + 0.5} cy={LUDO_LOOP[i][0] + 0.5} r="0.17" className="pg-ludo-go" />)}
            <polygon points="6,6 9,6 7.5,7.5" fill={LUDO_COLORS[2].fill} />
            <polygon points="9,6 9,9 7.5,7.5" fill={LUDO_COLORS[1].fill} />
            <polygon points="9,9 6,9 7.5,7.5" fill={LUDO_COLORS[3].fill} />
            <polygon points="6,9 6,6 7.5,7.5" fill={LUDO_COLORS[0].fill} />
            <circle cx="7.5" cy="7.5" r="0.5" className="pg-ludo-hub" />

            {placed.sort((a, b) => Number(movableMap.has(a.t) && a.s === you) - Number(movableMap.has(b.t) && b.s === you)).map(({ s, t, row, col, n }) => {
              const color = colorOf(s);
              const can = s === you && movableMap.has(t);
              const aimed = s === you && pointed.includes(t);
              const [dx, dy] = shift[n] || [0, 0];
              const props = can ? drag.bind({ token: t, side: s }, { draggable: true }) : {};
              return (
                <g
                  key={`${s}${t}`}
                  className={`pg-lt ${can ? 'can-move' : ''} ${aimed ? 'is-focus' : ''} ${drag.dragging && drag.dragging.token === t && s === you ? 'is-lifted' : ''}`}
                  data-pg-focus={aimed && t === pointed[0] ? 'true' : undefined}
                  style={{ transform: `translate(${col + dx}px, ${row + dy}px)`, '--c': color.fill, '--d': color.deep }}
                  role={can ? 'button' : undefined}
                  tabIndex={can ? 0 : undefined}
                  aria-label={can ? `Move token ${t + 1}` : undefined}
                  {...props}
                  onKeyDown={can ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(t); } } : undefined}
                >
                  {can && <circle r="0.62" className="pg-lt-halo" />}
                  {aimed && <circle r="0.78" className="pg-lt-aim" />}
                  <circle r="0.4" cy="0.06" className="pg-lt-shadow" />
                  <circle r="0.4" className="pg-lt-body" />
                  <circle r="0.24" className="pg-lt-core" />
                  <text y="0.13" textAnchor="middle" className="pg-lt-num">{t + 1}</text>
                </g>
              );
            })}
            {[...movableMap.entries()].map(([token, to]) => {
              const [row, col] = ludoPoint(you, to, token, count);
              return <circle key={`dest${token}`} cx={col} cy={row} r="0.62" className="pg-ludo-dest" data-drop={`dest:${token}`} onClick={() => go(token)} />;
            })}
          </svg>
        </div>
      </div>
      <div className="pg-dock pg-dock--ludo">
        <button type="button" className={`pg-roll ${rolling ? 'is-rolling' : ''}`} disabled={busy || dice !== null} onClick={roll} aria-label="Roll the die">
          <Die value={dice || (rolling ? 5 : 6)} rolling={rolling} size="lg" tone={`is-side${ludoColor(count, you) === 0 ? 0 : 1}`} />
          <span>{dice !== null ? 'Rolled' : 'Roll'}</span>
        </button>
        <div className="pg-dock-text">
          <p className="pg-status" role="status">{message}</p>
          <p className="pg-hint">Get a six to bring a token out. Land on another token to send it home. Stars are safe squares. You are {colorOf(you).name}.</p>
        </div>
      </div>
      {drag.ghost}
    </div>
  );
}
