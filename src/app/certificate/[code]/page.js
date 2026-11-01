'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function CertificateVerification() {
  const { code } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function verifyCertificate() {
      try {
        const response = await fetch(`/api/v1/certificates/verify/${encodeURIComponent(code)}`, {
          headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) {
          throw new Error('Certificate could not be verified.');
        }
        
        const data = await response.json();
        if (data.valid) {
          setCertificate(data.certificate);
        } else {
          setError('This certificate code is invalid or has been revoked.');
        }
      } catch (err) {
        setError('Failed to connect to the verification service.');
      } finally {
        setLoading(false);
      }
    }

    if (code) verifyCertificate();
  }, [code]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-500/20 antialiased font-sans flex flex-col">
      <nav className="p-6 flex justify-between items-center z-50">
        <Link href="/" className="text-xl font-bold tracking-tighter">BEARILLY ACADEMY</Link>
        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
          <Link href="/programs" className="hover:text-white transition-colors">Programs</Link>
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
        </div>
      </nav>

      <main className="flex-grow flex flex-col items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-zinc-900/50 border border-zinc-800 p-8 md:p-12 rounded-2xl backdrop-blur-sm">
          {loading ? (
            <div className="text-center animate-pulse">Verifying certificate...</div>
          ) : error ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-500 mb-4">Verification Failed</h2>
              <p className="text-gray-400">{error}</p>
              <Link href="/" className="mt-6 inline-block px-6 py-2 bg-white text-black rounded-full font-medium">Return Home</Link>
            </div>
          ) : certificate ? (
            <div className="space-y-6">
              <div className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest rounded-full">
                Verified Certificate
              </div>
              <h1 className="text-4xl font-bold tracking-tighter">Certificate of Completion</h1>
              <div className="space-y-2 border-l-2 border-zinc-700 pl-6">
                <p className="text-gray-400">This is to certify that</p>
                <p className="text-2xl font-semibold">{certificate.student_name}</p>
                <p className="text-gray-400">has successfully completed</p>
                <p className="text-xl font-bold text-white">{certificate.course_name}</p>
              </div>
              <div className="pt-6 border-t border-zinc-800 text-sm text-gray-500">
                <p>Issued by: {certificate.school_name}</p>
                <p>Verification Code: {certificate.verification_code}</p>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      <footer className="p-8 text-center text-gray-600 text-sm">
        &copy; {new Date().getFullYear()} Bearilly Academy. All rights reserved.
      </footer>
    </div>
  );
}