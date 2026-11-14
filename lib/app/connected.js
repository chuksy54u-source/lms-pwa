// Written by Bearilly Buildgram (full codebase swap). This app is running on a school's own website.
//   CONNECTED     - sign-in goes through this website's own server (/api/bearilly-login), not Supabase in the browser.
//   BEARILLY_HOME - Bearilly's address, for the few things that only exist there (staff sign-in).
//   SCHOOL_NAME   - the school's name, shown in the browser tab and on the first screen, so a student never sees "Bearilly".
export const CONNECTED = true;
export const BEARILLY_HOME = "https://bearilly-v2.vercel.app";
export const SCHOOL_NAME = "Ornate Tech School";

// A sign-in token works for 15 minutes. The page swaps it for a fresh one this often while it is open, and a page that has just opened
// (or woken up) renews at once if the last renewal was a while ago, so loading another page never restarts the clock.
export const RENEW_EVERY_MS = 4 * 60 * 1000;
