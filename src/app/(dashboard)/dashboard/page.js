'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DashboardHome() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/v1/auth/me');
        const json = await res.json();
        if (!json.data?.id) return;

        const dashRes = await fetch(`/api/v1/students/${json.data.id}/dashboard`);
        const dashJson = await dashRes.json();
        if (dashJson.data) {
          setData(dashJson.data);
        }
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

  const courses = data?.progress?.courses || [];
  const activeCoursesCount = courses.length;
  const completedModulesCount = courses.reduce((acc, c) => acc + (c.lessons_completed || 0), 0);
  const totalModulesCount = courses.reduce((acc, c) => acc + (c.lessons_total || 0), 0);
  const globalProgressPercent = totalModulesCount > 0 ? Math.round((completedModulesCount / totalModulesCount) * 100) : 0;

  const dashboardStats = [
    { label: 'Active Courses', count: activeCoursesCount, detail: `${activeCoursesCount} registered tracks` },
    { label: 'Completed Milestones', count: completedModulesCount, detail: `${completedModulesCount} / ${totalModulesCount} total modules complete` },
    { label: 'Pending Assignments', count: '0', detail: 'All clear' }, // TODO: Map to Bearilly tasks if available
    { label: 'Overall Progress', count: `${globalProgressPercent}%`, detail: 'Average across all courses' }
  ];

  return (
    <div className="space-y-8">
      <div className="border border-white/10 bg-[#111115] p-6 relative overflow-hidden">
        <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">
          Overview
        </span>
        <h2 className="text-xl font-bold uppercase tracking-tight text-white mt-1">Welcome Back to Ornate</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
          Track your course enrollment progress, review upcoming assignments, and access your training quizzes.
        </p>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">
              My Active Courses ({activeCoursesCount})
            </h3>
            <Link href="/dashboard/courses" className="text-xs font-bold text-blue-400 hover:underline">
              Explore More Courses →
            </Link>
          </div>

          <div className="space-y-4">
            {courses.length > 0 ? (
              courses.map((course) => (
                <div key={course.id} className="border border-white/10 bg-black/20 p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-blue-400 bg-blue-500/5 px-2 py-0.5 border border-blue-500/10 mr-2">
                        Course
                      </span>
                      <h4 className="text-sm font-bold text-white mt-2">
                        {course.title}
                      </h4>
                    </div>
                    <span className="text-xs text-slate-400 bg-white/5 px-2 py-1 border border-white/5 font-mono whitespace-nowrap">
                      {course.percent}% Complete
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="h-1 bg-white/5 w-full relative overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-300" 
                        style={{ width: `${course.percent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>{course.lessons_completed} of {course.lessons_total} modules completed</span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <Link 
                      href={`/dashboard/courses/${course.id}`}
                      className="flex-1 text-center py-2.5 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all duration-300"
                    >
                      Resume Course
                    </Link>
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

        <div className="space-y-4">
          <div className="border-b border-white/5 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">
              Course Notifications
            </h3>
          </div>
          <div className="border border-white/5 bg-white/[0.01] p-6 text-center text-[11px] text-slate-500 font-mono">
            No active system notifications or course updates.
          </div>
        </div>
      </div>
    </div>
  );
}