import { createClient } from '@supabase/supabase-js';

// PUBLIC client. Safe in the browser: it can only do what row-level security allows.
// The app uses ONE of these (it keeps the saved login), so every call returns the same one.
// (The two process.env names must be written out in full so Next.js can fill them in.)
let client = null;
export function createBrowserClient() {
  if (!client) {
    client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  }
  return client;
}
