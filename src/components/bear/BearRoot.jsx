'use client';

import { Component } from 'react';
import { usePathname } from 'next/navigation';
import BearProvider from './BearProvider';
import dynamic from 'next/dynamic';

// The floating bear (its art, animation and voice) loads after the page itself, so it never slows the first paint on a
// low-end phone (roadmap Phase 8: performance budget, bear lazy-loaded).
import useAuthBridge from './useAuthBridge';

const BearHost = dynamic(() => import('./BearHost'), { ssr: false });

// If the bear ever fails to draw, the page carries on without it.
class BearBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err) {
    console.warn('Bearilly could not draw itself:', err);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Put this once in the layout. It gives the whole app the bear and the useBear() remote control.
 *
 *   <BearRoot settings={tutorSettings} studentId={student && student.id} hideOn={['/bear-demo']}>{children}</BearRoot>
 *
 * settings   the school's tutor settings (see lib/bear/settings.js). Leave it out for the default Bearilly.
 * studentId  leave it out and the bear uses whoever is signed in (their mood is loaded if they are a student).
 *            Pass null to switch the mood off, or an id to force one.
 * hideOn     page paths where the bear must not appear (it also hides under them: '/bear-demo' hides '/bear-demo/x').
 * Safety switch: NEXT_PUBLIC_BEAR=off in the settings file removes the bear completely.
 */
export default function BearRoot({ children, settings, studentId, hideOn = [] }) {
  const pathname = usePathname() || '/';
  const signedIn = useAuthBridge(); // also makes every apiGet/apiPost send the signed-in person's token
  const who = studentId === undefined ? signedIn : studentId; // leave studentId out and the bear uses whoever is signed in
  const hidden = process.env.NEXT_PUBLIC_BEAR === 'off' || ['/dev', ...hideOn].some((p) => pathname === p || pathname.startsWith(`${p}/`));
  return (
    <BearProvider settings={settings} studentId={who || null} enabled={!hidden}>
      {children}
      {!hidden && (
        <BearBoundary>
          <BearHost />
        </BearBoundary>
      )}
    </BearProvider>
  );
}
