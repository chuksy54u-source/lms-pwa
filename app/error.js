'use client';

import { useEffect } from 'react';
import AuthFrame from '../components/app/AuthFrame';
import { Button } from '../components/ui';

// Shown when a page crashes. Nothing technical on screen: a retry, a way home, and a reference for support.
export default function ErrorPage({ error, reset }) {
  useEffect(() => {
    console.error(error); // eslint-disable-line no-console
  }, [error]);
  return (
    <AuthFrame title="Something went wrong" sub="This page hit a problem. Your work is saved; trying again usually fixes it." emotion="worried" pose="cheeks">
      <div className="stack">
        <Button block icon="refresh" onClick={() => reset()}>
          Try again
        </Button>
        <Button href="/" variant="outline" block icon="home">
          Go to the start
        </Button>
        {error && error.digest && <p className="tiny muted center">Reference for support: {error.digest}</p>}
      </div>
    </AuthFrame>
  );
}
