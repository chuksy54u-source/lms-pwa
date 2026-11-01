'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function StudentGradesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, coursesRes, assignRes] = await Promise.all([
        fetch('/api/v1/student/dashboard', { credentials: 'same-origin' }).catch(() => null),
        fetch('/api/v1/courses', { credentials: 'same-origin' }).catch(() => null),
        fetch('/api/v1/assignments', { credentials: 'same-origin' }).catch(() => null),
      ]);

      if (dashRes && dashRes.ok) {
        const dData = await dashRes.json();
        setDashboardData(dData);
      }
      if (coursesRes && coursesRes.ok) {
        const cData = await coursesRes.json();
        setCourses(Array.isArray(cData) ? cData : cData.courses || []);
      }
      if (assignRes && assignRes.ok) {
        const aData = await assignRes.json();
        setAssignments(Array.isArray(aData) ? aData : aData.assignments || []);
      }
    } catch (err) {
      console.error('Failed to load grades data:', err);
      setError('Unable to load your grades. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const results = dashboardData?.results?.results || dashboardData?.results || [];
  const graded = results.filter((r) => r.status === 'graded' && r.percent != null);

  const courseTitleMap = Object.fromEntries(
    courses.map((c) => [c.id, c.title || c.name || 'Course'])
  );

  const best = {};
  graded.forEach((r) => {
    if (!best[r.assessment_id] || r.percent > best[r.assessment_id].percent) {
      best[r.assessment_id] = r;
    }
  });

  const perCourse = {};
  Object.values(best).forEach((r) => {
    const cid = r.course_id || 'general';
    (perCourse[cid] = perCourse[cid] || []).push(r.percent);
  });

  const courseRows = Object.entries(perCourse).map(([id, list]) => ({
    id,
    title: courseTitleMap[id] || 'Course Performance',
    avg: list.reduce((a, b) => a + b, 0) / list.length,
    quizzes: list.length,
  }));

  const overall = courseRows.length
    ? courseRows.reduce((a, c) => a + c.avg, 0) / courseRows.length
    : null;

  const passMark = dashboardData?.pass_mark || 70;

  const comments = assignments.filter((a) => a.feedback || a.comment);

  const getGradeLabel = (percent) => {
    if (percent == null) return 'N/A';
    if (percent >= 90) return 'A';
    if (percent >= 80) return 'B';
    if (percent >= 70) return 'C';
    if (percent >= 60) return 'D';
    return 'F';
  };

  const formatPct = (val) => (val != null ? `${Math.round(val)}%` : '—');

  const formatRelTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-500/20 antialiased font-sans flex flex-col relative overflow-hidden">
      {/* Background visual accents */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[125px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[125px]" />
      </div>

      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-wider text-white">STUDENT PORTAL</span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/tasks" className="text-neutral-400 hover:text-white transition-colors text-sm font-medium">
                Tasks
              </Link>
              <Link href="/tasks/grades" className="text-white text-sm font-medium border-b-2 border-red-500 pb-1">
                My Grades
              </Link>
              <Link href="/programs" className="text-neutral-400 hover:text-white transition-colors text-sm font-medium">
                Programs
              </Link>
              <Link href="/contact" className="text-neutral-400 hover:text-white transition-colors text-sm font-medium">
                Support
              </Link>
            </nav>

            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-neutral-400 hover:text-white p-2"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-b border-neutral-800 bg-black/95 px-4 pt-2 pb-4 space-y-2">
            <Link href="/tasks" className="block text-neutral-400 hover:text-white py-2 text-base font-medium">
              Tasks
            </Link>
            <Link href="/tasks/grades" className="block text-white py-2 text-base font-medium">
              My Grades
            </Link>
            <Link href="/programs" className="block text-neutral-400 hover:text-white py-2 text-base font-medium">
              Programs
            </Link>
            <Link href="/contact" className="block text-neutral-400 hover:text-white py-2 text-base font-medium">
              Support
            </Link>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12" id="main">
        <div className="mb-6">
          <Link href="/tasks" className="inline-flex items-center text-sm text-neutral-400 hover:text-white transition-colors mb-4">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Tasks
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">My grades</h1>
          <p className="mt-2 text-neutral-400 text-sm sm:text-base">
            Track your academic progress, course averages, and assessment feedback.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="h-44 bg-neutral-900/60 rounded-2xl animate-pulse border border-neutral-800" />
            <div className="h-28 bg-neutral-900/60 rounded-2xl animate-pulse border border-neutral-800" />
            <div className="h-28 bg-neutral-900/60 rounded-2xl animate-pulse border border-neutral-800" />
          </div>
        ) : error ? (
          <div className="bg-neutral-900/80 border border-red-500/30 rounded-2xl p-8 text-center backdrop-blur-sm">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Failed to load grades</h3>
            <p className="text-neutral-400 text-sm mb-6 max-w-md mx-auto">{error}</p>
            <button
              onClick={fetchData}
              className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-sm font-semibold transition-colors border border-neutral-700"
            >
              Try Again
            </button>
          </div>
        ) : graded.length === 0 ? (
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-10 text-center backdrop-blur-sm">
            <div className="w-16 h-16 rounded-full bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No grades yet</h2>
            <p className="text-neutral-400 text-sm max-w-md mx-auto mb-6">
              Complete your assigned tasks and quizzes to view your grades and feedback here.
            </p>
            <Link
              href="/tasks"
              className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-red-600/20"
            >
              Go to tasks
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall Score Card */}
            <div className="bg-gradient-to-br from-neutral-900/90 via-neutral-900/60 to-neutral-900/40 border border-neutral-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-1">Overall Grade</p>
                  <p className="text-4xl sm:text-5xl font-black text-white tracking-tight">{getGradeLabel(overall)}</p>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-emerald-400">{formatPct(overall)}</p>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-neutral-800 rounded-full h-3 mb-4 overflow-hidden p-0.5 border border-neutral-700/50">
                <div
                  className="bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, overall || 0))}%` }}
                />
              </div>

              <p className="text-xs sm:text-sm text-neutral-400">
                Best score on each quiz, averaged per course. Pass mark is {passMark}%.
              </p>
            </div>

            {/* Course breakdown */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white tracking-tight">Course Performance</h2>
              {courseRows.map((c) => (
                <div key={c.id} className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5 sm:p-6 backdrop-blur-sm hover:border-neutral-700 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-white text-base sm:text-lg">{c.title}</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      c.avg >= passMark
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {getGradeLabel(c.avg)}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-400 mb-3">
                    {formatPct(c.avg)} · {c.quizzes} quiz{c.quizzes === 1 ? '' : 'zes'}
                  </p>
                  <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        c.avg >= passMark ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, c.avg || 0))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Teacher comments */}
            {comments.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white tracking-tight">Instructor Feedback</h2>
                {comments.map((a, idx) => (
                  <div key={a.id || idx} className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5 sm:p-6 backdrop-blur-sm">
                    <p className="font-medium text-white text-sm sm:text-base flex items-center mb-2">
                      <span className="mr-2">💬</span> {a.teacher || a.instructor || 'Instructor'}
                    </p>
                    <p className="text-sm text-neutral-300 italic mb-3">“{a.feedback || a.comment}”</p>
                    <p className="text-xs text-neutral-500 font-medium">{a.title || a.assignment_name}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Recent Results */}
            <div className="space-y-4 pt-4">
              <h2 className="text-xl font-bold text-white tracking-tight">Recent Results</h2>
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl divide-y divide-neutral-800/60 overflow-hidden">
                {results.map((r, idx) => (
                  <div key={r.submission_id || idx} className="p-4 sm:p-5 flex items-center justify-between hover:bg-neutral-800/30 transition-colors">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                        r.status !== 'graded'
                          ? 'bg-neutral-800 text-neutral-400'
                          : r.passed !== false && (r.percent == null || r.percent >= passMark)
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {r.status !== 'graded' ? '⏳' : r.passed !== false && (r.percent == null || r.percent >= passMark) ? '✓' : '↺'}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm sm:text-base">{r.assessment_title || r.title || 'Assessment'}</p>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          Attempt {r.attempt || 1} {r.submitted_at ? `· ${formatRelTime(r.submitted_at)}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm sm:text-base text-white">
                        {r.status === 'graded' ? formatPct(r.percent) : 'Marking'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800 bg-black mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} School Academic System. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link href="/privacy" className="hover:text-neutral-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-neutral-400 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}