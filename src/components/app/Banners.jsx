'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Icon from '../ui/icons';
import { usingMocks } from '../../lib/api/client.js';
import { useSession, homeFor } from './SessionProvider';

// Drawn with inline styles so it looks right on any site.
const STRIP = {
  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#111115',
  borderBottom: '1px solid rgba(255,255,255,0.12)', fontSize: 12, color: '#cbd5e1',
};

export function useOnline() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);
  return online;
}

// OFFLINE screen, top part: shown on every page when the phone loses its connection.
export function OfflineBanner() {
  const online = useOnline();
  if (online) return null;
  return (
    <div role="status" style={{ ...STRIP, position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, justifyContent: 'center', color: '#fcd34d', borderBottomColor: 'rgba(245,158,11,0.4)' }}>
      <Icon name="wifiOff" size={18} />
      <span>
        <strong>You are offline.</strong> Pages you opened before still show. Changes need a connection.
      </span>
    </div>
  );
}

// Mock mode only: a strip that says sample data is showing, with a role switcher to review every screen.
export function MockBanner() {
  const { role, switchMockRole } = useSession();
  const router = useRouter();
  const path = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || !usingMocks()) return null;
  const go = async (r) => {
    await switchMockRole(r || null);
    router.push(r ? homeFor(r) : '/login');
  };
  return (
    <div style={STRIP} data-path={path}>
      <Icon name="sparkle" size={16} />
      <span>Sample data mode</span>
      <select value={role || ''} onChange={(e) => go(e.target.value)} aria-label="View the app as" style={{ marginLeft: 'auto', border: 0, background: 'transparent', fontWeight: 600, color: 'inherit' }}>
        <option value="">Signed out</option>
        <option value="student">Student</option>
        <option value="teacher">Teacher</option>
        <option value="school_admin">School admin</option>
        <option value="platform_admin">Platform admin</option>
      </select>
    </div>
  );
}
