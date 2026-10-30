'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LessonViewPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { courseId, lessonId } = params;
  const router = useRouter();

  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [totalLessons, setTotalLessons] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [hasCompletedCurrent, setHasCompletedCurrent] = useState(false);
  
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [isAsking, setIsAsking] = useState(false);

  useEffect(() => {
    const fetchLessonData = async () => {
      setLoading(true);
      try {
        const bearillyUrl = process.env.NEXT_PUBLIC_BEARILLY_URL;
        
        const lessonRes = await fetch(`${bearillyUrl}/api/v1/lessons/${lessonId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('bearilly_session')}` }
        });
        
        if (!lessonRes.ok) {
          router.push('/login');
          return;
        }
        
        const lessonData = await lessonRes.json();
        setCurrentLesson(lessonData);

        const tutorRes = await fetch(`${bearillyUrl}/api/v1/tutor/messages`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('bearilly_session')}` }
        });
        if (tutorRes.ok) {
          const history = await tutorRes.json();
          setMessages(history.slice(-5)); 
        }
        
        await fetch(`${bearillyUrl}/api/v1/progress/events`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('bearilly_session')}`
          },
          body: JSON.stringify({
            kind: 'lesson_opened',
            lesson_id: lessonId
          })
        });
      } catch (err) {
        console.error("Error fetching lesson data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonData();
  }, [courseId, lessonId, router]);

  const handleMarkCompleteAndContinue = async () => {
    if (!currentLesson) return;
    setIsCompleting(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BEARILLY_URL}/api/v1/progress/events`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bearilly_session')}`
        },
        body: JSON.stringify({
          kind: 'lesson_completed',
          lesson_id: currentLesson.id
        })
      });
      
      setHasCompletedCurrent(true);
      router.push(`/dashboard/courses/${courseId}/lesson/${parseInt(lessonId, 10) + 1}`);
    } catch (err) {
      console.error("Error saving progression:", err);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleAskTutor = async (e) => {
    e.preventDefault();
    if (!question.trim() || !currentLesson) return;

    setIsAsking(true);
    const userMsg = { question, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BEARILLY_URL}/api/v1/tutor/ask`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bearilly_session')}`
        },
        body: JSON.stringify({
          context: { lessonId: currentLesson.id },
          question: question
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { answer: data.answer, created_at: new Date().toISOString() }]);
        setQuestion('');
      }
    } catch (err) {
      console.error("Tutor error:", err);
    } finally {
      setIsAsking(false);
    }
  };

  if (loading) return <div className="p-8 text-xs text-slate-400 font-mono min-h-screen bg-[#07070a]">Streaming module document parameters...</div>;

  if (!currentLesson) {
    return (
      <div className="p-8 text-xs text-slate-400 font-mono min-h-screen bg-[#07070a] space-y-4">
        <p>⚠️ Missing document alignment parameters for Module index {lessonId}.</p>
        <Link href={`/dashboard/courses/${courseId}`} className="text-red-400 underline">Return to Workspace</Link>
      </div>
    );
  }

  const isUrl = currentLesson.notes?.startsWith('http');
  const isDocx = isUrl && currentLesson.notes.toLowerCase().includes('.docx');
  const iframeSrc = isDocx 
    ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(currentLesson.notes)}`
    : isUrl ? `${currentLesson.notes}#toolbar=0&navpanes=0` : null;

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
              <h1 className="text-xl font-bold font-mono text-white uppercase tracking-tight">{currentLesson.title}</h1>
            </div>
          </div>
        </div>

        <div className="border border-white/10 bg-[#111116]/90 rounded-sm overflow-hidden h-[75vh] min-h-[600px] shadow-2xl relative">
          {isUrl ? (
            <iframe src={iframeSrc} className={`w-full h-full border-none opacity-90 ${!isDocx ? 'invert-[0.05] contrast-[1.05]' : ''}`} title="Module Reading Documentation Frame" />
          ) : (
            <div className="w-full h-full p-8 overflow-y-auto font-mono text-sm text-slate-300 leading-relaxed">
              <div className="max-w-3xl mx-auto whitespace-pre-wrap">
                {currentLesson.notes}
              </div>
            </div>
          )}
        </div>

        <div className="border border-white/10 bg-[#111116]/90 rounded-sm p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            <h2 className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-widest">Bearilly AI Tutor Playground</h2>
          </div>
          
          <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {messages.length === 0 && (
              <p className="text-[10px] font-mono text-slate-500 uppercase">No active queries in buffer. Ask a question about this lesson.</p>
            )}
            {messages.map((msg, i) => (
              <div key={i} className="space-y-1 border-l border-white/5 pl-4">
                {msg.question && (
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">Student: {msg.question}</p>
                )}
                {msg.answer && (
                  <p className="text-xs font-mono text-white leading-relaxed">Bear: {msg.answer}</p>
                )}
              </div>
            ))}
            {isAsking && (
              <p className="text-[10px] font-mono text-red-400 animate-pulse uppercase">Processing query...</p>
            )}
          </div>

          <form onSubmit={handleAskTutor} className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask the bear about this lesson..."
              className="flex-1 bg-white/[0.02] border border-white/10 rounded-sm px-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-red-400/50 transition-colors"
            />
            <button
              type="submit"
              disabled={isAsking || !question.trim()}
              className="text-[10px] font-mono font-bold uppercase tracking-widest px-4 py-2 bg-white text-black hover:bg-slate-200 disabled:opacity-50 transition-all rounded-sm"
            >
              Ask
            </button>
          </form>
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
            disabled={parseInt(lessonId, 10) >= totalLessons}
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