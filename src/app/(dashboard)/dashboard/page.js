'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DashboardHome() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeCoursesCount: 0,
    completedModulesCount: 0,
    totalModulesCount: 0,
    pendingAssignmentsCount: 0,
  });
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // School-specific auth check (e.g., Supabase)
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Exchange for Bearilly token
        const tokenRes = await fetch(`/api/v1/students/${session.user.id}/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        const { token } = await tokenRes.json();

        const headers = { 'Authorization': `Bearer ${token}` };

        const [dashboardRes, coursesRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BEARILLY_URL}/api/v1/students/${session.user.id}/dashboard`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_BEARILLY_URL}/api/v1/courses`, { headers })
        ]);

        const dashboard = await dashboardRes.json();
        const allCourses = await coursesRes.json();

        const activeCourses = dashboard.courses || [];
        const progressData = dashboard.progress || {};
        
        const coursesWithProgress = activeCourses.map(course => {
          const courseProgress = progressData[course.id] || { completed: 0, total: 0 };
          const percent = courseProgress.total > 0 
            ? Math.round((courseProgress.completed / courseProgress.total) * 100) 
            : 0;

          return {
            ...course,
            totalModulesCount: courseProgress.total,
            completedModulesCount: courseProgress.completed,
            progressPercent: percent
          };
        });

        setStats({
          activeCoursesCount: activeCourses.length,
          completedModulesCount: Object.values(progressData).reduce((acc, curr) => acc + curr.completed, 0),
          totalModulesCount: Object.values(progressData).reduce((acc, curr) => acc + curr.total, 0),
          pendingAssignmentsCount: dashboard.pending_assignments_count || 0,
        });

        setEnrolledCourses(coursesWithProgress);
        setNotifications(dashboard.notifications || []);
      } catch (err) {
        console.error("Dashboard integration error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="p-8 text-xs text-slate-400 font-mono min-h-screen bg-[#07070a] flex items-center justify-center">Loading dashboard environment...</div>;
  }

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
      <div className="border border-white/10 bg-[#111115] p-6 relative overflow-hidden">
        <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">Overview</span>
        <h2 className="text-xl font-bold uppercase tracking-tight text-white mt-1">Welcome Back to Ornate</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
          Track your course enrollment progress, review upcoming assignments, and access your training quizzes.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardStats.map((stat, index) => (
          <div key={index} className="border border-white/5 bg-[#111115] p-4 flex flex-col justify-between space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{stat.label}</span>
            <div className="text-2xl font-bold text-white tracking-tight">{stat.count}</div>
            <span className="text-xs text-slate-400 truncate">{stat.detail}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">My Active Courses ({enrolledCourses.length})</h3>
            <Link href="/dashboard/courses" className="text-xs font-bold text-blue-400 hover:underline">Explore More Courses →</Link>
          </div>

          <div className="space-y-4">
            {enrolledCourses.length > 0 ? (
              enrolledCourses.map((course) => (
                <div key={course.id} className="border border-white/10 bg-black/20 p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-blue-400 bg-blue-500/5 px-2 py-0.5 border border-blue-500/10 mr-2">{course.category || 'Development'}</span>
                      <span className="text-[10px] uppercase tracking-widest text-slate-400 bg-white/5 px-2 py-0.5 border border-white/5">{course.difficulty || 'Intermediate'}</span>
                      <h4 className="text-sm font-bold text-white mt-2">{course.title}</h4>
                    </div>
                    <span className="text-xs text-slate-400 bg-white/5 px-2 py-1 border border-white/5 font-mono whitespace-nowrap">{course.progressPercent}% Complete</span>
                  </div>
                  <div className="space-y-1">
                    <div className="h-1 bg-white/5 w-full relative overflow-hidden">
                      <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${course.progressPercent}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>{course.completedModulesCount} of {course.totalModulesCount} modules completed</span>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-1">
                    <Link href={`/dashboard/courses/${course.id}`} className="flex-1 text-center py-2.5 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all duration-300">Resume Course</Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="border border-white/5 bg-white/[0.01] p-8 text-center text-xs text-slate-500 font-mono">No active course enrollments detected.</div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="border-b border-white/5 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">Course Notifications</h3>
          </div>
          <div className="space-y-3">
            {notifications.length > 0 ? (
              notifications.map((ann) => (
                <div key={ann.id} className="border border-white/5 bg-[#111115] p-4 space-y-1">
                  <span className="text-[10px] uppercase text-red-400 font-bold block">• {ann.tag || 'SYSTEM'}</span>
                  <p className="text-xs text-slate-200 leading-snug font-sans">{ann.title}</p>
                </div>
              ))
            ) : (
              <div className="border border-white/5 bg-white/[0.01] p-6 text-center text-[11px] text-slate-500 font-mono">No active notifications.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}