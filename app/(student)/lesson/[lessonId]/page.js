'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '../../../../lib/app/nav.js';
import { StudentTop } from '../../../../components/app/StudentShell';
import { useBear } from '../../../../components/bear/BearProvider';
import { Button, BackLink, Progress, ErrorState, Skeleton, Card, Icon } from '../../../../components/ui';
import { useToast } from '../../../../components/app/ToastProvider';
import { useTenant } from '../../../../components/app/TenantProvider';
import useApi, { clearApiCache } from '../../../../lib/app/useApi';
import { apiPost } from '../../../../lib/api/client';
import { subjectIcon, friendlyError } from '../../../../lib/app/format';
import { useTitle } from '../../../../lib/app/hooks';

// LESSON: the bear reads the lesson's ready-made explanation aloud, the student reads the notes,
// then marks it done and moves on. "Summarise" and "Ask" go to the bear (Gemini, answering from these notes only).
export default function Lesson() {
  const { lessonId } = useParams();
  const router = useRouter();
  const bear = useBear();
  const toast = useToast();
  const { tutor } = useTenant();
  const lesson = useApi(`/api/v1/lessons/${encodeURIComponent(lessonId)}`);
  const l = lesson.data;
  const units = useApi(l ? `/api/v1/courses/${encodeURIComponent(l.course_id)}/units` : null);
  const course = useApi(l ? `/api/v1/courses/${encodeURIComponent(l.course_id)}` : null);
  const [finishing, setFinishing] = useState(false);
  const [summarising, setSummarising] = useState(false);
  const opened = useRef(null);
  useTitle(l && l.title);

  // The bear explains the lesson once per visit, and we record that the lesson was opened.
  useEffect(() => {
    if (!l || opened.current === l.id) return;
    opened.current = l.id;
    bear.explainLesson(l);
    apiPost('/api/v1/progress/events', { kind: 'lesson_opened', lesson_id: l.id }).catch(() => {});
    return () => bear.stopPointing();
  }, [l, bear]);

  const flat = (units.data || []).flatMap((u) => u.lessons.map((x) => ({ ...x, unit: u.title })));
  const index = flat.findIndex((x) => x.id === lessonId);
  const next = index >= 0 ? flat[index + 1] : null;
  const prev = index > 0 ? flat[index - 1] : null;
  const here = index >= 0 ? flat[index] : null;
  const name = (tutor && tutor.name) || 'Bear';

  async function finish() {
    setFinishing(true);
    try {
      await apiPost('/api/v1/progress/events', { kind: 'lesson_completed', lesson_id: lessonId });
      clearApiCache('/api/v1/students/');
      bear.sayKey('lessonDone', undefined, { pose: 'wave', celebrate: !next });
      if (next) router.push(`/lesson/${next.id}`);
      else {
        toast('Course lessons complete! Try the quiz next.', 'success');
        router.push(`/learn/${l.course_id}`);
      }
    } catch (err) {
      toast(friendlyError(err), 'error');
    } finally {
      setFinishing(false);
    }
  }

  async function summarise() {
    setSummarising(true);
    bear.setContext({ courseId: l.course_id, lessonId: l.id, lessonTitle: l.title });
    await bear.ask('Summarise this lesson in three short points.');
    setSummarising(false);
  }

  if (lesson.error && !l) {
    return (
      <main className="app-main">
        <ErrorState error={lesson.error} onRetry={lesson.reload} title={lesson.error.code === 'NOT_ENROLLED' ? 'Join the course first' : 'Could not open this lesson'} />
      </main>
    );
  }

  return (
    <>
      <StudentTop />
      <main className="app-main stack-lg" id="main">
        <BackLink href={l ? `/learn/${l.course_id}` : '/learn'}>
          {course.data ? course.data.title.split(':')[0] : 'Course'}
          {index >= 0 ? ` · Lesson ${index + 1}` : ''}
        </BackLink>
        {!l ? (
          <div className="stack">
            <Skeleton height={34} width="70%" />
            <Skeleton height={10} />
            <Skeleton height={120} />
          </div>
        ) : (
          <>
            <div className="stack">
              <h1 id="lesson-title">{l.title}</h1>
              {flat.length > 0 && <Progress value={((index + 1) / flat.length) * 100} label="Position in course" size="sm" />}
              {here && <p className="small muted">{here.unit}</p>}
            </div>

            <div className="lesson-hero">
              <span className="lesson-hero-mark" aria-hidden>
                <Icon name={subjectIcon(course.data ? course.data.title : l.title)} size={30} />
              </span>
              <div className="grow">
                <p className="strong">{name} explains</p>
                <p className="small muted">{l.explanation ? 'Listen to the bear, then read the notes below.' : 'Read the notes below. Tap the bear any time to ask.'}</p>
              </div>
              <Button size="sm" variant="outline" icon="sound" onClick={() => bear.explainLesson(l)} aria-label="Play the explanation again">
                Replay
              </Button>
            </div>

            <article className="lesson-notes stack">
              {l.notes ? (
                <div className="lesson-rich-content" dangerouslySetInnerHTML={{ __html: l.notes }} />
              ) : (
                <p className="muted">This lesson has no notes yet.</p>
              )}
            </article>

            <div className="grid-2">
              <Button variant="outline" icon="sparkle" loading={summarising} onClick={summarise}>
                Summarise with {name}
              </Button>
              <Button variant="outline" icon="chat" onClick={() => { bear.setContext({ courseId: l.course_id, lessonId: l.id, lessonTitle: l.title }); bear.openAsk(); }}>
                Ask about this lesson
              </Button>
            </div>

            <div className="lesson-nav no-print">
              {prev && (
                <Button variant="outline" href={`/lesson/${prev.id}`} aria-label="Previous lesson" style={{ width: 52, padding: 0 }}>
                  <Icon name="back" />
                </Button>
              )}
              <Button block loading={finishing} onClick={finish} iconRight={next ? 'next' : 'check'}>
                {next ? 'Done · next lesson' : 'Finish course lessons'}
              </Button>
            </div>
          </>
        )}
      </main>
    </>
  );
}
