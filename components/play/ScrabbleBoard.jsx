'use client';

// Scrabble: click and drop. Tap a tile in your rack and tap a square, or drag the tile onto the board.
// Tiles you have dropped can be dragged to another square or tapped to go back to the rack. The board reads the tiles you placed,
// builds the word for you, shows what it is worth, and sends it when you press Play. A blank tile asks which letter it stands for.

import { useEffect, useMemo, useRef, useState } from 'react';
import useDrag from './useDrag.js';
import { SCRABBLE_POINTS, composeScrabble, lastMoveOf, scrabblePremium, scrabblePreview, scrabbleProblem, seatName } from './logic.js';

const PREMIUM_LABEL = { tw: 'TW', dw: 'DW', tl: 'TL', dl: 'DL' };
const PREMIUM_NAME = { tw: 'triple word', dw: 'double word', tl: 'triple letter', dl: 'double letter' };
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const cellKey = (row, col) => `${row},${col}`;

function Tile({ letter, blank = false, raw, className = '' }) {
  const shown = letter === '?' ? '' : letter;
  const points = blank || raw === '?' || letter === '?' ? 0 : SCRABBLE_POINTS[letter];
  return (
    <span className={`pg-tile ${blank || letter === '?' ? 'is-blank' : ''} ${className}`}>
      <span className="pg-tile-letter">{shown}</span>
      <sub className="pg-tile-points">{points || ''}</sub>
    </span>
  );
}

export default function ScrabbleBoard({ match, busy, onMove, opp, focus = null }) {
  const state = match.state;
  const mover = seatName(match, state.side, opp);
  // What the tutor is pointing at: the squares of a word it suggests (shown as faint "ghost" tiles on empty squares).
  const pointed = useMemo(() => {
    const map = new Map();
    if (focus && focus.kind === 'scrabble') (focus.cells || []).forEach((cell) => map.set(`${cell.row},${cell.col}`, cell.letter));
    return map;
  }, [focus]);
  const firstPointed = pointed.size ? [...pointed.keys()][0] : null;
  const board = state.board;
  const [rack, setRack] = useState(() => state.your_rack.map((letter, index) => ({ id: `t${index}`, letter })));
  const [placed, setPlaced] = useState({}); // 'row,col' -> { id, raw, letter, blank }
  const [selected, setSelected] = useState(null);
  const [pendingBlank, setPendingBlank] = useState(null);
  const [zoom, setZoom] = useState(false);
  const [sure, setSure] = useState(false);
  const stage = useRef(null);
  const empty = useMemo(() => !board.flat().some(Boolean), [board]);

  useEffect(() => {
    if (!sure) return undefined;
    const timer = setTimeout(() => setSure(false), 3200);
    return () => clearTimeout(timer);
  }, [sure]);

  const list = useMemo(() => Object.entries(placed).map(([k, t]) => {
    const [row, col] = k.split(',').map(Number);
    return { row, col, letter: t.letter };
  }), [placed]);
  const composed = useMemo(() => composeScrabble(board, list), [board, list]);
  const problem = list.length ? scrabbleProblem(board, composed) : '';
  const preview = useMemo(() => (composed.ok && !problem ? scrabblePreview(board, state.your_rack, composed) : null), [board, state.your_rack, composed, problem]);

  const last = lastMoveOf(match);
  const lastCells = useMemo(() => {
    const set = new Set();
    const m = last && last.move;
    if (m && m.action === 'place' && m.start) {
      for (let i = 0; i < m.word.length; i++) set.add(cellKey(m.start.row + (m.direction === 'down' ? i : 0), m.start.col + (m.direction === 'across' ? i : 0)));
    }
    return set;
  }, [last]);
  const lastWord = last && last.move && last.move.action === 'place' ? last.move.word : null;
  const lastPassed = last && last.move && last.move.action === 'pass';
  const lastBy = last ? (last.side === 'bear' ? opp : seatName(match, last.side, opp)) : opp;
  const lastWasYou = last && last.side === (match.your_side || 0);

  const open = (row, col) => !board[row][col] && !placed[cellKey(row, col)];

  const commit = (tile, row, col, letter, from) => {
    setPlaced((p) => {
      const next = { ...p };
      if (from) delete next[from];
      next[cellKey(row, col)] = { id: tile.id, raw: tile.letter, letter, blank: tile.letter === '?' };
      return next;
    });
    if (!from) setRack((r) => r.filter((t) => t.id !== tile.id));
    setSelected(null);
  };

  const put = (tile, row, col, from) => {
    if (busy || !open(row, col)) return;
    if (tile.letter === '?' && !(from && placed[from])) { setPendingBlank({ tile, row, col, from }); return; }
    const letter = from && placed[from] ? placed[from].letter : tile.letter;
    commit(tile, row, col, letter, from);
  };

  const giveBack = (key, index) => {
    const t = placed[key];
    if (!t) return;
    setPlaced((p) => { const next = { ...p }; delete next[key]; return next; });
    setRack((r) => {
      const next = [...r];
      next.splice(index === undefined ? next.length : Math.min(index, next.length), 0, { id: t.id, letter: t.raw });
      return next;
    });
  };

  const reorder = (id, index) => {
    setRack((r) => {
      const tile = r.find((t) => t.id === id);
      if (!tile) return r;
      const rest = r.filter((t) => t.id !== id);
      rest.splice(Math.min(index, rest.length), 0, tile);
      return rest;
    });
  };

  const drag = useDrag({
    renderGhost: ({ letter, raw }) => <Tile letter={letter} raw={raw} />,
    onTap: (payload) => {
      if (busy) return;
      if (payload.src === 'rack') setSelected((s) => (s === payload.id ? null : payload.id));
      else if (payload.src === 'board') { giveBack(payload.key); setSelected(null); }
      else if (payload.src === 'cell' && selected) {
        const tile = rack.find((t) => t.id === selected);
        if (tile) put(tile, payload.row, payload.col);
      }
    },
    onDrop: (payload, target) => {
      if (busy) return;
      if (target.startsWith('cell:')) {
        const [row, col] = target.slice(5).split(',').map(Number);
        if (payload.src === 'rack') {
          const tile = rack.find((t) => t.id === payload.id);
          if (tile) put(tile, row, col);
        } else if (payload.src === 'board') {
          const t = placed[payload.key];
          if (t && payload.key !== cellKey(row, col)) put({ id: t.id, letter: t.raw }, row, col, payload.key);
        }
      } else if (target.startsWith('rack:')) {
        const index = target.endsWith('end') ? 99 : Number(target.slice(5));
        if (payload.src === 'rack') reorder(payload.id, index);
        else if (payload.src === 'board') giveBack(payload.key, index);
      }
    },
    size: 58,
  });

  const recall = () => {
    Object.keys(placed).forEach((k) => giveBack(k));
    setSelected(null);
  };
  const shuffle = () => setRack((r) => {
    const next = [...r];
    for (let i = next.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
    return next;
  });

  // Zoom in on the area around your tiles (or the middle) so small phones get comfortable squares.
  useEffect(() => {
    if (!zoom || !stage.current) return;
    const target = list.length ? cellKey(list[list.length - 1].row, list[list.length - 1].col) : (lastCells.size ? [...lastCells][0] : '7,7');
    const el = stage.current.querySelector(`[data-cell="${target}"]`);
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'center', inline: 'center' });
  }, [zoom]); // eslint-disable-line react-hooks/exhaustive-deps

  const canPlay = !busy && composed.ok && !problem;
  const play = () => {
    if (!canPlay) return;
    onMove({ action: 'place', word: composed.word, start: composed.start, direction: composed.direction });
  };
  const pass = () => {
    if (busy) return;
    if (!sure) { setSure(true); return; }
    setSure(false);
    onMove({ action: 'pass' });
  };

  const letterPicks = (
    <div className="pg-blank" role="dialog" aria-label="Choose a letter for your blank tile">
      <p>Blank tile: which letter should it be?</p>
      <div>
        {LETTERS.map((letter) => (
          <button key={letter} type="button" onClick={() => { const b = pendingBlank; setPendingBlank(null); commit(b.tile, b.row, b.col, letter, b.from); }}>{letter}</button>
        ))}
      </div>
      <button type="button" className="pg-blank-cancel" onClick={() => setPendingBlank(null)}>Cancel</button>
    </div>
  );

  const message = busy
    ? `Waiting for ${mover}`
    : !list.length
      ? (empty ? 'You start. Cover the star in the middle.' : 'Tap a tile, then a square. Or drag it.')
      : problem || (preview ? `${composed.word}: ${preview.points} points if it is a word` : '');

  return (
    <div className="pg-game pg-game--scrabble">
      <div ref={stage} className={`pg-stage ${zoom ? 'is-zoomed' : ''}`}>
        <div className={`pg-board pg-scrabble ${zoom ? 'is-zoomed' : ''} ${drag.dragging ? 'is-dragging' : ''}`} role="group" aria-label="Scrabble board">
          {board.map((line, row) => line.map((tile, col) => {
            const key = cellKey(row, col);
            const mine = placed[key];
            const premium = scrabblePremium(row, col);
            const isOver = drag.over === `cell:${key}` && open(row, col);
            const classes = [
              'pg-cell',
              premium ? `is-${premium}` : '',
              tile ? 'has-tile' : '',
              mine ? 'has-mine' : '',
              lastCells.has(key) ? 'is-last' : '',
              isOver ? 'is-over' : '',
              !tile && !mine && selected && !busy ? 'is-open' : '',
              row === 7 && col === 7 ? 'is-star' : '',
              pointed.has(key) ? 'is-focus' : '',
              pointed.has(key) && !tile && !mine ? 'has-ghost' : '',
            ].filter(Boolean).join(' ');
            const aim = key === firstPointed ? { 'data-pg-focus': 'true' } : {};
            if (tile) {
              return (
                <div key={key} data-cell={key} {...aim} className={classes} role="img" aria-label={`${tile.letter}${tile.blank ? ' (blank)' : ''} at row ${row + 1}, column ${col + 1}`}>
                  <Tile letter={tile.letter} blank={tile.blank} />
                </div>
              );
            }
            const label = `Row ${row + 1}, column ${col + 1}${premium ? `, ${PREMIUM_NAME[premium]} square` : ''}${mine ? `, your tile ${mine.letter}` : ', empty'}`;
            return (
              <button
                key={key}
                type="button"
                data-cell={key}
                {...aim}
                data-drop={`cell:${key}`}
                aria-label={label}
                className={classes}
                {...(mine ? drag.bind({ src: 'board', key, letter: mine.letter, raw: mine.raw }, { draggable: !busy }) : drag.bind({ src: 'cell', row, col }, { draggable: false }))}
              >
                {mine
                  ? <Tile letter={mine.letter} raw={mine.raw} blank={mine.blank} className="is-mine" />
                  : pointed.has(key) ? <span className="pg-ghost-tile" aria-hidden>{pointed.get(key)}</span>
                  : (row === 7 && col === 7 ? <span className="pg-star" aria-hidden>★</span> : premium ? <span className="pg-premium" aria-hidden>{PREMIUM_LABEL[premium]}</span> : null)}
              </button>
            );
          }))}
        </div>
      </div>

      <div className="pg-dock pg-dock--scrabble">
        <div className="pg-scoreline">
          <p className={`pg-status ${problem ? 'is-warn' : ''} ${preview ? 'is-good' : ''}`} role="status">{message}</p>
          <span className="pg-bag" title="Tiles left in the bag">{state.remaining_tiles} in bag</span>
        </div>
        {preview && preview.words.length > 1 && (
          <p className="pg-hint">Also makes {preview.words.slice(1).map((w) => w.word).join(', ')}</p>
        )}
        {!list.length && lastWord && !busy && !lastWasYou && <p className="pg-hint">{lastBy} played {lastWord}.</p>}
        {!list.length && lastPassed && !busy && !lastWasYou && <p className="pg-hint">{lastBy} passed.</p>}

        <div className={`pg-rack ${busy ? 'is-idle' : ''}`} data-drop="rack:end" aria-label="Your tiles">
          {Array.from({ length: Math.max(7, rack.length) }, (_, index) => {
            const tile = rack[index];
            const over = drag.over === `rack:${index}`;
            return (
              <div key={tile ? tile.id : `gap${index}`} className={`pg-slot ${over ? 'is-over' : ''}`} data-drop={`rack:${index}`}>
                {tile && (
                  <button
                    type="button"
                    aria-label={`Tile ${tile.letter === '?' ? 'blank' : tile.letter}${selected === tile.id ? ', selected' : ''}`}
                    aria-pressed={selected === tile.id}
                    className={`pg-rack-tile ${selected === tile.id ? 'is-selected' : ''} ${drag.dragging && drag.dragging.id === tile.id ? 'is-lifted' : ''}`}
                    {...drag.bind({ src: 'rack', id: tile.id, letter: tile.letter, raw: tile.letter }, { draggable: !busy })}
                  >
                    <Tile letter={tile.letter} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="pg-actions">
          <button type="button" className="pg-btn pg-btn--quiet" onClick={shuffle} disabled={rack.length < 2} aria-label="Shuffle my tiles">Shuffle</button>
          <button type="button" className="pg-btn pg-btn--quiet" onClick={recall} disabled={!list.length} aria-label="Take my tiles back">Recall</button>
          <button type="button" className="pg-btn pg-btn--quiet" onClick={() => setZoom((z) => !z)} aria-pressed={zoom}>{zoom ? 'Zoom out' : 'Zoom in'}</button>
          <button type="button" className={`pg-btn pg-btn--quiet ${sure ? 'is-sure' : ''}`} onClick={pass} disabled={busy || list.length > 0}>{sure ? 'Tap again to pass' : 'Pass'}</button>
          <button type="button" className="pg-btn pg-btn--primary" onClick={play} disabled={!canPlay}>
            {canPlay && preview ? `Play ${composed.word} · ${preview.points}` : 'Play word'}
          </button>
        </div>
      </div>
      {pendingBlank && letterPicks}
      {drag.ghost}
    </div>
  );
}
