'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Playground() {
  const router = useRouter();
  const [games, setGames] = useState([]);
  const [matches, setMatches] = useState([]);
  const [invites, setInvites] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedGame, setSelectedGame] = useState('chess');
  const [difficulty, setDifficulty] = useState('beginner');
  const [training, setTraining] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [players, setPlayers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [sendingInviteId, setSendingInviteId] = useState(null);
  const [user, setUser] = useState(null);

  const GAME_ART = {
    chess: '♟️',
    checkers: '🔴',
    go: '⚪',
    reversi: '⚫',
    tictactoe: '❌',
    connect4: '🟡'
  };

  useEffect(() => {
    async function initPlayground() {
      try {
        setLoading(true);
        const [gamesRes, matchesRes, invitesRes, boardRes, meRes] = await Promise.all([
          fetch('/api/v1/playground/games', { credentials: 'same-origin' }),
          fetch('/api/v1/playground/matches?limit=20', { credentials: 'same-origin' }),
          fetch('/api/v1/playground/invitations?status=pending', { credentials: 'same-origin' }),
          fetch('/api/v1/playground/leaderboard?game_id=all', { credentials: 'same-origin' }),
          fetch('/api/v1/auth/me', { credentials: 'same-origin' })
        ]);

        if (gamesRes.ok) {
          const data = await gamesRes.json();
          setGames(data || []);
        }
        if (matchesRes.ok) {
          const data = await matchesRes.json();
          setMatches(data.data || []);
        }
        if (invitesRes.ok) {
          const data = await invitesRes.json();
          setInvites(data.data || []);
        }
        if (boardRes.ok) {
          const data = await boardRes.json();
          setLeaderboard(data || []);
        }
        if (meRes.ok) {
          const data = await meRes.json();
          setUser(data);
        }
      } catch (err) {
        setError('Failed to load playground data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    initPlayground();
  }, []);

  useEffect(() => {
    if (!isInviting) return;
    const delayDebounceFn = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/v1/playground/players?limit=10${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`, {
          credentials: 'same-origin'
        });
        if (res.ok) {
          const data = await res.json();
          setPlayers(data.data || []);
        }
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, isInviting]);

  const handleStartMatch = async () => {
    setIsBusy(true);
    try {
      const res = await fetch('/api/v1/playground/matches', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: selectedGame, difficulty, training })
      });
      if (res.ok) {
        const match = await res.json();
        router.push(`/play/${match.id}`);
      } else {
        const err = await res.json();
        alert(err.message || 'Could not start match');
      }
    } catch (err) {
      alert('An error occurred starting the match.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleInviteAction = async (inviteId, action) => {
    try {
      const res = await fetch(`/api/v1/playground/invitations/${inviteId}`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        const out = await res.json();
        if (out.match) {
          router.push(`/play/${out.match.id}`);
        } else {
          setInvites(prev => prev.filter(i => i.id !== inviteId));
        }
      }
    } catch (err) {
      console.error('Action failed', err);
    }
  };

  const handleSendInvite = async (recipientId) => {
    setSendingInviteId(recipientId);
    try {
      const res = await fetch('/api/v1/playground/invitations', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: selectedGame, recipient_id: recipientId })
      });
      if (res.ok) {
        setIsInviting(false);
        // Refresh invites
        const invitesRes = await fetch('/api/v1/playground/invitations?status=pending', { credentials: 'same-origin' });
        if (invitesRes.ok) {
          const data = await invitesRes.json();
          setInvites(data.data || []);
        }
      }
    } catch (err) {
      console.error('Invite failed', err);
    } finally {
      setSendingInviteId(null);
    }
  };

  const formatRelativeTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const activeMatches = matches.filter(m => m.status === 'active');
  const completedMatches = matches.filter(m => m.status !== 'active').slice(0, 5);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-500/20 antialiased font-sans flex flex-col relative overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slideUp 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .game-card-active {
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.05);
        }
      `}} />

      <nav className="border-b border-zinc-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tighter hover:text-red-500 transition-colors">
            BEARILLY <span className="text-zinc-500 font-medium">PLAYGROUND</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-white transition-colors">Dashboard</Link>
            <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold">
              {user?.full_name?.charAt(0) || 'S'}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-5xl mx-auto w-full px-6 py-12 space-y-12 animate-slide-up">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Playground</h1>
          <p className="text-zinc-400 max-w-2xl">
            Take a break with a game. Play against the Bear, who teaches you as you go, or challenge a classmate from your school.
          </p>
        </header>

        {invites.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">Pending Invitations</h2>
            <div className="grid gap-3">
              {invites.map((inv) => {
                const isSender = inv.sender_id === user?.id;
                return (
                  <div key={inv.id} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{GAME_ART[inv.game_id] || '🎮'}</span>
                      <div>
                        <p className="font-medium">
                          {isSender ? `Waiting for ${inv.recipient?.name || 'classmate'}` : `${inv.sender?.name || 'A classmate'} challenged you`}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {games.find(g => g.id === inv.game_id)?.name || inv.game_id} • {formatRelativeTime(inv.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {isSender ? (
                        <button 
                          onClick={() => handleInviteAction(inv.id, 'cancel')}
                          className="px-4 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      ) : (
                        <>
                          <button 
                            onClick={() => handleInviteAction(inv.id, 'accept')}
                            className="px-4 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => handleInviteAction(inv.id, 'decline')}
                            className="px-4 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                          >
                            Decline
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {activeMatches.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">Your Active Games</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {activeMatches.map((m) => (
                <Link 
                  key={m.id} 
                  href={`/play/${m.id}`}
                  className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex items-center justify-between hover:border-zinc-600 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{GAME_ART[m.game_id] || '🎮'}</span>
                    <div>
                      <p className="font-medium">{m.game || m.game_id}</p>
                      <p className="text-xs text-zinc-500">
                        vs {m.mode === 'bear' ? 'The Bear' : (m.opponent?.name || 'Classmate')} • {formatRelativeTime(m.updated_at || m.created_at)}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-red-500 group-hover:translate-x-1 transition-transform">CONTINUE →</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">New Game</h2>
          <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-2xl space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {games.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGame(g.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedGame === g.id 
                      ? 'border-red-500 bg-red-500/5 ring-1 ring-red-500' 
                      : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                  }`}
                >
                  <span className="text-3xl block mb-2">{GAME_ART[g.id] || '🎮'}</span>
                  <p className="font-bold text-sm">{g.name}</p>
                  <p className="text-[10px] text-zinc-500 line-clamp-1">{g.description}</p>
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-8 pt-4 border-t border-zinc-800">
              <div className="space-y-3">
                <p className="text-xs font-medium text-zinc-400">Difficulty</p>
                <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                  {['beginner', 'standard'].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
                        difficulty === d ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-medium text-zinc-400">Mode</p>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={training} 
                      onChange={(e) => setTraining(e.target.checked)} 
                    />
                    <div className={`w-10 h-5 rounded-full transition-colors ${training ? 'bg-red-600' : 'bg-zinc-800'}`}></div>
                    <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${training ? 'translate-x-5' : ''}`}></div>
                  </div>
                  <span className="text-xs text-zinc-300 group-hover:text-white transition-colors">Training Mode (Coaching)</span>
                </label>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                disabled={isBusy}
                onClick={handleStartMatch}
                className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isBusy ? 'Starting...' : `Play the Bear`}
              </button>
              <button
                onClick={() => setIsInviting(true)}
                className="px-8 py-3 bg-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-700 transition-colors border border-zinc-700"
              >
                Challenge Classmate
              </button>
            </div>
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-12">
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">School Leaderboard</h2>
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden">
              {leaderboard.length === 0 ? (
                <p className="p-8 text-center text-sm text-zinc-500">Play a few games to see the rankings.</p>
              ) : (
                <div className="divide-y divide-zinc-800">
                  {leaderboard.slice(0, 8).map((r, idx) => (
                    <div key={`${r.student_id}-${r.game_id}`} className="p-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${idx < 3 ? 'bg-red-500/20 text-red-500' : 'bg-zinc-800 text-zinc-500'}`}>
                          {r.rank}
                        </span>
                        <div>
                          <p className="text-sm font-bold">{r.name}</p>
                          <p className="text-[10px] text-zinc-500">{games.find(g => g.id === r.game_id)?.name || r.game_id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{r.wins} Wins</p>
                        <p className="text-[10px] text-zinc-500">{r.win_rate}% Win Rate</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">Recent History</h2>
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden">
              {completedMatches.length === 0 ? (
                <p className="p-8 text-center text-sm text-zinc-500">Your finished games will appear here.</p>
              ) : (
                <div className="divide-y divide-zinc-800">
                  {completedMatches.map((m) => (
                    <Link 
                      key={m.id} 
                      href={`/play/${m.id}`}
                      className="p-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-xl">{GAME_ART[m.game_id] || '🎮'}</span>
                        <div>
                          <p className="text-sm font-bold">{m.game || m.game_id}</p>
                          <p className="text-[10px] text-zinc-500 uppercase tracking-tighter font-semibold">{m.result || 'Finished'}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-zinc-500">{formatRelativeTime(m.updated_at || m.created_at)}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {isInviting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsInviting(false)}></div>
          <div className="relative bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="font-bold">Challenge a Classmate</h3>
              <button onClick={() => setIsInviting(false)} className="text-zinc-500 hover:text-white">✕</button>
            </div>
            <div className="p-6 space-y-6">
              <p className="text-xs text-zinc-400">
                Select a classmate to invite to a game of <span className="text-white font-bold">{games.find(g => g.id === selectedGame)?.name || selectedGame}</span>.
              </p>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 transition-colors"
                />
                {searching && <div className="absolute right-4 top-3.5 w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>}
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {players.length === 0 ? (
                  <p className="text-center py-8 text-xs text-zinc-500">{searchQuery ? 'No classmates found.' : 'Start typing to find classmates...'}</p>
                ) : (
                  players.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-zinc-800/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold">
                          {p.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium">{p.name}</span>
                      </div>
                      <button
                        disabled={sendingInviteId === p.id}
                        onClick={() => handleSendInvite(p.id)}
                        className="px-4 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50"
                      >
                        {sendingInviteId === p.id ? '...' : 'Invite'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-zinc-900 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} Bearilly Education. All rights reserved.
          </div>
          <div className="flex gap-8 text-zinc-500 text-sm">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/support" className="hover:text-white transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}