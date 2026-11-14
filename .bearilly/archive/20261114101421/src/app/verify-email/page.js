'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyEmail() {
  const router = useRouter();
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

  const handleVerifyConfirm = (e) => {
    e.preventDefault();
    router.push('/login'); // Sends them to sign in once they verify
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

        <div className="space-y-2 pt-2">
          <h2 className="text-sm font-bold uppercase tracking-widest text-white">Verify Your Email</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            We've sent a verification magic link to your email address. Open your inbox and click the link to validate your student credentials.
          </p>
        </div>

        <div className="pt-2">
          <button 
            onClick={handleVerifyConfirm}
            className="w-full text-center rounded-none bg-red-600 py-3.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all duration-300 shadow-lg shadow-red-600/10"
          >
            Proceed to Log In
          </button>
        </div>

        <div className="text-[10px] text-slate-400 pt-2 border-t border-white/5">
          Didn't get the email? Check your spam folder or try re-submitting your sign up form.
        </div>
      </div>
    </div>
  );
}