'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Icon from '../ui/icons';
import RequireRole from './RequireRole';
import SchoolMark from './SchoolMark';
import { useSession } from './SessionProvider';
import { Avatar } from '../ui';
import ProductTour from './ProductTour';
import BillingBanner from '../staff/BillingBanner';

const NAV = {
  school_admin: [
    { section: 'School' },
    { href: '/admin', label: 'Overview', icon: 'grid' },
    { href: '/admin/students', label: 'Students', icon: 'users' },
    { href: '/admin/admissions', label: 'Admissions', icon: 'file' },
    { href: '/admin/legacy', label: 'Legacy accounts', icon: 'users' },
    { href: '/admin/teachers', label: 'Teachers', icon: 'teacher' },
    { href: '/staff/courses', label: 'Courses', icon: 'book' },
    { section: 'Learning' },
    { href: '/staff/review', label: 'Marking', icon: 'tasks' },
    { href: '/staff/chats', label: 'Bear chats', icon: 'chat' },
    { section: 'Money' },
    { href: '/admin/billing', label: 'Billing & slots', icon: 'lock' },
    { href: '/admin/fees', label: 'School fees', icon: 'file' },
    { href: '/admin/identity', label: 'School ID format', icon: 'id' },
    { section: 'Website' },
    { href: '/admin/website', label: 'Website builder', icon: 'building' },
    { href: '/dashboard/integrations', label: 'Connect your website', icon: 'copy' },
    { section: 'Setup' },
    { href: '/admin/branding', label: 'Branding & bear', icon: 'palette' },
    { href: '/admin/setup', label: 'Setup guide', icon: 'wand' },
  ],
  teacher: [
    { section: 'Class' },
    { href: '/teacher', label: 'My learners', icon: 'users' },
    { href: '/staff/review', label: 'Marking', icon: 'tasks' },
    { href: '/staff/courses', label: 'Courses', icon: 'book' },
    { href: '/staff/chats', label: 'Bear chats', icon: 'chat' },
  ],
  platform_admin: [
    { section: 'Bearilly' },
    { href: '/platform', label: 'Platform console', icon: 'building' },
  ],
};

function Sidebar({ open, onNavigate, setupRequired }) {
  const path = usePathname();
  const { me, role, signOut } = useSession();
  const items = NAV[role] || [];
  return (
    <aside className="sidebar no-print" data-open={open ? 'true' : 'false'} aria-label="Main">
      <SchoolMark />
      {items.map((it, i) =>
        it.section ? (
          <p key={`s${i}`} className="side-section">
            {it.section}
          </p>
        ) : (
          setupRequired && it.href !== '/admin/setup' ? (
            <span key={it.href} className="side-link" aria-disabled="true" title="Finish setup to unlock" style={{ opacity: 0.48, cursor: 'not-allowed' }}>
              <Icon name={it.icon} /> {it.label}
              <span className="tiny" style={{ marginLeft: 'auto' }}>Finish setup</span>
            </span>
          ) : (
            <Link
              key={it.href}
              href={it.href}
              className="side-link"
              onClick={onNavigate}
              aria-current={path === it.href || (it.href !== '/admin' && it.href !== '/teacher' && path.startsWith(`${it.href}/`)) ? 'page' : undefined}
            >
              <Icon name={it.icon} /> {it.label}
            </Link>
          )
        ),
      )}
      <div className="side-foot">
        <Link href="/help" className="side-link" onClick={onNavigate} aria-current={path === '/help' ? 'page' : undefined}>
          <Icon name="chat" /> Help
        </Link>
        <Link href="/staff/settings" className="side-link" onClick={onNavigate} aria-current={path === '/staff/settings' ? 'page' : undefined}>
          <Icon name="user" /> Account
        </Link>
        <button type="button" className="side-link" style={{ border: 0, background: 'none', cursor: 'pointer', textAlign: 'left' }} onClick={signOut}>
          <Icon name="logout" /> Log out
        </button>
        <div className="side-user">
          <Avatar name={(me && (me.full_name || me.email)) || '?'} />
          <div style={{ minWidth: 0 }}>
            <p className="small strong truncate">{(me && (me.full_name || me.email)) || ''}</p>
            <p className="tiny truncate" style={{ opacity: 0.7 }}>
              {role === 'school_admin' ? 'School admin' : role === 'teacher' ? 'Teacher' : 'Platform admin'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function StaffShell({ roles, children }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const { me } = useSession();
  const setupRequired = me?.role === 'school_admin' && me.school?.status === 'setup' && !me.school?.setup_completed_at;
  useEffect(() => setOpen(false), [path]);
  return (
    <RequireRole roles={roles}>
      <div className="staff">
        <Sidebar open={open} onNavigate={() => setOpen(false)} setupRequired={setupRequired} />
        {open && <div className="scrim" onClick={() => setOpen(false)} />}
        <div style={{ minWidth: 0 }}>
          <div className="staff-top no-print">
            <button type="button" className="icon-btn" aria-label="Open menu" onClick={() => setOpen(true)}>
              <Icon name="menu" />
            </button>
            <SchoolMark />
          </div>
          {!setupRequired && <BillingBanner />}
          <main className="staff-main" id="main">
            {children}
          </main>
          <ProductTour />
        </div>
      </div>
    </RequireRole>
  );
}
