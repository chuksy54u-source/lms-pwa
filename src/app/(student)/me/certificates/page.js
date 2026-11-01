'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchCertificates() {
      try {
        // Fetching certificates via same-origin proxy to Bearilly API
        const response = await fetch('/api/v1/me/certificates', {
          headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) throw new Error('Failed to load certificates');
        const data = await response.json();
        setCertificates(data.certificates || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCertificates();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-500/20 antialiased font-sans flex flex-col">
      <header className="p-6 flex justify-between items-center border-b border-white/10">
        <Link href="/" className="text-xl font-bold tracking-tighter">BEARILLY_SCHOOL</Link>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-white/60">
          <Link href="/programs" className="hover:text-white transition-colors">Programs</Link>
          <Link href="/me/certificates" className="text-white">Certificates</Link>
        </nav>
      </header>

      <main className="flex-grow container mx-auto px-6 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">My Certificates</h1>

        {loading ? (
          <div className="text-white/40">Loading your achievements...</div>
        ) : error ? (
          <div className="text-red-400">Error: {error}</div>
        ) : certificates.length === 0 ? (
          <div className="p-12 border border-white/10 rounded-xl text-center">
            <p className="text-xl mb-4">No certificates yet</p>
            <Link href="/programs" className="inline-block px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-white/90 transition-colors">
              Browse Programs
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {certificates.map((cert) => (
              <div key={cert.verification_code} className="p-6 border border-white/10 rounded-xl flex items-center justify-between hover:border-white/30 transition-colors">
                <div>
                  <h3 className="text-lg font-semibold">{cert.course_name}</h3>
                  <p className="text-sm text-white/50">Issued: {new Date(cert.issued_at).toLocaleDateString()}</p>
                  <p className="text-xs font-mono text-white/30 mt-2">{cert.verification_code}</p>
                </div>
                <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20">
                  VERIFIED
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="p-6 border-t border-white/10 text-center text-white/40 text-sm">
        © {new Date().getFullYear()} Bearilly School. All rights reserved.
      </footer>
    </div>
  );
}