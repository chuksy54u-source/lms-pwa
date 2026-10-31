import { NextResponse } from 'next/server';

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  const sessionToken = request.cookies.get('bearilly_session')?.value;

  let user = null;
  if (sessionToken) {
    try {
      const response = await fetch(`${process.env.BEARILLY_API_URL}/api/v1/auth/me`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'X-Bearilly-API-Key': process.env.BEARILLY_API_KEY
        }
      });
      if (response.ok) {
        user = await response.json();
      }
    } catch (e) {
      // Session invalid or API unreachable
    }
  }

  // 1. Unauthenticated users trying to access /dashboard -> redirect to /login
  if (!user && path.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Authenticated users trying to access /dashboard -> check status
  // TODO: Map scholarship/status verification to Bearilly student profile endpoint
  if (user && path.startsWith('/dashboard')) {
    if (user.status !== 'verified') {
      return NextResponse.redirect(new URL('/scholarship-pending', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files, images, etc.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};