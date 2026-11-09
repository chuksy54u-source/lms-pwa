'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PlaygroundPage() {
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState([]);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [gamesRes, matchesRes] = await Promise.all([
          fetch('/api/v1/playground/games'),
          fetch('/api/v1/playground/matches?status=active')
        ]);

        const gamesData = await gamesRes.json();
        const matchesData = await matchesRes.json();

        setGames(gamesData.data || []);
        setMatches(matchesData.data || []);
      } catch (err) {
        setError('Failed to load playground data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-6 text-center">Loading Playground...</div>;

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Playground</h1>
        <Link href="/dashboard/play/leaderboard" className="text-sm text-blue-600 hover:underline">
          View Leaderboard
        </Link>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 rounded-md">{error}</div>}

      <section>
        <h2 className="text-lg font-semibold mb-4">Active Matches</h2>
        {matches.length === 0 ? (
          <div className="p-8 border-2 border-dashed border-gray-200 rounded-lg text-center text-gray-500">
            No active matches. Start a new game below!
          </div>
        ) : (
          <div className="grid gap-4">
            {matches.map((match) => (
              <div key={match.id} className="p-4 border rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-medium">{match.game_id.toUpperCase()} Match</p>
                  <p className="text-sm text-gray-500">Status: {match.status}</p>
                </div>
                <Link href={`/dashboard/play/${match.id}`} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">
                  Continue
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Available Games</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((game) => (
            <div key={game.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <h3 className="font-bold text-lg mb-2">{game.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{game.description}</p>
              <button 
                onClick={() => {/* TODO: Implement start match logic */}}
                className="w-full py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
              >
                Start Training Match
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}