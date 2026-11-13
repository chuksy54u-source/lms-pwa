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

// Everything the browser asks of Bearilly goes through here, on this website's own address (same origin):
//   * the public school lookup and student registration (checked against this website's verified domain),
//   * the public certificate check,
//   * every other call, which must carry the signed-in person's session cookie.
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
    return fail(500, 'NOT_CONFIGURED', 'This website is not connected to Bearilly yet. Tell your school admin.');
  }
  let base;
  try {
    base = bearillyBase(request);
  } catch (error) {
    console.error('[bearilly-proxy]', error.message);
    return fail(500, 'NOT_CONFIGURED', 'This website is not connected to Bearilly correctly yet. Tell your school admin.');
  }
  const host = request.nextUrl.hostname;
  const publicTenant = request.method === 'GET' && pathname === '/api/v1/tenant';
  const publicCertificate = request.method === 'GET' && /^\/api\/v1\/certificates\/verify\/[^/]+$/.test(pathname);
  const publicRegistration = request.method === 'POST' && pathname === '/api/v1/auth/register';

  const url = new URL(pathname, base);
  for (const [key, value] of request.nextUrl.searchParams) url.searchParams.set(key, value);
  const headers = new Headers({ Accept: 'application/json' });

  if (publicTenant || publicCertificate) {
    if (publicTenant) url.searchParams.set('host', host);
    headers.set('x-bearilly-host', host);
  } else if (publicRegistration) {
    const tenantUrl = new URL('/api/v1/tenant', base);
    tenantUrl.searchParams.set('host', host);
    const tenant = await fetch(tenantUrl, { headers: { Accept: 'application/json', 'x-bearilly-host': host }, cache: 'no-store' });
    const payload = await tenant.json().catch(() => null);
    const schoolId = payload?.data?.school?.id;
    if (!tenant.ok || !schoolId) return fail(403, 'ORIGIN_NOT_VERIFIED', 'This website is not verified for student registration. Tell your school admin to verify the website address in Bearilly.');
    headers.set('x-bearilly-origin-school', schoolId);
    headers.set('x-bearilly-host', host);
  } else {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;
    const schoolId = store.get(SCHOOL_COOKIE)?.value;
    if (!token || !schoolId) return fail(401, 'UNAUTHORIZED', 'Sign in with your school account first.');
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
    return fail(502, 'NETWORK', 'Could not reach Bearilly. Please try again.');
  }
  const responseHeaders = new Headers({ 'content-type': upstream.headers.get('content-type') || 'application/json', 'cache-control': 'no-store' });
  const disposition = upstream.headers.get('content-disposition');
  if (disposition) responseHeaders.set('content-disposition', disposition);
  return new NextResponse(await upstream.arrayBuffer(), { status: upstream.status, headers: responseHeaders });
}

export const GET = (request, context) => proxyRequest(request, context.params);
export const POST = (request, context) => proxyRequest(request, context.params);
export const PUT = (request, context) => proxyRequest(request, context.params);
export const PATCH = (request, context) => proxyRequest(request, context.params);
export const DELETE = (request, context) => proxyRequest(request, context.params);
