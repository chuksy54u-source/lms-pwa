// Small formatting helpers shared by every screen.

export function firstName(name) {
  return String(name || '').trim().split(/\s+/)[0] || 'there';
}

export function initials(name) {
  const parts = String(name || '?').trim().split(/\s+/).filter(Boolean);
  return ((parts[0] || '?')[0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function pct(value, digits = 0) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return `${Number(value).toFixed(digits).replace(/\.0+$/, '')}%`;
}

const DAY = 86400000;
export function relTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`;
  if (diff < DAY) return `${Math.round(diff / 3600000)}h ago`;
  if (diff < 2 * DAY) return 'yesterday';
  if (diff < 7 * DAY) return d.toLocaleDateString(undefined, { weekday: 'short' });
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function dateLong(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
}

export function dateTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}

export function clock(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// The same grade table the backend uses for certificates (lib/engine/certificates.js, decision log item 5).
export function gradeFor(score, scale = 'standard') {
  if (score === null || score === undefined) return '—';
  if (scale === 'waec') {
    if (score >= 75) return 'A1';
    if (score >= 70) return 'B2';
    if (score >= 65) return 'B3';
    if (score >= 60) return 'C4';
    if (score >= 55) return 'C5';
    if (score >= 50) return 'C6';
    if (score >= 45) return 'D7';
    if (score >= 40) return 'E8';
    return 'F9';
  }
  if (score >= 70) return 'A';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C';
  if (score >= 45) return 'D';
  if (score >= 40) return 'E';
  return 'F';
}

// A friendly emoji per subject, so course cards are easy to tell apart at a glance.
const SUBJECTS = [
  [/math|algebra|fraction|number|geometry|calcul/i, '➗'],
  [/english|reading|literature|grammar|writing|poetry/i, '📖'],
  [/science|biology|photosynth|chemistry|physics/i, '🧬'],
  [/video|content|editing|film|story/i, '🎬'],
  [/social|media|marketing/i, '📣'],
  [/design|graphic|art/i, '🎨'],
  [/business|money|finance|account/i, '💼'],
  [/code|program|web|computer|digital/i, '💻'],
  [/history|government|civic/i, '🏛️'],
];
export function subjectEmoji(title) {
  const hit = SUBJECTS.find(([re]) => re.test(title || ''));
  return hit ? hit[1] : '📚';
}

export function friendlyError(err) {
  if (!err) return '';
  const code = err.code;
  if (code === 'NETWORK') return 'You seem to be offline. Check your connection and try again.';
  if (code === 'UNAUTHORIZED') return 'Your session ended. Please sign in again.';
  if (code === 'NOT_ENROLLED') return 'Enrol in this course first.';
  if (code === 'SCHOOL_SUSPENDED') return 'Your school account is paused. Please contact your school.';
  if (code === 'SUBSCRIPTION_EXPIRED') return 'Your school subscription has ended. Please tell your school admin.';
  if (code === 'SUBSCRIPTION_REQUIRED') return 'Your school needs an active subscription for this. A school admin can subscribe in Billing.';
  if (code === 'SUBSCRIPTION_READ_ONLY') return 'Your school’s term has ended, so this is read-only until it is renewed.';
  if (code === 'FEATURE_NOT_INCLUDED') return 'Your school’s plan does not include this feature.';
  if (code === 'SETUP_FEE_REQUIRED') return 'Pay the one-time website setup fee before publishing.';
  if (code === 'ORIGIN_NOT_VERIFIED') return 'Verify this website domain before connecting it.';
  if (code === 'NO_FREE_SLOTS' || code === 'SLOTS_FULL') return 'All student slots are in use. Add more in Billing.';
  if (code === 'PAYMENT_NOT_CONFIGURED') return 'Online payments are not switched on yet (Bearilly’s Paystack key is missing). Please contact Bearilly support.';
  if (code === 'PAYSTACK_NOT_CONFIGURED') return 'The school has not connected its Paystack account yet. A school admin can do this in School fees.';
  if (code === 'DOMAINS_NOT_CONFIGURED') return 'Connecting your own domain is not switched on yet. Please contact Bearilly support.';
  if (code === 'AI_NOT_CONFIGURED' || code === 'AI_UNAVAILABLE') return 'The AI is not available right now. Please try again later.';
  if (code === 'AI_BUSY') return 'The AI is busy. Wait a moment and try again.';
  if (code === 'RATE_LIMITED') return 'That was a lot of requests. Wait a minute and try again.';
  if (code === 'NOT_FOUND') return 'We could not find that.';
  if (code === 'FORBIDDEN') return 'You do not have access to this.';
  if (code === 'SERVER_ERROR') return 'Something went wrong on our side. Please try again.';
  return err.message || 'Something went wrong.';
}

// Kobo (the API's money unit) to naira for display.
export const naira = (kobo, currency = 'NGN') =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Math.round(Number(kobo || 0) / 100));

export const GAME_ART = { chess: '♟️', scrabble: '🔤', checkers: '⚫', property: '🏠', ludo: '🎲', ayo: '🥥' };

// Amounts in a currency's smallest unit (kobo, pesewas...) to text. XOF has no minor unit.
export const MINOR_EXPONENT = { NGN: 2, GHS: 2, ZAR: 2, KES: 2, USD: 2, XOF: 0 };
export const money = (minor, currency = 'NGN') =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency, maximumFractionDigits: MINOR_EXPONENT[currency] ?? 2 }).format(Number(minor || 0) / 10 ** (MINOR_EXPONENT[currency] ?? 2));
