'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ReviewQueue() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      // Fetching submissions that need review via the school's proxy
      const response = await fetch('/api/v1/assessments/all/submissions?needs_review=1', {
        headers: { 'Accept': 'application/json' },
        credentials: 'same-origin'
      });
      if (!response.ok) throw new Error('Failed to load review queue');
      const data = await response.json();
      setSubmissions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Staff Assignment Review</h1>
        <p className="text-gray-400">Written answers requiring manual evaluation.</p>
        <button 
          onClick={fetchQueue}
          className="mt-4 px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition"
        >
          Refresh Queue
        </button>
      </header>

      {loading ? (
        <div className="text-gray-500">Loading submissions...</div>
      ) : error ? (
        <div className="text-red-500">Error: {error}</div>
      ) : submissions.length === 0 ? (
        <div className="text-gray-400">No submissions currently require review.</div>
      ) : (
        <div className="space-y-4">
          {submissions.map((s) => (
            <div key={s.id} className="border border-gray-800 p-4 rounded flex items-center justify-between hover:border-gray-600 transition">
              <div>
                <p className="font-semibold">{s.student_name || 'Student'}</p>
                <p className="text-sm text-gray-400">
                  {s.quiz_title} · Attempt {s.attempt_number}
                </p>
              </div>
              <Link 
                href={`/staff/review/${s.assessment_id}/${s.id}`}
                className="px-4 py-2 border border-white rounded text-sm hover:bg-white hover:text-black transition"
              >
                Review
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}