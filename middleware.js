import { NextResponse } from 'next/server';

export async function middleware(request) {
  const path = request.nextUrl.pathname;

  // Define protected routes including the requested playground
  const isProtectedRoute = path.startsWith('/dashboard') || path.startsWith('/playground');

  if (isProtectedRoute) {
    try {
      // Bearilly session check via the verified /api/v1/auth/me endpoint
      // We pass the request cookies to maintain the student's short-lived session
      const response = await fetch(`${process.env.BEARILLY_API_URL || 'https://api.bearilly.com'}/api/v1/auth/me`, {
        headers: {
          'Cookie': request.headers.get('cookie') || '',
          'Authorization': `Bearer ${process.env.BEARILLY_API_KEY}`
        },
      });

      if (!response.ok) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      const user = await response.json();

      // 2. Authenticated users trying to access protected routes -> check scholar status
      // Bearilly is now the system of record. 
      // TODO: Verify if 'scholarship_status' is the correct field name in Bearilly person metadata.
      // Retaining safe boundary for the existing scholarship verification logic.
      if (user && user.scholarship_status && user.scholarship_status !== 'verified') {
        return NextResponse.redirect(new URL('/scholarship-pending', request.url));
      }
    } catch (error) {
      // If the Bearilly API is unreachable or returns an error, redirect to login for safety
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files, images, etc.
     * Preserved from original configuration.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};