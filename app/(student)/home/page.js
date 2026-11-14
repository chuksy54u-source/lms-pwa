'use client';

import { Link } from '../../../lib/app/nav.js';
import { StudentTop } from '../../../components/app/StudentShell';
import BearArt from '../../../components/app/BearArt';
import { Card, Progress, Badge, Icon, SectionHead, ListSkeleton, ErrorState, EmptyState, Button, Stat, CardSkeleton } from '../../../components/ui';
import { ScoreBars } from '../../../components/ui/charts';
import { useTenant } from '../../../components/app/TenantProvider';
import { useMe, useStudentDashboard, useCourses, useStudentTasks, progressByCourse } from '../../../lib/app/student';
import useNotifications from '../../../lib/app/useNotifications';
import { firstName, greeting, pct, subjectIcon } from '../../../lib/app/format';
import { TASK_LABEL } from '../../../lib/app/tasks';
import { useTitle } from '../../../lib/app/hooks';

const MOOD_CHIP = {
  adorable: { icon: 'flame', text: 'On a roll', tone: 'success' },
  worried: { icon: 'sprout', text: 'Let us catch up', tone: 'warn' },
  intense: { icon: 'timer', text: 'Focus time', tone: 'danger' },
};

const topic = (title) => String(title || '').split(':').pop().trim();

// STUDENT DASHBOARD
export default function Home() {
  useTitle('Home');
  const me = useMe();
  const { tutor, branding } = useTenant();
  const dash = useStudentDashboard();
  const courses = useCourses();
  const tasks = useStudentTasks();
  const { unread } = useNotifications();
  const d = dash.data;
  const mood = d && d.mood ? MOOD_CHIP[d.mood.emotion] : null;
  const prog = progressByCourse(d);
  const mine = (courses.data || []).filter((c) => c.enrolled !== false);
  const current = mine
    .map((c) => ({ ...c, p: prog[c.id] || { percent: 0, lessons_completed: 0, lessons_total: c.lessons } }))
    .sort((a, b) => (a.p.percent >= 100) - (b.p.percent >= 100) || b.p.percent - a.p.percent)[0];
  const due = (tasks.data || []).filter((t) => t.state === 'todo' || t.state === 'retry').slice(0, 3);
  const tutorName = (tutor && tutor.name) || 'Bear';
  const prompt = current ? `Explain ${topic(current.title)} simply` : 'What should I learn first?';

  return (
    <>
      <StudentTop
        right={
          <Link href="/notifications" className="icon-btn" aria-label={unread ? `Notifications, ${unread} new` : 'Notifications'} style={{ position: 'relative' }}>
            <Icon name="bell" />
            {unread > 0 && <span className="tab-dot" style={{ top: 8, right: 8 }} />}
          </Link>
        }
      />
      <main className="app-main" id="main">
        <div className="hello">
          <p className="hello-sub">{greeting()},</p>
          <div className="hello-name">
            <h1>{firstName(me && me.full_name)}<Icon name="wave" size={26} style={{ verticalAlign: '-3px', marginLeft: 10 }} /></h1>
            {mood && <Badge tone={mood.tone}><Icon name={mood.icon} size={14} />{mood.text}</Badge>}
          </div>
        </div>

        {courses.loading && !courses.data ? (
          <CardSkeleton />
        ) : courses.error && !courses.data ? (
          <ErrorState error={courses.error} onRetry={courses.reload} />
        ) : current ? (
          <Card href={`/learn/${current.id}`} className="card-brand continue-card stack">
            <p className="small" style={{ opacity: 0.8 }}>Continue learning</p>
            <p className="card-title" style={{ fontSize: '1.15rem' }}>
              <Icon name={subjectIcon(current.title)} size={20} style={{ verticalAlign: '-4px', marginRight: 8 }} />{current.title}
            </p>
            <Progress value={current.p.percent} label={`${current.title} progress`} />
            <p className="small" style={{ opacity: 0.85 }}>
              {current.p.lessons_completed} of {current.p.lessons_total || current.lessons} lessons · {pct(current.p.percent)}
            </p>
          </Card>
        ) : (
          <EmptyState title="No courses yet" text="Pick a course your school offers to start learning." action={<Button href="/learn">Browse courses</Button>} />
        )}

        <SectionHead title="Due soon" action={<Link href="/tasks" className="small strong">See all</Link>} />
        {tasks.loading && !tasks.data ? (
          <ListSkeleton count={2} lines={1} />
        ) : due.length === 0 ? (
          <Card className="row">
            <span className="list-icon success"><Icon name="check" size={20} /></span>
            <div>
              <p className="card-title">All caught up!</p>
              <p className="card-sub">No quizzes waiting. Ask {tutorName} to quiz you.</p>
            </div>
          </Card>
        ) : (
          <div className="stack">
            {due.map((t) => (
              <Card key={t.id} href={`/quiz/${t.id}`} className="row">
                <span className="list-icon accent"><Icon name="note" size={20} /></span>
                <div className="grow">
                  <p className="card-title truncate">{t.title}</p>
                  <p className="card-sub truncate">
                    Quiz · {t.questions} questions · {t.course_title}
                  </p>
                </div>
                <Badge tone={TASK_LABEL[t.state].tone}>{TASK_LABEL[t.state].text}</Badge>
              </Card>
            ))}
          </div>
        )}

        <SectionHead title={`Ask ${tutorName}`} />
        <Card href={`/bear?q=${encodeURIComponent(prompt)}`} className="ask-card card-accent">
          <BearArt className="bear-mini" size="head" />
          <div className="grow">
            <p className="card-title" style={{ color: 'var(--accent-ink)' }}><Icon name="sparkle" size={16} style={{ verticalAlign: '-2px', marginRight: 6 }} />Ask anything</p>
            <p className="card-sub">“{prompt}”</p>
          </div>
          <Icon name="next" />
        </Card>

        <Card href="/play" className="row" style={{ marginTop: 14 }}>
          <span className="course-emoji" aria-hidden>
            <Icon name="dice" size={24} />
          </span>
          <div className="grow">
            <p className="card-title">Playground</p>
            <p className="card-sub">Chess, Scrabble, Ludo, Ayo and more. Play {tutorName} or a classmate.</p>
          </div>
          <Icon name="next" />
        </Card>

        <SectionHead title="Your progress" action={<Link href="/tasks/grades" className="small strong">Grades</Link>} />
        {dash.loading && !d ? (
          <CardSkeleton lines={3} />
        ) : d ? (
          <div className="stack">
            <div className="grid-stats">
              <Stat label="Course progress" value={pct(d.progress && d.progress.overall_percent)} />
              <Stat label="Average score" value={pct(d.results && d.results.summary && d.results.summary.average_percent)} />
              <Stat label="Certificates" value={(d.certificates || []).length} foot={(d.certificates || []).length ? <Link href="/me/certificates">View</Link> : 'Finish a course'} />
            </div>
            <Card>
              <p className="card-title" style={{ marginBottom: 12 }}>Recent scores</p>
              <ScoreBars results={(d.results && d.results.results) || []} passMark={branding.pass_mark} />
            </Card>
          </div>
        ) : dash.error ? (
          <ErrorState error={dash.error} onRetry={dash.reload} />
        ) : null}
      </main>
    </>
  );
}
