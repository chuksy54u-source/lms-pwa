'use client';

import { useState } from 'react';
import { StudentTop } from '../../../../components/app/StudentShell';
import { Card, Badge, BackLink, Button, ListSkeleton, ErrorState, EmptyState, Callout } from '../../../../components/ui';
import { useToast } from '../../../../components/app/ToastProvider';
import useApi from '../../../../lib/app/useApi';
import { apiPost } from '../../../../lib/api/client';
import { money, dateLong, friendlyError } from '../../../../lib/app/format';
import { useTitle } from '../../../../lib/app/hooks';

const LABEL = { open: ['Unpaid', 'accent'], pending: ['Payment started', 'info'], paid: ['Paid', 'success'], cancelled: ['Cancelled', ''], refunded: ['Refunded', ''] };

// MY SCHOOL FEES: invoices from the school, itemised, paid through the school's own Paystack account.
export default function MyFees() {
  useTitle('School fees');
  const toast = useToast();
  const invoices = useApi('/api/v1/school-fees/invoices');
  const schedules = useApi('/api/v1/school-fees/schedules');
  const [paying, setPaying] = useState(null);
  const names = Object.fromEntries((schedules.data || []).map((s) => [s.id, `${s.name} · ${s.period_label}`]));

  async function pay(inv) {
    setPaying(inv.id);
    try {
      const out = await apiPost(`/api/v1/school-fees/invoices/${encodeURIComponent(inv.id)}/checkout`, {});
      window.location.assign(out.authorization_url); // Paystack, then back to /billing/return which confirms it
    } catch (err) {
      toast(err.code === 'PAYMENT_NOT_CONFIGURED' || err.code === 'SCHOOL_PAYMENTS_NOT_CONFIGURED' ? 'Your school has not set up online payment yet.' : friendlyError(err), 'error');
      setPaying(null);
    }
  }

  const list = invoices.data || [];
  const owed = list.filter((i) => i.status === 'open' || i.status === 'pending');
  return (
    <>
      <StudentTop />
      <main className="app-main stack-lg" id="main">
        <BackLink href="/me">Me</BackLink>
        <h1>School fees</h1>
        {invoices.loading && !invoices.data ? (
          <ListSkeleton count={2} />
        ) : invoices.error && !invoices.data ? (
          <ErrorState error={invoices.error} onRetry={invoices.reload} />
        ) : list.length === 0 ? (
          <EmptyState title="No fees to pay" text="When your school sends you an invoice, it shows here." pose="wave" />
        ) : (
          <>
            {owed.length > 0 && (
              <Callout tone="info" title={`${owed.length} invoice${owed.length === 1 ? '' : 's'} to pay`}>
                Payment goes straight to your school through Paystack. You may need a parent or guardian to pay.
              </Callout>
            )}
            <div className="stack">
              {list.map((inv) => {
                const [label, tone] = LABEL[inv.status] || [inv.status, ''];
                return (
                  <Card key={inv.id} className="stack">
                    <div className="row-between wrap">
                      <div>
                        <p className="card-title">{names[inv.schedule_id] || 'School fees'}</p>
                        <p className="card-sub">{inv.due_at ? `Due ${dateLong(inv.due_at)}` : `Sent ${dateLong(inv.created_at)}`}</p>
                      </div>
                      <Badge tone={tone}>{label}</Badge>
                    </div>
                    <div className="list" style={{ borderRadius: 12 }}>
                      {(inv.items || []).map((i) => (
                        <div key={i.id || i.name} className="list-item small" style={{ padding: '8px 12px' }}>
                          <span className="grow">{i.name}</span>
                          <span>{money(i.amount_minor, inv.currency)}</span>
                        </div>
                      ))}
                      <div className="list-item" style={{ padding: '10px 12px', background: 'var(--surface-2)' }}>
                        <span className="grow strong">Total</span>
                        <span className="strong">{money(inv.total_amount_minor, inv.currency)}</span>
                      </div>
                    </div>
                    {(inv.status === 'open' || inv.status === 'pending') && (
                      <Button block icon="lock" loading={paying === inv.id} onClick={() => pay(inv)}>
                        {inv.status === 'pending' ? 'Continue payment' : `Pay ${money(inv.total_amount_minor, inv.currency)}`}
                      </Button>
                    )}
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </main>
    </>
  );
}
