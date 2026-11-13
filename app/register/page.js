'use client';

import { useEffect, useState } from 'react';
import { Link } from '../../lib/app/nav.js';
import { useRouter } from '../../lib/app/nav.js';
import AuthFrame from '../../components/app/AuthFrame';
import { Button, Input, Checkbox, PasswordStrength, Callout, BackLink } from '../../components/ui';
import { useSession } from '../../components/app/SessionProvider';
import { useTenant } from '../../components/app/TenantProvider';
import { useQueryParam, useTitle, EMAIL_RE } from '../../lib/app/hooks';
import { friendlyError } from '../../lib/app/format';
import { schoolsHref } from '../../lib/app/paths.js';
import { CONNECTED } from '../../lib/app/connected.js';

// CREATE ACCOUNT: a student signs up with their school's invite code (POST /auth/register).
// On Bearilly's own website they choose a password and are signed straight in. On a school's own website (connected mode)
// there is no password box: Bearilly emails them a temporary password right away and they sign in with it.
export default function Register() {
  useTitle('Create account');
  const router = useRouter();
  const codeFromLink = useQueryParam('code');
  const { register } = useSession();
  const { school } = useTenant();
  const [f, setF] = useState({ full_name: '', email: '', password: '', confirm: '', invite_code: '', agree: false });
  const [touched, setTouched] = useState({});
  const [server, setServer] = useState({});
  const [busy, setBusy] = useState(false);
  const [emailedTo, setEmailedTo] = useState('');

  useEffect(() => {
    if (codeFromLink) setF((x) => ({ ...x, invite_code: codeFromLink }));
  }, [codeFromLink]);

  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const blur = (k) => () => setTouched((t) => ({ ...t, [k]: true }));
  const errors = {
    full_name: f.full_name.trim().length < 2 ? 'Enter your full name' : server.full_name,
    email: !EMAIL_RE.test(f.email.trim()) ? 'Enter a valid email address' : server.email,
    password: CONNECTED ? '' : f.password.length < 8 ? 'Use at least 8 characters' : server.password,
    confirm: CONNECTED ? '' : f.confirm !== f.password ? 'Passwords do not match' : '',
    invite_code: f.invite_code.trim().length < 3 ? 'Ask your school for its invite code' : server.invite_code,
    agree: !f.agree ? 'Please agree to continue' : '',
  };
  const show = (k) => (touched[k] || touched.all ? errors[k] : '');

  async function onSubmit(e) {
    e.preventDefault();
    setTouched({ all: true });
    setServer({});
    if (Object.entries(errors).some(([k, v]) => v && k !== 'form')) return;
    setBusy(true);
    try {
      await register(f);
      if (CONNECTED) {
        setEmailedTo(f.email.trim());
        setBusy(false);
        return;
      }
      router.replace('/home');
    } catch (err) {
      const d = err.details || {};
      const next = { form: friendlyError(err) };
      if (err.code === 'EMAIL_TAKEN') next.email = 'That email already has an account. Try signing in.';
      if (err.code === 'EMAIL_NOT_SENT') next.form = 'We could not send your temporary password email, so nothing was created. Please try again in a moment.';
      Object.entries(d).forEach(([k, v]) => (next[k] = `${k.replace('_', ' ')} ${v}`));
      if (err.code === 'NOT_FOUND' || /invite/i.test(err.message || '')) next.invite_code = 'That invite code was not found. Check it with your school.';
      setServer(next);
      setBusy(false);
    }
  }

  if (emailedTo) {
    return (
      <AuthFrame title="Check your email" sub={`We sent a temporary password to ${emailedTo}.`} pose="point">
        <div className="stack">
          <Callout tone="success" title="Your account is ready">
            Open the email from your school, then log in with that temporary password. You will choose your own password the first time you log in. If it does not arrive in a few minutes, check your spam folder.
          </Callout>
          <Button href="/login" block>
            Go to log in
          </Button>
        </div>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame
      title="Create account"
      sub={school ? `Join ${school.name}` : 'Join your school on Bearilly'}
      back={<BackLink href="/login">Back to login</BackLink>}
      footer={
        <>
          Already have an account? <Link href="/login" className="strong">Log in</Link>
        </>
      }
    >
      <form className="stack" onSubmit={onSubmit} noValidate>
        {server.form && (
          <Callout tone="danger" title="Could not create your account">
            {server.form}
          </Callout>
        )}
        <Input label="School invite code" placeholder="e.g. ORN-7KQ2" autoCapitalize="characters" value={f.invite_code} onChange={set('invite_code')} onBlur={blur('invite_code')} error={show('invite_code')} hint="Your school gives you this code or a sign-up link." />
        <Input label="Full name" autoComplete="name" placeholder="Ada Okafor" value={f.full_name} onChange={set('full_name')} onBlur={blur('full_name')} error={show('full_name')} />
        <Input label="Email" type="email" autoComplete="email" inputMode="email" placeholder="you@school.edu" value={f.email} onChange={set('email')} onBlur={blur('email')} error={show('email')} />
        {CONNECTED ? (
          <p className="muted">We will email you a temporary password as soon as you create your account.</p>
        ) : (
          <>
            <div className="stack-sm">
              <Input label="Password" type="password" autoComplete="new-password" value={f.password} onChange={set('password')} onBlur={blur('password')} error={show('password')} />
              <PasswordStrength value={f.password} />
            </div>
            <Input label="Confirm password" type="password" autoComplete="new-password" value={f.confirm} onChange={set('confirm')} onBlur={blur('confirm')} error={show('confirm')} />
          </>
        )}
        <div className="stack-sm">
          <Checkbox checked={f.agree} onChange={set('agree')}>
            I agree to the{' '}
            <a href={schoolsHref('/privacy')} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
              Terms &amp; Privacy Policy
            </a>
            . If I am under 18, my parent or guardian agrees too.
          </Checkbox>
          {show('agree') && <p className="field-error">{show('agree')}</p>}
        </div>
        <Button type="submit" block loading={busy}>
          Create account
        </Button>
      </form>
    </AuthFrame>
  );
}
