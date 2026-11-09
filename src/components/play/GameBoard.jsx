'use client';

// The six Playground game boards (chess, Scrabble, checkers, the property game, Ludo, Ayo). The server checks every
// move; these boards only show legal-move hints. Lifted from the backend's /dev/playground-tester so both stay in step.

import { useState } from 'react';
import { Chess } from 'chess.js';

export const GAMES = [
  { id: 'chess', name: 'Chess', mark: '♟' },
  { id: 'scrabble', name: 'Scrabble', mark: 'Aa' },
  { id: 'checkers', name: 'Checkers', mark: '◉' },
  { id: 'property', name: 'Property', mark: '⌂' },
  { id: 'ludo', name: 'Ludo', mark: '🎲' },
  { id: 'ayo', name: 'Ayo', mark: '●' },
];
const button = {
  padding: '9px 13px', border: 0, borderRadius: 9, background: 'var(--brand)',
  color: 'var(--on-brand)', font: '600 14px var(--font)', cursor: 'pointer',
};
const input = {
  padding: 9, border: '1.5px solid var(--line)', borderRadius: 10, font: '14px var(--font)', background: 'var(--surface)', color: 'var(--ink)',
};
const card = {
  background: '#fff', border: '1px solid var(--line)', borderRadius: 14, padding: 16,
  boxShadow: '0 3px 12px #1E3A5F0B',
};
const colors = { ink: 'var(--brand-text)', muted: 'var(--muted)', pale: 'var(--surface-2)', gold: 'var(--accent)' };
const glyphs = {
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟',
};
const scrabbleValues = { A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8, K: 5, L: 1, M: 3, N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1, U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10, '?': 0 };
const propertyTrack = [
  [6, 6], [6, 5], [6, 4], [6, 3], [6, 2], [6, 1], [6, 0],
  [5, 0], [4, 0], [3, 0], [2, 0], [1, 0], [0, 0],
  [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6],
  [1, 6], [2, 6], [3, 6], [4, 6], [5, 6],
];
const ludoTrack = [
  ...Array.from({ length: 13 }, (_, index) => [0, index + 1]),
  ...Array.from({ length: 13 }, (_, index) => [index + 1, 14]),
  ...Array.from({ length: 13 }, (_, index) => [14, 13 - index]),
  ...Array.from({ length: 13 }, (_, index) => [13 - index, 0]),
];
const ludoHomeSlots = [
  [[2, 2], [2, 4], [4, 2], [4, 4]],
  [[2, 10], [2, 12], [4, 10], [4, 12]],
  [[10, 2], [10, 4], [12, 2], [12, 4]],
  [[10, 10], [10, 12], [12, 10], [12, 12]],
];
const ludoHomeLanes = [
  Array.from({ length: 6 }, (_, index) => [7, index + 1]),
  Array.from({ length: 6 }, (_, index) => [index + 1, 7]),
  Array.from({ length: 6 }, (_, index) => [13 - index, 7]),
  Array.from({ length: 6 }, (_, index) => [7, 13 - index]),
];
const ludoStarts = [0, 13, 26, 39];
const ludoColors = ['#C84A49', '#3A8A62', '#3979B8', '#D6A53D'];

function scrabblePremium(row, col) {
  const key = `${row},${col}`;
  if (['0,0','0,7','0,14','7,0','7,14','14,0','14,7','14,14'].includes(key)) return 'TW';
  if (['1,1','2,2','3,3','4,4','7,7','10,10','11,11','12,12','13,13','1,13','2,12','3,11','4,10','10,4','11,3','12,2','13,1'].includes(key)) return 'DW';
  if (['1,5','1,9','5,1','5,5','5,9','5,13','9,1','9,5','9,9','9,13','13,5','13,9'].includes(key)) return 'TL';
  if (['0,3','0,11','2,6','2,8','3,0','3,7','3,14','6,2','6,6','6,8','6,12','7,3','7,11','8,2','8,6','8,8','8,12','11,0','11,7','11,14','12,6','12,8','14,3','14,11'].includes(key)) return 'DL';
  return '';
}

function checkersMoves(state, side) {
  const captures = [];
  const normal = [];
  for (let row = 0; row < 8; row++) for (let col = 0; col < 8; col++) {
    const piece = state.board[row][col];
    if (!piece || ((piece.toLowerCase() === 'r' ? 0 : 1) !== side)) continue;
    const king = piece === piece.toUpperCase();
    const directions = king ? [-1, 1] : [side === 0 ? -1 : 1];
    for (const dr of directions) for (const dc of [-1, 1]) {
      const r1 = row + dr, c1 = col + dc, r2 = row + 2 * dr, c2 = col + 2 * dc;
      if (r1 < 0 || r1 >= 8 || c1 < 0 || c1 >= 8) continue;
      if (!state.board[r1][c1]) normal.push({ from: { row, col }, to: { row: r1, col: c1 } });
      else if ((r1 + c1) % 2 === 1 && state.board[r1][c1].toLowerCase() !== piece.toLowerCase() &&
        r2 >= 0 && r2 < 8 && c2 >= 0 && c2 < 8 && !state.board[r2][c2]) {
        captures.push({ from: { row, col }, to: { row: r2, col: c2 } });
      }
    }
  }
  const candidates = state.capture_chain
    ? captures.filter((move) => move.from.row === state.capture_chain[0] && move.from.col === state.capture_chain[1])
    : captures.length ? captures : normal;
  return candidates;
}

function scrabbleStarts(state, word, direction) {
  if (!/^[A-Z]{2,15}$/.test(word)) return [];
  const dr = direction === 'across' ? 0 : 1;
  const dc = direction === 'across' ? 1 : 0;
  const starts = [];
  for (let row = 0; row < 15; row++) for (let col = 0; col < 15; col++) {
    if (row + dr * (word.length - 1) >= 15 || col + dc * (word.length - 1) >= 15) continue;
    const available = [...state.your_rack];
    let newTiles = 0, connected = false, fits = true;
    for (let i = 0; i < word.length; i++) {
      const r = row + dr * i, c = col + dc * i, tile = state.board[r][c];
      if (tile) {
        if (tile.letter !== word[i]) { fits = false; break; }
        connected = true;
        continue;
      }
      newTiles++;
      const index = available.indexOf(word[i]);
      const blankIndex = available.indexOf('?');
      if (index >= 0) available.splice(index, 1);
      else if (blankIndex >= 0) available.splice(blankIndex, 1);
      else { fits = false; break; }
      if ([[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].some(([rr, cc]) =>
        rr >= 0 && rr < 15 && cc >= 0 && cc < 15 && state.board[rr][cc])) connected = true;
    }
    if (!fits || !newTiles) continue;
    if (state.turns === 0 ? !(row <= 7 && col <= 7 && row + dr * (word.length - 1) >= 7 && col + dc * (word.length - 1) >= 7) : !connected) continue;
    starts.push(`${row},${col}`);
  }
  return starts;
}

function legalAyoPits(state, side) {
  const start = side * 6;
  const opponentStart = (1 - side) * 6;
  const available = Array.from({ length: 6 }, (_, index) => start + index).filter((pit) => state.pits[pit] > 0);
  const opponentEmpty = state.pits.slice(opponentStart, opponentStart + 6).every((count) => count === 0);
  if (!opponentEmpty) return available;
  const feedsOpponent = (pit) => {
    const pits = [...state.pits], seeds = pits[pit];
    pits[pit] = 0;
    let current = pit;
    for (let i = 0; i < seeds; i++) {
      current = (current + 1) % 12;
      if (current === pit) current = (current + 1) % 12;
      pits[current]++;
    }
    return pits.slice(opponentStart, opponentStart + 6).some((count) => count > 0);
  };
  const feedingMoves = available.filter(feedsOpponent);
  return feedingMoves.length ? feedingMoves : available;
}

export function CapturedTray({ match, opp = 'Tutor' }) {
  const state = match.state;
  const side = match.your_side === 1 ? 1 : 0;
  const opponentSide = 1 - side;
  let items = [];
  let title = '';
  if (match.game_id === 'chess') {
    const counts = {};
    for (const piece of state.fen.split(' ')[0].replace(/\//g, '')) {
      if (/[prnbqk]/i.test(piece)) counts[piece] = (counts[piece] || 0) + 1;
    }
    const pieces = [['q', 'queen', 1], ['r', 'rook', 2], ['b', 'bishop', 2], ['n', 'knight', 2], ['p', 'pawn', 8]];
    const ownPieces = side === 0 ? pieces.map(([piece]) => piece.toUpperCase()) : pieces.map(([piece]) => piece);
    const opponentPieces = side === 0 ? pieces.map(([piece]) => piece) : pieces.map(([piece]) => piece.toUpperCase());
    items = [
      { label: `Your pieces captured by ${opp}`, glyphs: pieces.flatMap(([piece, name, total], index) => Array(Math.max(0, total - (counts[ownPieces[index]] || 0))).fill(`${glyphs[ownPieces[index]]} ${name}`)) },
      { label: `${opp}’s pieces captured by you`, glyphs: pieces.flatMap(([piece, name, total], index) => Array(Math.max(0, total - (counts[opponentPieces[index]] || 0))).fill(`${glyphs[opponentPieces[index]]} ${name}`)) },
    ];
    title = 'Captured pieces';
  } else if (match.game_id === 'checkers') {
    const remaining = [0, 0];
    for (const row of state.board) for (const piece of row) if (piece) remaining[piece.toLowerCase() === 'r' ? 0 : 1] += 1;
    items = [
      { label: `Your checkers captured by ${opp}`, glyphs: Array(Math.max(0, 12 - remaining[side])).fill(side === 0 ? 'Light checker' : 'Dark checker') },
      { label: `${opp}’s checkers captured by you`, glyphs: Array(Math.max(0, 12 - remaining[opponentSide])).fill(side === 0 ? 'Dark checker' : 'Light checker') },
    ];
    title = 'Captured checkers';
  } else if (match.game_id === 'ludo') {
    items = [
      { label: 'Your tokens sent home', glyphs: Array(state.captured_tokens?.[side] || 0).fill('Your token') },
      { label: `${opp}’s tokens sent home`, glyphs: Array(state.captured_tokens?.[opponentSide] || 0).fill(`${opp}’s token`) },
    ];
    title = 'Captured tokens';
  } else if (match.game_id === 'ayo') {
    items = [
      { label: 'Your seeds scored', count: state.scores[side] },
      { label: `${opp}’s seeds scored`, count: state.scores[opponentSide] },
    ];
    title = 'Seeds captured / scored';
  } else if (match.game_id === 'scrabble') {
    const played = state.board.flat().filter(Boolean).length;
    items = [{ label: 'Tiles played (remain on the board)', count: played }];
    title = 'Tile supply';
  } else {
    return null;
  }
  return (
    <aside aria-label={title} style={{ display: 'grid', gap: 8, marginTop: 12, padding: 12, border: '1px solid var(--line)', borderRadius: 10, background: 'var(--surface-2)' }}>
      <strong style={{ color: colors.ink }}>{title}</strong>
      {items.map((item) => <div key={item.label} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, fontSize: 13 }}>
        <span style={{ color: colors.muted }}>{item.label}:</span>
        {item.count !== undefined ? <strong>{item.count}</strong> : item.glyphs.length
          ? item.glyphs.map((label, index) => <span key={`${label}-${index}`} title={label} style={{ padding: '2px 6px', borderRadius: 5, background: '#E2E8F0' }}>{label}</span>)
          : <span>None</span>}
      </div>)}
    </aside>
  );
}

export function CoachGuidance({ guidance, busy, onMove, coach = 'Tutor' }) {
  if (!guidance) return null;
  return (
    <aside aria-label={`${coach}'s move suggestion`} style={{ display: 'grid', gap: 8, margin: '0 0 12px', padding: 12, border: '1px solid #F2B84B', borderRadius: 10, background: '#FFF8EA' }}>
      <strong style={{ color: colors.ink }}>{coach}’s move suggestion</strong>
      <span>{guidance.text}</span>
      <button type="button" style={{ ...button, justifySelf: 'start' }} disabled={busy} onClick={() => onMove(guidance.move)}>Play this move</button>
    </aside>
  );
}

export function GameBoard({ match, busy, onMove, opp = 'Tutor' }) {
  const [selected, setSelected] = useState(null);
  const [word, setWord] = useState('');
  const [wordStart, setWordStart] = useState(null);
  const [wordError, setWordError] = useState('');
  const [direction, setDirection] = useState('across');
  const state = match.state;
  const side = match.your_side === 1 ? 1 : 0;
  const opponentSide = 1 - side;
  const locked = busy || match.status !== 'active';
  const act = (move) => onMove(move);

  if (match.game_id === 'chess') {
    const rows = match.state.fen.split(' ')[0].split('/').map((row) => [...row].flatMap((cell) =>
      /\d/.test(cell) ? Array(Number(cell)).fill(null) : [cell]));
    const chess = new Chess(match.state.fen);
    const ownColor = side === 0 ? 'w' : 'b';
    const legalMoves = selected ? chess.moves({ square: selected, verbose: true }).map((move) => move.to) : [];
    const movableSquares = new Set(chess.moves({ verbose: true }).filter((move) => move.color === ownColor).map((move) => move.from));
    const targets = new Set(legalMoves);
    const pick = (row, col, piece) => {
      if (locked) return;
      const square = `${'abcdefgh'[col]}${8 - row}`;
      const belongsToPlayer = piece && (side === 0 ? piece === piece.toUpperCase() : piece === piece.toLowerCase());
      if (belongsToPlayer && square !== selected) setSelected(square);
      else if (selected && square === selected) setSelected(null);
      else if (selected) act({ from: selected, to: square });
    };
    return (
      <div style={{ display: 'grid', gap: 14, justifyItems: 'center' }}>
        <strong style={{ color: colors.muted }}>{opp} · {side === 0 ? 'Black' : 'White'}</strong>
        <div aria-label="Chess board with algebraic coordinates" style={{ display: 'grid', gridTemplateColumns: '18px max-content', gridTemplateRows: '18px max-content', color: colors.muted, fontSize: 12, fontWeight: 700, textAlign: 'center' }}>
          <div aria-hidden="true" style={{ gridColumn: 2, gridRow: 1, display: 'grid', gridTemplateColumns: 'repeat(8, minmax(34px, 54px))', padding: '0 5px' }}>
            {'abcdefgh'.split('').map((file) => <span key={file}>{file}</span>)}
          </div>
          <div aria-hidden="true" style={{ gridColumn: 1, gridRow: 2, display: 'grid', gridTemplateRows: 'repeat(8, minmax(34px, 54px))', padding: '5px 0' }}>
            {Array.from({ length: 8 }, (_, row) => <span key={row} style={{ display: 'grid', placeItems: 'center' }}>{8 - row}</span>)}
          </div>
          <div style={{ gridColumn: 2, gridRow: 2, display: 'grid', gridTemplateColumns: 'repeat(8, minmax(34px, 54px))', border: '5px solid var(--brand)', borderRadius: 7, overflow: 'hidden' }}>
            {Array.from({ length: 8 }, (_, viewRow) => Array.from({ length: 8 }, (_, viewCol) => {
              const r = side === 0 ? viewRow : 7 - viewRow;
              const c = side === 0 ? viewCol : 7 - viewCol;
              const piece = rows[r][c];
              const square = `${'abcdefgh'[c]}${8 - r}`;
              const light = (r + c) % 2 === 0;
              const isTarget = targets.has(square);
              return <button key={square} aria-label={`${square}${piece ? ` ${piece}` : ''}`} onClick={() => pick(r, c, piece)}
                title={isTarget ? `Legal move to ${square}` : movableSquares.has(square) ? `Select piece on ${square}` : square}
                style={{ position: 'relative', width: 'min(11vw, 54px)', height: 'min(11vw, 54px)', minWidth: 34, minHeight: 34, padding: 0, border: movableSquares.has(square) && !selected ? '3px solid #F2B84B' : 0, background: selected === square ? '#F2B84B' : light ? '#F3E9D2' : '#759568', color: piece && piece === piece.toUpperCase() ? '#fff' : '#182230', textShadow: piece && piece === piece.toUpperCase() ? '0 1px 3px #172033' : 'none', fontSize: 'min(8vw, 39px)', lineHeight: 1, cursor: locked ? 'default' : 'pointer' }}>
                {glyphs[piece] || ''}{isTarget && <span aria-hidden="true" style={{ position: 'absolute', inset: piece ? '35%' : '42%', borderRadius: '50%', background: '#123F2ACC', border: '2px solid white', pointerEvents: 'none' }} />}
              </button>;
            }))}
          </div>
          <div aria-hidden="true" style={{ gridColumn: 2, gridRow: 3, display: 'grid', gridTemplateColumns: 'repeat(8, minmax(34px, 54px))', padding: '0 5px' }}>
            {'abcdefgh'.split('').map((file) => <span key={file}>{file}</span>)}
          </div>
        </div>
        <strong style={{ color: colors.muted }}>You · your side ({side === 0 ? 'White' : 'Black'})</strong>
        <div style={{ color: colors.muted, fontSize: 13 }}>Gold outlines show pieces that can move. After selecting one, green markers show all legal destinations.</div>
      </div>
    );
  }

  if (match.game_id === 'checkers') {
    const ownPiece = side === 0 ? 'r' : 'b';
    const legalMoves = checkersMoves(state, side);
    const legalFrom = new Set(legalMoves.map((move) => `${move.from.row},${move.from.col}`));
    const legalTo = new Set(selected ? legalMoves.filter((move) => move.from.row === selected.row && move.from.col === selected.col).map((move) => `${move.to.row},${move.to.col}`) : []);
    const pick = (row, col, piece) => {
      if (locked) return;
      if (!selected && piece && piece.toLowerCase() === ownPiece) setSelected({ row, col });
      else if (selected && selected.row === row && selected.col === col) setSelected(null);
      else if (selected) act({ from: selected, to: { row, col } });
    };
    return (
      <div style={{ display: 'grid', justifyItems: 'center', gap: 12 }}>
        <strong style={{ color: colors.muted }}>{opp} · opposite side</strong>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, minmax(34px, 48px))', border: '4px solid var(--brand)', borderRadius: 6, overflow: 'hidden' }}>
          {Array.from({ length: 8 }, (_, viewRow) => Array.from({ length: 8 }, (_, viewCol) => {
            const r = side === 0 ? viewRow : 7 - viewRow;
            const c = side === 0 ? viewCol : 7 - viewCol;
            const piece = state.board[r][c];
            const active = selected?.row === r && selected?.col === c;
            const dark = (r + c) % 2 === 1;
            const legalTarget = legalTo.has(`${r},${c}`);
            return <button key={`${r}-${c}`} aria-label={`row ${r}, column ${c}`} onClick={() => pick(r, c, piece)}
              title={legalTarget ? 'Legal destination' : legalFrom.has(`${r},${c}`) ? 'Movable checker' : ''}
              style={{ position: 'relative', width: 'min(10vw, 48px)', height: 'min(10vw, 48px)', minWidth: 34, minHeight: 34, padding: 4, border: legalFrom.has(`${r},${c}`) && !selected ? '3px solid #F2B84B' : 0, background: active ? '#F2B84B' : dark ? '#759568' : '#F3E9D2', cursor: locked ? 'default' : 'pointer' }}>
              {piece && <span style={{ display: 'grid', placeItems: 'center', width: '100%', height: '100%', borderRadius: '50%', background: piece.toLowerCase() === 'r' ? '#F8FAFC' : '#263343', color: piece.toLowerCase() === 'r' ? '#1E3A5F' : '#fff', fontSize: 23, fontWeight: 800, boxShadow: '0 2px 4px #0005' }}>{piece === piece.toUpperCase() ? '♛' : ''}</span>}
              {legalTarget && <span aria-hidden="true" style={{ position: 'absolute', inset: '38%', borderRadius: '50%', background: '#123F2ACC', border: '2px solid white', pointerEvents: 'none' }} />}
            </button>;
          }))}
        </div>
        <strong style={{ color: colors.muted }}>You · your side ({side === 0 ? 'light' : 'dark'} pieces)</strong>
        <div style={{ color: colors.muted, fontSize: 13 }}>Gold outlines show movable checkers; green markers show legal destinations. Captures are compulsory.</div>
      </div>
    );
  }

  if (match.game_id === 'scrabble') {
    const starts = scrabbleStarts(state, word.trim().toUpperCase(), direction);
    const possiblePlacements = new Set(starts);
    const previewWord = word.trim().toUpperCase();
    const startKey = wordStart && `${wordStart.row},${wordStart.col}`;
    const submitWord = (event) => {
      event.preventDefault();
      if (!startKey || !possiblePlacements.has(startKey)) {
        setWordError('Choose a green starting square for your word.');
        return;
      }
      act({ action: 'place', word: previewWord, start: wordStart, direction });
    };
    const chooseStart = (row, col) => {
      if (possiblePlacements.has(`${row},${col}`)) {
        setWordStart({ row, col });
        setWordError('');
      } else {
        setWordStart(null);
        setWordError('That square cannot start this word. Choose a green square.');
      }
    };
    return (
      <div style={{ display: 'grid', gap: 14 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, color: colors.ink, fontWeight: 700 }}>
          <span>You: {state.scores[side]} points</span><span>{opp}: {state.scores[opponentSide]} points</span><span>Tiles left: {state.remaining_tiles}</span>
        </div>
        <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
          <div style={{ width: 'max-content', padding: '4px 0', color: colors.muted, fontSize: 12, fontWeight: 700 }}>Scrabble board · green squares are valid starts</div>
          <div role="grid" aria-label="Scrabble board; choose a green square to place your word" style={{ display: 'grid', gridTemplateColumns: 'repeat(15, minmax(30px, 38px))', width: 'max-content', border: '4px solid #466A50', borderRadius: 8, gap: 1, background: '#466A50' }}>
            {state.board.flatMap((row, r) => row.map((tile, c) => {
              const key = `${r},${c}`;
              const isStart = possiblePlacements.has(key);
              const isSelected = startKey === key;
              const previewIndex = wordStart && direction === 'across' && r === wordStart.row ? c - wordStart.col
                : wordStart && direction === 'down' && c === wordStart.col ? r - wordStart.row : -1;
              const previewLetter = previewIndex >= 0 && previewIndex < previewWord.length && !tile ? previewWord[previewIndex] : '';
              const premium = scrabblePremium(r, c);
              const background = tile ? '#F2D18A' : previewLetter ? '#FFE7A8' : isStart ? '#74C99A'
                : premium === 'TW' ? '#E89B91' : premium === 'DW' ? '#F1B8B8' : premium === 'TL' ? '#91B7D7' : premium === 'DL' ? '#B7D5E9' : '#D8E9D3';
              const displayedLetter = tile?.letter || previewLetter;
              return (
                <button key={key} type="button" role="gridcell" aria-label={`Row ${r + 1}, column ${c + 1}${tile ? `, ${tile.letter}` : isStart ? ', valid word start' : ''}`}
                  onClick={() => chooseStart(r, c)}
                  onDragOver={(event) => { if (isStart) event.preventDefault(); }}
                  onDrop={(event) => { event.preventDefault(); chooseStart(r, c); }}
                  title={isStart ? `Start word at row ${r + 1}, column ${c + 1}` : premium ? `${premium} premium square` : undefined}
                  style={{ position: 'relative', width: 36, height: 36, display: 'grid', placeItems: 'center', padding: 1, background, color: colors.ink, fontSize: displayedLetter ? 17 : 9, fontWeight: 800, border: isSelected ? '3px solid #173E2C' : '1px solid #ffffffb0', cursor: isStart && !locked ? 'pointer' : 'default', boxShadow: isSelected ? '0 0 0 2px #fff inset' : 'none' }}>
                  {displayedLetter || (!tile && premium)}
                  {displayedLetter && <small style={{ position: 'absolute', right: 2, bottom: 1, fontSize: 7 }}>{tile?.blank ? 0 : scrabbleValues[displayedLetter] || ''}</small>}
                </button>
              );
            }))}
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
          <strong>Your rack:</strong>
          {state.your_rack.map((tile, i) => <span key={`${tile}-${i}`} style={{ minWidth: 34, padding: '7px 9px', textAlign: 'center', borderRadius: 6, background: '#F2D18A', color: colors.ink, fontWeight: 800, boxShadow: '0 2px 3px #0002' }}>{tile}<small style={{ display: 'block', fontSize: 9 }}>{scrabbleValues[tile] ?? 0}</small></span>)}
        </div>
        <form onSubmit={submitWord} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', alignItems: 'end', gap: 10 }}>
          <label style={{ display: 'grid', gap: 4, fontSize: 12 }}>Build your word
            <input style={input} value={word} onChange={(event) => { setWord(event.target.value.toUpperCase()); setWordStart(null); setWordError(''); }} maxLength={15} autoComplete="off" required />
          </label>
          <label style={{ display: 'grid', gap: 4, fontSize: 12 }}>Direction
            <select style={input} value={direction} onChange={(event) => { setDirection(event.target.value); setWordStart(null); }}>
              <option value="across">Across</option><option value="down">Down</option>
            </select>
          </label>
          <div draggable={!locked && starts.length > 0} onDragStart={(event) => event.dataTransfer.setData('text/plain', previewWord)}
            style={{ gridColumn: '1 / -1', padding: 10, border: '1px dashed var(--brand)', borderRadius: 9, background: 'var(--surface-2)', color: colors.ink, cursor: starts.length ? 'grab' : 'default' }}>
            <strong>Word preview:</strong> {previewWord || 'Type a word above'} · drag this onto a green square, or tap the square.
            {wordStart && <span> Starting at row {wordStart.row + 1}, column {wordStart.col + 1}.</span>}
          </div>
          {wordError && <p role="alert" style={{ gridColumn: '1 / -1', color: '#B42318', margin: 0 }}>{wordError}</p>}
          {previewWord.length >= 2 && <p style={{ gridColumn: '1 / -1', color: colors.muted, fontSize: 12, margin: 0 }}>There {starts.length === 1 ? 'is' : 'are'} {starts.length} valid starting {starts.length === 1 ? 'square' : 'squares'}. The server verifies the word and crossing words.</p>}
          <button style={button} disabled={locked || !previewWord || !starts.length}>Place word</button>
          <button type="button" style={{ ...button, background: '#64748B' }} disabled={locked} onClick={() => act({ action: 'pass' })}>Pass turn</button>
          <button type="button" style={{ ...button, background: '#64748B' }} disabled={locked} onClick={() => { setWord(''); setWordStart(null); setWordError(''); }}>Clear word</button>
        </form>
      </div>
    );
  }

  if (match.game_id === 'property') {
    const player = state.players[side];
    const opponent = state.players[opponentSide];
    const pending = state.pending_purchase !== null;
    const humanize = (value) => String(value || '').replaceAll('_', ' ');
    return (
      <div style={{ display: 'grid', gap: 14, justifyItems: 'center' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, width: '100%' }}>
          {[{ person: player, name: 'You', color: '#C64040' }, { person: opponent, name: opp, color: '#3479B8' }].map(({ person, name, color }) => (
            <div key={name} style={{ flex: '1 1 180px', padding: 12, borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
              <strong><span style={{ color, marginRight: 6 }}>●</span>{name} · ${person.cash}</strong>
              <div style={{ fontSize: 13, color: colors.muted }}>{person.properties.length} properties · Space {person.position + 1}</div>
            </div>
          ))}
        </div>
        <div aria-label="Property game board" style={{ width: '100%', overflowX: 'auto', paddingBottom: 4 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(72px, 1fr))', gridTemplateRows: 'repeat(7, minmax(72px, 1fr))', minWidth: 504, maxWidth: 700, margin: '0 auto', gap: 3, padding: 5, borderRadius: 14, background: '#2F6B54', border: '4px solid #1F4D3D' }}>
            {state.spaces.map((space, index) => {
              const [row, col] = propertyTrack[index];
              const owner = state.owner_by_space[index];
              const here = [];
              if (player.position === index) here.push({ name: 'You', color: '#C64040' });
              if (opponent.position === index) here.push({ name: opp, color: '#3479B8' });
              const band = space.type === 'property' ? ['#6DA1D8', '#D98C73', '#B28CCB', '#80B782'][Math.floor(index / 3) % 4] : '#718276';
              return (
                <div key={index} style={{ gridRow: row + 1, gridColumn: col + 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 3, minWidth: 0, padding: 5, borderRadius: 6, background: owner !== undefined ? '#FFF0C2' : '#FBF7E9', color: '#24352C', border: here.length ? `2px solid ${here[0].color}` : '1px solid #C7D0C3', fontSize: 10, textAlign: 'center' }}>
                  <span style={{ height: 5, margin: '-5px -5px 0', borderRadius: '5px 5px 0 0', background: band }} />
                  <strong style={{ lineHeight: 1.1 }}>{space.name}</strong>
                  <span>{space.cost ? `$${space.cost} · rent $${space.rent}` : humanize(space.type)}</span>
                  {owner !== undefined && <small>Owned by {owner === side ? 'you' : opp}</small>}
                  {here.length > 0 && <span aria-label={here.map((token) => token.name).join(' and ')}>{here.map((token) => <span key={token.name} style={{ color: token.color, margin: '0 2px', fontSize: 14 }}>●</span>)}</span>}
                </div>
              );
            })}
            <div style={{ gridRow: '2 / span 5', gridColumn: '2 / span 5', display: 'grid', placeContent: 'center', gap: 10, padding: 14, borderRadius: 10, background: '#E8F0E7', color: colors.ink, textAlign: 'center' }}>
              <strong style={{ fontSize: 18 }}>Property Game</strong>
              <span style={{ color: colors.muted }}>Travel, buy properties and collect rent.</span>
              {pending ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
                  <button style={button} disabled={locked} onClick={() => act({ action: 'buy' })}>Buy property</button>
                  <button style={{ ...button, background: '#64748B' }} disabled={locked} onClick={() => act({ action: 'pass' })}>Pass</button>
                </div>
              ) : (
                <button style={button} disabled={locked} onClick={() => act({ action: 'roll' })}>Roll dice</button>
              )}
              <small style={{ color: colors.muted }}>You are on space {player.position + 1}; {opp} is on space {opponent.position + 1}.</small>
            </div>
          </div>
        </div>
        <div style={{ color: colors.muted, fontSize: 12, textAlign: 'center' }}>Land on unowned property to buy it. When another player lands on your property, they pay rent.</div>
      </div>
    );
  }

  if (match.game_id === 'ludo') {
    const rollPending = state.dice !== null;
    const tokenCells = new Map();
    state.tokens.forEach((tokens, playerSide) => tokens.forEach((position, token) => {
      let coordinates;
      if (position < 0) coordinates = ludoHomeSlots[playerSide][token];
      else if (position < 51) coordinates = ludoTrack[(ludoStarts[playerSide] + position) % ludoTrack.length];
      else if (position < 57) coordinates = ludoHomeLanes[playerSide][position - 51];
      else coordinates = [7, 7];
      const key = coordinates.join(',');
      tokenCells.set(key, [...(tokenCells.get(key) || []), { playerSide, token }]);
    }));
    const trackSquares = new Map(ludoTrack.map((coordinates, index) => [coordinates.join(','), index]));
    const safeSquares = new Set([0, 8, 13, 21, 26, 34, 39, 47]);
    const homeArea = (row, col) => {
      if (row >= 1 && row <= 5 && col >= 1 && col <= 5) return 0;
      if (row >= 1 && row <= 5 && col >= 9 && col <= 13) return 1;
      if (row >= 9 && row <= 13 && col >= 1 && col <= 5) return 2;
      if (row >= 9 && row <= 13 && col >= 9 && col <= 13) return 3;
      return null;
    };
    const homeNames = ludoColors.map((_, playerSide) => playerSide === side ? 'You' : playerSide === opponentSide ? opp : '');
    const yourTokens = state.tokens[side];
    const yourColor = ludoColors[side];
    const opponentColor = ludoColors[opponentSide];
    const canMove = (position) => rollPending && position < 57 && (position >= 0 || state.dice === 6) && position + state.dice <= 57;
    return (
      <div style={{ display: 'grid', gap: 14, justifyItems: 'center' }}>
        <div style={{ width: '100%', padding: 14, borderRadius: 12, background: 'var(--surface-2)', color: colors.ink, fontWeight: 700, textAlign: 'center' }}>
          {rollPending ? `You rolled a ${state.dice}. Select a highlighted token.` : 'Roll the die to move your tokens.'}
        </div>
        <div aria-label="Ludo board with home bases, track, and finishing lanes" style={{ width: '100%', overflowX: 'auto', paddingBottom: 4 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(15, 24px)', gridTemplateRows: 'repeat(15, 24px)', width: 'max-content', margin: '0 auto', padding: 4, border: '3px solid #365C47', borderRadius: 12, background: '#F7F5E9' }}>
            {Array.from({ length: 225 }, (_, index) => {
              const row = Math.floor(index / 15);
              const col = index % 15;
              const key = `${row},${col}`;
              const home = homeArea(row, col);
              const trackIndex = trackSquares.get(key);
              const laneSide = ludoHomeLanes.findIndex((lane) => lane.some(([laneRow, laneCol]) => laneRow === row && laneCol === col));
              const tokens = tokenCells.get(key) || [];
              const safe = trackIndex !== undefined && safeSquares.has(trackIndex);
              let background = home === null ? '#F7F5E9' : `${ludoColors[home]}22`;
              if (trackIndex !== undefined) background = safe ? '#F5D981' : '#FFFFFF';
              if (laneSide >= 0) background = `${ludoColors[laneSide]}55`;
              if (row >= 6 && row <= 8 && col >= 6 && col <= 8) background = '#DDE8D6';
              return (
                <div key={key} aria-label={trackIndex !== undefined ? `Track square ${trackIndex + 1}${safe ? ', safe' : ''}` : undefined}
                  style={{ display: 'grid', placeItems: 'center', width: 24, height: 24, background, border: trackIndex !== undefined || laneSide >= 0 ? '1px solid #CBD4C9' : '1px solid transparent', fontSize: 8, position: 'relative' }}>
                  {home !== null && row === (home < 2 ? 3 : 11) && col === (home % 2 ? 11 : 3) && <span style={{ color: ludoColors[home], fontSize: 7, fontWeight: 800 }}>{homeNames[home]}</span>}
                  {row === 7 && col === 7 && <span style={{ fontSize: 13 }}>🏠</span>}
                  {safe && tokens.length === 0 && <span style={{ color: '#A37B1B', fontSize: 10 }}>★</span>}
                  {tokens.map(({ playerSide, token }) => <span key={`${playerSide}-${token}`} title={`${playerSide === side ? 'Your' : opp + "'s"} token ${token + 1}`}
                    style={{ display: 'grid', placeItems: 'center', width: 17, height: 17, borderRadius: '50%', margin: -2, background: ludoColors[playerSide], color: '#fff', border: '1px solid white', fontSize: 8, fontWeight: 800, zIndex: 1 }}>{token + 1}</span>)}
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 8, width: '100%' }}>
          {yourTokens.map((position, token) => {
            const movable = canMove(position);
            const location = position < 0 ? 'Home' : position === 57 ? 'Finished' : position < 51 ? `Track ${position + 1}` : `Home lane ${position - 50}`;
            return (
              <button key={token} type="button" style={{ ...button, textAlign: 'left', background: movable ? yourColor : '#64748B', opacity: movable || !rollPending ? 1 : 0.6 }}
                disabled={locked || !movable} onClick={() => act({ action: 'move', token })}>
                Token {token + 1} · {location}{movable ? ' — move' : ''}
              </button>
            );
          })}
        </div>
        {!rollPending && <button style={button} disabled={locked} onClick={() => act({ action: 'roll' })}>Roll die</button>}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', color: colors.muted, fontSize: 12 }}>
          <span><strong style={{ color: yourColor }}>●</strong> You</span><span><strong style={{ color: opponentColor }}>●</strong> {opp}</span><span>★ Safe square</span><span>Roll a six to leave home.</span>
        </div>
      </div>
    );
  }

  const playablePits = new Set(legalAyoPits(state, side));
  const ownPits = Array.from({ length: 6 }, (_, index) => side * 6 + index);
  const opponentPits = Array.from({ length: 6 }, (_, index) => opponentSide * 6 + 5 - index);
  const pitButton = (pit, owner) => {
    const count = state.pits[pit];
    const legal = playablePits.has(pit);
    return (
      <button key={pit} type="button" aria-label={`${owner === side ? 'Your' : opp + "'s"} pit ${pit % 6 + 1}, ${count} seeds${legal ? ', legal move' : ''}`}
        style={{ display: 'grid', justifyItems: 'center', alignContent: 'center', gap: 3, minWidth: 48, minHeight: 54, padding: 5, borderRadius: '50%', border: legal ? '3px solid #26724C' : '2px solid #9A6B3F', background: legal ? '#D8F1DF' : '#F6E2BF', color: colors.ink, fontWeight: 800, cursor: locked || owner !== side || !legal ? 'default' : 'pointer', opacity: owner !== side || !count ? 0.75 : 1 }}
        disabled={locked || owner !== side || !legal} onClick={() => act({ pit })}>
        <span style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 5px)', gap: 2 }} aria-hidden="true">
          {Array.from({ length: Math.min(count, 12) }, (_, seed) => <i key={seed} style={{ width: 5, height: 5, borderRadius: '50%', background: '#8B5A2B' }} />)}
        </span>
        <span>{count}</span>
      </button>
    );
  };
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'space-around', padding: 12, borderRadius: 12, background: 'var(--surface-2)', fontWeight: 700 }}>
        <span>You · store: {state.scores[side]} seeds</span><span>{opp} · store: {state.scores[opponentSide]} seeds</span>
      </div>
      <div aria-label="Ayo sowing board" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(48px, 1fr))', gap: 8, padding: 14, borderRadius: 30, background: '#E9C99A', border: '3px solid #9A6B3F' }}>
        {opponentPits.map((pit) => <div key={`opponent-${pit}`} style={{ display: 'grid', justifyItems: 'center', gap: 5 }}>
          <span style={{ color: colors.muted, fontSize: 10 }}>{opp}</span>{pitButton(pit, opponentSide)}
        </div>)}
        {ownPits.map((pit) => <div key={`you-${pit}`} style={{ display: 'grid', justifyItems: 'center', gap: 5 }}>
          {pitButton(pit, side)}<span style={{ color: colors.muted, fontSize: 10 }}>You</span>
        </div>)}
      </div>
      <div style={{ fontSize: 13, color: colors.muted, textAlign: 'center' }}>Choose a non-empty pit on your side to sow its seeds around the board. Green outlines show legal moves.</div>
    </div>
  );
}
