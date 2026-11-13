'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '../../lib/supabase/browser.js';
import { setAuthTokenGetter } from '../../lib/api/client.js';
import { CONNECTED } from '../../lib/app/connected.js';

// Keeps the API helper signed in: whoever is signed in with Supabase, apiGet and apiPost send their token.
// Returns the signed-in person's id (or null), so the bear can load their mood.
// If Supabase is not set up on this computer it quietly does nothing.
export default function useAuthBridge() {
  const [userId, setUserId] = useState(null);
  useEffect(() => {
    if (CONNECTED) return undefined; // a connected school website signs in through its own server, not Supabase in the browser
    let client;
    try {
      client = createBrowserClient();
    } catch (err) {
      return undefined;
    }
    setAuthTokenGetter(async () => {
      const { data } = await client.auth.getSession();
      return data.session ? data.session.access_token : null;
    });
    client.auth.getSession().then(({ data }) => setUserId(data.session ? data.session.user.id : null));
    const { data } = client.auth.onAuthStateChange((_event, session) => setUserId(session ? session.user.id : null));
    return () => data.subscription.unsubscribe();
  }, []);
  return userId;
}
