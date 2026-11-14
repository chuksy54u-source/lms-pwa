'use client';

import { createContext, useCallback, useContext, useState } from 'react';

// const toast = useToast(); toast('Saved'); toast('Upload failed', 'error');
const ToastContext = createContext(() => {});

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
      <div className="toasts" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`toast toast-${t.tone}`}>
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
