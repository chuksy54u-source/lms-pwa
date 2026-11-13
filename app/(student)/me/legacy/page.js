'use client';

import { useState } from 'react';
import { StudentTop } from '../../../../components/app/StudentShell';
import { Card, PageHead, Input, Button, Callout } from '../../../../components/ui';
import { apiPost } from '../../../../lib/api/client';

export default function LinkLegacyAccount() {
  const [legacyId, setLegacyId] = useState('');
  const [claimId, setClaimId] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [linked, setLinked] = useState(false);

  async function start(event) {
    event.preventDefault();
    setBusy(true); setError(''); setMessage('');
    try {
      const result = await apiPost('/api/v1/legacy/claim/start', { legacy_id: legacyId });
      setClaimId(result.claim_id || '');
      setMessage(result.message);
    } catch (err) {
      setError(err.message || 'The claim could not be started.');
    } finally { setBusy(false); }
  }

  async function verify(event) {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      const result = await apiPost('/api/v1/legacy/claim/verify', { claim_id: claimId, code });
      setLinked(true);
      setMessage(`Your previous school ID ${result.legacy_id} is now linked.`);
    } catch (err) {
      setError(err.message || 'That code could not be verified.');
    } finally { setBusy(false); }
  }

  return (
    <>
      <StudentTop />
      <main className="app-main stack-lg" style={{ maxWidth: 760, margin: '0 auto' }}>
        <PageHead title="Link a previous school account" sub="We verify your legacy ID against the school’s approved lookup and send a one-time code to your verified Bearilly email." />
        <Callout tone="info" title="Your sign-in stays private">
          Bearilly never asks for your old Supabase service key or password. If your old school cannot provide the secure lookup, ask the administrator about the spreadsheet fallback.
        </Callout>
        {!linked && !claimId && <Card className="card-pad-lg">
          <form className="stack" onSubmit={start}>
            <Input label="Previous school ID" value={legacyId} onChange={(e) => setLegacyId(e.target.value)} maxLength={100} required />
            <Button type="submit" loading={busy}>Send verification code</Button>
          </form>
        </Card>}
        {!linked && claimId && <Card className="card-pad-lg">
          <form className="stack" onSubmit={verify}>
            <Input label="Six-digit email code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} required />
            <Button type="submit" loading={busy}>Verify and link account</Button>
          </form>
        </Card>}
        {message && <p role="status">{message}</p>}
        {error && <p role="alert" className="error">{error}</p>}
      </main>
    </>
  );
}
