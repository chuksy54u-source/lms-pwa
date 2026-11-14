'use client';

import { StudentTop } from '../../../../components/app/StudentShell';
import { Card, BackLink, Badge, ListSkeleton, ErrorState, EmptyState, Button, Icon } from '../../../../components/ui';
import { useMe } from '../../../../lib/app/student';
import useApi from '../../../../lib/app/useApi';
import { dateLong, pct } from '../../../../lib/app/format';
import { useTitle } from '../../../../lib/app/hooks';

// MY CERTIFICATES: one per completed course. Each opens a printable page anyone can verify by its code.
export default function Certificates() {
  useTitle('My certificates');
  const me = useMe();
  const certs = useApi(me ? `/api/v1/students/${encodeURIComponent(me.id)}/certificates` : null);
  const list = (certs.data && certs.data.certificates) || [];
  return (
    <>
      <StudentTop />
      <main className="app-main stack-lg" id="main">
        <BackLink href="/me">Me</BackLink>
        <h1>My certificates</h1>
        {certs.loading && !certs.data ? (
          <ListSkeleton count={2} />
        ) : certs.error && !certs.data ? (
          <ErrorState error={certs.error} onRetry={certs.reload} />
        ) : list.length === 0 ? (
          <EmptyState title="No certificates yet" text="Finish every lesson and pass every quiz in a course to earn its certificate." action={<Button href="/learn">Keep learning</Button>} pose="coach" />
        ) : (
          <div className="stack">
            {list.map((c) => (
              <Card key={c.verification_code} href={`/certificate/${c.verification_code}`} className="row">
                <span className="list-icon accent">
                  <Icon name="trophy" size={22} />
                </span>
                <div className="grow">
                  <p className="card-title">{c.course_name}</p>
                  <p className="card-sub">
                    {dateLong(c.issued_at)} · Grade {c.grade} · {pct(c.score)}
                  </p>
                  <p className="tiny muted mono truncate">{c.verification_code}</p>
                </div>
                <Badge tone="success">Verified</Badge>
                <Icon name="next" size={18} />
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
