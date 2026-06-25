'use client';
import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function ForgotPassword() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    // Request Supabase to send a recovery email
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/dashboard`, // Sends them straight to layout/dashboard upon link confirmation
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      setMessage('A secure recovery link has been dispatched to your email inbox.');
      setEmail('');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md border border-white/10 bg-black/40 backdrop-blur-md p-8 space-y-6">
        
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 font-mono">Account Recovery</span>
          <h2 className="text-xl font-bold uppercase tracking-tight text-white mt-1">Reset Access Token</h2>
          <p className="text-xs text-slate-400 mt-1">Provide your registered email coordinate node to generate a workspace recovery path.</p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">Email Coordinates</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-white/5 border border-white/10 px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-white transition-all font-mono"
            />
          </div>

          {error && (
            <div className="text-[11px] font-mono text-red-400 bg-red-500/10 border border-red-500/20 p-3">
              ⚠️ System Error: {error}
            </div>
          )}

          {message && (
            <div className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3">
              ✅ Link Dispatched: {message}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full text-center py-3 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-all disabled:opacity-50 font-mono"
          >
            {loading ? 'Processing Pipeline...' : 'Request Recovery Link'}
          </button>
        </form>

        <div className="text-center pt-2">
          <Link href="/login" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-all font-mono">
            ← Abort and Return to Auth Node
          </Link>
        </div>

      </div>
    </div>
  );
}