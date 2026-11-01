'use client';

// The student's (or staff member's) own bear settings, kept on this device only:
//   sound    - the bear speaks out loud (off = it still shows its words)
//   captions - 'auto' (words fade a few seconds after it stops) or 'stay' (words stay until closed)
//   motion   - 'full' or 'reduced' (no bouncing, waving or confetti); defaults to the device's own setting
const KEY = 'bearilly:bear-prefs';
const EVENT = 'bearilly:bear-prefs';
export const DEFAULT_BEAR_PREFS = { sound: true, captions: 'auto', motion: 'system' };

export function readBearPrefs() {
  try {
    return { ...DEFAULT_BEAR_PREFS, ...JSON.parse(window.localStorage.getItem(KEY) || '{}') };
  } catch (err) {
    return { ...DEFAULT_BEAR_PREFS };
  }
}

export function writeBearPrefs(patch) {
  const next = { ...readBearPrefs(), ...patch };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch (err) {
    /* private mode: the setting lasts for this visit */
  }
  applyBearPrefs(next);
  window.dispatchEvent(new CustomEvent(EVENT, { detail: next }));
  return next;
}

export function reducedMotion(prefs) {
  if (prefs.motion === 'reduced') return true;
  if (prefs.motion === 'full') return false;
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (err) {
    return false;
  }
}

// Puts data-bear-motion on <html> so the CSS can switch the bear's animations off.
export function applyBearPrefs(prefs = readBearPrefs()) {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.bearMotion = reducedMotion(prefs) ? 'reduced' : 'full';
}

export function onBearPrefs(fn) {
  const handler = (e) => fn(e.detail || readBearPrefs());
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
