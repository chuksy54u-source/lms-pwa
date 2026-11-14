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

// Everything the browser asks of Bearilly goes through here, on this website's own address (same origin):
//   * the public school lookup, student registration and the two password-reset steps (each checked against this website's verified domain),
//   * the public certificate check,
//   * every other call, which must carry the signed-in person's session cookie (and keeps it fresh: see RENEW_WITHIN_MS above).
// Bearilly's billing and Connect routes are never forwarded.
function isAllowed(pathname) {
  return pathname.startsWith('/api/v1/') &&
    !pathname.startsWith('/api/v1/billing/') && pathname !== '/api/v1/billing' &&
    !pathname.startsWith('/api/v1/integration/') && !pathname.startsWith('/api/v1/connect/');
}

async function proxyRequest(request, params) {
  const segments = (await params).path || [];
  if (!Array.isArray(segments) || segments.some((segment) => typeof segment !== 'string' || !segment || segment === '.' || segment === '..' || segment.includes('/') || segment.includes('\\'))) {
    return fail(404, 'NOT_FOUND', 'Not found');
  }
  const pathname = '/api/v1/' + segments.join('/');
  if (!isAllowed(pathname)) return fail(404, 'NOT_FOUND', 'Not found');
  if (!BEARILLY_URL) {
    console.error('[bearilly-proxy] BEARILLY_URL is not set.');
    return fail(500, 'NOT_CONFIGURED', 'This website is not connected to its learning service yet. Tell your school admin.');
  }
  let base;
  try {
    base = bearillyBase(request);
  } catch (error) {
    console.error('[bearilly-proxy]', error.message);
    return fail(500, 'NOT_CONFIGURED', 'This website is not connected to its learning service correctly yet. Tell your school admin.');
  }
  const host = request.nextUrl.hostname;
  const publicTenant = request.method === 'GET' && pathname === '/api/v1/tenant';
  const publicCertificate = request.method === 'GET' && /^\/api\/v1\/certificates\/verify\/[^/]+$/.test(pathname);
  // Register and the two password-reset steps are public (no session yet); the school is the one that owns this website's verified address.
  const publicRegistration = request.method === 'POST' && ['/api/v1/auth/register', '/api/v1/auth/forgot-password', '/api/v1/auth/reset-password'].includes(pathname);

  const url = new URL(pathname, base);
  for (const [key, value] of request.nextUrl.searchParams) url.searchParams.set(key, value);
  const headers = new Headers({ Accept: 'application/json' });
  let token;
  let schoolId;
  let fresh = null; // the new session, when this request swapped the old one for it

  if (publicTenant || publicCertificate) {
    if (publicTenant) url.searchParams.set('host', host);
    headers.set('x-bearilly-host', host);
  } else if (publicRegistration) {
    const tenantUrl = new URL('/api/v1/tenant', base);
    tenantUrl.searchParams.set('host', host);
    const tenant = await fetch(tenantUrl, { headers: { Accept: 'application/json', 'x-bearilly-host': host }, cache: 'no-store' });
    const payload = await tenant.json().catch(() => null);
    const schoolId = payload?.data?.school?.id;
    if (!tenant.ok || !schoolId) return fail(403, 'ORIGIN_NOT_VERIFIED', 'This website is not verified for student sign-up. Tell your school admin to verify the website address.');
    headers.set('x-bearilly-origin-school', schoolId);
    headers.set('x-bearilly-host', host);
  } else {
    const store = await cookies();
    token = store.get(SESSION_COOKIE)?.value;
    schoolId = store.get(SCHOOL_COOKIE)?.value;
    if (!token || !schoolId) return fail(401, 'UNAUTHORIZED', 'Sign in with your school account first.');
    // Whenever the person uses the website, a token with less than 5 minutes left (or one that already ran out, or an older cookie that does not
    // say) is swapped for a fresh one first. Nobody is signed out for using the website, and a sleeping page does not matter.
    const endsAt = Number(store.get(EXPIRES_COOKIE)?.value);
    if (!Number.isFinite(endsAt) || endsAt - Date.now() < RENEW_WITHIN_MS) {
      try {
        const renewed = await renewSession(base, token, schoolId, host);
        if (renewed.data) {
          fresh = renewed.data;
          token = renewed.data.token;
        } else if (renewed.status === 401) {
          const out = fail(401, 'UNAUTHORIZED', 'Please sign in again.');
          clearSession(out.cookies);
          return out;
        }
        // any other answer: carry on with the token we have; it may still be good
      } catch (error) {
        console.error('[bearilly-proxy] could not renew the session:', error);
      }
    }
    headers.set('x-bearilly-session', token);
    headers.set('x-bearilly-origin-school', schoolId);
    headers.set('x-bearilly-host', host);
  }

  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);
  const init = { method: request.method, headers, cache: 'no-store' };
  if (request.method !== 'GET' && request.method !== 'HEAD') init.body = await request.arrayBuffer();
  let upstream;
  try {
    upstream = await fetch(url, init);
  } catch (error) {
    console.error('[bearilly-proxy] could not reach Bearilly:', error);
    return fail(502, 'NETWORK', 'Could not reach the server. Please try again.');
  }
  const responseHeaders = new Headers({ 'content-type': upstream.headers.get('content-type') || 'application/json', 'cache-control': 'no-store' });
  const disposition = upstream.headers.get('content-disposition');
  if (disposition) responseHeaders.set('content-disposition', disposition);
  const response = new NextResponse(await upstream.arrayBuffer(), { status: upstream.status, headers: responseHeaders });
  if (fresh) setSession(response.cookies, fresh, schoolId);
  return response;
}

export const GET = (request, context) => proxyRequest(request, context.params);
export const POST = (request, context) => proxyRequest(request, context.params);
export const PUT = (request, context) => proxyRequest(request, context.params);
export const PATCH = (request, context) => proxyRequest(request, context.params);
export const DELETE = (request, context) => proxyRequest(request, context.params);
