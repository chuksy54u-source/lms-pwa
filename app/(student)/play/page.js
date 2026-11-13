'use client';

import { useState } from 'react';
import { Link } from '../../../lib/app/nav.js';
import { useRouter } from '../../../lib/app/nav.js';
import { StudentTop } from '../../../components/app/StudentShell';
import { Card, Button, Badge, Chips, SectionHead, ListSkeleton, ErrorState, Sheet, SearchInput, Avatar, Checkbox, Icon } from '../../../components/ui';
import { useTenant } from '../../../components/app/TenantProvider';
import { useSession } from '../../../components/app/SessionProvider';
import { useToast } from '../../../components/app/ToastProvider';
import useApi, { clearApiCache } from '../../../lib/app/useApi';
import { apiPost, apiPatch, apiList, apiListItems } from '../../../lib/api/client';
import { friendlyError, relTime, GAME_ART } from '../../../lib/app/format';
import { useTitle } from '../../../lib/app/hooks';
import GameArt from '../../../components/play/GameArt';
import GroupForm from '../../../components/play/GroupForm';
import { endWords } from '../../../components/play/logic.js';


// PLAYGROUND: play a game against the school's bear (it coaches you) or challenge a classmate from your school.
export default function Playground() {
  useTitle('Playground');
  const router = useRouter();
  const toast = useToast();
  const { tutor } = useTenant();
  const session = useSession();
  const bearName = (tutor && tutor.name) || 'Study tutor';
  const games = useApi('/api/v1/playground/games');
  const matches = useApi('play-matches', { fetcher: () => apiList('/api/v1/playground/matches?limit=50').then(apiListItems) });
  const invites = useApi('play-invites', { fetcher: () => apiList('/api/v1/playground/invitations?status=pending').then(apiListItems) });
  const board = useApi('/api/v1/playground/leaderboard?game_id=all');
  const [game, setGame] = useState('chess');
  const [difficulty, setDifficulty] = useState('beginner');
  const [training, setTraining] = useState(true);
  const [busy, setBusy] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [grouping, setGrouping] = useState(false);
  const [ending, setEnding] = useState(null); // one game being ended, or 'all'
  const [endBusy, setEndBusy] = useState(false);

  async function start() {
    setBusy(true);
    try {
      const m = await apiPost('/api/v1/playground/matches', { game_id: game, difficulty, training });
      clearApiCache('play-');
      router.push(`/play/${m.id}`);
    } catch (err) {
      toast(friendlyError(err), 'error');
      setBusy(false);
    }
  }

  async function answer(inv, action) {
    try {
      const out = await apiPatch(`/api/v1/playground/invitations/${encodeURIComponent(inv.id)}`, { action });
      clearApiCache('play-');
      invites.reload();
      if (out && out.match) router.push(`/play/${out.match.id}`);
      else toast(action === 'accept' ? 'Accepted' : action === 'decline' ? 'Declined' : 'Cancelled', 'success');
    } catch (err) {
      toast(friendlyError(err), 'error');
    }
  }

  async function endOne(m) {
    setEndBusy(true);
    try {
      await apiPost(`/api/v1/playground/matches/${encodeURIComponent(m.id)}/end`, {});
      clearApiCache('play-');
      matches.reload();
      toast('Game ended', 'success');
      setEnding(null);
    } catch (err) {
      toast(friendlyError(err), 'error');
    } finally {
      setEndBusy(false);
    }
  }

  async function endMany(olderThanDays) {
    setEndBusy(true);
    try {
      const out = await apiPost('/api/v1/playground/matches/end-all', olderThanDays ? { older_than_days: olderThanDays } : {});
      clearApiCache('play-');
      matches.reload();
      toast(out.ended === 1 ? '1 game ended' : `${out.ended} games ended`, 'success');
      if (out.skipped) toast(`${out.skipped} could not be ended. Try them one at a time.`, 'error');
      setEnding(null);
    } catch (err) {
      toast(friendlyError(err), 'error');
    } finally {
      setEndBusy(false);
    }
  }

  const list = games.data || [];
  const groupGame = list.find((g) => g.id === game && g.max_players > 2) || null;
  const open = (matches.data || []).filter((m) => m.status === 'active' || m.status === 'waiting');
  const weekAgo = Date.now() - 7 * 86_400_000;
  const oldOpen = open.filter((m) => new Date(m.updated_at || m.created_at).getTime() <= weekAgo);
  const active = open;
  const done = (matches.data || []).filter((m) => m.status === 'completed' || m.status === 'cancelled').slice(0, 5);
  const me = invites.data || [];
  const myId = session.me && session.me.id;

  return (
    <>
      <StudentTop />
      <main className="app-main stack-lg" id="main">
        <div className="stack-sm">
          <h1>Playground</h1>
          <p className="muted">Take a break with a game. Play {bearName}, who teaches you as you go, or challenge a classmate.</p>
        </div>

        {matches.error && !matches.data && <ErrorState error={matches.error} onRetry={matches.reload} title="Could not load your games" />}
        {invites.error && !invites.data && <ErrorState error={invites.error} onRetry={invites.reload} title="Could not load invitations" />}
        {board.error && !board.data && <ErrorState error={board.error} onRetry={board.reload} title="Could not load the leaderboard" />}

        {me.length > 0 && (
          <section className="stack">
            <SectionHead title="Invitations" />
            {me.map((inv) => {
              const fromMe = inv.sender_id === myId;
              return (
                <Card key={inv.id} className="row wrap">
                  <span className="course-emoji" aria-hidden>
                    {GAME_ART[inv.game_id] || '🎮'}
                  </span>
                  <div className="grow">
                    <p className="card-title">{fromMe ? `You invited ${inv.recipient ? inv.recipient.name : 'a classmate'}` : `${inv.sender ? inv.sender.name : 'A classmate'} wants to play`}{inv.group_match_id ? ' (a game with more players)' : ''}</p>
                    <p className="card-sub">
                      {list.find((g) => g.id === inv.game_id)?.name || inv.game_id} · {relTime(inv.created_at)}
                      {fromMe ? ' · waiting for them to accept' : ''}
                    </p>
                  </div>
                  <div className="row" style={{ gap: 6 }}>
                    {fromMe ? (
                      <Button size="sm" variant="ghost" onClick={() => answer(inv, 'cancel')}>
                        Cancel
                      </Button>
                    ) : (
                      <>
                        <Button size="sm" onClick={() => answer(inv, 'accept')}>
                          Accept
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => answer(inv, 'decline')}>
                          Decline
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              );
            })}
          </section>
        )}

        {active.length > 0 && (
          <section className="stack">
            <SectionHead
              title="Your games"
              action={active.length > 1 ? <Button size="sm" variant="ghost" onClick={() => setEnding('all')}>End old games</Button> : null}
            />
            <div className="list">
              {active.map((m) => (
                <div key={m.id} className="list-item">
                  <Link href={`/play/${m.id}`} className="row grow" style={{ gap: 12, minWidth: 0, textDecoration: 'none', color: 'inherit' }}>
                    <span className="list-icon accent" aria-hidden>
                      {GAME_ART[m.game_id] || '🎮'}
                    </span>
                    <div className="grow">
                      <p className="strong">{m.game || m.game_id}</p>
                      <p className="small muted">
                        {m.mode === 'group' ? 'with classmates and computers' : `vs ${m.mode === 'bear' ? bearName : (m.opponent && m.opponent.name) || 'classmate'}`} · {relTime(m.updated_at || m.created_at)}
                      </p>
                    </div>
                    <Badge tone={m.status === 'waiting' ? 'neutral' : 'brand'}>{m.status === 'waiting' ? 'Waiting room' : 'Continue'}</Badge>
                  </Link>
                  <Button size="sm" variant="ghost" onClick={() => setEnding(m)} aria-label={`End ${m.game || 'this game'}`}>
                    End
                  </Button>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="stack">
          <SectionHead title="New game" />
          {games.loading && !games.data ? (
            <ListSkeleton count={1} lines={3} />
          ) : games.error && !games.data ? (
            <ErrorState error={games.error} onRetry={games.reload} title={games.error.status === 402 ? 'The Playground needs your school’s subscription' : 'Could not load the games'} />
          ) : (
            <Card className="card-pad-lg stack">
              <div className="grid-games" role="radiogroup" aria-label="Choose a game">
                {list.map((g) => (
                  <button key={g.id} type="button" role="radio" aria-checked={game === g.id} className="game-pick" onClick={() => setGame(g.id)}>
                    <GameArt id={g.id} />
                    <span className="strong">{g.name}</span>
                    <span className="tiny muted">{g.description}</span>
                  </button>
                ))}
              </div>
              <Chips
                label="How should the bear play?"
                value={difficulty}
                onChange={setDifficulty}
                options={[
                  { value: 'beginner', label: '🌱 Beginner' },
                  { value: 'standard', label: '🔥 Standard' },
                ]}
              />
              <Checkbox checked={training} onChange={(e) => setTraining(e.target.checked)}>
                Training mode: {bearName} suggests a good move and explains your moves
              </Checkbox>
              <div className="row wrap">
                <Button loading={busy} onClick={start} icon="bear">
                  Play {bearName}
                </Button>
                <Button variant="outline" icon="users" onClick={() => setInviting(true)}>
                  Challenge a classmate
                </Button>
                {groupGame && (
                  <Button variant="outline" icon="users" onClick={() => setGrouping(true)}>
                    3 or 4 players
                  </Button>
                )}
              </div>
              {groupGame && <p className="tiny muted">{groupGame.name} can have up to {groupGame.max_players} players: add computers, classmates, or both.</p>}
            </Card>
          )}
        </section>

        <section className="grid-2" style={{ alignItems: 'start' }}>
          <div className="stack">
            <SectionHead title="School leaderboard" />
            {(board.data || []).length === 0 ? (
              <p className="small muted">Play a few games and the top players show here.</p>
            ) : (
              <div className="list">
                {board.data.slice(0, 8).map((r) => (
                  <div key={`${r.student_id}-${r.game_id}`} className="list-item">
                    <span className="lesson-num" style={r.rank <= 3 ? { background: 'var(--accent-soft)', color: 'var(--accent-ink)' } : undefined}>
                      {r.rank}
                    </span>
                    <span className="grow">
                      <span className="strong">{r.name}</span> <span className="small muted">· {list.find((g) => g.id === r.game_id)?.name || r.game_id}</span>
                    </span>
                    <span className="small">
                      <b>{r.wins}</b> wins · {r.win_rate}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="stack">
            <SectionHead title="Recent games" />
            {done.length === 0 ? (
              <p className="small muted">Finished games show here.</p>
            ) : (
              <div className="list">
                {done.map((m) => (
                  <Link key={m.id} href={`/play/${m.id}`} className="list-item">
                    <span aria-hidden>{GAME_ART[m.game_id] || '🎮'}</span>
                    <span className="grow small">
                      <b>{m.game || m.game_id}</b> · {m.result || 'finished'}
                    </span>
                    <span className="tiny muted">{relTime(m.updated_at || m.created_at)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Sheet open={grouping} onClose={() => setGrouping(false)} title={`${groupGame ? groupGame.name : 'Game'} for 3 or 4 players`}>
        {grouping && groupGame && (
          <GroupForm
            game={game}
            gameName={groupGame.name}
            difficulty={difficulty}
            training={training}
            onError={(message) => toast(message, 'error')}
            onMade={(m) => {
              setGrouping(false);
              clearApiCache('play-');
              router.push(`/play/${m.id}`);
            }}
          />
        )}
      </Sheet>
      <Sheet open={ending !== null} onClose={() => !endBusy && setEnding(null)} title={ending === 'all' ? 'End old games?' : ending ? endWords(ending, myId).title : ''}>
        {ending === 'all' && (
          <div className="stack">
            <p className="small muted">
              You have {open.length} open game{open.length === 1 ? '' : 's'}. Ending a game against the bear does not count towards your record.
              Ending one against a classmate counts as a loss for you and they win. In a game with several players a computer takes your seat.
            </p>
            <div className="row wrap">
              {oldOpen.length > 0 && <Button loading={endBusy} onClick={() => endMany(7)}>End the {oldOpen.length} older than a week</Button>}
              <Button loading={endBusy} variant="outline" onClick={() => endMany(0)}>End all {open.length}</Button>
              <Button variant="ghost" disabled={endBusy} onClick={() => setEnding(null)}>Keep them</Button>
            </div>
          </div>
        )}
        {ending && ending !== 'all' && (
          <div className="stack">
            <p className="small muted">{endWords(ending, myId).body}</p>
            <div className="row wrap">
              <Button loading={endBusy} onClick={() => endOne(ending)}>{endWords(ending, myId).go}</Button>
              <Button variant="ghost" disabled={endBusy} onClick={() => setEnding(null)}>Keep playing</Button>
            </div>
          </div>
        )}
      </Sheet>
      <Sheet open={inviting} onClose={() => setInviting(false)} title="Challenge a classmate">
        {inviting && (
          <InviteForm
            game={game}
            gameName={list.find((g) => g.id === game)?.name || game}
            onSent={() => {
              setInviting(false);
              clearApiCache('play-');
              invites.reload();
            }}
          />
        )}
      </Sheet>
    </>
  );
}

function InviteForm({ game, gameName, onSent }) {
  const toast = useToast();
  const [q, setQ] = useState('');
  const players = useApi(`play-players-${q}`, { fetcher: () => apiList(`/api/v1/playground/players?limit=20${q.trim() ? `&search=${encodeURIComponent(q.trim())}` : ''}`).then(apiListItems) });
  const [sending, setSending] = useState(null);
  async function send(p) {
    setSending(p.id);
    try {
      await apiPost('/api/v1/playground/invitations', { game_id: game, recipient_id: p.id });
      toast(`Invitation sent to ${p.name}`, 'success');
      onSent();
    } catch (err) {
      toast(friendlyError(err), 'error');
      setSending(null);
    }
  }
  return (
    <div className="stack">
      <p className="small muted">They get an invitation to play {gameName}. When they accept, the game starts for both of you.</p>
      <SearchInput placeholder="Search classmates" value={q} onChange={(e) => setQ(e.target.value)} label="Search classmates" />
      {players.loading && !players.data ? (
        <ListSkeleton count={2} lines={1} />
      ) : players.error && !players.data ? (
        <ErrorState error={players.error} onRetry={players.reload} title="Could not find classmates" />
      ) : (players.data || []).length === 0 ? (
        <p className="small muted center">No classmates found.</p>
      ) : (
        <div className="list">
          {players.data.map((p) => (
            <div key={p.id} className="list-item">
              <Avatar name={p.name} />
              <span className="grow strong">{p.name}</span>
              <Button size="sm" loading={sending === p.id} onClick={() => send(p)}>
                Invite
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
