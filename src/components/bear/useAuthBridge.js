'use client';

import { useSession } from '../app/SessionProvider';

// Returns the signed-in person's id from the Bearilly server session, so the bear can load their mood.
export default function useAuthBridge() {
  const { me, status } = useSession();
  return status === 'in' ? me?.id || null : null;
}
