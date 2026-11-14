'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '../../../lib/app/nav.js';
import AuthFrame from '../AuthFrame';
import NewPasswordForm from '../NewPasswordForm';
import { Button, BackLink } from '../../ui';
import { useSession, homeFor } from '../SessionProvider';
import { useToast } from '../ToastProvider';
import { usingMocks } from '../../../lib/api/client';
import { useQueryParam, useTitle } from '../../../lib/app/hooks';
import { schoolsHref } from '../../../lib/app/paths.js';
import { CONNECTED } from '../../../lib/app/connected.js';

// The page the reset email opens.
//  - On Bearilly's own website: the one-time token in the address signs the person in for this purpose only; they choose a new password.
//  - On a school's own website: the emailed link carries ?token=...; the student chooses a new password here, the school's server checks
//    the token, and they sign in with it. The token is single use and lasts 60 minutes.
export default function ResetPasswordScreen() {
  useTitle('Choose a new password');
  const router = useRouter();
  const toast = useToast();
  const token = useQueryParam('token');
  const { supabase, role, completePasswordReset } = useSession();
  const [state, setState] = useState('checking'); // checking | ready | expired

  useEffect(() => {
    if (CONNECTED) {
      // Wait one beat for the address to be read, then see whether a link code is there.
      const t = setTimeout(() => setState(token ? 'ready' : 'expired'), 300);
      return () => clearTimeout(t);
    }
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
  }, [supabase, token]);

  return (
    <AuthFrame title="Choose a new password" sub="Make it something you will remember." back={<BackLink href="/login">Back to login</BackLink>}>
      {state === 'checking' && <p className="center muted">Checking your link…</p>}
      {state === 'expired' && (
        <div className="stack center">
          <p className="muted">This reset link has expired or was already used.</p>
          <Button href="/forgot-password" block>
            Send a new link
          </Button>
        </div>
      )}
      {state === 'ready' && CONNECTED && (
        <NewPasswordForm
          save={(password) => completePasswordReset(token, password)}
          submitLabel="Save new password"
          onDone={() => {
            toast('Password changed. Log in with your new password.', 'success');
            // A full page load, so the school's own style sheets (global) are the ones around the login page.
            window.location.replace(schoolsHref('/login'));
          }}
        />
      )}
      {state === 'ready' && !CONNECTED && (
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
