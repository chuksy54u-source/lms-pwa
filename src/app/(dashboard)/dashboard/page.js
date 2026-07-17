'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function DashboardHome() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  
  // Aggregate Stats
  const [stats, setStats] = useState({
    activeCoursesCount: 0,
    completedModulesCount: 0,
    totalModulesCount: 0,
    pendingAssignmentsCount: 0,
  });
  
  // List of all active courses with their individual titles, details, and dynamic progress calculated
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // 1. Resolve current authenticated user session
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          console.error("Authentication error or missing user context:", authError?.message);
          setLoading(false);
          return;
        }

        // 2. Fetch all approved course enrollments for this user
        const { data: enrollmentsData } = await supabase
          .from('enrollments')
          .select('course_id')
          .eq('user_id', user.id)
          .eq('status', 'approved');

        const activeCourseIds = enrollmentsData?.map(e => e.course_id) || [];

        if (activeCourseIds.length === 0) {
          setStats({
            activeCoursesCount: 0,
            completedModulesCount: 0,
            totalModulesCount: 0,
            pendingAssignmentsCount: 0,
          });
          setEnrolledCourses([]);
          setNotifications([]);
          setLoading(false);
          return;
        }

        // 3. Parallel fetch of all related course details, modules, user progress, assignments, and notifications
        const [coursesRes, modulesRes, progressRes, assignmentsRes, notesRes] = await Promise.all([
          // Get all course columns
          supabase
            .from('courses')
            .select('id, title, category, duration, difficulty, banner, description, notes_url, video_url')
            .in('id', activeCourseIds),
          
          // Get all modules belonging to any of these courses
          supabase
            .from('modules')
            .select('id, title, sort_order, course_id')
            .in('course_id', activeCourseIds),
          
          // Get completed progress records for these courses
          supabase
            .from('user_progress')
            .select('module_id, course_id')
            .eq('user_id', user.id)
            .in('course_id', activeCourseIds)
            .not('completed_at', 'is', null),
          
          // Get assignments belonging to any of these courses
          supabase
            .from('assignments')
            .select('id')
            .in('course_id', activeCourseIds),

          // Get system-wide or targeted course notifications
          supabase
            .from('notifications')
            .select('*')
            .or(`course_id.in.(${activeCourseIds.map(id => `"${id}"`).join(',')}),course_id.is.null`)
            .order('created_at', { ascending: false })
        ]);

        const rawCourses = coursesRes.data || [];
        const rawModules = modulesRes.data || [];
        const rawProgress = progressRes.data || [];
        const rawAssignments = assignmentsRes.data || [];
        const liveNotifications = notesRes.data || [];

        // 4. Calculate Individual Progress Per Course
        const coursesWithProgress = rawCourses.map(course => {
          // Filter modules belonging to this specific course
          const courseModules = rawModules.filter(mod => mod.course_id === course.id);
          const totalCourseModules = courseModules.length;

          // Filter completed progress records for this specific course
          const completedCourseModules = rawProgress.filter(prog => prog.course_id === course.id).length;

          // Calculate percentage
          const percent = totalCourseModules > 0 
            ? Math.round((completedCourseModules / totalCourseModules) * 100) 
            : 0;

          return {
            ...course,
            totalModulesCount: totalCourseModules,
            completedModulesCount: completedCourseModules,
            progressPercent: percent
          };
        });

        // 5. Calculate Global Aggregate Stats
        const totalCompletedModules = rawProgress.length;
        const totalSystemModules = rawModules.length;

        setStats({
          activeCoursesCount: rawCourses.length,
          completedModulesCount: totalCompletedModules,
          totalModulesCount: totalSystemModules,
          pendingAssignmentsCount: rawAssignments.length,
        });

        setEnrolledCourses(coursesWithProgress);
        setNotifications(liveNotifications);

      } catch (err) {
        console.error("Dashboard backend integration error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [supabase]);

  if (loading) {
    return <div className="p-8 text-xs text-slate-400 font-mono min-h-screen bg-[#07070a] flex items-center justify-center">Loading dashboard environment...</div>;
  }

  // overall average aggregate completion percentage 
  const globalProgressPercent = stats.totalModulesCount > 0 
    ? Math.round((stats.completedModulesCount / stats.totalModulesCount) * 100) 
    : 0;

  const dashboardStats = [
    { label: 'Active Courses', count: stats.activeCoursesCount, detail: `${stats.activeCoursesCount} registered tracks` },
    { label: 'Completed Milestones', count: stats.completedModulesCount, detail: `${stats.completedModulesCount} / ${stats.totalModulesCount} total modules complete` },
    { label: 'Pending Assignments', count: stats.pendingAssignmentsCount, detail: stats.pendingAssignmentsCount > 0 ? 'Action required' : 'All clear' },
    { label: 'Overall Progress', count: `${globalProgressPercent}%`, detail: 'Average across all courses' }
  ];

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="border border-white/10 bg-[#111115] p-6 relative overflow-hidden">
        <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">
          Overview
        </span>
        <h2 className="text-xl font-bold uppercase tracking-tight text-white mt-1">Welcome Back to Ornate</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
          Track your course enrollment progress, review upcoming assignments, and access your training quizzes.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardStats.map((stat, index) => (
          <div key={index} className="border border-white/5 bg-[#111115] p-4 flex flex-col justify-between space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {stat.label}
            </span>
            <div className="text-2xl font-bold text-white tracking-tight">
              {stat.count}
            </div>
            <span className="text-xs text-slate-400 truncate">
              {stat.detail}
            </span>
          </div>
        ))}
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Active Courses Tracker Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">
              My Active Courses ({enrolledCourses.length})
            </h3>
            <Link href="/dashboard/courses" className="text-xs font-bold text-blue-400 hover:underline">
              Explore More Courses →
            </Link>
          </div>

          <div className="space-y-4">
            {enrolledCourses.length > 0 ? (
              enrolledCourses.map((course) => (
                <div key={course.id} className="border border-white/10 bg-black/20 p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-blue-400 bg-blue-500/5 px-2 py-0.5 border border-blue-500/10 mr-2">
                        {course.category || 'Development'}
                      </span>
                      <span className="text-[10px] uppercase tracking-widest text-slate-400 bg-white/5 px-2 py-0.5 border border-white/5">
                        {course.difficulty || 'Intermediate'}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-2">
                        {course.title}
                      </h4>
                      {course.description && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 max-w-lg">
                          {course.description}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 bg-white/5 px-2 py-1 border border-white/5 font-mono whitespace-nowrap">
                      {course.progressPercent}% Complete
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="h-1 bg-white/5 w-full relative overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-300" 
                        style={{ width: `${course.progressPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>{course.completedModulesCount} of {course.totalModulesCount} modules completed</span>
                      <span>Duration: {course.duration || 'Flexible'}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <Link 
                      href={`/dashboard/courses/${course.id}`}
                      className="flex-1 text-center py-2.5 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all duration-300"
                    >
                      Resume Course
                    </Link>
                    {course.notes_url && (
                      <a 
                        href={course.notes_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2.5 border border-white/10 hover:border-white/20 text-slate-300 text-xs font-mono uppercase text-center hover:bg-white/5 transition-all"
                      >
                        Notes
                      </a>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="border border-white/5 bg-white/[0.01] p-8 text-center text-xs text-slate-500 font-mono">
                No active course enrollments detected. Explore the courses catalog to begin.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Live Updates Feed */}
        <div className="space-y-4">
          <div className="border-b border-white/5 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">
              Course Notifications
            </h3>
          </div>

          <div className="space-y-3">
            {notifications.length > 0 ? (
              notifications.map((ann) => (
                <div key={ann.id} className="border border-white/5 bg-[#111115] p-4 space-y-1">
                  <span className="text-[10px] uppercase text-red-400 font-bold block">
                    • {ann.tag || 'SYSTEM'}
                  </span>
                  <p className="text-xs text-slate-200 leading-snug font-sans">
                    {ann.title}
                  </p>
                  <span className="text-[10px] text-slate-500 block pt-1 font-mono">
                    {ann.time || (ann.created_at ? new Date(ann.created_at).toLocaleDateString() : '')}
                  </span>
                </div>
              ))
            ) : (
              <div className="border border-white/5 bg-white/[0.01] p-6 text-center text-[11px] text-slate-500 font-mono">
                No active system notifications or course updates.
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}