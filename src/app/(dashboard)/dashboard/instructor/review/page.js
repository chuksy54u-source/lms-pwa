'use client';

import { useState, useEffect } from 'react';

export default function InstructorReviewPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [grading, setGrading] = useState({});

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      // Note: This endpoint is a placeholder for the assessment review queue
      const response = await fetch('/api/v1/assessments/pending/submissions?needs_review=1');
      if (!response.ok) throw new Error('Failed to fetch submissions');
      const { data } = await response.json();
      setSubmissions(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleGrade = async (submissionId, points, feedback) => {
    setGrading((prev) => ({ ...prev, [submissionId]: true }));
    try {
      await fetch(`/api/v1/submissions/${submissionId}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: [{ points, feedback }] }),
      });
      await fetchSubmissions();
    } catch (err) {
      alert('Failed to submit grade');
    } finally {
      setGrading((prev) => ({ ...prev, [submissionId]: false }));
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Instructor Review Queue</h1>
      
      {loading ? (
        <div className="text-gray-500">Loading pending submissions...</div>
      ) : error ? (
        <div className="text-red-500">Error: {error}</div>
      ) : submissions.length === 0 ? (
        <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
          <p className="text-gray-600">No submissions currently require manual review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div key={sub.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{sub.student_name}</h3>
                  <p className="text-sm text-gray-500">Assessment: {sub.assessment_title}</p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                  Needs Review
                </span>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Feedback</label>
                <textarea 
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="Provide feedback..."
                  onChange={(e) => sub.tempFeedback = e.target.value}
                />
                <div className="mt-2 flex items-center gap-4">
                  <input 
                    type="number" 
                    placeholder="Points" 
                    className="w-20 p-2 border rounded-md"
                    onChange={(e) => sub.tempPoints = parseInt(e.target.value)}
                  />
                  <button 
                    disabled={grading[sub.id]}
                    onClick={() => handleGrade(sub.id, sub.tempPoints, sub.tempFeedback)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {grading[sub.id] ? 'Saving...' : 'Submit Grade'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}