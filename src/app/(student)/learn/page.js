'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Learn() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [enrolments, setEnrolments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [joining, setJoining] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [coursesRes, enrolmentsRes] = await Promise.all([
          fetch('/api/v1/courses', { credentials: 'same-origin' }),
          fetch('/api/v1/enrolments', { credentials: 'same-origin' })
        ]);

        if (coursesRes.ok && enrolmentsRes.ok) {
          const coursesData = await coursesRes.json();
          const enrolmentsData = await enrolmentsRes.json();
          setCourses(coursesData);
          setEnrolments(enrolmentsData);
        }
      } catch (error) {
        console.error('Failed to fetch learning data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getProgress = (courseId) => {
    const enrolment = enrolments.find(e => e.course_id === courseId);
    return enrolment ? {
      percent: enrolment.progress_percent || 0,
      lessons_completed: enrolment.lessons_completed || 0,
      lessons_total: enrolment.lessons_total || 0,
      enrolled: true
    } : { percent: 0, lessons_completed: 0, lessons_total: 0, enrolled: false };
  };

  const match = (c) => !q.trim() || `${c.title} ${c.description || ''} ${c.level || ''}`.toLowerCase().includes(q.trim().toLowerCase());
  
  const allMapped = courses.map(c => ({ ...c, p: getProgress(c.id) }));
  const mine = allMapped.filter(c => c.p.enrolled).filter(match);
  const others = allMapped.filter(c => !c.p.enrolled).filter(match);
  
  const shown = mine.filter(c => {
    if (filter === 'done') return c.p.percent >= 100;
    if (filter === 'progress') return c.p.percent < 100;
    return true;
  });

  async function handleJoin(courseId, title) {
    setJoining(courseId);
    try {
      const response = await fetch('/api/v1/enrolments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_id: courseId }),
        credentials: 'same-origin'
      });

      if (response.ok) {
        router.push(`/learn/${courseId}`);
      } else {
        throw new Error('Failed to enrol');
      }
    } catch (err) {
      console.error('Enrolment error:', err);
      setJoining(null);
    }
  }

  const getSubjectEmoji = (title) => {
    const t = title.toLowerCase();
    if (t.includes('software') || t.includes('code') || t.includes('programming')) return '💻';
    if (t.includes('design') || t.includes('art')) return '🎨';
    if (t.includes('business') || t.includes('management')) return '📈';
    if (t.includes('data') || t.includes('science')) return '🧪';
    return '📚';
  };

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
        .course-card {
          transition: all 300ms ease;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .course-card:hover {
          border-color: rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.05);
        }
      `}} />

      {/* Navigation - Preserving School Design */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tighter hover:opacity-80 transition-opacity">
            SCHOOL<span className="text-red-600">NAME</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="/learn" className="text-sm font-medium text-white">My Learning</Link>
            <Link href="/programs" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Programs</Link>
            <Link href="/dashboard" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Dashboard</Link>
          </div>

          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <div className="w-6 h-0.5 bg-white mb-1.5"></div>
            <div className="w-6 h-0.5 bg-white mb-1.5"></div>
            <div className="w-6 h-0.5 bg-white"></div>
          </button>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto px-6 py-12 w-full">
        <header className="mb-12 animate-slide-up">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">My Courses</h1>
          <p className="text-zinc-400 text-lg max-w-2xl">Continue your journey through the Faculty of Software Engineering & Development.</p>
        </header>

        {/* Search and Filters */}
        <div className="flex flex-col md:row md:items-center gap-6 mb-12 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="relative flex-grow max-w-md">
            <input 
              type="text"
              placeholder="Search your courses..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full bg-zinc-900/50 border border-white/10 rounded-full px-6 py-3 text-white focus:outline-none focus:border-red-500/50 transition-colors"
            />
          </div>
          
          <div className="flex gap-2 p-1 bg-zinc-900/50 border border-white/10 rounded-full w-fit">
            {[
              { id: 'all', label: 'All', count: mine.length },
              { id: 'progress', label: 'In Progress', count: mine.filter(c => c.p.percent < 100).length },
              { id: 'done', label: 'Completed', count: mine.filter(c => c.p.percent >= 100).length }
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setFilter(opt.id)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === opt.id ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {opt.label} {opt.count > 0 && <span className="ml-1 opacity-50">({opt.count})</span>}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-zinc-900/30 rounded-2xl animate-pulse border border-white/5"></div>
            ))}
          </div>
        ) : (
          <>
            {shown.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl animate-slide-up">
                <p className="text-zinc-500 text-lg">
                  {q ? 'No courses match your search.' : filter === 'done' ? 'You haven\'t completed any courses yet.' : 'No courses found in this category.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
                {shown.map((c) => (
                  <Link 
                    key={c.id} 
                    href={`/learn/${c.id}`}
                    className="course-card group bg-zinc-900/40 rounded-2xl p-6 flex flex-col"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-4xl" role="img" aria-label="course icon">
                        {getSubjectEmoji(c.title)}
                      </span>
                      {c.p.percent >= 100 && (
                        <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/20">
                          COMPLETED
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2 group-hover:text-red-500 transition-colors">{c.title}</h3>
                    <p className="text-zinc-400 text-sm mb-6 line-clamp-2 flex-grow">{c.description}</p>
                    
                    <div className="mt-auto">
                      <div className="flex justify-between text-xs font-medium mb-2">
                        <span className="text-zinc-500">
                          {c.p.percent >= 100 ? 'Finished' : `Lesson ${Math.min(c.p.lessons_completed + 1, c.p.lessons_total || c.lessons || 1)} of ${c.p.lessons_total || c.lessons}`}
                        </span>
                        <span className={c.p.percent >= 100 ? 'text-emerald-400' : 'text-white'}>
                          {Math.round(c.p.percent)}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${c.p.percent >= 100 ? 'bg-emerald-500' : 'bg-red-600'}`}
                          style={{ width: `${c.p.percent}%` }}
                        ></div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {others.length > 0 && (
              <section className="mt-24 animate-slide-up" style={{ animationDelay: '300ms' }}>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold tracking-tight">Available Programs</h2>
                  <Link href="/programs" className="text-sm text-zinc-400 hover:text-white transition-colors">View Catalogue →</Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {others.slice(0, 4).map((c) => (
                    <div key={c.id} className="course-card bg-zinc-900/20 rounded-2xl p-6 flex items-center gap-6">
                      <span className="text-3xl opacity-50">{getSubjectEmoji(c.title)}</span>
                      <div className="flex-grow">
                        <h4 className="font-bold">{c.title}</h4>
                        <p className="text-xs text-zinc-500">{c.lessons} lessons {c.level ? `· ${c.level}` : ''}</p>
                      </div>
                      <button 
                        onClick={() => handleJoin(c.id, c.title)}
                        disabled={joining === c.id}
                        className="px-6 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                      >
                        {joining === c.id ? 'Joining...' : 'Join'}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* Footer - Preserving School Design */}
      <footer className="border-t border-white/10 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} SCHOOLNAME. Powered by Bearilly.
          </div>
          <div className="flex gap-8">
            <Link href="/support" className="text-zinc-500 hover:text-white text-sm transition-colors">Support</Link>
            <Link href="/privacy" className="text-zinc-500 hover:text-white text-sm transition-colors">Privacy</Link>
            <Link href="/terms" className="text-zinc-500 hover:text-white text-sm transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}