import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Installed by Bearilly Buildgram (full codebase swap). BEARILLY_URL is the Bearilly school address that Connect gives
// you; BEARILLY_API_KEY is your school's key with the "sso" permission. Both are read here, on the server, and never
// reach the browser.
const BEARILLY_URL = process.env.BEARILLY_URL || '';
const BEARILLY_API_KEY = process.env.BEARILLY_API_KEY || '';
const SESSION_COOKIE = 'bearilly_session';
const SCHOOL_COOKIE = 'bearilly_school_id';
const EXPIRES_COOKIE = 'bearilly_session_exp';
// A sign-in token works for 15 minutes. This server swaps it for a fresh one whenever the person uses the website and the token has
// less than this long left, so people stay signed in while they use it, even when their page was asleep for a while.
const RENEW_WITHIN_MS = 5 * 60 * 1000;

const fail = (status, code, message) => NextResponse.json({ error: { code, message } }, { status });
const normalizeHostname = (hostname) => hostname.toLowerCase().replace(/^www\./, '');

// Connect hands out an address such as https://myschool.bearilly-v2.vercel.app; the API itself lives on the root.
function bearillyBase(request) {
  const base = new URL(BEARILLY_URL);
  const labels = base.hostname.split('.');
  if (base.hostname.endsWith('.vercel.app') && labels.length >= 4) base.hostname = labels.slice(1).join('.');
  if (normalizeHostname(base.hostname) === normalizeHostname(request.nextUrl.hostname)) {
    throw new Error('BEARILLY_URL points at this website instead of Bearilly.');
  }
  return base;
}

// The cookies live as long as the person may stay signed in (Bearilly says when, in session_expires_at: a few hours of not using the
// website, and never longer than 12 hours after signing in), not just the 15 minutes the token works for. An older Bearilly that does not say
// gets the 15 minutes it always had. 'target' is the cookie store (from next/headers) or a response's cookies; both have set and delete.
const cookieMaxAge = (data) => {
  const until = new Date(data.session_expires_at || data.expires_at).getTime();
  const seconds = Math.floor((until - Date.now()) / 1000);
  return Number.isFinite(seconds) ? Math.max(60, seconds) : 14 * 60;
};
function setSession(target, data, schoolId) {
  const options = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: cookieMaxAge(data) };
  target.set(SESSION_COOKIE, data.token, options);
  target.set(SCHOOL_COOKIE, schoolId, options);
  target.set(EXPIRES_COOKIE, String(new Date(data.expires_at).getTime()), options);
}
function clearSession(target) {
  for (const name of [SESSION_COOKIE, SCHOOL_COOKIE, EXPIRES_COOKIE]) target.delete(name);
}

// Swaps the current token for a fresh one. Bearilly also accepts a token that ran out a short while ago. Answers { data } on success, or
// { status } when it did not work (401 means the person is signed out for good: too long idle, too long ago, or the key was revoked).
// A page opens with several calls at once; they all share ONE renewal of the same token (kept for a few seconds) instead of asking for one each.
const renewals = new Map();
function renewSession(base, token, schoolId, host) {
  if (renewals.has(token)) return renewals.get(token);
  const pending = (async () => {
    const upstream = await fetch(new URL('/api/v1/integration/session/renew', base), {
      method: 'POST',
      headers: { 'x-bearilly-session': token, 'x-bearilly-origin-school': schoolId, 'x-bearilly-host': host, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: '{}',
      cache: 'no-store',
    });
    const result = await upstream.json().catch(() => null);
    if (upstream.ok && result && result.data && result.data.token) return { data: result.data };
    return { status: upstream.status };
  })();
  renewals.set(token, pending);
  const forget = () => { setTimeout(() => renewals.delete(token), 8000).unref?.(); };
  pending.then((result) => { if (result.data) forget(); else renewals.delete(token); }, () => renewals.delete(token));
  return pending;
}

async function readConfig(request) {
  if (!BEARILLY_URL || !BEARILLY_API_KEY) {
    console.error('[bearilly-login] BEARILLY_URL or BEARILLY_API_KEY is not set.');
    return { error: fail(500, 'NOT_CONFIGURED', 'Sign-in is not set up on this website yet. Tell your school admin.') };
  }
  try {
    return { base: bearillyBase(request) };
  } catch (error) {
    console.error('[bearilly-login]', error.message);
    return { error: fail(500, 'NOT_CONFIGURED', 'Sign-in is not set up correctly on this website yet. Tell your school admin.') };
  }
}

// POST { email, password }: sign in to Bearilly and keep the session in HttpOnly cookies.
export async function POST(request) {
  try {
    const credentials = await request.json().catch(() => null);
    if (!credentials || typeof credentials.email !== 'string' || typeof credentials.password !== 'string' || !credentials.email.trim() || !credentials.password) {
      return fail(400, 'INVALID_REQUEST', 'Enter your email and password.');
    }
    const config = await readConfig(request);
    if (config.error) return config.error;
    const upstream = await fetch(new URL('/api/v1/integration/session', config.base), {
      method: 'POST',
      headers: { 'x-bearilly-key': BEARILLY_API_KEY, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email: credentials.email.trim(), password: credentials.password }),
    });
    const result = await upstream.json().catch(() => null);
    if (!upstream.ok || !result?.data?.token || !result.data.school_id) {
      const status = upstream.status === 401 || upstream.status === 403 ? 401 : upstream.status >= 500 ? 502 : upstream.status || 502;
      return fail(status, status === 401 ? 'AUTH' : 'AUTH_SERVER', result?.error?.message || 'Email or password is incorrect.');
    }
    // Teachers and school admins do not work on this website: they sign in on Bearilly's own website. Nothing is kept for them here.
    if (result.data.role !== 'student') {
      return NextResponse.json({
        error: { code: 'STAFF_USE_BEARILLY', message: 'Teachers and school admins sign in on the staff website, not here.' },
        data: { staff: true, role: result.data.role, url: new URL('/login', config.base).toString() },
      }, { status: 403 });
    }
    const store = await cookies();
    setSession(store, result.data, result.data.school_id);
    return NextResponse.json({ data: { ok: true, role: result.data.role } });
  } catch (error) {
    console.error('[bearilly-login] could not sign in:', error);
    return fail(502, 'AUTH_SERVER', 'Could not sign you in. Please try again.');
  }
}

// PUT: swap the current session for a fresh one, so people stay signed in while the page is open (and when it wakes up again).
export async function PUT(request) {
  try {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;
    const schoolId = store.get(SCHOOL_COOKIE)?.value;
    if (!token || !schoolId) return fail(401, 'UNAUTHORIZED', 'Please sign in again.');
    const config = await readConfig(request);
    if (config.error) return config.error;
    const renewed = await renewSession(config.base, token, schoolId, request.nextUrl.hostname);
    if (!renewed.data) {
      if (renewed.status === 401 || renewed.status === 403) {
        clearSession(store);
        return fail(401, 'UNAUTHORIZED', 'Please sign in again.');
      }
      return fail(502, 'AUTH_SERVER', 'Could not refresh your sign-in. Try again in a moment.');
    }
    setSession(store, renewed.data, schoolId);
    return NextResponse.json({ data: { ok: true } });
  } catch (error) {
    console.error('[bearilly-login] could not renew the session:', error);
    return fail(502, 'AUTH_SERVER', 'Could not refresh your sign-in. Try again in a moment.');
  }
}

// DELETE: sign out.
export async function DELETE() {
  const store = await cookies();
  clearSession(store);
  return NextResponse.json({ data: { ok: true } });
}
