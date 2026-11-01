'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MyFees() {
  const [invoices, setInvoices] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(null);
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const money = (minor, currency) => 
    new Intl.NumberFormat('en-NG', { 
      style: 'currency', 
      currency: currency || 'NGN' 
    }).format(minor / 100);

  const dateLong = (d) => 
    new Date(d).toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });

  const STATUS_THEMES = {
    open: { label: 'Unpaid', class: 'bg-red-500/10 text-red-400 border-red-500/20' },
    pending: { label: 'Payment started', class: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    paid: { label: 'Paid', class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    cancelled: { label: 'Cancelled', class: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
    refunded: { label: 'Refunded', class: 'bg-purple-500/10 text-purple-400 border-purple-500/20' }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [invRes, schRes] = await Promise.all([
          fetch('/api/v1/school-fees/invoices', { credentials: 'same-origin' }),
          fetch('/api/v1/school-fees/schedules', { credentials: 'same-origin' })
        ]);

        if (invRes.ok && schRes.ok) {
          const invData = await invRes.json();
          const schData = await schRes.json();
          setInvoices(invData);
          setSchedules(schData);
        } else {
          setError('Failed to load fee information.');
        }
      } catch (err) {
        setError('An error occurred while fetching your fees.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handlePay = async (invoiceId) => {
    setPaying(invoiceId);
    try {
      const res = await fetch(`/api/v1/school-fees/invoices/${encodeURIComponent(invoiceId)}/checkout`, {
        method: 'POST',
        credentials: 'same-origin'
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.code || 'PAYMENT_ERROR');
      }

      const data = await res.json();
      if (data.authorization_url) {
        window.location.assign(data.authorization_url);
      }
    } catch (err) {
      alert(err.message === 'PAYMENT_NOT_CONFIGURED' || err.message === 'SCHOOL_PAYMENTS_NOT_CONFIGURED' 
        ? 'Your school has not set up online payment yet.' 
        : 'Failed to initiate payment. Please try again.');
      setPaying(null);
    }
  };

  const scheduleNames = Object.fromEntries(
    schedules.map((s) => [s.id, `${s.name} · ${s.period_label}`])
  );

  const owedCount = invoices.filter((i) => i.status === 'open' || i.status === 'pending').length;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-500/20 antialiased font-sans flex flex-col relative overflow-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-8">
              <Link href="/" className="group flex items-center gap-3">
                <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform duration-300">
                  <span className="text-white font-black text-xl">B</span>
                </div>
                <span className="text-xl font-bold tracking-tighter uppercase">Bearilly School</span>
              </Link>
              <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
                <Link href="/programs" className="hover:text-white transition-colors">Programs</Link>
                <Link href="/about" className="hover:text-white transition-colors">About</Link>
                <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <Link href="/me" className="px-5 py-2.5 rounded-full bg-zinc-900 border border-zinc-800 text-sm font-semibold hover:bg-zinc-800 transition-all">
                Dashboard
              </Link>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-zinc-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black pt-24 px-6">
          <div className="flex flex-col gap-6 text-2xl font-bold">
            <Link href="/programs" onClick={() => setMobileMenuOpen(false)}>Programs</Link>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)}>About</Link>
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
            <Link href="/me" onClick={() => setMobileMenuOpen(false)} className="text-red-500">Dashboard</Link>
          </div>
        </div>
      )}

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <Link href="/me" className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 mb-6 text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">School Fees</h1>
          <p className="text-zinc-400 text-lg">Manage your tuition and institutional payments.</p>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-48 bg-zinc-900/50 border border-zinc-800 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
            <p className="text-red-400 font-medium mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-600 rounded-full text-sm font-bold hover:bg-red-500 transition-colors">
              Retry
            </button>
          </div>
        ) : invoices.length === 0 ? (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-12 text-center">
            <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">No fees to pay</h3>
            <p className="text-zinc-500">When your school sends you an invoice, it will appear here.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {owedCount > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-blue-400">{owedCount} invoice{owedCount === 1 ? '' : 's'} pending</h4>
                  <p className="text-sm text-blue-400/80 mt-1">Payments are processed securely via Paystack and sent directly to the school.</p>
                </div>
              </div>
            )}

            <div className="grid gap-6">
              {invoices.map((inv) => {
                const theme = STATUS_THEMES[inv.status] || { label: inv.status, class: 'bg-zinc-800 text-zinc-400' };
                return (
                  <div key={inv.id} className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden transition-all hover:border-zinc-700">
                    <div className="p-8">
                      <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
                        <div>
                          <h3 className="text-2xl font-bold mb-1">{scheduleNames[inv.schedule_id] || 'School Fees'}</h3>
                          <p className="text-zinc-500 text-sm">
                            {inv.due_at ? `Due ${dateLong(inv.due_at)}` : `Issued ${dateLong(inv.created_at)}`}
                          </p>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${theme.class}`}>
                          {theme.label}
                        </span>
                      </div>

                      <div className="space-y-3 mb-8">
                        {(inv.items || []).map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                            <span className="text-zinc-400">{item.name}</span>
                            <span className="font-medium">{money(item.amount_minor, inv.currency)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center pt-4 mt-4 border-t border-white/10">
                          <span className="text-lg font-bold">Total Amount</span>
                          <span className="text-2xl font-black text-red-500">{money(inv.total_amount_minor, inv.currency)}</span>
                        </div>
                      </div>

                      {(inv.status === 'open' || inv.status === 'pending') && (
                        <button
                          onClick={() => handlePay(inv.id)}
                          disabled={paying === inv.id}
                          className="w-full py-4 bg-white text-black rounded-2xl font-bold text-lg hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                          {paying === inv.id ? (
                            <>
                              <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing...
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              {inv.status === 'pending' ? 'Continue Payment' : `Pay ${money(inv.total_amount_minor, inv.currency)}`}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-white/10 py-12 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-zinc-500 text-sm">
            &copy; {new Date().getFullYear()} Bearilly School. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}