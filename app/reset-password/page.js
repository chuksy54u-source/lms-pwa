'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '../../lib/app/nav.js';
import AuthFrame from '../../components/app/AuthFrame';
import NewPasswordForm from '../../components/app/NewPasswordForm';
import { Button, BackLink } from '../../components/ui';
import { useSession, homeFor } from '../../components/app/SessionProvider';
import { useToast } from '../../components/app/ToastProvider';
import { usingMocks } from '../../lib/api/client';
import { useTitle } from '../../lib/app/hooks';

// The page the reset email opens. Supabase reads the one-time token from the address and signs the person in
// for this purpose only; they then choose a new password.
export default function ResetPassword() {
  useTitle('Choose a new password');
  const router = useRouter();
  const toast = useToast();
  const { supabase, role } = useSession();
  const [state, setState] = useState('checking'); // checking | ready | expired

  useEffect(() => {
    if (usingMocks()) {
      setState('ready');
      return undefined;
    }
    const sb = supabase();
    if (!sb) {
      setState('expired');
      return undefined;
    }
    const { data } = sb.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setState('ready');
    });
    const t = setTimeout(() => sb.auth.getSession().then(({ data: d }) => setState(d.session ? 'ready' : 'expired')), 1500);
    return () => {
      clearTimeout(t);
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <AuthFrame title="Choose a new password" sub="Make it something you will remember." back={<BackLink href="/login">Back to login</BackLink>} emotion={state === 'expired' ? 'worried' : 'adorable'}>
      {state === 'checking' && <p className="center muted">Checking your link…</p>}
      {state === 'expired' && (
        <div className="stack center">
          <p className="muted">This reset link has expired or was already used.</p>
          <Button href="/forgot-password" block>
            Send a new link
          </Button>
        </div>
      )}
      {state === 'ready' && (
        <NewPasswordForm
          onDone={() => {
            toast('Password changed. You are signed in.', 'success');
            router.replace(role ? homeFor(role) : '/');
          }}
        />
      )}
    </AuthFrame>
  );
}
