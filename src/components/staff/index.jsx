'use client';

// Building blocks shared by the school admin and teacher screens.

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, MoodBadge, Badge, SearchInput, Chips, Callout, Button, Icon } from '../ui';
import { useSession } from '../app/SessionProvider';
import { useToast } from '../app/ToastProvider';
import { pct, relTime } from '../../lib/app/format';

export function useSchoolId() {
  const { me } = useSession();
  return me && me.school ? me.school.id : null;
}

// Learner table with search and a "needs help" filter. Rows open the student's detail page.
export function LearnerTable({ students = [], showEmail = true }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return students
      .filter((s) => (filter === 'help' ? s.needs_help : true))
      .filter((s) => !t || `${s.full_name} ${s.email} ${s.level || ''}`.toLowerCase().includes(t))
      .sort((a, b) => Number(b.needs_help) - Number(a.needs_help) || String(a.full_name).localeCompare(b.full_name));
  }, [students, q, filter]);
  const help = students.filter((s) => s.needs_help).length;
  return (
    <div className="stack">
      <div className="row wrap">
        <div className="grow" style={{ minWidth: 220 }}>
          <SearchInput placeholder="Search learners" value={q} onChange={(e) => setQ(e.target.value)} label="Search learners" />
        </div>
        <Chips
          label="Filter learners"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'All', count: students.length },
            { value: 'help', label: 'Needs help', count: help },
          ]}
        />
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Learner</th>
              <th>Level</th>
              <th>Bear mood</th>
              <th>Average</th>
              <th>Latest</th>
              <th>Last quiz</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} className="clickable" tabIndex={0} onClick={() => router.push(`/staff/students/${s.id}`)} onKeyDown={(e) => e.key === 'Enter' && router.push(`/staff/students/${s.id}`)}>
                <td>
                  <div className="row" style={{ gap: 10 }}>
                    <Avatar name={s.full_name} />
                    <div style={{ minWidth: 0 }}>
                      <p className="strong">
                        {s.full_name} {s.needs_help && <Badge tone="danger">Needs help</Badge>}
                      </p>
                      {showEmail && <p className="tiny muted">{s.email}</p>}
                    </div>
                  </div>
                </td>
                <td>{s.level || '—'}</td>
                <td>
                  <MoodBadge mood={s.mood} />
                </td>
                <td className="strong">{pct(s.average_score)}</td>
                <td>{pct(s.latest_score)}</td>
                <td className="muted small">{s.last_assessment_at ? relTime(s.last_assessment_at) : 'Not yet'}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="center muted" style={{ padding: 28 }}>
                  {students.length ? 'No learners match.' : 'No learners yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Temporary passwords are shown ONCE by the API. Make that impossible to miss, with copy.
export function OneTimeSecret({ label = 'Temporary password', value, who }) {
  const toast = useToast();
  return (
    <Callout tone="warn" title={`${label} — shown only once`}>
      <div className="stack-sm">
        {who && <p className="small">{who}</p>}
        <div className="row" style={{ gap: 8 }}>
          <code className="mono strong" style={{ fontSize: '1.05rem', background: 'var(--surface)', padding: '6px 10px', borderRadius: 8 }}>
            {value}
          </code>
          <Button
            size="sm"
            variant="outline"
            icon="copy"
            onClick={() => {
              navigator.clipboard.writeText(value).then(() => toast('Copied', 'success'));
            }}
          >
            Copy
          </Button>
        </div>
        <p className="tiny">Give it to them privately. They choose their own password the first time they sign in.</p>
      </div>
    </Callout>
  );
}

export function CopyField({ value, label }) {
  const toast = useToast();
  return (
    <div className="row" style={{ gap: 8, background: 'var(--surface-2)', borderRadius: 12, padding: '8px 8px 8px 14px' }}>
      <span className="mono small grow truncate" title={value}>
        {value}
      </span>
      <Button size="sm" variant="outline" icon="copy" aria-label={`Copy ${label || ''}`} onClick={() => navigator.clipboard.writeText(value).then(() => toast('Copied', 'success'))}>
        Copy
      </Button>
    </div>
  );
}

export function StatusBadge({ status }) {
  return status === 'active' ? <Badge tone="success">Active</Badge> : <Badge>Inactive</Badge>;
}

export function Empty({ icon = 'sparkle', children }) {
  return (
    <div className="card center muted stack-sm" style={{ padding: 28, alignItems: 'center' }}>
      <Icon name={icon} size={26} />
      <div className="small">{children}</div>
    </div>
  );
}
