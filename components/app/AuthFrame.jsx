'use client';

import BearArt from './BearArt';

// The shared frame of the sign-in, create-account and password screens: the school's bear on top, a form below.
export default function AuthFrame({ title, sub, emotion = 'adorable', pose = 'idle', back, children, footer }) {
  return (
    <main className="auth">
      <div className="auth-card">
        {back}
        <div className="auth-head">
          <BearArt className="auth-logo" size="head" emotion={emotion} pose={pose} />
          <h1>{title}</h1>
          {sub && <p className="muted">{sub}</p>}
        </div>
        {children}
        {footer && <div className="auth-foot">{footer}</div>}
      </div>
    </main>
  );
}
