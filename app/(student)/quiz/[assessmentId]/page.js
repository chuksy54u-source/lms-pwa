'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '../../../../lib/app/nav.js';
import { useBear } from '../../../../components/bear/BearProvider';
import BearArt from '../../../../components/app/BearArt';
import { Button, Progress, ErrorState, Skeleton, Ring, Badge, Card, Textarea, Callout, BackLink, Icon, Sheet } from '../../../../components/ui';
import { useToast } from '../../../../components/app/ToastProvider';
import { useMe } from '../../../../lib/app/student';
import useApi, { clearApiCache } from '../../../../lib/app/useApi';
import { apiPost } from '../../../../lib/api/client';
import { clock, firstName, pct, friendlyError } from '../../../../lib/app/format';
import { useTitle } from '../../../../lib/app/hooks';

const KEYS = 'ABCDEFGH';

// ASSESSMENT -> QUIZ RESULT. Answers are kept on this device until handed in, so a refresh does not lose them.
export default function Quiz() {
  const { assessmentId } = useParams();
  const router = useRouter();
  const quiz = useApi(`/api/v1/assessments/${encodeURIComponent(assessmentId)}`);
  const q = quiz.data;
  useTitle(q && q.title);
  const draftKey = `bearilly:quiz:${assessmentId}`;

  const [phase, setPhase] = useState('intro'); // intro | taking | review | result
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState({});
  const [started, setStarted] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [confirmLeave, setConfirmLeave] = useState(false);

  const questions = useMemo(() => (q ? [...q.questions].sort((a, b) => a.position - b.position) : []), [q]);
  const answeredCount = questions.filter((x) => answers[x.id] !== undefined && answers[x.id] !== '').length;

  // restore a draft
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(draftKey) || 'null');
      if (saved && saved.answers) {
        setAnswers(saved.answers);
        setStarted(saved.started);
        setPhase('taking');
      }
    } catch (e) {
      /* ignore */
    }
  }, [draftKey]);
  useEffect(() => {
    if (phase !== 'taking' && phase !== 'review') return;
    try {
      sessionStorage.setItem(draftKey, JSON.stringify({ answers, started }));
    } catch (e) {
      /* ignore */
    }
  }, [answers, started, phase, draftKey]);
  useEffect(() => {
    if (phase !== 'taking' && phase !== 'review') return undefined;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const elapsed = started ? (now - started) / 1000 : 0;

  // Focus mode: the corner bear steps aside while questions are open, and comes back for the result.
  useEffect(() => {
    const focus = phase === 'taking' || phase === 'review';
    document.body.classList.toggle('on-quiz', focus);
    return () => document.body.classList.remove('on-quiz');
  }, [phase]);

  function begin() {
    setStarted(Date.now());
    setI(0);
    setAnswers({});
    setResult(null);
    setPhase('taking');
  }

  async function submit() {
    setSubmitting(true);
    setError('');
    try {
      const body = { answers: questions.map((x) => ({ question_id: x.id, answer: answers[x.id] === undefined ? (x.type === 'mcq' ? null : '') : answers[x.id] })).filter((a) => a.answer !== null) };
      const res = await apiPost(`/api/v1/assessments/${encodeURIComponent(assessmentId)}/submissions`, body);
      try {
        sessionStorage.removeItem(draftKey);
      } catch (e) {
        /* ignore */
      }
      clearApiCache('/api/v1/students/');
      clearApiCache('student-tasks');
      clearApiCache(`/api/v1/courses/`);
      setResult({ ...res, seconds: elapsed });
      setPhase('result');
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (quiz.error && !q) {
    return (
      <main className="app-main">
        <ErrorState error={quiz.error} onRetry={quiz.reload} title={quiz.error.code === 'NOT_ENROLLED' ? 'Join the course first' : 'Could not open this quiz'} />
      </main>
    );
  }
  if (!q) {
    return (
      <main className="app-main stack">
        <Skeleton height={20} width="40%" />
        <Skeleton height={40} />
        <Skeleton height={60} />
        <Skeleton height={60} />
      </main>
    );
  }

  if (phase === 'result' && result) return <Result quiz={q} questions={questions} answers={answers} result={result} onRetake={begin} />;

  if (phase === 'intro') {
    const outOfTries = q.attempts_left === 0;
    return (
      <main className="app-main stack-lg" id="main">
        <BackLink href="/tasks">Tasks</BackLink>
        <div className="result-hero">
          <BearArt className="onboard-art" emotion="adorable" pose="coach" />
          <div className="stack-sm">
            <p className="eyebrow">Quiz</p>
            <h1>{q.title}</h1>
          </div>
          <div className="result-chips">
            <Badge tone="brand">{questions.length} questions</Badge>
            <Badge tone="accent">Pass mark {q.pass_mark}%</Badge>
            <Badge>{q.max_attempts ? `${q.attempts_left ?? q.max_attempts} tries left` : 'Unlimited tries'}</Badge>
          </div>
          {q.attempts_used > 0 && <p className="muted small">You have tried this {q.attempts_used} time{q.attempts_used === 1 ? '' : 's'}.</p>}
        </div>
        {outOfTries ? (
          <Callout tone="warn" title="No tries left">
            You have used every attempt for this quiz. Ask your teacher if you need another.
          </Callout>
        ) : (
          <Button block onClick={begin} iconRight="next">
            {q.attempts_used > 0 ? 'Try again' : 'Start quiz'}
          </Button>
        )}
      </main>
    );
  }

  if (phase === 'review') {
    return (
      <main className="app-main stack-lg" id="main">
        <div className="quiz-top">
          <button type="button" className="back-link link-btn" onClick={() => setPhase('taking')}>
            <Icon name="back" size={18} /> Back to questions
          </button>
          <span className="timer">
            <Icon name="clock" size={16} /> {clock(elapsed)}
          </span>
        </div>
        <h1>Ready to hand in?</h1>
        <p className="muted">
          You answered {answeredCount} of {questions.length}. Tap a question to change it.
        </p>
        <div className="list">
          {questions.map((x, n) => {
            const a = answers[x.id];
            const has = a !== undefined && a !== '';
            return (
              <button
                key={x.id}
                type="button"
                className="list-item"
                onClick={() => {
                  setI(n);
                  setPhase('taking');
                }}
              >
                <span className="lesson-num" style={has ? { background: 'var(--brand-soft)', color: 'var(--brand-text)' } : undefined}>
                  {n + 1}
                </span>
                <span className="grow">
                  <span className="small strong" style={{ display: 'block' }}>
                    {x.prompt}
                  </span>
                  <span className="small muted">{has ? (x.type === 'mcq' ? `${KEYS[a]} · ${x.options[a]}` : String(a).slice(0, 80)) : 'Not answered'}</span>
                </span>
                {!has && <Badge tone="warn">Empty</Badge>}
              </button>
            );
          })}
        </div>
        {error && <Callout tone="danger" title="Could not hand in">{error}</Callout>}
        <Button block loading={submitting} onClick={submit} icon="check">
          Submit answers
        </Button>
      </main>
    );
  }

  // taking
  const x = questions[i];
  const last = i === questions.length - 1;
  return (
    <main className="app-main stack-lg" id="main">
      <div className="quiz-top">
        <button type="button" className="icon-btn" aria-label="Leave quiz" onClick={() => setConfirmLeave(true)}>
          <Icon name="close" />
        </button>
        <span className="muted strong small">
          Question {i + 1} / {questions.length}
        </span>
        <span className="timer" aria-label={`Time spent ${clock(elapsed)}`}>
          <Icon name="clock" size={16} /> {clock(elapsed)}
        </span>
      </div>
      <Progress value={((i + 1) / questions.length) * 100} tone="accent" label="Quiz progress" />
      <h1 className="question" id="q-prompt">
        {x.prompt}
      </h1>
      {x.type === 'mcq' ? (
        <div className="options" role="radiogroup" aria-labelledby="q-prompt">
          {x.options.map((opt, n) => (
            <button key={n} type="button" role="radio" aria-checked={answers[x.id] === n} className="option" onClick={() => setAnswers((s) => ({ ...s, [x.id]: n }))}>
              <span className="option-key">{KEYS[n]}</span>
              <span className="grow">{opt}</span>
              {answers[x.id] === n && <Icon name="check" size={20} />}
            </button>
          ))}
        </div>
      ) : (
        <Textarea label="Your answer" placeholder="Write a short answer in your own words" value={answers[x.id] || ''} onChange={(e) => setAnswers((s) => ({ ...s, [x.id]: e.target.value }))} hint={`${x.points} point${x.points === 1 ? '' : 's'} · marked against your teacher's answer`} />
      )}
      <nav className="qnav" aria-label="Jump to question">
        {questions.map((y, n) => (
          <button key={y.id} type="button" onClick={() => setI(n)} aria-current={n === i ? 'true' : undefined} data-answered={answers[y.id] !== undefined && answers[y.id] !== '' ? 'true' : 'false'} aria-label={`Question ${n + 1}`}>
            {n + 1}
          </button>
        ))}
      </nav>
      <div className="row" style={{ gap: 10 }}>
        <Button variant="outline" onClick={() => setI(i - 1)} disabled={i === 0} style={{ flex: 1 }}>
          Back
        </Button>
        <Button onClick={() => (last ? setPhase('review') : setI(i + 1))} style={{ flex: 2 }}>
          {last ? 'Review' : 'Next'}
        </Button>
      </div>
      <Sheet open={confirmLeave} onClose={() => setConfirmLeave(false)} title="Leave the quiz?">
        <div className="stack">
          <p className="muted">Your answers stay saved on this device until you come back and hand them in.</p>
          <Button block onClick={() => setConfirmLeave(false)}>Keep going</Button>
          <Button block variant="outline" onClick={() => router.push('/tasks')}>Leave for now</Button>
        </div>
      </Sheet>
    </main>
  );
}

function Result({ quiz, questions, answers, result, onRetake }) {
  const bear = useBear();
  const me = useMe();
  const [review, setReview] = useState(false);
  const spoke = useRef(false);
  const s = result.submission;
  const marks = Object.fromEntries((result.questions || []).map((m) => [m.question_id, m]));
  const pending = s.needs_review || s.status !== 'graded';
  const correct = (result.questions || []).filter((m) => (m.type === 'mcq' ? m.correct : m.points === m.max_points)).length;
  const wrong = (result.questions || []).filter((m) => !m.pending && (m.type === 'mcq' ? !m.correct : m.points < m.max_points)).length;
  const percent = s.percent ?? 0;
  const canRetake = quiz.max_attempts === null || quiz.max_attempts === undefined || s.attempt < quiz.max_attempts;
  const wrongTitles = questions.filter((x) => marks[x.id] && !marks[x.id].pending && (marks[x.id].type === 'mcq' ? !marks[x.id].correct : marks[x.id].points < marks[x.id].max_points));

  useEffect(() => {
    if (spoke.current) return;
    spoke.current = true;
    if (pending) bear.say('Your answers are in. Your teacher will mark the written ones soon.', { emotion: 'adorable', pose: 'wave' });
    else bear.sayKey(s.passed ? 'quizPassed' : 'quizFailed', undefined, s.passed ? { pose: 'wave', celebrate: true } : { emotion: 'worried', pose: 'cheeks' });
    const t = setTimeout(() => bear.refresh(), 4500); // the mood may have changed; the bear says its new mood line
    return () => clearTimeout(t);
  }, [bear, pending, s.passed]);

  return (
    <main className="app-main stack-lg" id="main">
      <div className="result-hero">
        <h1>{pending ? 'Answers handed in!' : s.passed ? `Nice work, ${firstName(me && me.full_name)}!` : 'Good try. Let us go again.'}</h1>
        <Ring value={pending ? 0 : percent} color={s.passed ? undefined : 'var(--accent)'}>
          <div>
            <p className="ring-value">{pending ? '⏳' : `${s.points_earned}/${s.points_possible}`}</p>
            <p className="small muted">{pending ? 'Being marked' : pct(percent)}</p>
          </div>
        </Ring>
        <div className="result-chips">
          {!pending && <Badge tone="success">✓ {correct} correct</Badge>}
          {!pending && <Badge tone="danger">✗ {wrong} to review</Badge>}
          <Badge tone="brand">⏱ {clock(result.seconds)}</Badge>
          {!pending && <Badge tone={s.passed ? 'success' : 'warn'}>{s.passed ? 'Passed' : `Pass mark ${quiz.pass_mark}%`}</Badge>}
        </div>
      </div>

      <Card className="card-accent stack-sm">
        <p className="card-title">✨ Bear says</p>
        <p className="small">
          {pending
            ? 'A teacher marks written answers. You will see your score in Tasks and Notifications.'
            : wrongTitles.length
              ? `Review ${wrongTitles.length === 1 ? 'the question' : `the ${wrongTitles.length} questions`} you missed, then try again. You can ask me about any of them.`
              : 'Every answer right. Ready for the next lesson?'}
        </p>
      </Card>

      {review && (
        <div className="stack">
          {questions.map((x, n) => {
            const m = marks[x.id] || {};
            const mine = answers[x.id];
            return (
              <Card key={x.id} className="stack">
                <p className="small muted strong">Question {n + 1}</p>
                <p className="strong">{x.prompt}</p>
                {x.type === 'mcq' ? (
                  <div className="options">
                    {x.options.map((opt, k) => {
                      const isRight = m.correct_index === k;
                      const isMine = mine === k;
                      return (
                        <div key={k} className={`option ${isRight ? 'correct' : isMine ? 'wrong' : ''}`} style={{ cursor: 'default', minHeight: 48 }}>
                          <span className="option-key">{KEYS[k]}</span>
                          <span className="grow">{opt}</span>
                          {isMine && <span className="tiny strong">Your answer</span>}
                        </div>
                      );
                    })}
                    {m.correct_index === undefined && <p className="tiny muted">Your teacher has hidden the correct answers for this quiz.</p>}
                  </div>
                ) : (
                  <div className="stack-sm">
                    <p className="small">
                      <span className="muted">Your answer:</span> {mine || <em>No answer</em>}
                    </p>
                    {m.pending ? <Badge tone="info">Waiting for your teacher</Badge> : <Badge tone={m.points === m.max_points ? 'success' : 'warn'}>{m.points}/{m.max_points} points</Badge>}
                    {m.feedback && <p className="small">💬 {m.feedback}</p>}
                    {m.model_answer && <p className="small muted">Model answer: {m.model_answer}</p>}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <div className="stack">
        <Button block onClick={() => setReview((r) => !r)} variant={review ? 'outline' : 'primary'}>
          {review ? 'Hide answers' : 'Review answers'}
        </Button>
        {canRetake && !pending && !s.passed && (
          <Button block variant="outline" onClick={onRetake} icon="refresh">
            Retake quiz
          </Button>
        )}
        <Button block variant="ghost" href="/tasks">
          Back to tasks
        </Button>
      </div>
    </main>
  );
}
