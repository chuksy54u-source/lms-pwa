'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function StudentHome() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [studentData, setStudentData] = useState({
    dashboard: null,
    progress: null,
    results: null,
    tutorState: null,
    certificates: [],
    onboarding: null,
  });
  const [dismissingTour, setDismissingTour] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const meRes = await fetch('/api/v1/auth/me', { credentials: 'same-origin' });
        if (!meRes.ok) {
          throw new Error('Could not load user session.');
        }
        const meUser = await meRes.json();
        setUser(meUser);

        const studentId = meUser.id || meUser.student_id;
        if (studentId) {
          const [dashRes, progRes, resRes, tutorRes, certsRes, onbRes] = await Promise.all([
            fetch(`/api/v1/students/${studentId}/dashboard`, { credentials: 'same-origin' }).catch(() => null),
            fetch(`/api/v1/students/${studentId}/progress`, { credentials: 'same-origin' }).catch(() => null),
            fetch(`/api/v1/students/${studentId}/results`, { credentials: 'same-origin' }).catch(() => null),
            fetch(`/api/v1/students/${studentId}/tutor-state`, { credentials: 'same-origin' }).catch(() => null),
            fetch(`/api/v1/students/${studentId}/certificates`, { credentials: 'same-origin' }).catch(() => null),
            fetch(`/api/v1/students/${studentId}/onboarding`, { credentials: 'same-origin' }).catch(() => null)
          ]);

          const dashboard = dashRes && dashRes.ok ? await dashRes.json() : null;
          const progress = progRes && progRes.ok ? await progRes.json() : null;
          const results = resRes && resRes.ok ? await resRes.json() : null;
          const tutorState = tutorRes && tutorRes.ok ? await tutorRes.json() : null;
          const certificates = certsRes && certsRes.ok ? await certsRes.json() : null;
          const onboarding = onbRes && onbRes.ok ? await onbRes.json() : null;

          setStudentData({
            dashboard,
            progress: progress || (dashboard && dashboard.progress),
            results: results || (dashboard && dashboard.results),
            tutorState: tutorState || (dashboard && dashboard.mood),
            certificates: (certificates && (certificates.certificates || certificates)) || (dashboard && dashboard.certificates) || [],
            onboarding
          });
        }
      } catch (err) {
        console.error('Error fetching student data:', err);
        setError(err.message || 'Failed to load student dashboard');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCompleteTour = async () => {
    if (!user) return;
    const studentId = user.id || user.student_id;
    if (!studentId) return;

    setDismissingTour(true);
    try {
      const res = await fetch(`/api/v1/students/${studentId}/onboarding`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tour_completed: true })
      });
      if (res.ok) {
        setStudentData((prev) => ({
          ...prev,
          onboarding: { ...prev.onboarding, tour_completed: true }
        }));
      }
    } catch (err) {
      console.error('Failed to update onboarding:', err);
    } finally {
      setDismissingTour(false);
    }
  };

  const recordProgressEvent = async (lessonId) => {
    try {
      await fetch('/api/v1/progress/events', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'lesson_completed',
          lesson_id: lessonId || '33333333-3333-4333-8333-333333333333'
        })
      });
    } catch (err) {
      console.error('Failed to record progress event:', err);
    }
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getFirstName = (name) => {
    if (!name) return 'Student';
    return name.split(' ')[0];
  };

  const getMoodBadge = (emotion) => {
    switch (emotion) {
      case 'adorable':
        return { text: '🔥 On a roll', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'worried':
        return { text: '🌱 Let us catch up', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      case 'intense':
        return { text: '⏱️ Focus time', className: 'bg-red-500/10 text-red-400 border-red-500/20' };
      default:
        return { text: '🌟 Ready to learn', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
    }
  };

  const moodInfo = getMoodBadge(studentData.tutorState?.emotion || studentData.dashboard?.mood?.emotion);
  const overallProg = studentData.progress?.overall_percent ?? studentData.dashboard?.progress?.overall_percent ?? 0;
  const avgScore = studentData.results?.summary?.average_percent ?? studentData.dashboard?.results?.summary?.average_percent ?? 0;
  const recentResults = studentData.results?.results || studentData.dashboard?.results?.results || [];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-500/20 antialiased font-sans flex flex-col relative overflow-hidden">
      {/* Navigation Header */}
      <header className="border-b border-neutral-800 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/home" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white text-sm font-black">B</span>
              <span>Bearilly Student</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="/home" className="text-white hover:text-red-400 transition-colors">Home</Link>
            <Link href="/tasks" className="text-neutral-400 hover:text-white transition-colors">Tasks & Quizzes</Link>
            <Link href="/dashboard/certificates" className="text-neutral-400 hover:text-white transition-colors">Certificates</Link>
            <Link href="/welcome" className="text-neutral-400 hover:text-white transition-colors">Onboarding</Link>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <span className="text-sm text-neutral-400">{user?.full_name || 'Loading...'}</span>
            <div className="w-8 h-8 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 flex items-center justify-center font-bold text-xs">
              {getFirstName(user?.full_name).slice(0, 2).toUpperCase()}
            </div>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-neutral-400 hover:text-white"
            aria-label="Toggle Navigation"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-b border-neutral-800 bg-neutral-900/95 px-4 pt-2 pb-4 space-y-2">
            <Link href="/home" className="block py-2 text-white font-medium">Home</Link>
            <Link href="/tasks" className="block py-2 text-neutral-400 hover:text-white">Tasks & Quizzes</Link>
            <Link href="/dashboard/certificates" className="block py-2 text-neutral-400 hover:text-white">Certificates</Link>
            <Link href="/welcome" className="block py-2 text-neutral-400 hover:text-white">Onboarding</Link>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Onboarding Tour Banner */}
        {studentData.onboarding && !studentData.onboarding.tour_completed && (
          <div className="bg-gradient-to-r from-red-950/60 to-neutral-900 border border-red-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-red-400">Welcome Tour</span>
              <h3 className="text-lg font-bold text-white mt-1">Get started with your Bearilly learning experience</h3>
              <p className="text-sm text-neutral-400 mt-1">Take a quick walkthrough to explore your personalized dashboard and study tools.</p>
            </div>
            <button
              onClick={handleCompleteTour}
              disabled={dismissingTour}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold text-sm rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
            >
              {dismissingTour ? 'Saving...' : 'Got it! Complete Tour'}
            </button>
          </div>
        )}

        {/* Hero Greeting Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800/80">
          <div>
            <p className="text-neutral-400 text-sm font-medium">{getTimeGreeting()},</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1 flex items-center gap-3">
              <span>{getFirstName(user?.full_name)}</span>
              <span className="text-2xl sm:text-3xl">👋</span>
            </h1>
          </div>
          {moodInfo && (
            <div className={`px-3 py-1.5 rounded-full border text-xs font-medium self-start sm:self-center ${moodInfo.className}`}>
              {moodInfo.text}
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            <div className="h-40 bg-neutral-900 rounded-2xl col-span-2"></div>
            <div className="h-40 bg-neutral-900 rounded-2xl"></div>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-950/40 border border-red-800/50 rounded-2xl text-red-400 text-center">
            <p className="font-semibold">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-1.5 bg-red-600/20 border border-red-500/40 hover:bg-red-600/30 text-white rounded-lg text-sm"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Continue Learning Main Card */}
              <div className="lg:col-span-2 bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between hover:border-neutral-700 transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-red-500">Continue Learning</span>
                    <span className="text-xs text-neutral-400 font-mono">{overallProg}% Overall</span>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">
                    📚 Software Engineering & Core Curriculum
                  </h2>
                  <p className="text-sm text-neutral-400 mb-6">
                    Pick up where you left off in your assigned courses and practice sessions.
                  </p>
                </div>

                <div>
                  <div className="w-full bg-neutral-800 rounded-full h-2.5 mb-4 overflow-hidden">
                    <div
                      className="bg-red-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, overallProg))}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-400">Track your daily study streak</span>
                    <button
                      onClick={() => recordProgressEvent()}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                      Resume Learning →
                    </button>
                  </div>
                </div>
              </div>

              {/* AI Tutor Assistant Card */}
              <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-amber-400 mb-3">
                    <span className="text-xl">🐻</span>
                    <span className="text-xs font-bold uppercase tracking-wider">AI Bear Tutor</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">✨ Ask anything</h3>
                  <p className="text-sm text-neutral-400 italic">
                    “Explain complex concepts, get instant hints, or request a quick quiz practice session.”
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-800/60 flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Powered by Bearilly Tutor</span>
                  <Link
                    href="/tasks"
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    Start Session &rrarr;
                  </Link>
                </div>
              </div>
            </div>

            {/* Metrics Overview Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-5">
                <span className="text-xs text-neutral-400 font-medium">Overall Progress</span>
                <p className="text-3xl font-extrabold text-white mt-2">{overallProg}%</p>
                <p className="text-xs text-neutral-500 mt-1">Across all assigned modules</p>
              </div>

              <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-5">
                <span className="text-xs text-neutral-400 font-medium font-sans">Average Quiz Score</span>
                <p className="text-3xl font-extrabold text-emerald-400 mt-2">{avgScore}%</p>
                <p className="text-xs text-neutral-500 mt-1">Based on recent completed tests</p>
              </div>

              <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-neutral-400 font-medium">Earned Certificates</span>
                  <p className="text-3xl font-extrabold text-white mt-2">
                    {studentData.certificates?.length || 0}
                  </p>
                </div>
                <Link
                  href="/dashboard/certificates"
                  className="text-xs font-semibold text-red-400 hover:text-red-300 mt-3 inline-block"
                >
                  View Certificates &rarr;
                </Link>
              </div>
            </div>

            {/* Recent Quiz Scores Section */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Recent Quiz Performance</h3>
                  <p className="text-xs text-neutral-400">Summary of your latest module evaluation scores</p>
                </div>
                <Link href="/tasks" className="text-xs font-semibold text-red-400 hover:text-red-300">
                  View All Tasks
                </Link>
              </div>

              {recentResults.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 text-sm">
                  No recent quiz scores found. Complete your first quiz in the tasks tab!
                </div>
              ) : (
                <div className="space-y-4">
                  {recentResults.slice(0, 5).map((item, idx) => (
                    <div key={item.id || idx} className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-neutral-800 text-neutral-300 font-mono text-xs flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-white">{item.title || item.quiz_title || 'Module Evaluation'}</p>
                          <p className="text-xs text-neutral-500">{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Completed'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-bold ${item.score_percent >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {item.score_percent ?? item.score ?? 0}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}