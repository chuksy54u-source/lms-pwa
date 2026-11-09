// Safe localStorage: private windows and blocked storage never crash a page.
export function readStore(key, fallback = null) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}
export function writeStore(key, value) {
  try {
    if (value === undefined || value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    /* storage blocked: the value just is not remembered */
  }
}
