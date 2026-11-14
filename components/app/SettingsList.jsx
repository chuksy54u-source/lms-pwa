'use client';

import { Link } from '../../lib/app/nav.js';
import { Switch, Icon, Select } from '../ui';
import { useTheme } from './ThemeProvider';
import { readStore, writeStore } from '../../lib/app/storage';
import { useSyncExternalStore } from 'react';
import { useToast } from './ToastProvider';
import { readBearPrefs, writeBearPrefs, onBearPrefs, DEFAULT_BEAR_PREFS } from '../../lib/app/bearPrefs';

const PUSH_EVENT = 'bearilly:push-preference';

function subscribePush(callback) {
  window.addEventListener(PUSH_EVENT, callback);
  return () => window.removeEventListener(PUSH_EVENT, callback);
}

function pushSnapshot() {
  return Boolean(readStore('bearilly:push'))
    && typeof Notification !== 'undefined'
    && Notification.permission === 'granted';
}

function bearPrefsSnapshot() {
  return JSON.stringify(readBearPrefs());
}

// Settings rows shared by the student "Me" page and the staff "Account" page.
export function ThemeRow() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="list-item">
      <span className="list-icon">
        <Icon name="moon" size={20} />
      </span>
      <div className="grow">
        <p className="strong">Dark mode</p>
        <p className="small muted">{theme === 'system' ? 'Follows your device' : theme === 'dark' ? 'Always dark' : 'Always light'}</p>
      </div>
      <Select aria-label="Theme" value={theme} onChange={(e) => setTheme(e.target.value)} style={{ width: 'auto', minHeight: 40 }}>
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </Select>
    </div>
  );
}

// Push notifications: asks the browser for permission. Sending them needs a backend (not built yet), so this only
// records the choice for now.
export function PushRow() {
  const toast = useToast();
  const on = useSyncExternalStore(subscribePush, pushSnapshot, () => false);
  async function change(next) {
    if (!next) {
      writeStore('bearilly:push', null);
      window.dispatchEvent(new Event(PUSH_EVENT));
      return;
    }
    if (typeof Notification === 'undefined') {
      toast('This browser does not support notifications.', 'error');
      return;
    }
    const p = await Notification.requestPermission();
    if (p === 'granted') {
      writeStore('bearilly:push', true);
      window.dispatchEvent(new Event(PUSH_EVENT));
      toast('Browser notification permission granted.', 'success');
    } else toast('Notifications are blocked in your browser settings.', 'error');
  }
  return (
    <div className="list-item">
      <span className="list-icon">
        <Icon name="bell" size={20} />
      </span>
      <div className="grow">
        <p className="strong">Notification permission</p>
        <p className="small muted">Allow this browser to show notifications; delivery is not enabled yet.</p>
      </div>
      <Switch checked={on} onChange={change} label="Browser notification permission" />
    </div>
  );
}

export function LinkRow({ href, icon, title, sub }) {
  return (
    <Link href={href} className="list-item">
      <span className="list-icon">
        <Icon name={icon} size={20} />
      </span>
      <div className="grow">
        <p className="strong">{title}</p>
        {sub && <p className="small muted">{sub}</p>}
      </div>
      <Icon name="next" size={18} />
    </Link>
  );
}

// The bear's own settings (roadmap Phase 8): voice, words that stay on screen, and reduced motion.
// Kept on this device, so a shared school computer can be set up once.
export function BearRows() {
  const storedPrefs = useSyncExternalStore(onBearPrefs, bearPrefsSnapshot, () => JSON.stringify(DEFAULT_BEAR_PREFS));
  const p = JSON.parse(storedPrefs);
  const set = (patch) => writeBearPrefs(patch);
  return (
    <>
      <div className="list-item">
        <span className="list-icon">
          <Icon name="sound" size={20} />
        </span>
        <div className="grow">
          <p className="strong">Bear voice</p>
          <p className="small muted">{p.sound ? 'The bear reads its words out loud' : 'The bear only shows its words'}</p>
        </div>
        <Switch checked={p.sound} onChange={(v) => set({ sound: v })} label="Bear voice" />
      </div>
      <div className="list-item">
        <span className="list-icon">
          <Icon name="chat" size={20} />
        </span>
        <div className="grow">
          <p className="strong">Keep the bear’s words on screen</p>
          <p className="small muted">{p.captions === 'stay' ? 'Words stay until you close them' : 'Words fade a few seconds after the bear stops'}</p>
        </div>
        <Switch checked={p.captions === 'stay'} onChange={(v) => set({ captions: v ? 'stay' : 'auto' })} label="Keep the bear’s words on screen" />
      </div>
      <div className="list-item">
        <span className="list-icon">
          <Icon name="sparkle" size={20} />
        </span>
        <div className="grow">
          <p className="strong">Bear movement</p>
          <p className="small muted">Less movement switches off bouncing, waving and confetti</p>
        </div>
        <Select aria-label="Bear movement" value={p.motion} onChange={(e) => set({ motion: e.target.value })} style={{ width: 'auto', minHeight: 40 }}>
          <option value="system">Like my device</option>
          <option value="full">Full</option>
          <option value="reduced">Less movement</option>
        </Select>
      </div>
    </>
  );
}
