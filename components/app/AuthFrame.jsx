'use client';

import BrandMark from './BrandMark';

// The shared frame of the sign-in, create-account and password screens: the school's own logo (or its monogram) on top, a form below.
// Never Bearilly's logo: a student is not shown that the school uses Bearilly. (emotion and pose are accepted for older callers and ignored.)
// eslint-disable-next-line no-unused-vars
export default function AuthFrame({ title, sub, emotion, pose, back, children, footer }) {
  return (
    <main className="auth">
      <div className="auth-card">
        {back}
        <div className="auth-head">
          <BrandMark className="auth-logo" size={96} />
          <h1>{title}</h1>
          {sub && <p className="muted">{sub}</p>}
        </div>
        {children}
        {footer && <div className="auth-foot">{footer}</div>}
      </div>
    </main>
  );
}
