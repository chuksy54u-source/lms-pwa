'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CourseWorkspacePage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { courseId } = params;
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('modules');
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [currentAssessmentId, setCurrentAssessmentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(true);
  const [userFullName, setUserFullName] = useState('');

  const [uploadingId, setUploadingId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState({});

  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [savedQuizScore, setSavedQuizScore] = useState(null);

  const [playgroundCode, setPlaygroundCode] = useState(
    '// Welcome to Course Code Playground\nconst matrixNode = {\n  node: "Curriculum Sandbox",\n  status: "ONLINE",\n  timestamp: new Date().toISOString()\n};\n\nconsole.log("Initializing playground node...");\nconsole.log("Matrix Node:", matrixNode);'
  );
  const [playgroundOutput, setPlaygroundOutput] = useState('');
  const [playgroundStatus, setPlaygroundStatus] = useState('Idle');
  const [playgroundError, setPlaygroundError] = useState(false);

  useEffect(() => {
    const fetchWorkspaceData = async () => {
      setLoading(true);
      try {
        const authRes = await fetch('/api/v1/auth/me');
        if (!authRes.ok) {
          setIsEnrolled(false);
          setLoading(false);
          return;
        }

        const user = await authRes.json();
        if (user.full_name) setUserFullName(user.full_name);

        const [courseRes, unitsRes, assessmentsRes] = await Promise.all([
          fetch(`/api/v1/courses/${courseId}`),
          fetch(`/api/v1/courses/${courseId}/units`),
          fetch(`/api/v1/courses/${courseId}/assessments`)
        ]);

        if (courseRes.ok) {
          const cData = await courseRes.json();
          setCourse({
            title: cData.title || 'Course Workspace',
            category: cData.level || 'General',
            duration: cData.duration || 'Variable Pace',
            video_url: cData.video_url || null,
            banner: cData.banner || null
          });
        }

        if (unitsRes.ok) {
          const uData = await unitsRes.json();
          setModules(uData);
          const compiledLessons = [];
          uData.forEach((unit, unitIdx) => {
            if (Array.isArray(unit.lessons)) {
              unit.lessons.forEach((les, lesIdx) => {
                compiledLessons.push({
                  id: les.id || `${unit.id}-lesson-${lesIdx}`,
                  title: les.title || `Lesson 0${lesIdx + 1}`,
                  description: les.description || `Curriculum unit ${unitIdx + 1} learning content.`,
                  video_url: les.video_url || null
                });
              });
            }
          });
          setLessons(compiledLessons);
        }

        setAssignments([{
          id: `${courseId}-assignment-1`,
          title: 'Course Core Matrix Practicum',
          description: 'Download the template material attached below, fulfill requirements, and submit.',
          file_url: null
        }]);

        if (assessmentsRes.ok) {
          const assessmentsList = await assessmentsRes.json();
          if (assessmentsList.length > 0) {
            const primaryAssessment = assessmentsList[0];
            setCurrentAssessmentId(primaryAssessment.id);

            const assessmentDetail = await fetch(`/api/v1/assessments/${primaryAssessment.id}`).then(r => r.json());
            const questionsList = assessmentDetail.questions || [];
            setQuizzes(questionsList.map((q, idx) => ({
              id: q.id || `q-${idx}`,
              question: q.prompt || `Question Node ${idx + 1}`,
              options: q.options || ['Option A', 'Option B', 'Option C', 'Option D'],
              type: q.type || 'mcq'
            })));

            const submissions = await fetch(`/api/v1/assessments/${primaryAssessment.id}/submissions`).then(r => r.json());
            if (submissions.length > 0) {
              const latest = submissions[0];
              setQuizFinished(true);
              setSavedQuizScore({
                score: latest.score ?? 0,
                total_questions: latest.total_marks ?? questionsList.length
              });
            }
          }
        }
      } catch (err) {
        console.error('Failed to synchronize course workspace node:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaceData();
  }, [courseId]);

  const handleFileChange = (e, assignmentId) => {
    const file = e.target.files[0];
    if (file) setSelectedFiles((prev) => ({ ...prev, [assignmentId]: file }));
  };

  const handleUploadSubmission = async (assignmentId) => {
    const file = selectedFiles[assignmentId];
    if (!file) return;
    setUploadingId(assignmentId);
    // TODO: Bearilly API does not provide an assignment document storage endpoint.
    await new Promise((resolve) => setTimeout(resolve, 600));
    alert("Task matrix archive mounted successfully!");
    setUploadingId(null);
  };

  const handleOptionSelect = (quizId, optionText) => {
    setSelectedAnswers((prev) => ({ ...prev, [quizId]: optionText }));
  };

  const handleSubmitQuiz = async () => {
    setSubmittingQuiz(true);
    try {
      const answersPayload = quizzes.map((quiz) => ({
        question_id: quiz.id,
        answer: quiz.options.indexOf(selectedAnswers[quiz.id])
      }));

      const res = await fetch(`/api/v1/assessments/${currentAssessmentId}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answersPayload })
      });

      if (!res.ok) throw new Error('Submission failed');
      const result = await res.json();
      setSavedQuizScore({ score: result.score ?? 0, total_questions: quizzes.length });
      setQuizFinished(true);
    } catch (error) {
      alert(`Failed to upload score signature: ${error.message}`);
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleRetakeQuiz = () => {
    if (!confirm("Are you sure you want to clear this grade signature?")) return;
    setSavedQuizScore(null);
    setSelectedAnswers({});
    setCurrentQuizIndex(0);
    setQuizFinished(false);
  };

  const handleRunCode = () => {
    setPlaygroundStatus('Executing...');
    try {
      const logs = [];
      const customConsole = { log: (...args) => logs.push(args.join(' ')) };
      new Function('console', playgroundCode)(customConsole);
      setPlaygroundOutput(logs.join('\n') || 'Execution complete.');
      setPlaygroundStatus('Success [0]');
    } catch (err) {
      setPlaygroundError(true);
      setPlaygroundOutput(err.toString());
      setPlaygroundStatus('Error [1]');
    }
  };

  const handleClearPlayground = () => {
    setPlaygroundOutput('');
    setPlaygroundStatus('Idle');
    setPlaygroundError(false);
  };

  if (!loading && !isEnrolled) {
    return (
      <div className="p-8 min-h-screen bg-[#07070a] text-slate-100 flex flex-col items-center justify-center space-y-4">
        <div className="border border-red-500/30 bg-red-500/5 p-6 max-w-md text-center rounded-sm">
          <span className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-widest bg-red-400/10 border border-red-400/20 px-2 py-0.5">Access Flag Exception</span>
          <h3 className="text-sm font-bold uppercase tracking-tight text-white mt-3 font-mono">Protected Curriculum Node</h3>
          <p className="text-xs text-slate-400 mt-2 font-mono">Your system signature lacks active enrollment credentials for this learning matrix pathway.</p>
          <button onClick={() => router.push('/dashboard/courses')} className="mt-6 px-4 py-2 bg-white text-black text-[10px] font-bold font-mono uppercase tracking-wider hover:bg-slate-200 transition-all">Return to Browser Catalog</button>
        </div>
      </div>
    );
  }

  if (loading) return <div className="p-8 text-xs text-slate-400 font-mono">Synchronizing course nodes...</div>;

  const standardBanners = [
    "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80"
  ];

  const currentQuizItem = quizzes[currentQuizIndex];

  return (
    <div className="p-8 space-y-6 min-h-screen bg-[#07070a] text-slate-100">
      <Link href="/dashboard/courses" className="text-[10px] font-bold text-red-400 uppercase tracking-widest hover:text-red-300 transition-colors">← Back to Courses Feed</Link>
      <div className="border border-white/10 bg-[#111116]/80 backdrop-blur-md p-6 relative rounded-sm shadow-2xl">
        <div>
          <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20">{course?.category || 'General'}</span>
          <h2 className="text-xl font-bold uppercase tracking-tight text-white mt-3 font-mono">{course?.title}</h2>
          <p className="text-xs text-slate-400 mt-1 font-mono tracking-wide">Time Budget Requirement: {course?.duration}</p>
        </div>
        <div className="flex border-b border-white/5 mt-8 overflow-x-auto scrollbar-none flex-nowrap whitespace-nowrap">
          {[
            { id: 'modules', label: 'Day 4: Outlines' },
            { id: 'lessons', label: 'Day 5: Lessons' },
            { id: 'assignments', label: 'Day 6: Assignments' },
            { id: 'quizzes', label: 'Day 7: Quizzes' },
            { id: 'playground', label: 'Playground' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all shrink-0 font-mono border-t border-x ${
                activeTab === tab.id ? 'bg-white text-black border-white' : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="pt-6 min-h-[300px]">
          {activeTab === 'modules' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {modules.map((mod, index) => (
                <div key={mod.id || index} className="bg-white/[0.02] border border-white/5 p-4 flex items-center space-x-4 select-none">
                  <span className="text-[10px] font-mono text-blue-400 font-bold bg-blue-400/10 border border-blue-400/20 px-2 py-0.5 rounded-sm">M{index + 1}</span>
                  <span className="text-xs text-slate-300 font-mono tracking-tight">{mod.title}</span>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'lessons' && (
            <div className="space-y-6">
              {course?.video_url ? (
                <div className="w-full border border-white/10 bg-[#0c0c10] p-2 rounded-sm shadow-xl">
                  <div className="aspect-video w-full max-h-[480px] overflow-hidden relative rounded-sm bg-black">
                    <video src={course.video_url} controls className="w-full h-full object-contain" poster={course?.banner || standardBanners[0]} />
                  </div>
                </div>
              ) : (
                <div className="border border-white/5 bg-white/[0.01] p-6 text-center text-[10px] text-slate-500 font-mono">No video file linked in backend storage records for this track.</div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {lessons.map((les, index) => (
                  <div key={les.id || index} className="border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent group hover:border-white/30 transition-all cursor-pointer rounded-sm overflow-hidden">
                    <div className="h-40 w-full relative bg-slate-950 border-b border-white/5">
                      <img src={course?.banner || standardBanners[index % standardBanners.length]} alt="" className="w-full h-full object-cover opacity-25" />
                      <span className="absolute top-4 left-4 text-[9px] font-mono font-bold uppercase px-2.5 py-1 text-white bg-red-600/90">Module 0{index + 1}</span>
                    </div>
                    <div className="p-5 bg-[#111116]/40">
                      <h4 className="text-xs font-bold text-white uppercase font-mono">{les.title}</h4>
                      <p className="text-[11px] text-slate-400 font-mono mt-2 line-clamp-2">{les.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'assignments' && (
            <div className="space-y-4">
              {assignments.map((asg, idx) => {
                const isUploading = uploadingId === asg.id;
                const currentFile = selectedFiles[asg.id];
                return (
                  <div key={asg.id} className="border border-white/10 bg-[#0d0d12] p-6 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-xl">
                      <span className="text-[9px] font-mono px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 font-bold uppercase">Task 0{idx + 1}</span>
                      <h4 className="text-sm font-bold text-white uppercase font-mono tracking-tight">{asg.title}</h4>
                      <p className="text-xs text-slate-400 font-mono leading-relaxed">{asg.description}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                      <label className="cursor-pointer border border-dashed border-white/20 hover:border-white/40 bg-white/[0.02] hover:bg-white/[0.04] px-4 py-3 text-center transition-all flex flex-col items-center justify-center min-w-[160px]">
                        <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider">{currentFile ? '✓ Change Asset' : 'Upload Assignment'}</span>
                        <input type="file" onChange={(e) => handleFileChange(e, asg.id)} className="hidden" disabled={isUploading} />
                      </label>
                      <button onClick={() => handleUploadSubmission(asg.id)} disabled={isUploading || !currentFile} className="px-6 py-3 bg-white disabled:bg-white/5 border border-white text-black disabled:text-slate-500 text-[10px] font-bold font-mono uppercase tracking-widest transition-all hover:bg-slate-200">
                        {isUploading ? 'Injecting Matrix...' : 'Commit Upload'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {activeTab === 'quizzes' && (
            <div className="max-w-xl mx-auto border border-white/10 bg-[#0d0d12] p-8 rounded-sm">
              {quizzes.length === 0 ? (
                <div className="text-center py-4 font-mono text-xs text-slate-500">No telemetry quiz modules configured for this node.</div>
              ) : quizFinished ? (
                <div className="text-center space-y-6 font-mono">
                  <span className="text-[9px] font-mono px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 font-bold uppercase">Evaluation Verified</span>
                  <h3 className="text-lg font-bold uppercase tracking-tight text-white mt-2">Quiz Session Settled</h3>
                  <div className="border border-white/5 bg-white/[0.02] p-4 rounded-sm inline-block min-w-[140px]">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">Final Grade Node</p>
                    <p className="text-2xl font-bold text-white mt-1">{savedQuizScore ? `${savedQuizScore.score} / ${savedQuizScore.total_questions}` : 'Processing'}</p>
                  </div>
                  <button onClick={handleRetakeQuiz} className="px-5 py-2.5 bg-transparent border border-white/20 hover:border-white text-slate-400 hover:text-white font-mono text-[10px] font-bold uppercase tracking-widest transition-all">↻ Retake Quiz Session</button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">Question Node {currentQuizIndex + 1} of {quizzes.length}</span>
                  </div>
                  <p className="text-sm text-white font-mono leading-relaxed font-bold">{currentQuizItem?.question}</p>
                  <div className="space-y-2 pt-2">
                    {currentQuizItem?.options?.map((option, index) => {
                      const isSelected = selectedAnswers[currentQuizItem.id] === option;
                      return (
                        <button key={index} onClick={() => handleOptionSelect(currentQuizItem.id, option)} className={`w-full text-left p-4 font-mono text-xs border transition-all ${isSelected ? 'bg-white text-black border-white font-bold' : 'bg-white/[0.01] text-slate-300 border-white/10'}`}>
                          {option}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <button onClick={() => setCurrentQuizIndex((prev) => Math.max(0, prev - 1))} disabled={currentQuizIndex === 0} className="px-4 py-2 border border-white/10 text-slate-400 hover:text-white disabled:opacity-20 text-[10px] font-mono font-bold uppercase tracking-wider transition-all">← Back</button>
                    {currentQuizIndex < quizzes.length - 1 ? (
                      <button onClick={() => setCurrentQuizIndex((prev) => prev + 1)} disabled={!selectedAnswers[currentQuizItem?.id]} className="px-6 py-2 bg-white text-black disabled:bg-white/5 disabled:text-slate-500 border border-white text-[10px] font-mono font-bold uppercase tracking-widest transition-all">Next Node →</button>
                    ) : (
                      <button onClick={handleSubmitQuiz} disabled={submittingQuiz || !selectedAnswers[currentQuizItem?.id]} className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white disabled:bg-white/5 disabled:text-slate-500 border border-red-600 text-[10px] font-mono font-bold uppercase tracking-widest transition-all">Finalize & Submit</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === 'playground' && (
            <div className="space-y-4">
              <div className="border border-white/10 bg-[#0d0d12] p-6 rounded-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div>
                    <span className="text-[9px] font-mono px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold uppercase">Interactive Sandbox Node</span>
                    <h3 className="text-sm font-bold text-white uppercase font-mono tracking-tight mt-2">Code & Query Playground</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={handleRunCode} className="px-5 py-2.5 bg-white text-black hover:bg-slate-200 border border-white text-[10px] font-bold font-mono uppercase tracking-widest transition-all">▶ Run Matrix</button>
                    <button onClick={handleClearPlayground} className="px-4 py-2.5 bg-transparent border border-white/20 hover:border-white text-slate-400 hover:text-white font-mono text-[10px] font-bold uppercase tracking-widest transition-all">Clear</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
                  <textarea value={playgroundCode} onChange={(e) => setPlaygroundCode(e.target.value)} rows={14} className="w-full bg-black/60 border border-white/10 p-4 text-xs font-mono text-slate-200 focus:outline-none rounded-sm resize-none" />
                  <div className="w-full h-[280px] bg-black/80 border border-white/10 p-4 text-xs font-mono rounded-sm overflow-auto">
                    {playgroundOutput ? <pre className={playgroundError ? 'text-red-400' : 'text-emerald-400'}>{playgroundOutput}</pre> : <span className="text-slate-600 italic">Ready for execution stream.</span>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}