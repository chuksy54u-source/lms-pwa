'use client';

import AuthFrame from './AuthFrame';
import { useSession } from './SessionProvider';
import { BEARILLY_HOME } from '../../lib/app/connected.js';
import { schoolsHref } from '../../lib/app/paths.js';

// Shown on a school's OWN website (connected mode) to a signed-in teacher or school admin. This website is the students'
// part of Bearilly; teachers and school admins sign in on Bearilly's own website, so we say so and offer the way there.
export default function StaffUseBearilly() {
  const { signOut } = useSession();
  const login = `${BEARILLY_HOME.replace(/\/+$/, '')}/login`;
  return (
    <AuthFrame
      title="Teachers and school admins use Bearilly"
      sub="This website is for students. Sign in on Bearilly to manage your classes and your school."
      pose="point"
    >
      <div className="stack">
        <a className="btn btn-block" href={login}>
          Go to Bearilly
        </a>
        <button
          type="button"
          className="btn btn-ghost btn-block"
          onClick={async () => {
            await signOut();
            window.location.replace(schoolsHref('/login'));
          }}
        >
          Sign out of this website
        </button>
      </div>
    </AuthFrame>
  );
}
