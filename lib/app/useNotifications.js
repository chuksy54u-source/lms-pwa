'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import useApi from './useApi';
import { useSession } from '../../components/app/SessionProvider';
import { readStore, writeStore } from './storage';

// There is no notifications endpoint yet, so the student's notifications are built from data the API already has:
// graded quizzes, attempts waiting for a teacher, certificates, and what the bear suggests from their mood.
// "Read" is remembered on this device. When the backend adds GET /notifications, replace build() with that call.
const KEY = 'bearilly:notifications-read';
const EVENT = 'bearilly:notifications';

function build(dash, mood) {
  const out = [];
  if (mood && mood.say) {
    const day = new Date().toISOString().slice(0, 10);
    out.push({ id: `mood-${mood.emotion}-${day}`, icon: 'sparkle', tone: 'accent', title: 'Bear suggests', text: mood.say, at: new Date().toISOString(), href: '/bear' });
  }
  const results = (dash && dash.results && dash.results.results) || [];
  results.forEach((r) => {
    if (r.status === 'graded') {
      out.push({ id: `res-${r.submission_id}`, icon: r.passed ? 'checkCircle' : 'note', tone: r.passed ? 'success' : 'warn', title: r.passed ? 'Quiz passed' : 'Quiz graded', text: `${r.assessment_title} · ${Math.round(r.percent)}%`, at: r.submitted_at, href: `/quiz/${r.assessment_id}` });
    } else {
      out.push({ id: `rev-${r.submission_id}`, icon: 'hourglass', tone: 'info', title: 'Waiting for your teacher', text: `${r.assessment_title} has an answer your teacher will mark.`, at: r.submitted_at, href: '/tasks?tab=review' });
    }
  });
  ((dash && dash.certificates) || []).forEach((c) => {
    out.push({ id: `cert-${c.id || c.verification_code}`, icon: 'trophy', tone: 'accent', title: 'Certificate earned', text: c.course_name, at: c.issued_at, href: `/certificate/${c.verification_code}` });
  });
  return out.sort((a, b) => String(b.at).localeCompare(String(a.at)));
}

export default function useNotifications() {
  const { me } = useSession() || {};
  const isStudent = me && me.role === 'student';
  const dash = useApi(isStudent ? `/api/v1/students/${encodeURIComponent(me.id)}/dashboard` : null);
  const mood = useApi(isStudent ? `/api/v1/students/${encodeURIComponent(me.id)}/tutor-state` : null);
  const [read, setRead] = useState([]);

  useEffect(() => {
    const sync = () => setRead(readStore(KEY, []));
    sync();
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);

  const items = useMemo(() => build(dash.data, mood.data).map((n) => ({ ...n, unread: !read.includes(n.id) })), [dash.data, mood.data, read]);

  const markAllRead = useCallback(() => {
    writeStore(KEY, [...new Set([...readStore(KEY, []), ...items.map((n) => n.id)])].slice(-300));
    window.dispatchEvent(new Event(EVENT));
  }, [items]);

  return { items, unread: items.filter((n) => n.unread).length, loading: dash.loading && !dash.data, error: dash.error, reload: dash.reload, markAllRead };
}
