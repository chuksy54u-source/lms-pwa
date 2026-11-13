// Written by Bearilly Buildgram (full codebase swap). This app is running on a school's own website.
//   CONNECTED     - sign-in goes through this website's own server (/api/bearilly-login), not Supabase in the browser.
//   BEARILLY_HOME - Bearilly's address, for the few things that only exist there (password reset).
export const CONNECTED = true;
export const BEARILLY_HOME = "https://bearilly-v2.vercel.app";

// The school website swaps the 15-minute session for a fresh one this often while the page is open.
export const RENEW_EVERY_MS = 10 * 60 * 1000;
