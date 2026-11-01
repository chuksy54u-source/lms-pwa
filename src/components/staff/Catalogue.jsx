'use client';

import { useEffect, useState } from 'react';
import { Switch, ListSkeleton, ErrorState, Badge } from '../ui';
import { useToast } from '../app/ToastProvider';
import useApi, { clearApiCache } from '../../lib/app/useApi';
import { apiPost } from '../../lib/api/client';
import { subjectEmoji, friendlyError } from '../../lib/app/format';

// Bearilly's ready-made courses with an on/off switch each (school admin only).
export default function CatalogueSwitches({ onEnabledChange }) {
  const toast = useToast();
  const list = useApi('/api/v1/catalogue/courses');
  const [busy, setBusy] = useState(null);
  useEffect(() => {
    if (list.data && onEnabledChange) onEnabledChange(list.data.filter((course) => course.enabled).map((course) => course.id));
  }, [list.data, onEnabledChange]);

  async function toggle(c, on) {
    setBusy(c.id);
    list.setData((rows) => rows.map((x) => (x.id === c.id ? { ...x, enabled: on } : x)));
    try {
      await apiPost(`/api/v1/courses/${encodeURIComponent(c.id)}/${on ? 'enable' : 'disable'}`, {});
      clearApiCache('/api/v1/courses');
      toast(on ? `${c.title} is on for your school` : `${c.title} is off`, 'success');
    } catch (err) {
      list.setData((rows) => rows.map((x) => (x.id === c.id ? { ...x, enabled: !on } : x)));
      toast(friendlyError(err), 'error');
    } finally {
      setBusy(null);
    }
  }

  if (list.loading && !list.data) return <ListSkeleton count={3} lines={1} />;
  if (list.error && !list.data) return <ErrorState error={list.error} onRetry={list.reload} />;
  const on = list.data.filter((c) => c.enabled).length;
  return (
    <div className="stack">
      <p className="small muted">
        {on} of {list.data.length} switched on. Students only see courses that are on.
      </p>
      <div className="list">
        {list.data.map((c) => (
          <div key={c.id} className="list-item">
            <span className="course-emoji" aria-hidden>
              {subjectEmoji(c.title)}
            </span>
            <div className="grow">
              <p className="strong">{c.title}</p>
              <p className="small muted">
                {c.lessons} lessons{c.level ? ` · ${c.level}` : ''}
                {c.description ? ` · ${c.description}` : ''}
              </p>
            </div>
            {c.enabled && <Badge tone="success">On</Badge>}
            <Switch checked={c.enabled} disabled={busy === c.id} onChange={(v) => toggle(c, v)} label={`${c.title} for my school`} />
          </div>
        ))}
      </div>
    </div>
  );
}
