'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { ErrorState } from '../../../../components/ui';
import { Link, useRouter } from '../../../../lib/app/nav.js';
import { Arena, ArenaTop, PlayerStrip, ResultCard, EndGame, WaitingRoom } from '../../../../components/play/Arena';
import BearCorner from '../../../../components/play/BearCorner';
import PlayerPicker from '../../../../components/play/PlayerPicker';
import { GameBoard } from '../../../../components/play/GameBoard';
import { seatName, speechOf } from '../../../../components/play/logic.js';
import { useTenant } from '../../../../components/app/TenantProvider';
import { useSession } from '../../../../components/app/SessionProvider';
import { apiGet, apiPost } from '../../../../lib/api/client';
import { clearApiCache } from '../../../../lib/app/useApi';
import { friendlyError, GAME_ICON } from '../../../../lib/app/format';
import { useTitle } from '../../../../lib/app/hooks';

// A PLAYGROUND MATCH. This is the screen where the game is played, so it is one fixed, full-screen arena that never scrolls.
// The study tutor lives in a corner beside the board for the whole game: it reviews every move, answers questions, quizzes you,
// points at the board, and cheers. Against a classmate (or in a game with several classmates) it never picks your move for you.
// When it is somebody else's turn, or a group game is still filling up, the page checks for news every few seconds.

const NEUTRAL = { emotion: 'adorable', pose: 'idle', emote: '', celebrate: false };

// Short notes the page writes itself (everything that teaches comes from the server).
const plain = (headline, text, mood = NEUTRAL) => ({ kind: 'plain', headline, text, points: [], concept: null, move: null, focus: null, grade: null, mood });

export default function Match() {
  const { matchId } = useParams();
  const router = useRouter();
  const { tutor, bearSettings } = useTenant();
  const { me } = useSession();
  const bearName = (tutor && tutor.name) || 'Study tutor';
  const [match, setMatch] = useState(null);
  const [previous, setPrevious] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const [bubble, setBubble] = useState({ main: null, extras: [], seq: 0, mood: NEUTRAL, speech: '' });
  const [focus, setFocus] = useState(null);
  const [thinking, setThinking] = useState(false);
  const [closed, setClosed] = useState(false);
  const [seatToFill, setSeatToFill] = useState(null);
  const opened = useRef('');
  const latest = useRef(null);
  const sequence = useRef(0);
  useTitle(match ? match.game : 'Playground');

  // Keep the match as it was before the newest move, so boards can show what changed.
  const apply = useCallback((next) => {
    if (latest.current && latest.current.state_version !== next.state_version) setPrevious(latest.current);
    latest.current = next;
    setMatch(next);
  }, []);

  // Show a note in the bear's corner. The corner says it out loud itself (see BearCorner), so `speech` is the words to say.
  // `extras` are further notes under the main one.
  const tell = useCallback((main, extras = [], options = {}) => {
    sequence.current += 1;
    const mood = (main && main.mood) || NEUTRAL;
    const more = extras.filter(Boolean);
    setBubble({ main, extras: more, seq: sequence.current, mood, speech: main && options.voice !== false ? speechOf(main, more) : '' });
    setFocus(options.focus || null);
  }, []);

  const load = useCallback(async () => {
    try {
      const m = await apiGet(`/api/v1/playground/matches/${encodeURIComponent(matchId)}`);
      apply(m);
      setError(null);
      return m;
    } catch (err) {
      setError(err);
      return null;
    }
  }, [matchId, apply]);

  useEffect(() => { load(); }, [load]);

  // What the bear says when a game opens, when a waiting game starts, and when you come back to a game halfway through.
  useEffect(() => {
    if (!match) return;
    const phase = `${match.id}:${match.status}`;
    if (opened.current === phase || match.status === 'waiting') return;
    opened.current = phase;
    const coach = match.coach || {};
    if (match.status !== 'active') {
      tell(coach.finale || plain('Good game', 'Thanks for playing. Ask me how you did.'), [], { voice: false });
      return;
    }
    const started = (match.history || []).length === 0;
    const opening = coach.greeting || (started ? plain(`Let us play ${match.game}`, 'I will watch your moves, help you learn, and cheer you on.', { ...NEUTRAL, pose: 'wave' }) : plain('Welcome back', 'Your game is just as you left it. Ask me if you want a reminder of what is going on.', { ...NEUTRAL, pose: 'wave' }));
    tell(opening, coach.advice ? [coach.advice] : []);
  }, [match, tell]);

  const waiting = match && match.status === 'waiting';
  const theirTurn = match && match.status === 'active' && match.mode !== 'bear' && me && match.current_player_id !== me.id;
  useEffect(() => {
    if (!theirTurn && !waiting) return undefined;
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [theirTurn, waiting, load]);

  useEffect(() => {
    if (!note) return undefined;
    const t = setTimeout(() => setNote(''), 6500);
    return () => clearTimeout(t);
  }, [note]);

  async function move(m) {
    setBusy(true);
    setNote('');
    setFocus(null);
    try {
      const next = await apiPost(`/api/v1/playground/matches/${encodeURIComponent(matchId)}/moves`, { move: m });
      apply(next);
      clearApiCache('play-');
      const coach = next.coach || {};
      const last = coach.last || {};
      const reply = last.reply && last.reply.text ? {
        kind: 'reply', headline: `${bearName} played`, text: last.reply.text, points: [], concept: null, move: null,
        focus: last.reply.focus || null, grade: null, mood: last.reply.mood && typeof last.reply.mood === 'object' ? last.reply.mood : NEUTRAL,
      } : null;
      if (next.status !== 'active') {
        const won = next.outcome && me && next.outcome.winner_id === me.id;
        tell(coach.finale || last.review || plain(won ? 'You won!' : 'Good game', won ? 'Brilliant playing.' : 'Well played.', { ...NEUTRAL, celebrate: Boolean(won) }), [last.review && coach.finale ? last.review : null, reply], { focus: reply && reply.focus });
      } else {
        const main = last.review || reply;
        const rest = [last.review ? reply : null, coach.advice || null];
        tell(main, rest, { focus: reply ? reply.focus : null });
      }
    } catch (err) {
      const msg = friendlyError(err);
      setNote(msg);
      if (err.status === 422) {
        const advice = match && match.coach ? match.coach.advice : null;
        tell(plain('That move is not allowed', msg, { emotion: 'worried', pose: 'cheeks', emote: 'surprise', celebrate: false }), [advice]);
      }
    } finally {
      setBusy(false);
    }
  }

  async function ask(kind, text) {
    if (thinking) return;
    setThinking(true);
    setFocus(null);
    try {
      const out = await apiPost(`/api/v1/playground/matches/${encodeURIComponent(matchId)}/coach`, text ? { ask: kind, text } : { ask: kind });
      const answer = out && out.note ? out.note : null;
      if (answer) tell(answer, [], { focus: ['hint', 'bear', 'why'].includes(kind) ? answer.focus : null });
    } catch (err) {
      const msg = friendlyError(err);
      setNote(msg);
      tell(plain('I could not answer that', msg, { emotion: 'worried', pose: 'cheeks', emote: 'hide', celebrate: false }), [], { voice: false });
    } finally {
      setThinking(false);
    }
  }

  async function endGame() {
    setBusy(true);
    try {
      await apiPost(`/api/v1/playground/matches/${encodeURIComponent(matchId)}/end`, {});
      clearApiCache('play-');
      router.push('/play');
    } catch (err) {
      setNote(friendlyError(err));
      setBusy(false);
    }
  }

  async function startGroup() {
    setBusy(true);
    try {
      const next = await apiPost(`/api/v1/playground/matches/${encodeURIComponent(matchId)}/start`, {});
      apply(next);
      clearApiCache('play-');
    } catch (err) {
      setNote(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  async function setSeat(seat, kind, user) {
    setBusy(true);
    try {
      const next = await apiPost(`/api/v1/playground/matches/${encodeURIComponent(matchId)}/seats`, user ? { seat, kind, user_id: user.id } : { seat, kind });
      apply(next);
      setSeatToFill(null);
      if (user) setNote(`Invitation sent to ${user.name}`);
    } catch (err) {
      setNote(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  if (error && !match) {
    return (
      <Arena game="error">
        <ArenaTop title="Playground" mark="gamepad" status="Could not open" />
        <div className="pg-error">
          <ErrorState error={error} onRetry={load} title="Could not open this game" />
        </div>
      </Arena>
    );
  }
  if (!match) {
    return (
      <Arena game="loading">
        <ArenaTop title="Setting up the board" mark="gamepad" status="One moment" />
        <div className="pg-loading" role="status"><span className="pg-spinner" aria-hidden /> Getting your game ready…</div>
      </Arena>
    );
  }

  const bearGame = match.mode === 'bear';
  const group = match.mode === 'group';
  const opp = bearGame ? bearName : group ? 'Players' : (match.opponent && match.opponent.name) || 'Classmate';
  const finished = match.status === 'completed' || match.status === 'cancelled';
  const won = Boolean(finished && me && match.winner_id === me.id);
  const draw = match.status === 'completed' && !match.winner_id && !Number.isInteger(match.winner_side);
  const myTurn = !finished && !waiting && (bearGame || (me && match.current_player_id === me.id));
  const turnName = group && match.state && Number.isInteger(match.state.side) ? seatName(match, match.state.side, opp) : opp;
  const status = waiting ? 'Waiting for players' : finished ? (match.status === 'cancelled' ? 'Ended' : won ? 'You won' : draw ? 'Draw' : 'Finished') : myTurn ? 'Your turn' : `${turnName}’s turn`;
  const title = group ? `${match.game} · ${match.seat_count} players` : `${match.game} vs ${opp}`;
  const winnerName = Number.isInteger(match.winner_side) ? seatName({ ...match, your_side: -1 }, match.winner_side, opp) : opp;
  const mode = (match.coach && match.coach.mode) || 'friendly';
  const canEnd = !finished;

  return (
    <Arena game={match.game_id}>
      <ArenaTop
        title={title}
        mark={GAME_ICON[match.game_id] || 'gamepad'}
        status={status}
        tone={finished ? (won ? 'success' : 'info') : myTurn ? 'accent' : 'info'}
        actions={canEnd ? <EndGame match={match} myId={me && me.id} busy={busy} onEnd={endGame} /> : null}
      />
      {!waiting && <PlayerStrip match={match} opp={opp} meName={me && me.full_name} bear={bearGame} />}
      <BearCorner
        name={bearName}
        game={match.game}
        mode={mode}
        bearGame={bearGame}
        finished={finished}
        bubble={bubble}
        focus={focus}
        myTurn={Boolean(myTurn)}
        busy={busy}
        thinking={thinking}
        voice={bearSettings && bearSettings.voice}
        onAsk={ask}
        onPlay={move}
        onShow={setFocus}
      />
      {note && <div className="pg-toast" role="alert">{note}</div>}
      {waiting ? (
        <WaitingRoom match={match} me={me} busy={busy} onStart={startGroup} onSeat={(seat, kind) => setSeat(seat, kind)} onInvite={setSeatToFill} />
      ) : (
        <GameBoard key={`${match.id}:${match.state_version}`} match={match} busy={busy || !myTurn} onMove={move} opp={opp} previous={previous} focus={focus} />
      )}
      <PlayerPicker
        open={seatToFill !== null}
        onClose={() => setSeatToFill(null)}
        title="Invite a classmate"
        intro={`They get an invitation to take seat ${seatToFill === null ? '' : seatToFill + 1}. The game starts when you press Start.`}
        exclude={(match.seats || []).map((seat) => (seat.user ? seat.user.id : null)).filter(Boolean)}
        onPick={(player) => setSeat(seatToFill, 'invite', player)}
      />
      {finished && !closed && (
        <ResultCard
          won={won}
          draw={draw}
          text={match.status === 'cancelled' ? 'This game was ended.' : won ? (group ? 'You won the game. Well played, everyone!' : `Well played against ${opp}.`) : draw ? 'It finished level. Evenly matched!' : group ? `${winnerName} took this one. Your next game could go differently.` : `${opp} took this one. Your next game could go differently.`}
        >
          <Link href="/play" className="pg-btn pg-btn--primary">Play again</Link>
          <Link href="/home" className="pg-btn">Back to learning</Link>
          <button type="button" className="pg-btn" onClick={() => setClosed(true)}>Look at the board</button>
        </ResultCard>
      )}
    </Arena>
  );
}
