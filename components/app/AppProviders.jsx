'use client';

import { useEffect, useMemo } from 'react';
import BearRoot from '../bear/BearRoot';
import TenantProvider, { useTenant } from './TenantProvider';
import SessionProvider, { useSession } from './SessionProvider';
import ThemeProvider from './ThemeProvider';
import ToastProvider from './ToastProvider';
import { OfflineBanner, MockBanner } from './Banners';
import { apiGet } from '../../lib/api/client.js';

// Pages where the floating bear would get in the way (it is drawn large on these pages already).
const BEAR_HIDDEN_ON = ['/', '/welcome', '/login', '/register', '/forgot-password', '/reset-password', '/bear-demo', '/certificate', '/verify', '/billing', '/preview', '/sites-live', '/admin/setup'];

// After sign-in, load the person's own school branding so the app wears their school's colours and bear.
function BrandingSync() {
  const { me } = useSession();
  const { setSchool } = useTenant();
  const schoolId = me && me.school ? me.school.id : null;
  useEffect(() => {
    if (!schoolId) {
      setSchool(null);
      return undefined;
    }
    let live = true;
    apiGet(`/api/v1/schools/${encodeURIComponent(schoolId)}/branding`)
      .then((b) => live && setSchool({ school: me.school, branding: b.branding, tutor: b.tutor }))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [schoolId]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

function Bear({ children }) {
  const { bearSettings } = useTenant();
  const { me, status } = useSession();
  const studentId = me && me.role === 'student' ? me.id : null;
  // The school's greeting is for signed-out visitors. Students hear their mood line instead; staff get a quiet bear.
  // While sign-in is still being checked, stay quiet too (otherwise staff hear "Ready to learn?" for a moment).
  const quiet = status !== 'out';
  const settings = useMemo(() => (quiet && bearSettings ? { ...bearSettings, greeting: '' } : bearSettings), [quiet, bearSettings]);
  return (
    <BearRoot settings={settings} studentId={studentId} hideOn={BEAR_HIDDEN_ON}>
      {children}
    </BearRoot>
  );
}

export default function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <TenantProvider>
        <SessionProvider>
          <BrandingSync />
          <ToastProvider>
            <Bear>
              <MockBanner />
              <OfflineBanner />
              {children}
            </Bear>
          </ToastProvider>
        </SessionProvider>
      </TenantProvider>
    </ThemeProvider>
  );
}
