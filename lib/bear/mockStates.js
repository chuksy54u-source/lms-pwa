import { computeTutorState } from './emotion.js';

// Realistic inputs for each situation. The frontend can build against MOCK_TUTOR_STATES today;
// the shape is exactly what GET /api/v1/students/:id/tutor-state returns.
export const MOCK_METRICS = {
  new: { studentId: 'demo-new', isNew: true },
  good: { studentId: 'demo-good', performanceIndex: 82, recentScores: [78, 85, 84], idleDays: 0, nextStep: 'Fractions, lesson 3' },
  worried: { studentId: 'demo-worried', performanceIndex: 52, recentScores: [60, 44, 41], idleDays: 3 },
  intense: { studentId: 'demo-intense', performanceIndex: 31, recentScores: [35, 30, 28], idleDays: 6, consecutiveFails: 3 },
};

export const MOCK_TUTOR_STATES = Object.fromEntries(
  Object.entries(MOCK_METRICS).map(([name, metrics]) => [name, computeTutorState(metrics, { date: '2026-10-02' })]),
);
