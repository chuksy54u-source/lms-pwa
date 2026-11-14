'use client';

import { useState } from 'react';
import { Link } from '../../../lib/app/nav.js';
import { useRouter } from '../../../lib/app/nav.js';
import AuthFrame from '../AuthFrame';
import { Button, Input, Callout } from '../../ui';
import { useSession, homeFor } from '../SessionProvider';
import { useTenant } from '../TenantProvider';
import { useQueryParam, useTitle, EMAIL_RE } from '../../../lib/app/hooks';
import { features } from '../../../lib/app/features';
import { usingMocks } from '../../../lib/api/client';
import { friendlyError } from '../../../lib/app/format';
import { appName } from '../../../lib/app/brand.js';
import { CONNECTED } from '../../../lib/app/connected.js';

// SIGN IN
export default function LoginScreen() {
  useTitle('Sign in');
  const router = useRouter();
  const next = useQueryParam('next');
  const { signIn, signInWithGoogle } = useSession();
  const { school, tutor } = useTenant();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const emailError = touched.email && !EMAIL_RE.test(email.trim()) ? 'Enter a valid email address' : '';
  const passwordError = touched.password && password.length < 8 ? 'Passwords are at least 8 characters' : '';

  async function onSubmit(e) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!EMAIL_RE.test(email.trim()) || password.length < 8) return;
    setBusy(true);
    setError('');
    try {
      const me = await signIn(email, password);
      const destination = me.role === 'school_admin' && me.school?.status === 'setup' ? '/admin/setup' : homeFor(me.role);
      router.replace(next && next.startsWith('/') && !next.startsWith('//') ? next : destination);
    } catch (err) {
      const msg = /invalid login/i.test(err.message || '') ? 'That email and password do not match. Try again or reset your password.' : friendlyError(err);
      setError(msg);
      setBusy(false);
    }
  }

  return (
    <AuthFrame
      title={`Welcome to ${appName(school)}`}
      sub={`Learn, submit and grow with ${(tutor && tutor.name) || 'your AI buddy'}`}
      footer={
        <>
          {school || CONNECTED ? <>New here? <Link href="/register" className="strong">Create account</Link></> : <>Running a school? <Link href="/signup" className="strong">Create a school account</Link></>}
        </>
      }
    >
      {usingMocks() && (
        <Callout tone="info" title="Sample data mode">
          Any password of 8+ characters works. Start the email with <b>admin@</b>, <b>teacher@</b> or <b>platform@</b> to see those dashboards; anything else signs in as a student.
        </Callout>
      )}
      <form className="stack" onSubmit={onSubmit} noValidate>
        {error && (
          <Callout tone="danger" title="Could not sign in">
            {error}
          </Callout>
        )}
        <Input label="Email" type="email" autoComplete="email" inputMode="email" placeholder="you@school.edu" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => setTouched((t) => ({ ...t, email: true }))} error={emailError} required />
        <Input label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} onBlur={() => setTouched((t) => ({ ...t, password: true }))} error={passwordError} hint="Min. 8 characters" required />
        <div style={{ textAlign: 'right', marginTop: -4 }}>
          <Link href="/forgot-password" className="small strong">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" block loading={busy}>
          Log in
        </Button>
        {features.googleSignIn() && (
          <>
            <div className="or">or</div>
            <Button variant="outline" block onClick={() => signInWithGoogle().catch((err) => setError(friendlyError(err)))}>
              <GoogleMark /> Continue with Google
            </Button>
          </>
        )}
      </form>
    </AuthFrame>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
