'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost, usingMocks, MOCK_ROLE_KEY } from '../../lib/api/client.js';
import { clearApiCache } from '../../lib/app/useApi.js';

// Who is signed in?  const { status, me, signIn, signOut } = useSession();
// status: 'loading' | 'in' | 'out'. `me` is GET /api/v1/auth/me: { id, full_name, email, role, school }.
// Sign-in itself is Supabase Auth (the backend's decision D32); the API trusts the Supabase token.

const SessionContext = createContext(null);

export const HOME_FOR = { student: '/home', teacher: '/teacher', school_admin: '/admin', platform_admin: '/platform' };
export const homeFor = (role) => HOME_FOR[role] || '/home';

function setMockRole(role) {
  try {
    if (role) window.localStorage.setItem(MOCK_ROLE_KEY, role);
    else window.localStorage.removeItem(MOCK_ROLE_KEY);
  } catch (e) {
    /* ignore */
  }
}

export function mockRoleForEmail(email) {
  const e = String(email || '').toLowerCase();
  if (e.startsWith('platform')) return 'platform_admin';
  if (e.startsWith('admin')) return 'school_admin';
  if (e.startsWith('teacher')) return 'teacher';
  return 'student';
}

export default function SessionProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', me: null, mustChangePassword: false, error: null });

  const refresh = useCallback(async () => {
    try {
      const me = await apiGet('/api/v1/auth/me');
      setState({ status: 'in', me, mustChangePassword: false, error: null });
      return me;
    } catch (error) {
      setState({ status: 'out', me: null, mustChangePassword: false, error: error.status === 401 ? null : error });
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;
    apiGet('/api/v1/auth/me')
      .then((me) => {
        if (active) setState({ status: 'in', me, mustChangePassword: false, error: null });
      })
      .catch((error) => {
        if (active) setState({ status: 'out', me: null, mustChangePassword: false, error: error.status === 401 ? null : error });
      });
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(
    async (email, password) => {
      clearApiCache();
      if (usingMocks()) {
        setMockRole(mockRoleForEmail(email));
        const me = await refresh();
        if (!me) throw Object.assign(new Error('Sign-in failed.'), { code: 'AUTH' });
        return me;
      }
      const response = await fetch('/api/bearilly-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw Object.assign(new Error(result.error || 'Email or password is incorrect.'), { code: 'AUTH', status: response.status });
      const me = await refresh();
      if (!me) {
        throw Object.assign(new Error('Your account is not linked to a school yet. Ask your school admin.'), { code: 'NO_ACTIVE_MEMBERSHIP' });
      }
      return me;
    },
    [refresh],
  );

  const signOut = useCallback(async () => {
    clearApiCache();
    if (usingMocks()) setMockRole(null);
    else {
      const response = await fetch('/api/bearilly-login', { method: 'DELETE', credentials: 'same-origin' });
      if (!response.ok) throw new Error('Could not sign out. Please try again.');
    }
    try {
      window.sessionStorage.removeItem('bearilly:mood');
    } catch (e) {
      /* ignore */
    }
    setState({ status: 'out', me: null, mustChangePassword: false, error: null });
  }, []);

  // Student self sign-up with the school's invite code, then sign straight in.
  const register = useCallback(
    async ({ invite_code, full_name, email, password }) => {
      const out = await apiPost('/api/v1/auth/register', { invite_code: invite_code.trim(), full_name: full_name.trim(), email: email.trim(), password });
      if (usingMocks()) setMockRole('student');
      await signIn(email, password);
      return out;
    },
    [signIn],
  );

  const requestPasswordReset = useCallback(async () => {
    if (usingMocks()) return true;
    throw Object.assign(new Error('Password reset is not configured for this connected Bearilly website yet.'), { code: 'NOT_CONFIGURED' });
  }, []);

  const updatePassword = useCallback(async (password) => {
    if (usingMocks()) return true;
    throw Object.assign(new Error('Password changes are not configured for this connected Bearilly website yet.'), { code: 'NOT_CONFIGURED' });
  }, []);

  const signInWithGoogle = useCallback(async () => {
    throw Object.assign(new Error('Google sign-in is not configured for this connected Bearilly website yet.'), { code: 'NOT_CONFIGURED' });
  }, []);

  // Mock mode only: jump between roles to review every screen.
  const switchMockRole = useCallback(
    async (role) => {
      clearApiCache();
      setMockRole(role);
      if (role) await refresh();
      else setState({ status: 'out', me: null, mustChangePassword: false, error: null });
    },
    [refresh],
  );

  const value = useMemo(
    () => ({ ...state, role: state.me ? state.me.role : null, refresh, signIn, signOut, register, requestPasswordReset, updatePassword, signInWithGoogle, switchMockRole }),
    [state, refresh, signIn, signOut, register, requestPasswordReset, updatePassword, signInWithGoogle, switchMockRole],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  return useContext(SessionContext);
}
