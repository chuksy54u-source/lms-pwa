'use client';

// Pick a classmate to play with. Used by the lobby (to fill a seat before a group game is made) and by the waiting room (to invite
// someone into a seat). It only lists students of the same school; the server decides who may be invited.

import { useState } from 'react';
import { Sheet, SearchInput, Avatar, Button, ListSkeleton, ErrorState } from '../ui';
import useApi from '../../lib/app/useApi';
import { apiList, apiListItems } from '../../lib/api/client';

export default function PlayerPicker({ open, onClose, title = 'Choose a classmate', intro, exclude = [], onPick, busyId = null }) {
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      {open && <PlayerList intro={intro} exclude={exclude} onPick={onPick} busyId={busyId} />}
    </Sheet>
  );
}

export function PlayerList({ intro, exclude = [], onPick, busyId = null, action = 'Invite' }) {
  const [q, setQ] = useState('');
  const players = useApi(`play-players-${q}`, {
    fetcher: () => apiList(`/api/v1/playground/players?limit=20${q.trim() ? `&search=${encodeURIComponent(q.trim())}` : ''}`).then(apiListItems),
  });
  const rows = (players.data || []).filter((player) => !exclude.includes(player.id));
  return (
    <div className="stack">
      {intro && <p className="small muted">{intro}</p>}
      <SearchInput placeholder="Search classmates" value={q} onChange={(event) => setQ(event.target.value)} label="Search classmates" />
      {players.loading && !players.data ? (
        <ListSkeleton count={2} lines={1} />
      ) : players.error && !players.data ? (
        <ErrorState error={players.error} onRetry={players.reload} title="Could not find classmates" />
      ) : rows.length === 0 ? (
        <p className="small muted center">No classmates found.</p>
      ) : (
        <div className="list">
          {rows.map((player) => (
            <div key={player.id} className="list-item">
              <Avatar name={player.name} />
              <span className="grow strong">{player.name}</span>
              <Button size="sm" loading={busyId === player.id} onClick={() => onPick(player)}>{action}</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
