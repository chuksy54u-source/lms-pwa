'use client';

import { useState, useEffect, useMemo, use } from 'react';
import { useRouter } from 'next/navigation';

export default function QuizPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { assessmentId } = params;
  const router = useRouter();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState('intro'); // intro | taking | result
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch(`/api/v1/assessments/${encodeURIComponent(assessmentId)}`)
      .then((res) => res.json())
      .then((json) => {
        setQuiz(json.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [assessmentId]);

  const questions = useMemo(() => (quiz ? [...quiz.questions].sort((a, b) => a.position - b.position) : []), [quiz]);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const body = {
        answers: questions.map((q) => ({
          question_id: q.id,
          answer: answers[q.id] ?? (q.type === 'mcq' ? null : '')
        })).filter((a) => a.answer !== null && a.answer !== '')
      };

      const res = await fetch(`/api/v1/assessments/${encodeURIComponent(assessmentId)}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const json = await res.json();
      setResult(json.data);
      setPhase('result');
    } catch (e) {
      console.error('Submission failed', e);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="p-6">Loading quiz...</div>;
  if (!quiz) return <div className="p-6">Quiz not found.</div>;

  if (phase === 'intro') {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">{quiz.title}</h1>
        <p className="mb-6">This quiz contains {questions.length} questions. Good luck!</p>
        <button 
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          onClick={() => setPhase('taking')}
        >
          Start Quiz
        </button>
      </div>
    );
  }

  if (phase === 'taking') {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-6">Quiz in Progress</h2>
        {questions.map((q, idx) => (
          <div key={q.id} className="mb-8 p-4 border rounded shadow-sm">
            <p className="font-medium mb-3">{idx + 1}. {q.prompt}</p>
            {q.type === 'mcq' ? (
              <div className="space-y-2">
                {q.options.map((opt, i) => (
                  <label key={i} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name={q.id} 
                      onChange={() => setAnswers({...answers, [q.id]: i})}
                      checked={answers[q.id] === i}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            ) : (
              <textarea 
                className="w-full p-2 border rounded"
                onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
                value={answers[q.id] || ''}
              />
            )}
          </div>
        ))}
        <button 
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit Answers'}
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Quiz Results</h1>
      <div className="bg-gray-50 p-4 rounded border">
        <p className="text-lg">Score: {result?.submission?.percent ?? 0}%</p>
        <p className="text-sm text-gray-600">Status: {result?.submission?.status}</p>
      </div>
      <button 
        className="mt-6 text-blue-600 hover:underline"
        onClick={() => router.push('/dashboard')}
      >
        Return to Dashboard
      </button>
    </div>
  );
}