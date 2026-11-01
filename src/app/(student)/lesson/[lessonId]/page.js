'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// Bearilly Integration Hooks & Helpers
// These are assumed to be provided by the school's integration layer
// following the Bearilly Browser Transport Contract.
const useApi = (url) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!url) return;
    try {
      const res = await fetch(url, { credentials: 'same-origin' });
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [url]);

  return { data, error, loading, reload: load };
};

const apiPost = async (url, body) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'same-origin',
  });
  if (!res.ok) throw new Error('Action failed');
  return res.json();
};

// Mocking Bear context for the school's UI - in a real migration, 
// this would come from a shared BearProvider.
const useBear = () => {
  return {
    explainLesson: (l) => console.log('Bear explaining:', l.title),
    stopPointing: () => {},
    sayKey: (key) => console.log('Bear saying:', key),
    setContext: (ctx) => console.log('Bear context:', ctx),
    ask: async (q) => console.log('Bear answering:', q),
    openAsk: () => console.log('Opening Bear chat'),
  };
};

export default function Lesson() {
  const { lessonId } = useParams();
  const router = useRouter();
  const bear = useBear();
  
  const lesson = useApi(`/api/v1/lessons/${encodeURIComponent(lessonId)}`);
  const l = lesson.data;
  const units = useApi(l ? `/api/v1/courses/${encodeURIComponent(l.course_id)}/units` : null);
  const course = useApi(l ? `/api/v1/courses/${encodeURIComponent(l.course_id)}` : null);
  
  const [finishing, setFinishing] = useState(false);
  const [summarising, setSummarising] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const opened = useRef(null);

  useEffect(() => {
    if (!l || opened.current === l.id) return;
    opened.current = l.id;
    bear.explainLesson(l);
    apiPost('/api/v1/progress/events', { kind: 'lesson_opened', lesson_id: l.id }).catch(() => {});
    return () => bear.stopPointing();
  }, [l, bear]);

  const flat = (units.data || []).flatMap((u) => u.lessons.map((x) => ({ ...x, unit: u.title })));
  const index = flat.findIndex((x) => x.id === lessonId);
  const next = index >= 0 ? flat[index + 1] : null;
  const prev = index > 0 ? flat[index - 1] : null;
  const here = index >= 0 ? flat[index] : null;

  async function finish() {
    setFinishing(true);
    try {
      await apiPost('/api/v1/progress/events', { kind: 'lesson_completed', lesson_id: lessonId });
      bear.sayKey('lessonDone');
      if (next) {
        router.push(`/lesson/${next.id}`);
      } else {
        router.push(`/learn/${l.course_id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFinishing(false);
    }
  }

  async function summarise() {
    setSummarising(true);
    bear.setContext({ courseId: l.course_id, lessonId: l.id, lessonTitle: l.title });
    await bear.ask('Summarise this lesson in three short points.');
    setSummarising(false);
  }

  if (lesson.loading && !l) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse text-xl font-light tracking-widest">LOADING LESSON...</div>
      </div>
    );
  }

  if (lesson.error && !l) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold mb-4">Could not open this lesson</h1>
        <p className="text-white/60 mb-8 text-center max-w-md">There was an error loading the content. Please ensure you are enrolled in this course.</p>
        <Link href="/programs" className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-red-500 hover:text-white transition-all">
          Back to Programs
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
        .lesson-rich-content h2 { font-size: 1.875rem; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; }
        .lesson-rich-content p { margin-bottom: 1.5rem; color: rgba(255,255,255,0.8); line-height: 1.75; }
        .lesson-rich-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.5rem; color: rgba(255,255,255,0.8); }
        .lesson-rich-content li { margin-bottom: 0.5rem; }
      `}} />

      {/* Navigation - Preserving School Design */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-8">
              <Link href="/" className="group flex items-center gap-3">
                <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                  <span className="text-white font-black text-xl">B</span>
                </div>
                <span className="text-xl font-black tracking-tighter uppercase">Bearilly Academy</span>
              </Link>
              <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white/60">
                <Link href={l ? `/learn/${l.course_id}` : '/programs'} className="hover:text-white transition-colors">
                  {course.data ? course.data.title.split(':')[0] : 'Course'}
                </Link>
                <span className="text-white/20">/</span>
                <span className="text-white">Lesson {index >= 0 ? index + 1 : ''}</span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <button onClick={() => bear.openAsk()} className="px-5 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-all text-sm font-bold">
                Ask AI
              </button>
            </div>
            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <div className="w-6 h-0.5 bg-white mb-1.5"></div>
              <div className="w-6 h-0.5 bg-white mb-1.5"></div>
              <div className="w-6 h-0.5 bg-white"></div>
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="animate-slide-up">
          {/* Progress Header */}
          <div className="mb-12">
            <div className="flex justify-between items-end mb-4">
              <div>
                {here && <p className="text-red-500 font-bold uppercase tracking-widest text-xs mb-2">{here.unit}</p>}
                <h1 className="text-4xl md:text-5xl font-black tracking-tight">{l?.title}</h1>
              </div>
              {flat.length > 0 && (
                <div className="text-right hidden sm:block">
                  <span className="text-white/40 text-sm font-medium">Progress</span>
                  <p className="text-xl font-bold">{Math.round(((index + 1) / flat.length) * 100)}%</p>
                </div>
              )}
            </div>
            {flat.length > 0 && (
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-600 transition-all duration-1000 ease-out"
                  style={{ width: `${((index + 1) / flat.length) * 100}%` }}
                ></div>
              </div>
            )}
          </div>

          {/* Bear Explanation Hero */}
          <div className="mb-12 p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm flex flex-col md:flex-row items-center gap-8">
            <div className="w-20 h-20 bg-red-600/20 rounded-2xl flex items-center justify-center text-4xl">
              🐻
            </div>
            <div className="flex-grow text-center md:text-left">
              <h3 className="text-xl font-bold mb-1">Bear explains</h3>
              <p className="text-white/60 text-sm">
                {l?.explanation ? 'Listen to the bear, then read the notes below.' : 'Read the notes below. Tap the bear any time to ask.'}
              </p>
            </div>
            <button 
              onClick={() => bear.explainLesson(l)}
              className="px-8 py-3 rounded-full border border-white/20 hover:bg-white hover:text-black transition-all font-bold text-sm"
            >
              Replay Audio
            </button>
          </div>

          {/* Lesson Content */}
          <article className="mb-16">
            {l?.notes ? (
              <div className="lesson-rich-content" dangerouslySetInnerHTML={{ __html: l.notes }} />
            ) : (
              <div className="py-20 text-center border border-dashed border-white/10 rounded-3xl">
                <p className="text-white/40 italic">This lesson has no notes yet.</p>
              </div>
            )}
          </article>

          {/* AI Interaction Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
            <button 
              onClick={summarise}
              disabled={summarising}
              className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all font-bold disabled:opacity-50"
            >
              <span className="text-xl">✨</span>
              {summarising ? 'Summarising...' : 'Summarise with AI'}
            </button>
            <button 
              onClick={() => { bear.setContext({ courseId: l.course_id, lessonId: l.id, lessonTitle: l.title }); bear.openAsk(); }}
              className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all font-bold"
            >
              <span className="text-xl">💬</span>
              Ask about this lesson
            </button>
          </div>

          {/* Navigation Footer */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-12 border-t border-white/10">
            {prev && (
              <Link 
                href={`/lesson/${prev.id}`}
                className="w-full sm:w-auto px-8 py-4 rounded-full border border-white/10 hover:bg-white/5 transition-all font-bold text-center"
              >
                ← Previous
              </Link>
            )}
            <button 
              onClick={finish}
              disabled={finishing}
              className="w-full flex-grow px-8 py-4 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-xl transition-all disabled:opacity-50"
            >
              {finishing ? 'Saving...' : next ? 'Done · Next Lesson →' : 'Finish Course Lessons ✓'}
            </button>
          </div>
        </div>
      </main>

      {/* Footer - Preserving School Design */}
      <footer className="bg-black border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">B</span>
            </div>
            <span className="font-black uppercase tracking-tighter">Bearilly Academy</span>
          </div>
          <p className="text-white/40 text-sm">© {new Date().getFullYear()} Bearilly Academy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}