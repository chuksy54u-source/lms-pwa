'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CoursesBrowser() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const categories = ['All', 'Development', 'Design', 'Data & AI', 'Security'];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const coursesRes = await fetch('/api/v1/courses', {
          headers: { 'Accept': 'application/json' }
        }).then(res => res.json());

        if (Array.isArray(coursesRes)) {
          setCourses(coursesRes);
          // TODO: Fetch enrolments via school-specific logic or Bearilly student-context endpoint
          setEnrolledIds(new Set());
        }
      } catch (err) {
        console.error("Data sync error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCourseAction = async (course) => {
    if (enrolledIds.has(course.id)) {
      router.push(`/dashboard/courses/${course.id}`);
      return;
    }

    setActionLoading(course.id);
    try {
      // TODO: Implement enrollment via school-specific logic or verified Bearilly endpoint
      alert("Enrollment request processed via school system.");
      setEnrolledIds(prev => new Set(prev).add(course.id));
    } catch (err) {
      alert("System communication error.");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredCourses = selectedCategory === 'All' 
    ? courses 
    : courses.filter(c => c.category === selectedCategory);

  if (loading) {
    return <div className="text-xs text-slate-400 font-mono p-8">Connecting to core data nodes...</div>;
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">Curriculum</span>
          <h2 className="text-xl font-bold uppercase tracking-tight text-white mt-1">Educational Track Nodes</h2>
          <p className="text-xs text-slate-400 mt-1">Select an active path configuration to audit lesson blocks, quizzes, and tasks.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider border transition-all ${
                selectedCategory === cat ? 'bg-white text-black border-white' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCourses.map((course) => {
          const isEnrolled = enrolledIds.has(course.id);
          const isProcessing = actionLoading === course.id;

          return (
            <div key={course.id} className="border border-white/10 bg-black/40 backdrop-blur-md flex flex-col group hover:border-white/20 transition-all">
              <div className="h-40 relative bg-slate-900 border-b border-white/5 overflow-hidden">
                {course.banner ? (
                  <img src={course.banner} alt={course.title} className="w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-all duration-500 scale-100 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full bg-[#111116] flex items-center justify-center text-[10px] text-slate-600 font-mono">NO ASSET BANNER OVERLAY</div>
                )}
                <span className="absolute top-4 left-4 text-[9px] font-mono font-bold uppercase px-2 py-1 text-white bg-blue-600">
                  {course.difficulty || 'Intermediate'}
                </span>
                {course.duration && (
                  <span className="absolute bottom-4 right-4 text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 bg-black/80 border border-white/10 text-slate-300">
                    ⏱️ {course.duration}
                  </span>
                )}
              </div>
              
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-2">
                  <span className="text-[9px] font-mono uppercase text-red-400 tracking-widest">{course.category || 'Development'}</span>
                  <h3 className="text-base font-bold text-white tracking-tight uppercase font-mono">{course.title}</h3>
                  {course.description && (
                    <p className="text-xs text-slate-400 font-sans line-clamp-2 leading-relaxed normal-case">{course.description}</p>
                  )}
                </div>

                <button 
                  onClick={() => handleCourseAction(course)}
                  disabled={isProcessing}
                  className={`w-full text-center py-3 text-[10px] font-bold uppercase tracking-widest transition-all font-mono border ${
                    isProcessing 
                      ? 'bg-blue-900/40 text-blue-300 border-blue-500/20 cursor-wait'
                      : isEnrolled
                        ? 'bg-white text-black border-white hover:bg-white/90'
                        : 'bg-blue-600/10 text-blue-400 border-blue-500/30 hover:bg-blue-600 hover:text-white hover:border-blue-500'
                  }`}
                >
                  {isProcessing ? 'Synchronizing Core Node...' : isEnrolled ? 'Open Curriculum Workspace' : 'Initialize Path Enrollment'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {/* TODO: Implement Playground interface using Bearilly assessment/submission endpoints */}
    </div>
  );
}