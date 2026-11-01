'use client';

import { useTenant } from './TenantProvider';
import { initials } from '../../lib/app/format';

// The school's logo and name (or Bearilly's when there is no school). Nothing Bearilly-branded leaks into a school.
export default function SchoolMark({ compact }) {
  const { school, branding } = useTenant();
  const name = school ? school.name : 'Bearilly';
  return (
    <div className="school-mark">
      {branding.logo_url ? <img src={branding.logo_url} alt="" /> : <span className="mark">{school ? initials(name) : '🐻'}</span>}
      {!compact && <span>{name}</span>}
    </div>
  );
}
