'use client';

import { useTenant } from './TenantProvider';
import { useSession } from './SessionProvider';
import { initials } from '../../lib/app/format';

export default function SchoolMark({ compact }) {
  const { school, branding } = useTenant();
  const { me } = useSession();
  const name = school?.name || me?.school?.name || me?.school_name || 'School';
  return (
    <div className="school-mark">
      {branding.logo_url ? <img src={branding.logo_url} alt="" /> : <span className="mark">{initials(name)}</span>}
      {!compact && <span>{name}</span>}
    </div>
  );
}
