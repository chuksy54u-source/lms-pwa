'use client';

import { useEffect, useState } from 'react';

// Sets the browser tab title: "Lesson · Ornate Tech School".
export function useTitle(title) {
  useEffect(() => {
    if (title) document.title = `${title} · Bearilly`;
  }, [title]);
}

// Reads ?name= from the address without needing a Suspense boundary.
export function useQueryParam(name) {
  const [value, setValue] = useState(null);
  useEffect(() => {
    setValue(new URLSearchParams(window.location.search).get(name));
  }, [name]);
  return value;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
