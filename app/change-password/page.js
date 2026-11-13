'use client';

import { useRouter } from '../../lib/app/nav.js';
import AuthFrame from '../../components/app/AuthFrame';
import NewPasswordForm from '../../components/app/NewPasswordForm';
import RequireRole from '../../components/app/RequireRole';
import { useSession, homeFor } from '../../components/app/SessionProvider';
import { useToast } from '../../components/app/ToastProvider';
import { BackLink } from '../../components/ui';
import { useTitle } from '../../lib/app/hooks';

// Change password. People created by a school admin get a temporary password and land here on first sign-in.
export default function ChangePassword() {
  useTitle('Change password');
  const router = useRouter();
  const toast = useToast();
  const { role, mustChangePassword } = useSession();
  return (
    <RequireRole roles={['student', 'teacher', 'school_admin', 'platform_admin']}>
      <AuthFrame
        title={mustChangePassword ? 'Set your own password' : 'Change password'}
        sub={mustChangePassword ? 'You signed in with a temporary password. Choose your own to continue.' : 'Choose a new password for your account.'}
        pose="point"
        back={mustChangePassword ? null : <BackLink href={role === 'student' ? '/me' : '/staff/settings'}>Back</BackLink>}
      >
        <NewPasswordForm
          onDone={() => {
            toast('Password changed', 'success');
            router.replace(homeFor(role));
          }}
        />
      </AuthFrame>
    </RequireRole>
  );
}
