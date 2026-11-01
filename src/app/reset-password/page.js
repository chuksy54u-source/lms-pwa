'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

export default function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [state, setState] = useState('checking'); // checking | ready | expired | success
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState(2026);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  useEffect(() => {
    if (!supabase) {
      setState('ready');
      return;
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) {
        setState('ready');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setState('ready');
      } else {
        const timer = setTimeout(() => {
          setState((prev) => (prev === 'checking' ? 'expired' : prev));
        }, 2000);
        return () => clearTimeout(timer);
      }
    });

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      let sessionAccessToken = null;

      if (supabase) {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
          throw new Error(error.message || 'Failed to reset password.');
        }
        const currentSession = (await supabase.auth.getSession())?.data?.session;
        sessionAccessToken = currentSession?.access_token;
      }

      if (sessionAccessToken) {
        // Exchange verified provider identity with Bearilly login bridge
        const bridgeRes = await fetch('/api/bearilly-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ access_token: sessionAccessToken }),
        });

        if (bridgeRes.ok) {
          await fetch('/api/v1/auth/me', { credentials: 'same-origin' });
        }
      }

      setState('success');
      setSuccessMsg('Your password has been updated successfully.');
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred while updating your password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-500/20 antialiased font-sans flex flex-col relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-red-600/10 blur-[120px] pointer-events-none rounded-full" />

      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-600/20 group-hover:scale-105 transition-transform">
              <span className="font-bold text-white text-xl">B</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-white group-hover:text-red-400 transition-colors">
              BEARILLY
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <Link href="/programs" className="hover:text-white transition-colors">
              Programs
            </Link>
            <Link href="/about" className="hover:text-white transition-colors">
              About
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-colors"
            >
              Sign In
            </Link>
          </nav>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white focus:outline-none"
            aria-label="Toggle Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-b border-white/10 bg-black/95 px-6 py-4 space-y-3">
            <Link href="/programs" className="block text-gray-300 hover:text-white py-1">
              Programs
            </Link>
            <Link href="/about" className="block text-gray-300 hover:text-white py-1">
              About
            </Link>
            <Link href="/contact" className="block text-gray-300 hover:text-white py-1">
              Contact
            </Link>
            <Link href="/login" className="block text-gray-300 hover:text-white py-1">
              Sign In
            </Link>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-6 py-16 z-10">
        <div className="w-full max-w-md bg-neutral-900/60 border border-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl shadow-red-950/20">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-4">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Choose a new password</h1>
            <p className="text-sm text-gray-400 mt-2">
              {state === 'expired'
                ? 'Your reset link is invalid or has expired.'
                : 'Make it something secure that you will remember.'}
            </p>
          </div>

          {state === 'checking' && (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm text-gray-400">Checking your reset link…</p>
            </div>
          )}

          {state === 'expired' && (
            <div className="space-y-4 text-center">
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                This password reset link has expired or was already used.
              </div>
              <Link
                href="/login"
                className="block w-full text-center bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg transition-all shadow-lg shadow-red-600/30"
              >
                Back to sign in
              </Link>
            </div>
          )}

          {state === 'success' && (
            <div className="space-y-4 text-center">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm">
                {successMsg || 'Your password has been updated successfully.'}
              </div>
              <Link
                href="/login"
                className="block w-full text-center bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg transition-all shadow-lg shadow-red-600/30"
              >
                Sign in to your account
              </Link>
            </div>
          )}

          {state === 'ready' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Updating password…</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>

              <div className="text-center pt-2">
                <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/60 backdrop-blur-md py-8 text-center text-sm text-gray-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {currentYear} BEARILLY. All rights reserved.</p>
          <div className="flex items-center gap-6 text-xs text-gray-400">
            <Link href="/about" className="hover:text-white transition-colors">
              About
            </Link>
            <Link href="/programs" className="hover:text-white transition-colors">
              Programs
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}