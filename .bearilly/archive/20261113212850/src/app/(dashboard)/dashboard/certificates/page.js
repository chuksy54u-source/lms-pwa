'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function CertificatesPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [earnedCertificates, setEarnedCertificates] = useState([]);

  useEffect(() => {
    const fetchCertificates = async () => {
      setLoading(true);
      try {
        const { data: { user }, authErr } = await supabase.auth.getUser();
        if (authErr || !user) return;

        // Simply read rows from the certificates table
        const { data: certsData, error: certsError } = await supabase
          .from('certificates')
          .select(`
            id,
            certificate_url,
            certificateimage_url,
            course_id,
            courses (
              title,
              category
            )
          `)
          .eq('user_id', user.id);

        if (certsError) throw certsError;
        setEarnedCertificates(certsData || []);

      } catch (err) {
        console.error("Error loading certificates registry:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [supabase]);

  if (loading) {
    return (
      <div className="p-4 font-mono text-xs text-slate-500 animate-pulse">
        Querying academic milestone registries...
      </div>
    );
  }

  return (
    <div 
      className="space-y-6 font-mono min-h-screen p-6 rounded-md relative bg-cover bg-center transition-all duration-300"
      style={{ 
        backgroundImage: `linear-gradient(to bottom, rgba(9, 9, 11, 0.75), rgba(9, 9, 11, 0.85)), url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1200&auto=format&fit=crop')` 
      }}
    >
      <div className="border border-white/10 bg-black/60 backdrop-blur-md p-6 rounded-sm relative z-10">
        <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
          Verified Credentials
        </span>
        <h2 className="text-xl font-bold uppercase tracking-tight text-white mt-3">
          Your Certifications
        </h2>
        <p className="text-slate-300 text-xs mt-1 font-sans">
          Review your secure completion credentials issued automatically upon full assignment verification.
        </p>
      </div>

      {earnedCertificates.length === 0 ? (
        <div className="border border-dashed border-white/10 p-12 text-center rounded-sm bg-black/40 backdrop-blur-sm relative z-10">
          <span className="text-2xl block mb-2">🎓</span>
          <p className="text-slate-400 text-xs max-w-xs mx-auto leading-relaxed">
            No certificates unlocked yet. Make sure your course submission is marked "verified" in your tracker and all course modules are finished.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
          {earnedCertificates.map((cert) => {
            const cardBgImage = cert.certificateimage_url || 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop';

            return (
              <div 
                key={cert.id} 
                className="relative border border-white/10 rounded-sm p-5 flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-all overflow-hidden group min-h-[200px] shadow-2xl"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url('${cardBgImage}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/75 z-1 pointer-events-none" />

                <div className="space-y-1.5 flex-1 relative z-10">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] text-white font-bold bg-black/80 px-1.5 py-0.5 rounded-sm uppercase tracking-wider border border-white/10">
                      ID: {cert.course_id}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase bg-black/80 px-2 py-0.5 rounded-sm border border-emerald-500/30">
                      ✓ Verified
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-start gap-4 pt-3">
                    <div className="space-y-1 max-w-[75%]">
                      <h4 className="text-sm font-bold text-white uppercase tracking-tight leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                        {cert.courses?.title || 'Unknown Curriculum Node'}
                      </h4>
                      <p className="text-[10px] text-slate-200 uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] font-bold">
                        Field: {cert.courses?.category || 'General'}
                      </p>
                    </div>

                    <div className="shrink-0 p-2 bg-amber-500/20 backdrop-blur-md border border-amber-500/40 rounded-sm text-amber-400 shadow-md group-hover:bg-amber-500/30 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14v7m-3 0h6M4.5 9h2.25M19.5 9h-2.25M6.75 6.75c0-1.242 1.008-2.25 2.25-2.25h6c1.242 0 2.25 1.008 2.25 2.25v4.5c0 1.242-1.008 2.25-2.25 2.25h-6c-1.242 0-2.25-1.008-2.25-2.25v-4.5Z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-end relative z-10">
                  <a 
                    href={cert.certificate_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-white hover:bg-slate-200 text-black font-bold uppercase text-[9px] tracking-wider rounded-sm transition-all shadow-xl"
                  >
                    View Credential File
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}