'use client';

// A small picture of each game for the Playground lobby, drawn from the same pieces as the real boards so the two feel like one product.
// Plain SVG and CSS only, so it needs no image files.

import '../../styles/play.css';
import Icon from '../ui/icons';
import { ChessPiece, CheckerPiece, Die, Seeds } from './pieces';

function Ludo() {
  return (
    <svg viewBox="0 0 120 90" className="pg-art-svg" aria-hidden focusable="false">
      <rect x="0" y="0" width="120" height="90" fill="#13294a" />
      <rect x="6" y="6" width="38" height="32" rx="6" fill="#e8a33d" />
      <rect x="76" y="6" width="38" height="32" rx="6" fill="#4f8dff" />
      <rect x="6" y="52" width="38" height="32" rx="6" fill="#3ec7a1" />
      <rect x="76" y="52" width="38" height="32" rx="6" fill="#ff6f7d" />
      <rect x="44" y="0" width="32" height="90" fill="#f1f5fb" />
      <rect x="0" y="29" width="120" height="32" fill="#f1f5fb" />
      <rect x="52" y="29" width="16" height="32" fill="#8dbcff" />
      <rect x="44" y="37" width="32" height="16" fill="#ffd9a0" />
      <circle cx="60" cy="45" r="7" fill="#f1f5fb" />
      <circle cx="25" cy="22" r="7" fill="#fff" stroke="#14233b" strokeWidth="2" />
      <circle cx="95" cy="22" r="7" fill="#fff" stroke="#14233b" strokeWidth="2" />
      <circle cx="25" cy="68" r="7" fill="#fff" stroke="#14233b" strokeWidth="2" />
      <circle cx="95" cy="68" r="7" fill="#fff" stroke="#14233b" strokeWidth="2" />
    </svg>
  );
}

export default function GameArt({ id }) {
  switch (id) {
    case 'chess':
      return (
        <span className="pg-art pg-art--chess" aria-hidden>
          <span className="pg-art-piece" style={{ left: '25%', top: '0%' }}><ChessPiece type="n" color="w" /></span>
          <span className="pg-art-piece" style={{ left: '50%', top: '33.3%' }}><ChessPiece type="q" color="b" /></span>
          <span className="pg-art-piece" style={{ left: '0%', top: '66.6%' }}><ChessPiece type="p" color="w" /></span>
          <span className="pg-art-piece" style={{ left: '75%', top: '66.6%' }}><ChessPiece type="r" color="b" /></span>
        </span>
      );
    case 'scrabble':
      return (
        <span className="pg-art pg-art--scrabble" aria-hidden>
          {[['C', 3], ['A', 1], ['T', 1]].map(([letter, points], i) => (
            <b key={letter} className="pg-art-tile" style={{ left: `${19 + i * 22}%`, top: '34%' }}>{letter}<sub>{points}</sub></b>
          ))}
          <i className="pg-art-dot is-dw" style={{ left: '10%', top: '8%' }}>DW</i>
          <i className="pg-art-dot is-tl" style={{ left: '74%', top: '8%' }}>TL</i>
          <i className="pg-art-dot is-tw" style={{ left: '74%', top: '70%' }}>TW</i>
          <i className="pg-art-dot is-dl" style={{ left: '10%', top: '70%' }}>DL</i>
        </span>
      );
    case 'checkers':
      return (
        <span className="pg-art pg-art--checkers" aria-hidden>
          <span className="pg-art-piece" style={{ left: '25%', top: '0%' }}><CheckerPiece side={1} /></span>
          <span className="pg-art-piece" style={{ left: '75%', top: '0%' }}><CheckerPiece side={1} /></span>
          <span className="pg-art-piece" style={{ left: '50%', top: '33.3%' }}><CheckerPiece side={0} king /></span>
          <span className="pg-art-piece" style={{ left: '0%', top: '66.6%' }}><CheckerPiece side={0} /></span>
          <span className="pg-art-piece" style={{ left: '50%', top: '66.6%' }}><CheckerPiece side={0} /></span>
        </span>
      );
    case 'property':
      return (
        <span className="pg-art pg-art--property" aria-hidden>
          {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'].map((key, i) => <i key={key} className={`pg-art-space tone-${'abcd'[i % 4]}`} />)}
          <span className="pg-art-centre"><Die value={5} /><Die value={2} /></span>
        </span>
      );
    case 'ludo':
      return <span className="pg-art pg-art--ludo" aria-hidden><Ludo /></span>;
    case 'ayo':
      return (
        <span className="pg-art pg-art--ayo" aria-hidden>
          {[4, 3, 5, 2, 4, 6].map((count, i) => (
            <span key={i} className="pg-art-pit"><Seeds count={count} max={8} /></span>
          ))}
        </span>
      );
    default:
      return <span className="pg-art pg-art--plain"><Icon name="gamepad" size={44} /></span>;
  }
}
