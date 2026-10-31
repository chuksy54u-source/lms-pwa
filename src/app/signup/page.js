'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignUp() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  
  const [isScholar, setIsScholar] = useState(false);
  const [scholarshipAmount, setScholarshipAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [inviteCode, setInviteCode] = useState('');
  
  const [loading, setLoading] = useState(false);

  const backgroundSlideshow = [
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1600&auto=format&fit=crop&q=80'
  ];

  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const bgTimer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgroundSlideshow.length);
    }, 6000);
    return () => clearInterval(bgTimer);
  }, []);

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (role === 'instructor') {
        alert('Instructor registration is currently handled by school administration.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName,
          invite_code: inviteCode
        }),
      });

      if (!response.ok) throw new Error('Registration failed');

      // TODO: Scholarship data (isScholar, scholarshipAmount, currency) is not currently 
      // supported by the Bearilly core registration flow. 
      // This data should be persisted via a separate PATCH /api/v1/students/:id 
      // call after the student is created, or handled via a custom school metadata flow.

      const isScholarStudent = role === 'student' && isScholar;
      if (isScholarStudent) {
        router.push('/verify-email-scholarship');
      } else {
        router.push('/verify-email');
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
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

      <div className="relative z-30 w-full max-w-md border border-white/10 bg-black/50 backdrop-blur-xl p-8 shadow-2xl space-y-5">
        
        <div className="text-center space-y-3">
          <div className="flex flex-col justify-center items-center relative select-none">
            <div className="flex items-center h-6 relative pr-6">
              <span className="text-xl font-bold tracking-tight text-blue-600 font-sans">
                o<span className="tracking-wide">rna</span><span className="text-blue-500 font-light">te</span>
              </span>
              <div className="absolute right-3 bottom-0 w-0.5 h-6 bg-white"></div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-0.5 bg-red-500"></div>
            </div>
            <span className="text-[10px] font-serif italic font-bold tracking-wider text-red-600 -mt-0.5 pl-0.5">
              Education
            </span>
          </div>
          <h2 className="text-sm font-bold uppercase tracking-widest pt-2 text-white">Registration Guidance</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Create your account by selecting your respective tracking role, providing your credentials and parsing system configurations.
          </p>
        </div>

        <div className="space-y-1 font-mono">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Account Pipeline Type</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => { setRole('student'); }}
              className={`py-2.5 text-xs font-bold uppercase tracking-wider transition-all border ${
                role === 'student' 
                  ? 'bg-white text-black border-white' 
                  : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20'
              }`}
            >
              Student Portal
            </button>
            <button
              type="button"
              onClick={() => { setRole('instructor'); setIsScholar(false); }}
              className={`py-2.5 text-xs font-bold uppercase tracking-wider transition-all border ${
                role === 'instructor' 
                  ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/20' 
                  : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20'
              }`}
            >
              Instructor Hub
            </button>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSignUpSubmit}>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
            <input 
              required
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className="w-full rounded-none border border-white/10 bg-white/5 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
            />
          </div>

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
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Password</label>
            <input 
              required
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-none border border-white/10 bg-white/5 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Invite Code</label>
            <input 
              required
              type="text" 
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="PASTE-THE-SCHOOLS-INVITE-CODE"
              className="w-full rounded-none border border-white/10 bg-white/5 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
            />
          </div>

          {role === 'student' && (
            <div className="space-y-3 pt-2 border-t border-white/10">
              <div className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  id="isScholarCheckbox"
                  checked={isScholar}
                  onChange={(e) => setIsScholar(e.target.checked)}
                  className="w-4 h-4 rounded-none accent-red-600 bg-white/5 border-white/20 focus:ring-0"
                />
                <label htmlFor="isScholarCheckbox" className="text-xs font-semibold text-slate-200 cursor-pointer select-none">
                  Are you a scholarship student?
                </label>
              </div>

              {isScholar && (
                <div className="p-3 bg-white/5 border border-white/10 space-y-3 animate-fadeIn">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 block">
                    Scholarship Details
                  </span>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 space-y-1">
                      <label className="text-[9px] font-bold uppercase text-slate-400">Currency</label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full rounded-none border border-white/10 bg-slate-900 px-2 py-2.5 text-xs text-white focus:border-red-500 focus:outline-none"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="NGN">NGN (₦)</option>
                        <option value="CAD">CAD ($)</option>
                      </select>
                    </div>

                    <div className="col-span-2 space-y-1">
                      <label className="text-[9px] font-bold uppercase text-slate-400">Award Amount</label>
                      <input
                        required={isScholar}
                        type="number"
                        min="0"
                        step="any"
                        value={scholarshipAmount}
                        onChange={(e) => setScholarshipAmount(e.target.value)}
                        placeholder="5000"
                        className="w-full rounded-none border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full rounded-none bg-red-600 py-3.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all duration-300 shadow-lg shadow-red-600/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : `Get Started As ${role}`}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/5 space-y-3">
          <div>
            Already have an account?{' '}
            <Link href="/login" className="text-blue-400 font-bold hover:underline">Sign In</Link>
          </div>
          
          <div className="pt-2 border-t border-white/5">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Experimental Access</p>
            <Link 
              href="/playground" 
              className="inline-block w-full py-2 border border-dashed border-white/20 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 hover:bg-white/5 hover:text-white transition-all"
            >
              Enter Playground
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}