'use client';

import { useMemo, useState } from 'react';
import { Button, Badge, Callout, Textarea, Progress } from '../ui';
import { apiPost } from '../../lib/api/client';
import { friendlyError } from '../../lib/app/format';
import { csvToStudents, toCsv, downloadText } from '../../lib/app/csv';

// CSV import for students or teachers (roadmap Phase 1 / Appendix A: POST /students/import, POST /teachers/import).
const IMPORT_CHUNK = 50; // the API takes at most 50 people per request (decision D19)

export default function ImportPeople({ kind = 'students', onDone }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(0);
  const [result, setResult] = useState(null);
  const parsed = useMemo(() => (text.trim() ? csvToStudents(text) : null), [text]);

  async function run() {
    const rows = parsed.rows;
    setBusy(true);
    setDone(0);
    const created = [];
    const failed = [];
    for (let i = 0; i < rows.length; i += IMPORT_CHUNK) {
      const chunk = rows.slice(i, i + IMPORT_CHUNK);
      try {
        const out = await apiPost(`/api/v1/${kind}/import`, { rows: chunk });
        created.push(...out.created);
        failed.push(...out.failed.map((f) => ({ ...f, row: f.row + i, email: chunk[f.row - 1] && chunk[f.row - 1].email })));
      } catch (err) {
        chunk.forEach((r, k) => failed.push({ row: i + k + 1, email: r.email, message: friendlyError(err) }));
      }
      setDone(Math.min(i + IMPORT_CHUNK, rows.length));
    }
    setResult({ created, failed });
    setBusy(false);
    onDone();
  }

  if (result) {
    return (
      <div className="stack">
        <Callout tone={result.failed.length ? 'warn' : 'success'} title="Import finished">
          {result.created.length} added · {result.failed.length} not added
        </Callout>
        {result.created.length > 0 && (
          <Callout tone="warn" title="Temporary passwords — download them now">
            <p className="small">These are shown only once. Hand them out privately; each person chooses their own at first sign-in.</p>
            <Button
              size="sm"
              icon="download"
              style={{ marginTop: 8 }}
              onClick={() =>
                downloadText(
                  `new-${kind}-passwords.csv`,
                  toCsv(result.created, [
                    { key: 'full_name', label: 'Name' },
                    { key: 'email', label: 'Email' },
                    ...(kind === 'students' ? [{ key: 'student_code', label: 'Student code' }] : []),
                    { key: 'temporary_password', label: 'Temporary password' },
                  ]),
                )
              }
            >
              Download passwords (CSV)
            </Button>
          </Callout>
        )}
        {result.failed.length > 0 && (
          <div className="list">
            {result.failed.map((f) => (
              <div key={`${f.row}-${f.email}`} className="list-item small">
                <Badge tone="danger">Row {f.row}</Badge>
                <span className="grow">
                  {f.email || ''} — {f.message}
                </span>
              </div>
            ))}
          </div>
        )}
        <Button variant="outline" onClick={() => { setResult(null); setText(''); }}>
          Import more
        </Button>
      </div>
    );
  }

  return (
    <div className="stack">
      <p className="small muted">
        First row is the header. Columns: <b>full_name</b>, <b>email</b>, and optionally {kind === 'students' ? <><b>level</b>, <b>phone</b>, <b>student_code</b></> : <b>phone</b>}. Big files are sent 50 at a time.
      </p>
      <label className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start' }}>
        Choose a .csv file
        <input type="file" accept=".csv,text/csv" hidden onChange={async (e) => e.target.files[0] && setText(await e.target.files[0].text())} />
      </label>
      <Textarea label="…or paste it here" rows={6} placeholder={kind === 'students' ? 'full_name,email,level\nKemi Ade,kemi@example.com,JSS1' : 'full_name,email\nGrace Rivera,grace@example.com'} value={text} onChange={(e) => setText(e.target.value)} style={{ fontFamily: 'ui-monospace, monospace', fontSize: '.85rem' }} />
      {parsed && !parsed.hasRequired && <Callout tone="danger" title="Missing columns">The header needs full_name and email.</Callout>}
      {parsed && parsed.hasRequired && (
        <Callout tone="info" title={`${parsed.rows.length} ${kind} found`}>
          {parsed.unknown.length > 0 && <span className="small">Ignored columns: {parsed.unknown.join(', ')}. </span>}
          Each one gets a login and a temporary password.
        </Callout>
      )}
      {busy && <Progress value={(done / parsed.rows.length) * 100} label="Import progress" />}
      <Button block loading={busy} disabled={!parsed || !parsed.hasRequired || parsed.rows.length === 0} onClick={run}>
        {busy ? `Importing ${done} of ${parsed.rows.length}…` : `Import ${parsed && parsed.hasRequired ? parsed.rows.length : ''} ${kind}`}
      </Button>
    </div>
  );
}
