'use client';

import { createContext, useCallback, useContext, useState } from 'react';

// const toast = useToast(); toast('Saved'); toast('Upload failed', 'error');
// Drawn with inline styles so it looks right on any site.
const ToastContext = createContext(() => {});

const TONES = { success: '#34d399', error: '#f87171', danger: '#f87171', warn: '#fbbf24' };

export default function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const toast = useCallback((text, tone = 'default', ms = 3800) => {
    const id = Math.random().toString(36).slice(2);
    setItems((list) => [...list.slice(-2), { id, text, tone }]);
    setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), ms);
  }, []);
  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        role="status"
        aria-live="polite"
        style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 100, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 360 }}
      >
        {items.map((t) => (
          <div
            key={t.id}
            style={{
              background: '#111115',
              color: TONES[t.tone] || '#e2e8f0',
              border: '1px solid ' + (TONES[t.tone] ? TONES[t.tone] + '55' : 'rgba(255,255,255,0.12)'),
              padding: '12px 16px',
              fontSize: 12,
              fontWeight: 700,
              boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
            }}
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
