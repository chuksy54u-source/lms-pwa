'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function StudentProfile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Settings state
  const [darkMode, setDarkMode] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  useEffect(() => {
    async function loadStudentProfile() {
      try {
        setLoading(true);
        // Fetch student profile identity from the same-origin proxy
        const meRes = await fetch('/api/v1/auth/me', { credentials: 'same-origin' });
        if (!meRes.ok) {
          throw new Error('Failed to load user profile session.');
        }
        const meData = await meRes.json();
        setUser(meData);

        // Optionally fetch student dashboard summary details
        try {
          const dashRes = await fetch('/api/v1/student/dashboard', { credentials: 'same-origin' });
          if (dashRes.ok) {
            const dashData = await dashRes.json();
            setDashboardData(dashData);
          }
        } catch (dashErr) {
          // Dashboard summary fetch non-fatal
          console.warn('Dashboard summary not loaded:', dashErr);
        }
      } catch (err) {
        console.error('Error fetching student profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadStudentProfile();
  }, []);

  const handleLogout = async () => {
    try {
      // Clear local state and invoke identity provider / logout endpoint
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' }).catch(() => {});
    } finally {
      router.replace('/login');
    }
  };

  const certificatesCount = dashboardData?.certificates?.length || 0;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-500/20 antialiased font-sans flex flex-col relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation Header */}
      <nav className="relative z-50 border-b border-white/10 bg-black/60 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-red-500/20 group-hover:scale-105 transition-transform">
                  B
                </div>
                <span className="font-bold text-xl tracking-tight text-white group-hover:text-red-400 transition-colors">
                  Academy
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8 font-medium text-sm text-zinc-300">
              <Link href="/programs" className="hover:text-white transition-colors">Programs</Link>
              <Link href="/about" className="hover:text-white transition-colors">About</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
              <Link href="/me" className="text-red-400 font-semibold">My Account</Link>
            </div>

            {/* User Profile Badge / Mobile Menu Trigger */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-white/10 bg-zinc-950 px-4 pt-2 pb-6 space-y-3">
            <Link href="/programs" className="block py-2 text-zinc-300 hover:text-white">Programs</Link>
            <Link href="/about" className="block py-2 text-zinc-300 hover:text-white">About</Link>
            <Link href="/contact" className="block py-2 text-zinc-300 hover:text-white">Contact</Link>
            <Link href="/me" className="block py-2 text-red-400 font-semibold">My Account</Link>
          </div>
        )}
      </nav>

      {/* Main Profile Container */}
      <main className="relative z-10 flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 py-12 space-y-8" id="main">
        {loading ? (
          <div className="text-center py-24 space-y-4">
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-zinc-400 font-mono text-sm">Loading profile data...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-red-950/40 border border-red-500/30 text-center space-y-4">
            <p className="text-red-400 font-medium">Unable to load profile</p>
            <p className="text-sm text-zinc-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Student Hero Header */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-zinc-900/80 to-zinc-900/30 border border-white/10 backdrop-blur-xl text-center space-y-4 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-red-500/10 blur-2xl rounded-full pointer-events-none"></div>

              {/* Avatar Icon / Bear Art Placeholder */}
              <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 border-2 border-white/20 flex items-center justify-center text-4xl shadow-inner relative">
                <span>🎓</span>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold text-white tracking-tight">
                  {user?.full_name || 'Student Name'}
                </h1>
                <p className="text-sm text-zinc-400 font-medium">
                  {user?.school_name || 'Bearilly Partner School'}
                </p>
              </div>

              {/* Student Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {user?.student_code && (
                  <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono font-medium">
                    ID #{user.student_code}
                  </span>
                )}
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-xs font-mono">
                  {user?.email}
                </span>
              </div>
            </div>

            {/* Quick Actions & Student Hub */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                Academic Links
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  href="/me/certificates"
                  className="group p-5 rounded-2xl bg-zinc-900/40 border border-white/10 hover:border-red-500/30 hover:bg-zinc-900/70 transition-all flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-white group-hover:text-red-400 transition-colors">My Certificates</p>
                    <p className="text-xs text-zinc-400">
                      {certificatesCount > 0 ? `${certificatesCount} earned` : 'Finish a course to earn one'}
                    </p>
                  </div>
                  <span className="text-zinc-500 group-hover:text-white transition-colors">→</span>
                </Link>

                <Link
                  href="/tasks/grades"
                  className="group p-5 rounded-2xl bg-zinc-900/40 border border-white/10 hover:border-red-500/30 hover:bg-zinc-900/70 transition-all flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-white group-hover:text-red-400 transition-colors">My Grades</p>
                    <p className="text-xs text-zinc-400">Scores, submissions and averages</p>
                  </div>
                  <span className="text-zinc-500 group-hover:text-white transition-colors">→</span>
                </Link>

                <Link
                  href="/notifications"
                  className="group p-5 rounded-2xl bg-zinc-900/40 border border-white/10 hover:border-red-500/30 hover:bg-zinc-900/70 transition-all flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-white group-hover:text-red-400 transition-colors">Notifications</p>
                    <p className="text-xs text-zinc-400">Grades, deadlines and announcements</p>
                  </div>
                  <span className="text-zinc-500 group-hover:text-white transition-colors">→</span>
                </Link>

                <Link
                  href="/me/fees"
                  className="group p-5 rounded-2xl bg-zinc-900/40 border border-white/10 hover:border-red-500/30 hover:bg-zinc-900/70 transition-all flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-white group-hover:text-red-400 transition-colors">School Fees</p>
                    <p className="text-xs text-zinc-400">Invoices and payment status</p>
                  </div>
                  <span className="text-zinc-500 group-hover:text-white transition-colors">→</span>
                </Link>

                <Link
                  href="/me/legacy"
                  className="group p-5 rounded-2xl bg-zinc-900/40 border border-white/10 hover:border-red-500/30 hover:bg-zinc-900/70 transition-all flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-white group-hover:text-red-400 transition-colors">Link Previous Account</p>
                    <p className="text-xs text-zinc-400">Verify old school ID and link record history</p>
                  </div>
                  <span className="text-zinc-500 group-hover:text-white transition-colors">→</span>
                </Link>

                <Link
                  href="/play"
                  className="group p-5 rounded-2xl bg-zinc-900/40 border border-white/10 hover:border-red-500/30 hover:bg-zinc-900/70 transition-all flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-white group-hover:text-red-400 transition-colors">Playground</p>
                    <p className="text-xs text-zinc-400">Interactive games & classmate challenges</p>
                  </div>
                  <span className="text-zinc-500 group-hover:text-white transition-colors">→</span>
                </Link>
              </div>
            </div>

            {/* Account Settings */}
            <div className="space-y-4 pt-4">
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Preferences & Security
              </h2>
              <div className="space-y-3 rounded-2xl bg-zinc-900/30 border border-white/10 p-6 divide-y divide-white/10">
                <div className="flex items-center justify-between pb-4">
                  <div>
                    <p className="font-medium text-white">Dark Theme</p>
                    <p className="text-xs text-zinc-400">Use high contrast dark interface mode</p>
                  </div>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${darkMode ? 'bg-red-600' : 'bg-zinc-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </button>
                </div>

                <div className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium text-white">Push Notifications</p>
                    <p className="text-xs text-zinc-400">Receive real-time assignment reminders</p>
                  </div>
                  <button
                    onClick={() => setPushNotifications(!pushNotifications)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${pushNotifications ? 'bg-red-600' : 'bg-zinc-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${pushNotifications ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </button>
                </div>

                <div className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium text-white">Email Announcements</p>
                    <p className="text-xs text-zinc-400">Weekly progress & grade digest updates</p>
                  </div>
                  <button
                    onClick={() => setEmailAlerts(!emailAlerts)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${emailAlerts ? 'bg-red-600' : 'bg-zinc-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${emailAlerts ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </button>
                </div>

                <div className="pt-4 space-y-2">
                  <Link
                    href="/help"
                    className="flex items-center justify-between text-sm text-zinc-300 hover:text-white py-2"
                  >
                    <span>Help & Knowledge Base</span>
                    <span className="text-zinc-500">→</span>
                  </Link>
                  <Link
                    href="/change-password"
                    className="flex items-center justify-between text-sm text-zinc-300 hover:text-white py-2"
                  >
                    <span>Password & Privacy Settings</span>
                    <span className="text-zinc-500">→</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Logout Action */}
            <div className="pt-6 space-y-3">
              <button
                onClick={handleLogout}
                className="w-full py-4 rounded-xl border border-red-500/30 bg-red-950/20 hover:bg-red-900/30 text-red-400 font-semibold text-sm transition-all duration-200 shadow-lg"
              >
                Sign Out of Account
              </button>
              <p className="text-center text-xs text-zinc-500 font-mono">
                Powered by Bearilly LMS Integration
              </p>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black py-8 mt-16 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} Academy LMS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}