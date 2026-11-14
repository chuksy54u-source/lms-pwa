'use client';

import ProductTour from './ProductTour';
import { Link } from '../../lib/app/nav.js';
import { usePathname } from '../../lib/app/nav.js';
import { useEffect, useState } from 'react';
import Icon from '../ui/icons';
import RequireRole from './RequireRole';
import LoadingScreen from './LoadingScreen';
import SchoolMark from './SchoolMark';
import InstallPrompt from './InstallPrompt';
import useNotifications from '../../lib/app/useNotifications';
import { useSession } from './SessionProvider';
import { apiGet } from '../../lib/api/client';
import { schoolsHref } from '../../lib/app/paths.js';

const TABS = [
  { href: '/home', label: 'Home', icon: 'home', match: ['/home'] },
  { href: '/learn', label: 'Learn', icon: 'learn', match: ['/learn', '/lesson'] },
  { href: '/tasks', label: 'Tasks', icon: 'tasks', match: ['/tasks', '/quiz'] },
  { href: '/bear', label: 'Tutor', icon: 'bear', match: ['/bear'] },
  { href: '/play', label: 'Play', icon: 'grid', match: ['/play'] },
  { href: '/me', label: 'Me', icon: 'user', match: ['/me', '/notifications', '/change-password'] },
];

function TabBar() {
  const path = usePathname();
  const { unread } = useNotifications();
  return (
    <nav className="tabbar no-print" aria-label="Main">
      {TABS.map((t) => {
        const active = t.match.some((m) => path === m || path.startsWith(`${m}/`));
        return (
          <Link key={t.href} href={t.href} aria-current={active ? 'page' : undefined}>
            <Icon name={t.icon} />
            {t.label}
            {t.href === '/home' && unread > 0 && <span className="tab-dot" aria-label={`${unread} new notifications`} />}
          </Link>
        );
      })}
    </nav>
  );
}

function StudentContent({ children }) {
  const path = usePathname();
  const { me } = useSession();
  const [onboarding, setOnboarding] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!me?.id) return;
    let active = true;
    apiGet(`/api/v1/students/${encodeURIComponent(me.id)}/onboarding`)
      .then((state) => { if (active) { setOnboarding(state); setError(null); } })
      .catch((err) => { if (active) setError(err); });
    return () => { active = false; };
  }, [me?.id]);

  if (error) {
    return <main className="student-main"><section className="card card-pad"><h1>Could not check your onboarding</h1><p>{error.message}</p><button className="btn btn-outline" onClick={() => window.location.reload()}>Try again</button></section></main>;
  }
  // the same full loading screen as everywhere else (the school's logo and a sliding bar), not a line of text; it covers the tab bar too
  if (!onboarding) return <LoadingScreen overlay />;
  if (!onboarding.fee_paid && path !== '/me/fees' && path !== '/me/legacy') {
    const invoice = onboarding.required_invoice;
    return (
      <main className="student-main">
        <section className="card card-pad-lg stack" style={{ maxWidth: 620, margin: '48px auto' }}>
          <h1>Complete your school fee payment</h1>
          <p>Your school requires the first invoice to be paid before courses and lessons become available.</p>
          {invoice && <p>Outstanding amount: {invoice.currency} {invoice.total_amount_minor}</p>}
          <a className="btn btn-primary" href={schoolsHref('/me/fees')}>View and pay invoice</a>
        </section>
      </main>
    );
  }
  return <>{children}<InstallPrompt /><ProductTour /></>;
}

export function StudentTop({ right }) {
  return (
    <header className="app-top">
      <SchoolMark />
      {right}
    </header>
  );
}

export default function StudentShell({ children }) {
  useEffect(() => {
    document.body.classList.add('has-tabbar');
    return () => document.body.classList.remove('has-tabbar');
  }, []);
  return (
    <RequireRole roles={['student']}>
      <div className="app has-rail">
        <TabBar />
        <div>
          <StudentContent>{children}</StudentContent>
        </div>
      </div>
    </RequireRole>
  );
}
