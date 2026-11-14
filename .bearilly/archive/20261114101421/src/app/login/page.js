'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client'; 

export default function Login() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const backgroundSlideshow = [
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&auto=format&fit=crop&q=80'
  ];

  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const bgTimer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgroundSlideshow.length);
    }, 6000);
    return () => clearInterval(bgTimer);
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      // 1. Authenticate user credentials
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError || !authData?.user) {
        setErrorMessage(authError?.message || 'Invalid login credentials.');
        setLoading(false);
        return;
      }

      const userId = authData.user.id;
      const userEmail = authData.user.email;

      // 2. Query scholarship_students directly by user_id OR email
      const { data: scholarRecord, error: scholarErr } = await supabase
        .from('scholarship_students')
        .select('id, status, user_id')
        .or(`user_id.eq.${userId},email.eq.${userEmail}`)
        .maybeSingle();

      if (scholarErr) {
        console.error("Scholarship query fault:", scholarErr.message);
      }

      // 3. BLOCK ACCESS if a scholarship record exists and status IS NOT 'verified'
      if (scholarRecord && scholarRecord.status !== 'verified') {
        // Revoke active auth session immediately
        await supabase.auth.signOut();
        setLoading(false);
        
        // Redirect unverified scholar
        router.replace('/scholarship-pending');
        return;
      }

      // Optional: Auto-link user_id if it wasn't linked previously
      if (scholarRecord && !scholarRecord.user_id) {
        await supabase
          .from('scholarship_students')
          .update({ user_id: userId })
          .eq('id', scholarRecord.id);
      }

      // 4. Check user profile for system permissions
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_instructor')
        .eq('id', userId)
        .single();

      // 5. Access Granted -> Redirect based on role
      setLoading(false);
      if (profile?.is_instructor) {
        router.push('/dashboard/instructor');
      } else {
        router.push('/dashboard');
      }

    } catch (err) {
      console.error("Login verification fault:", err);
      await supabase.auth.signOut();
      setLoading(false);
      setErrorMessage('An unexpected error occurred during account verification.');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden text-white selection:bg-red-500/20 antialiased font-sans flex items-center justify-center p-4">
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes subtleZoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.12); }
        }
        .animate-zoom {
          animation: subtleZoom 7000ms ease-out forwards;
        }
      `}} />

      <div className="absolute inset-0 z-0 bg-black">
        {backgroundSlideshow.map((imgUrl, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1500 ease-in-out ${
              idx === bgIndex ? 'opacity-100 z-10 animate-zoom' : 'opacity-0 z-0'
            }`}
            style={{ backgroundImage: `url('${imgUrl}')` }}
          />
        ))}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-20" />
      </div>

      <div className="relative z-30 w-full max-w-md border border-white/10 bg-black/50 backdrop-blur-xl p-8 shadow-2xl space-y-6">
        
        <div className="text-center space-y-3">
          <div className="flex flex-col justify-center items-center relative select-none">
            <div className="flex items-center h-6 relative pr-6">
              <span className="text-xl font-bold tracking-tight text-blue-600 font-sans">
                o<span className="tracking-wide">rna</span><span className="text-blue-500 font-light">te</span>
              </span>
              <div className="absolute right-3 bottom-0 w-0.5 h-6 bg-white"></div>
              <div className="absolute right-4 bottom-1 w-0.5 h-4 bg-white/60"></div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-0.5 bg-red-500"></div>
            </div>
            <span className="text-[10px] font-serif italic font-bold tracking-wider text-red-600 -mt-0.5 pl-0.5">
              Education
            </span>
          </div>
          <h2 className="text-sm font-bold uppercase tracking-widest pt-2 text-white">Login Instruction</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Welcome back! Sign in using your registered email address and password to continue your learning journey.
          </p>
        </div>

        {/* ERROR DISPLAY */}
        {errorMessage && (
          <div className="p-3 bg-red-600/20 border border-red-500/40 text-red-300 text-xs font-mono">
            {errorMessage}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleLoginSubmit}>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
            <input 
              required
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              className="w-full rounded-none border border-white/10 bg-white/5 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Password</label>
              <Link href="/forgot-password" className="text-[10px] text-red-400 hover:underline">Forgot Password?</Link>
            </div>
            <input 
              required
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-none border border-white/10 bg-white/5 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full rounded-none bg-red-600 py-3.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all duration-300 shadow-lg shadow-red-600/10 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'JOIN NOW'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/5">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-blue-400 font-bold hover:underline">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}