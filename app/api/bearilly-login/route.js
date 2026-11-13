import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Installed by Bearilly Buildgram (full codebase swap). BEARILLY_URL is the Bearilly school address that Connect gives
// you; BEARILLY_API_KEY is your school's key with the "sso" permission. Both are read here, on the server, and never
// reach the browser.
const BEARILLY_URL = process.env.BEARILLY_URL || '';
const BEARILLY_API_KEY = process.env.BEARILLY_API_KEY || '';
const SESSION_COOKIE = 'bearilly_session';
const SCHOOL_COOKIE = 'bearilly_school_id';

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

// The session lasts 15 minutes and is renewed while the page is open (PUT), so this cookie does too.
const cookieOptions = (expiresAt) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: Math.max(60, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000) || 14 * 60),
});

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
        error: { code: 'STAFF_USE_BEARILLY', message: 'Teachers and school admins sign in on the Bearilly website, not here.' },
        data: { staff: true, role: result.data.role, url: new URL('/login', config.base).toString() },
      }, { status: 403 });
    }
    const store = await cookies();
    const options = cookieOptions(result.data.expires_at);
    store.set(SESSION_COOKIE, result.data.token, options);
    store.set(SCHOOL_COOKIE, result.data.school_id, options);
    return NextResponse.json({ data: { ok: true, role: result.data.role } });
  } catch (error) {
    console.error('[bearilly-login] could not sign in:', error);
    return fail(502, 'AUTH_SERVER', 'Could not sign in to Bearilly. Please try again.');
  }
}

// PUT: swap the current 15-minute session for a fresh one, so people stay signed in while the page is open.
export async function PUT(request) {
  try {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;
    const schoolId = store.get(SCHOOL_COOKIE)?.value;
    if (!token || !schoolId) return fail(401, 'UNAUTHORIZED', 'Please sign in again.');
    const config = await readConfig(request);
    if (config.error) return config.error;
    const upstream = await fetch(new URL('/api/v1/integration/session/renew', config.base), {
      method: 'POST',
      headers: {
        'x-bearilly-session': token,
        'x-bearilly-origin-school': schoolId,
        'x-bearilly-host': request.nextUrl.hostname,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: '{}',
    });
    const result = await upstream.json().catch(() => null);
    if (!upstream.ok || !result?.data?.token) {
      if (upstream.status === 401 || upstream.status === 403) {
        store.delete(SESSION_COOKIE);
        store.delete(SCHOOL_COOKIE);
        return fail(401, 'UNAUTHORIZED', 'Please sign in again.');
      }
      return fail(502, 'AUTH_SERVER', 'Could not refresh your sign-in. Try again in a moment.');
    }
    const options = cookieOptions(result.data.expires_at);
    store.set(SESSION_COOKIE, result.data.token, options);
    store.set(SCHOOL_COOKIE, schoolId, options);
    return NextResponse.json({ data: { ok: true } });
  } catch (error) {
    console.error('[bearilly-login] could not renew the session:', error);
    return fail(502, 'AUTH_SERVER', 'Could not refresh your sign-in. Try again in a moment.');
  }
}

// DELETE: sign out.
export async function DELETE() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(SCHOOL_COOKIE);
  return NextResponse.json({ data: { ok: true } });
}
