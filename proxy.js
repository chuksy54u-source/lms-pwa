import { NextResponse } from 'next/server';

// Installed by Bearilly Buildgram (full codebase swap): signed-out visitors who open a Bearilly page go to the login page.
const PROTECTED = ["/home","/learn","/lesson","/tasks","/quiz","/bear","/me","/play","/notifications"];

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const needsSignIn = PROTECTED.some((route) => pathname === route || pathname.startsWith(route + '/'));
  if (needsSignIn && !request.cookies.get('bearilly_session')?.value) {
    return NextResponse.redirect(new URL('/login?next=' + encodeURIComponent(pathname), request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/|_next/|favicon\\.ico|.*\\..*).*)'],
};
