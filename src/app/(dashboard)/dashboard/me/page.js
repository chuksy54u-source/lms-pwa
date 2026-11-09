'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function StudentProfileTab() {
  const [user, setUser] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [quizResults, setQuizResults] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [tutorState, setTutorState] = useState(null);
  const [onboarding, setOnboarding] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingTour, setUpdatingTour] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    async function fetchProfileData() {
      try {
        setLoading(true);
        setError(null);

        const meRes = await fetch('/api/v1/auth/me', { credentials: 'same-origin' });
        if (!meRes.ok) {
          throw new Error('Failed to load profile identity');
        }
        const meJson = await meRes.json();
        const meUser = meJson?.data || meJson;
        setUser(meUser);

        if (meUser && meUser.id) {
          const studentId = meUser.id;

          const [
            studentRes,
            dashRes,
            progressRes,
            resultsRes,
            certsRes,
            tutorRes,
            onboardingRes,
          ] = await Promise.allSettled([
            fetch(`/api/v1/students/${studentId}`, { credentials: 'same-origin' }),
            fetch(`/api/v1/students/${studentId}/dashboard`, { credentials: 'same-origin' }),
            fetch(`/api/v1/students/${studentId}/progress`, { credentials: 'same-origin' }),
            fetch(`/api/v1/students/${studentId}/results`, { credentials: 'same-origin' }),
            fetch(`/api/v1/students/${studentId}/certificates`, { credentials: 'same-origin' }),
            fetch(`/api/v1/students/${studentId}/tutor-state`, { credentials: 'same-origin' }),
            fetch(`/api/v1/students/${studentId}/onboarding`, { credentials: 'same-origin' }),
          ]);

          if (studentRes.status === 'fulfilled' && studentRes.value.ok) {
            const json = await studentRes.value.json();
            setStudentDetails(json.data || json);
          }

          if (dashRes.status === 'fulfilled' && dashRes.value.ok) {
            const json = await dashRes.value.json();
            setDashboardData(json.data || json);
          }

          if (progressRes.status === 'fulfilled' && progressRes.value.ok) {
            const json = await progressRes.value.json();
            setProgressData(json.data || json);
          }

          if (resultsRes.status === 'fulfilled' && resultsRes.value.ok) {
            const json = await resultsRes.value.json();
            const resList = json.data?.results || (Array.isArray(json.data) ? json.data : []);
            setQuizResults(resList);
          }

          if (certsRes.status === 'fulfilled' && certsRes.value.ok) {
            const json = await certsRes.value.json();
            const certList = json.data?.certificates || (Array.isArray(json.data) ? json.data : []);
            setCertificates(certList);
          }

          if (tutorRes.status === 'fulfilled' && tutorRes.value.ok) {
            const json = await tutorRes.value.json();
            setTutorState(json.data || json);
          }

          if (onboardingRes.status === 'fulfilled' && onboardingRes.value.ok) {
            const json = await onboardingRes.value.json();
            setOnboarding(json.data || json);
          }
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError(err.message || 'An error occurred while loading profile');
      } finally {
        setLoading(false);
      }
    }

    fetchProfileData();
  }, []);

  const handleToggleTour = async () => {
    if (!user?.id || !onboarding) return;
    try {
      setUpdatingTour(true);
      const nextStatus = !onboarding.tour_completed;
      const res = await fetch(`/api/v1/students/${user.id}/onboarding`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ tour_completed: nextStatus }),
      });
      if (res.ok) {
        const json = await res.json();
        setOnboarding(json.data || { ...onboarding, tour_completed: nextStatus });
      }
    } catch (err) {
      console.error('Failed to update onboarding:', err);
    } finally {
      setUpdatingTour(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse bg-slate-800/50 p-6 rounded-xl border border-slate-800 h-32"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="animate-pulse bg-slate-800/50 p-6 rounded-xl border border-slate-800 h-28"></div>
          <div className="animate-pulse bg-slate-800/50 p-6 rounded-xl border border-slate-800 h-28"></div>
          <div className="animate-pulse bg-slate-800/50 p-6 rounded-xl border border-slate-800 h-28"></div>
          <div className="animate-pulse bg-slate-800/50 p-6 rounded-xl border border-slate-800 h-28"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-900/20 border border-red-800 rounded-xl text-red-300">
        <h2 className="text-xl font-bold mb-2">Error Loading Profile</h2>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  const overallPercent = progressData?.overall_percent ?? dashboardData?.overall_percent ?? 0;
  const lessonsFinished = progressData?.lessons_finished ?? dashboardData?.lessons_finished ?? 0;
  const daysActive = progressData?.days_active ?? dashboardData?.days_active ?? 0;
  const mood = tutorState?.mood || tutorState?.state || 'Normal';

  return (
    <div className="space-y-6">
      {/* Header Profile Summary Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-300 font-bold text-2xl">
              {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {user?.full_name || 'Student Profile'}
              </h1>
              <p className="text-sm text-slate-400">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Role: {user?.role || 'student'}
                </span>
                {studentDetails?.level && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Level: {studentDetails.level}
                  </span>
                )}
                {user?.school && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                    School: {typeof user.school === 'object' ? user.school.name || user.school.id : user.school}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2">
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors font-medium border border-slate-700"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Overall Progress</p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white">{overallPercent}%</span>
            <span className="text-xs text-indigo-400">Completed</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${Math.min(100, Math.max(0, overallPercent))}%` }}></div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Finished Lessons</p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white">{lessonsFinished}</span>
            <span className="text-xs text-emerald-400">Lessons</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Days Active</p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white">{daysActive}</span>
            <span className="text-xs text-amber-400">Days</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Tutor Mood</p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-indigo-300 capitalize">{mood}</span>
            <span className="text-xs text-slate-400">AI State</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-800 flex space-x-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-1 transition-colors ${
            activeTab === 'overview'
              ? 'border-b-2 border-indigo-500 text-indigo-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Overview & Account
        </button>
        <button
          onClick={() => setActiveTab('quizzes')}
          className={`pb-3 px-1 transition-colors ${
            activeTab === 'quizzes'
              ? 'border-b-2 border-indigo-500 text-indigo-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Quiz Results ({quizResults.length})
        </button>
        <button
          onClick={() => setActiveTab('certificates')}
          className={`pb-3 px-1 transition-colors ${
            activeTab === 'certificates'
              ? 'border-b-2 border-indigo-500 text-indigo-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Certificates ({certificates.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
              Account Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400 text-xs">Full Name</p>
                <p className="text-white font-medium mt-1">{user?.full_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Email Address</p>
                <p className="text-white font-medium mt-1">{user?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">User ID</p>
                <p className="text-slate-300 font-mono text-xs mt-1 truncate">{user?.id || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Account Status</p>
                <p className="text-emerald-400 font-medium mt-1 capitalize">
                  {studentDetails?.status || 'Active'}
                </p>
              </div>
            </div>
          </div>

          {/* Onboarding & Preferences */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
              Onboarding & Preferences
            </h3>
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-800">
              <div>
                <p className="text-sm font-medium text-white">Platform Guided Tour</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Status: {onboarding?.tour_completed ? 'Completed' : 'Pending'}
                </p>
              </div>
              <button
                onClick={handleToggleTour}
                disabled={updatingTour || !onboarding}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium rounded transition-colors"
              >
                {updatingTour ? 'Updating...' : onboarding?.tour_completed ? 'Mark Incomplete' : 'Mark Completed'}
              </button>
            </div>
            {onboarding?.invoice && (
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-800 text-sm">
                <p className="text-xs font-medium text-slate-400">Onboarding Invoice</p>
                <p className="text-white mt-1">Status: {onboarding.invoice.status || 'Paid'}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'quizzes' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Quiz History & Assessment Results</h3>
          {quizResults.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              No quiz results recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3">Quiz Name</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {quizResults.map((result, idx) => (
                    <tr key={result.id || idx} className="hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-medium text-white">
                        {result.quiz_title || result.quiz_id || `Quiz #${idx + 1}`}
                      </td>
                      <td className="px-4 py-3 font-semibold text-indigo-400">
                        {result.score !== undefined ? `${result.score}%` : (result.points ?? 'N/A')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          (result.passed || (result.score && result.score >= 70))
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {result.passed || (result.score && result.score >= 70) ? 'Passed' : 'Completed'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {result.created_at ? new Date(result.created_at).toLocaleDateString() : 'Recent'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'certificates' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Earned Certificates</h3>
          {certificates.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              No certificates earned yet. Complete courses to earn verified certificates.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificates.map((cert, idx) => (
                <div key={cert.id || idx} className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-white text-base">{cert.course_title || cert.title || 'Course Certificate'}</h4>
                    <p className="text-xs text-slate-400 mt-1">Issued: {cert.issued_at ? new Date(cert.issued_at).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  {cert.url && (
                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded transition-colors"
                    >
                      View Certificate
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}