'use client';

import { useState } from 'react';
import { Button, Input, PasswordStrength, Callout } from '../ui';
import { useSession } from './SessionProvider';
import { friendlyError } from '../../lib/app/format';

// Used by /reset-password (from the email link) and /change-password (first sign-in with a temporary password).
export default function NewPasswordForm({ onDone, submitLabel = 'Save new password' }) {
  const { updatePassword } = useSession();
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pwError = pw.length < 8 ? 'Use at least 8 characters' : '';
  const confirmError = confirm !== pw ? 'Passwords do not match' : '';

  async function onSubmit(e) {
    e.preventDefault();
    setTouched(true);
    if (pwError || confirmError) return;
    setBusy(true);
    setError('');
    try {
      await updatePassword(pw);
      onDone && onDone();
    } catch (err) {
      setError(friendlyError(err));
      setBusy(false);
    }
  }

  return (
    <form className="stack" onSubmit={onSubmit} noValidate>
      {error && <Callout tone="danger" title="Could not save">{error}</Callout>}
      <div className="stack-sm">
        <Input label="New password" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} error={touched ? pwError : ''} />
        <PasswordStrength value={pw} />
      </div>
      <Input label="Confirm new password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={touched ? confirmError : ''} />
      <Button type="submit" block loading={busy}>
        {submitLabel}
      </Button>
    </form>
  );
}
