import { NextResponse } from 'next/server';

const PROTECTED = ['/dashboard'];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const needsAuth = PROTECTED.some((route) => pathname === route || pathname.startsWith(route + '/'));
  if (needsAuth && !request.cookies.get('bearilly_session')?.value) {
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(pathname)}`, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
