'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { apiGet, apiPost, apiPatch, usingMocks, MOCK_ROLE_KEY } from '../../lib/api/client.js';
import { createBrowserClient } from '../../lib/supabase/browser.js';
import { clearApiCache } from '../../lib/app/useApi.js';

// Who is signed in?  const { status, me, signIn, signOut } = useSession();
// status: 'loading' | 'in' | 'out'. `me` is GET /api/v1/auth/me: { id, full_name, email, role, school }.
// Sign-in itself is Supabase Auth (the backend's decision D32); the API trusts the Supabase token.

const SessionContext = createContext(null);

export const HOME_FOR = { student: '/home', teacher: '/teacher', school_admin: '/admin', platform_admin: '/platform' };
export const homeFor = (role) => HOME_FOR[role] || '/home';

function supabaseOrNull() {
  if (usingMocks()) return null;
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return null;
    return createBrowserClient();
  } catch (e) {
    return null;
  }
}

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

const authError = (error) => Object.assign(new Error(error.message || 'Sign-in failed.'), { code: error.code || error.name || 'AUTH', status: error.status });

export default function SessionProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', me: null, mustChangePassword: false, error: null });
  const sbRef = useRef(null);
  const refreshErrorRef = useRef(null);

  const refresh = useCallback(async () => {
    try {
      const me = await apiGet('/api/v1/auth/me');
      refreshErrorRef.current = null;
      let mustChange = false;
      const sb = sbRef.current;
      if (sb) {
        const { data } = await sb.auth.getUser();
        mustChange = Boolean(data && data.user && data.user.user_metadata && data.user.user_metadata.must_change_password);
      }
      setState({ status: 'in', me, mustChangePassword: mustChange, error: null });
      return me;
    } catch (error) {
      refreshErrorRef.current = error.status === 401 ? null : error;
      setState({ status: 'out', me: null, mustChangePassword: false, error: error.status === 401 ? null : error });
      return null;
    }
  }, []);

  useEffect(() => {
    const sb = supabaseOrNull();
    sbRef.current = sb;
    if (!sb) {
      if (usingMocks()) refresh();
      else setState({ status: 'out', me: null, mustChangePassword: false, error: null });
      return undefined;
    }
    sb.auth.getSession().then(({ data }) => {
      if (data.session) refresh();
      else setState({ status: 'out', me: null, mustChangePassword: false, error: null });
    });
    const { data } = sb.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) setState({ status: 'out', me: null, mustChangePassword: false, error: null });
      else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') refresh();
    });
    return () => data.subscription.unsubscribe();
  }, [refresh]);

  const signIn = useCallback(
    async (email, password) => {
      clearApiCache();
      if (usingMocks()) {
        setMockRole(mockRoleForEmail(email));
        const me = await refresh();
        if (!me) throw Object.assign(new Error('Sign-in failed.'), { code: 'AUTH' });
        return me;
      }
      const sb = sbRef.current;
      if (!sb) throw Object.assign(new Error('Sign-in is not set up yet: the Supabase settings are missing.'), { code: 'NOT_CONFIGURED' });
      const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw authError(error);
      refreshErrorRef.current = null;
      const me = await refresh();
      if (!me) {
        const current = refreshErrorRef.current;
        if (current) throw current;
        throw Object.assign(new Error('Your account is not linked to a school yet. Ask your school admin.'), { code: 'NO_ACTIVE_MEMBERSHIP' });
      }
      return me;
    },
    [refresh],
  );

  const signOut = useCallback(async () => {
    clearApiCache();
    if (usingMocks()) setMockRole(null);
    else if (sbRef.current) await sbRef.current.auth.signOut().catch(() => {});
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

  const requestPasswordReset = useCallback(async (email) => {
    if (usingMocks()) return true;
    const sb = sbRef.current;
    if (!sb) throw Object.assign(new Error('Password reset is not set up yet.'), { code: 'NOT_CONFIGURED' });
    const { error } = await sb.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
    if (error) throw authError(error);
    return true;
  }, []);

  const updatePassword = useCallback(async (password) => {
    if (usingMocks()) return true;
    const sb = sbRef.current;
    if (!sb) throw Object.assign(new Error('Not signed in.'), { code: 'UNAUTHORIZED' });
    const { error } = await sb.auth.updateUser({ password, data: { must_change_password: false } });
    if (error) throw authError(error);
    if (state.me?.role === 'student') {
      await apiPatch(`/api/v1/students/${encodeURIComponent(state.me.id)}/onboarding`, { password_changed: true });
    }
    setState((s) => ({ ...s, mustChangePassword: false }));
    return true;
  }, [state.me]);

  const signInWithGoogle = useCallback(async () => {
    const sb = sbRef.current;
    if (!sb) throw Object.assign(new Error('Google sign-in is not set up yet.'), { code: 'NOT_CONFIGURED' });
    const { error } = await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/` } });
    if (error) throw authError(error);
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
    () => ({ ...state, role: state.me ? state.me.role : null, refresh, signIn, signOut, register, requestPasswordReset, updatePassword, signInWithGoogle, switchMockRole, supabase: () => sbRef.current }),
    [state, refresh, signIn, signOut, register, requestPasswordReset, updatePassword, signInWithGoogle, switchMockRole],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  return useContext(SessionContext);
}
