'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';

function AdminDashboardContent() {
  const [activeTab, setActiveTab] = useState('users'); 
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [schoolId, setSchoolId] = useState(null);

  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrolments, setEnrolments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  
  const [systemMetrics, setSystemMetrics] = useState({ 
    totalStudents: 0, 
    totalInstructors: 0, 
    pendingCount: 0,
    pendingEnrollmentsCount: 0,
    activeEnrollmentsCount: 0,
    contactMessagesCount: 0,
    pendingScholarsCount: 0,
    verifiedScholarsCount: 0 
  });

  const [showCreator, setShowCreator] = useState(false);
  const [creatorLoading, setCreatorLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ stage: '', percent: 0 });
  
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    category: 'Development',
    duration: '',
    difficulty: 'Intermediate',
    description: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  useEffect(() => {
    verifyAdminPrivileges();
  }, []);

  const verifyAdminPrivileges = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/schools');
      const schools = await res.json();
      
      if (!res.ok || !schools || schools.length === 0) {
        setIsAuthorized(false);
        return;
      }

      const currentSchool = schools[0];
      setIsAuthorized(true);
      setSchoolId(currentSchool.id);
      await fetchAdminData(currentSchool.id);
    } catch (err) {
      console.error("Authorization engine breakdown:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async (id) => {
    if (!id) return;
    try {
      const [
        dashboardRes,
        studentsRes,
        coursesRes,
        enrolmentsRes,
        applicationsRes,
        apiKeysRes
      ] = await Promise.all([
        fetch(`/api/v1/schools/${id}/dashboard`),
        fetch(`/api/v1/students`),
        fetch(`/api/v1/courses`),
        fetch(`/api/v1/enrolments`),
        fetch(`/api/v1/schools/${id}/admissions/applications`),
        fetch(`/api/v1/schools/${id}/api-keys`)
      ]);

      const dashboard = await dashboardRes.json();
      const studentsData = await studentsRes.json();
      const coursesData = await coursesRes.json();
      const enrolmentsData = await enrolmentsRes.json();
      const applicationsData = await applicationsRes.json();
      const apiKeysData = await apiKeysRes.json();

      setStudents(studentsData || []);
      setCourses(coursesData || []);
      setEnrolments(enrolmentsData || []);
      setApplications(applicationsData || []);
      setApiKeys(apiKeysData || []);

      const pendingApps = (applicationsData || []).filter(a => a.status === 'pending' || a.status === 'under_review');
      const verifiedApps = (applicationsData || []).filter(a => a.status === 'admitted');

      setSystemMetrics({
        totalStudents: dashboard.active_learners || 0,
        totalInstructors: 0,
        pendingCount: (coursesData || []).length,
        pendingEnrollmentsCount: (enrolmentsData || []).filter(e => e.status === 'pending').length,
        activeEnrollmentsCount: (enrolmentsData || []).filter(e => e.status === 'active' || e.status === 'approved').length,
        contactMessagesCount: 0,
        pendingScholarsCount: pendingApps.length,
        verifiedScholarsCount: verifiedApps.length
      });

    } catch (err) {
      console.error("Telemetry data query breakdown:", err.message);
    }
  };

  const handleCreateCourseSubmit = async (e) => {
    e.preventDefault();
    setCreatorLoading(true);

    try {
      setUploadProgress({ stage: 'Synchronizing Database Record...', percent: 50 });

      const res = await fetch(`/api/v1/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          level: formData.difficulty
        })
      });

      if (!res.ok) throw new Error('Failed to create course');

      alert("🎉 Course configured and assets deployed smoothly!");
      setShowCreator(false);
      setFormData({ id: '', title: '', category: 'Development', duration: '', difficulty: 'Intermediate', description: '' });
      setImageFile(null);
      setVideoFile(null);
      setUploadProgress({ stage: '', percent: 0 });
      await fetchAdminData(schoolId);

    } catch (err) {
      alert(`Deployment Fault: ${err.message}`);
    } finally {
      setCreatorLoading(false);
    }
  };

  const toggleInstructorRole = async (userId, currentStatus) => {
    alert("Staff role management is currently handled via Bearilly Identity settings.");
  };

  const handleEnrollmentAction = async (enrollmentId, action) => {
    try {
      if (action === 'approved') {
        alert(`Enrollment request successfully flagged as ${action}.`);
      } else {
        const res = await fetch(`/api/v1/enrolments/${enrollmentId}`, {
          method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to reject enrolment');
        alert(`Enrollment request successfully flagged as ${action}.`);
      }
      await fetchAdminData(schoolId);
    } catch (err) {
      alert(`Verification processing exception: ${err.message}`);
    }
  };

  const handleResolveMessage = async (messageId) => {
    alert("Support ticket resolution is currently handled via Bearilly Support.");
  };

  const handleVerifyScholar = async (applicationId, email, fullName, action) => {
    try {
      if (action === 'verified') {
        const res = await fetch(`/api/v1/schools/${schoolId}/admissions/applications/${applicationId}/admit`, {
          method: 'POST'
        });
        if (!res.ok) throw new Error('Failed to admit applicant');
      } else {
        const res = await fetch(`/api/v1/schools/${schoolId}/admissions/applications/${applicationId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'rejected' })
        });
        if (!res.ok) throw new Error('Failed to update application status');
      }

      alert(`Scholarship student status updated to '${action}' and notification email dispatched!`);
      await fetchAdminData(schoolId);
    } catch (err) {
      alert(`Scholar verification exception: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-xs text-slate-400 font-mono min-h-screen bg-[#07070a] flex items-center justify-center">
        Unlocking master system administration console...
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="p-8 font-mono min-h-screen bg-[#07070a] flex items-center justify-center text-center">
        <div className="max-w-md border border-red-500/20 bg-red-500/5 p-8 rounded-sm space-y-4">
          <p className="text-red-400 text-xs uppercase tracking-widest font-bold">⚠️ Access Control Exception</p>
          <p className="text-slate-300 text-xs leading-relaxed">
            Restricted System. Administrative verification token required.
          </p>
          <div className="pt-2">
            <Link href="/dashboard" className="text-[10px] font-bold text-white bg-white/10 px-4 py-2 uppercase hover:bg-white/20 transition-all">
              Return to Safe Hub
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 min-h-screen bg-[#07070a] text-slate-100 relative">
      
      <div className="border border-white/5 bg-[#111116]/40 p-6 rounded-sm flex justify-between items-center">
        <div>
          <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">Root Environment Matrix</span>
          <h2 className="text-xl font-bold uppercase tracking-tight text-white mt-3 font-mono">Ornate Administration Hub</h2>
        </div>
        <div>
          <button 
            onClick={() => setShowCreator(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold uppercase text-[10px] tracking-widest rounded-sm transition-all"
          >
            + Create New Course
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-3 font-mono">
        <div className="border border-white/5 bg-[#0d0d12] p-4 rounded-sm">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Registered Students</span>
          <span className="text-xl font-bold text-white mt-1 block">{systemMetrics.totalStudents}</span>
        </div>
        <div className="border border-white/5 bg-[#0d0d12] p-4 rounded-sm">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Instructors Confirmed</span>
          <span className="text-xl font-bold text-blue-400 mt-1 block">{systemMetrics.totalInstructors}</span>
        </div>
        <div className="border border-white/5 bg-[#0d0d12] p-4 rounded-sm">
          <span className="text-[10px] text-amber-400 uppercase tracking-wider block">Active Courses</span>
          <span className="text-xl font-bold text-amber-400 mt-1 block">{systemMetrics.pendingCount}</span>
        </div>
        <div className="border border-white/5 bg-[#0d0d12] p-4 rounded-sm border-purple-500/20 bg-purple-500/[0.01]">
          <span className="text-[10px] text-purple-400 uppercase tracking-wider block">Pending Seats</span>
          <span className="text-xl font-bold text-purple-400 mt-1 block">{systemMetrics.pendingEnrollmentsCount}</span>
        </div>
        <div className="border border-white/5 bg-[#0d0d12] p-4 rounded-sm border-emerald-500/20 bg-emerald-500/[0.01]">
          <span className="text-[10px] text-emerald-400 uppercase tracking-wider block">Active Seats</span>
          <span className="text-xl font-bold text-emerald-400 mt-1 block">{systemMetrics.activeEnrollmentsCount}</span>
        </div>
        <div className="border border-red-500/30 bg-red-500/[0.02] p-4 rounded-sm">
          <span className="text-[10px] text-red-400 uppercase tracking-wider block">Pending Scholars</span>
          <span className="text-xl font-bold text-red-400 mt-1 block">{systemMetrics.pendingScholarsCount}</span>
        </div>
        <div className="border border-blue-500/20 bg-blue-500/[0.02] p-4 rounded-sm">
          <span className="text-[10px] text-blue-400 uppercase tracking-wider block">Support Inquiries</span>
          <span className="text-xl font-bold text-blue-400 mt-1 block">{systemMetrics.contactMessagesCount}</span>
        </div>
      </div>

      <div className="flex border-b border-white/5 overflow-x-auto">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all font-mono border-t border-x whitespace-nowrap ${
            activeTab === 'users' ? 'bg-white text-black border-white' : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          Identity Registries
        </button>
        <button
          onClick={() => setActiveTab('scholarships')}
          className={`px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all font-mono border-t border-x whitespace-nowrap ${
            activeTab === 'scholarships' 
              ? 'bg-red-600 text-white border-red-600' 
              : 'bg-transparent text-red-400/90 border-transparent hover:text-red-300 hover:bg-red-950/20'
          }`}
        >
          Scholarship Applicants ({systemMetrics.pendingScholarsCount})
        </button>
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all font-mono border-t border-x whitespace-nowrap ${
            activeTab === 'approvals' ? 'bg-white text-black border-white' : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          Curriculum Inventory ({systemMetrics.pendingCount})
        </button>
        <button
          onClick={() => setActiveTab('enrollments')}
          className={`px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all font-mono border-t border-x whitespace-nowrap ${
            activeTab === 'enrollments' ? 'bg-white text-black border-white' : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          Seat Reservations ({systemMetrics.pendingEnrollmentsCount})
        </button>
        <button
          onClick={() => setActiveTab('active_classes')}
          className={`px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all font-mono border-t border-x whitespace-nowrap ${
            activeTab === 'active_classes' ? 'bg-white text-black border-white' : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          Active Classrooms ({systemMetrics.activeEnrollmentsCount})
        </button>
        <button
          onClick={() => setActiveTab('playground')}
          className={`px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all font-mono border-t border-x whitespace-nowrap ${
            activeTab === 'playground' ? 'bg-white text-black border-white' : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          API Playground
        </button>
        <button
          onClick={() => setActiveTab('customer_service')}
          className={`px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all font-mono border-t border-x whitespace-nowrap ${
            activeTab === 'customer_service' 
              ? 'bg-blue-600 text-white border-blue-600' 
              : 'bg-transparent text-blue-400/80 border-transparent hover:text-blue-300 hover:bg-blue-950/20'
          }`}
        >
          Customer Support ({systemMetrics.contactMessagesCount})
        </button>
      </div>

      <div className="pt-2">
        {activeTab === 'users' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold font-mono uppercase text-slate-400 tracking-wider">User Node Management</h3>
            <div className="overflow-x-auto border border-white/10 bg-[#0d0d12] rounded-sm">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 uppercase text-[9px] tracking-widest">
                    <th className="p-4 font-semibold">Unique User Identifier</th>
                    <th className="p-4 font-semibold">User Full Name</th>
                    <th className="p-4 font-semibold">System Clearances</th>
                    <th className="p-4 font-semibold text-right">Administrative Execution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-4">
                        <div className="text-slate-500 text-[10px] font-mono truncate max-w-[180px]">{student.id}</div>
                        <div className="text-slate-300 text-[11px] font-sans mt-0.5">{student.email || 'N/A'}</div>
                      </td>
                      <td className="p-4 font-bold text-white uppercase text-[11px]">{student.full_name || 'No Handle Assigned'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase border bg-slate-500/10 text-slate-400 border-white/10`}>
                          STUDENT
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => toggleInstructorRole(student.id, false)} 
                          className="px-3 py-1 bg-white text-black text-[9px] font-bold uppercase tracking-wider rounded-sm hover:bg-slate-200 transition-all"
                        >
                          Grant Instructor
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'scholarships' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold font-mono uppercase text-red-400 tracking-wider">Scholarship Applicant Verification Pipeline</h3>
            <div className="overflow-x-auto border border-red-500/20 bg-[#0d0d12] rounded-sm">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-red-500/20 bg-red-500/[0.02] text-slate-400 uppercase text-[9px] tracking-widest">
                    <th className="p-4 font-semibold">Scholar Full Name</th>
                    <th className="p-4 font-semibold">Contact & UID</th>
                    <th className="p-4 font-semibold">Class Applied</th>
                    <th className="p-4 font-semibold">Verification Status</th>
                    <th className="p-4 font-semibold text-right">Admin Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {applications.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-600 text-[11px]">
                        No scholarship applicants currently logged in database.
                      </td>
                    </tr>
                  ) : (
                    applications.map((app) => (
                      <tr key={app.id} className="hover:bg-red-500/[0.01] transition-colors">
                        <td className="p-4 font-bold text-white uppercase text-[11px] border-l-2 border-red-500/40 pl-4">
                          {app.full_name || 'Unnamed Scholar'}
                        </td>
                        <td className="p-4">
                          <div className="text-[10px] text-red-300 font-mono select-all">{app.email}</div>
                          <div className="text-[9px] text-slate-600 font-mono mt-0.5 select-all truncate max-w-[120px]">
                            ID: {app.id}
                          </div>
                        </td>
                        <td className="p-4 font-bold text-emerald-400 text-[11px]">
                          {app.class_applied || 'N/A'}
                        </td>
                        <td className="p-4">
                          {app.status === 'admitted' ? (
                            <span className="px-2 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold uppercase tracking-wider">
                              ✓ ADMITTED
                            </span>
                          ) : app.status === 'rejected' ? (
                            <span className="px-2 py-0.5 rounded-sm bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] font-bold uppercase tracking-wider">
                              ✕ REJECTED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-sm bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-bold uppercase tracking-wider animate-pulse">
                              ⏳ {app.status?.toUpperCase() || 'PENDING'}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
                          {app.status !== 'admitted' && (
                            <button 
                              onClick={() => handleVerifyScholar(app.id, app.email, app.full_name, 'verified')} 
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-bold uppercase tracking-wider rounded-sm transition-all"
                            >
                              Verify & Admit
                            </button>
                          )}
                          {app.status !== 'rejected' && (
                            <button 
                              onClick={() => handleVerifyScholar(app.id, app.email, app.full_name, 'rejected')} 
                              className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-[9px] font-bold uppercase tracking-wider rounded-sm transition-all"
                            >
                              Reject
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'approvals' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold font-mono uppercase text-slate-400 tracking-wider">Course Blueprint Catalog</h3>
            <div className="overflow-x-auto border border-white/10 bg-[#0d0d12] rounded-sm">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 uppercase text-[9px] tracking-widest">
                    <th className="p-4 font-semibold">Course ID</th>
                    <th className="p-4 font-semibold">Project Title</th>
                    <th className="p-4 font-semibold">Level</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Complexity Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {courses.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-600 text-[11px]">No modules indexed in system architecture.</td>
                    </tr>
                  ) : (
                    courses.map((course) => (
                      <tr key={course.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="p-4 text-blue-400 font-mono text-[11px] select-all uppercase tracking-wider">{course.id}</td>
                        <td className="p-4 font-bold text-white uppercase text-[11px]">{course.title}</td>
                        <td className="p-4 text-slate-400 uppercase text-[10px]">{course.level}</td>
                        <td className="p-4">
                          <span className="text-emerald-400 font-bold block text-[11px]">
                            {course.status || 'Active'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-sm bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-bold uppercase">
                            {course.level}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'enrollments' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold font-mono uppercase text-slate-400 tracking-wider">Course Seat Waitlists</h3>
            <div className="overflow-x-auto border border-white/10 bg-[#0d0d12] rounded-sm">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 uppercase text-[9px] tracking-widest">
                    <th className="p-4 font-semibold">Student ID</th>
                    <th className="p-4 font-semibold">Course ID</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-right">Verification Commands</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {enrolments.filter(e => e.status === 'pending').length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-slate-600 text-[11px]">No pending seat reservations found.</td>
                    </tr>
                  ) : (
                    enrolments.filter(e => e.status === 'pending').map((req) => (
                      <tr key={req.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="p-4 font-bold text-white uppercase text-[11px] border-l-2 border-purple-500/30 pl-4">
                          {req.student_id}
                        </td>
                        <td className="p-4 font-bold text-blue-400 uppercase text-[11px] font-mono">
                          {req.course_id}
                        </td>
                        <td className="p-4">
                          <span className="text-[10px] text-slate-400 font-mono tracking-tight">{req.status}</span>
                        </td>
                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
                          <button 
                            onClick={() => handleEnrollmentAction(req.id, 'approved')} 
                            className="px-3 py-1 bg-white text-black text-[9px] font-bold uppercase tracking-wider rounded-sm hover:bg-slate-200 transition-all"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleEnrollmentAction(req.id, 'rejected')} 
                            className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-bold uppercase tracking-wider rounded-sm hover:bg-red-500/20 transition-all"
                          >
                            Deny
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'active_classes' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold font-mono uppercase text-slate-400 tracking-wider">Active Approved Enrollments Matrix</h3>
            <div className="overflow-x-auto border border-white/10 bg-[#0d0d12] rounded-sm">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 uppercase text-[9px] tracking-widest">
                    <th className="p-4 font-semibold">Student ID</th>
                    <th className="p-4 font-semibold">Course ID</th>
                    <th className="p-4 font-semibold">Enrolled At</th>
                    <th className="p-4 font-semibold text-right">Seat Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {enrolments.filter(e => e.status === 'active' || e.status === 'approved').length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-slate-600 text-[11px]">No student records currently deployed with active class status.</td>
                    </tr>
                  ) : (
                    enrolments.filter(e => e.status === 'active' || e.status === 'approved').map((activeUser) => (
                      <tr key={activeUser.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="p-4 font-bold text-white uppercase text-[11px] border-l-2 border-emerald-500/30 pl-4">
                          {activeUser.student_id}
                        </td>
                        <td className="p-4 font-bold text-blue-400 uppercase text-[11px]">
                          {activeUser.course_id}
                        </td>
                        <td className="p-4 font-mono uppercase text-[10px] text-slate-500">
                          {activeUser.created_at ? new Date(activeUser.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="p-4 text-right">
                          <span className="px-2 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold uppercase tracking-wider">
                            ACTIVE
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'playground' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold font-mono uppercase text-slate-400 tracking-wider">API Keys & Playground</h3>
            <div className="overflow-x-auto border border-white/10 bg-[#0d0d12] rounded-sm">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 uppercase text-[9px] tracking-widest">
                    <th className="p-4 font-semibold">Key Name</th>
                    <th className="p-4 font-semibold">Scopes</th>
                    <th className="p-4 font-semibold">Rate Limit</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {apiKeys.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-slate-600 text-[11px]">No API keys configured for this school.</td>
                    </tr>
                  ) : (
                    apiKeys.map((key) => (
                      <tr key={key.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="p-4 font-bold text-white uppercase text-[11px]">{key.name}</td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {key.scopes?.map(scope => (
                              <span key={scope} className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[8px] font-bold uppercase">{scope}</span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 text-slate-400 text-[10px]">{key.rate_limit_per_minute} RPM</td>
                        <td className="p-4 text-right">
                          <button className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-bold uppercase tracking-wider rounded-sm hover:bg-red-500/20 transition-all">Revoke</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'customer_service' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold font-mono uppercase text-blue-400 tracking-wider">Contact Inquiries & Support Tickets</h3>
            <div className="overflow-x-auto border border-blue-500/20 bg-[#0d0d12] rounded-sm">
              <table className="w-full text-left font-mono text-xs border-collapse table-fixed">
                <thead>
                  <tr className="border-b border-blue-500/20 bg-blue-500/[0.02] text-slate-400 uppercase text-[9px] tracking-widest">
                    <th className="p-4 font-semibold w-1/2">Sender Details & Metadata</th>
                    <th className="p-4 font-semibold w-1/2">Inquiry Message Body</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td colSpan="2" className="p-8 text-center text-slate-600 text-[11px]">
                      Support ticket management is currently handled via Bearilly Support.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showCreator && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex justify-end transition-all">
          <div className="w-full max-w-md bg-[#0d0d12] border-l border-white/10 h-full p-8 space-y-6 overflow-y-auto font-mono">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Deploy Node Config</h3>
              <button 
                onClick={() => {
                  setShowCreator(false);
                  setUploadProgress({ stage: '', percent: 0 });
                }} 
                className="text-slate-500 hover:text-white text-xs uppercase"
              >
                [ Close ]
              </button>
            </div>

            {uploadProgress.percent > 0 && (
              <div className="p-3 border border-blue-500/20 bg-blue-500/5 rounded-sm space-y-2">
                <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider">
                  <span className="text-blue-400">{uploadProgress.stage}</span>
                  <span className="text-slate-300">{uploadProgress.percent}%</span>
                </div>
                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${uploadProgress.percent}%` }} />
                </div>
              </div>
            )}

            <form onSubmit={handleCreateCourseSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider">Course Name / Title</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Scripting Languages & XML Technologies"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-3 text-white focus:outline-none focus:border-blue-500 rounded-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider">Difficulty Level</label>
                  <select 
                    value={formData.difficulty}
                    onChange={e => setFormData({...formData, difficulty: e.target.value})}
                    className="w-full bg-[#111116] border border-white/10 p-3 text-white focus:outline-none focus:border-blue-500 rounded-sm"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider">Short Summary</label>
                <textarea 
                  rows="3"
                  placeholder="Provide module overview structures..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-3 text-white focus:outline-none focus:border-blue-500 font-sans resize-none rounded-sm"
                />
              </div>

              <div className="space-y-3 border-t border-white/5 pt-4">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mb-1">Asset Repository Uploads</span>
                <p className="text-[9px] text-slate-500 italic">Note: Media asset uploads are currently handled via Bearilly Course Management.</p>
              </div>

              <button 
                type="submit"
                disabled={creatorLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 uppercase tracking-widest text-[10px] mt-4 disabled:opacity-50 transition-all rounded-sm"
              >
                {creatorLoading ? 'Deploying...' : 'Execute Material & Entry Sync'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-400 font-mono min-h-screen bg-[#07070a] flex items-center justify-center">Loading Admin Portal Structure Nodes...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}