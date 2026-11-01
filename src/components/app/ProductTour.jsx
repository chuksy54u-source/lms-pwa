'use client';

import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '../ui';
import { useSession, homeFor } from './SessionProvider';
import { useBear } from '../bear/BearProvider';
import { apiGet, apiPatch } from '../../lib/api/client.js';

// PRODUCT TOUR (roadmap Phase 8). The first time someone lands on their home screen, the bear walks them
// through the few places that matter, pointing at each one. It never shows again unless they ask for it
// (Help > "Take the tour"). Stored per role on this device.
export const TOUR_KEY = (role) => `bearilly:tour:${role}`;

export const TOURS = {
  student: [
    { title: 'Welcome!', text: 'I am your study buddy. Let me show you around. It takes less than a minute.' },
    { target: 'a[href="/learn"]', title: 'Learn', text: 'Your courses and lessons live here. Open a lesson and I explain it to you.' },
    { target: 'a[href="/tasks"]', title: 'Tasks', text: 'Quizzes and assignments from your teachers, with your grades.' },
    { target: 'a[href="/bear"]', title: 'Ask me anything', text: 'Stuck on a lesson? Ask me here. I answer from your school’s own notes.' },
    { target: 'a[href="/me"]', title: 'Me', text: 'Certificates, school fees, the Playground and your settings, including my voice.' },
  ],
  teacher: [
    { title: 'Welcome, teacher', text: 'Here is a quick look at where everything is.' },
    { target: '.sidebar a[href="/teacher"]', title: 'My learners', text: 'See how every learner is doing, and who needs help today.' },
    { target: '.sidebar a[href="/staff/review"]', title: 'Marking', text: 'Written answers wait here for your mark and comment.' },
    { target: '.sidebar a[href="/staff/courses"]', title: 'Courses', text: 'Lessons, notes and quizzes. The notes are what I teach from.' },
    { target: '.sidebar a[href="/staff/chats"]', title: 'Bear chats', text: 'Read what learners ask me. Anything worrying is flagged for you.' },
  ],
  school_admin: [
    { title: 'Welcome to Bearilly', text: 'Let me show you how to run your school here.' },
    { target: '.sidebar a[href="/admin/setup"]', title: 'Setup guide', text: 'Start here. It walks you through branding, students and teachers, step by step.' },
    { target: '.sidebar a[href="/admin/students"]', title: 'Students', text: 'Add students one by one or upload a spreadsheet. Each gets a login.' },
    { target: '.sidebar a[href="/admin/billing"]', title: 'Billing & slots', text: 'Your plan and student slots. You pay per student, per term.' },
    { target: '.sidebar a[href="/admin/website"]', title: 'Your website', text: 'No website? I can build one for you. Already have one? Connect it.' },
    { target: '.sidebar a[href="/help"]', title: 'Help', text: 'Guides for every screen, any time you need them.' },
  ],
  platform_admin: [{ title: 'Platform admin', text: 'Schools, their plans and their health live on this screen.' }],
};

export function restartTour(role) {
  try {
    window.localStorage.removeItem(TOUR_KEY(role));
  } catch (err) {
    /* ignore */
  }
}

function visible(el) {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden';
}

export default function ProductTour() {
  const path = usePathname();
  const { role, status, me } = useSession();
  const bear = useBear();
  const [step, setStep] = useState(-1);
  const [box, setBox] = useState(null);
  const [studentTour, setStudentTour] = useState({ loaded: false, completed: false });
  const steps = TOURS[role] || [];
  const s = steps[step];

  useEffect(() => {
    if (role !== 'student' || !me?.id) {
      setStudentTour({ loaded: true, completed: false });
      return undefined;
    }
    let active = true;
    apiGet(`/api/v1/students/${encodeURIComponent(me.id)}/onboarding`)
      .then((state) => {
        if (active) setStudentTour({ loaded: true, completed: state.tour_state?.completed === true });
      })
      .catch((error) => {
        console.error('Could not load persistent student tour state:', error);
        if (active) setStudentTour({ loaded: true, completed: false });
      });
    return () => { active = false; };
  }, [role, me?.id]);

  useEffect(() => {
    if (status !== 'in' || !role || path !== homeFor(role) || !steps.length) return;
    if (role === 'student' && (!studentTour.loaded || studentTour.completed)) return;
    let seen = true;
    try {
      seen = window.localStorage.getItem(TOUR_KEY(role)) === 'done';
    } catch (err) {
      seen = true;
    }
    if (!seen) {
      const t = setTimeout(() => setStep(0), 900);
      return () => clearTimeout(t);
    }
  }, [status, role, path, steps.length, studentTour]);

  const finish = useCallback(() => {
    if (role === 'student' && me?.id) {
      apiPatch(`/api/v1/students/${encodeURIComponent(me.id)}/onboarding`, { tour_completed: true })
        .then(() => setStudentTour({ loaded: true, completed: true }))
        .catch((error) => console.error('Could not save student tour completion:', error));
    }
    try {
      window.localStorage.setItem(TOUR_KEY(role), 'done');
    } catch (err) {
      /* ignore */
    }
    setStep(-1);
    setBox(null);
  }, [role, me?.id]);

  // Point at the step's element (when it is on screen; on a phone the staff menu is folded away, so the card stands alone).
  useLayoutEffect(() => {
    if (!s) return undefined;
    const el = s.target ? document.querySelector(s.target) : null;
    const place = () => {
      if (!visible(el)) return setBox(null);
      const r = el.getBoundingClientRect();
      setBox({ top: r.top - 6, left: r.left - 6, width: r.width + 12, height: r.height + 12 });
    };
    if (el && visible(el)) el.scrollIntoView({ block: 'nearest' });
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [s]);

  useEffect(() => {
    if (s) bear.say(s.text, { pose: s.target ? 'point' : 'wave' });
  }, [s, bear]);

  useEffect(() => {
    if (!s) return undefined;
    const key = (e) => e.key === 'Escape' && finish();
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [s, finish]);

  if (!s) return null;
  const last = step === steps.length - 1;
  // Card sits beside the highlighted item when there is room, otherwise in the middle of the screen.
  const beside = box && typeof window !== 'undefined' && window.innerWidth > 720;
  const cardStyle = beside
    ? { top: Math.min(Math.max(16, box.top), window.innerHeight - 240), left: box.left + box.width + 16 }
    : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  if (beside && box.left + box.width + 360 > window.innerWidth) {
    cardStyle.left = Math.max(16, box.left);
    cardStyle.top = Math.max(16, box.top - 200);
  }
  return (
    <div className="tour" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      <div className="tour-scrim" onClick={finish} />
      {box && <div className="tour-ring" style={box} aria-hidden />}
      <div className="tour-card" style={cardStyle}>
        <p className="tiny muted">
          {step + 1} of {steps.length}
        </p>
        <h2 id="tour-title" style={{ fontSize: '1.1rem' }}>
          {s.title}
        </h2>
        <p className="small" aria-live="polite">
          {s.text}
        </p>
        <div className="row-between" style={{ marginTop: 12 }}>
          <button type="button" className="link-btn small" onClick={finish}>
            Skip tour
          </button>
          <div className="row" style={{ gap: 6 }}>
            {step > 0 && (
              <Button size="sm" variant="ghost" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            <Button size="sm" autoFocus onClick={() => (last ? finish() : setStep(step + 1))}>
              {last ? 'Done' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
