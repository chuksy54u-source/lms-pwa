'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function CertificateViewerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const courseId = searchParams.get('verified_id');
  const userId = searchParams.get('user');

  const [loading, setLoading] = useState(true);
  const [panelData, setPanelData] = useState(null);

  useEffect(() => {
    if (!courseId || !userId) {
      setLoading(false);
      return;
    }

    const fetchReviewDetails = async () => {
      setLoading(true);
      try {
        // Retrieve the short-lived session token from cookies (set by the school's server-side auth exchange)
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('bearilly_session='))
          ?.split('=')[1];

        // Fetch student dashboard data via Bearilly API using the browser-safe URL and session token
        const response = await fetch(`${process.env.NEXT_PUBLIC_BEARILLY_URL}/api/v1/students/${userId}/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Failed to fetch student data');
        const data = await response.json();

        // Locate specific course/certificate in the student's dashboard
        const cert = data.certificates?.find(c => c.course_id === courseId);
        const course = data.courses?.find(c => c.id === courseId);
        const result = data.results?.find(r => r.course_id === courseId);

        if (course) {
          setPanelData({
            courseTitle: course.title,
            courseCategory: course.category || 'General',
            courseDescription: course.description || 'No course curriculum node description logged.',
            studentName: data.full_name || 'Distinguished Student',
            assignmentFile: result?.document_url || '#',
            assignmentScore: result?.score || result?.grade || '100%',
            submittedAt: result?.created_at ? new Date(result.created_at).toLocaleDateString('en-US', {
              year: 'numeric', month: 'short', day: 'numeric'
            }) : 'Verified Node',
            issuedAt: cert?.issued_at ? new Date(cert.issued_at).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric'
            }) : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            cardVisual: cert?.certificateimage_url || 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop'
          });
        }
      } catch (err) {
        console.error('Error compiling verification parameters:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviewDetails();
  }, [courseId, userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070a] text-slate-400 flex items-center justify-center font-mono text-xs">
        Compiling performance review nodes...
      </div>
    );
  }

  if (!panelData) {
    return (
      <div className="min-h-screen bg-[#07070a] text-slate-400 flex flex-col items-center justify-center font-mono text-xs space-y-4">
        <p>⚠️ Missing or invalid performance validation variables.</p>
        <button onClick={() => router.push('/dashboard/certificates')} className="text-amber-500 underline uppercase tracking-widest text-[10px]">
          Return to Hub
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d12] text-slate-200 p-6 md:p-12 flex flex-col items-center justify-start font-mono">
      <div className="w-full max-w-4xl flex justify-between items-center border border-white/10 bg-black/40 p-4 mb-8 rounded-sm backdrop-blur-md">
        <button 
          onClick={() => router.push('/dashboard/certificates')}
          className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
        >
          ← Return to Credentials Hub
        </button>
        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-sm uppercase tracking-widest animate-pulse">
          ✓ Secure Assessment Record
        </span>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-1 relative border border-white/10 rounded-sm p-5 min-h-[220px] flex flex-col justify-between overflow-hidden shadow-2xl group">
          <div 
            className="absolute inset-0 bg-cover bg-center z-0"
            style={{ backgroundImage: `url('${panelData.cardVisual}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/80 to-black z-1" />

          <div className="relative z-10 flex justify-between items-start">
            <span className="text-[8px] font-bold uppercase text-white bg-black/60 border border-white/10 px-1.5 py-0.5 rounded-sm">
              Node: {courseId}
            </span>
            <span className="text-[9px] text-amber-400 font-bold uppercase bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-sm">
              Certified
            </span>
          </div>

          <div className="relative z-10 space-y-1 pt-12">
            <h3 className="text-sm font-bold uppercase tracking-tight text-white leading-snug drop-shadow-md">
              {panelData.courseTitle}
            </h3>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              {panelData.courseCategory}
            </p>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="border border-white/10 bg-black/20 p-6 rounded-sm space-y-3">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest block font-bold">Curriculum Focus</span>
            <h2 className="text-xl font-bold uppercase tracking-tight text-white">{panelData.courseTitle}</h2>
            <p className="text-slate-400 text-xs leading-relaxed font-sans font-light">{panelData.courseDescription}</p>
          </div>

          <div className="border border-white/10 bg-black/40 p-6 rounded-sm space-y-4">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest block font-bold">Performance Analytics</span>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-b border-white/5 py-4">
              <div className="space-y-1">
                <span className="text-[8px] text-slate-500 uppercase tracking-wider block">Student Graduate</span>
                <span className="text-xs font-bold text-white uppercase">{panelData.studentName}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[8px] text-slate-500 uppercase tracking-wider block">Submission Evaluation</span>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">{panelData.assignmentScore}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[8px] text-slate-500 uppercase tracking-wider block">Upload Date</span>
                <span className="text-xs font-bold text-slate-300">{panelData.submittedAt}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
              <div className="space-y-0.5">
                <span className="text-[8px] text-slate-500 uppercase tracking-wider block">Archived Deliverable</span>
                <a 
                  href={panelData.assignmentFile} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs text-amber-400 hover:underline inline-flex items-center gap-1 font-bold"
                >
                  View Submitted Assignment Sheet ↗
                </a>
              </div>

              <div className="text-left sm:text-right space-y-0.5">
                <span className="text-[8px] text-slate-500 uppercase tracking-wider block">Official Timestamp</span>
                <span className="text-[11px] text-slate-400 font-bold">Issued: {panelData.issuedAt}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CertificateViewerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#07070a] text-slate-400 flex items-center justify-center font-mono text-xs">
        Initializing evaluation streaming parameters...
      </div>
    }>
      <CertificateViewerContent />
    </Suspense>
  );
}