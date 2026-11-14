// "Signing in…" on a school's own sign-in page.
//
// A school keeps its own login page as designed (Buildgram's full codebase swap), and LoginAdapter signs the person in behind it. Left alone,
// that happens silently - the page looks frozen for a second or two - so a student cannot tell it is working and presses the button again.
// These two helpers make the school's own button show it:
//
//   findSubmitButton(root, event) - which button did the person use? (the one that sent the form, the one clicked, or the form's submit button)
//   showSigningIn(button)         - turn that button into a "Signing in…" button with a small spinner, and return a function that puts it back
//
// Only the button's look changes: its inner markup is never touched (the school's page code may re-draw it), and what was inside is hidden and replaced by
// the style rules for [data-signing-in] in styles/app.css. A plain <input type="submit"> cannot hold a spinner, so its label is
// swapped for "Signing in…" instead.

export const SIGNING_IN_TEXT = 'Signing in…';

const BUTTON_SELECTOR = 'button, input[type="submit"], input[type="button"], [role="button"]';
const LOGIN_WORDS = /\b(log\s?in|sign\s?in|continue|submit|enter)\b/i;

const isButtonLike = (el) => Boolean(el) && typeof el.matches === 'function' && el.matches(BUTTON_SELECTOR);
const labelOf = (el) => String((el && (el.textContent || el.value)) || '');

export function findSubmitButton(root, event) {
  if (!root) return null;
  const inside = (el) => Boolean(el) && (el === root ? false : typeof root.contains === 'function' ? root.contains(el) : true);

  // 1. the button that sent the form (a modern browser says which)
  if (event && inside(event.submitter) && isButtonLike(event.submitter)) return event.submitter;
  // 2. the button that was clicked
  const target = event && event.target;
  const clicked = target && typeof target.closest === 'function' ? target.closest(BUTTON_SELECTOR) : null;
  if (inside(clicked)) return clicked;
  // 3. the form's own submit button, or the button that says "log in" / "sign in"
  const form = (target && typeof target.closest === 'function' && target.closest('form')) || root.querySelector('form') || root;
  const submit = form.querySelector('button[type="submit"], input[type="submit"]');
  if (submit) return submit;
  const buttons = [...form.querySelectorAll('button, [role="button"]')];
  return buttons.find((button) => LOGIN_WORDS.test(labelOf(button))) || buttons.find((button) => button.getAttribute('type') !== 'button') || null;
}

export function showSigningIn(button, view = typeof window !== 'undefined' ? window : undefined) {
  if (!button || typeof button.setAttribute !== 'function') return () => {};
  const isInput = String(button.tagName || '').toUpperCase() === 'INPUT';
  const style = view && typeof view.getComputedStyle === 'function' ? view.getComputedStyle(button) : null;
  const rect = typeof button.getBoundingClientRect === 'function' ? button.getBoundingClientRect() : null;
  const before = {
    disabled: Boolean(button.disabled),
    value: isInput ? button.value : null,
    ink: button.style.getPropertyValue('--signin-ink'),
    size: button.style.getPropertyValue('--signin-size'),
    minWidth: button.style.minWidth,
    minHeight: button.style.minHeight,
    ariaBusy: button.getAttribute('aria-busy'),
  };

  // keep the button the same size, and draw the spinner and words in the colour the button's own words had
  if (style && style.color) button.style.setProperty('--signin-ink', style.color);
  if (style && style.fontSize && parseFloat(style.fontSize) > 0) button.style.setProperty('--signin-size', style.fontSize);
  if (rect && rect.width) button.style.minWidth = `${Math.ceil(rect.width)}px`;
  if (rect && rect.height) button.style.minHeight = `${Math.ceil(rect.height)}px`;
  button.setAttribute('aria-busy', 'true');
  if (isInput) button.value = SIGNING_IN_TEXT;
  else button.setAttribute('data-signing-in', '');
  if ('disabled' in button) button.disabled = true;

  return function restore() {
    button.removeAttribute('data-signing-in');
    if (before.ariaBusy === null) button.removeAttribute('aria-busy');
    else button.setAttribute('aria-busy', before.ariaBusy);
    if (isInput) button.value = before.value;
    if (before.ink) button.style.setProperty('--signin-ink', before.ink);
    else button.style.removeProperty('--signin-ink');
    if (before.size) button.style.setProperty('--signin-size', before.size);
    else button.style.removeProperty('--signin-size');
    button.style.minWidth = before.minWidth;
    button.style.minHeight = before.minHeight;
    if ('disabled' in button) button.disabled = before.disabled;
  };
}
