import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh auth session
  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // 1. Unauthenticated users trying to access /dashboard -> redirect to /login
  if (!user && path.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Authenticated users trying to access /dashboard -> check scholar status
  if (user && path.startsWith('/dashboard')) {
    const { data: scholarRecord } = await supabase
      .from('scholarship_students')
      .select('status')
      .or(`user_id.eq.${user.id},email.eq.${user.email}`)
      .maybeSingle();

    // Block only if they are a scholar AND their status isn't verified
    if (scholarRecord && scholarRecord.status !== 'verified') {
      return NextResponse.redirect(new URL('/scholarship-pending', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files, images, etc.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};