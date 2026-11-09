'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

export default function MatchPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { matchId } = params;
  const router = useRouter();

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [move, setMove] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const res = await fetch(`/api/v1/playground/matches/${matchId}`);
        const json = await res.json();
        if (json.data) {
          setMatch(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch match:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatch();
  }, [matchId]);

  const handleSubmitMove = async (e) => {
    e.preventDefault();
    if (!move) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/playground/matches/${matchId}/moves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ move: { to: move } })
      });
      const json = await res.json();
      if (json.data) {
        setMatch(json.data);
        setMove('');
      }
    } catch (err) {
      console.error('Move failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Loading match...</div>;
  if (!match) return <div className="p-6 text-red-500">Match not found.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Match: {match.game_id}</h1>
        <p className="text-sm text-gray-500">Status: {match.status}</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="font-mono text-lg mb-4 p-4 bg-gray-50 rounded border">
          {match.board || 'Board state unavailable'}
        </div>
        
        {match.status === 'active' && (
          <form onSubmit={handleSubmitMove} className="flex gap-2">
            <input
              type="text"
              value={move}
              onChange={(e) => setMove(e.target.value)}
              placeholder="Enter move (e.g., e4)"
              className="flex-1 border rounded px-3 py-2"
              disabled={submitting}
            />
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              disabled={submitting}
            >
              {submitting ? 'Sending...' : 'Submit Move'}
            </button>
          </form>
        )}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Move History</h2>
        <ul className="space-y-2">
          {match.history?.map((h, i) => (
            <li key={i} className="text-sm text-gray-600 border-b pb-2">
              {h.player}: {h.move}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}