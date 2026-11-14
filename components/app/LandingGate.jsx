'use client';

import { useEffect } from 'react';
import { useSession, homeFor } from './SessionProvider';
import { schoolsHref } from '../../lib/app/paths.js';

// Wraps a school's own landing page on a connected website: the page is shown exactly as the school designed it, and
// someone who is already signed in goes straight to their Bearilly home page instead.
export default function LandingGate({ children }) {
  const { status, me, role } = useSession();
  useEffect(() => {
    // a full page load, so the school's own global style sheets are gone on Bearilly's pages
    if (status === 'in') window.location.replace(schoolsHref(role === 'school_admin' && me?.school?.status === 'setup' ? '/admin/setup' : homeFor(role)));
  }, [status, me, role]);
  return children;
}
