'use client';

import BrandMark from './BrandMark';

// The full-page loading screen: the school's own logo (or its monogram when no logo was uploaded) in the middle of the page with a
// sliding bar under it. It is the screen shown while the app checks who is signed in, and it is used wherever a
// student page has to wait for something - moving between pages, signing in, checking the account - so a student never sees a bare
// line of text such as "Loading your school account…".
//
//   message - an optional short line under the bar (for example "Signing you in…"); it is also read out to screen readers
//   overlay - cover whatever page is behind it (used while the sign-in form is still on the screen)
export default function LoadingScreen({ message = '', overlay = false }) {
  const text = message || 'Loading';
  return (
    <div className={`splash${overlay ? ' splash-overlay' : ''}`} role="status" aria-live="polite" aria-busy="true">
      <BrandMark className="auth-logo" size={96} />
      <div className="splash-bar" aria-hidden="true">
        <span />
      </div>
      {message ? <p className="splash-message">{message}</p> : <span className="sr-only">{text}</span>}
    </div>
  );
}
