'use client';

import { useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { StudentTop } from '../../../../../components/app/StudentShell';
import { Button, Input, Textarea, BackLink, Card, Callout, Badge, Icon, ListSkeleton, ErrorState } from '../../../../../components/ui';
import useApi from '../../../../../lib/app/useApi';
import { loadAssignment, MAX_UPLOAD_MB, UPLOAD_TYPES } from '../../../../../lib/app/assignments';
import { features } from '../../../../../lib/app/features';
import { EmptyState } from '../../../../../components/ui';
import { useTenant } from '../../../../../components/app/TenantProvider';
import { useBear } from '../../../../../components/bear/BearProvider';
import { dateTime } from '../../../../../lib/app/format';
import { useTitle } from '../../../../../lib/app/hooks';

// SUBMISSION -> SUBMITTED (preview: no backend yet, nothing is uploaded).
export default function Assignment() {
  const { id } = useParams();
  const enabled = features.fileAssignments();
  const a = useApi(enabled ? `preview-assignment-${id}` : null, { fetcher: () => loadAssignment(id) });
  const { tutor } = useTenant();
  const bear = useBear();
  const fileRef = useRef(null);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [drag, setDrag] = useState(false);
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState(null);
  useTitle(a.data && a.data.title);

  function pick(f) {
    if (!f) return;
    if (f.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setFile(null);
      setFileError(`File is over ${MAX_UPLOAD_MB} MB. Choose a smaller file.`);
      return;
    }
    if (!UPLOAD_TYPES.includes(f.type)) {
      setFile(null);
      setFileError('Choose a PDF, Word document, or a photo (PNG or JPEG).');
      return;
    }
    setFileError('');
    setFile(f);
  }

  const notesError = notes.trim().length > 0 && notes.trim().length < 20 ? 'Please add at least 20 characters' : '';

  async function submit(e) {
    e.preventDefault();
    setTouched(true);
    if (!file || notesError || !title.trim()) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 900));
    setReceipt({ at: new Date().toISOString(), ref: `#BR-${Math.floor(1000 + Math.random() * 9000)}` });
    bear.say('Submitted! Ask me for feedback on your next draft any time.', { pose: 'wave', celebrate: true });
    setBusy(false);
  }

  if (!enabled) return <main className="app-main"><EmptyState title="Homework uploads are coming soon" text="Your school can set homework here once this feature is switched on." action={<Button href="/tasks">Back to tasks</Button>} /></main>;
  if (a.error) return <main className="app-main"><ErrorState error={a.error} onRetry={a.reload} /></main>;
  if (!a.data) return <main className="app-main"><ListSkeleton count={2} /></main>;
  const x = a.data;

  if (receipt) {
    return (
      <main className="app-main stack-lg" id="main">
        <div className="result-hero">
          <span className="confetti" aria-hidden><Icon name="party" size={44} /></span>
          <h1>Submitted!</h1>
          <p className="muted">Your teacher has been notified.</p>
        </div>
        <Card className="stack-sm">
          <p className="card-title">Receipt</p>
          <p className="small">{x.title}</p>
          <p className="small muted">
            {file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB
          </p>
          <p className="small muted">
            {dateTime(receipt.at)} · {receipt.ref}
          </p>
        </Card>
        <Card className="card-accent stack-sm">
          <p className="card-title"><Icon name="sparkle" size={16} style={{ verticalAlign: '-2px', marginRight: 6 }} />{(tutor && tutor.name) || 'Bear'} tip</p>
          <p className="small">Ask for feedback on your next draft any time.</p>
        </Card>
        <Callout tone="info" title="Preview">Homework upload is not connected to the backend yet, so nothing was sent.</Callout>
        <Button block href="/tasks">Back to tasks</Button>
      </main>
    );
  }

  const readOnly = x.state !== 'due';
  return (
    <>
      <StudentTop />
      <main className="app-main stack-lg" id="main">
        <BackLink href="/tasks">Tasks</BackLink>
        <div className="stack-sm">
          <h1>{x.title}</h1>
          <p className="muted">
            {x.state === 'due' ? `Due ${dateTime(x.due_at)}` : x.state === 'submitted' ? `Submitted ${dateTime(x.submitted_at)}` : 'Graded'} · {x.points} pts · {x.course_title}
          </p>
        </div>
        <Card className="stack-sm">
          <p className="card-title">What to do</p>
          <p className="small">{x.brief}</p>
        </Card>
        {x.state === 'graded' && (
          <Card className="stack-sm">
            <div className="row-between">
              <p className="card-title"><Icon name="chat" size={16} style={{ verticalAlign: '-2px', marginRight: 6 }} />{x.teacher}</p>
              <Badge tone="success">
                {x.score}/{x.points}
              </Badge>
            </div>
            <p className="small">“{x.feedback}”</p>
          </Card>
        )}
        {x.state === 'submitted' && <Callout tone="info" title="Awaiting grade">Your teacher will mark this soon.</Callout>}
        {!readOnly && (
          <form className="stack" onSubmit={submit} noValidate>
            <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Photosynthesis rate experiment" error={touched && !title.trim() ? 'Give your work a title' : ''} />
            <Textarea label="Notes to teacher" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything your teacher should know" error={notesError} hint="Optional" />
            <div className="field">
              <span className="field-label">Attachment</span>
              <div
                className="dropzone"
                data-drag={drag ? 'true' : 'false'}
                role="button"
                tabIndex={0}
                onClick={() => fileRef.current && fileRef.current.click()}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileRef.current && fileRef.current.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDrag(true);
                }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDrag(false);
                  pick(e.dataTransfer.files[0]);
                }}
              >
                <Icon name={file ? 'file' : 'upload'} size={26} />
                <span className="strong">{file ? file.name : 'Tap to choose a file'}</span>
                <span className="tiny muted">{file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : `PDF, DOCX or photo · up to ${MAX_UPLOAD_MB} MB`}</span>
              </div>
              <input ref={fileRef} type="file" hidden accept=".pdf,.docx,image/png,image/jpeg" onChange={(e) => pick(e.target.files[0])} />
              {fileError && (
                <Callout tone="danger" icon="warning" title="Upload failed">
                  {fileError}
                </Callout>
              )}
              {touched && !file && !fileError && <p className="field-error">Attach your work</p>}
            </div>
            <Button type="submit" block loading={busy}>
              Submit assignment
            </Button>
            <p className="tiny muted center">Preview: homework upload is not connected to the backend yet.</p>
          </form>
        )}
      </main>
    </>
  );
}
