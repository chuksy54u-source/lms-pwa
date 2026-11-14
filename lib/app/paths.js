// Where Bearilly for Schools lives on the address a visitor types (decision BD174).
//
// Bearilly is ONE codebase on ONE domain: the main page is "/", Bearilly for Schools is "/schools/...", Bearilly for Creators is
// "/creators/...", and Bearilly for Industries will be "/industries". A Schools page that used to be "/login" is now "/schools/login".
//
// The prefix is a build-time setting (NEXT_PUBLIC_SCHOOLS_BASE, switched on in next.config.mjs). It is EMPTY everywhere the Schools
// pages are copied onto a school's own website (the full codebase swap, lib/engine/swap.js): there the pages sit at the root, so
// nothing is prefixed and every link behaves exactly as it always did.
//
// Next.js has no per-section base path, so it does not add the prefix by itself. Every link, redirect and address a Schools page
// builds goes through the small functions below (and through lib/app/nav.js for <Link> and the router), so one file knows the prefix.

const SHAPE = /^\/[a-z0-9][a-z0-9-]{0,30}$/;

export function cleanBase(raw) {
  const v = String(raw ?? '').trim().replace(/\/+$/, '');
  const withSlash = v && !v.startsWith('/') ? `/${v}` : v;
  return SHAPE.test(withSlash) ? withSlash : '';
}

// Read the setting in the one form a browser bundle can inline.
export const SCHOOLS_BASE = cleanBase(process.env.NEXT_PUBLIC_SCHOOLS_BASE);

// Addresses that are NOT Schools pages and so are never prefixed: the API, Next's own files, the other products, shared public folders.
const NOT_SCHOOLS = new Set(['api', '_next', 'creators', 'industries', 'mocks', 'fonts', 'creators-bears', 'integration-import']);

const isOwnPath = (p) => typeof p === 'string' && p.startsWith('/') && !p.startsWith('//') && !p.startsWith('/\\');

// A Schools page path -> the path a visitor must use. Safe to call twice. "/" stays "/" (the Bearilly start: the main page on Bearilly's own
// address, the school's welcome on a school's address). Files (anything whose last part has a dot), the API and other products' paths, full
// web addresses, "#top" and "mailto:" are handed back unchanged.
export function schoolsHref(path, base = SCHOOLS_BASE) {
  if (!base || !isOwnPath(path)) return path;
  if (path === '/' || path.startsWith('/?') || path.startsWith('/#')) return path;
  const only = path.split(/[?#]/)[0];
  const parts = only.split('/').filter(Boolean);
  if (!parts.length || NOT_SCHOOLS.has(parts[0]) || parts[parts.length - 1].includes('.')) return path;
  if (path === base || path.startsWith(`${base}/`) || path.startsWith(`${base}?`) || path.startsWith(`${base}#`)) return path;
  return `${base}${path}`;
}

// The reverse: "/schools/home" -> "/home" (to match a request path against the Schools page names).
export function withoutSchools(path, base = SCHOOLS_BASE) {
  if (!base || typeof path !== 'string') return path;
  if (path === base) return '/';
  return path.startsWith(`${base}/`) ? path.slice(base.length) : path;
}

// Works on the two shapes Next.js accepts: a string, or { pathname, query, hash }.
export function schoolsTarget(target, base = SCHOOLS_BASE) {
  if (typeof target === 'string') return schoolsHref(target, base);
  if (target && typeof target === 'object' && typeof target.pathname === 'string') return { ...target, pathname: schoolsHref(target.pathname, base) };
  return target;
}

// A full address on this site for a Schools page (for emails, payment return pages, share links). `origin` has no trailing slash.
export const schoolsUrl = (origin, path, base = SCHOOLS_BASE) => `${String(origin || '').replace(/\/+$/, '')}${schoolsHref(path, base)}`;
