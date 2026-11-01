'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const KEYS = 'ABCDEFGH';

export default function QuizPage() {
  const { assessmentId } = useParams();
  const router = useRouter();
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState('intro'); // intro | taking | review | result
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [startedAt, setStartedAt] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Fetch Quiz Data
  useEffect(() => {
    async function fetchQuiz() {
      try {
        const response = await fetch(`/api/v1/assessments/${encodeURIComponent(assessmentId)}`, {
          credentials: 'same-origin',
          headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) throw new Error('Failed to load assessment');
        const data = await response.json();
        setQuiz(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchQuiz();
  }, [assessmentId]);

  // Timer Logic
  useEffect(() => {
    if (phase !== 'taking' && phase !== 'review') return undefined;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const questions = useMemo(() => (quiz?.questions ? [...quiz.questions].sort((a, b) => a.position - b.position) : []), [quiz]);
  const elapsed = startedAt ? Math.floor((now - startedAt) / 1000) : 0;
  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const handleBegin = () => {
    setStartedAt(Date.now());
    setPhase('taking');
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const submissionBody = {
        answers: questions.map((q) => ({
          question_id: q.id,
          answer: answers[q.id] === undefined ? (q.type === 'mcq' ? null : '') : answers[q.id]
        })).filter(a => a.answer !== null)
      };

      const response = await fetch(`/api/v1/assessments/${encodeURIComponent(assessmentId)}/submissions`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionBody)
      });

      if (!response.ok) throw new Error('Failed to submit answers');
      const resData = await response.json();
      setResult({ ...resData, seconds: elapsed });
      setPhase('result');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse text-zinc-500">Loading assessment...</div>
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-zinc-400 mb-8">{error}</p>
        <Link href="/dashboard" className="px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-full hover:bg-zinc-800 transition-colors">
          Back to Dashboard
        </Link>
      </div>
    );
  }

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
        .scroll-card {
          background: rgba(24, 24, 27, 0.5);
          border: 1px solid rgba(39, 39, 42, 1);
          backdrop-filter: blur(8px);
          transition: all 300ms ease;
        }
      `}} />

      {/* Header */}
      <header className="p-6 flex justify-between items-center border-b border-zinc-900 sticky top-0 bg-black/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-zinc-500 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <h1 className="font-bold tracking-tight">{quiz?.title}</h1>
        </div>
        {(phase === 'taking' || phase === 'review') && (
          <div className="flex items-center gap-2 text-zinc-400 font-mono text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {formatTime(elapsed)}
          </div>
        )}
      </header>

      <main className="flex-grow flex flex-col items-center p-6 md:p-12">
        <div className="w-full max-w-3xl animate-slide-up">
          
          {/* Intro Phase */}
          {phase === 'intro' && (
            <div className="scroll-card p-8 rounded-3xl text-center">
              <div className="inline-block px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-bold tracking-widest uppercase mb-6">
                Assessment
              </div>
              <h2 className="text-4xl font-bold mb-4">{quiz?.title}</h2>
              <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                This assessment contains {questions.length} questions. 
                A pass mark of {quiz?.pass_mark}% is required.
              </p>
              <div className="grid grid-cols-3 gap-4 mb-10">
                <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                  <div className="text-zinc-500 text-xs uppercase mb-1">Questions</div>
                  <div className="text-xl font-bold">{questions.length}</div>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                  <div className="text-zinc-500 text-xs uppercase mb-1">Pass Mark</div>
                  <div className="text-xl font-bold">{quiz?.pass_mark}%</div>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                  <div className="text-zinc-500 text-xs uppercase mb-1">Attempts</div>
                  <div className="text-xl font-bold">{quiz?.max_attempts || '∞'}</div>
                </div>
              </div>
              <button 
                onClick={handleBegin}
                className="w-full py-4 bg-white text-black rounded-full font-bold hover:bg-zinc-200 transition-all transform hover:scale-[1.02]"
              >
                Start Assessment
              </button>
            </div>
          )}

          {/* Taking Phase */}
          {phase === 'taking' && quiz && (
            <div className="space-y-8">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-zinc-500 text-sm font-mono">Question {currentIndex + 1} of {questions.length}</span>
                  <div className="h-1 w-48 bg-zinc-900 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="h-full bg-red-500 transition-all duration-500" 
                      style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="scroll-card p-8 rounded-3xl">
                <h3 className="text-2xl font-medium mb-8 leading-relaxed">
                  {questions[currentIndex].prompt}
                </h3>

                {questions[currentIndex].type === 'mcq' ? (
                  <div className="space-y-3">
                    {questions[currentIndex].options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => setAnswers(prev => ({ ...prev, [questions[currentIndex].id]: idx }))}
                        className={`w-full p-5 rounded-2xl border text-left transition-all flex items-center gap-4 ${
                          answers[questions[currentIndex].id] === idx 
                            ? 'bg-red-500/10 border-red-500 text-white' 
                            : 'bg-zinc-900/30 border-zinc-800 text-zinc-400 hover:border-zinc-600'
                        }`}
                      >
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                          answers[questions[currentIndex].id] === idx ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-500'
                        }`}>
                          {KEYS[idx]}
                        </span>
                        <span className="flex-grow">{opt}</span>
                        {answers[questions[currentIndex].id] === idx && (
                          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <textarea
                    value={answers[questions[currentIndex].id] || ''}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [questions[currentIndex].id]: e.target.value }))}
                    placeholder="Type your answer here..."
                    className="w-full h-48 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition-colors resize-none"
                  />
                )}
              </div>

              <div className="flex gap-4">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(prev => prev - 1)}
                  className="flex-1 py-4 bg-zinc-900 border border-zinc-800 text-white rounded-full font-bold hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                {currentIndex === questions.length - 1 ? (
                  <button
                    onClick={() => setPhase('review')}
                    className="flex-[2] py-4 bg-white text-black rounded-full font-bold hover:bg-zinc-200 transition-all"
                  >
                    Review Answers
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentIndex(prev => prev + 1)}
                    className="flex-[2] py-4 bg-white text-black rounded-full font-bold hover:bg-zinc-200 transition-all"
                  >
                    Next Question
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Review Phase */}
          {phase === 'review' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">Review Your Answers</h2>
                <p className="text-zinc-500">Make sure everything looks correct before submitting.</p>
              </div>

              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setPhase('taking');
                    }}
                    className="w-full scroll-card p-6 rounded-2xl flex items-center gap-6 text-left hover:border-zinc-600 transition-all"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      answers[q.id] !== undefined && answers[q.id] !== '' ? 'bg-red-500/20 text-red-500' : 'bg-zinc-800 text-zinc-500'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-grow overflow-hidden">
                      <div className="text-sm text-zinc-500 truncate mb-1">{q.prompt}</div>
                      <div className="font-medium text-white truncate">
                        {answers[q.id] !== undefined && answers[q.id] !== '' 
                          ? (q.type === 'mcq' ? q.options[answers[q.id]] : answers[q.id])
                          : <span className="text-red-400 italic">No answer provided</span>
                        }
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                ))}
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-2xl text-red-500 text-sm text-center">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setPhase('taking')}
                  className="flex-1 py-4 bg-zinc-900 border border-zinc-800 text-white rounded-full font-bold hover:bg-zinc-800 transition-all"
                >
                  Back to Quiz
                </button>
                <button
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="flex-[2] py-4 bg-white text-black rounded-full font-bold hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : 'Submit Assessment'}
                </button>
              </div>
            </div>
          )}

          {/* Result Phase */}
          {phase === 'result' && result && (
            <div className="scroll-card p-10 rounded-3xl text-center">
              <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-8 ${
                result.submission.passed ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'
              }`}>
                {result.submission.passed ? (
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                )}
              </div>

              <h2 className="text-4xl font-bold mb-2">
                {result.submission.passed ? 'Congratulations!' : 'Keep Practicing'}
              </h2>
              <p className="text-zinc-400 mb-10">
                {result.submission.passed 
                  ? "You've successfully passed this assessment." 
                  : "You didn't reach the required pass mark this time."}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                  <div className="text-zinc-500 text-xs uppercase mb-1">Your Score</div>
                  <div className={`text-3xl font-bold ${result.submission.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                    {result.submission.percent}%
                  </div>
                </div>
                <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                  <div className="text-zinc-500 text-xs uppercase mb-1">Time Taken</div>
                  <div className="text-3xl font-bold text-white">
                    {formatTime(result.seconds)}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Link 
                  href="/dashboard"
                  className="block w-full py-4 bg-white text-black rounded-full font-bold hover:bg-zinc-200 transition-all"
                >
                  Return to Dashboard
                </Link>
                {!result.submission.passed && (quiz.max_attempts === null || result.submission.attempt < quiz.max_attempts) && (
                  <button 
                    onClick={() => {
                      setPhase('intro');
                      setAnswers({});
                      setCurrentIndex(0);
                      setResult(null);
                    }}
                    className="block w-full py-4 bg-zinc-900 border border-zinc-800 text-white rounded-full font-bold hover:bg-zinc-800 transition-all"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer Branding */}
      <footer className="p-8 text-center text-zinc-700 text-xs uppercase tracking-widest">
        Powered by Bearilly Assessment Engine
      </footer>
    </div>
  );
}