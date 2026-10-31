'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ScholarshipVerifyEmail() {
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const slug = params.get('slug');

    if (token && slug) {
      fetch(`/api/v1/admissions/${encodeURIComponent(slug)}/status?token=${encodeURIComponent(token)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
      })
        .then((res) => res.json())
        .then(() => {
          // Application tracking status verified via Bearilly proxy
        })
        .catch((err) => {
          console.error('Error fetching application status:', err);
        });
    }
  }, []);

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

      {/* Dynamic Background Slideshow */}
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

      {/* Main Glassmorphism Card */}
      <div className="relative z-30 w-full max-w-md border border-white/10 bg-black/50 backdrop-blur-xl p-8 shadow-2xl space-y-6 text-center">
        
        {/* Ornate Branding */}
        <div className="flex flex-col justify-center items-center relative select-none mx-auto">
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
        <div>
          <span className="inline-block px-3 py-1 bg-red-600/20 border border-red-500/30 text-red-400 text-[10px] font-mono font-bold uppercase tracking-widest">
            Scholarship Program
          </span>
        </div>

        {/* Welcome Text */}
        <div className="space-y-2 pt-1">
          <h2 className="text-sm font-bold uppercase tracking-widest text-white">
            Welcome, Honored Scholar 🎓
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Congratulations on taking this step with <strong className="text-white">Ornate Education</strong>. We are thrilled to support your academic aspirations through our scholarship pipeline.
          </p>
        </div>

        {/* Email Verification Banner */}
        <div className="p-4 bg-white/5 border border-white/10 text-left space-y-2">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="uppercase text-[10px] tracking-wider font-mono">Action Required</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            We have dispatched a verification link to your inbox. Please click the link inside to verify ownership of your account and initiate administrative review.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link
            href="/login"
            className="w-full inline-block rounded-none bg-red-600 py-3.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all duration-300 shadow-lg shadow-red-600/10"
          >
            Proceed to Log In
          </Link>
        </div>

        {/* Footer Subtext */}
        <div className="text-[10px] text-slate-400 pt-2 border-t border-white/5">
          Didn't receive the email? Check your spam folder or contact admissions.
        </div>
      </div>
    </div>
  );
}