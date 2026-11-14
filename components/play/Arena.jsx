'use client';

// The frame around every Playground game: a full-screen arena that never scrolls, a slim top bar, a "you versus them" bar,
// the study tutor's coaching line, and the end-of-game card. The boards themselves live in ./GameBoard.

import { useEffect, useRef, useState } from 'react';
import BearArt from '../app/BearArt';
import Icon from '../ui/icons';
import { Link } from '../../lib/app/nav.js';
import { ChessPiece } from './pieces';
import { LUDO_COLORS, endWords, ludoColor, playerFacts, seatCountOf, seatName } from './logic.js';

// Locks the page behind the arena so nothing scrolls, and tucks the floating bear away (the bear's corner beside the board replaces it).
export function Arena({ game, children }) {
  useEffect(() => {
    document.documentElement.classList.add('pg-lock');
    return () => document.documentElement.classList.remove('pg-lock');
  }, []);
  return <div className={`pg-arena pg-arena--${game}`}>{children}</div>;
}

export function ArenaTop({ title, mark, status, tone = 'info', actions = null }) {
  return (
    <header className="pg-top">
      <Link href="/play" className="pg-back" aria-label="Back to the Playground">
        <Icon name="back" size={20} />
        <span>Playground</span>
      </Link>
      <h1 className="pg-title">{mark ? <span className="pg-title-mark" aria-hidden><Icon name={mark} size={20} /></span> : null}{title}</h1>
      <span className={`pg-chip is-${tone}`}>{status}</span>
      {actions}
    </header>
  );
}

function Facts({ lines }) {
  return lines.map((line, index) => {
    if (line.kind === 'pieces') {
      return (
        <span key={index} className="pg-taken" aria-label={`${line.list.length} pieces taken`}>
          {line.list.length === 0 ? <em>No pieces taken yet</em> : line.list.map((type, i) => <ChessPiece key={i} type={type} color={line.color} />)}
          {line.lead > 0 && <b>+{line.lead}</b>}
        </span>
      );
    }
    return <span key={index} className="pg-fact">{line.text}</span>;
  });
}

// The seat's colour tag: Ludo's colours and the property game's token colours, so you can tell who is who on the board.
function seatTag(match, side) {
  const count = seatCountOf(match);
  if (match.game_id === 'ludo') return LUDO_COLORS[ludoColor(count, side)].name;
  if (match.game_id === 'chess') return side === 0 ? 'White' : 'Black';
  return '';
}

// One card per player, you first. Works for two players or for three and four in a group game (classmates and computers).
export function PlayerStrip({ match, opp, meName, bear }) {
  const facts = playerFacts(match);
  const count = seatCountOf(match);
  const turn = match.status === 'active' && match.state ? match.state.side : null;
  const initial = (meName || 'You').trim().slice(0, 1).toUpperCase();
  return (
    <section className="pg-versus" aria-label="Players" data-seats={count}>
      {facts.map((entry, i) => {
        const mine = i === 0;
        const name = seatName(match, entry.side, opp);
        const seat = match.mode === 'group' ? (match.seats || [])[entry.side] : null;
        const computer = Boolean(seat && seat.kind === 'cpu');
        const active = turn === entry.side;
        const tag = seatTag(match, entry.side);
        return (
          <div key={entry.side} className={`pg-player ${mine ? 'is-you' : 'is-them'} pg-seat--${entry.side} ${active ? 'is-turn' : ''}`}>
            <span className="pg-avatar" aria-hidden>
              {!mine && bear ? <BearArt size="head" /> : computer ? <b><Icon name="robot" size={20} /></b> : <b>{mine ? initial : name.slice(0, 1).toUpperCase()}</b>}
            </span>
            <span className="pg-player-text">
              <strong>{name}{tag ? ` · ${tag}` : ''}</strong>
              <Facts lines={entry.lines} />
            </span>
            {active && <i className="pg-turn" aria-label={mine ? 'Your turn' : 'Their turn'} />}
          </div>
        );
      })}
    </section>
  );
}

// The End game button and its "are you sure" box. The box is a real dialog: it traps focus, closes on Escape, and is never
// an accident away on a phone.
export function EndGame({ match, myId, busy, onEnd }) {
  const [open, setOpen] = useState(false);
  const cancel = useRef(null);
  const words = endWords(match, myId);
  useEffect(() => {
    if (!open) return undefined;
    if (cancel.current) cancel.current.focus();
    const onKey = (event) => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
  return (
    <>
      <button type="button" className="pg-end" onClick={() => setOpen(true)} disabled={busy}>
        <Icon name="stop" size={16} /><span className="pg-end-label">End game</span>
      </button>
      {open && (
        <div className="pg-result" role="alertdialog" aria-modal="true" aria-label={words.title}>
          <div className="pg-result-card pg-confirm">
            <span className="pg-result-mark" aria-hidden><Icon name="flag" size={46} stroke={1.6} /></span>
            <h2>{words.title}</h2>
            <p>{words.body}</p>
            <div className="pg-result-actions">
              <button type="button" className="pg-btn" ref={cancel} onClick={() => setOpen(false)}>Keep playing</button>
              <button type="button" className="pg-btn pg-btn--danger" disabled={busy} onClick={() => { setOpen(false); onEnd(); }}>{words.go}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const SEAT_WORDS = {
  joined: { icon: 'checkCircle', text: 'Ready' },
  invited: { icon: 'mail', text: 'Invited, waiting' },
  cpu: { icon: 'robot', text: 'Computer' },
  computer: { icon: 'robot', text: 'Computer' },
  open: { icon: 'hourglass', text: 'Open seat' },
};

// The waiting room of a game for three or four players. Everyone sees who is in. Only the student who made the game can change
// seats and press Start; any seat nobody took becomes a computer when the game starts.
export function WaitingRoom({ match, me, busy, onStart, onSeat, onInvite }) {
  const host = Boolean(me && match.host_id === me.id);
  const seats = match.seats || [];
  const open = seats.filter((seat) => seat.status !== 'joined' && seat.status !== 'cpu' && seat.status !== 'computer').length;
  const computers = seats.filter((seat) => seat.kind === 'cpu').length;
  return (
    <section className="pg-room" aria-label="Waiting room">
      <h2 className="pg-room-title">{match.game} for {seats.length} players</h2>
      <p className="pg-room-sub">
        {host
          ? open > 0 ? `${open === 1 ? 'One seat is' : `${open} seats are`} not taken yet. You can start now: empty seats are played by computers.` : 'Everyone is here. Start when you are ready.'
          : 'Waiting for the host to start the game. Your seat is saved.'}
      </p>
      <ol className="pg-seats">
        {seats.map((seat) => {
          const words = SEAT_WORDS[seat.status] || SEAT_WORDS.open;
          const mine = seat.user && me && seat.user.id === me.id;
          const label = seat.seat === 0 ? `${(seat.user && seat.user.name) || 'Host'} (host)` : seat.user ? seat.user.name : seat.kind === 'cpu' ? `Computer ${seats.slice(0, seat.seat + 1).filter((s) => s.kind === 'cpu').length}` : words.text;
          return (
            <li key={seat.seat} className={`pg-seat is-${seat.status}`}>
              <span className="pg-seat-mark" aria-hidden><Icon name={words.icon} size={22} /></span>
              <span className="pg-seat-text"><strong>{mine ? 'You' : label}</strong><em>{words.text}</em></span>
              {host && seat.seat > 0 && seat.status !== 'joined' && (
                <span className="pg-seat-actions">
                  {seat.kind !== 'cpu' && <button type="button" className="pg-btn pg-btn--small" disabled={busy} onClick={() => onSeat(seat.seat, 'cpu')}>Computer</button>}
                  <button type="button" className="pg-btn pg-btn--small" disabled={busy} onClick={() => onInvite(seat.seat)}>Invite</button>
                  {seat.kind !== 'open' && seat.status !== 'open' && <button type="button" className="pg-btn pg-btn--small" disabled={busy} onClick={() => onSeat(seat.seat, 'open')}>Leave open</button>}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {host && (
        <div className="pg-room-actions">
          <button type="button" className="pg-btn pg-btn--primary" disabled={busy} onClick={onStart}>
            Start game{computers || open ? ` (${computers + open} computer${computers + open === 1 ? '' : 's'} will play)` : ''}
          </button>
        </div>
      )}
    </section>
  );
}

export function ResultCard({ won, draw, text, children }) {
  return (
    <div className="pg-result" role="dialog" aria-label="Game finished">
      <div className={`pg-result-card ${won ? 'is-won' : ''}`}>
        <span className="pg-result-mark" aria-hidden><Icon name={won ? 'trophy' : draw ? 'users' : 'target'} size={54} stroke={1.5} /></span>
        <h2>{won ? 'You won!' : draw ? 'A draw' : 'Good game'}</h2>
        <p>{text}</p>
        <div className="pg-result-actions">{children}</div>
      </div>
    </div>
  );
}
