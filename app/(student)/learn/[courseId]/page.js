'use client';

import { useState } from 'react';
import { Link } from '../../../../lib/app/nav.js';
import { useParams } from 'next/navigation';
import { StudentTop } from '../../../../components/app/StudentShell';
import { Card, Progress, BackLink, Badge, ListSkeleton, ErrorState, Button, SectionHead, Icon, EmptyState } from '../../../../components/ui';
import { useToast } from '../../../../components/app/ToastProvider';
import useApi, { clearApiCache } from '../../../../lib/app/useApi';
import { useStudentDashboard, progressByCourse } from '../../../../lib/app/student';
import { apiPost } from '../../../../lib/api/client';
import { subjectEmoji, pct, friendlyError } from '../../../../lib/app/format';
import { taskState, TASK_LABEL } from '../../../../lib/app/tasks';
import { useTitle } from '../../../../lib/app/hooks';

// COURSE: units and lessons, the course's quizzes, and progress. Not enrolled yet: a Join button.
export default function Course() {
  const { courseId } = useParams();
  const id = encodeURIComponent(courseId);
  const toast = useToast();
  const course = useApi(`/api/v1/courses/${id}`);
  const units = useApi(`/api/v1/courses/${id}/units`);
  const quizzes = useApi(`/api/v1/courses/${id}/assessments`);
  const dash = useStudentDashboard();
  const [joining, setJoining] = useState(false);
  useTitle(course.data && course.data.title);

  const p = progressByCourse(dash.data)[courseId];
  const notEnrolled = units.error && units.error.code === 'NOT_ENROLLED';
  const allLessons = (units.data || []).flatMap((u) => u.lessons);
  const done = p ? p.lessons_completed : 0;
  const nextLesson = allLessons[Math.min(done, allLessons.length - 1)];

  async function join() {
    setJoining(true);
    try {
      await apiPost('/api/v1/enrolments', { course_id: courseId });
      clearApiCache();
      units.reload();
      quizzes.reload();
      toast('You joined this course', 'success');
    } catch (err) {
      toast(friendlyError(err), 'error');
    } finally {
      setJoining(false);
    }
  }

  if (course.error && !course.data) {
    return (
      <main className="app-main">
        <ErrorState error={course.error} onRetry={course.reload} />
      </main>
    );
  }
  const c = course.data;

  return (
    <>
      <StudentTop />
      <main className="app-main stack-lg" id="main">
        <BackLink href="/learn">My courses</BackLink>
        {!c ? (
          <ListSkeleton count={1} lines={3} />
        ) : (
          <div className="lesson-hero">
            <span className="course-emoji" style={{ width: 60, height: 60, fontSize: '1.8rem', background: 'var(--surface)' }} aria-hidden>
              {subjectEmoji(c.title)}
            </span>
            <div className="grow stack-sm">
              <h1 style={{ fontSize: '1.45rem' }}>{c.title}</h1>
              {c.description && <p className="muted small">{c.description}</p>}
              <div className="row wrap" style={{ gap: 6 }}>
                {c.level && <Badge tone="brand">{c.level}</Badge>}
                <Badge>{c.lessons} lessons</Badge>
              </div>
            </div>
          </div>
        )}

        {notEnrolled ? (
          <EmptyState title="Join this course to start" text="Your school offers this course. Join to open its lessons and quizzes." pose="point" action={<Button loading={joining} onClick={join}>Join course</Button>} />
        ) : (
          <>
            {dash.error && !dash.data && <ErrorState error={dash.error} onRetry={dash.reload} title="Could not load course progress" />}
            {p && (
              <Card className="stack">
                <div className="row-between">
                  <p className="card-title">Your progress</p>
                  <span className="strong">{pct(p.percent)}</span>
                </div>
                <Progress value={p.percent} tone={p.percent >= 100 ? 'success' : undefined} label="Course progress" />
                <p className="card-sub">
                  {p.lessons_completed} of {p.lessons_total} lessons finished
                </p>
                {nextLesson && (
                  <Button href={`/lesson/${nextLesson.id}`} iconRight="next">
                    {p.lessons_completed === 0 ? 'Start first lesson' : p.percent >= 100 ? 'Review lessons' : 'Continue'}
                  </Button>
                )}
              </Card>
            )}

            <section className="stack">
              <SectionHead title="Lessons" />
              {units.loading && !units.data ? (
                <ListSkeleton count={2} />
              ) : units.error && !units.data ? (
                <ErrorState error={units.error} onRetry={units.reload} />
              ) : (units.data || []).length === 0 ? (
                <EmptyState title="Lessons are on the way" text="Your teacher has not added lessons to this course yet." emotion="worried" />
              ) : (
                (units.data || []).map((u) => (
                  <div key={u.id} className="unit">
                    <p className="unit-title">{u.title}</p>
                    <div className="list">
                      {u.lessons.map((l) => {
                        const index = allLessons.findIndex((x) => x.id === l.id);
                        const isDone = index < done;
                        return (
                          <Link key={l.id} href={`/lesson/${l.id}`} className="list-item">
                            <span className="lesson-num" style={isDone ? { background: 'var(--success-soft)', color: 'var(--success)' } : undefined}>
                              {isDone ? '✓' : index + 1}
                            </span>
                            <span className="grow">{l.title}</span>
                            <Icon name="next" size={18} />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </section>

            <section className="stack">
              <SectionHead title="Quizzes" />
              {quizzes.loading && !quizzes.data ? (
                <ListSkeleton count={1} lines={1} />
              ) : (quizzes.data || []).length === 0 ? (
                <p className="muted small">No quizzes in this course yet.</p>
              ) : (
                <div className="list">
                  {(quizzes.data || []).map((a) => {
                    const s = taskState(a);
                    return (
                      <Link key={a.id} href={`/quiz/${a.id}`} className="list-item">
                        <span className="list-icon accent">📝</span>
                        <span className="grow">
                          <span className="strong">{a.title}</span>
                          <br />
                          <span className="small muted">
                            {a.questions} questions · pass mark {a.pass_mark}%{a.best_percent != null ? ` · best ${pct(a.best_percent)}` : ''}
                          </span>
                        </span>
                        <Badge tone={TASK_LABEL[s].tone}>{TASK_LABEL[s].text}</Badge>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </>
  );
}
