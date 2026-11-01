'use client';

import Link from 'next/link';
import { Switch, Icon, Select } from '../ui';
import { useTheme } from './ThemeProvider';
import { readStore, writeStore } from '../../lib/app/storage';
import { useEffect, useState } from 'react';
import { useToast } from './ToastProvider';
import { readBearPrefs, writeBearPrefs, DEFAULT_BEAR_PREFS } from '../../lib/app/bearPrefs';

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
  const [on, setOn] = useState(false);
  useEffect(() => setOn(Boolean(readStore('bearilly:push')) && typeof Notification !== 'undefined' && Notification.permission === 'granted'), []);
  async function change(next) {
    if (!next) {
      writeStore('bearilly:push', null);
      setOn(false);
      return;
    }
    if (typeof Notification === 'undefined') {
      toast('This browser does not support notifications.', 'error');
      return;
    }
    const p = await Notification.requestPermission();
    if (p === 'granted') {
      writeStore('bearilly:push', true);
      setOn(true);
      toast('Reminders switched on', 'success');
    } else toast('Notifications are blocked in your browser settings.', 'error');
  }
  return (
    <div className="list-item">
      <span className="list-icon">
        <Icon name="bell" size={20} />
      </span>
      <div className="grow">
        <p className="strong">Push notifications</p>
        <p className="small muted">Reminders and grades</p>
      </div>
      <Switch checked={on} onChange={change} label="Push notifications" />
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
  const [p, setP] = useState(DEFAULT_BEAR_PREFS);
  useEffect(() => setP(readBearPrefs()), []);
  const set = (patch) => setP(writeBearPrefs(patch));
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
