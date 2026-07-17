'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

function AdminDashboardContent() {
  const supabase = createClient();
  
  const [activeTab, setActiveTab] = useState('users'); 
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Core Data States
  const [profiles, setProfiles] = useState([]);
  const [pendingCourses, setPendingCourses] = useState([]);
  const [pendingEnrollments, setPendingEnrollments] = useState([]);
  const [activeEnrollments, setActiveEnrollments] = useState([]); // Track approved students
  const [contactMessages, setContactMessages] = useState([]); // Customer Service Messages
  
  const [systemMetrics, setSystemMetrics] = useState({ 
    totalStudents: 0, 
    totalInstructors: 0, 
    pendingCount: 0,
    pendingEnrollmentsCount: 0,
    activeEnrollmentsCount: 0,
    contactMessagesCount: 0 // Active unread/unresolved inquiries
  });

  // Course Drawer States
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

  // Asset File States (Only Images and Videos)
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  useEffect(() => {
    verifyAdminPrivileges();
  }, []);

  const verifyAdminPrivileges = async () => {
    setLoading(true);
    try {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) return;

      const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (profErr || !profile?.is_admin) return;

      setIsAuthorized(true);
      await fetchAdminData();
    } catch (err) {
      console.error("Authorization engine breakdown:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      const metricsRes = await fetch('/api/admin/metrics');
      const backendMetrics = await metricsRes.json();
      setProfiles(backendMetrics.usersList || []);

      // 1. Fetch course configurations
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('id, title, category, duration, difficulty, video_url');
      
      if (coursesError) console.error("Courses Fetch Error:", coursesError.message);
      const rawCourses = coursesData || [];

      // 2. Fetch global enrollments to calculate student sub-totals per course
      const { data: globalEnrollments, error: globalEnrollError } = await supabase
        .from('enrollments')
        .select('id, user_id, course_id, status, full_name');

      const registrationMap = {};
      const pendingQueue = [];
      const approvedQueue = [];

      if (!globalEnrollError && globalEnrollments) {
        globalEnrollments.forEach(enroll => {
          if (enroll.status === 'approved') {
            const cId = String(enroll.course_id);
            registrationMap[cId] = (registrationMap[cId] || 0) + 1;
            approvedQueue.push(enroll);
          } else if (enroll.status === 'pending') {
            pendingQueue.push(enroll);
          }
        });
      }

      const validatedCourses = rawCourses.map(course => ({
        ...course,
        enrolledCount: registrationMap[String(course.id)] || 0
      }));
      setPendingCourses(validatedCourses);

      // Extract unique IDs across queues to map system course titles and profiles efficiently
      const courseIds = Array.from(new Set((globalEnrollments || []).map(e => e.course_id)));
      const userIds = Array.from(new Set((globalEnrollments || []).map(e => e.user_id)));

      const [coursesRes, profilesRes] = await Promise.all([
        supabase.from('courses').select('id, title, category').in('id', courseIds),
        supabase.from('profiles').select('id, email').in('id', userIds)
      ]);

      const courseMap = new Map(coursesRes?.data?.map(c => [String(c.id), c]) || []);
      const emailMap = new Map(profilesRes?.data?.map(p => [p.id, p.email]) || []);

      // 3. Compile Pending Seat Requests
      const sanitizedPending = pendingQueue.map(enrollment => ({
        id: enrollment.id,
        user_id: enrollment.user_id,
        course_id: enrollment.course_id,
        full_name: enrollment.full_name || 'Unknown Student',
        email: emailMap.get(enrollment.user_id) || 'N/A',
        courses: courseMap.get(String(enrollment.course_id)) || { title: `Course Node (${enrollment.course_id})` }
      }));
      setPendingEnrollments(sanitizedPending);

      // 4. Compile Active / Approved Student Registry Matrix
      const sanitizedApproved = approvedQueue.map(enrollment => ({
        id: enrollment.id,
        user_id: enrollment.user_id,
        course_id: enrollment.course_id,
        full_name: enrollment.full_name || 'Unknown Student',
        email: emailMap.get(enrollment.user_id) || 'N/A',
        courses: courseMap.get(String(enrollment.course_id)) || { title: `Course Node (${enrollment.course_id})`, category: 'N/A' }
      }));
      setActiveEnrollments(sanitizedApproved);

      // 5. Fetch Contact Messages matching exact schema properties
      // (Order by newest inquiries, querying resolution column value if active)
      const { data: messages, error: messagesErr } = await supabase
        .from('contact_messages')
        .select('id, created_at, name, email, inquiry_type, academic_sector, message, resolution')
        .order('created_at', { ascending: false });

      if (messagesErr) {
        console.error("contact_messages Fetch Error:", messagesErr.message);
      } else {
        setContactMessages(messages || []);
      }

      setSystemMetrics({
        totalStudents: backendMetrics.totalStudents || 0,
        totalInstructors: backendMetrics.totalInstructors || 0,
        pendingCount: validatedCourses.length,
        pendingEnrollmentsCount: sanitizedPending.length,
        activeEnrollmentsCount: sanitizedApproved.length,
        contactMessagesCount: (messages || []).filter(m => !m.resolution).length // Unresolved messages counter
      });

    } catch (err) {
      console.error("Telemetry data query breakdown:", err.message);
    }
  };

  const uploadMaterialAsset = async (file, folderName, courseId) => {
    if (!file) return null;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${courseId}-${Date.now()}.${fileExt}`;
    const filePath = `${folderName}/${fileName}`;

    setUploadProgress({ stage: `Uploading ${folderName}...`, percent: 25 });

    const { error: uploadError } = await supabase.storage
      .from('course-materials')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (uploadError) throw uploadError;

    setUploadProgress({ stage: `${folderName} uploaded successfully!`, percent: 100 });

    const { data: { publicUrl } } = supabase.storage
      .from('course-materials')
      .getPublicUrl(filePath);
      
    return publicUrl;
  };

  const handleCreateCourseSubmit = async (e) => {
    e.preventDefault();
    setCreatorLoading(true);

    try {
      let bannerUrl = await uploadMaterialAsset(imageFile, 'banners', formData.id);
      let videoUrl = await uploadMaterialAsset(videoFile, 'videos', formData.id);

      setUploadProgress({ stage: 'Synchronizing Database Record...', percent: 90 });

      const { error: dbError } = await supabase
        .from('courses')
        .insert([{
          id: formData.id,
          title: formData.title,
          category: formData.category,
          duration: formData.duration || null,
          difficulty: formData.difficulty,
          banner: bannerUrl || null,
          description: formData.description || null,
          video_url: videoUrl || null
        }]);

      if (dbError) throw dbError;

      alert("🎉 Course configured and assets deployed smoothly!");
      setShowCreator(false);
      setFormData({ id: '', title: '', category: 'Development', duration: '', difficulty: 'Intermediate', description: '' });
      setImageFile(null);
      setVideoFile(null);
      setUploadProgress({ stage: '', percent: 0 });
      await fetchAdminData();

    } catch (err) {
      alert(`Deployment Fault: ${err.message}`);
    } finally {
      setCreatorLoading(false);
    }
  };

  const toggleInstructorRole = async (userId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_instructor: !currentStatus })
        .eq('id', userId);

      if (error) throw error;
      alert("Account credentials updated.");
      await fetchAdminData();
    } catch (err) {
      alert(`Schema configuration exception: ${err.message}`);
    }
  };

  const handleEnrollmentAction = async (enrollmentId, action) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/admin/approve-enrollment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ enrollmentId, action })
      });

      const result = await res.json();
      if (result.error) throw new Error(result.error);

      alert(`Enrollment request successfully flagged as ${action}.`);
      await fetchAdminData();
    } catch (err) {
      alert(`Verification processing exception: ${err.message}`);
    }
  };

  // NEW METHOD: Update resolution column tracking inside Supabase database
  const handleResolveMessage = async (messageId) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ resolution: 'resolved' }) // Sets 'resolution' column value to 'resolved'
        .eq('id', messageId);

      if (error) throw error;
      alert("Message flagged resolved.");
      await fetchAdminData();
    } catch (err) {
      alert(`Could not patch status flag: ${err.message}`);
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
      
      {/* Header Banner */}
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

      {/* Analytics Matrix Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 font-mono">
        <div className="border border-white/5 bg-[#0d0d12] p-4 rounded-sm">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Registered Students</span>
          <span className="text-xl font-bold text-white mt-1 block">{systemMetrics.totalStudents}</span>
        </div>
        <div className="border border-white/5 bg-[#0d0d12] p-4 rounded-sm">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Instructors Confirmed</span>
          <span className="text-xl font-bold text-blue-400 mt-1 block">{systemMetrics.totalInstructors}</span>
        </div>
        <div className="border border-white/5 bg-[#0d0d12] p-4 rounded-sm">
          <span className="text-[10px] text-amber-400 uppercase tracking-wider block">Total Active Courses</span>
          <span className="text-xl font-bold text-amber-400 mt-1 block">{systemMetrics.pendingCount}</span>
        </div>
        <div className="border border-white/5 bg-[#0d0d12] p-4 rounded-sm border-purple-500/20 bg-purple-500/[0.01]">
          <span className="text-[10px] text-purple-400 uppercase tracking-wider block">Pending Seat Approvals</span>
          <span className="text-xl font-bold text-purple-400 mt-1 block">{systemMetrics.pendingEnrollmentsCount}</span>
        </div>
        <div className="border border-white/5 bg-[#0d0d12] p-4 rounded-sm border-emerald-500/20 bg-emerald-500/[0.01]">
          <span className="text-[10px] text-emerald-400 uppercase tracking-wider block">Approved Class Seats</span>
          <span className="text-xl font-bold text-emerald-400 mt-1 block">{systemMetrics.activeEnrollmentsCount}</span>
        </div>
        {/* Blue Customer Support Metrics Widget */}
        <div className="border border-blue-500/20 bg-blue-500/[0.02] p-4 rounded-sm">
          <span className="text-[10px] text-blue-400 uppercase tracking-wider block">Support Inquiries</span>
          <span className="text-xl font-bold text-blue-400 mt-1 block">{systemMetrics.contactMessagesCount}</span>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="flex border-b border-white/5">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all font-mono border-t border-x ${
            activeTab === 'users' ? 'bg-white text-black border-white' : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          Identity Registries
        </button>
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all font-mono border-t border-x ${
            activeTab === 'approvals' ? 'bg-white text-black border-white' : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          Curriculum Inventory ({systemMetrics.pendingCount})
        </button>
        <button
          onClick={() => setActiveTab('enrollments')}
          className={`px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all font-mono border-t border-x ${
            activeTab === 'enrollments' ? 'bg-white text-black border-white' : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          Seat Reservations ({systemMetrics.pendingEnrollmentsCount})
        </button>
        <button
          onClick={() => setActiveTab('active_classes')}
          className={`px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all font-mono border-t border-x ${
            activeTab === 'active_classes' ? 'bg-white text-black border-white' : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          Active Classrooms ({systemMetrics.activeEnrollmentsCount})
        </button>
        {/* NEW TAB: Customer Service Messages (Blue Accented) */}
        <button
          onClick={() => setActiveTab('customer_service')}
          className={`px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all font-mono border-t border-x ${
            activeTab === 'customer_service' 
              ? 'bg-blue-600 text-white border-blue-600' 
              : 'bg-transparent text-blue-400/80 border-transparent hover:text-blue-300 hover:bg-blue-950/20'
          }`}
        >
          Customer Support ({systemMetrics.contactMessagesCount})
        </button>
      </div>

      {/* Tables Sub-Matrices */}
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
                  {profiles.map((profile) => (
                    <tr key={profile.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-4">
                        <div className="text-slate-500 text-[10px] font-mono truncate max-w-[180px]">{profile.id}</div>
                        <div className="text-slate-300 text-[11px] font-sans mt-0.5">{profile.email || 'N/A'}</div>
                      </td>
                      <td className="p-4 font-bold text-white uppercase text-[11px]">{profile.full_name || 'No Handle Assigned'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase border ${
                          profile.is_admin 
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                            : profile.is_instructor 
                              ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                              : 'bg-slate-500/10 text-slate-400 border-white/10'
                        }`}>
                          {profile.is_admin ? 'ROOT ADMIN' : profile.is_instructor ? 'INSTRUCTOR' : 'STUDENT'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          disabled={profile.is_admin}
                          onClick={() => toggleInstructorRole(profile.id, profile.is_instructor)} 
                          className="px-3 py-1 bg-white disabled:opacity-20 text-black text-[9px] font-bold uppercase tracking-wider rounded-sm hover:bg-slate-200 transition-all"
                        >
                          {profile.is_instructor ? 'Revoke Instructor' : 'Grant Instructor'}
                        </button>
                      </td>
                    </tr>
                  ))}
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
                    <th className="p-4 font-semibold">Category</th>
                    <th className="p-4 font-semibold">Metrics & Volume</th>
                    <th className="p-4 font-semibold">Deployed Media</th>
                    <th className="p-4 font-semibold">Complexity Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {pendingCourses.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-600 text-[11px]">No modules indexed in system architecture.</td>
                    </tr>
                  ) : (
                    pendingCourses.map((course) => (
                      <tr key={course.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="p-4 text-blue-400 font-mono text-[11px] select-all uppercase tracking-wider">{course.id}</td>
                        <td className="p-4 font-bold text-white uppercase text-[11px]">
                          {course.title}
                        </td>
                        <td className="p-4 text-slate-400 uppercase text-[10px]">{course.category}</td>
                        <td className="p-4">
                          <span className="text-emerald-400 font-bold block text-[11px]">
                            {course.enrolledCount} {course.enrolledCount === 1 ? 'Student Registered' : 'Students Registered'}
                          </span>
                          <span className="text-slate-500 text-[10px] font-sans mt-0.5 block">{course.duration || 'Flexible duration'}</span>
                        </td>
                        <td className="p-4">
                          {course.video_url ? (
                            <a href={course.video_url} target="_blank" rel="noreferrer" className="text-[10px] text-red-400 font-bold tracking-wide hover:underline">🎥 View Media Node</a>
                          ) : (
                            <span className="text-slate-600 text-[10px]">No Media</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-sm bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-bold uppercase">
                            {course.difficulty}
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
                    <th className="p-4 font-semibold">Full Name</th>
                    <th className="p-4 font-semibold">User Metadata Link</th>
                    <th className="p-4 font-semibold">Target Curriculum Module</th>
                    <th className="p-4 font-semibold text-right">Verification Commands</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {pendingEnrollments.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-slate-600 text-[11px]">No pending seat reservations found.</td>
                    </tr>
                  ) : (
                    pendingEnrollments.map((req) => (
                      <tr key={req.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="p-4 font-bold text-white uppercase text-[11px] border-l-2 border-purple-500/30 pl-4">
                          {req.full_name}
                        </td>
                        <td className="p-4">
                          <div className="text-[10px] text-slate-400 font-mono tracking-tight">{req.email}</div>
                          <div className="text-[9px] text-slate-600 font-mono mt-0.5 select-all truncate max-w-[120px]">UID: {req.user_id}</div>
                        </td>
                        <td className="p-4 font-bold text-blue-400 uppercase text-[11px] font-mono">
                          {req.courses?.title}
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

        {/* Active Classrooms Tab */}
        {activeTab === 'active_classes' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold font-mono uppercase text-slate-400 tracking-wider">Active Approved Enrollments Matrix</h3>
            <div className="overflow-x-auto border border-white/10 bg-[#0d0d12] rounded-sm">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 uppercase text-[9px] tracking-widest">
                    <th className="p-4 font-semibold">Active Student</th>
                    <th className="p-4 font-semibold">Contact Email</th>
                    <th className="p-4 font-semibold">Assigned Active Curriculum</th>
                    <th className="p-4 font-semibold">Track Block</th>
                    <th className="p-4 font-semibold text-right">Seat Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {activeEnrollments.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-600 text-[11px]">No student records currently deployed with active class status.</td>
                    </tr>
                  ) : (
                    activeEnrollments.map((activeUser) => (
                      <tr key={activeUser.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="p-4 font-bold text-white uppercase text-[11px] border-l-2 border-emerald-500/30 pl-4">
                          {activeUser.full_name}
                        </td>
                        <td className="p-4 font-mono text-[10px] text-slate-400 select-all">
                          {activeUser.email}
                        </td>
                        <td className="p-4 font-bold text-blue-400 uppercase text-[11px]">
                          {activeUser.courses?.title}
                        </td>
                        <td className="p-4 font-mono uppercase text-[10px] text-slate-500">
                          {activeUser.courses?.category || 'General'}
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

        {/* CUSTOMER SERVICE SUPPORT MODULE - SIDE BY SIDE LAYOUT */}
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
                  {contactMessages.length === 0 ? (
                    <tr>
                      <td colSpan="2" className="p-8 text-center text-slate-600 text-[11px]">No customer service messages indexed in schema.</td>
                    </tr>
                  ) : (
                    contactMessages.map((msg) => (
                      <tr key={msg.id} className="hover:bg-blue-500/[0.01] transition-colors align-top">
                        
                        {/* LEFT COLUMN: Sender details, Inquiry details, Resolve Indicator */}
                        <td className="p-4 border-l-2 border-blue-500/40 space-y-3">
                          <div>
                            <div className="font-bold text-white uppercase text-[11px]">{msg.name || 'Anonymous'}</div>
                            <div className="text-[10px] text-blue-400 font-mono tracking-tight mt-0.5 select-all">{msg.email}</div>
                          </div>

                          <div className="flex flex-wrap gap-2 pt-1">
                            {msg.inquiry_type && (
                              <span className="px-2 py-0.5 rounded-sm bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-bold uppercase">
                                Type: {msg.inquiry_type}
                              </span>
                            )}
                            {msg.academic_sector && (
                              <span className="px-2 py-0.5 rounded-sm bg-slate-500/10 text-slate-400 border border-white/10 text-[9px] font-bold uppercase">
                                Sector: {msg.academic_sector}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 pt-2">
                            {/* Dynamic Resolution status pill indicator */}
                            {msg.resolution === 'resolved' ? (
                              <span className="px-2 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold uppercase tracking-wider">
                                ✓ RESOLVED
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-sm bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] font-bold uppercase tracking-wider">
                                ⚠ UNRESOLVED
                              </span>
                            )}
                            <span className="text-slate-500 text-[10px] block font-mono">
                              {msg.created_at ? new Date(msg.created_at).toLocaleString() : 'N/A'}
                            </span>
                          </div>
                        </td>

                        {/* RIGHT COLUMN: Message body with Save as Resolved action placed natively underneath */}
                        <td className="p-4 space-y-4">
                          <p className="text-[11px] text-slate-300 font-sans leading-relaxed break-words whitespace-pre-line">
                            {msg.message || 'No written content submitted.'}
                          </p>

                          <div className="pt-2 border-t border-white/5">
                            {msg.resolution !== 'resolved' ? (
                              <button 
                                onClick={() => handleResolveMessage(msg.id)} 
                                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-bold uppercase tracking-widest rounded-sm transition-all"
                              >
                                Save as Resolved
                              </button>
                            ) : (
                              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block">
                                Ticket Closed & Handled
                              </span>
                            )}
                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* DYNAMIC CURRICULUM NODES CREATOR DRAWER */}
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

            {/* Upload Progress Pipeline Bar */}
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
                <label className="text-[10px] text-slate-400 uppercase tracking-wider">Course ID Code (Workspace String)</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. csc-212"
                  value={formData.id}
                  onChange={e => setFormData({...formData, id: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                  className="w-full bg-white/5 border border-white/10 p-3 text-white focus:outline-none focus:border-blue-500 rounded-sm"
                />
              </div>

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
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider">Classification Category</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-[#111116] border border-white/10 p-3 text-white focus:outline-none focus:border-blue-500 rounded-sm"
                  >
                    <option value="Development">Development</option>
                    <option value="Design">Design</option>
                    <option value="Data & AI">Data & AI</option>
                    <option value="Security">Security</option>
                  </select>
                </div>

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
                <label className="text-[10px] text-slate-400 uppercase tracking-wider">Duration Block</label>
                <input 
                  type="text" 
                  placeholder="e.g. 6 weeks, 45 hours"
                  value={formData.duration}
                  onChange={e => setFormData({...formData, duration: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-3 text-white focus:outline-none focus:border-blue-500 rounded-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider">Short Framework Summary</label>
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
                
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block">Catalog Banner Image File</label>
                  <input 
                    required
                    type="file" 
                    accept="image/*"
                    onChange={e => setImageFile(e.target.files[0])}
                    className="w-full bg-white/5 border border-white/10 p-2 text-slate-400 file:bg-white/10 file:text-white file:border-0 file:px-2 file:py-0.5 file:mr-2 file:uppercase file:text-[9px] file:font-mono rounded-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block">Core Lesson Video File (.mp4, .mkv)</label>
                  <input 
                    required
                    type="file" 
                    accept="video/*"
                    onChange={e => setVideoFile(e.target.files[0])}
                    className="w-full bg-white/5 border border-white/10 p-2 text-slate-400 file:bg-white/10 file:text-white file:border-0 file:px-2 file:py-0.5 file:mr-2 file:uppercase file:text-[9px] file:font-mono rounded-sm"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={creatorLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 uppercase tracking-widest text-[10px] mt-4 disabled:opacity-50 transition-all rounded-sm"
              >
                {creatorLoading ? 'Deploying Media Assets...' : 'Execute Material & Entry Sync'}
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