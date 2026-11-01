// FRONTEND helper: one place to call the Bearilly API from pages and components.
// While the backend is still being built, set NEXT_PUBLIC_USE_MOCKS=true in .env.local
// and every call below returns the sample files in /public/mocks instead of the real API.
// When an endpoint is real, nothing else changes: just set the flag back to false.
//
// Mock sign-in: in mock mode the signed-in role is kept in localStorage ('bearilly:mock-role'),
// so /auth/me answers as a student, teacher, school admin or platform admin. The sign-in page sets it
// from the email you type: admin@... = school admin, teacher@... = teacher, platform@... = platform admin,
// anything else = student.

export const usingMocks = () => process.env.NEXT_PUBLIC_USE_MOCKS === 'true' && process.env.NODE_ENV !== 'production';
export const MOCK_ROLE_KEY = 'bearilly:mock-role';

function mockRole() {
  try {
    return window.localStorage.getItem(MOCK_ROLE_KEY);
  } catch (e) {
    return null;
  }
}

// Mock mode has two sample schools so you can demo them side by side. The school comes from the address
// (manarah.localhost:3000 -> Manarah, anything else -> Ornate), like real school subdomains.
export const MOCK_SCHOOLS = {
  ornate: { id: 'sch_ornate', slug: 'ornate', name: 'Ornate Tech School' },
  manarah: { id: 'sch_manarah', slug: 'manarah', name: 'Manarah' },
};
export function mockSchool() {
  try {
    const sub = window.location.hostname.split('.')[0];
    if (MOCK_SCHOOLS[sub]) return sub;
  } catch (e) {
    /* server side */
  }
  return 'ornate';
}
const perSchool = (file) => () => (mockSchool() === 'ornate' ? file : file.replace('.json', `-${mockSchool()}.json`));

function meMock() {
  const role = mockRole();
  if (role === 'teacher') return '/mocks/me-teacher.json';
  if (role === 'school_admin') return '/mocks/me-admin.json';
  if (role === 'platform_admin') return '/mocks/me-platform.json';
  if (role === 'student') return '/mocks/me.json';
  return null; // signed out: answer 401 like the real API
}

const MOCK_ROUTES = [
  ['GET', /^\/api\/v1\/auth\/me$/, meMock],
  ['POST', /^\/api\/v1\/auth\/register$/, '/mocks/register.json'],
  ['GET', /^\/api\/v1\/tenant(\?.*)?$/, perSchool('/mocks/tenant.json')],
  ['GET', /^\/api\/v1\/courses(\?.*)?$/, '/mocks/courses.json'],
  ['POST', /^\/api\/v1\/courses$/, '/mocks/course.json'],
  ['GET', /^\/api\/v1\/courses\/[^/]+$/, '/mocks/course.json'],
  ['PATCH', /^\/api\/v1\/courses\/[^/]+$/, '/mocks/course.json'],
  ['GET', /^\/api\/v1\/courses\/[^/]+\/units$/, '/mocks/units.json'],
  ['POST', /^\/api\/v1\/courses\/[^/]+\/units$/, '/mocks/unit.json'],
  ['POST', /^\/api\/v1\/units\/[^/]+\/lessons$/, '/mocks/lesson.json'],
  ['PATCH', /^\/api\/v1\/lessons\/[^/]+$/, '/mocks/lesson.json'],
  ['GET', /^\/api\/v1\/courses\/[^/]+\/results$/, '/mocks/course-results.json'],
  ['POST', /^\/api\/v1\/courses\/[^/]+\/(enable|disable)$/, '/mocks/ok.json'],
  ['GET', /^\/api\/v1\/catalogue\/courses(\?.*)?$/, '/mocks/catalogue.json'],
  ['GET', /^\/api\/v1\/enrolments(\?.*)?$/, '/mocks/enrolments.json'],
  ['POST', /^\/api\/v1\/enrolments$/, '/mocks/enrolment.json'],
  ['GET', /^\/api\/v1\/schools(\?.*)?$/, '/mocks/schools.json'],
  ['POST', /^\/api\/v1\/schools$/, '/mocks/school-created.json'],
  ['GET', /^\/api\/v1\/schools\/[^/]+$/, '/mocks/school.json'],
  ['PATCH', /^\/api\/v1\/schools\/[^/]+$/, '/mocks/school.json'],
  ['GET', /^\/api\/v1\/schools\/[^/]+\/dashboard$/, '/mocks/school-dashboard.json'],
  ['GET', /^\/api\/v1\/teachers\/[^/]+\/dashboard$/, '/mocks/teacher-dashboard.json'],
  ['GET', /^\/api\/v1\/students\/[^/]+\/dashboard$/, '/mocks/student-dashboard.json'],
  ['GET', /^\/api\/v1\/students\/[^/]+\/certificates$/, '/mocks/certificates.json'],
  ['GET', /^\/api\/v1\/certificates\/verify\/[^/]+$/, '/mocks/certificate.json'],
  ['GET', /^\/api\/v1\/schools\/[^/]+\/branding$/, perSchool('/mocks/branding.json')],
  ['PATCH', /^\/api\/v1\/schools\/[^/]+\/branding$/, '/mocks/branding.json'],
  ['POST', /^\/api\/v1\/schools\/[^/]+\/branding\/logo$/, '/mocks/branding.json'],
  ['DELETE', /^\/api\/v1\/schools\/[^/]+\/branding\/logo$/, '/mocks/branding.json'],
  ['GET', /^\/api\/v1\/lessons\/[^/]+$/, '/mocks/lesson.json'],
  ['GET', /^\/api\/v1\/students\/[^/]+\/tutor-state$/, '/mocks/tutor-state.json'],
  ['GET', /^\/api\/v1\/billing\/slots$/, '/mocks/billing-slots.json'],
  ['POST', /^\/api\/v1\/tutor\/ask$/, '/mocks/tutor-ask.json'],
  ['GET', /^\/api\/v1\/tutor\/messages(\?.*)?$/, '/mocks/tutor-messages.json'],
  ['GET', /^\/api\/v1\/courses\/[^/]+\/assessments$/, '/mocks/assessments.json'],
  ['POST', /^\/api\/v1\/courses\/[^/]+\/assessments$/, '/mocks/assessment.json'],
  ['GET', /^\/api\/v1\/assessments\/[^/]+$/, () => (['teacher', 'school_admin'].includes(mockRole()) ? '/mocks/assessment-staff.json' : '/mocks/assessment.json')],
  ['PATCH', /^\/api\/v1\/assessments\/[^/]+$/, '/mocks/assessment.json'],
  ['GET', /^\/api\/v1\/assessments\/[^/]+\/submissions(\?.*)?$/, '/mocks/submissions.json'],
  ['POST', /^\/api\/v1\/assessments\/[^/]+\/submissions$/, '/mocks/submission-result.json'],
  ['POST', /^\/api\/v1\/submissions\/[^/]+\/grade$/, '/mocks/grade-result.json'],
  ['POST', /^\/api\/v1\/progress\/events$/, '/mocks/progress-event.json'],
  ['GET', /^\/api\/v1\/students\/[^/]+\/progress$/, '/mocks/progress.json'],
  ['GET', /^\/api\/v1\/students\/[^/]+\/results$/, '/mocks/results.json'],
  ['GET', /^\/api\/v1\/students(\?.*)?$/, '/mocks/students.json'],
  ['POST', /^\/api\/v1\/students$/, '/mocks/person-created.json'],
  ['POST', /^\/api\/v1\/students\/import$/, '/mocks/import-result.json'],
  ['GET', /^\/api\/v1\/students\/[^/]+$/, '/mocks/student.json'],
  ['PATCH', /^\/api\/v1\/students\/[^/]+$/, '/mocks/student.json'],
  ['DELETE', /^\/api\/v1\/students\/[^/]+$/, '/mocks/ok.json'],
  ['GET', /^\/api\/v1\/teachers(\?.*)?$/, '/mocks/teachers.json'],
  ['POST', /^\/api\/v1\/teachers$/, '/mocks/person-created.json'],
  ['PATCH', /^\/api\/v1\/teachers\/[^/]+$/, '/mocks/ok.json'],
  ['DELETE', /^\/api\/v1\/teachers\/[^/]+$/, '/mocks/ok.json'],
  // Phase 7: the website builder
  ['GET', /^\/api\/v1\/sites$/, '/mocks/sites.json'],
  ['POST', /^\/api\/v1\/sites$/, '/mocks/site.json'],
  ['GET', /^\/api\/v1\/sites\/[^/]+$/, '/mocks/site.json'],
  ['PATCH', /^\/api\/v1\/sites\/[^/]+$/, '/mocks/site.json'],
  ['POST', /^\/api\/v1\/sites\/[^/]+\/generate-copy$/, '/mocks/site-copy.json'],
  ['GET', /^\/api\/v1\/sites\/[^/]+\/versions$/, '/mocks/site-versions.json'],
  ['POST', /^\/api\/v1\/sites\/[^/]+\/versions\/[^/]+\/restore$/, '/mocks/site.json'],
  ['GET', /^\/api\/v1\/sites\/[^/]+\/assets$/, '/mocks/site-assets.json'],
  ['POST', /^\/api\/v1\/sites\/[^/]+\/assets$/, '/mocks/site-asset.json'],
  ['POST', /^\/api\/v1\/sites\/[^/]+\/checkout$/, '/mocks/site-checkout.json'],
  ['POST', /^\/api\/v1\/sites\/[^/]+\/verify$/, '/mocks/site-verify.json'],
  ['POST', /^\/api\/v1\/sites\/[^/]+\/publish$/, '/mocks/site.json'],
  ['GET', /^\/api\/v1\/sites\/[^/]+\/domains$/, '/mocks/site-domains.json'],
  ['POST', /^\/api\/v1\/sites\/[^/]+\/domains$/, '/mocks/site-domain.json'],
  ['POST', /^\/api\/v1\/sites\/[^/]+\/domains\/[^/]+\/verify$/, '/mocks/site-domain.json'],
  ['GET', /^\/api\/v1\/domains\/suggest(\?.*)?$/, '/mocks/domain-suggestions.json'],
  ['GET', /^\/api\/v1\/preview\/[^/]+$/, '/mocks/site-preview.json'],
];

// Phase 1 plugs the signed-in student's token in here, once, and every call below sends it.
//   setAuthTokenGetter(async () => (await supabase.auth.getSession()).data.session?.access_token)
let tokenGetter = null;
export function setAuthTokenGetter(fn) {
  tokenGetter = typeof fn === 'function' ? fn : null;
}
async function authHeaders() {
  if (!tokenGetter) return {};
  try {
    const token = await tokenGetter();
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch (err) {
    return {};
  }
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function request(method, path, body, options = {}) {
  let url = path;
  let verb = method;
  let payload;
  const { full, ...fetchOptions } = options;
  if (usingMocks()) {
    const hit = MOCK_ROUTES.find(([m, pattern]) => m === method && pattern.test(path));
    if (!hit) throw Object.assign(new Error(`No sample file for ${method} ${path}. Add one to public/mocks and to MOCK_ROUTES in lib/api/client.js.`), { code: 'NO_MOCK', status: 0 });
    url = typeof hit[2] === 'function' ? hit[2]() : hit[2];
    if (!url) throw Object.assign(new Error('Please sign in.'), { code: 'UNAUTHORIZED', status: 401 });
    verb = 'GET'; // sample files can only be read
    if (typeof window !== 'undefined') await delay(250); // feel the loading states while designing
  } else if (body !== undefined) {
    payload = typeof FormData !== 'undefined' && body instanceof FormData ? body : JSON.stringify(body);
  }
  const isForm = typeof FormData !== 'undefined' && payload instanceof FormData;
  const headers = { Accept: 'application/json', ...(payload && !isForm ? { 'Content-Type': 'application/json' } : {}), ...(await authHeaders()), ...(fetchOptions.headers || {}) };
  let res;
  try {
    res = await fetch(url, { ...fetchOptions, method: verb, headers, body: payload });
  } catch (err) {
    throw Object.assign(new Error('Could not reach Bearilly. Check your connection.'), { code: 'NETWORK', status: 0 });
  }
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const e = (json && json.error) || { code: `HTTP_${res.status}`, message: 'The request failed.' };
    throw Object.assign(new Error(e.message), { code: e.code, status: res.status, details: e.details });
  }
  if (usingMocks() && json && json.data && path.startsWith('/api/v1/auth/me') && json.data.school) {
    json.data = { ...json.data, school: MOCK_SCHOOLS[mockSchool()] }; // sign in "at" the school of this address
  }
  if (full) return json || {};
  return json ? json.data : undefined;
}

export const apiGet = (path, options) => request('GET', path, undefined, options);
export const apiPost = (path, body, options) => request('POST', path, body === undefined ? {} : body, options);
export const apiPatch = (path, body, options) => request('PATCH', path, body, options);
export const apiPut = (path, body, options) => request('PUT', path, body, options);
export const apiDelete = (path, options) => request('DELETE', path, undefined, options);
export const apiUpload = (path, formData, options) => request('POST', path, formData, options);
// Lists: returns { data, meta } so pages can follow meta.next_cursor.
export const apiList = (path, options) => request('GET', path, undefined, { ...(options || {}), full: true });
