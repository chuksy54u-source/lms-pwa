'use client';

import { useRouter } from '../../../lib/app/nav.js';
import BearArt from '../../../components/app/BearArt';
import { StudentTop } from '../../../components/app/StudentShell';
import { ThemeRow, PushRow, LinkRow, BearRows } from '../../../components/app/SettingsList';
import { Button, Badge, SectionHead } from '../../../components/ui';
import { useSession } from '../../../components/app/SessionProvider';
import { useTenant } from '../../../components/app/TenantProvider';
import { useStudentDashboard } from '../../../lib/app/student';
import { useTitle } from '../../../lib/app/hooks';

// PROFILE & SETTINGS
export default function Me() {
  useTitle('Me');
  const router = useRouter();
  const { me, signOut } = useSession();
  const { school } = useTenant();
  const dash = useStudentDashboard();
  const certs = (dash.data && dash.data.certificates) || [];
  const schoolName = school?.name || me?.school?.name || 'School';
  return (
    <>
      <StudentTop />
      <main className="app-main stack-lg" id="main">
        <div className="result-hero">
          <BearArt className="auth-logo" size="head" />
          <div className="stack-sm">
            <h1>{me && me.full_name}</h1>
            <p className="muted">{school ? school.name : ''}</p>
            <div className="row wrap" style={{ justifyContent: 'center', gap: 6 }}>
              {me && me.student_code && <Badge tone="brand">ID {me.student_code}</Badge>}
              <Badge>{me && me.email}</Badge>
            </div>
          </div>
        </div>

        <div className="list">
          <LinkRow href="/me/certificates" icon="award" title="My certificates" sub={certs.length ? `${certs.length} earned` : 'Finish a course to earn one'} />
          <LinkRow href="/tasks/grades" icon="tasks" title="My grades" sub="Scores and averages" />
          <LinkRow href="/notifications" icon="bell" title="Notifications" sub="Grades, reminders and tips" />
          <LinkRow href="/me/fees" icon="file" title="School fees" sub="Invoices and payments" />
          <LinkRow href="/me/legacy" icon="users" title="Link previous school account" sub="Verify your old school ID and link your history" />
        </div>

        <SectionHead title="Settings" />
        <div className="list">
          <ThemeRow />
          <PushRow />
          <BearRows />
          <LinkRow href="/help" icon="chat" title="Help" sub={`How ${schoolName} learning works`} />
          <LinkRow href="/change-password" icon="lock" title="Password & privacy" sub="Change your password" />
        </div>

        <Button
          variant="outline"
          block
          icon="logout"
          onClick={async () => {
            await signOut();
            router.replace('/login');
          }}
        >
          Log out
        </Button>
        <p className="tiny muted center">{schoolName} student portal</p>
      </main>
    </>
  );
}
