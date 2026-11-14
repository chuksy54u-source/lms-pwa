'use client';

import { useState } from 'react';
import { useRouter } from '../../../lib/app/nav.js';
import { StudentTop } from '../../../components/app/StudentShell';
import { Card, Icon, Progress, Chips, SearchInput, SectionHead, ListSkeleton, ErrorState, EmptyState, Button, Badge } from '../../../components/ui';
import { useToast } from '../../../components/app/ToastProvider';
import { useCourses, useStudentDashboard, progressByCourse } from '../../../lib/app/student';
import { apiPost } from '../../../lib/api/client';
import { clearApiCache } from '../../../lib/app/useApi';
import { subjectIcon, friendlyError } from '../../../lib/app/format';
import { useTitle } from '../../../lib/app/hooks';

// MY COURSES: search, filter, progress per course; other courses the school offers can be joined here.
export default function Learn() {
  useTitle('My courses');
  const router = useRouter();
  const toast = useToast();
  const courses = useCourses();
  const dash = useStudentDashboard();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [joining, setJoining] = useState(null);
  const prog = progressByCourse(dash.data);

  const all = (courses.data || []).map((c) => ({ ...c, p: prog[c.id] || { percent: 0, lessons_completed: 0, lessons_total: c.lessons } }));
  const match = (c) => !q.trim() || `${c.title} ${c.description || ''} ${c.level || ''}`.toLowerCase().includes(q.trim().toLowerCase());
  const mine = all.filter((c) => c.enrolled !== false).filter(match);
  const others = all.filter((c) => c.enrolled === false).filter(match);
  const shown = mine.filter((c) => (filter === 'done' ? c.p.percent >= 100 : filter === 'progress' ? c.p.percent < 100 : true));

  async function join(course) {
    setJoining(course.id);
    try {
      await apiPost('/api/v1/enrolments', { course_id: course.id });
      clearApiCache('/api/v1/courses');
      clearApiCache('student-tasks');
      toast(`You joined ${course.title}`, 'success');
      router.push(`/learn/${course.id}`);
    } catch (err) {
      toast(friendlyError(err), 'error');
      setJoining(null);
    }
  }

  return (
    <>
      <StudentTop />
      <main className="app-main stack-lg" id="main">
        <h1>My courses</h1>
        <SearchInput placeholder="Search courses" value={q} onChange={(e) => setQ(e.target.value)} label="Search courses" />
        <Chips
          label="Filter courses"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'All', count: mine.length },
            { value: 'progress', label: 'In progress' },
            { value: 'done', label: 'Done' },
          ]}
        />
        {dash.error && !dash.data && <ErrorState error={dash.error} onRetry={dash.reload} title="Could not load course progress" />}
        {courses.loading && !courses.data ? (
          <ListSkeleton count={3} />
        ) : courses.error && !courses.data ? (
          <ErrorState error={courses.error} onRetry={courses.reload} />
        ) : shown.length === 0 ? (
          <EmptyState
            title={q ? 'No courses match' : filter === 'done' ? 'Nothing finished yet' : 'No courses yet'}
            text={q ? 'Try another word.' : filter === 'done' ? 'Finish every lesson in a course and it shows here.' : 'Join a course below to start learning.'}
            pose="point"
          />
        ) : (
          <div className="stack">
            {shown.map((c) => (
              <Card key={c.id} href={`/learn/${c.id}`} className="stack">
                <div className="row">
                  <span className="course-emoji" aria-hidden>
                    <Icon name={subjectIcon(c.title)} size={24} />
                  </span>
                  <div className="grow">
                    <p className="card-title">{c.title}</p>
                    <p className="card-sub">
                      {c.p.percent >= 100 ? 'Completed' : `Lesson ${Math.min(c.p.lessons_completed + 1, c.p.lessons_total || c.lessons || 1)} of ${c.p.lessons_total || c.lessons}`}
                      {c.level ? ` · ${c.level}` : ''}
                    </p>
                  </div>
                  {c.p.percent >= 100 && <Badge tone="success">Done</Badge>}
                </div>
                <Progress value={c.p.percent} tone={c.p.percent >= 100 ? 'success' : undefined} label={`${c.title} progress`} />
              </Card>
            ))}
          </div>
        )}

        {others.length > 0 && (
          <section>
            <SectionHead title="More from your school" />
            <div className="stack">
              {others.map((c) => (
                <Card key={c.id} className="row">
                  <span className="course-emoji" aria-hidden>
                    <Icon name={subjectIcon(c.title)} size={24} />
                  </span>
                  <div className="grow">
                    <p className="card-title">{c.title}</p>
                    <p className="card-sub">
                      {c.lessons} lessons{c.level ? ` · ${c.level}` : ''}
                    </p>
                  </div>
                  <Button size="sm" variant="soft" loading={joining === c.id} onClick={() => join(c)}>
                    Join
                  </Button>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
