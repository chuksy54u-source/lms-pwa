'use client';

import { CONNECTED, SCHOOL_NAME } from '../lib/app/connected.js';

// Last-resort screen if the whole app (even the layout) fails. Plain HTML: no providers are running here.
// On a school's own website it carries the school's name and no picture, so a student is never shown Bearilly.
export default function GlobalError({ reset }) {
  const name = CONNECTED ? (SCHOOL_NAME || '').trim() || 'The student portal' : 'Bearilly';
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', display: 'grid', placeItems: 'center', minHeight: '100vh', margin: 0, background: '#F7F8FA', color: '#1B2433' }}>
        <main style={{ textAlign: 'center', padding: 24, maxWidth: 420 }}>
          {!CONNECTED && <img src="/bear/exports/head-180.png" alt="" width="96" height="96" />}
          <h1 style={{ fontSize: '1.4rem' }}>{name} could not load</h1>
          <p>Check your internet connection, then try again.</p>
          <button type="button" onClick={() => reset()} style={{ minHeight: 48, padding: '0 22px', borderRadius: 12, border: 0, background: '#1E3A5F', color: '#fff', fontSize: '1rem', cursor: 'pointer' }}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
