'use client';

// Checkers: pieces that can move softly glow. Tap one, then tap where it goes, or drag it. Jumps are compulsory, and the board says so.

import { useMemo, useState } from 'react';
import { CheckerPiece } from './pieces';
import FocusArrow from './FocusArrow';
import useDrag from './useDrag.js';
import { checkersMoves, lastMoveOf } from './logic.js';

const at = (row, col) => `${row},${col}`;

export default function CheckersBoard({ match, busy, onMove, focus = null }) {
  const state = match.state;
  const you = match.your_side === 1 ? 1 : 0;
  const [picked, setPicked] = useState(null); // 'row,col'
  const moves = useMemo(() => (busy ? [] : checkersMoves(state, you)), [state, you, busy]);
  const mustJump = moves.some((m) => m.jumped);
  const chain = state.capture_chain ? at(state.capture_chain[0], state.capture_chain[1]) : null;
  const movers = new Set(moves.map((m) => at(m.from.row, m.from.col)));
  const last = lastMoveOf(match);
  const lastMove = last && last.move && last.move.from && typeof last.move.from === 'object' ? last.move : null;

  const rows = you === 0 ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
  const cols = you === 0 ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];

  const go = (from, to) => {
    const move = moves.find((m) => at(m.from.row, m.from.col) === from && at(m.to.row, m.to.col) === to);
    if (!move) { setPicked(null); return; }
    setPicked(null);
    onMove({ from: move.from, to: move.to });
  };

  const drag = useDrag({
    renderGhost: ({ piece }) => <CheckerPiece side={piece.toLowerCase() === 'r' ? 0 : 1} king={piece === piece.toUpperCase()} />,
    onTap: ({ key, piece }) => {
      if (busy) return;
      const current = chain || picked;
      if (current && current !== key && moves.some((m) => at(m.from.row, m.from.col) === current && at(m.to.row, m.to.col) === key)) { go(current, key); return; }
      if (piece && movers.has(key)) setPicked(picked === key ? null : key);
      else setPicked(null);
    },
    onDrop: ({ key }, target) => {
      if (target.startsWith('sq:')) go(key, target.slice(3));
    },
    size: 58,
  });

  const active = drag.dragging ? drag.dragging.key : (chain || picked);
  const targets = new Set(moves.filter((m) => at(m.from.row, m.from.col) === active).map((m) => at(m.to.row, m.to.col)));
  // What the tutor is pointing at: a move (an arrow) and any other squares it mentions.
  const pointed = focus && focus.kind === 'checkers' ? focus : null;
  const pointedCells = new Set(pointed ? (pointed.cells || []).map((cell) => at(cell.row, cell.col)) : []);
  const spot = (cell) => [cols.indexOf(cell.col) + 0.5, rows.indexOf(cell.row) + 0.5];
  const aimKey = pointed ? (pointed.to ? at(pointed.to.row, pointed.to.col) : [...pointedCells][0]) : null;
  const message = busy ? 'Waiting for the other move' : chain ? 'Keep jumping with the same piece' : mustJump ? 'You must jump' : 'Your move';

  return (
    <div className="pg-game pg-game--checkers">
      <div className="pg-stage">
        <div className={`pg-board pg-checkers ${drag.dragging ? 'is-dragging' : ''}`} aria-label="Checkers board" role="group">
          {rows.map((r, ri) => cols.map((c, ci) => {
            const key = at(r, c);
            const piece = state.board[r][c];
            const dark = (r + c) % 2 === 1;
            const mine = piece && (piece.toLowerCase() === 'r' ? 0 : 1) === you;
            const canMove = mine && movers.has(key);
            const isTarget = targets.has(key);
            const toLast = lastMove && lastMove.to.row === r && lastMove.to.col === c;
            const fromLast = lastMove && lastMove.from.row === r && lastMove.from.col === c;
            const arrived = toLast && piece;
            const dx = arrived ? cols.indexOf(lastMove.from.col) - ci : 0;
            const dy = arrived ? rows.indexOf(lastMove.from.row) - ri : 0;
            const classes = [
              'pg-sq', dark ? 'is-dark' : 'is-light',
              active === key ? 'is-selected' : '',
              isTarget ? 'is-target' : '',
              drag.over === `sq:${key}` && isTarget ? 'is-over' : '',
              toLast || fromLast ? 'is-last' : '',
              canMove ? 'is-mover' : '',
              canMove && active !== key ? (mustJump ? 'can-jump' : 'can-move') : '',
              pointedCells.has(key) ? 'is-focus' : '',
              pointed && pointed.from && at(pointed.from.row, pointed.from.col) === key ? 'is-focus-start' : '',
              pointed && pointed.to && at(pointed.to.row, pointed.to.col) === key ? 'is-focus-end' : '',
            ].filter(Boolean).join(' ');
            const label = `Row ${8 - r}, column ${'abcdefgh'[c]}${piece ? `, ${piece.toLowerCase() === 'r' ? 'coral' : 'ivory'} ${piece === piece.toUpperCase() ? 'king' : 'checker'}` : ''}${isTarget ? ', you can move here' : ''}`;
            return (
              <button
                key={key}
                type="button"
                aria-label={label}
                className={classes}
                tabIndex={dark ? 0 : -1}
                data-pg-focus={key === aimKey ? 'true' : undefined}
                {...(dark ? { 'data-drop': `sq:${key}` } : {})}
                {...drag.bind({ key, piece }, { draggable: Boolean(canMove) })}
              >
                {ci === 0 && <b className="pg-coord pg-coord--rank">{8 - r}</b>}
                {ri === 7 && <b className="pg-coord pg-coord--file">{'abcdefgh'[c]}</b>}
                {piece && (
                  <span className={`pg-checker-wrap ${arrived ? 'has-arrived' : ''} ${drag.dragging && drag.dragging.key === key ? 'is-lifted' : ''}`} style={arrived ? { '--dx': dx, '--dy': dy } : undefined}>
                    <CheckerPiece side={piece.toLowerCase() === 'r' ? 0 : 1} king={piece === piece.toUpperCase()} />
                  </span>
                )}
              </button>
            );
          }))}
          {pointed && pointed.from && pointed.to && <FocusArrow from={spot(pointed.from)} to={spot(pointed.to)} />}
        </div>
      </div>
      <div className="pg-dock">
        <p className={`pg-status ${mustJump && !busy ? 'is-alert' : ''}`} role="status">{message}</p>
        <p className="pg-hint">Glowing pieces can move. Tap one, then tap a glowing square. Or drag it there.</p>
      </div>
      {drag.ghost}
    </div>
  );
}
