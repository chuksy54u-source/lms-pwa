'use client';

import useApi from './useApi';
import { useSession } from '../../components/app/SessionProvider';
import { loadStudentTasks } from './tasks';

// Shared data for the student screens. Each call is cached by useApi, so tabs feel instant.
export function useMe() {
  const { me } = useSession();
  return me;
}

export function useStudentDashboard() {
  const me = useMe();
  return useApi(me ? `/api/v1/students/${encodeURIComponent(me.id)}/dashboard` : null);
}

export function useCourses() {
  return useApi('/api/v1/courses');
}

export function useStudentTasks() {
  return useApi('student-tasks', { fetcher: () => loadStudentTasks() });
}

// course_id -> { percent, lessons_completed, lessons_total } from the dashboard's progress.
export function progressByCourse(dashboard) {
  const list = (dashboard && dashboard.progress && dashboard.progress.courses) || [];
  return Object.fromEntries(list.map((c) => [c.course_id, c]));
}
