'use client';

// The six Playground game boards. Each one is its own file (chess, checkers, Scrabble, property, Ludo, Ayo) and all of them
// share one click-and-drag engine (./useDrag) and one style sheet (styles/play.css). The server checks every move; the boards
// only show what is legal and make it comfortable to play on a phone or a computer.

import '../../styles/play.css';
import ChessBoard from './ChessBoard';
import CheckersBoard from './CheckersBoard';
import ScrabbleBoard from './ScrabbleBoard';
import PropertyBoard from './PropertyBoard';
import LudoBoard from './LudoBoard';
import AyoBoard from './AyoBoard';

export const GAMES = [
  { id: 'chess', name: 'Chess', mark: '♟' },
  { id: 'scrabble', name: 'Scrabble', mark: 'Aa' },
  { id: 'checkers', name: 'Checkers', mark: '◉' },
  { id: 'property', name: 'Property', mark: '⌂' },
  { id: 'ludo', name: 'Ludo', mark: '⚀' },
  { id: 'ayo', name: 'Ayo', mark: '●' },
];

const BOARDS = {
  chess: ChessBoard,
  checkers: CheckersBoard,
  scrabble: ScrabbleBoard,
  property: PropertyBoard,
  ludo: LudoBoard,
  ayo: AyoBoard,
};

// `previous` is the match as it was before the last move, so boards can animate what changed. `busy` is true while a move is
// being sent or while it is the other player's turn. `focus` is what the bear is pointing at (a move, squares, pits or tokens).
export function GameBoard({ match, busy, onMove, opp = 'Tutor', previous = null, focus = null }) {
  const Board = BOARDS[match.game_id];
  if (!Board) return <p className="pg-hint">This game is not available.</p>;
  return <Board match={match} busy={busy} onMove={onMove} opp={opp} previous={previous} focus={focus} />;
}

export default GameBoard;
