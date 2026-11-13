'use client';

import { useState } from 'react';
import { StudentTop } from '../../../components/app/StudentShell';
import { Card, Chips, BackLink, ListSkeleton, ErrorState, EmptyState, Button } from '../../../components/ui';
import useNotifications from '../../../lib/app/useNotifications';
import { relTime } from '../../../lib/app/format';
import { useTitle } from '../../../lib/app/hooks';

// NOTIFICATIONS
export default function Notifications() {
  useTitle('Notifications');
  const { items, unread, loading, error, reload, markAllRead } = useNotifications();
  const [filter, setFilter] = useState('all');
  const isNew = (n) => n.unread;
  const list = filter === 'unread' ? items.filter(isNew) : items;

  return (
    <>
      <StudentTop />
      <main className="app-main stack-lg" id="main">
        <BackLink href="/home">Home</BackLink>
        <h1>Notifications</h1>
        <Chips
          label="Filter"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'All' },
            { value: 'unread', label: 'Unread', count: unread },
          ]}
        />
        {unread > 0 && <Button variant="soft" onClick={markAllRead}>Mark all read</Button>}
        {loading ? (
          <ListSkeleton count={4} lines={1} />
        ) : error && !items.length ? (
          <ErrorState error={error} onRetry={reload} />
        ) : list.length === 0 ? (
          <EmptyState title={filter === 'unread' ? 'You are all caught up' : 'Nothing yet'} text="Course results, certificates and tutor tips from your school appear here." />
        ) : (
          <div className="stack">
            {list.map((n) => (
              <Card key={n.id} href={n.href} className="notif" data-unread={isNew(n) ? 'true' : 'false'}>
                <span className={`list-icon ${n.tone}`} aria-hidden>
                  {n.icon}
                </span>
                <div className="grow">
                  <p className="card-title">{n.title}</p>
                  <p className="card-sub">
                    {n.text} · {relTime(n.at)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
