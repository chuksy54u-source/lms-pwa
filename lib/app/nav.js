'use client';

// <Link> and the router for Bearilly for Schools pages: the same as Next.js's own, but every Schools path gets the /schools prefix
// (decision BD174; the rules are in lib/app/paths.js). On a school's own website, where the prefix is empty, these behave exactly like
// the plain Next.js ones. Pages import Link, useRouter and usePathname from here, never from next/link or next/navigation.
import { forwardRef, useMemo } from 'react';
import NextLink from 'next/link';
import { useRouter as useNextRouter, usePathname as useNextPathname } from 'next/navigation';
import { schoolsTarget, withoutSchools } from './paths.js';

export const Link = forwardRef(function SchoolsLink({ href, ...rest }, ref) {
  return <NextLink ref={ref} href={schoolsTarget(href)} {...rest} />;
});

export function useRouter() {
  const router = useNextRouter();
  return useMemo(() => ({
    ...router,
    push: (href, options) => router.push(schoolsTarget(href), options),
    replace: (href, options) => router.replace(schoolsTarget(href), options),
    prefetch: (href, options) => router.prefetch(schoolsTarget(href), options),
  }), [router]);
}

// The path WITHOUT the prefix, so a page can still compare it with "/admin", "/home" and so on.
export function usePathname() {
  return withoutSchools(useNextPathname());
}
