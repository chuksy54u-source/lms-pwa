'use client';

import { useEffect, useState } from 'react';
import { Button } from '../ui';
import { readStore, writeStore } from '../../lib/app/storage';
import { useTenant } from './TenantProvider';

// OFFLINE & INSTALL screen, bottom card: offers "Add to home screen" when the browser allows it.
const KEY = 'bearilly:install-dismissed';

export default function InstallPrompt() {
  const [evt, setEvt] = useState(null);
  const { school } = useTenant();
  useEffect(() => {
    if (readStore(KEY)) return undefined;
    const onPrompt = (e) => {
      e.preventDefault();
      setEvt(e);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);
  if (!evt) return null;
  const close = () => {
    writeStore(KEY, true);
    setEvt(null);
  };
  return (
    <div className="sheet-backdrop" style={{ background: 'transparent', pointerEvents: 'none' }}>
      <div className="sheet stack" style={{ pointerEvents: 'auto', marginBottom: 'calc(var(--tabbar-h) + env(safe-area-inset-bottom))' }} role="dialog" aria-label="Install the app">
        <div className="install">
          <img src="/bear/exports/head-180.png" alt="" />
          <div>
            <p className="card-title">Install {school ? school.name : 'your school app'}</p>
            <p className="card-sub">Add it to your home screen for faster learning.</p>
          </div>
        </div>
        <Button
          block
          onClick={async () => {
            evt.prompt();
            await evt.userChoice.catch(() => null);
            close();
          }}
        >
          Install
        </Button>
        <button type="button" className="link-btn center" onClick={close} style={{ color: 'var(--muted)' }}>
          Not now
        </button>
      </div>
    </div>
  );
}
