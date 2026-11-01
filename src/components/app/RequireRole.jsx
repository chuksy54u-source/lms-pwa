'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, homeFor } from './SessionProvider';
import BearArt from './BearArt';

// Wraps a group of pages: signed-out people go to sign-in, people with another role go to their own home.
export default function RequireRole({ roles, children }) {
  const { status, role, mustChangePassword } = useSession();
  const router = useRouter();
  const path = usePathname();
  const allowed = status === 'in' && roles.includes(role);

  useEffect(() => {
    // keep the query string too, so a link such as /dashboard/connect/approve?user_code=ABCD-EFGH survives signing in
    if (status === 'out') router.replace(`/login?next=${encodeURIComponent(path + (typeof window !== 'undefined' ? window.location.search : ''))}`);
    else if (status === 'in' && !roles.includes(role)) router.replace(homeFor(role));
    else if (status === 'in' && mustChangePassword && path !== '/change-password') router.replace('/change-password');
  }, [status, role, roles, router, path, mustChangePassword]);

  if (!allowed) {
    return (
      <div className="splash" aria-busy="true">
        <BearArt className="auth-logo" size="head" />
        <div className="splash-bar">
          <span />
        </div>
      </div>
    );
  }
  return children;
}
