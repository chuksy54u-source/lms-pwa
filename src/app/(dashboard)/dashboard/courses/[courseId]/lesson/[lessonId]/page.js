'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

async function apiGet(url) {
  const res = await fetch(url, { credentials: 'same-origin' });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}

async function apiPost(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('API request failed');
  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}

export default function LessonViewPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { courseId, lessonId } = params;
  const router = useRouter();

  const [course, setCourse] = useState(null);
  const [currentModule, setCurrentModule] = useState(null);
  const [totalModules, setTotalModules] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [hasCompletedCurrent, setHasCompletedCurrent] = useState(false);

  useEffect(() => {
    const fetchLessonNotesAndProgress = async () => {
      setLoading(true);

      try {
        const courseData = await apiGet(`/api/v1/courses/${encodeURIComponent(courseId)}`);
        if (courseData) setCourse(courseData);

        const unitsData = await apiGet(`/api/v1/courses/${encodeURIComponent(courseId)}/units`);
        let flatLessons = [];
        if (Array.isArray(unitsData)) {
          flatLessons = unitsData.flatMap((u) => u.lessons || []);
        }

        setTotalModules(flatLessons.length || 1);

        const targetIndex = parseInt(lessonId, 10) - 1;
        let targetModule = flatLessons[targetIndex] || (flatLessons.length > 0 ? flatLessons[0] : null);

        if (!targetModule && flatLessons.length > 0) {
          targetModule = flatLessons.find((l) => l.id === lessonId);
        }

        const activeLessonId = targetModule?.id || lessonId;
        const fullLesson = await apiGet(`/api/v1/lessons/${encodeURIComponent(activeLessonId)}`);

        const activeModule = fullLesson || targetModule || { id: activeLessonId, title: `Module ${lessonId}` };
        setCurrentModule(activeModule);

        if (activeModule?.id) {
          apiPost('/api/v1/progress/events', {
            kind: 'lesson_opened',
            lesson_id: activeModule.id,
          }).catch(() => {});
        }
      } catch (err) {
        console.error('Error fetching lesson data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonNotesAndProgress();
  }, [courseId, lessonId]);

  const handleMarkCompleteAndContinue = async () => {
    setIsCompleting(true);
    try {
      if (currentModule?.id) {
        await apiPost('/api/v1/progress/events', {
          kind: 'lesson_completed',
          lesson_id: currentModule.id,
        }).catch(() => {});
      }

      setHasCompletedCurrent(true);

      const nextIndex = parseInt(lessonId, 10) + 1;
      if (nextIndex <= totalModules) {
        router.push(`/dashboard/courses/${courseId}/lesson/${nextIndex}`);
      } else {
        router.push(`/dashboard/courses/${courseId}?status=completed`);
      }
    } catch (err) {
      console.error("Error saving progression checkpoint:", err.message);
    } finally {
      setIsCompleting(false);
    }
  };

  if (loading) return <div className="p-8 text-xs text-slate-400 font-mono min-h-screen bg-[#07070a]">Streaming module document parameters...</div>;

  const activeDocumentUrl = currentModule?.module_notes_url || currentModule?.notes_url || course?.notes_url || (currentModule?.notes ? 'data:text/html;charset=utf-8,' + encodeURIComponent(`<!DOCTYPE html><html><head><style>body{font-family:sans-serif;color:#e2e8f0;background-color:#111116;padding:2rem;line-height:1.6;}</style></head><body>${currentModule.notes}</body></html>`) : null);

  if (!currentModule || !activeDocumentUrl) {
    return (
      <div className="p-8 text-xs text-slate-400 font-mono min-h-screen bg-[#07070a] space-y-4">
        <p>⚠️ Missing document alignment parameters for Module index {lessonId}.</p>
        <Link href={`/dashboard/courses/${courseId}`} className="text-red-400 underline">Return to Workspace</Link>
      </div>
    );
  }

  const isDocx = typeof activeDocumentUrl === 'string' && activeDocumentUrl.toLowerCase().includes('.docx');
  const iframeSrc = isDocx 
    ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(activeDocumentUrl)}`
    : (activeDocumentUrl.startsWith('data:')
        ? activeDocumentUrl
        : `${activeDocumentUrl}#page=${currentModule.start_page || 1}&toolbar=0&navpanes=0`);

  return (
    <div className="min-h-screen bg-[#07070a] text-slate-100 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <Link href={`/dashboard/courses/${courseId}`} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-white transition-colors">
            ← Close & Return to Workspace
          </Link>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            {course?.title || 'Course Notes'}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-[10px] font-mono text-red-400 font-bold bg-red-400/10 border border-red-400/20 px-2.5 py-1 uppercase tracking-wider rounded-sm">
                Module {parseInt(lessonId, 10) < 10 ? `0${parseInt(lessonId, 10)}` : lessonId}
              </span>
              <h1 className="text-xl font-bold font-mono text-white uppercase tracking-tight">{currentModule.title}</h1>
            </div>
          </div>
        </div>

        <div className="border border-white/10 bg-[#111116]/90 rounded-sm overflow-hidden h-[75vh] min-h-[600px] shadow-2xl relative">
          <iframe src={iframeSrc} className={`w-full h-full border-none opacity-90 ${!isDocx ? 'invert-[0.05] contrast-[1.05]' : ''}`} title="Module Reading Documentation Frame" />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
          <button 
            disabled={parseInt(lessonId, 10) <= 1}
            onClick={() => router.push(`/dashboard/courses/${courseId}/lesson/${parseInt(lessonId, 10) - 1}`)}
            className="w-full sm:w-auto text-[10px] font-mono uppercase tracking-widest px-4 py-2.5 bg-white/[0.02] border border-white/5 rounded-sm hover:border-white/20 disabled:opacity-10 transition-all text-slate-300"
          >
            ← Previous Module
          </button>

          <button
            onClick={handleMarkCompleteAndContinue}
            disabled={isCompleting}
            className={`w-full sm:w-64 text-[10px] font-mono font-bold uppercase tracking-widest px-6 py-2.5 border transition-all text-center rounded-sm ${
              hasCompletedCurrent 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                : 'bg-white text-black border-white hover:bg-slate-200'
            }`}
          >
            {isCompleting ? 'Synchronizing...' : 'Mark Complete & Next →'}
          </button>
          
          <button 
            disabled={parseInt(lessonId, 10) >= totalModules}
            onClick={() => router.push(`/dashboard/courses/${courseId}/lesson/${parseInt(lessonId, 10) + 1}`)}
            className="w-full sm:w-auto text-[10px] font-mono uppercase tracking-widest px-4 py-2.5 bg-white/[0.02] border border-white/5 rounded-sm hover:border-white/20 disabled:opacity-10 transition-all text-slate-300"
          >
            Skip to Next →
          </button>
        </div>
      </div>
    </div>
  );
}