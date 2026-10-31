"use client";

import { useState, useEffect } from 'react';

export default function PlaygroundPage() {
  const [games, setGames] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [gamesRes, matchesRes] = await Promise.all([
          fetch('/api/v1/playground/games'),
          fetch('/api/v1/playground/matches?status=active')
        ]);
        
        if (gamesRes.ok) setGames(await gamesRes.json());
        if (matchesRes.ok) setMatches(await matchesRes.json());
      } catch (err) {
        console.error("Failed to fetch playground data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const startTrainingMatch = async (gameId) => {
    const res = await fetch('/api/v1/playground/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ game_id: gameId, training: true, difficulty: 'beginner' })
    });
    if (res.ok) {
      const newMatch = await res.json();
      setMatches((prev) => [...prev, newMatch]);
    }
  };

  if (loading) return <div className="loading">Loading Playground...</div>;

  return (
    <div className="playground-container">
      <h1>School Playground</h1>
      
      <section className="games-list">
        <h2>Available Games</h2>
        <div className="grid">
          {games.map((game) => (
            <div key={game.id} className="game-card">
              <h3>{game.name}</h3>
              <p>{game.description}</p>
              <button onClick={() => startTrainingMatch(game.id)}>
                Start Training Match
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="active-matches">
        <h2>Your Active Matches</h2>
        {matches.length === 0 ? (
          <p>No active matches found.</p>
        ) : (
          <ul>
            {matches.map((match) => (
              <li key={match.id}>
                Match {match.id} - Status: {match.status}
                {/* TODO: Implement match detail view and move submission */}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="leaderboard-stub">
        {/* TODO: Fetch and display /api/v1/playground/leaderboard */}
        <h2>Leaderboard</h2>
        <p>Leaderboard integration coming soon.</p>
      </section>
    </div>
  );
}