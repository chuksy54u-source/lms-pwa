'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Keep supabase instance stable using a ref to prevent unnecessary instantiations
  const supabaseRef = useRef(null);
  if (!supabaseRef.current) {
    supabaseRef.current = createClient();
  }
  const supabase = supabaseRef.current;
  
  const [userName, setUserName] = useState('Loading...');
  const [userEmail, setUserEmail] = useState('');
  const [privileges, setPrivileges] = useState({ isInstructor: false, isAdmin: false });
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  // Mobile navigation drawer toggle state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Determine role context based on URL pathname matches
  const isInstructorRoute = pathname.startsWith('/dashboard/instructor');
  const isAdminRoute = pathname.startsWith('/dashboard/admin');

  // Dynamic visual badges
  let roleLabel = 'Student Profile';
  if (isInstructorRoute) roleLabel = 'Instructor Command';
  if (isAdminRoute) roleLabel = 'System Admin';

  // Auto-close the mobile sidebar drawer when the user navigates
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    let isCurrentRequest = true;

    const fetchUserSessionAndRoles = async () => {
      try {
        setCheckingAuth(true);
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          if (isCurrentRequest) {
            router.push('/login');
          }
          return;
        }

        if (!isCurrentRequest) return;

        setUserEmail(user.email || '');

        // Resolve Display Name with a clean fallback chain
        let nameToDisplay = user.user_metadata?.full_name;
        if (!nameToDisplay && user.email) {
          const emailPrefix = user.email.split('@')[0];
          nameToDisplay = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
        }
        setUserName(nameToDisplay || 'User');

        // Fetch permissions safely from public profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_instructor, is_admin')
          .eq('id', user.id)
          .maybeSingle(); // Prevents throwing 406 errors on blank profile rows

        if (profileError) {
          console.error('Failed to resolve database security clear profile:', profileError.message);
        }

        const userIsAdmin = !!profile?.is_admin;
        const userIsInstructor = !!profile?.is_instructor;

        if (isCurrentRequest) {
          setPrivileges({
            isInstructor: userIsInstructor,
            isAdmin: userIsAdmin
          });
        }

        // Shield redirects: verify role limits before exposing content
        if (pathname.startsWith('/dashboard/admin') && !userIsAdmin) {
          if (isCurrentRequest) {
            router.replace('/dashboard');
          }
          return;
        }

        if (pathname.startsWith('/dashboard/instructor') && !userIsInstructor && !userIsAdmin) {
          if (isCurrentRequest) {
            router.replace('/dashboard');
          }
          return;
        }

        if (isCurrentRequest) {
          setCheckingAuth(false);
        }
      } catch (err) {
        console.error('Security verification execution exception:', err);
        if (isCurrentRequest) {
          router.push('/login');
        }
      }
    };

    fetchUserSessionAndRoles();

    // Clean up to resolve any concurrent async race conditions
    return () => {
      isCurrentRequest = false;
    };
  }, [router, pathname, supabase]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error during sign out procedure:', err);
    } finally {
      router.push('/login');
    }
  };

  // Prevent layout shifts or state leaks during route transitions
  if (checkingAuth && (isAdminRoute || isInstructorRoute)) {
    return (
      <div className="min-h-screen bg-[#09090b] text-slate-400 font-mono text-xs flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 bg-red-600 animate-pulse rounded-full" />
          <span>Verifying network subsystem access permissions...</span>
        </div>
      </div>
    );
  }

  // Helper render function to keep navigation DRY and consistent between PC and Mobile sidebars
  const renderNavLinks = () => {
    if (isAdminRoute) {
      return (
        <>
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
      );
    }

    if (isInstructorRoute) {
      return (
        <>
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
      );
    }

    return (
      <>
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
    );
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-100 flex antialiased font-sans">
      
      {/* Sidebar navigation (PC Only - Unchanged) */}
      <aside className="relative w-64 border-r border-white/5 bg-black/60 backdrop-blur-md flex flex-col justify-between p-6 shrink-0 hidden md:flex overflow-hidden">
        
        {/* Background Image Texture */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-40 pointer-events-none filter saturate-50"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80')` 
          }}
        />
        {/* Backdrop mask to maximize WCAG contrast ratings */}
        <div className="absolute inset-0 bg-black/80 z-0 pointer-events-none" />

        {/* Safe Sidebar Content Layer */}
        <div className="space-y-8 z-10 relative">
          
          {/* Dynamic User Profile Card */}
          <div className="border-b border-white/5 pb-4 space-y-1.5">
            <div className={`text-[10px] font-bold tracking-wider uppercase font-mono px-1.5 py-0.5 rounded-sm inline-block border ${
              isAdminRoute 
                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                : isInstructorRoute 
                  ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                  : 'bg-white/5 text-slate-400 border-white/5'
            }`}>
              {roleLabel}
            </div>
            <div className="pt-1">
              <div className="text-sm font-bold text-white truncate" title={userName}>
                {userName}
              </div>
              <div className="text-xs text-slate-400 truncate" title={userEmail}>
                {userEmail}
              </div>
            </div>
          </div>

          {/* Context-Aware Navigation Links */}
          <nav className="space-y-1">
            {renderNavLinks()}
          </nav>
        </div>

        {/* Sign Out Trigger */}
        <button 
          onClick={handleSignOut}
          className="w-full text-left px-3 py-2 text-xs font-bold uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-all font-mono z-10 relative"
        >
          Logout
        </button>
      </aside>

      {/* MOBILE DRAWER NAVIGATION MENU (Optimized for Mobile) */}
      <div className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
        isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        {/* Backdrop overlay */}
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        
        {/* Drawer panel */}
        <aside className={`absolute top-0 left-0 bottom-0 w-72 bg-[#09090b] border-r border-white/5 p-6 flex flex-col justify-between transition-transform duration-300 ease-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="space-y-8">
            {/* Header / Brand label & close button */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="space-y-1">
                <div className={`text-[9px] font-bold tracking-wider uppercase font-mono px-1.5 py-0.5 rounded-sm inline-block border ${
                  isAdminRoute 
                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                    : isInstructorRoute 
                      ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                      : 'bg-white/5 text-slate-400 border-white/5'
                }`}>
                  {roleLabel}
                </div>
                <div className="text-sm font-bold text-white truncate max-w-[180px]">{userName}</div>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-slate-400 hover:text-white p-1"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation options */}
            <nav className="space-y-2">
              {renderNavLinks()}
            </nav>
          </div>

          {/* Footer exit actions */}
          <div className="pt-6 border-t border-white/5 space-y-4">
            <div className="text-[11px] text-slate-500 truncate font-mono">{userEmail}</div>
            <button 
              onClick={handleSignOut}
              className="w-full text-center py-2 text-xs font-bold uppercase tracking-widest text-red-400 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded transition-all font-mono"
            >
              Logout
            </button>
          </div>
        </aside>
      </div>

      {/* Main content viewport */}
      <main className="flex-1 p-8 overflow-y-auto max-w-6xl mx-auto w-full">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between border-b border-white/5 pb-4 mb-6">
          <div className="flex items-center space-x-3">
            {/* Hamburger menu trigger */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1 -ml-1 text-slate-400 hover:text-white transition-colors"
              aria-label="Open navigation menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <div className="text-xs font-bold text-white uppercase truncate max-w-[150px]">{userName}</div>
              <div className="text-[11px] text-slate-400">{userEmail}</div>
            </div>
          </div>
          <button onClick={handleSignOut} className="text-xs text-red-400 font-bold uppercase font-mono">Exit</button>
        </div>

        {children}
      </main>

    </div>
  );
}