'use client';

import { StudentTop } from '../../../../components/app/StudentShell';
import { Card, Progress, BackLink, Badge, ListSkeleton, ErrorState, EmptyState, SectionHead, Button } from '../../../../components/ui';
import { ScoreBars } from '../../../../components/ui/charts';
import { useTenant } from '../../../../components/app/TenantProvider';
import { useStudentDashboard, useCourses } from '../../../../lib/app/student';
import useApi from '../../../../lib/app/useApi';
import { features } from '../../../../lib/app/features';
import { loadAssignments } from '../../../../lib/app/assignments';
import { gradeFor, pct, relTime } from '../../../../lib/app/format';
import { useTitle } from '../../../../lib/app/hooks';

// MY GRADES: overall average and grade (the school's own scale), each course, recent results, teacher comments.
export default function Grades() {
  useTitle('My grades');
  const { branding } = useTenant();
  const dash = useStudentDashboard();
  const courses = useCourses();
  const homework = useApi(features.fileAssignments() ? 'preview-assignments' : null, { fetcher: loadAssignments });
  const d = dash.data;
  const scale = branding.grade_scale || 'standard';
  const results = (d && d.results && d.results.results) || [];
  const graded = results.filter((r) => r.status === 'graded' && r.percent != null);
  const title = Object.fromEntries((courses.data || []).map((c) => [c.id, c.title]));

  // best score per quiz, then average per course
  const best = {};
  graded.forEach((r) => {
    if (!best[r.assessment_id] || r.percent > best[r.assessment_id].percent) best[r.assessment_id] = r;
  });
  const perCourse = {};
  Object.values(best).forEach((r) => {
    (perCourse[r.course_id] = perCourse[r.course_id] || []).push(r.percent);
  });
  const courseRows = Object.entries(perCourse).map(([id, list]) => ({ id, title: title[id] || 'Course', avg: list.reduce((a, b) => a + b, 0) / list.length, quizzes: list.length }));
  const overall = courseRows.length ? courseRows.reduce((a, c) => a + c.avg, 0) / courseRows.length : null;
  const comments = (homework.data || []).filter((a) => a.feedback);

  return (
    <>
      <StudentTop />
      <main className="app-main stack-lg" id="main">
        <BackLink href="/tasks">Tasks</BackLink>
        <h1>My grades</h1>
        {dash.loading && !d ? (
          <ListSkeleton count={3} />
        ) : dash.error && !d ? (
          <ErrorState error={dash.error} onRetry={dash.reload} />
        ) : graded.length === 0 ? (
          <EmptyState title="No grades yet" text="Take a quiz and your grades show here." action={<Button href="/tasks">Go to tasks</Button>} />
        ) : (
          <>
            <Card className="card-brand stack">
              <div className="row-between">
                <div>
                  <p className="small" style={{ opacity: 0.8 }}>Overall</p>
                  <p style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.1 }}>{gradeFor(overall, scale)}</p>
                </div>
                <p style={{ fontSize: '1.4rem', fontWeight: 700 }}>{pct(overall)}</p>
              </div>
              <Progress value={overall} label="Overall average" />
              <p className="small" style={{ opacity: 0.8 }}>
                Best score on each quiz, averaged per course. Pass mark {branding.pass_mark}%.
              </p>
            </Card>
            <div className="stack">
              {courseRows.map((c) => (
                <Card key={c.id} className="stack-sm">
                  <div className="row-between">
                    <p className="card-title">{c.title}</p>
                    <Badge tone={c.avg >= branding.pass_mark ? 'success' : 'warn'}>{gradeFor(c.avg, scale)}</Badge>
                  </div>
                  <p className="card-sub">
                    {pct(c.avg)} · {c.quizzes} quiz{c.quizzes === 1 ? '' : 'zes'}
                  </p>
                  <Progress value={c.avg} size="sm" tone={c.avg >= branding.pass_mark ? undefined : 'accent'} label={`${c.title} average`} />
                </Card>
              ))}
            </div>
            {comments.map((a) => (
              <Card key={a.id} className="stack-sm">
                <p className="card-title">💬 {a.teacher}</p>
                <p className="small">“{a.feedback}”</p>
                <p className="tiny muted">{a.title}</p>
              </Card>
            ))}
            <SectionHead title="Recent results" />
            <Card>
              <ScoreBars results={results} passMark={branding.pass_mark} />
            </Card>
            <div className="list">
              {results.map((r) => (
                <div key={r.submission_id} className="list-item">
                  <span className={`list-icon ${r.status !== 'graded' ? '' : r.passed ? 'success' : 'warn'}`}>{r.status !== 'graded' ? '⏳' : r.passed ? '✓' : '↺'}</span>
                  <div className="grow">
                    <p className="strong small">{r.assessment_title}</p>
                    <p className="tiny muted">
                      Attempt {r.attempt} · {relTime(r.submitted_at)}
                    </p>
                  </div>
                  <span className="strong">{r.status === 'graded' ? pct(r.percent) : 'Marking'}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}
