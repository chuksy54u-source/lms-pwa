// Pure helpers for the Bearilly mascot. No React and no DOM access at import time,
// so this file is safe in server components and easy to unit test in plain Node.
import { POINT_BASE_ANGLE } from './bearMeta';

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const randomBetween = (min, max, rand = Math.random) => min + rand() * (max - min);

// ---------------------------------------------------------------- moods
// Better mood = lower rank. 'pleading' is interface-only (the first dismiss tap) and has no rank.
export const MOOD_RANK = { adorable: 0, worried: 1, intense: 2 };

// Speech speed and pitch per mood (Section 4 of the design pack).
export const MOOD_VOICE = {
  adorable: { rate: 1.0, pitch: 1.05 },
  worried: { rate: 0.92, pitch: 0.95 },
  intense: { rate: 1.08, pitch: 0.9 },
  pleading: { rate: 0.9, pitch: 1.1 },
};

// ---------------------------------------------------------------- talking jaw
// closed -> half -> wide or closed -> half ... a random walk, so it never looks like a loop.
export function nextMouth(prev, rand = Math.random) {
  if (prev === 'closed' || prev === 'wide') return 'half';
  return rand() < 0.5 ? 'wide' : 'closed';
}

// ---------------------------------------------------------------- voices
// Browsers expose installed voices with no gender label, so the school's choice is matched by name.
export const DEFAULT_PREFERRED = {
  feminine: ['Microsoft Ezinne', 'Google UK English Female', 'Microsoft Zira', 'Samantha'],
  masculine: ['Microsoft Abeo', 'Google UK English Male', 'Microsoft David', 'Daniel'],
};
const FEMININE_NAME = /\b(female|woman|ezinne|zira|samantha|victoria|karen|moira|tessa|fiona|susan|hazel|libby|sonia|natasha|aria|jenny|michelle|emma|ava|allison|joanna|kendra|kimberly|salli|ivy|amy|serena|jessica|zoe|catherine|linda|heera|veena|sara)\b/i;
const MASCULINE_NAME = /\b(male|man|abeo|david|mark|daniel|alex|fred|oliver|george|guy|ryan|thomas|james|rishi|aaron|gordon|arthur|matthew|joey|justin|brian|eric|liam|russell|nicky|jorge|diego)\b/i;
const normLang = (l) => String(l || '').replace('_', '-').toLowerCase();

// Matching order from the design pack:
//   1. the first preferred name the device has
//   2. any voice in that language whose name suggests the chosen gender (en-NG, then en-GB, then en-US)
//   3. the default voice with the pitch nudged (feminine +0.15, masculine -0.15)
export function pickVoice(voices, prefs = {}) {
  const gender = prefs.gender === 'masculine' ? 'masculine' : 'feminine';
  const list = Array.isArray(voices) ? voices : [];
  const preferred = prefs.preferred && prefs.preferred.length ? prefs.preferred : DEFAULT_PREFERRED[gender];
  for (const name of preferred) {
    const hit = list.find((v) => v.name.toLowerCase().includes(String(name).toLowerCase()));
    if (hit) return { voice: hit, nudge: 0, how: 'preferred' };
  }
  const langs = [...new Set([prefs.lang || 'en-NG', 'en-GB', 'en-US'].map(normLang))];
  const wanted = gender === 'feminine' ? FEMININE_NAME : MASCULINE_NAME;
  const other = gender === 'feminine' ? MASCULINE_NAME : FEMININE_NAME;
  for (const l of langs) {
    const hit = list.find((v) => normLang(v.lang) === l && wanted.test(v.name) && !other.test(v.name));
    if (hit) return { voice: hit, nudge: 0, how: 'gender-name' };
  }
  const inLang = (l) => list.filter((v) => normLang(v.lang) === l);
  let fallback = null;
  for (const l of langs) {
    const group = inLang(l);
    if (group.length) {
      fallback = group.find((v) => v.default) || group[0];
      break;
    }
  }
  if (!fallback) fallback = list.find((v) => normLang(v.lang).startsWith('en')) || null;
  return { voice: fallback, nudge: gender === 'feminine' ? 0.15 : -0.15, how: 'default' };
}

// Final rate and pitch for an utterance: the mood table, the school's own multipliers, and any gender nudge.
export function moodSpeech(emotion, prefs = {}, nudge = 0) {
  const base = MOOD_VOICE[emotion] || MOOD_VOICE.adorable;
  return {
    rate: clamp(base.rate * (prefs.rate ?? 1), 0.5, 2),
    pitch: clamp(base.pitch * (prefs.pitch ?? 1) + nudge, 0, 2),
  };
}

// Split long text into sentence-sized chunks. Chrome silently cuts off long utterances.
export function chunkText(text, max = 180) {
  const sentences = String(text).replace(/\s+/g, ' ').trim().match(/[^.!?]+[.!?]*\s*/g) || [];
  const out = [];
  let cur = '';
  for (const s of sentences) {
    if (cur && (cur + s).length > max) {
      out.push(cur.trim());
      cur = '';
    }
    cur += s;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

// How long a line "takes" when nothing is spoken out loud (muted, locked, or no speech support).
export const estimateMs = (text) => Math.max(900, String(text).trim().split(/\s+/).length * 360);

// ---------------------------------------------------------------- colours
export function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].split('').map((c) => c + c).join('') : m[1];
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export const rgbToHex = (rgb) => '#' + rgb.map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('').toUpperCase();
export function mix(a, b, t) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return A && B ? rgbToHex(A.map((v, i) => v + (B[i] - v) * t)) : a;
}
function rgbToHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h / 6, s, l];
}
function hslToRgb([h, s, l]) {
  if (s === 0) return [l * 255, l * 255, l * 255];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = (t) => {
    t = (t + 1) % 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255];
}

export const DEFAULT_FUR = '#C99B68';
// Keep the fur inside a range where the dark outline stays visible. Invalid input falls back to Honey.
export function normalizeFur(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return DEFAULT_FUR;
  const [h, s, l] = rgbToHsl(rgb);
  return rgbToHex(hslToRgb([h, s, clamp(l, 0.28, 0.72)]));
}
// Ears and muzzle follow the fur colour, so a school only ever changes one value.
export function furTokens(hex) {
  const fur = normalizeFur(hex);
  if (fur === DEFAULT_FUR) return { '--bear-fur': fur, '--bear-ear': '#D7A07A', '--bear-cream': '#EFD9B9' };
  return { '--bear-fur': fur, '--bear-ear': mix(fur, '#E6A58C', 0.5), '--bear-cream': mix(fur, '#FFF0D7', 0.72) };
}
// Accessories use the school's own colours. Anything not set keeps the starter art colours.
export function schoolTokens(colors) {
  const out = {};
  const p = colors && hexToRgb(colors.primary);
  const s = colors && hexToRgb(colors.secondary);
  if (p) {
    out['--school-primary'] = rgbToHex(p);
    out['--school-primary-dark'] = mix(rgbToHex(p), '#000000', 0.28);
  }
  if (s) out['--school-secondary'] = rgbToHex(s);
  return out;
}

// ---------------------------------------------------------------- pointing
// dx, dy: the target relative to the shoulder, in the bear's own (unrotated) space, y pointing down.
// Returns how far to rotate the arm layer, in degrees. The left arm is the mirror image of the right.
export function aimAngle(side, dx, dy) {
  const mx = side === 'l' ? -dx : dx;
  const phi = clamp((Math.atan2(dy, mx) * 180) / Math.PI, -170, 75);
  const delta = phi - POINT_BASE_ANGLE;
  return side === 'l' ? -delta : delta;
}
// Where the eyes glance while pointing. dx, dy: target relative to the head, in screen px; unit: bear width in px.
export function lookFor(dx, dy, unit) {
  const t = unit * 0.12;
  if (Math.abs(dx) < t && dy < -unit * 0.15) return 'up';
  if (dx < -t) return 'left';
  if (dx > t) return 'right';
  return 'none';
}
