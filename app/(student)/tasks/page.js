'use client';

import { useEffect, useState } from 'react';
import { Link } from '../../../lib/app/nav.js';
import { StudentTop } from '../../../components/app/StudentShell';
import { Card, Badge, Chips, ListSkeleton, ErrorState, EmptyState, Button, SectionHead, Icon } from '../../../components/ui';
import { useTenant } from '../../../components/app/TenantProvider';
import { useStudentTasks } from '../../../lib/app/student';
import useApi from '../../../lib/app/useApi';
import { TASK_LABEL } from '../../../lib/app/tasks';
import { features } from '../../../lib/app/features';
import { loadAssignments } from '../../../lib/app/assignments';
import { pct, relTime } from '../../../lib/app/format';
import { useTitle, useQueryParam } from '../../../lib/app/hooks';

// TASKS: quizzes from every enrolled course (real API), grouped Due / Submitted / Graded.
// Homework uploads appear too when the preview flag is on (no backend yet).
export default function Tasks() {
  useTitle('Tasks');
  const tabParam = useQueryParam('tab');
  const [tab, setTab] = useState('due');
  useEffect(() => {
    if (tabParam) setTab(tabParam === 'review' ? 'submitted' : tabParam);
  }, [tabParam]);
  const { tutor } = useTenant();
  const tasks = useStudentTasks();
  const homework = useApi(features.fileAssignments() ? 'preview-assignments' : null, { fetcher: loadAssignments });

  const quizzes = tasks.data || [];
  const hw = homework.data || [];
  const groups = {
    due: [...hw.filter((a) => a.state === 'due').map((a) => ({ kind: 'hw', ...a })), ...quizzes.filter((t) => t.state === 'todo' || t.state === 'retry').map((t) => ({ kind: 'quiz', ...t }))],
    submitted: [...hw.filter((a) => a.state === 'submitted').map((a) => ({ kind: 'hw', ...a })), ...quizzes.filter((t) => t.state === 'review').map((t) => ({ kind: 'quiz', ...t }))],
    graded: [...hw.filter((a) => a.state === 'graded').map((a) => ({ kind: 'hw', ...a })), ...quizzes.filter((t) => t.state === 'done').map((t) => ({ kind: 'quiz', ...t }))],
  };
  const list = groups[tab] || [];

  return (
    <>
      <StudentTop right={<Link href="/tasks/grades" className="btn btn-soft btn-sm">My grades</Link>} />
      <main className="app-main stack-lg" id="main">
        <h1>Tasks</h1>
        <Chips
          label="Show tasks"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'due', label: 'Due', count: groups.due.length },
            { value: 'submitted', label: 'Submitted', count: groups.submitted.length },
            { value: 'graded', label: 'Graded', count: groups.graded.length },
          ]}
        />
        {tasks.loading && !tasks.data ? (
          <ListSkeleton count={3} />
        ) : tasks.error && !tasks.data ? (
          <ErrorState error={tasks.error} onRetry={tasks.reload} />
        ) : list.length === 0 ? (
          <EmptyState
            title={tab === 'due' ? 'All caught up!' : tab === 'submitted' ? 'Nothing waiting' : 'No grades yet'}
            text={tab === 'due' ? `No tasks due. Ask ${(tutor && tutor.name) || 'the bear'} to quiz you.` : tab === 'submitted' ? 'Work waiting for your teacher shows here.' : 'Finished quizzes and homework show here.'}
            action={tab === 'due' ? <Button href="/bear?q=Quiz%20me%20on%20my%20last%20lesson" variant="soft">Quiz me</Button> : null}
          />
        ) : (
          <div className="stack">
            {list.map((t) => (t.kind === 'hw' ? <HomeworkCard key={t.id} a={t} /> : <QuizCard key={t.id} t={t} />))}
          </div>
        )}
        {features.fileAssignments() && hw.length > 0 && (
          <p className="tiny muted center">Homework uploads are a preview with sample data until the backend adds them.</p>
        )}
      </main>
    </>
  );
}

function QuizCard({ t }) {
  const label = TASK_LABEL[t.state];
  return (
    <Card href={`/quiz/${t.id}`} className="stack-sm">
      <div className="row-between">
        <p className="card-title">{t.title}</p>
        <Icon name="next" size={18} />
      </div>
      <p className="card-sub">
        Quiz · {t.questions} questions · {t.course_title}
      </p>
      <div className="row" style={{ gap: 6 }}>
        <Badge tone={label.tone}>{t.state === 'done' ? pct(t.best_percent) : label.text}</Badge>
        {t.state === 'retry' && <Badge>Best {pct(t.best_percent)}</Badge>}
      </div>
    </Card>
  );
}

function HomeworkCard({ a }) {
  const dueSoon = a.state === 'due' && new Date(a.due_at) - Date.now() < 2 * 86400000;
  return (
    <Card href={`/tasks/assignment/${a.id}`} className="stack-sm">
      <div className="row-between">
        <p className="card-title">{a.title}</p>
        <Icon name="next" size={18} />
      </div>
      <p className="card-sub">
        {a.state === 'due' ? `Due ${new Date(a.due_at).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}` : a.state === 'submitted' ? `Submitted ${relTime(a.submitted_at)}` : 'Graded'} · {a.points} pts
      </p>
      <div className="row" style={{ gap: 6 }}>
        {a.state === 'due' && <Badge tone={dueSoon ? 'danger' : 'accent'}>{dueSoon ? 'Due soon' : 'Not started'}</Badge>}
        {a.state === 'submitted' && <Badge tone="info">Awaiting grade</Badge>}
        {a.state === 'graded' && <Badge tone="success">{Math.round((a.score / a.points) * 100)}%</Badge>}
        <Badge><Icon name="paperclip" size={14} /> Homework</Badge>
      </div>
    </Card>
  );
}
