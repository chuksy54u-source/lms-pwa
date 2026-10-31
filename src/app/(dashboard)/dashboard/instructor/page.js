'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function InstructorDashboard() {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('grading');
  const [injectorType, setInjectorType] = useState('module');
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  const [uploads, setUploads] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleOrder, setModuleOrder] = useState('1');

  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonOrder, setLessonOrder] = useState('1');
  const [lessonDescription, setLessonDescription] = useState('');
  
  const [quizQuestion, setQuizQuestion] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');

  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [submissionRequirements, setSubmissionRequirements] = useState('');
  const [evaluationCriteria, setEvaluationCriteria] = useState('');

  const [pgStudentId, setPgStudentId] = useState('');
  const [pgResult, setPgResult] = useState(null);

  useEffect(() => {
    checkSecurityAndLoad();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchCourseData(selectedCourse);
    }
  }, [selectedCourse]);

  const checkSecurityAndLoad = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/teachers');
      if (!res.ok) throw new Error();
      setIsAuthorized(true);
      await fetchCourses();
    } catch (err) {
      setIsAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/v1/courses');
      const data = await res.json();
      if (res.ok) {
        setCourses(data || []);
        if (data?.length > 0) setSelectedCourse(data[0].id);
      }
    } catch (err) {
      console.error("Course sync failure:", err.message);
    }
  };

  const fetchCourseData = async (courseId) => {
    try {
      const res = await fetch(`/api/v1/courses/${courseId}/results`);
      const data = await res.json();
      if (res.ok) {
        const mapped = (data || []).map(r => ({
          id: r.student_id,
          user_id: r.student_id,
          full_name: r.student_name,
          assignment_name: `Course Progress: ${r.overall_percent}%`,
          document_url: '#',
          grade: r.overall_percent,
          status: r.overall_percent >= 50 ? 'Verified' : 'Pending',
          created_at: new Date().toISOString()
        }));
        setUploads(mapped);
      }
    } catch (err) {
      console.error("Telemetry sync failure:", err.message);
    }
  };

  const handleCommitGrade = async (uploadId) => {
    alert("Manual grade override is currently handled via Bearilly Assessment Submissions. TODO: Implement POST /api/v1/submissions/:id/grade");
  };

  const handleDeployModule = async (e) => {
    e.preventDefault();
    if (!moduleTitle || !selectedCourse) return;
    try {
      const res = await fetch(`/api/v1/courses/${selectedCourse}/units`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: moduleTitle })
      });
      if (!res.ok) throw new Error(await res.text());
      alert(`Module segment [${moduleTitle}] injected successfully!`);
      setModuleTitle('');
      setModuleOrder(prev => String(parseInt(prev, 10) + 1));
    } catch (err) {
      alert(`Module deployment failure: ${err.message}`);
    }
  };

  const handleDeployLesson = async (e) => {
    e.preventDefault();
    alert("Lesson deployment is currently managed via the Bearilly Course Builder. TODO: Implement POST /api/v1/courses/:id/units/:uid/lessons");
  };

  const handleDeployQuiz = async (e) => {
    e.preventDefault();
    if (!quizQuestion || !optA || !optB || !optC || !optD || !correctAnswer) return;
    try {
      const res = await fetch(`/api/v1/courses/${selectedCourse}/assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: "Quick Quiz",
          pass_mark: 60,
          questions: [{
            type: "mcq",
            points: 1,
            prompt: quizQuestion,
            options: [optA, optB, optC, optD],
            correct_index: [optA, optB, optC, optD].indexOf(correctAnswer)
          }],
          max_attempts: 3
        })
      });
      if (!res.ok) throw new Error(await res.text());
      alert("Quiz question node successfully linked to Bearilly assessment engine!");
    } catch (err) {
      alert(`Quiz injection failure: ${err.message}`);
    }
  };

  const handleDeployAssignment = async (e) => {
    e.preventDefault();
    if (!assignmentTitle || !selectedCourse) return;
    try {
      const res = await fetch(`/api/v1/courses/${selectedCourse}/assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: assignmentTitle,
          pass_mark: 50,
          questions: [{
            type: "short",
            points: 10,
            prompt: submissionRequirements,
            model_answer: evaluationCriteria
          }]
        })
      });
      if (!res.ok) throw new Error(await res.text());
      alert(`Assignment [${assignmentTitle}] deployed successfully!`);
    } catch (err) {
      alert(`Assignment deployment failure: ${err.message}`);
    }
  };

  const handleFetchMood = async () => {
    if (!pgStudentId) return;
    try {
      const res = await fetch(`/api/v1/students/${pgStudentId}/tutor-state`);
      const data = await res.json();
      setPgResult(data);
    } catch (err) {
      setPgResult({ error: err.message });
    }
  };

  const handleFetchProgress = async () => {
    if (!pgStudentId) return;
    try {
      const res = await fetch(`/api/v1/students/${pgStudentId}/progress`);
      const data = await res.json();
      setPgResult(data);
    } catch (err) {
      setPgResult({ error: err.message });
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-xs text-slate-400 font-mono min-h-screen bg-[#07070a] flex items-center justify-center">
        Verifying administrative authorization credentials...
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="p-8 font-mono min-h-screen bg-[#07070a] flex items-center justify-center text-center">
        <div className="max-w-md border border-red-500/20 bg-red-500/5 p-8 rounded-sm space-y-4">
          <p className="text-red-400 text-xs uppercase tracking-widest font-bold">⚠️ Access Interception Notice</p>
          <p className="text-slate-300 text-xs leading-relaxed">
            Your account credentials do not possess the required structural privileges to mount the Instructor Tools suite.
          </p>
          <div className="pt-2">
            <Link href="/dashboard" className="text-[10px] font-bold text-white bg-white/10 px-4 py-2 uppercase hover:bg-white/20 transition-all">
              Return to Student Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 min-h-screen bg-[#07070a] text-slate-100">
      <div className="border border-white/5 bg-[#111116]/40 p-6 rounded-sm">
        <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 font-bold">Instructor Command Panel</span>
        <h2 className="text-xl font-bold uppercase tracking-tight text-white mt-3 font-mono">Instructor Tools</h2>
      </div>

      <div className="flex border-b border-white/5">
        <button
          onClick={() => setActiveTab('grading')}
          className={`px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all font-mono border-t border-x ${
            activeTab === 'grading' ? 'bg-white text-black border-white' : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          Grading Matrix Panel
        </button>
        <button
          onClick={() => setActiveTab('curriculum')}
          className={`px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all font-mono border-t border-x ${
            activeTab === 'curriculum' ? 'bg-white text-black border-white' : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          Curriculum Injector Hub
        </button>
        <button
          onClick={() => setActiveTab('playground')}
          className={`px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all font-mono border-t border-x ${
            activeTab === 'playground' ? 'bg-white text-black border-white' : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          Playground Terminal
        </button>
      </div>

      <div className="pt-4">
        {activeTab === 'grading' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold font-mono uppercase text-slate-400 tracking-wider">Course Performance Matrix</h3>
              <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="bg-black border border-white/20 p-2 text-[10px] text-white focus:border-white focus:outline-none rounded-sm font-mono uppercase">
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div className="overflow-x-auto border border-white/10 bg-[#0d0d12] rounded-sm">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 uppercase text-[9px] tracking-widest">
                    <th className="p-4 font-semibold">Student Name</th>
                    <th className="p-4 font-semibold">Metric</th>
                    <th className="p-4 font-semibold">Asset</th>
                    <th className="p-4 font-semibold">Status Flag</th>
                    <th className="p-4 font-semibold">Grade Score</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {uploads.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-600 text-[11px]">No active student data found for this course.</td>
                    </tr>
                  ) : (
                    uploads.map((file) => (
                      <tr key={file.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="p-4 text-white text-[11px] font-bold truncate max-w-[155px]">
                          {file.full_name || 'Anonymous Scholar'}
                        </td>
                        <td className="p-4"><div className="font-bold text-white uppercase text-[11px]">{file.assignment_name}</div></td>
                        <td className="p-4"><span className="text-slate-500 italic">Bearilly Managed</span></td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase border ${file.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>{file.status}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-white font-bold">{file.grade} %</span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button onClick={() => handleCommitGrade(file.id)} className="px-3 py-1 bg-white text-black text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all hover:bg-slate-200">View Details</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'curriculum' && (
          <div className="max-w-xl mx-auto border border-white/10 bg-[#0d0d12] p-8 rounded-sm space-y-6">
            
            <div className="grid grid-cols-4 gap-1 border-b border-white/5 pb-4">
              <button onClick={() => setInjectorType('module')} className={`py-2 text-[9px] font-mono font-bold uppercase border tracking-wider transition-all ${injectorType === 'module' ? 'bg-white text-black border-white' : 'bg-white/[0.02] text-slate-400 border-white/10 hover:border-white/20'}`}>
                + Unit
              </button>
              <button onClick={() => setInjectorType('lesson')} className={`py-2 text-[9px] font-mono font-bold uppercase border tracking-wider transition-all ${injectorType === 'lesson' ? 'bg-white text-black border-white' : 'bg-white/[0.02] text-slate-400 border-white/10 hover:border-white/20'}`}>
                + Lesson
              </button>
              <button onClick={() => setInjectorType('quiz')} className={`py-2 text-[9px] font-mono font-bold uppercase border tracking-wider transition-all ${injectorType === 'quiz' ? 'bg-white text-black border-white' : 'bg-white/[0.02] text-slate-400 border-white/10 hover:border-white/20'}`}>
                + Quiz MCQ
              </button>
              <button onClick={() => setInjectorType('assignment')} className={`py-2 text-[9px] font-mono font-bold uppercase border tracking-wider transition-all ${injectorType === 'assignment' ? 'bg-white text-black border-white' : 'bg-white/[0.02] text-slate-400 border-white/10 hover:border-white/20'}`}>
                + Assignment
              </button>
            </div>

            <div className="flex flex-col space-y-1.5 font-mono text-xs">
              <label className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">Target Course Pipeline</label>
              <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="bg-black border border-white/20 p-2 text-white focus:border-white focus:outline-none rounded-sm">
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            {injectorType === 'module' && (
              <form onSubmit={handleDeployModule} className="space-y-4 font-mono text-xs">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 flex flex-col space-y-1.5">
                    <label className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">Unit Title</label>
                    <input required type="text" placeholder="e.g., Unit 1: Introduction" value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)} className="w-full bg-black border border-white/20 p-2 text-white focus:border-white focus:outline-none rounded-sm" />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">Sort Order</label>
                    <input required type="number" min="1" value={moduleOrder} onChange={(e) => setModuleOrder(e.target.value)} className="w-full bg-black border border-white/20 p-2 text-white focus:border-white focus:outline-none rounded-sm" />
                  </div>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">Attach Unit Notes (.pdf) - TODO: API Upload</label>
                  <input type="file" accept=".pdf" disabled className="bg-black border border-white/20 p-2 text-slate-600 focus:border-white focus:outline-none rounded-sm file:bg-white/10 file:border-none file:text-white file:text-[10px] file:uppercase file:px-2 file:py-0.5 file:mr-2" />
                </div>
                <button type="submit" className="w-full mt-2 py-3 bg-red-600 hover:bg-red-500 border border-red-600 text-white text-[10px] font-bold uppercase tracking-widest transition-all">
                  Inject Unit Block into Pipeline
                </button>
              </form>
            )}

            {injectorType === 'lesson' && (
              <form onSubmit={handleDeployLesson} className="space-y-4 font-mono text-xs">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 flex flex-col space-y-1.5">
                    <label className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">Lesson Title</label>
                    <input required type="text" placeholder="e.g., Fundamentals of Syntax" value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} className="w-full bg-black border border-white/20 p-2 text-white focus:border-white focus:outline-none rounded-sm" />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">Sort Order</label>
                    <input required type="number" min="1" value={lessonOrder} onChange={(e) => setLessonOrder(e.target.value)} className="w-full bg-black border border-white/20 p-2 text-white focus:border-white focus:outline-none rounded-sm" />
                  </div>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">Description</label>
                  <textarea rows="2" placeholder="Brief outline..." value={lessonDescription} onChange={(e) => setLessonDescription(e.target.value)} className="w-full bg-black border border-white/20 p-2 text-white font-sans focus:border-white focus:outline-none resize-none rounded-sm" />
                </div>
                <button type="submit" className="w-full mt-2 py-3 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest transition-all">
                  Upload Lesson Node (Managed via Bearilly)
                </button>
              </form>
            )}

            {injectorType === 'quiz' && (
              <form onSubmit={handleDeployQuiz} className="space-y-4 font-mono text-xs">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">Question Prompt</label>
                  <input type="text" placeholder="e.g., Highlight the primary layer component protocol." value={quizQuestion} onChange={(e) => setQuizQuestion(e.target.value)} className="bg-black border border-white/20 p-2 text-white focus:border-white focus:outline-none rounded-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-slate-400 uppercase text-[10px] font-bold tracking-wider block">Answer Alternatives Matrix</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Option A" value={optA} onChange={(e) => setOptA(e.target.value)} className="bg-black border border-white/20 p-2 text-white focus:border-white focus:outline-none rounded-sm" />
                    <input type="text" placeholder="Option B" value={optB} onChange={(e) => setOptB(e.target.value)} className="bg-black border border-white/20 p-2 text-white focus:border-white focus:outline-none rounded-sm" />
                    <input type="text" placeholder="Option C" value={optC} onChange={(e) => setOptC(e.target.value)} className="bg-black border border-white/20 p-2 text-white focus:border-white focus:outline-none rounded-sm" />
                    <input type="text" placeholder="Option D" value={optD} onChange={(e) => setOptD(e.target.value)} className="bg-black border border-white/20 p-2 text-white focus:border-white focus:outline-none rounded-sm" />
                  </div>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">Exact Correct String Key Match</label>
                  <select value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} className="bg-black border border-white/20 p-2 text-white focus:border-white focus:outline-none rounded-sm">
                    <option value="">-- Choose Key Option --</option>
                    {optA && <option value={optA}>A: {optA}</option>}
                    {optB && <option value={optB}>B: {optB}</option>}
                    {optC && <option value={optC}>C: {optC}</option>}
                    {optD && <option value={optD}>D: {optD}</option>}
                  </select>
                </div>
                <button type="submit" className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-500 border border-blue-600 text-white text-[10px] font-bold uppercase tracking-widest transition-all">
                  Link Quiz MCQ Node into Bearilly Subsystem
                </button>
              </form>
            )}

            {injectorType === 'assignment' && (
              <form onSubmit={handleDeployAssignment} className="space-y-4 font-mono text-xs">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">Assignment Name/Title</label>
                  <input required type="text" placeholder="e.g., Fluid Layout Build Task" value={assignmentTitle} onChange={(e) => setAssignmentTitle(e.target.value)} className="bg-black border border-white/20 p-2 text-white focus:border-white focus:outline-none rounded-sm" />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">Submission Requirements</label>
                  <textarea rows="3" placeholder="Outline parameters..." value={submissionRequirements} onChange={(e) => setSubmissionRequirements(e.target.value)} className="bg-black border border-white/20 p-2 text-white focus:border-white focus:outline-none resize-none rounded-sm" />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">Evaluation Criteria / AI Model Answer</label>
                  <textarea rows="3" placeholder="Specify grading breakdown..." value={evaluationCriteria} onChange={(e) => setEvaluationCriteria(e.target.value)} className="bg-black border border-white/20 p-2 text-white focus:border-white focus:outline-none resize-none rounded-sm" />
                </div>
                <button type="submit" className="w-full mt-2 py-3 bg-amber-600 hover:bg-amber-500 border border-amber-600 text-white text-[10px] font-bold uppercase tracking-widest transition-all">
                  Deploy Assignment Node to Bearilly
                </button>
              </form>
            )}
          </div>
        )}

        {activeTab === 'playground' && (
          <div className="max-w-xl mx-auto border border-white/10 bg-[#0d0d12] p-8 rounded-sm space-y-6">
            <div className="border-b border-white/5 pb-4">
              <h3 className="text-xs font-bold font-mono uppercase text-white tracking-wider">Bearilly AI Playground</h3>
              <p className="text-[10px] text-slate-500 font-mono mt-1">Test real-time student telemetry and mood analysis.</p>
            </div>

            <div className="flex flex-col space-y-1.5 font-mono text-xs">
              <label className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">Target Student ID</label>
              <input type="text" placeholder="Enter Student UUID..." value={pgStudentId} onChange={(e) => setPgStudentId(e.target.value)} className="bg-black border border-white/20 p-2 text-white focus:border-white focus:outline-none rounded-sm" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={handleFetchMood} className="py-3 bg-white text-black text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-slate-200">
                Query Bear Mood
              </button>
              <button onClick={handleFetchProgress} className="py-3 bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-white/20 border border-white/10">
                Query Progress
              </button>
            </div>

            {pgResult && (
              <div className="mt-4 p-4 bg-black border border-white/5 rounded-sm">
                <label className="text-slate-500 uppercase text-[9px] font-bold tracking-widest block mb-2">API Response Output</label>
                <pre className="text-[10px] text-emerald-400 font-mono overflow-x-auto">
                  {JSON.stringify(pgResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}