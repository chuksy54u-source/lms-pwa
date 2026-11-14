'use client';

import { useEffect, useState } from 'react';
import { useTenant } from '../../components/app/TenantProvider';
import { appName } from './brand.js';

// Sets the browser tab title: "Lesson · Ornate Tech School".
export function useTitle(title) {
  const { school } = useTenant();
  const app = appName(school);
  useEffect(() => {
    if (title) document.title = `${title} · ${app}`;
  }, [title, app]);
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
