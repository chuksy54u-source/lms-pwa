'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { readStore, writeStore } from '../../lib/app/storage';

// Light / dark / follow the phone. Saved per device. The small script in app/layout.js applies it before
// the first paint so there is no flash.
export const THEME_KEY = 'bearilly:theme';
const ThemeContext = createContext({ theme: 'system', setTheme: () => {} });

export default function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('system');
  useEffect(() => setThemeState(readStore(THEME_KEY, 'system')), []);
  const setTheme = useCallback((t) => {
    setThemeState(t);
    writeStore(THEME_KEY, t === 'system' ? null : t);
    if (t === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', t);
  }, []);
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
