'use client';

import { useEffect, useRef } from 'react';
import { useBear } from './BearProvider';

/**
 * When the element matching `selector` scrolls into view, the bear says a line (once) and points at it.
 * For the landing page tour and for "first time here" hints.
 *
 *   useBearOnView('#features', { say: 'Here is what I can do.' });
 *   useBearOnView('#pricing', { sayKey: 'welcome', pose: 'wave', point: false });
 *
 * Call it from a client component that renders AFTER the element exists (the element must be on the page).
 */
export default function useBearOnView(selector, { say, sayKey, pose = 'point', emotion = 'adorable', point = true, threshold = 0.6, once = true } = {}) {
  const bear = useBear();
  const done = useRef(false);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const el = document.querySelector(selector);
    if (!el) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting || (once && done.current)) return;
          done.current = true;
          const opts = { pose, emotion, pointAt: point ? selector : undefined };
          if (say) bear.say(say, opts);
          else if (sayKey) bear.sayKey(sayKey, undefined, opts);
          if (once) io.disconnect();
        });
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [bear, selector, say, sayKey, pose, emotion, point, threshold, once]);
}
