'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ChangePassword() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch('/api/v1/auth/me', {
          credentials: 'same-origin',
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Session check failed:', error);
        router.push('/');
      }
    }
    checkSession();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/v1/auth/password', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update password.');
      }

      setSuccessMsg('Password updated successfully.');
      setTimeout(() => {
        const homePath = user?.role === 'student' ? '/me' : '/';
        router.push(homePath);
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-500/20 antialiased font-sans flex flex-col relative overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slideUp 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 md:px-12 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <Link href="/" className="text-2xl font-bold tracking-tighter hover:opacity-80 transition-opacity">
          SCHOOL<span className="text-red-600">.</span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium tracking-wide">
          <Link href="/programs" className="hover:text-red-500 transition-colors">PROGRAMS</Link>
          <Link href="/about" className="hover:text-red-500 transition-colors">ABOUT</Link>
          <Link href="/contact" className="hover:text-red-500 transition-colors">CONTACT</Link>
          <Link href={user?.role === 'student' ? '/me' : '/'} className="px-5 py-2 bg-white text-black rounded-full hover:bg-red-600 hover:text-white transition-all duration-300">
            DASHBOARD
          </Link>
        </div>

        <button 
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <div className={`w-6 h-0.5 bg-white mb-1.5 transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></div>
          <div className={`w-6 h-0.5 bg-white mb-1.5 ${mobileMenuOpen ? 'opacity-0' : ''}`}></div>
          <div className={`w-6 h-0.5 bg-white transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></div>
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center space-y-8 text-2xl font-bold animate-slide-up">
          <button onClick={() => setMobileMenuOpen(false)} className="absolute top-8 right-8 text-sm font-normal border border-white/20 px-4 py-2 rounded-full">CLOSE</button>
          <Link href="/programs" onClick={() => setMobileMenuOpen(false)}>PROGRAMS</Link>
          <Link href="/about" onClick={() => setMobileMenuOpen(false)}>ABOUT</Link>
          <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>CONTACT</Link>
          <Link href={user?.role === 'student' ? '/me' : '/'} onClick={() => setMobileMenuOpen(false)} className="text-red-500">DASHBOARD</Link>
        </div>
      )}

      <main className="flex-grow flex items-center justify-center px-6 py-20 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="w-full max-w-md z-10 animate-slide-up">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold tracking-tight mb-3">
              {user?.must_change_password ? 'Set your own password' : 'Change password'}
            </h1>
            <p className="text-gray-400">
              {user?.must_change_password 
                ? 'You signed in with a temporary password. Choose your own to continue.' 
                : 'Choose a new password for your account.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-widest text-gray-500 uppercase ml-1">New Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-red-500 transition-colors placeholder:text-gray-700"
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold tracking-widest text-gray-500 uppercase ml-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-red-500 transition-colors placeholder:text-gray-700"
                placeholder="••••••••"
              />
            </div>

            {errorMsg && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm">
                {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-red-600 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'UPDATING...' : 'UPDATE PASSWORD'}
            </button>

            {!user?.must_change_password && (
              <div className="text-center">
                <Link href={user?.role === 'student' ? '/me' : '/'} className="text-sm text-gray-500 hover:text-white transition-colors">
                  Cancel and return
                </Link>
              </div>
            )}
          </form>
        </div>
      </main>

      <footer className="px-6 py-12 md:px-12 border-t border-white/5 bg-black z-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-xl font-bold tracking-tighter">
            SCHOOL<span className="text-red-600">.</span>
          </div>
          <div className="flex space-x-8 text-xs font-medium tracking-widest text-gray-500 uppercase">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <span className="text-gray-800">© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}