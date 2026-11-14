'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from '../../lib/app/nav.js';
import BearArt from '../../components/app/BearArt';
import { Button, Icon } from '../../components/ui';
import { useTenant } from '../../components/app/TenantProvider';
import { writeStore } from '../../lib/app/storage';
import { useTitle } from '../../lib/app/hooks';

// ONBOARDING: three short slides that introduce the school's bear. Swipe, tap the dots, or press the arrow keys.
export default function Welcome() {
  useTitle('Welcome');
  const router = useRouter();
  const { tutor, school } = useTenant();
  const [i, setI] = useState(0);
  const startX = useRef(null);
  const name = (tutor && tutor.name) || 'Study tutor';

  const slides = [
    { title: `Meet ${name}`, text: 'Lessons, quizzes and homework with an AI study buddy that keeps you on track.', emotion: 'adorable', pose: 'wave', chips: [['learn', 'Lessons'], ['sparkle', 'Bear AI'], ['trophy', 'Certificates']] },
    { title: 'Learn at your own pace', text: 'Short lessons, explained out loud. Stuck on something? Tap the bear and ask.', emotion: 'adorable', pose: 'point', chips: [['sound', 'Read aloud'], ['chat', 'Ask anything']] },
    { title: 'Show what you know', text: `Take quizzes, see your grades, and earn certificates${school ? ` from ${school.name}` : ''} that anyone can check.`, emotion: 'adorable', pose: 'coach', chips: [['note', 'Quizzes'], ['trend', 'Progress']] },
  ];
  const s = slides[i];
  const last = i === slides.length - 1;

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') setI((n) => Math.min(n + 1, slides.length - 1));
      if (e.key === 'ArrowLeft') setI((n) => Math.max(n - 1, 0));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [slides.length]);

  const finish = (to) => {
    writeStore('bearilly:onboarded', true);
    router.push(to);
  };

  return (
    <main
      className="onboard"
      onPointerDown={(e) => (startX.current = e.clientX)}
      onPointerUp={(e) => {
        if (startX.current === null) return;
        const dx = e.clientX - startX.current;
        if (dx < -50) setI((n) => Math.min(n + 1, slides.length - 1));
        if (dx > 50) setI((n) => Math.max(n - 1, 0));
        startX.current = null;
      }}
    >
      <button type="button" className="link-btn onboard-skip" onClick={() => finish('/login')} style={{ visibility: last ? 'hidden' : 'visible' }}>
        Skip
      </button>
      <section className="onboard-slide" key={i} aria-live="polite" aria-roledescription="slide" aria-label={`${i + 1} of ${slides.length}`}>
        <BearArt className="onboard-art" emotion={s.emotion} pose={s.pose} celebrate={last} />
        <h1>{s.title}</h1>
        <p>{s.text}</p>
        <div className="onboard-feature">
          {s.chips.map(([icon, label]) => (
            <span key={label} className="badge badge-accent" style={{ fontSize: '.82rem', padding: '6px 12px' }}>
              <Icon name={icon} size={15} />
              {label}
            </span>
          ))}
        </div>
      </section>
      <div className="dots" role="group" aria-label="Slides">
        {slides.map((_, n) => (
          <button key={n} type="button" aria-label={`Slide ${n + 1}`} aria-current={n === i ? 'true' : undefined} onClick={() => setI(n)} />
        ))}
      </div>
      <div className="stack">
        {last ? (
          <Button block onClick={() => finish('/register')}>
            Get started
          </Button>
        ) : (
          <Button block onClick={() => setI(i + 1)} iconRight="next">
            Next
          </Button>
        )}
        <Button block variant="outline" onClick={() => finish('/login')}>
          I have an account
        </Button>
      </div>
    </main>
  );
}
