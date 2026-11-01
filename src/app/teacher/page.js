'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TeacherPage() {
  const [me, setMe] = useState(null);
  const [loadingMe, setLoadingMe] = useState(true);
  const [dashData, setDashData] = useState(null);
  const [dashLoading, setDashLoading] = useState(true);
  const [dashError, setDashError] = useState(null);
  const [queueData, setQueueData] = useState([]);
  const [queueLoading, setQueueLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch('/api/v1/auth/me', { credentials: 'same-origin' });
        if (res.ok) {
          const data = await res.json();
          setMe(data.user || data);
        } else {
          setMe(null);
        }
      } catch (err) {
        console.error('Failed to fetch user session:', err);
      } finally {
        setLoadingMe(false);
      }
    }
    fetchMe();
  }, []);

  useEffect(() => {
    if (!me?.id) return;

    async function fetchDashboard() {
      setDashLoading(true);
      setDashError(null);
      try {
        const res = await fetch(`/api/v1/teachers/${encodeURIComponent(me.id)}/dashboard`, {
          credentials: 'same-origin'
        });
        if (res.ok) {
          const data = await res.json();
          setDashData(data);
        } else {
          setDashError('Unable to load teacher dashboard data.');
        }
      } catch (err) {
        setDashError('An error occurred while connecting to teacher dashboard services.');
      } finally {
        setDashLoading(false);
      }
    }

    async function fetchQueue() {
      setQueueLoading(true);
      try {
        const res = await fetch('/api/v1/review-queue', {
          credentials: 'same-origin'
        });
        if (res.ok) {
          const data = await res.json();
          setQueueData(Array.isArray(data) ? data : data.items || []);
        }
      } catch (err) {
        console.error('Failed to load review queue:', err);
      } finally {
        setQueueLoading(false);
      }
    }

    fetchDashboard();
    fetchQueue();
  }, [me]);

  const reloadDashboard = async () => {
    if (!me?.id) return;
    setDashLoading(true);
    setDashError(null);
    try {
      const res = await fetch(`/api/v1/teachers/${encodeURIComponent(me.id)}/dashboard`, {
        credentials: 'same-origin'
      });
      if (res.ok) {
        const data = await res.json();
        setDashData(data);
      } else {
        setDashError('Unable to load teacher dashboard data.');
      }
    } catch (err) {
      setDashError('An error occurred while connecting to teacher dashboard services.');
    } finally {
      setDashLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getFirstName = (fullName) => {
    if (!fullName) return 'Teacher';
    return fullName.trim().split(' ')[0];
  };

  const formatPct = (val) => {
    if (val === null || val === undefined || isNaN(val)) return '—';
    return `${Math.round(val)}%`;
  };

  const students = dashData?.students || [];
  const scores = students.map((s) => s.average_score).filter((v) => v !== null && v !== undefined);
  const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
  const helpNeededCount = students.filter((s) => s.needs_help).length;
  const toMarkCount = queueData ? queueData.length : 0;

  const filteredStudents = students.filter((s) =>
    (s.full_name || s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-500/20 antialiased font-sans flex flex-col relative overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-red-600/30">
              B
            </div>
            <span className="font-bold text-xl tracking-tight text-white">Bearilly Institute</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/programs" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Programs
            </Link>
            <Link href="/about" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Contact
            </Link>
            <Link href="/teacher" className="text-sm font-medium text-white font-semibold">
              Teacher Portal
            </Link>
          </nav>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-b border-white/10 bg-black/95 backdrop-blur-xl px-4 pt-2 pb-6 space-y-3">
            <Link href="/programs" className="block py-2 text-base font-medium text-gray-300 hover:text-white">
              Programs
            </Link>
            <Link href="/about" className="block py-2 text-base font-medium text-gray-300 hover:text-white">
              About
            </Link>
            <Link href="/contact" className="block py-2 text-base font-medium text-gray-300 hover:text-white">
              Contact
            </Link>
            <Link href="/teacher" className="block py-2 text-base font-medium text-white font-semibold">
              Teacher Portal
            </Link>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Page Header Header / Banner */}
        <div className="mb-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <span>Teacher Dashboard</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            {getGreeting()}, {getFirstName(me?.full_name)}
          </h1>
          <p className="mt-3 text-lg text-gray-400 max-w-3xl">
            Your learners at a glance. Tap anyone to view detailed progress, review performance, or offer assistance.
          </p>
        </div>

        {/* Dashboard States */}
        {loadingMe || dashLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-neutral-900/60 border border-white/10 rounded-2xl p-6 animate-pulse">
                  <div className="h-4 bg-white/10 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-white/10 rounded w-3/4"></div>
                </div>
              ))}
            </div>
            <div className="h-64 bg-neutral-900/60 border border-white/10 rounded-2xl animate-pulse"></div>
          </div>
        ) : dashError ? (
          <div className="bg-neutral-900/80 border border-red-500/30 rounded-2xl p-8 text-center max-w-2xl mx-auto my-12">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Error Loading Dashboard</h3>
            <p className="text-gray-400 mb-6">{dashError}</p>
            <button
              onClick={reloadDashboard}
              className="inline-flex items-center px-5 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-500 transition-colors shadow-lg shadow-red-600/30"
            >
              Retry Loading
            </button>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-neutral-900/60 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors">
                <div className="text-sm font-medium text-gray-400">Total Learners</div>
                <div className="text-3xl font-bold text-white mt-2">{students.length}</div>
                <div className="text-xs text-gray-500 mt-2">Enrolled in active courses</div>
              </div>

              <div className="bg-neutral-900/60 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors">
                <div className="text-sm font-medium text-gray-400">Class Average</div>
                <div className="text-3xl font-bold text-white mt-2">{formatPct(avgScore)}</div>
                <div className="text-xs text-gray-500 mt-2">Overall learner mastery</div>
              </div>

              <div className="bg-neutral-900/60 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors">
                <div className="text-sm font-medium text-gray-400">Need Help</div>
                <div className={`text-3xl font-bold mt-2 ${helpNeededCount > 0 ? 'text-amber-400' : 'text-white'}`}>
                  {helpNeededCount}
                </div>
                <div className="text-xs text-gray-500 mt-2">Learners requiring guidance</div>
              </div>

              <div className="bg-neutral-900/60 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors flex flex-col justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-400">To Mark</div>
                  <div className={`text-3xl font-bold mt-2 ${toMarkCount > 0 ? 'text-red-400' : 'text-white'}`}>
                    {queueLoading ? '…' : toMarkCount}
                  </div>
                </div>
                <div className="mt-3">
                  <Link
                    href="/staff/review"
                    className="text-xs font-semibold text-red-400 hover:text-red-300 inline-flex items-center space-x-1"
                  >
                    <span>Open marking queue</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* Pending Marking Banner */}
            {toMarkCount > 0 && (
              <div className="bg-gradient-to-r from-red-950/40 via-neutral-900/80 to-neutral-900/80 border border-red-500/30 rounded-2xl p-6 mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {toMarkCount} answer{toMarkCount === 1 ? '' : 's'} waiting for review
                    </h3>
                    <p className="text-sm text-gray-400">
                      Written responses submitted by students that require educator review.
                    </p>
                  </div>
                </div>
                <Link
                  href="/staff/review"
                  className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-500 transition-colors shadow-lg shadow-red-600/30 shrink-0 inline-flex items-center space-x-2"
                >
                  <span>Start marking</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            )}

            {/* Learners Section */}
            <div className="bg-neutral-900/60 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white">All Learners</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Track individual progress, help status, and response metrics.
                  </p>
                </div>
                <div className="relative w-full md:w-72">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search learners..."
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                  />
                  <svg className="w-4 h-4 text-gray-500 absolute right-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {filteredStudents.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
                  <p className="text-gray-400">
                    {searchQuery ? 'No learners matching your query.' : 'No learners registered yet.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        <th className="pb-4 px-4">Learner</th>
                        <th className="pb-4 px-4">Status</th>
                        <th className="pb-4 px-4">Average Score</th>
                        <th className="pb-4 px-4">Needs Help</th>
                        <th className="pb-4 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                      {filteredStudents.map((student) => (
                        <tr key={student.id || student.email} className="hover:bg-white/5 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-9 h-9 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center font-bold text-gray-300">
                                {(student.full_name || student.name || 'S').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-white">
                                  {student.full_name || student.name || 'Learner'}
                                </div>
                                {student.email && (
                                  <div className="text-xs text-gray-400">{student.email}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-800 text-gray-300 border border-white/10">
                              {student.mood || 'Active'}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-medium text-white">
                            {formatPct(student.average_score)}
                          </td>
                          <td className="py-4 px-4">
                            {student.needs_help ? (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                                <span>Needs Help</span>
                              </span>
                            ) : (
                              <span className="text-xs text-gray-500">On Track</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <Link
                              href={`/teacher/learners/${student.id}`}
                              className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors inline-flex items-center space-x-1"
                            >
                              <span>View Details</span>
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>© {new Date().getFullYear()} Bearilly Institute. All rights reserved.</span>
          </div>
          <div className="flex space-x-6 text-sm text-gray-400">
            <Link href="/about" className="hover:text-white transition-colors">
              About
            </Link>
            <Link href="/programs" className="hover:text-white transition-colors">
              Programs
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}