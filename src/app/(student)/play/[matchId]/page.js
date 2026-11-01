'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MatchPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params?.matchId;

  const [match, setMatch] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [moveNote, setMoveNote] = useState('');
  const [moveInput, setMoveInput] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const greetedRef = useRef(false);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/auth/me', { credentials: 'same-origin' });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (err) {
      console.error('Failed to load user session:', err);
    }
  }, []);

  const fetchMatch = useCallback(async () => {
    if (!matchId) return null;
    try {
      const res = await fetch(`/api/v1/playground/matches/${encodeURIComponent(matchId)}`, {
        credentials: 'same-origin',
      });
      if (!res.ok) {
        throw new Error('Could not load match state');
      }
      const data = await res.json();
      setMatch(data);
      setError(null);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch match');
      return null;
    }
  }, [matchId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    setLoading(true);
    fetchMatch().finally(() => setLoading(false));
  }, [fetchMatch]);

  const dependsOnPolling =
    match &&
    match.status === 'active' &&
    match.mode !== 'bear' &&
    user &&
    match.current_player_id !== user.id;

  useEffect(() => {
    if (!dependsOnPolling) return undefined;
    const interval = setInterval(fetchMatch, 4000);
    return () => clearInterval(interval);
  }, [dependsOnPolling, fetchMatch]);

  const handleSubmitMove = async (movePayload) => {
    if (!matchId || busy) return;
    setBusy(true);
    setMoveNote('');
    try {
      const res = await fetch(`/api/v1/playground/matches/${encodeURIComponent(matchId)}/moves`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ move: movePayload }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || errJson.error || 'That move is not allowed.');
      }

      const updatedMatch = await res.json();
      setMatch(updatedMatch);
      setMoveInput('');
    } catch (err) {
      setMoveNote(err.message || 'Move failed');
    } finally {
      setBusy(false);
    }
  };

  const handleFormMoveSubmit = (e) => {
    e.preventDefault();
    if (!moveInput.trim()) return;
    try {
      const parsed = JSON.parse(moveInput.trim());
      handleSubmitMove(parsed);
    } catch {
      handleSubmitMove(moveInput.trim());
    }
  };

  const gameIcons = {
    chess: '♟️',
    checkers: '⚪',
    connect4: '🟡',
    tictactoe: '❌',
    go: '⚪',
    reversi: '🟢',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white selection:bg-red-500/20 antialiased font-sans flex flex-col justify-center items-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400 font-mono text-sm">Loading match data...</p>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-black text-white selection:bg-red-500/20 antialiased font-sans flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-zinc-900 border border-red-500/30 rounded-xl p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto text-xl">⚠️</div>
          <h2 className="text-xl font-bold">Match Not Found</h2>
          <p className="text-sm text-gray-400">{error || 'Unable to display the requested playground match.'}</p>
          <div className="pt-4">
            <Link
              href="/play"
              className="inline-block px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium text-sm transition-colors"
            >
              Return to Playground
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isBear = match.mode === 'bear';
  const opponentName = isBear ? 'Bearilly Coach' : (match.opponent?.name || 'Classmate');
  const isFinished = match.status !== 'active';
  const won = isFinished && user && match.winner_id === user.id;
  const isMyTurn = !isFinished && (isBear || (user && match.current_player_id === user.id));

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-500/20 antialiased font-sans flex flex-col relative overflow-hidden">
      {/* Background Decorator */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-red-900/20 via-red-950/5 to-transparent pointer-events-none blur-3xl" />

      {/* Navigation Header */}
      <header className="border-b border-zinc-800 bg-black/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/play" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center space-x-1">
              <span>←</span>
              <span>Playground</span>
            </Link>
            <span className="text-zinc-700">/</span>
            <span className="font-semibold text-white capitalize">{match.game || match.game_id || 'Match'}</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => fetchMatch()}
              disabled={busy}
              className="px-3 py-1.5 rounded-lg border border-zinc-700 hover:bg-zinc-800 text-xs font-medium text-gray-300 transition-colors flex items-center space-x-1.5"
            >
              <svg className={`w-3.5 h-3.5 ${busy ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 relative z-10 space-y-6">
        {/* Header Match Information Card */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600/20 to-zinc-800 border border-red-500/30 flex items-center justify-center text-2xl">
              {gameIcons[match.game_id] || '🎮'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold capitalize text-white">{match.game || match.game_id}</h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full border border-zinc-700 bg-zinc-800/80 text-gray-300 capitalize">
                  {match.mode || 'PvP'}
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                You vs <span className="text-white font-medium">{opponentName}</span>
                {isBear && match.difficulty && <span className="ml-1 text-xs text-zinc-500">• {match.difficulty}</span>}
                {match.training && <span className="ml-1 text-xs text-amber-400/90">• Training Mode</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {isFinished ? (
              <span className={`px-4 py-2 rounded-xl text-sm font-semibold border ${won ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400' : 'bg-zinc-800 border-zinc-700 text-gray-300'}`}>
                {won ? '🏆 Victory' : (match.result || 'Match Completed')}
              </span>
            ) : (
              <span className={`px-4 py-2 rounded-xl text-sm font-semibold border flex items-center space-x-2 ${isMyTurn ? 'bg-red-950/60 border-red-500/50 text-red-300 animate-pulse' : 'bg-zinc-800/80 border-zinc-700 text-gray-400'}`}>
                <span className={`w-2 h-2 rounded-full ${isMyTurn ? 'bg-red-400' : 'bg-gray-500'}`} />
                <span>{isMyTurn ? 'Your Turn' : `${opponentName}'s Turn...`}</span>
              </span>
            )}
          </div>
        </div>

        {/* Notifications & Coach Guidance */}
        {moveNote && (
          <div className="bg-red-950/40 border border-red-500/40 text-red-300 px-4 py-3 rounded-xl text-sm flex items-start space-x-3">
            <span className="text-red-400 text-base">⚠️</span>
            <div>
              <p className="font-semibold text-xs uppercase tracking-wider text-red-400 mb-0.5">Move Rejected</p>
              <p>{moveNote}</p>
            </div>
          </div>
        )}

        {match.coach_guidance && !isFinished && (
          <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-4 flex items-start space-x-3 text-amber-200">
            <span className="text-amber-400 text-xl">🐻</span>
            <div className="text-sm space-y-1">
              <p className="font-semibold text-amber-400">Coach Guidance</p>
              <p className="text-amber-200/90">{match.coach_guidance.text || match.coach_guidance.tip || JSON.stringify(match.coach_guidance)}</p>
            </div>
          </div>
        )}

        {dependsOnPolling && (
          <div className="bg-blue-950/30 border border-blue-500/30 rounded-xl p-4 text-blue-300 text-sm flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              <span>Waiting for {opponentName}'s move. Page will refresh automatically.</span>
            </div>
          </div>
        )}

        {/* Game Board & Controls Section */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <h2 className="text-lg font-semibold text-white">Match Board</h2>
            <span className="text-xs font-mono text-zinc-500">ID: {match.id || matchId}</span>
          </div>

          {/* Board Display */}
          <div className="bg-black/60 border border-zinc-800 rounded-xl p-6 min-h-[240px] flex flex-col items-center justify-center">
            {match.board ? (
              typeof match.board === 'string' ? (
                <pre className="font-mono text-sm text-green-400 overflow-x-auto whitespace-pre p-4 bg-zinc-950 rounded-lg border border-zinc-800 w-full">
                  {match.board}
                </pre>
              ) : (
                <div className="w-full space-y-3">
                  <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 font-mono text-xs text-zinc-300 overflow-x-auto">
                    {JSON.stringify(match.board, null, 2)}
                  </div>
                </div>
              )
            ) : match.state ? (
              <div className="w-full bg-zinc-950 p-4 rounded-lg border border-zinc-800 font-mono text-xs text-zinc-300 overflow-x-auto">
                {JSON.stringify(match.state, null, 2)}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Active match session ready for moves.</p>
            )}
          </div>

          {/* Move History if present */}
          {match.moves && Array.isArray(match.moves) && match.moves.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Move History</h3>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-zinc-950 rounded-lg border border-zinc-800">
                {match.moves.map((m, idx) => (
                  <span key={idx} className="text-xs font-mono px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-zinc-300">
                    {idx + 1}. {typeof m === 'object' ? JSON.stringify(m) : String(m)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Move Input Form */}
          {!isFinished && (
            <form onSubmit={handleFormMoveSubmit} className="pt-2 border-t border-zinc-800 space-y-3">
              <label htmlFor="moveInput" className="block text-xs font-medium text-zinc-400">
                Submit Next Move {isMyTurn ? '(Your turn)' : '(Waiting)'}
              </label>
              <div className="flex gap-2">
                <input
                  id="moveInput"
                  type="text"
                  value={moveInput}
                  onChange={(e) => setMoveInput(e.target.value)}
                  placeholder={match.game_id === 'chess' ? 'e.g. {"from":"e2","to":"e4"} or e2e4' : 'Enter move syntax or payload'}
                  disabled={!isMyTurn || busy}
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                />
                <button
                  type="submit"
                  disabled={!isMyTurn || busy || !moveInput.trim()}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-medium text-sm transition-colors flex items-center space-x-2"
                >
                  {busy ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Submit Move</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Action buttons when finished */}
          {isFinished && (
            <div className="flex items-center space-x-3 pt-4 border-t border-zinc-800">
              <Link
                href="/play"
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-sm transition-colors"
              >
                Play Another Game
              </Link>
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-gray-300 font-medium text-sm transition-colors"
              >
                Return to Dashboard
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}