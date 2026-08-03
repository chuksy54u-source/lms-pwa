'use client';
import Link from 'next/link';

export default function ScholarshipVerifyEmail() {
  return (
    <div className="min-h-screen relative overflow-hidden text-white antialiased font-sans flex items-center justify-center p-4 bg-black">
      
      {/* Background overlay design */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-950/30 via-black to-black" />

      <div className="relative z-10 w-full max-w-lg border border-white/10 bg-black/60 backdrop-blur-xl p-8 shadow-2xl text-center space-y-6">
        
        {/* Branding */}
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

        {/* Header Badge */}
        <div className="inline-block px-3 py-1 bg-red-600/20 border border-red-500/30 text-red-400 text-[10px] font-mono font-bold uppercase tracking-widest">
          Scholarship Program
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-white tracking-wide">
            Welcome, Honored Scholar! 🎓
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
            Congratulations on taking this significant step toward your educational journey with <strong className="text-white">Ornate Education</strong>. We are thrilled to partner with you and support your academic aspirations through our scholarship pipeline.
          </p>
        </div>

        {/* Email Verification Banner */}
        <div className="p-4 bg-white/5 border border-white/10 text-left space-y-2">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Action Required: Check Your Email</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            We have dispatched a verification link to your inbox. Please click the link inside to verify ownership of your account and initiate the administrative verification review process.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/login"
            className="inline-block text-xs font-mono text-slate-400 hover:text-white underline transition-colors"
          >
            ← Return to Sign In Page
          </Link>
        </div>
      </div>
    </div>
  );
}