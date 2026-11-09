import { usingMocks } from '../api/client.js';

// Switches for screens whose backend is not built yet. They show in mock mode (for design review)
// and stay hidden on a real deployment until the backend ships and the flag is turned on.
export const features = {
  // Homework with file upload (TASK / SUBMISSION / SUBMITTED screens). No /assignments endpoints yet.
  fileAssignments: () => usingMocks() || process.env.NEXT_PUBLIC_FEATURE_ASSIGNMENTS === 'on',
  // "Continue with Google". Needs the Google provider switched on in Supabase Auth first.
  googleSignIn: () => process.env.NEXT_PUBLIC_GOOGLE_AUTH === 'on',
};
