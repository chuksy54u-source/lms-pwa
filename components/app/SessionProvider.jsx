'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { apiGet, apiPost, apiPatch, usingMocks, MOCK_ROLE_KEY } from '../../lib/api/client.js';
import { createBrowserClient } from '../../lib/supabase/browser.js';
import { clearApiCache } from '../../lib/app/useApi.js';
import { CONNECTED, BEARILLY_HOME, RENEW_EVERY_MS } from '../../lib/app/connected.js';
import { schoolsHref } from '../../lib/app/paths.js';

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

// Connected mode: the school website's own server holds the session in an HttpOnly cookie (/api/bearilly-login).
async function bridgeCall(method, body) {
  let res;
  try {
    res = await fetch('/api/bearilly-login', {
      method,
      headers: body ? { 'Content-Type': 'application/json', Accept: 'application/json' } : { Accept: 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'same-origin',
    });
  } catch (error) {
    throw Object.assign(new Error('Could not reach the school website. Check your connection.'), { code: 'NETWORK', status: 0 });
  }
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    // A teacher or school admin signing in here is told to use Bearilly's own website (the server sends the address).
    if (json && json.error && json.error.code === 'STAFF_USE_BEARILLY') {
      throw Object.assign(new Error(json.error.message || 'Teachers and school admins sign in on Bearilly.'), { code: 'STAFF_USE_BEARILLY', status: res.status, url: (json.data && json.data.url) || '' });
    }
    throw Object.assign(new Error((json && (json.error?.message || json.error)) || 'Sign-in failed.'), { code: res.status === 401 ? 'AUTH' : 'AUTH_SERVER', status: res.status });
  }
  return json || {};
}
const bearillyPage = (page) => `${BEARILLY_HOME.replace(/\/+$/, '')}/${page}`;

const authError = (error) => Object.assign(new Error(error.message || 'Sign-in failed.'), { code: error.code || error.name || 'AUTH', status: error.status });

export default function SessionProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', me: null, mustChangePassword: false, error: null });
  const sbRef = useRef(null);
  const refreshErrorRef = useRef(null);

  const refresh = useCallback(async () => {
    try {
      const me = await apiGet('/api/v1/auth/me');
      refreshErrorRef.current = null;
      let mustChange = Boolean(me && me.must_change_password); // connected school websites: Bearilly says so in /auth/me
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
    if (CONNECTED) {
      sbRef.current = null;
      refresh();
      return undefined;
    }
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

  // Connected mode: keep the person signed in while the page is open by swapping the 15-minute session for a new one.
  const signedIn = state.status === 'in';
  useEffect(() => {
    if (!CONNECTED || !signedIn) return undefined;
    let last = Date.now();
    const renew = () => {
      last = Date.now();
      bridgeCall('PUT').catch((error) => {
        if (error.status === 401) setState({ status: 'out', me: null, mustChangePassword: false, error: null });
      });
    };
    const timer = setInterval(renew, RENEW_EVERY_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible' && Date.now() - last > RENEW_EVERY_MS / 2) renew();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [signedIn]);

  const signIn = useCallback(
    async (email, password) => {
      clearApiCache();
      if (CONNECTED) {
        await bridgeCall('POST', { email: email.trim(), password });
        refreshErrorRef.current = null;
        const me = await refresh();
        if (!me) {
          const current = refreshErrorRef.current;
          if (current) throw current;
          throw Object.assign(new Error('Your account is not linked to this school yet. Ask your school admin.'), { code: 'NO_ACTIVE_MEMBERSHIP' });
        }
        return me;
      }
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
    if (CONNECTED) await bridgeCall('DELETE').catch(() => {});
    else if (usingMocks()) setMockRole(null);
    else if (sbRef.current) await sbRef.current.auth.signOut().catch(() => {});
    try {
      window.sessionStorage.removeItem('bearilly:mood');
    } catch (e) {
      /* ignore */
    }
    setState({ status: 'out', me: null, mustChangePassword: false, error: null });
  }, []);

  // Student self sign-up with the school's invite code. On Bearilly's own website they choose a password and are signed
  // straight in. On a school's own website there is no password box: Bearilly emails them a temporary password the
  // moment they register (in the school's own email format), and they sign in with it.
  const register = useCallback(
    async ({ invite_code, full_name, email, password }) => {
      if (CONNECTED) {
        return apiPost('/api/v1/auth/register', { invite_code: invite_code.trim(), full_name: full_name.trim(), email: email.trim() });
      }
      const out = await apiPost('/api/v1/auth/register', { invite_code: invite_code.trim(), full_name: full_name.trim(), email: email.trim(), password });
      if (usingMocks()) setMockRole('student');
      await signIn(email, password);
      return out;
    },
    [signIn],
  );

  const requestPasswordReset = useCallback(async (email) => {
    if (CONNECTED) {
      throw Object.assign(new Error(`Password resets are handled by Bearilly. Open ${bearillyPage('forgot-password')}, reset your password there, then sign in here again.`), { code: 'USE_BEARILLY' });
    }
    if (usingMocks()) return true;
    const sb = sbRef.current;
    if (!sb) throw Object.assign(new Error('Password reset is not set up yet.'), { code: 'NOT_CONFIGURED' });
    const { error } = await sb.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}${schoolsHref('/reset-password')}` });
    if (error) throw authError(error);
    return true;
  }, []);

  const updatePassword = useCallback(async (password) => {
    if (CONNECTED) {
      // The first password choice after the emailed temporary one. (Bearilly refuses it once they have chosen their own.)
      await apiPost('/api/v1/auth/password', { password });
      setState((s) => ({ ...s, mustChangePassword: false }));
      return true;
    }
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
    if (CONNECTED) throw Object.assign(new Error('Google sign-in is not available on this school website. Use your email and password.'), { code: 'NOT_CONFIGURED' });
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
