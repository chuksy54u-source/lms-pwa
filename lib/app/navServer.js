// redirect() for Bearilly for Schools server code: the same as Next.js's own, with the /schools prefix added (see lib/app/paths.js).
import { redirect as nextRedirect, permanentRedirect as nextPermanentRedirect } from 'next/navigation';
import { schoolsHref } from './paths.js';

export const redirect = (path, type) => nextRedirect(schoolsHref(path), type);
export const permanentRedirect = (path, type) => nextPermanentRedirect(schoolsHref(path), type);
