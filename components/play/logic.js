// Pure helpers for the Playground boards. There is no React in this file, so every rule here can be tested on its own.
// The server still checks every move; these helpers only decide what the board should show (legal moves, previews, positions).

import { Chess } from 'chess.js';
import { defaultTutorName } from '../../lib/app/brand.js';

/* ------------------------------------------------------------------ Scrabble */

export const SCRABBLE_POINTS = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8, K: 5, L: 1, M: 3,
  N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1, U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10, '?': 0,
};

const key = (row, col) => `${row},${col}`;
const TRIPLE_WORD = new Set(['0,0', '0,7', '0,14', '7,0', '7,14', '14,0', '14,7', '14,14']);
const DOUBLE_WORD = new Set(['1,1', '2,2', '3,3', '4,4', '7,7', '10,10', '11,11', '12,12', '13,13', '1,13', '2,12', '3,11', '4,10', '10,4', '11,3', '12,2', '13,1']);
const TRIPLE_LETTER = new Set(['1,5', '1,9', '5,1', '5,5', '5,9', '5,13', '9,1', '9,5', '9,9', '9,13', '13,5', '13,9']);
const DOUBLE_LETTER = new Set(['0,3', '0,11', '2,6', '2,8', '3,0', '3,7', '3,14', '6,2', '6,6', '6,8', '6,12', '7,3', '7,11', '8,2', '8,6', '8,8', '8,12', '11,0', '11,7', '11,14', '12,6', '12,8', '14,3', '14,11']);

// 'tw' triple word, 'dw' double word, 'tl' triple letter, 'dl' double letter, '' plain.
export function scrabblePremium(row, col) {
  const k = key(row, col);
  if (TRIPLE_WORD.has(k)) return 'tw';
  if (DOUBLE_WORD.has(k)) return 'dw';
  if (TRIPLE_LETTER.has(k)) return 'tl';
  if (DOUBLE_LETTER.has(k)) return 'dl';
  return '';
}

const inside = (row, col) => row >= 0 && row < 15 && col >= 0 && col < 15;

// Turns the tiles the player has dropped on the board into the one word the server wants:
// { word, start:{row,col}, direction } with every existing tile that continues the word included.
// `placed` is a list of { row, col, letter } (letter A-Z, for a blank it is the letter the player chose).
export function composeScrabble(board, placed) {
  if (!placed.length) return { ok: false, reason: '' };
  for (const tile of placed) {
    if (!inside(tile.row, tile.col) || board[tile.row][tile.col]) return { ok: false, reason: 'A tile is already on that square.' };
  }
  const rows = new Set(placed.map((t) => t.row));
  const cols = new Set(placed.map((t) => t.col));
  if (rows.size > 1 && cols.size > 1) return { ok: false, reason: 'Put all your tiles in one row or one column.' };
  const filled = (r, c) => inside(r, c) && Boolean(board[r][c]);
  let across;
  if (placed.length === 1) {
    const { row, col } = placed[0];
    if (filled(row, col - 1) || filled(row, col + 1)) across = true;
    else if (filled(row - 1, col) || filled(row + 1, col)) across = false;
    else return { ok: false, reason: board.flat().some(Boolean) ? 'Place it next to a tile that is already on the board.' : 'Add one more tile to make a word.' };
  } else {
    across = rows.size === 1;
  }
  const dr = across ? 0 : 1;
  const dc = across ? 1 : 0;
  const byCell = new Map(placed.map((t) => [key(t.row, t.col), t]));
  const lead = placed.reduce((best, t) => (across ? (t.col < best.col ? t : best) : (t.row < best.row ? t : best)), placed[0]);
  const last = placed.reduce((best, t) => (across ? (t.col > best.col ? t : best) : (t.row > best.row ? t : best)), placed[0]);
  let r = lead.row;
  let c = lead.col;
  // Walk back over tiles that are already on the board.
  while (filled(r - dr, c - dc)) { r -= dr; c -= dc; }
  const start = { row: r, col: c };
  const cells = [];
  let word = '';
  while (inside(r, c)) {
    const mine = byCell.get(key(r, c));
    if (mine) { word += mine.letter; cells.push({ row: r, col: c, letter: mine.letter, fresh: true }); }
    else if (filled(r, c)) { word += board[r][c].letter; cells.push({ row: r, col: c, letter: board[r][c].letter, fresh: false }); }
    else if ((across ? c : r) > (across ? last.col : last.row)) break;
    else return { ok: false, reason: 'Leave no gaps between your tiles.' };
    r += dr;
    c += dc;
  }
  if (word.length < 2) return { ok: false, reason: 'A word needs at least two letters.' };
  return { ok: true, word, start, direction: across ? 'across' : 'down', cells };
}

// What the move would score if the word is accepted, worked out the same way the server does.
// The server uses a real tile when the rack has the letter and a blank only when it does not.
export function scrabblePreview(board, rack, composed) {
  if (!composed || !composed.ok) return { points: 0, words: [] };
  const left = [...rack];
  const fresh = new Map();
  for (const cell of composed.cells) {
    if (!cell.fresh) continue;
    let index = left.indexOf(cell.letter);
    let blank = false;
    if (index < 0) { index = left.indexOf('?'); blank = true; }
    if (index >= 0) left.splice(index, 1);
    fresh.set(key(cell.row, cell.col), { letter: cell.letter, blank });
  }
  const at = (r, c) => fresh.get(key(r, c)) || board[r][c];
  const scoreLine = (cells) => {
    let sum = 0;
    let multiplier = 1;
    for (const [r, c] of cells) {
      const tile = at(r, c);
      const square = fresh.has(key(r, c)) ? scrabblePremium(r, c) : '';
      sum += SCRABBLE_POINTS[tile.letter] * (tile.blank ? 0 : square === 'dl' ? 2 : square === 'tl' ? 3 : 1);
      if (square === 'dw') multiplier *= 2;
      if (square === 'tw') multiplier *= 3;
    }
    return sum * multiplier;
  };
  const across = composed.direction === 'across';
  const mainCells = composed.cells.map((cell) => [cell.row, cell.col]);
  const words = [{ word: composed.word, points: scoreLine(mainCells) }];
  for (const cell of composed.cells) {
    if (!cell.fresh) continue;
    const dr = across ? 1 : 0;
    const dc = across ? 0 : 1;
    let r = cell.row;
    let c = cell.col;
    const exists = (rr, cc) => inside(rr, cc) && (fresh.has(key(rr, cc)) || Boolean(board[rr][cc]));
    while (exists(r - dr, c - dc)) { r -= dr; c -= dc; }
    const line = [];
    while (exists(r, c)) { line.push([r, c]); r += dr; c += dc; }
    if (line.length > 1) words.push({ word: line.map(([rr, cc]) => at(rr, cc).letter).join(''), points: scoreLine(line) });
  }
  let points = words.reduce((sum, w) => sum + w.points, 0);
  const used = composed.cells.filter((cell) => cell.fresh).length;
  if (used === 7 && rack.length === 7) points += 50;
  return { points, words };
}

// The rules the server checks that the board can warn about before the player presses Play.
export function scrabbleProblem(board, composed) {
  if (!composed) return '';
  if (!composed.ok) return composed.reason;
  const empty = !board.flat().some(Boolean);
  const fresh = composed.cells.filter((cell) => cell.fresh);
  if (empty) {
    return fresh.some((cell) => cell.row === 7 && cell.col === 7) ? '' : 'The first word must cover the star in the middle.';
  }
  const touches = composed.cells.some((cell) => !cell.fresh) || fresh.some((cell) =>
    [[cell.row - 1, cell.col], [cell.row + 1, cell.col], [cell.row, cell.col - 1], [cell.row, cell.col + 1]].some(([r, c]) => inside(r, c) && board[r][c]));
  return touches ? '' : 'A new word must touch a tile that is already on the board.';
}

/* ------------------------------------------------------------------- Checkers */

// Every legal checkers move for a side, as the server counts them: jumps are compulsory and a jump chain must be finished.
export function checkersMoves(state, side) {
  const captures = [];
  const steps = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = state.board[row][col];
      if (!piece || ((piece.toLowerCase() === 'r' ? 0 : 1) !== side)) continue;
      const king = piece === piece.toUpperCase();
      const directions = king ? [-1, 1] : [side === 0 ? -1 : 1];
      for (const dr of directions) {
        for (const dc of [-1, 1]) {
          const r1 = row + dr;
          const c1 = col + dc;
          const r2 = row + 2 * dr;
          const c2 = col + 2 * dc;
          if (r1 < 0 || r1 >= 8 || c1 < 0 || c1 >= 8) continue;
          if (!state.board[r1][c1]) steps.push({ from: { row, col }, to: { row: r1, col: c1 } });
          else if (state.board[r1][c1].toLowerCase() !== piece.toLowerCase() && r2 >= 0 && r2 < 8 && c2 >= 0 && c2 < 8 && !state.board[r2][c2]) {
            captures.push({ from: { row, col }, to: { row: r2, col: c2 }, jumped: { row: r1, col: c1 } });
          }
        }
      }
    }
  }
  if (state.capture_chain) {
    return captures.filter((m) => m.from.row === state.capture_chain[0] && m.from.col === state.capture_chain[1]);
  }
  return captures.length ? captures : steps;
}

/* ----------------------------------------------------------------------- Chess */

const START_COUNTS = { p: 8, n: 2, b: 2, r: 2, q: 1 };
const PIECE_VALUE = { p: 1, n: 3, b: 3, r: 5, q: 9 };

export function chessGrid(fen) {
  return fen.split(' ')[0].split('/').map((rank) => {
    const row = [];
    for (const ch of rank) {
      if (/\d/.test(ch)) for (let i = 0; i < Number(ch); i++) row.push(null);
      else row.push(ch);
    }
    return row;
  });
}

export const squareName = (row, col) => `${'abcdefgh'[col]}${8 - row}`;

export function chessTargets(fen, from) {
  try {
    return new Chess(fen).moves({ square: from, verbose: true });
  } catch {
    return [];
  }
}

export function chessStatus(fen) {
  const game = new Chess(fen);
  let king = null;
  if (game.inCheck()) {
    const grid = chessGrid(fen);
    const mine = game.turn() === 'w' ? 'K' : 'k';
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (grid[r][c] === mine) king = squareName(r, c);
  }
  return { turn: game.turn(), check: game.inCheck(), mate: game.isCheckmate(), draw: game.isDraw() || game.isStalemate(), king };
}

// Pieces each side has lost, plus a simple material lead (positive means white is ahead).
export function chessCaptured(fen) {
  const counts = {};
  for (const ch of fen.split(' ')[0]) if (/[a-z]/i.test(ch)) counts[ch] = (counts[ch] || 0) + 1;
  const lost = { w: [], b: [] };
  let lead = 0;
  for (const type of ['q', 'r', 'b', 'n', 'p']) {
    const white = Math.max(0, START_COUNTS[type] - (counts[type.toUpperCase()] || 0));
    const black = Math.max(0, START_COUNTS[type] - (counts[type] || 0));
    for (let i = 0; i < white; i++) lost.w.push(type);
    for (let i = 0; i < black; i++) lost.b.push(type);
    lead += (black - white) * PIECE_VALUE[type];
  }
  return { lost, lead };
}

/* ------------------------------------------------------------------------ Ayo */

// Pits 0-5 belong to side 0 and pits 6-11 to side 1. Seeds are sown one pit at a time, skipping the pit they came from.
export function ayoSow(pits, pit) {
  const next = [...pits];
  const seeds = next[pit];
  next[pit] = 0;
  const path = [];
  let at = pit;
  for (let i = 0; i < seeds; i++) {
    at = (at + 1) % 12;
    if (at === pit) at = (at + 1) % 12;
    next[at] += 1;
    path.push(at);
  }
  return { pits: next, path, last: at };
}

// The rule the server enforces: a move that would leave your opponent with no seeds is not allowed while another pit could feed them.
export function legalAyoPits(state, side) {
  const start = side * 6;
  const opponentStart = (1 - side) * 6;
  const available = Array.from({ length: 6 }, (_, index) => start + index).filter((pit) => state.pits[pit] > 0);
  const feeds = (pit) => ayoSow(state.pits, pit).pits.slice(opponentStart, opponentStart + 6).some((count) => count > 0);
  return available.filter((pit) => {
    const after = ayoPreview(state, side, pit);
    const left = ayoSow(state.pits, pit).pits;
    for (const taken of after.taken) left[taken] = 0;
    const opponentHasSeeds = left.slice(opponentStart, opponentStart + 6).some((count) => count > 0);
    if (opponentHasSeeds) return true;
    return !available.some((other) => other !== pit && feeds(other));
  });
}

// Where the last seed lands and how many seeds that move would win.
export function ayoPreview(state, side, pit) {
  const sown = ayoSow(state.pits, pit);
  const otherStart = (1 - side) * 6;
  let at = sown.last;
  const taken = [];
  const copy = [...sown.pits];
  while (at >= otherStart && at < otherStart + 6 && [2, 3].includes(copy[at])) {
    taken.push(at);
    at = (at + 11) % 12;
  }
  return { path: sown.path, last: sown.last, taken, captured: taken.reduce((sum, p) => sum + copy[p], 0) };
}

/* ----------------------------------------------------------------------- Ludo */

// The 52-square loop on a 15 by 15 grid, clockwise, as [row, col]. Square 0 is the first square of the red side.
export const LUDO_LOOP = [
  ...[1, 2, 3, 4, 5].map((c) => [6, c]),
  ...[5, 4, 3, 2, 1, 0].map((r) => [r, 6]),
  [0, 7], [0, 8],
  ...[1, 2, 3, 4, 5].map((r) => [r, 8]),
  ...[9, 10, 11, 12, 13, 14].map((c) => [6, c]),
  [7, 14], [8, 14],
  ...[13, 12, 11, 10, 9].map((c) => [8, c]),
  ...[9, 10, 11, 12, 13, 14].map((r) => [r, 8]),
  [14, 7], [14, 6],
  ...[13, 12, 11, 10, 9].map((r) => [r, 6]),
  ...[5, 4, 3, 2, 1, 0].map((c) => [8, c]),
  [7, 0], [6, 0],
];
// The server places side 0 on square 0 and side 1 on square 26 (halfway round). The other two starts are for show.
export const LUDO_START = [0, 26];
export const LUDO_SAFE = [0, 8, 13, 21, 26, 34, 39, 47];
export const LUDO_COLORS = [
  { name: 'Red', fill: '#e5484d', deep: '#b3262b', soft: '#fde8e8' },
  { name: 'Gold', fill: '#f2b53a', deep: '#b9810b', soft: '#fdf3d9' },
  { name: 'Green', fill: '#2fb37a', deep: '#17744d', soft: '#ddf5ea' },
  { name: 'Blue', fill: '#3b82f6', deep: '#1d4fb4', soft: '#e0ecff' },
];
// Where each of the four home bases sits on the board: [row, col] of its four token spots, as cell centres.
export const LUDO_BASES = [
  { corner: [0, 0], spots: [[1.75, 1.75], [1.75, 4.25], [4.25, 1.75], [4.25, 4.25]] },
  { corner: [9, 9], spots: [[10.75, 10.75], [10.75, 13.25], [13.25, 10.75], [13.25, 13.25]] },
  { corner: [0, 9], spots: [[1.75, 10.75], [1.75, 13.25], [4.25, 10.75], [4.25, 13.25]] },
  { corner: [9, 0], spots: [[10.75, 1.75], [10.75, 4.25], [13.25, 1.75], [13.25, 4.25]] },
];
// The six squares leading to the middle for the two playing sides.
export const LUDO_LANES = [
  [1, 2, 3, 4, 5, 6].map((c) => [7, c]),
  [13, 12, 11, 10, 9, 8].map((c) => [7, c]),
];
// The same lanes for all four colours (red, gold, green, blue), and where each seat sits when three or four play.
export const LUDO_LANES_BY_COLOR = [
  LUDO_LANES[0],
  LUDO_LANES[1],
  [1, 2, 3, 4, 5, 6].map((r) => [r, 7]),
  [13, 12, 11, 10, 9, 8].map((r) => [r, 7]),
];
// Two players sit opposite each other (red and gold); three or four take the corners in turn: red, green, gold, blue.
export const ludoColor = (count, side) => (count > 2 ? [0, 2, 1, 3][side] : [0, 1][side]);
export const ludoStartOf = (count, side) => (count > 2 ? [0, 13, 26, 39][side] : LUDO_START[side]);

// Where a token sits, as [row, col] centre. Position -1 is the base, 0-50 the loop, 51-56 the lane and 57 the middle.
export function ludoPoint(side, position, token = 0, count = 2) {
  const color = ludoColor(count, side);
  if (position < 0) {
    const [row, col] = LUDO_BASES[color].spots[token];
    return [row, col];
  }
  if (position <= 50) {
    const [row, col] = LUDO_LOOP[(ludoStartOf(count, side) + position) % 52];
    return [row + 0.5, col + 0.5];
  }
  if (position <= 56) {
    const [row, col] = LUDO_LANES_BY_COLOR[color][position - 51];
    return [row + 0.5, col + 0.5];
  }
  // Finished: park the token near the middle, one spot each.
  const spread = [[-0.55, -0.55], [-0.55, 0.55], [0.55, -0.55], [0.55, 0.55]][token];
  return [7.5 + spread[0] * 0.9, 7.5 + spread[1] * 0.9];
}

// Which of a side's tokens can move with the die, and where each would land.
export function ludoMovable(state, side) {
  if (state.dice === null || state.dice === undefined) return [];
  const die = state.dice;
  const out = [];
  state.tokens[side].forEach((position, token) => {
    if (position >= 57) return;
    if (position < 0 && die !== 6) return;
    if (position >= 0 && position + die > 57) return;
    out.push({ token, to: position < 0 ? 0 : position + die });
  });
  return out;
}

/* ------------------------------------------------------------------- Property */

// The ring is 7 by 7 with 24 spaces, clockwise from the bottom-right corner. Returns [row, col].
export const PROPERTY_RING = [
  [6, 6], [6, 5], [6, 4], [6, 3], [6, 2], [6, 1], [6, 0],
  [5, 0], [4, 0], [3, 0], [2, 0], [1, 0], [0, 0],
  [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6],
  [1, 6], [2, 6], [3, 6], [4, 6], [5, 6],
];

// Every property sits in a colour set by price so the ring reads at a glance.
export function propertyTone(space) {
  if (!space || space.type !== 'property') return '';
  if (space.cost <= 140) return 'tone-a';
  if (space.cost <= 200) return 'tone-b';
  if (space.cost <= 260) return 'tone-c';
  return 'tone-d';
}

/* --------------------------------------------------------------- Player strips */

// What the strip above and below each board shows for the two players. `you` is the viewer.
// How many seats a match has: two, or two to four in a game for several players.
export const seatCountOf = (match) => (match.mode === 'group' ? (match.seats || []).length || 2 : 2);

// What to call each seat: you, a classmate, a computer, or the bear.
export function seatName(match, side, opp = defaultTutorName(), me = 'You') {
  if (side === (match.your_side || 0)) return me;
  if (match.mode === 'group') {
    const seat = (match.seats || [])[side];
    if (!seat) return `Player ${side + 1}`;
    if (seat.user && seat.user.name) return seat.user.name;
    if (seat.kind === 'cpu') {
      const computers = (match.seats || []).slice(0, side + 1).filter((entry) => entry.kind === 'cpu').length;
      return `Computer ${computers}`;
    }
    return seat.status === 'invited' ? 'Invited classmate' : 'Open seat';
  }
  return opp;
}

// The little facts shown under each player's name. You come first, then the other seats in order.
export function playerFacts(match) {
  const state = match.state || {};
  const count = seatCountOf(match);
  const you = Math.min(Math.max(match.your_side || 0, 0), count - 1);
  const them = 1 - you;
  const order = [you, ...Array.from({ length: count }, (_, index) => index).filter((index) => index !== you)];
  const base = order.map((side) => ({ side, lines: [] }));
  const set = (side, lines) => { const found = base.find((b) => b.side === side); if (found) found.lines = lines; };
  switch (match.game_id) {
    case 'chess': {
      const { lost, lead } = chessCaptured(state.fen);
      // lost.w = white pieces taken (the black side holds those)
      const mineTaken = you === 0 ? lost.b : lost.w;
      const theirsTaken = you === 0 ? lost.w : lost.b;
      const youLead = you === 0 ? lead : -lead;
      set(you, [{ kind: 'pieces', color: you === 0 ? 'b' : 'w', list: mineTaken, lead: youLead > 0 ? youLead : 0 }]);
      set(them, [{ kind: 'pieces', color: you === 0 ? 'w' : 'b', list: theirsTaken, lead: youLead < 0 ? -youLead : 0 }]);
      break;
    }
    case 'checkers': {
      const left = [0, 0];
      for (const row of state.board) for (const piece of row) if (piece) left[piece.toLowerCase() === 'r' ? 0 : 1] += 1;
      set(you, [{ kind: 'text', text: `${left[you]} pieces left` }]);
      set(them, [{ kind: 'text', text: `${left[them]} pieces left` }]);
      break;
    }
    case 'scrabble': {
      for (let side = 0; side < count; side++) set(side, [{ kind: 'text', text: `${state.scores[side]} points` }]);
      break;
    }
    case 'property': {
      for (let side = 0; side < count; side++) {
        const player = state.players[side];
        set(side, [{ kind: 'text', text: player.out ? 'Out of the game' : `${player.cash} coins · ${player.properties.length} properties` }]);
      }
      break;
    }
    case 'ludo': {
      for (let side = 0; side < count; side++) set(side, [{ kind: 'text', text: `${state.tokens[side].filter((p) => p === 57).length} of 4 home` }]);
      break;
    }
    case 'ayo': {
      set(you, [{ kind: 'text', text: `${state.scores[you]} seeds won` }]);
      set(them, [{ kind: 'text', text: `${state.scores[them]} seeds won` }]);
      break;
    }
    default:
      break;
  }
  return base;
}

// The most recent move in the match history, so a board can mark what just changed.
export function lastMoveOf(match) {
  const list = match.history || [];
  return list.length ? list[list.length - 1] : null;
}

// What "End game" will do, in plain words, so nobody is surprised by a loss on their record. Works for a full match from the
// match page and for a row of the games list (both carry mode, status and player_one_id).
export function endWords(match, myId) {
  if (match.status === 'waiting') {
    return match.mode === 'group' && match.player_one_id === myId
      ? { title: 'Close this game?', body: 'Nobody has started yet. The invitations are withdrawn and the game closes.', go: 'Close game' }
      : { title: 'Leave this game?', body: 'You give your seat back before the game starts.', go: 'Leave game' };
  }
  if (match.mode === 'bear') return { title: 'End this game?', body: 'It will not count towards your record. You can start a new one any time.', go: 'End game' };
  if (match.mode === 'group') return { title: 'Leave this game?', body: 'A computer takes over your seat and the others keep playing. It counts as a loss for you if classmates are still playing.', go: 'Leave game' };
  return { title: 'Give up this game?', body: 'Ending a game against a classmate counts as a loss for you, and they win.', go: 'Give up' };
}

// What the bear says out loud for a set of notes: the headline and text of the main note, then the bear's own reply move if there is one.
// The lists, the idea box, the quiz and the rules stay on screen only, so the voice never reads out a wall of text.
export function speechOf(main, extras = []) {
  const line = (note) => {
    if (!note) return '';
    const head = String(note.headline || '').trim().replace(/[.:;,\s]+$/, '');
    const body = String(note.text || '').trim();
    if (head && body) return `${head}${/[!?]$/.test(head) ? '' : '.'} ${body}`;
    return head || body;
  };
  const spoken = [line(main)];
  const reply = (extras || []).find((note) => note && note.kind === 'reply');
  if (reply && spoken[0].length < 260) spoken.push(line(reply));
  return spoken.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}
