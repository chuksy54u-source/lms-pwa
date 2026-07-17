'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  
  const [userName, setUserName] = useState('Loading...');
  const [userEmail, setUserEmail] = useState('');
  const [privileges, setPrivileges] = useState({ isInstructor: false, isAdmin: false });
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Determine what role context to display based on the URL pathname matches
  const isInstructorRoute = pathname.startsWith('/dashboard/instructor');
  const isAdminRoute = pathname.startsWith('/dashboard/admin');

  // Set visual badges and titles depending on where the user is
  let roleLabel = 'Student Profile';
  if (isInstructorRoute) roleLabel = 'Instructor Command';
  if (isAdminRoute) roleLabel = 'System Admin';

  useEffect(() => {
    const fetchUserSessionAndRoles = async () => {
      setCheckingAuth(true);
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        router.push('/login');
        return;
      }

      setUserEmail(user.email);

      // Resolve Display Name from Metadata or Fallback
      let nameToDisplay = user.user_metadata?.full_name;
      if (!nameToDisplay && user.email) {
        const emailPrefix = user.email.split('@')[0];
        nameToDisplay = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
      }
      setUserName(nameToDisplay || 'User');

      // Fetch role authorization flags from public profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_instructor, is_admin')
        .eq('id', user.id)
        .single();

      const userIsAdmin = !!profile?.is_admin;
      const userIsInstructor = !!profile?.is_instructor;

      setPrivileges({
        isInstructor: userIsInstructor,
        isAdmin: userIsAdmin
      });

      // Absolute Interception Shield: Kick non-admins out of admin paths
      if (pathname.startsWith('/dashboard/admin') && !userIsAdmin) {
        router.replace('/dashboard');
        return;
      }

      // Companion Shield: Kick non-instructors out of instructor paths
      if (pathname.startsWith('/dashboard/instructor') && !userIsInstructor && !userIsAdmin) {
        router.replace('/dashboard');
        return;
      }

      setCheckingAuth(false);
    };

    fetchUserSessionAndRoles();
  }, [router, pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Prevent layout shifts or leaking underlying components while checking permissions
  if (checkingAuth && (isAdminRoute || isInstructorRoute)) {
    return (
      <div className="min-h-screen bg-[#09090b] text-slate-400 font-mono text-xs flex items-center justify-center">
        Verifying network subsystem access permissions...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-100 flex antialiased font-sans">
      
      {/* Sidebar navigation */}
      <aside className="relative w-64 border-r border-white/5 bg-black/60 backdrop-blur-md flex flex-col justify-between p-6 shrink-0 hidden md:flex overflow-hidden">
        
        {/* Unsplash Background Image (70% visible) */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-70 pointer-events-none"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80')` 
          }}
        />
        {/* Overlay to maintain deep contrast and high readability */}
        <div className="absolute inset-0 bg-black/40 z-0 pointer-events-none" />

        {/* Sidebar Content (z-10 puts elements safely on top of background image) */}
        <div className="space-y-8 z-10 relative">
          
          {/* Dynamic User Profile Card */}
          <div className="border-b border-white/5 pb-4 space-y-1">
            <div className={`text-[10px] font-bold tracking-wider uppercase font-mono px-1.5 py-0.5 rounded-sm inline-block border ${
              isAdminRoute 
                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                : isInstructorRoute 
                  ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                  : 'bg-white/5 text-slate-500 border-white/5'
            }`}>
              {roleLabel}
            </div>
            <div className="pt-2">
              <div className="text-sm font-bold text-white truncate">
                {userName}
              </div>
              <div className="text-xs text-slate-400 truncate">
                {userEmail}
              </div>
            </div>
          </div>

          {/* Context-Aware Navigation Links */}
          <nav className="space-y-1">
            {isAdminRoute ? (
              <>
                {/* Admin Specific Links */}
                <Link 
                  href="/dashboard/admin" 
                  className={`block px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all font-mono ${
                    pathname === '/dashboard/admin' ? 'bg-white text-black' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  System Metrics
                </Link>
                <Link 
                  href="/dashboard" 
                  className="block px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all text-slate-500 hover:text-slate-300 font-mono pt-4 border-t border-white/5 mt-4"
                >
                  Student View
                </Link>
              </>
            ) : isInstructorRoute ? (
              <>
                {/* Instructor Specific Links */}
                <Link 
                  href="/dashboard/instructor" 
                  className={`block px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all font-mono ${
                    pathname === '/dashboard/instructor' ? 'bg-white text-black' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Control Center
                </Link>
                <Link 
                  href="/dashboard" 
                  className="block px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all text-slate-500 hover:text-slate-300 font-mono pt-4 border-t border-white/5 mt-4"
                >
                  Student View
                </Link>
              </>
            ) : (
              <>
                {/* Standard Student Links */}
                <Link 
                  href="/dashboard" 
                  className={`block px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                    pathname === '/dashboard' ? 'bg-white text-black' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/dashboard/courses" 
                  className={`block px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                    pathname.startsWith('/dashboard/courses') ? 'bg-white text-black' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Courses
                </Link>
                <Link 
                  href="/dashboard/certificates" 
                  className={`block px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                    pathname === '/dashboard/certificates' ? 'bg-white text-black' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Certificates
                </Link>

                {/* Conditional Quick-Jump Admin Link */}
                {privileges.isAdmin && (
                  <Link 
                    href="/dashboard/admin" 
                    className="block px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-all text-purple-400/70 hover:text-purple-400 hover:bg-purple-500/5 font-mono pt-4 border-t border-white/5 mt-4"
                  >
                    Root Admin Console
                  </Link>
                )}

                {/* Conditional Quick-Jump Instructor Link */}
                {privileges.isInstructor && (
                  <Link 
                    href="/dashboard/instructor" 
                    className={`block px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-all text-red-400/60 hover:text-red-400 hover:bg-red-500/5 font-mono ${
                      !privileges.isAdmin ? 'pt-4 border-t border-white/5 mt-4' : ''
                    }`}
                  >
                    Instructor Panel
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>

        {/* Logout */}
        <button 
          onClick={handleSignOut}
          className="w-full text-left px-3 py-2 text-xs font-bold uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-all font-mono z-10 relative"
        >
          Logout
        </button>
      </aside>

      {/* Main content viewport */}
      <main className="flex-1 p-8 overflow-y-auto max-w-6xl mx-auto w-full">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between border-b border-white/5 pb-4 mb-6">
          <div>
            <div className="text-xs font-bold text-white uppercase truncate max-w-[150px]">{userName}</div>
            <div className="text-[11px] text-slate-400">{userEmail}</div>
          </div>
          <button onClick={handleSignOut} className="text-xs text-red-400 font-bold uppercase font-mono">Exit</button>
        </div>

        {children}
      </main>

    </div>
  );
}