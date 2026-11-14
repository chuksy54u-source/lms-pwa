'use client';

// Make a game for three or four players. The student picks how many play, then fills each other seat with a computer, a classmate
// (an invitation) or leaves it open for someone to join. Games where every seat is a computer start straight away; otherwise the
// game opens in a waiting room where the student presses Start when ready (seats nobody took become computers).

import { useState } from 'react';
import { Button, Chips } from '../ui';
import { PlayerList } from './PlayerPicker';
import { apiPost } from '../../lib/api/client';
import { friendlyError } from '../../lib/app/format';

const KINDS = [
  { value: 'cpu', label: 'Computer', icon: 'robot' },
  { value: 'invite', label: 'Classmate', icon: 'user' },
  { value: 'open', label: 'Leave open', icon: 'hourglass' },
];
const COUNTS = [
  { value: '1', label: '2 players' },
  { value: '2', label: '3 players' },
  { value: '3', label: '4 players' },
];

export const defaultSeats = (count) => Array.from({ length: count }, () => ({ kind: 'cpu', user: null }));

// The plan sent to the server: one entry per other seat.
export function seatPlan(seats) {
  return seats.map((seat) => (seat.kind === 'invite' ? { kind: 'invite', user_id: seat.user.id } : { kind: seat.kind }));
}

export default function GroupForm({ game, gameName, difficulty, training, onMade, onError }) {
  const [others, setOthers] = useState(2);
  const [seats, setSeats] = useState(defaultSeats(2));
  const [picking, setPicking] = useState(null);
  const [busy, setBusy] = useState(false);

  const resize = (value) => {
    const count = Number(value);
    setOthers(count);
    setSeats((current) => Array.from({ length: count }, (_, index) => current[index] || { kind: 'cpu', user: null }));
  };
  const setKind = (index, kind) => {
    if (kind === 'invite') { setPicking(index); return; }
    setSeats((current) => current.map((seat, i) => (i === index ? { kind, user: null } : seat)));
  };
  const choose = (player) => {
    setSeats((current) => current.map((seat, i) => (i === picking ? { kind: 'invite', user: player } : seat)));
    setPicking(null);
  };
  const missing = seats.some((seat) => seat.kind === 'invite' && !seat.user);
  const allComputers = seats.every((seat) => seat.kind === 'cpu');

  async function make() {
    setBusy(true);
    try {
      const match = await apiPost('/api/v1/playground/groups', { game_id: game, difficulty, training, seats: seatPlan(seats) });
      onMade(match);
    } catch (error) {
      onError(friendlyError(error));
      setBusy(false);
    }
  }

  if (picking !== null) {
    const taken = seats.map((seat) => (seat.user ? seat.user.id : null)).filter(Boolean);
    return (
      <div className="stack">
        <Button size="sm" variant="ghost" icon="back" onClick={() => setPicking(null)}>Back to seats</Button>
        <PlayerList intro={`Choose who sits in seat ${picking + 2}. They get an invitation.`} exclude={taken} onPick={choose} action="Choose" />
      </div>
    );
  }

  return (
    <div className="stack">
      <p className="small muted">{gameName} can have two to four players. You are always seat one. Computers play on their own; classmates get an invitation.</p>
      <Chips label="How many players?" value={String(others)} onChange={resize} options={COUNTS} />
      <ol className="seat-list">
        {seats.map((seat, index) => (
          <li key={index} className="seat-row">
            <span className="strong">Seat {index + 2}</span>
            <Chips label={`Who sits in seat ${index + 2}?`} value={seat.kind} onChange={(kind) => setKind(index, kind)} options={KINDS} />
            {seat.kind === 'invite' && seat.user && (
              <span className="small muted">Invite {seat.user.name} <button type="button" className="link-btn" onClick={() => setPicking(index)}>Change</button></span>
            )}
          </li>
        ))}
      </ol>
      <Button loading={busy} disabled={missing} onClick={make} icon="users">
        {allComputers ? `Play ${gameName}` : 'Make the game'}
      </Button>
      <p className="tiny muted">
        {allComputers ? 'Everyone else is a computer, so the game starts right away.' : 'You will wait for classmates in a waiting room. You can start any time: seats nobody took are played by computers.'}
      </p>
    </div>
  );
}
