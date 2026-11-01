'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from '../app/SessionProvider';
import { useBear } from '../bear/BearProvider';
import useApi from '../../lib/app/useApi';
import Icon from '../ui/icons';

// Slot and subscription alerts for school admins (roadmap Phase 5): a banner on every admin page, and the bear says it
// once per visit when slots pass 80%. Expired or read-only schools see a renew link.
export default function BillingBanner() {
  const { role } = useSession();
  const path = usePathname();
  const bear = useBear();
  const slots = useApi(role === 'school_admin' ? '/api/v1/billing/slots' : null);
  const spoke = useRef(false);
  const s = slots.data;
  const reminder = s && s.status === 'active' && s.term ? s.term.renewal_reminder : null;
  const level = !s ? null : s.status === 'inactive' || s.status === 'expired' ? 'none' : s.status === 'read_only_grace' ? 'readonly' : s.alert_level === 'none' && reminder ? 'renew' : s.alert_level;

  useEffect(() => {
    if (!s || spoke.current) return;
    let said = false;
    try {
      said = window.sessionStorage.getItem('bearilly:slot-alert') === String(s.percent_used);
    } catch (e) {
      said = false;
    }
    if (said) return;
    if (level === 'renew') {
      spoke.current = true;
      bear.say(`Your school's term ends in ${s.term.days_left} day${s.term.days_left === 1 ? '' : 's'}. Renew in Billing so your students keep learning.`, { emotion: 'worried', pose: 'point' });
      try {
        window.sessionStorage.setItem('bearilly:slot-alert', String(s.percent_used));
      } catch (e) {
        /* ignore */
      }
      return;
    }
    if (level === 'warning' || level === 'urgent' || level === 'full') {
      spoke.current = true;
      bear.sayKey(level === 'full' ? 'slotsFull' : 'slotsAlmostFull', undefined, { emotion: 'worried', pose: 'point' });
      try {
        window.sessionStorage.setItem('bearilly:slot-alert', String(s.percent_used));
      } catch (e) {
        /* ignore */
      }
    }
  }, [s, level, bear]);

  if (!s || path.startsWith('/admin/billing') || !level || level === 'none' && s.status === 'active') return null;
  const text =
    level === 'none' ? 'No active subscription: you cannot add students and the bear cannot answer questions.' :
    level === 'readonly' ? 'Your term has ended. Everything is read-only for 7 days. Renew to keep teaching.' :
    level === 'full' ? `All ${s.purchased} student slots are in use.` :
    level === 'renew' ? `Your term ends in ${s.term.days_left} day${s.term.days_left === 1 ? '' : 's'}. Renew so learning does not stop.` :
    `${s.percent_used}% of your ${s.purchased} student slots are used.`;
  const urgent = level === 'none' || level === 'readonly' || level === 'full' || level === 'urgent' || (level === 'renew' && reminder === 1);
  return (
    <div className={`banner no-print ${urgent ? 'banner-offline' : 'banner-mock'}`} role="status" style={urgent ? { background: 'var(--danger-soft)', color: 'var(--danger)' } : undefined}>
      <Icon name="users" size={18} />
      <span className="grow">{text}</span>
      <Link href="/admin/billing" className="btn btn-sm" style={{ minHeight: 32 }}>
        {level === 'none' ? 'Subscribe' : level === 'readonly' || level === 'renew' ? 'Renew' : 'Buy more slots'}
      </Link>
    </div>
  );
}
