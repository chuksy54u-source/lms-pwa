'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        // Proxy request to Bearilly via same-origin server route
        const response = await fetch('/api/v1/notifications', {
          method: 'GET',
          credentials: 'same-origin',
          headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) throw new Error('Failed to fetch notifications');
        const data = await response.json();
        setNotifications(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchNotifications();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-500/20 antialiased font-sans">
      <nav className="p-6 flex justify-between items-center border-b border-white/10">
        <Link href="/" className="text-xl font-bold tracking-tighter">BEARILLY</Link>
        <div className="hidden md:flex gap-8 text-sm font-medium text-white/60">
          <Link href="/programs" className="hover:text-white transition-colors">Programs</Link>
          <Link href="/notifications" className="text-white">Notifications</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto p-6 py-12">
        <h1 className="text-4xl font-bold mb-8 tracking-tight">Notifications</h1>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-white/5 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            {error}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 border border-white/10 rounded-2xl">
            <p className="text-white/40">No new notifications at this time.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                className="p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
              >
                <h3 className="font-semibold text-lg">{n.title}</h3>
                <p className="text-white/60 mt-1">{n.message}</p>
                <span className="text-xs text-white/30 mt-4 block">
                  {new Date(n.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}