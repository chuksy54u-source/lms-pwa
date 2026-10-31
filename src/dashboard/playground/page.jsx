import React, { useState, useEffect } from 'react';

export default function PlaygroundDashboard() {
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
        
        if (gamesRes.ok && matchesRes.ok) {
          setGames(await gamesRes.json());
          setMatches(await matchesRes.json());
        }
      } catch (err) {
        console.error("Failed to fetch playground data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const startMatch = async (gameId) => {
    const res = await fetch('/api/v1/playground/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ game_id: gameId, training: true })
    });
    if (res.ok) {
      window.location.reload();
    }
  };

  if (loading) return <div className="loading">Loading playground...</div>;

  return (
    <div className="playground-container">
      <h1 className="playground-title">Playground</h1>
      
      <section className="active-matches">
        <h2 className="section-header">Active Matches</h2>
        {matches.length === 0 ? (
          <p>No active matches found.</p>
        ) : (
          <ul className="match-list">
            {matches.map(match => (
              <li key={match.id} className="match-item">
                <span>{match.game_id}</span>
                <a href={`/dashboard/playground/match/${match.id}`}>View Match</a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="available-games">
        <h2 className="section-header">Available Games</h2>
        <div className="games-grid">
          {games.map(game => (
            <div key={game.id} className="game-card">
              <h3>{game.name}</h3>
              <p>{game.description}</p>
              <button 
                className="start-btn" 
                onClick={() => startMatch(game.id)}
              >
                Start Training Match
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="leaderboard-stub">
        {/* TODO: Implement leaderboard view using /api/v1/playground/leaderboard */}
        <p>Leaderboard integration pending.</p>
      </section>
    </div>
  );
}