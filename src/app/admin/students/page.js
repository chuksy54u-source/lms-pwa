'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { PageHead, Button, SearchInput, Chips, Sheet, Input, Callout, ListSkeleton, ErrorState, Avatar, StatusBadge } from '../../../components/ui';
import { OneTimeSecret } from '../../../components/staff';
import { useToast } from '../../../components/app/ToastProvider';
import { apiList, apiPost, apiPatch } from '../../../lib/api/client';
import ImportPeople from '../../../components/staff/ImportPeople';
import { friendlyError } from '../../../lib/app/format';
import { useQueryParam, useTitle, EMAIL_RE } from '../../../lib/app/hooks';

export default function Students() {
  useTitle('Students');
  const toast = useToast();
  const addParam = useQueryParam('add');
  const [items, setItems] = useState(null);
  const [cursor, setCursor] = useState(null);
  const [error, setError] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('active');
  const [sheet, setSheet] = useState(null);

  async function load(after) {
    try {
      const res = await apiList(`/api/v1/students?limit=50${after ? `&cursor=${encodeURIComponent(after)}` : ''}`);
      setItems((list) => (after ? [...(list || []), ...res.data] : res.data));
      setCursor(res.meta && res.meta.next_cursor);
      setError(null);
    } catch (err) {
      setError(err);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (addParam) setSheet('add');
  }, [addParam]);

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (items || []).filter((s) => (status === 'all' ? true : s.status === status)).filter((s) => !t || `${s.full_name} ${s.email} ${s.student_code || ''} ${s.level || ''}`.toLowerCase().includes(t));
  }, [items, q, status]);

  async function setActive(s, active) {
    try {
      await apiPatch(`/api/v1/students/${encodeURIComponent(s.id)}`, { status: active ? 'active' : 'inactive' });
      setItems((list) => list.map((x) => (x.id === s.id ? { ...x, status: active ? 'active' : 'inactive' } : x)));
      toast(active ? `${s.full_name} can sign in again` : `${s.full_name} was deactivated.`, 'success');
    } catch (err) {
      toast(friendlyError(err), 'error');
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <PageHead
        title="Students"
        sub="Manage your student body."
        actions={
          <>
            <Button onClick={() => setSheet('add')}>Add student</Button>
            <Button variant="outline" onClick={() => setSheet('import')}>Import CSV</Button>
          </>
        }
      />
      <div className="stack mt-8">
        <div className="row wrap">
          <SearchInput placeholder="Search students..." value={q} onChange={(e) => setQ(e.target.value)} />
          <Chips label="Status" value={status} onChange={setStatus} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }, { value: 'all', label: 'All' }]} />
        </div>
        {items === null && !error ? <ListSkeleton count={3} /> : error ? <ErrorState error={error} onRetry={() => load()} /> : (
          <table className="table w-full">
            <thead>
              <tr><th>Student</th><th>Code</th><th>Class</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id}>
                  <td><Avatar name={s.full_name} /> {s.full_name} <span className="muted">{s.email}</span></td>
                  <td>{s.student_code || '—'}</td>
                  <td>{s.level || '—'}</td>
                  <td><StatusBadge status={s.status} /></td>
                  <td>
                    <Button size="sm" onClick={() => setActive(s, s.status !== 'active')}>
                      {s.status === 'active' ? 'Deactivate' : 'Reactivate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Sheet open={sheet === 'add'} onClose={() => setSheet(null)} title="Add a student">
        <AddStudent onAdded={(s) => setItems((list) => [s, ...(list || [])])} />
      </Sheet>
      <Sheet open={sheet === 'import'} onClose={() => setSheet(null)} title="Import students">
        <ImportPeople kind="students" onDone={() => load()} />
      </Sheet>
    </div>
  );
}

function AddStudent({ onAdded }) {
  const [f, setF] = useState({ full_name: '', email: '', level: '', student_code: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [created, setCreated] = useState(null);
  
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const s = await apiPost('/api/v1/students', { ...f });
      setCreated(s);
      onAdded(s);
      setF({ full_name: '', email: '', level: '', student_code: '' });
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="stack">
      {created && <OneTimeSecret value={created.temporary_password} who={created.full_name} />}
      {error && <Callout tone="danger">{error}</Callout>}
      <Input label="Full name" value={f.full_name} onChange={(e) => setF({...f, full_name: e.target.value})} />
      <Input label="Email" value={f.email} onChange={(e) => setF({...f, email: e.target.value})} />
      <Button type="submit" loading={busy}>Add student</Button>
    </form>
  );
}