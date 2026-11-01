'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiGet } from '../../lib/api/client.js';
import { tutorSettingsFromApi } from '../../lib/bear/settings.js';

// Which school is this, and what does it look like?
//  1. On load: GET /api/v1/tenant (the school behind this web address, e.g. ornate.bearilly.name.ng).
//  2. After sign-in: the signed-in person's own school branding (BrandingSync in AppProviders calls setSchool).
// Its colours and font are written to CSS variables, so every screen re-skins itself. No school: Bearilly's own look.

const TenantContext = createContext(null);
export const DEFAULT_BRANDING = { logo_url: null, primary_color: '#1E3A5F', secondary_color: '#E8A33D', font: 'Poppins', pass_mark: 50, grade_scale: 'standard' };
const SYSTEM_FONTS = new Set([]);

function applyTheme(branding) {
  const root = document.documentElement;
  const b = { ...DEFAULT_BRANDING, ...(branding || {}) };
  root.style.setProperty('--brand', b.primary_color);
  root.style.setProperty('--accent', b.secondary_color);
  root.style.setProperty('--school-primary', b.primary_color);
  root.style.setProperty('--school-secondary', b.secondary_color);
  root.style.setProperty('--font', `'${b.font}', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif`);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', b.primary_color);
  loadFont(b.font);
}

export function loadFont(font) {
  if (!font || SYSTEM_FONTS.has(font)) return;
  const id = `font-${font.replace(/\s+/g, '-').toLowerCase()}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font).replace(/%20/g, '+')}:wght@400;500;600;700;800&display=swap`;
  document.head.appendChild(link);
}

export default function TenantProvider({ children }) {
  const [hostTenant, setHostTenant] = useState(undefined); // undefined = still asking, null = no school at this address
  const [own, setOwn] = useState(null);

  useEffect(() => {
    let live = true;
    apiGet('/api/v1/tenant')
      .then((t) => live && setHostTenant(t || null))
      .catch(() => live && setHostTenant(null));
    return () => {
      live = false;
    };
  }, []);

  const tenant = own || hostTenant || null;

  useEffect(() => {
    applyTheme(tenant && tenant.branding);
  }, [tenant]);

  // { school, branding, tutor } for the signed-in person's school (or null after sign-out).
  const setSchool = useCallback((value) => setOwn(value), []);

  const value = useMemo(
    () => ({
      ready: hostTenant !== undefined,
      tenant,
      school: tenant ? tenant.school : null,
      branding: { ...DEFAULT_BRANDING, ...((tenant && tenant.branding) || {}) },
      tutor: (tenant && tenant.tutor) || { name: 'Bearilly', fur_color: '#C99B68', accessories: {} },
      bearSettings: tenant ? tutorSettingsFromApi(tenant) : undefined,
      hostSchool: hostTenant ? hostTenant.school : null,
      setSchool,
    }),
    [hostTenant, tenant, setSchool],
  );
  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  return useContext(TenantContext) || { ready: true, tenant: null, school: null, branding: DEFAULT_BRANDING, tutor: { name: 'Bearilly' }, setSchool: () => {} };
}
