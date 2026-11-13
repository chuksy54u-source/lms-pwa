'use client';

import { useState } from 'react';
import AuthFrame from '../../components/app/AuthFrame';
import { Button, Input, BackLink, Callout } from '../../components/ui';
import { useSession } from '../../components/app/SessionProvider';
import { useTitle, EMAIL_RE } from '../../lib/app/hooks';
import { friendlyError } from '../../lib/app/format';

// FORGOT PASSWORD: Supabase emails a reset link that opens /reset-password.
export default function ForgotPassword() {
  useTitle('Reset password');
  const { requestPasswordReset } = useSession();
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const invalid = !EMAIL_RE.test(email.trim());

  async function onSubmit(e) {
    e.preventDefault();
    setTouched(true);
    if (invalid) return;
    setBusy(true);
    setError('');
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthFrame title="Reset password" sub="Enter your email and we will send you a reset link." emotion="worried" back={<BackLink href="/login">Back to login</BackLink>}>
      <form className="stack" onSubmit={onSubmit} noValidate>
        <Input label="Email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => setTouched(true)} error={touched && invalid ? 'Enter a valid email address' : ''} />
        <Button type="submit" block loading={busy}>
          {sent ? 'Send again' : 'Send reset link'}
        </Button>
        {sent && (
          <Callout tone="success" title="✅ Link sent">
            If {email.trim()} has an account, a reset link is on its way. Check your inbox and spam folder.
          </Callout>
        )}
        {error && <Callout tone="danger" title="Could not send the link">{error}</Callout>}
      </form>
    </AuthFrame>
  );
}
