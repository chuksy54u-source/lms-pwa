'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiGet } from '../../lib/api/client.js';
import { tutorSettingsFromApi } from '../../lib/bear/settings.js';
import { CONNECTED } from '../../lib/app/connected.js';
import { isSvgUrl, retitle, tutorFallback } from '../../lib/app/brand.js';

// Which school is this, and what does it look like?
//  1. On load: GET /api/v1/tenant (the school behind this web address, e.g. ornate.bearilly.name.ng).
//  2. After sign-in: the signed-in person's own school branding (BrandingSync in AppProviders calls setSchool).
// Its colours and font are written to CSS variables, so every screen re-skins itself.

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

// On a school's own website the tab shows the school, not Bearilly: swap the stand-in title for the school's name, and, if the
// school's website has no icon of its own, use the logo the school uploaded (SVG, PNG or JPEG).
function applyIdentity(tenant) {
  if (!CONNECTED || typeof document === 'undefined') return;
  const school = tenant && tenant.school;
  const title = retitle(document.title, school);
  if (title !== document.title) document.title = title;
  const logo = tenant && tenant.branding && tenant.branding.logo_url;
  if (!logo) return;
  const link = (rel, extra) => {
    if (document.querySelector(`link[rel~="${rel}"]`)) return;
    const el = document.createElement('link');
    el.rel = rel;
    el.href = logo;
    if (extra) el.type = extra;
    document.head.appendChild(el);
  };
  link('icon', isSvgUrl(logo) ? 'image/svg+xml' : undefined);
  if (!isSvgUrl(logo)) link('apple-touch-icon');
}

// On a school's own website the school's logo and colours are remembered in this browser, so the loading screen shows the logo straight away
// the next time the page opens (moving to a new tab, a page reload, coming back after the page slept) instead of waiting for the school's
// details to come back from the server first. The server's answer always replaces what was remembered.
const REMEMBERED_KEY = 'bearilly:school-brand';

export function readRemembered(storage = typeof localStorage !== 'undefined' ? localStorage : null) {
  try {
    const value = JSON.parse(storage.getItem(REMEMBERED_KEY));
    return value && typeof value === 'object' ? value : null;
  } catch (error) {
    return null;
  }
}

export function rememberBranding(branding, storage = typeof localStorage !== 'undefined' ? localStorage : null) {
  try {
    if (!storage || !branding) return;
    const { logo_url = null, primary_color, secondary_color, font } = branding;
    storage.setItem(REMEMBERED_KEY, JSON.stringify({ logo_url: typeof logo_url === 'string' ? logo_url : null, primary_color, secondary_color, font }));
  } catch (error) {
    /* a full or blocked store only means the logo is fetched again next time */
  }
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
  const [remembered, setRemembered] = useState(null);

  useEffect(() => {
    if (CONNECTED) setRemembered(readRemembered());
  }, []);

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
  // until the school's own details arrive, a school's own website uses the logo and colours remembered from the last visit
  const branding = (tenant && tenant.branding) || (CONNECTED && hostTenant === undefined && remembered) || null;

  useEffect(() => {
    applyTheme(branding);
    applyIdentity(tenant);
  }, [tenant, branding]);

  useEffect(() => {
    if (CONNECTED && tenant && tenant.branding) rememberBranding(tenant.branding);
  }, [tenant]);

  // { school, branding, tutor } for the signed-in person's school (or null after sign-out).
  const setSchool = useCallback((value) => setOwn(value), []);

  const value = useMemo(
    () => ({
      ready: hostTenant !== undefined,
      tenant,
      school: tenant ? tenant.school : null,
      branding: { ...DEFAULT_BRANDING, ...(branding || {}) },
      tutor: {
        fur_color: '#C99B68',
        accessories: {},
        ...((tenant && tenant.tutor) || {}),
        name: (tenant && tenant.tutor && tenant.tutor.name) || tutorFallback(tenant && tenant.school),
      },
      bearSettings: tenant ? tutorSettingsFromApi(tenant) : undefined,
      hostSchool: hostTenant ? hostTenant.school : null,
      setSchool,
    }),
    [hostTenant, tenant, branding, setSchool],
  );
  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  return useContext(TenantContext) || { ready: true, tenant: null, school: null, branding: DEFAULT_BRANDING, tutor: { name: 'Study tutor' }, setSchool: () => {} };
}
