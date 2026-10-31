import React, { useState, useEffect } from 'react';

export default function PlaygroundPage() {
  const [games, setGames] = useState([]);
  const [matches, setMatches] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [gamesRes, matchesRes, leaderboardRes] = await Promise.all([
          fetch('/api/v1/playground/games', { credentials: 'same-origin' }),
          fetch('/api/v1/playground/matches', { credentials: 'same-origin' }),
          fetch('/api/v1/playground/leaderboard', { credentials: 'same-origin' })
        ]);

        if (gamesRes.ok) setGames(await gamesRes.json());
        if (matchesRes.ok) setMatches(await matchesRes.json());
        if (leaderboardRes.ok) setLeaderboard(await leaderboardRes.json());
      } catch (error) {
        console.error('Failed to fetch playground data', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const startTrainingMatch = async (gameId) => {
    try {
      const response = await fetch('/api/v1/playground/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: gameId, training: true, difficulty: 'beginner' }),
        credentials: 'same-origin'
      });
      if (response.ok) {
        const newMatch = await response.json();
        setMatches((prev) => [newMatch, ...prev]);
      }
    } catch (error) {
      console.error('Failed to start training match', error);
    }
  };

  if (loading) return <div className="loading">Loading Playground...</div>;

  return (
    <div className="playground-container">
      <h1>Playground</h1>
      
      <section className="games-list">
        <h2>Available Games</h2>
        <div className="grid">
          {games.map((game) => (
            <div key={game.id} className="game-card">
              <h3>{game.name}</h3>
              <p>{game.description}</p>
              <button onClick={() => startTrainingMatch(game.id)}>Start Training</button>
            </div>
          ))}
        </div>
      </section>

      <section className="active-matches">
        <h2>Your Matches</h2>
        <ul>
          {matches.map((match) => (
            <li key={match.id}>
              Match {match.id} - Status: {match.status}
            </li>
          ))}
        </ul>
      </section>

      <section className="leaderboard">
        <h2>Leaderboard</h2>
        <table>
          <thead>
            <tr>
              <th>Player</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, index) => (
              <tr key={index}>
                <td>{entry.player_name}</td>
                <td>{entry.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}