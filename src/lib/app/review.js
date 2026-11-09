import { apiGet, apiList } from '../api/client.js';

// The marking queue: every attempt with a written answer the AI could not mark (needs_review), across all
// courses the school uses. There is no single endpoint for this, so it walks courses -> quizzes -> attempts.
export async function loadReviewQueue() {
  const courses = (await apiGet('/api/v1/courses')) || [];
  const quizzes = (
    await Promise.all(
      courses.map((c) =>
        apiGet(`/api/v1/courses/${encodeURIComponent(c.id)}/assessments`)
          .then((list) => (list || []).map((a) => ({ ...a, course_title: c.title })))
          .catch(() => []),
      ),
    )
  ).flat();
  const seen = new Set();
  const unique = quizzes.filter((a) => (seen.has(a.id) ? false : seen.add(a.id)));
  const subs = (
    await Promise.all(
      unique.map((a) =>
        apiList(`/api/v1/assessments/${encodeURIComponent(a.id)}/submissions?needs_review=1&limit=100`)
          .then((res) => (res.data || []).filter((s) => s.needs_review).map((s) => ({ ...s, quiz: a })))
          .catch(() => []),
      ),
    )
  ).flat();
  const ids = new Set();
  return subs.filter((s) => (ids.has(s.id) ? false : ids.add(s.id))).sort((x, y) => String(x.submitted_at).localeCompare(String(y.submitted_at)));
}
