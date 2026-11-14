'use client';

// Chess: tap a piece and tap a glowing square, or drag the piece and drop it. The board turns round so your pieces are always at the bottom.

import { useMemo, useState } from 'react';
import { ChessPiece } from './pieces';
import FocusArrow from './FocusArrow';
import useDrag from './useDrag.js';
import { chessGrid, chessStatus, chessTargets, lastMoveOf, squareName } from './logic.js';

const NAMES = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };

export default function ChessBoard({ match, busy, onMove, focus = null }) {
  const fen = match.state.fen;
  const you = match.your_side === 1 ? 1 : 0;
  const myColor = you === 0 ? 'w' : 'b';
  const [selected, setSelected] = useState(null);
  const [promotion, setPromotion] = useState(null); // { from, to }
  const grid = useMemo(() => chessGrid(fen), [fen]);
  const status = useMemo(() => chessStatus(fen), [fen]);
  const last = lastMoveOf(match);
  const lastMove = last && last.move && last.move.from ? last.move : null;

  const own = (piece) => Boolean(piece) && (piece === piece.toUpperCase() ? 'w' : 'b') === myColor;
  const rows = you === 0 ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
  const cols = you === 0 ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];

  const attempt = (from, to) => {
    if (busy || !from) return;
    const options = chessTargets(fen, from).filter((m) => m.to === to);
    if (!options.length) { setSelected(null); return; }
    if (options.some((m) => m.promotion)) { setPromotion({ from, to }); return; }
    setSelected(null);
    onMove({ from, to });
  };

  const drag = useDrag({
    renderGhost: (payload) => <ChessPiece type={payload.piece} color={myColor} />,
    onTap: ({ square, piece }) => {
      if (promotion) { setPromotion(null); return; }
      if (busy) return;
      if (selected && selected !== square && chessTargets(fen, selected).some((m) => m.to === square)) { attempt(selected, square); return; }
      if (own(piece)) setSelected(selected === square ? null : square);
      else setSelected(null);
    },
    onDrop: ({ square }, target) => {
      if (target.startsWith('sq:')) attempt(square, target.slice(3));
    },
    size: 64,
  });

  const active = drag.dragging ? drag.dragging.square : selected;
  const targets = useMemo(() => (active && !busy ? chessTargets(fen, active) : []), [active, fen, busy]);
  const targetSet = new Set(targets.map((m) => m.to));
  const captureSet = new Set(targets.filter((m) => m.captured || (m.flags || '').includes('e')).map((m) => m.to));

  // What the tutor is pointing at: a move (an arrow from one square to another) and any other squares it mentions.
  const pointed = focus && focus.kind === 'chess' ? focus : null;
  const pointedSquares = new Set(pointed ? pointed.squares || [] : []);
  const spot = (square) => [cols.indexOf('abcdefgh'.indexOf(square[0])) + 0.5, rows.indexOf(8 - Number(square[1])) + 0.5];

  const message = status.mate ? 'Checkmate' : status.draw ? 'Draw' : status.check ? 'Check! Protect your king' : busy ? 'Waiting for the other move' : 'Your move';

  return (
    <div className="pg-game pg-game--chess">
      <div className="pg-stage">
        <div className={`pg-board pg-chess ${drag.dragging ? 'is-dragging' : ''}`} role="group" aria-label="Chess board">
          {rows.map((r, ri) => cols.map((c, ci) => {
            const name = squareName(r, c);
            const piece = grid[r][c];
            const light = (r + c) % 2 === 0;
            const mine = own(piece);
            const isTarget = targetSet.has(name);
            const fromLast = lastMove && lastMove.from === name;
            const toLast = lastMove && lastMove.to === name;
            const arrived = toLast && piece;
            const dx = arrived ? (cols.indexOf('abcdefgh'.indexOf(lastMove.from[0])) - ci) : 0;
            const dy = arrived ? (rows.indexOf(8 - Number(lastMove.from[1])) - ri) : 0;
            const classes = [
              'pg-sq', light ? 'is-light' : 'is-dark',
              active === name ? 'is-selected' : '',
              isTarget ? (captureSet.has(name) ? 'is-capture' : 'is-target') : '',
              fromLast || toLast ? 'is-last' : '',
              status.king === name ? 'is-check' : '',
              drag.over === `sq:${name}` && isTarget ? 'is-over' : '',
              mine && !busy ? 'is-mine' : '',
              pointedSquares.has(name) ? 'is-focus' : '',
              pointed && pointed.from === name ? 'is-focus-start' : '',
              pointed && pointed.to === name ? 'is-focus-end' : '',
            ].filter(Boolean).join(' ');
            const label = `${name}${piece ? `, ${piece === piece.toUpperCase() ? 'white' : 'black'} ${NAMES[piece.toLowerCase()]}` : ', empty'}${isTarget ? ', you can move here' : ''}`;
            return (
              <button
                key={name}
                type="button"
                data-drop={`sq:${name}`}
                data-pg-focus={pointed && (pointed.to || (pointed.squares || [])[0]) === name ? 'true' : undefined}
                aria-label={label}
                className={classes}
                {...drag.bind({ square: name, piece }, { draggable: mine && !busy })}
              >
                {ci === 0 && <b className="pg-coord pg-coord--rank">{8 - r}</b>}
                {ri === 7 && <b className="pg-coord pg-coord--file">{'abcdefgh'[c]}</b>}
                {piece && (
                  <span className={`pg-chess-piece ${arrived ? 'has-arrived' : ''} ${drag.dragging && drag.dragging.square === name ? 'is-lifted' : ''}`} style={arrived ? { '--dx': dx, '--dy': dy } : undefined}>
                    <ChessPiece type={piece} color={piece === piece.toUpperCase() ? 'w' : 'b'} />
                  </span>
                )}
              </button>
            );
          }))}
          {pointed && pointed.from && pointed.to && <FocusArrow from={spot(pointed.from)} to={spot(pointed.to)} />}
          {promotion && (
            <div className="pg-promo" role="dialog" aria-label="Choose a piece for your pawn">
              <p>Your pawn made it! Pick its new piece.</p>
              <div>
                {['q', 'r', 'b', 'n'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    aria-label={NAMES[type]}
                    onClick={() => { const { from, to } = promotion; setPromotion(null); setSelected(null); onMove({ from, to, promotion: type }); }}
                  >
                    <ChessPiece type={type} color={myColor} />
                    <span>{NAMES[type]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="pg-dock">
        <p className={`pg-status ${status.check ? 'is-alert' : ''}`} role="status">{message}</p>
        <p className="pg-hint">Tap a piece, then a glowing square. Or drag the piece across.</p>
      </div>
      {drag.ghost}
    </div>
  );
}
