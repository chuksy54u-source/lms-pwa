'use client';
import { useState, useEffect } from 'react';

export default function CertificatesPage() {
  const [loading, setLoading] = useState(true);
  const [earnedCertificates, setEarnedCertificates] = useState([]);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      setLoading(true);
      try {
        const bearillyUrl = process.env.NEXT_PUBLIC_BEARILLY_URL || '';
        const token = typeof window !== 'undefined' ? (localStorage.getItem('bearilly_session_token') || localStorage.getItem('session_token')) : null;
        const studentId = typeof window !== 'undefined' ? (localStorage.getItem('bearilly_student_id') || localStorage.getItem('student_id')) : null;

        if (!studentId) {
          setLoading(false);
          return;
        }

        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const certsRes = await fetch(`${bearillyUrl}/api/v1/students/${studentId}/certificates`, { headers });
        if (!certsRes.ok) throw new Error('Failed to fetch certificates');

        const certsData = await certsRes.json();
        const list = Array.isArray(certsData) ? certsData : (certsData.certificates || []);
        setEarnedCertificates(list);
      } catch (err) {
        console.error("Error loading certificates registry:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  const handleVerify = async (e) => {
    e?.preventDefault?.();
    const trimmed = verifyCode.trim();
    if (!trimmed) return;
    setVerifying(true);
    setVerifyResult(null);
    try {
      const bearillyUrl = process.env.NEXT_PUBLIC_BEARILLY_URL || '';
      const res = await fetch(`${bearillyUrl}/api/v1/certificates/verify/${encodeURIComponent(trimmed)}`);
      if (res.ok) {
        const data = await res.json();
        setVerifyResult({ valid: true, ...data });
      } else {
        const errData = await res.json().catch(() => null);
        setVerifyResult({
          valid: false,
          message: errData?.error || errData?.message || 'Certificate code not found or invalid.'
        });
      }
    } catch {
      setVerifyResult({ valid: false, message: 'Network error communicating with verification registry.' });
    } finally {
      setVerifying(false);
    }
  };

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
            const cardBgImage = cert.certificateimage_url || cert.image_url || 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop';
            const courseTitle = cert.courses?.title || cert.course?.title || cert.title || 'Unknown Curriculum Node';
            const courseCategory = cert.courses?.category || cert.course?.category || cert.category || 'General';
            const courseId = cert.course_id || cert.course?.id || cert.id;
            const certUrl = cert.certificate_url || (cert.code ? `/dashboard/certificates/view?code=${encodeURIComponent(cert.code)}` : `/dashboard/certificates/view?id=${cert.id}`);

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
                      ID: {courseId}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase bg-black/80 px-2 py-0.5 rounded-sm border border-emerald-500/30">
                      ✓ Verified
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-start gap-4 pt-3">
                    <div className="space-y-1 max-w-[75%]">
                      <h4 className="text-sm font-bold text-white uppercase tracking-tight leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                        {courseTitle}
                      </h4>
                      <p className="text-[10px] text-slate-200 uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] font-bold">
                        Field: {courseCategory}
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
                    href={certUrl}
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

      {/* Verification Playground */}
      <div className="border border-white/10 bg-black/60 backdrop-blur-md p-6 rounded-sm relative z-10 space-y-4">
        <div>
          <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
            Verification Playground
          </span>
          <h3 className="text-sm font-bold uppercase tracking-tight text-white mt-2">
            Verify Certificate by Code
          </h3>
          <p className="text-slate-300 text-xs mt-1 font-sans">
            Instantly query any Bearilly certificate credential to validate its authenticity against the registry.
          </p>
        </div>

        <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-2 pt-1">
          <input
            type="text"
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value)}
            placeholder="ENTER CERTIFICATE CODE (E.G. CERT-1024-XYZ)"
            className="flex-1 bg-black/80 border border-white/10 px-3 py-2 text-xs text-white placeholder-slate-500 rounded-sm focus:outline-none focus:border-cyan-500/50 font-mono uppercase"
          />
          <button
            type="submit"
            disabled={verifying || !verifyCode.trim()}
            className="px-4 py-2 bg-white hover:bg-slate-200 disabled:opacity-50 text-black font-bold uppercase text-[9px] tracking-wider rounded-sm transition-all shadow-xl"
          >
            {verifying ? 'Verifying...' : 'Verify Credential'}
          </button>
        </form>

        {verifyResult && (
          <div className={`p-4 rounded-sm border text-xs font-mono space-y-1 ${
            verifyResult.valid 
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' 
              : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider">
                {verifyResult.valid ? '✓ Certificate Authenticated' : '✕ Verification Failed'}
              </span>
              {verifyResult.valid && (verifyResult.code || verifyCode) && (
                <span className="text-[9px] bg-black/60 px-1.5 py-0.5 rounded-sm border border-emerald-500/30">
                  CODE: {verifyResult.code || verifyCode.trim()}
                </span>
              )}
            </div>
            {verifyResult.valid ? (
              <div className="pt-2 text-slate-300 text-[11px] space-y-1 font-sans">
                <p><span className="text-white font-mono uppercase font-bold text-[10px]">Course:</span> {verifyResult.course_title || verifyResult.course?.title || verifyResult.title || 'Course Completed'}</p>
                {(verifyResult.student_name || verifyResult.recipient_name || verifyResult.full_name) && (
                  <p><span className="text-white font-mono uppercase font-bold text-[10px]">Recipient:</span> {verifyResult.student_name || verifyResult.recipient_name || verifyResult.full_name}</p>
                )}
                {(verifyResult.issued_at || verifyResult.created_at) && (
                  <p><span className="text-white font-mono uppercase font-bold text-[10px]">Issued:</span> {new Date(verifyResult.issued_at || verifyResult.created_at).toLocaleDateString()}</p>
                )}
                <div className="pt-2">
                  <a
                    href={`/dashboard/certificates/view?code=${encodeURIComponent(verifyResult.code || verifyCode.trim())}`}
                    className="inline-block px-3 py-1 bg-emerald-400 text-black font-bold uppercase text-[9px] tracking-wider rounded-sm hover:bg-emerald-300 transition-all font-mono"
                  >
                    Open Certificate View
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-rose-200 text-[11px] pt-1 font-sans">
                {verifyResult.message || 'The specified certificate code does not match any active record in the Bearilly registry.'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}