'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession, homeFor } from './SessionProvider';
import { friendlyError } from '../../lib/app/format';
import { schoolsHref } from '../../lib/app/paths.js';
import { CONNECTED, BEARILLY_HOME } from '../../lib/app/connected.js';
import { findSubmitButton, showSigningIn } from '../../lib/app/signingIn.js';
import LoadingScreen from './LoadingScreen';

// Keeps the DESIGN of a school's own login page and makes it sign in to Bearilly.
//
// Bearilly Buildgram's full codebase swap keeps the school's login page as it is. This wrapper listens for the page's
// form being submitted, takes the email and password the person typed, signs them in through this website's own server
// (/api/bearilly-login), and sends them to the right home page. The school's own submit code never runs, so it cannot
// send a password anywhere but Bearilly. It needs no change to the school's markup: it finds the password box and the
// box before it. (If a school page has no form, pressing Enter in the password box or clicking a button that says
// "log in" / "sign in" does the same.)
//
// While it signs in, the school's own button turns into a "Signing in…" button with a spinner (so the person can see it is working and
// does not press it twice); once Bearilly has accepted the password, the page is covered by the loading screen with the school's logo until the
// next page opens.

const EMAIL_SELECTOR = 'input[type="email"], input[autocomplete="username"], input[name*="mail" i], input[id*="mail" i], input[name*="user" i], input[id*="user" i], input[name*="login" i]';
const LOGIN_WORDS = /\b(log\s?in|sign\s?in|continue|submit|enter)\b/i;

export function findLoginFields(root) {
  if (!root) return null;
  const password = root.querySelector('input[type="password"]');
  if (!password) return null;
  const inputs = [...root.querySelectorAll('input')].filter((input) => input !== password && !['hidden', 'checkbox', 'radio', 'submit', 'button'].includes(input.type));
  const email = root.querySelector(EMAIL_SELECTOR) || inputs.find((input) => input.compareDocumentPosition(password) & Node.DOCUMENT_POSITION_FOLLOWING) || inputs[0];
  return email ? { email, password } : null;
}

export function safeNext(value) {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !value.includes('\\') ? value : '';
}

// A full page load (not a client-side move) so the school's own style sheets, which are global, are gone on Bearilly's pages.
export function goTo(target) {
  window.location.replace(schoolsHref(target));
}

export function destinationFor({ role, school }, search) {
  return safeNext(new URLSearchParams(search || '').get('next')) || (role === 'school_admin' && school?.status === 'setup' ? '/admin/setup' : homeFor(role));
}

export default function LoginAdapter({ children }) {
  const { signIn, status, me, role } = useSession();
  const rootRef = useRef(null);
  const busyRef = useRef(false);
  const stopSigningInRef = useRef(null);
  const [message, setMessage] = useState('');
  const [staffUrl, setStaffUrl] = useState('');
  const [opening, setOpening] = useState(false);

  // Cover the form with the loading screen while the next page opens. If the browser has not moved on after a while, say so and show the form again.
  useEffect(() => {
    if (!opening) return undefined;
    const timer = setTimeout(() => {
      setOpening(false);
      if (stopSigningInRef.current) stopSigningInRef.current();
      stopSigningInRef.current = null;
      busyRef.current = false;
      setMessage('This is taking longer than usual. Check your connection, then try again.');
    }, 25000);
    return () => clearTimeout(timer);
  }, [opening]);

  useEffect(() => {
    // Teachers and school admins do not work on a school's own website; they are never sent to a page that is not here.
    if (status === 'in' && CONNECTED && role !== 'student') {
      setStaffUrl(`${BEARILLY_HOME.replace(/\/+$/, '')}/login`);
      setMessage('Teachers and school admins sign in on the staff website.');
    } else if (status === 'in') {
      setOpening(true);
      goTo(destinationFor({ role, school: me?.school }, window.location.search));
    }
  }, [status, role, me]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    async function attempt(event) {
      const fields = findLoginFields(root);
      if (!fields) return false;
      const email = fields.email.value.trim();
      const password = fields.password.value;
      if (!email || !password) {
        setMessage('Enter your email and password.');
        return true;
      }
      if (busyRef.current) return true;
      busyRef.current = true;
      setMessage('');
      setStaffUrl('');
      root.setAttribute('aria-busy', 'true');
      const stopSigningIn = showSigningIn(findSubmitButton(root, event));
      stopSigningInRef.current = stopSigningIn;
      let moving = false;
      try {
        const signedIn = await signIn(email, password);
        moving = true;
        setOpening(true);
        goTo(destinationFor({ role: signedIn.role, school: signedIn.school }, window.location.search));
      } catch (error) {
        moving = false;
        if (error.code === 'STAFF_USE_BEARILLY') {
          setStaffUrl(error.url || '');
          setMessage('Teachers and school admins sign in on the staff website, not on this one.');
        } else setMessage(error.code === 'AUTH' ? 'Email or password is incorrect.' : friendlyError(error));
      } finally {
        // On success the button stays as "Signing in…" until the next page replaces this one; on a mistake it goes back to normal.
        if (!moving) {
          stopSigningIn();
          stopSigningInRef.current = null;
          busyRef.current = false;
        }
        root.removeAttribute('aria-busy');
      }
      return true;
    }

    const onSubmit = (event) => {
      if (!findLoginFields(root)) return;
      event.preventDefault();
      event.stopPropagation();
      attempt(event);
    };
    const onKeyDown = (event) => {
      if (event.key !== 'Enter' || event.target.type !== 'password' || event.target.closest('form')) return;
      event.preventDefault();
      event.stopPropagation();
      attempt(event);
    };
    const onClick = (event) => {
      const button = event.target.closest && event.target.closest('button, input[type="submit"], [role="button"]');
      if (!button || !root.contains(button) || button.closest('form') || !LOGIN_WORDS.test(button.textContent || button.value || '')) return;
      if (!findLoginFields(root)) return;
      event.preventDefault();
      event.stopPropagation();
      attempt(event);
    };
    root.addEventListener('submit', onSubmit, true);
    root.addEventListener('keydown', onKeyDown, true);
    root.addEventListener('click', onClick, true);
    return () => {
      root.removeEventListener('submit', onSubmit, true);
      root.removeEventListener('keydown', onKeyDown, true);
      root.removeEventListener('click', onClick, true);
    };
  }, [signIn]);

  return (
    <div ref={rootRef} style={{ display: 'contents' }}>
      {children}
      {opening ? <LoadingScreen overlay message="Signing you in…" /> : null}
      {message ? (
        <div
          role="alert"
          style={{ position: 'fixed', left: '50%', bottom: 24, transform: 'translateX(-50%)', zIndex: 2147483000, maxWidth: 'min(92vw, 420px)', padding: '12px 16px', borderRadius: 12, background: '#7a1d1d', color: '#fff', font: '500 14px/1.4 system-ui, sans-serif', boxShadow: '0 8px 24px rgba(0,0,0,.25)' }}
        >
          {message}
          {staffUrl ? (
            <>
              {' '}
              <a href={staffUrl} style={{ color: '#fff', textDecoration: 'underline', fontWeight: 700 }}>
                Go to staff sign-in
              </a>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
