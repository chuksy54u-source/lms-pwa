'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [me, setMe] = useState(null);
  const [school, setSchool] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // 1. Get current authenticated user session
        const meRes = await fetch('/api/v1/auth/me', { credentials: 'same-origin' });
        if (!meRes.ok) throw new Error('Failed to load session');
        const meData = await meRes.json();
        setMe(meData);

        const schoolId = meData.school_id || (meData.school && meData.school.id);
        if (!schoolId) throw new Error('No school associated with this account');

        // 2. Fetch Dashboard Stats and School Info in parallel
        const [dashRes, infoRes] = await Promise.all([
          fetch(`/api/v1/schools/${encodeURIComponent(schoolId)}/dashboard`, { credentials: 'same-origin' }),
          fetch(`/api/v1/schools/${encodeURIComponent(schoolId)}`, { credentials: 'same-origin' })
        ]);

        if (dashRes.ok) {
          const dData = await dashRes.json();
          setDashboardData(dData);
        }
        
        if (infoRes.ok) {
          const iData = await infoRes.json();
          setSchoolInfo(iData);
          setSchool(iData);
        }

      } catch (err) {
        console.error('Dashboard load error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const pct = (val) => (val ? `${Math.round(val * 100)}%` : '0%');
  const firstName = (name) => name ? name.split(' ')[0] : 'Admin';
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const setupRequired = me?.role === 'school_admin' && me.school?.status === 'setup' && !me.school?.setup_completed_at;
  const summary = dashboardData?.summary;
  const needingHelp = (dashboardData?.students || []).filter(s => s.needs_help);
  const inviteLink = schoolInfo?.invite_code && typeof window !== 'undefined' 
    ? `${window.location.origin}/register?code=${encodeURIComponent(schoolInfo.invite_code)}` 
    : '';

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-sans">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-zinc-400">Loading school dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-sans p-6">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-8 rounded-2xl text-center">
          <h2 className="text-2xl font-bold mb-4">Unable to load dashboard</h2>
          <p className="text-zinc-400 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-500/20 antialiased font-sans flex flex-col relative overflow-hidden">
      
      {/* Navigation - Preserving School Design */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-tighter flex items-center gap-2">
            <span className="bg-red-600 w-8 h-8 rounded flex items-center justify-center text-sm">B</span>
            <span>{school?.name || 'SCHOOL'}</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="/admin" className="text-sm font-medium text-red-500">Overview</Link>
            <Link href="/admin/students" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Students</Link>
            <Link href="/staff/courses" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Courses</Link>
            <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold">
              {me?.full_name?.charAt(0) || 'A'}
            </div>
          </div>

          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto px-6 py-12 w-full">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-slide-up">
          <div>
            <p className="text-red-500 font-bold tracking-widest uppercase text-xs mb-2">{school?.name || 'School Admin'}</p>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
              {greeting()}, {firstName(me?.full_name)}
            </h1>
            <p className="text-zinc-400 text-lg">Here is how your school is learning.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/students?add=1" className="bg-white text-black px-6 py-3 rounded-full font-bold text-sm hover:bg-zinc-200 transition-all flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add students
            </Link>
            <Link href="/staff/courses" className="bg-zinc-900 border border-zinc-800 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-zinc-800 transition-all flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              Courses
            </Link>
          </div>
        </div>

        {/* Setup Alert */}
        {setupRequired && (
          <div className="bg-red-600/10 border border-red-500/20 rounded-2xl p-6 mb-12 flex flex-col md:flex-row items-center gap-6 animate-slide-up">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
            </div>
            <div className="flex-grow text-center md:text-left">
              <h3 className="text-xl font-bold mb-1">Finish setting up {school?.name || 'your school'}</h3>
              <p className="text-zinc-400">Add your logo and colours, name your bear, and switch on courses. The bear will guide you.</p>
            </div>
            <Link href="/admin/setup" className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold transition-colors whitespace-nowrap">
              Open setup guide
            </Link>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-wider mb-1">Active learners</p>
            <p className="text-4xl font-black">{summary?.students || 0}</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-wider mb-1">Student slots used</p>
            <p className="text-4xl font-black">
              {summary?.slots_limit ? `${summary.slots_used} / ${summary.slots_limit}` : summary?.slots_used || 0}
            </p>
            <p className="text-xs text-zinc-500 mt-2">
              {summary?.slots_limit ? `${Math.round((summary.slots_used / summary.slots_limit) * 100)}% used` : 'No slot limit until billing starts'}
            </p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-wider mb-1">Average score</p>
            <p className="text-4xl font-black text-emerald-500">{pct(summary?.average_score)}</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-wider mb-1">Need help</p>
            <p className={`text-4xl font-black ${summary?.students_needing_help > 0 ? 'text-red-500' : 'text-zinc-400'}`}>
              {summary?.students_needing_help || 0}
            </p>
            <p className="text-xs text-zinc-500 mt-2">Low or falling scores</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
          {/* Learners Needing Help */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black tracking-tight">Learners needing help</h2>
            </div>
            
            {needingHelp.length === 0 ? (
              <div className="bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <p className="text-zinc-400 font-medium">Nobody is struggling right now. 🎉</p>
              </div>
            ) : (
              <div className="space-y-3">
                {needingHelp.map((student) => (
                  <Link key={student.id} href={`/staff/students/${student.id}`} className="flex items-center gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-red-500/50 transition-colors group">
                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-400 group-hover:bg-red-600 group-hover:text-white transition-colors">
                      {student.full_name.charAt(0)}
                    </div>
                    <div className="flex-grow">
                      <p className="font-bold">{student.full_name}</p>
                      <p className="text-xs text-zinc-500">
                        Latest {pct(student.latest_score)} · average {pct(student.average_score)}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      student.mood === 'happy' ? 'bg-emerald-500/10 text-emerald-500' : 
                      student.mood === 'sad' ? 'bg-red-500/10 text-red-500' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {student.mood || 'neutral'}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Invite Students */}
          <div>
            <h2 className="text-2xl font-black tracking-tight mb-6">Invite students</h2>
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
              <p className="text-sm text-zinc-400 mb-6">Students sign themselves up with this link. It carries your school's invite code.</p>
              
              {schoolInfo ? (
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">Invite Link</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        readOnly 
                        value={inviteLink} 
                        className="bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs flex-grow font-mono text-zinc-400"
                      />
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(inviteLink);
                          alert('Link copied to clipboard');
                        }}
                        className="bg-zinc-800 hover:bg-zinc-700 p-2 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">Invite Code</label>
                    <span className="bg-red-600/20 text-red-500 px-3 py-1 rounded-md font-mono font-bold text-sm border border-red-500/20">
                      {schoolInfo.invite_code}
                    </span>
                  </div>

                  <Link href="/admin/students" className="inline-flex items-center gap-2 text-sm font-bold text-white hover:text-red-500 transition-colors pt-4 border-t border-zinc-800 w-full">
                    Or add students yourself
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </Link>
                </div>
              ) : (
                <div className="animate-pulse space-y-4">
                  <div className="h-10 bg-zinc-800 rounded-lg"></div>
                  <div className="h-6 w-24 bg-zinc-800 rounded-lg"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* All Learners Table */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black tracking-tight">All learners</h2>
            <Link href="/admin/students" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">View all</Link>
          </div>
          
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Student</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Avg Score</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Latest</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Mood</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {(dashboardData?.students || []).slice(0, 10).map((student) => (
                    <tr key={student.id} className="hover:bg-zinc-800/30 transition-colors cursor-pointer" onClick={() => window.location.href = `/staff/students/${student.id}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold">
                            {student.full_name.charAt(0)}
                          </div>
                          <span className="font-bold text-sm">{student.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {student.needs_help ? (
                          <span className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 px-2 py-1 rounded">Needs Help</span>
                        ) : (
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">On Track</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-sm">{pct(student.average_score)}</td>
                      <td className="px-6 py-4 font-mono text-sm">{pct(student.latest_score)}</td>
                      <td className="px-6 py-4">
                        <span className="text-lg">{student.mood === 'happy' ? '😊' : student.mood === 'sad' ? '😟' : '😐'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(!dashboardData?.students || dashboardData.students.length === 0) && (
              <div className="p-12 text-center text-zinc-500">
                No students enrolled yet.
              </div>
            )}
          </div>
        </div>

      </main>

      {/* Footer - Preserving School Design */}
      <footer className="bg-black border-t border-zinc-900 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} {school?.name || 'School'}. Powered by Bearilly.
          </div>
          <div className="flex gap-8">
            <Link href="/about" className="text-zinc-500 hover:text-white text-sm transition-colors">About</Link>
            <Link href="/programs" className="text-zinc-500 hover:text-white text-sm transition-colors">Programs</Link>
            <Link href="/contact" className="text-zinc-500 hover:text-white text-sm transition-colors">Contact</Link>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes slideUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slideUp 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}