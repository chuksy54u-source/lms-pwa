import { apiGet } from '../api/client.js';

// The student's "Tasks": every published quiz in the courses they are enrolled in.
// Status: 'todo' (not tried yet), 'retry' (tried, not passed), 'review' (waiting for a teacher), 'done' (passed).
export async function loadStudentTasks() {
  const courses = await apiGet('/api/v1/courses');
  if (!Array.isArray(courses)) throw new Error('The server returned an invalid course list.');
  const mine = courses.filter((course) => course.enrolled === true);
  const lists = await Promise.all(
    mine.map((c) =>
      apiGet(`/api/v1/courses/${encodeURIComponent(c.id)}/assessments`)
        .then((items) => {
          if (!Array.isArray(items)) throw new Error(`The server returned an invalid assessment list for ${c.title}.`);
          return items.map((a) => ({ ...a, course_title: c.title, course_id: a.course_id || c.id }));
        }),
    ),
  );
  const seen = new Set();
  return lists.flat().filter((a) => (seen.has(a.id) ? false : seen.add(a.id))).map((a) => ({ ...a, state: taskState(a) }));
}

export function taskState(a) {
  const used = a.attempts_used || 0;
  if (a.best_percent !== null && a.best_percent !== undefined) return a.best_percent >= (a.pass_mark ?? 50) ? 'done' : 'retry';
  if (used > 0) return 'review';
  return 'todo';
}

export const TASK_LABEL = {
  todo: { text: 'Not started', tone: 'accent' },
  retry: { text: 'Try again', tone: 'warn' },
  review: { text: 'Awaiting grade', tone: 'info' },
  done: { text: 'Passed', tone: 'success' },
};
