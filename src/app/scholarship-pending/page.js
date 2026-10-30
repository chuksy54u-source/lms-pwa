'use client';
import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function ScholarshipPendingContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('pending');
  const [error, setError] = useState(null);

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
    if (token) {
      const baseUrl = process.env.NEXT_PUBLIC_BEARILLY_URL ? process.env.NEXT_PUBLIC_BEARILLY_URL.replace(/\/$/, '') : '';
      fetch(`${baseUrl}/api/v1/admissions/scholarship/status?token=${encodeURIComponent(token)}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error('Failed to fetch status');
          }
          return res.json();
        })
        .then((data) => {
          if (data.status) setStatus(data.status);
        })
        .catch(() => setError('Unable to verify current status.'));
    }
  }, [token]);

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

      <div className="relative z-30 w-full max-w-md border border-white/10 bg-black/50 backdrop-blur-xl p-8 shadow-2xl space-y-6 text-center">
        
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

        <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
          <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <div className="space-y-2 pt-1">
          <h2 className="text-sm font-bold uppercase tracking-widest text-white">
            {error ? 'Error' : 'Verification Pending'}
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            {error || 'Your email is confirmed! Your scholarship access request is currently being reviewed by the administration team.'}
          </p>
        </div>

        <div className="p-4 bg-white/5 border border-white/10 text-xs text-slate-300 leading-relaxed text-left space-y-2">
          <p className="font-semibold text-white uppercase text-[10px] tracking-wider font-mono">What happens next?</p>
          <p className="text-[11px] text-slate-400">
            An administrator will review your application credentials. Once verified, full access to the portal will be granted.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/login"
            className="w-full inline-block rounded-none bg-red-600 py-3.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all duration-300 shadow-lg shadow-red-600/10"
          >
            Go to Login
          </Link>
        </div>

        <div className="text-[10px] text-slate-400 pt-2 border-t border-white/5">
          Need assistance? Reach out to support if your account remains unverified.
        </div>
      </div>
    </div>
  );
}

export default function ScholarshipPending() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ScholarshipPendingContent />
    </Suspense>
  );
}