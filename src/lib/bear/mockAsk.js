import { MOCK_FAQ, MOCK_LESSON } from './mockLesson.js';
import { line } from './lines.js';

// Local fallback for the real Groq-backed tutor, using only the supplied lesson notes.
// It behaves the way the real answer must: answer from the notes, or kindly say "that is not in my notes".
export function mockAnswer(question, lesson = MOCK_LESSON) {
  const q = String(question || '').toLowerCase();
  const hit = MOCK_FAQ.find((f) => f.keywords.some((k) => q.includes(k)));
  const ref = { id: lesson.id, title: lesson.title };
  if (hit) return { answer: hit.answer, emotion: 'adorable', pose: 'point', grounded: true, lesson: ref };
  return { answer: line('cantFind'), emotion: 'worried', pose: 'cheeks', grounded: false, lesson: ref };
}
