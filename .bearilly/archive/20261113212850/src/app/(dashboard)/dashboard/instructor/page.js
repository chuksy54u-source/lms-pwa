'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function InstructorDashboard() {
  const supabase = createClient();
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
  const [moduleFile, setModuleFile] = useState(null);

  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonOrder, setLessonOrder] = useState('1');
  const [lessonDescription, setLessonDescription] = useState('');
  const [lessonExample, setLessonExample] = useState('');
  const [lessonFile, setLessonFile] = useState(null);
  
  const [quizQuestion, setQuizQuestion] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');

  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [submissionRequirements, setSubmissionRequirements] = useState('');
  const [evaluationCriteria, setEvaluationCriteria] = useState('');
  const [assignmentFile, setAssignmentFile] = useState(null); 

  const [gradesInput, setGradesInput] = useState({});

  useEffect(() => {
    checkSecurityAndLoad();
  }, []);

  const checkSecurityAndLoad = async () => {
    setLoading(true);
    try {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) {
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .select('is_instructor')
        .eq('id', user.id)
        .single();

      if (profErr || !profile?.is_instructor) {
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      setIsAuthorized(true);
      await fetchInstructorTelemetry();

    } catch (err) {
      console.error("Security interception error:", err.message);
      setIsAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructorTelemetry = async () => {
    try {
      const { data: uploadData, error: uploadErr } = await supabase
        .from('assignment_uploads')
        .select('id, user_id, full_name, assignment_name, course_id, document_url, grade, status, created_at')
        .order('created_at', { ascending: false });

      if (uploadErr) throw uploadErr;
      setUploads(uploadData || []);

      const { data: courseData, error: courseErr } = await supabase
        .from('courses')
        .select('id, title');

      if (courseErr) throw courseErr;
      setCourses(courseData || []);
      if (courseData?.length > 0) setSelectedCourse(courseData[0].id);

    } catch (err) {
      alert(`Telemetry sync failure: ${err.message}`);
    }
  };

  const handleCommitGrade = async (uploadId) => {
    const scoreValue = gradesInput[uploadId];
    if (!scoreValue) {
      alert("Input a valid score metric before committing data updates.");
      return;
    }

    try {
      const { error } = await supabase
        .from('assignment_uploads')
        .update({ grade: parseInt(scoreValue, 10), status: 'Graded' })
        .eq('id', uploadId);

      if (error) throw error;
      alert("Grade entry updated successfully!");
      fetchInstructorTelemetry(); 
    } catch (err) {
      alert(`Database write exception: ${err.message}`);
    }
  };

  const handleVerifyStudent = async (uploadId) => {
    try {
      const { error } = await supabase
        .from('assignment_uploads')
        .update({ status: 'Verified' })
        .eq('id', uploadId);

      if (error) throw error;
      alert("Submission status updated to Verified.");
      fetchInstructorTelemetry();
    } catch (err) {
      alert(`Verification error: ${err.message}`);
    }
  };

  // 1. DEPLOY MODULE PIPELINE
  const handleDeployModule = async (e) => {
    e.preventDefault();
    if (!moduleTitle || !selectedCourse) {
      alert("Please complete required structural fields.");
      return;
    }

    try {
      let finalFileUrl = null;

      if (moduleFile) {
        const fileExt = moduleFile.name.split('.').pop();
        const fileName = `${selectedCourse}-mod-${Date.now()}.${fileExt}`;
        const filePath = `module_assets/${fileName}`;

        const { error: uploadErr } = await supabase.storage
          .from('course-materials') 
          .upload(filePath, moduleFile);

        if (uploadErr) throw uploadErr;

        const { data: { publicUrl } } = supabase.storage
          .from('course-materials')
          .getPublicUrl(filePath);

        finalFileUrl = publicUrl;
      }

      const { error } = await supabase
        .from('modules') 
        .insert([{
          course_id: selectedCourse,
          title: moduleTitle,
          module_notes_url: finalFileUrl, 
          sort_order: parseInt(moduleOrder, 10),
          start_page: null 
        }]);

      if (error) throw error;

      alert(`Module segment [${moduleTitle}] injected successfully!`);
      setModuleTitle('');
      setModuleFile(null);
      setModuleOrder(prev => String(parseInt(prev, 10) + 1));

    } catch (err) {
      alert(`Module deployment failure: ${err.message}`);
    }
  };

  // 2. DEPLOY LESSON PIPELINE
  const handleDeployLesson = async (e) => {
    e.preventDefault();
    if (!lessonTitle || !selectedCourse) {
      alert("Please ensure a target course is selected.");
      return;
    }

    try {
      let finalContentUrl = null;

      if (lessonFile) {
        const fileExt = lessonFile.name.split('.').pop();
        const fileName = `${selectedCourse}-les-${Date.now()}.${fileExt}`;
        const filePath = `lesson_assets/${fileName}`;

        const { error: uploadErr } = await supabase.storage
          .from('course-materials')
          .upload(filePath, lessonFile);

        if (uploadErr) throw uploadErr;

        const { data: { publicUrl } } = supabase.storage
          .from('course-materials')
          .getPublicUrl(filePath);

        finalContentUrl = publicUrl;
      }

      const { error } = await supabase
        .from('lessons')
        .insert([{
          course_id: selectedCourse,
          title: lessonTitle,
          sort_order: parseInt(lessonOrder, 10),
          description: lessonDescription || null,
          example: lessonExample || null,
          content_url: finalContentUrl
        }]);

      if (error) throw error;

      alert(`Lesson node [${lessonTitle}] uploaded and linked successfully!`);
      setLessonTitle('');
      setLessonFile(null);
      setLessonDescription('');
      setLessonExample('');
      setLessonOrder(prev => String(parseInt(prev, 10) + 1));

    } catch (err) {
      alert(`Lesson deployment failure: ${err.message}`);
    }
  };

  // 3. DEPLOY QUIZ PIPELINE
  const handleDeployQuiz = async (e) => {
    e.preventDefault();
    if (!quizQuestion || !optA || !optB || !optC || !optD || !correctAnswer) {
      alert("Please complete all fields and explicitly assign a correct answer option.");
      return;
    }

    const optionsArray = [optA, optB, optC, optD];

    try {
      const { error } = await supabase
        .from('quizzes')
        .insert([{
          course_id: selectedCourse,
          question: quizQuestion,
          options: optionsArray,
          correct_answer: correctAnswer
        }]);

      if (error) throw error;

      alert("Quiz question node successfully linked to backend schema!");
      setQuizQuestion('');
      setOptA('');
      setOptB('');
      setOptC('');
      setOptD('');
      setCorrectAnswer('');
    } catch (err) {
      alert(`Quiz injection failure: ${err.message}`);
    }
  };

  // 4. DEPLOY ASSIGNMENT PIPELINE (Matches schema keys)
  const handleDeployAssignment = async (e) => {
    e.preventDefault();
    if (!assignmentTitle || !selectedCourse) {
      alert("Please complete core assignment parameters.");
      return;
    }

    try {
      let finalFileUrl = null;

      if (assignmentFile) {
        const fileExt = assignmentFile.name.split('.').pop();
        const fileName = `${selectedCourse}-assign-${Date.now()}.${fileExt}`;
        const filePath = `assignment_templates/${fileName}`;

        const { error: uploadErr } = await supabase.storage
          .from('course-materials') 
          .upload(filePath, assignmentFile);

        if (uploadErr) throw uploadErr;

        const { data: { publicUrl } } = supabase.storage
          .from('course-materials')
          .getPublicUrl(filePath);

        finalFileUrl = publicUrl;
      }

      const { error } = await supabase
        .from('assignments')
        .insert([{
          course_id: selectedCourse,
          title: assignmentTitle,
          submission_requirements: submissionRequirements || null,
          evaluation_criteria: evaluationCriteria || null,
          file_url: finalFileUrl
        }]);

      if (error) throw error;

      alert(`Assignment [${assignmentTitle}] deployed successfully!`);
      setAssignmentTitle('');
      setSubmissionRequirements('');
      setEvaluationCriteria('');
      setAssignmentFile(null);
    } catch (err) {
      alert(`Assignment deployment failure: ${err.message}`);
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
      </div>

      <div className="pt-4">
        {activeTab === 'grading' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold font-mono uppercase text-slate-400 tracking-wider">Incoming Student Documents Log</h3>
            <div className="overflow-x-auto border border-white/10 bg-[#0d0d12] rounded-sm">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 uppercase text-[9px] tracking-widest">
                    <th className="p-4 font-semibold">Student Name</th>
                    <th className="p-4 font-semibold">Document Topic</th>
                    <th className="p-4 font-semibold">Track Asset</th>
                    <th className="p-4 font-semibold">Status Flag</th>
                    <th className="p-4 font-semibold">Grade Score</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {uploads.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-600 text-[11px]">No active assignment uploads found inside database.</td>
                    </tr>
                  ) : (
                    uploads.map((file) => (
                      <tr key={file.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="p-4 text-white text-[11px] font-bold truncate max-w-[155px]" title={file.user_id}>
                          {file.full_name || 'Anonymous Scholar'}
                        </td>
                        <td className="p-4"><div className="font-bold text-white uppercase text-[11px]">{file.assignment_name}</div></td>
                        <td className="p-4"><a href={file.document_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline inline-flex items-center">Download Document ↗</a></td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase border ${file.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : file.status === 'Graded' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>{file.status}</span>
                        </td>
                        <td className="p-4">
                          {file.status === 'Graded' || file.status === 'Verified' ? <span className="text-white font-bold">{file.grade} %</span> : (
                            <input type="number" placeholder="%" value={gradesInput[file.id] || ''} onChange={(e) => setGradesInput(prev => ({ ...prev, [file.id]: e.target.value }))} className="w-20 bg-black border border-white/20 px-2 py-1 text-white rounded-sm focus:border-white focus:outline-none" />
                          )}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button onClick={() => handleCommitGrade(file.id)} disabled={file.status === 'Graded' || file.status === 'Verified'} className="px-3 py-1 bg-white disabled:bg-white/5 text-black disabled:text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all hover:bg-slate-200">Save Grade</button>
                          <button onClick={() => handleVerifyStudent(file.id)} disabled={file.status === 'Verified'} className="px-3 py-1 bg-emerald-600 disabled:bg-emerald-900/50 text-white text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all hover:bg-emerald-500">Verify</button>
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
                + Module
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
                  <option key={c.id} value={c.id}>{c.id.toUpperCase()} - {c.title}</option>
                ))}
              </select>
            </div>

            {/* PIPELINE 1: CORE MODULE CONFIGURATION */}
            {injectorType === 'module' && (
              <form onSubmit={handleDeployModule} className="space-y-4 font-mono text-xs">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 flex flex-col space-y-1.5">
                    <label className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">Module Title</label>
                    <input required type="text" placeholder="e.g., Module 1: Introduction" value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)} className="w-full bg-black border border-white/20 p-2 text-white focus:border-white focus:outline-none rounded-sm" />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">Sort Order</label>
                    <input required type="number" min="1" value={moduleOrder} onChange={(e) => setModuleOrder(e.target.value)} className="w-full bg-black border border-white/20 p-2 text-white focus:border-white focus:outline-none rounded-sm" />
                  </div>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">Attach Module Notes Document (.pdf)</label>
                  <input type="file" accept=".pdf" onChange={(e) => setModuleFile(e.target.files[0])} className="bg-black border border-white/20 p-2 text-slate-400 focus:border-white focus:outline-none rounded-sm file:bg-white/10 file:border-none file:text-white file:text-[10px] file:uppercase file:px-2 file:py-0.5 file:mr-2" />
                </div>
                <button type="submit" className="w-full mt-2 py-3 bg-red-600 hover:bg-red-500 border border-red-600 text-white text-[10px] font-bold uppercase tracking-widest transition-all">
                  Inject Module Block into Pipeline
                </button>
              </form>
            )}

            {/* PIPELINE 2: LESSON ASSIGNMENT */}
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
                  <label className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">Upload Lesson Documentation/Media (.pdf / .docx / .mp4)</label>
                  <input type="file" onChange={(e) => setLessonFile(e.target.files[0])} className="bg-black border border-white/20 p-2 text-slate-400 focus:border-white focus:outline-none rounded-sm file:bg-white/10 file:border-none file:text-white file:text-[10px] file:uppercase file:px-2 file:py-0.5 file:mr-2" />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">Description</label>
                  <textarea rows="2" placeholder="Brief outline of lesson milestones..." value={lessonDescription} onChange={(e) => setLessonDescription(e.target.value)} className="w-full bg-black border border-white/20 p-2 text-white font-sans focus:border-white focus:outline-none resize-none rounded-sm" />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">Example / Case Study Reference</label>
                  <textarea rows="2" placeholder="Code blocks or structured text examples..." value={lessonExample} onChange={(e) => setLessonExample(e.target.value)} className="w-full bg-black border border-white/20 p-2 text-white font-mono focus:border-white focus:outline-none resize-none rounded-sm" />
                </div>

                <button type="submit" className="w-full mt-2 py-3 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest transition-all">
                  Upload Lesson Node to Selected Course
                </button>
              </form>
            )}

            {/* PIPELINE 3: QUIZ WORKSPACE INJECTOR */}
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
                  Link Quiz MCQ Node into Live Subsystem
                </button>
              </form>
            )}

            {/* PIPELINE 4: ASSIGNMENT WORKSPACE INJECTOR */}
            {injectorType === 'assignment' && (
              <form onSubmit={handleDeployAssignment} className="space-y-4 font-mono text-xs">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">Assignment Name/Title</label>
                  <input required type="text" placeholder="e.g., Fluid Layout Build Task" value={assignmentTitle} onChange={(e) => setAssignmentTitle(e.target.value)} className="bg-black border border-white/20 p-2 text-white focus:border-white focus:outline-none rounded-sm" />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">Attach Starter Asset / Template File (.zip, .pdf)</label>
                  <input type="file" onChange={(e) => setAssignmentFile(e.target.files[0])} className="bg-black border border-white/20 p-2 text-slate-400 focus:border-white focus:outline-none rounded-sm file:bg-white/10 file:border-none file:text-white file:text-[10px] file:uppercase file:px-2 file:py-0.5 file:mr-2" />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">Submission Requirements</label>
                  <textarea rows="3" placeholder="Outline file formatting, deadlines, or environment setup parameters..." value={submissionRequirements} onChange={(e) => setSubmissionRequirements(e.target.value)} className="bg-black border border-white/20 p-2 text-white focus:border-white focus:outline-none resize-none rounded-sm" />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">Evaluation Criteria / Grading Metrics</label>
                  <textarea rows="3" placeholder="Specify grading breakdown metrics (e.g., Syntax: 40%, Design: 60%)..." value={evaluationCriteria} onChange={(e) => setEvaluationCriteria(e.target.value)} className="bg-black border border-white/20 p-2 text-white focus:border-white focus:outline-none resize-none rounded-sm" />
                </div>

                <button type="submit" className="w-full mt-2 py-3 bg-amber-600 hover:bg-amber-500 border border-amber-600 text-white text-[10px] font-bold uppercase tracking-widest transition-all">
                  Deploy Assignment Node with File Template
                </button>
              </form>
            )}

          </div>
        )}
      </div>
    </div>
  );
}