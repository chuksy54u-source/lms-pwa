// Everything the bear says that is NOT an answer to a student's question.
// We write these on purpose: instant, free, and always on-brand.
// Rules: short, warm, plain words, no emojis (they sound odd when read aloud), never shame.
// Placeholders: {name} = the school's tutor name, {title} = a lesson title.

import { defaultTutorName } from '../app/brand.js';

const LINES = {
  welcome: ['Hello! I am {name}. Click me any time you have a question.', 'Hi there! {name} here. Ask me anything about your lessons.'],
  welcomeBack: ['Welcome back! Ready to learn something new?', 'Good to see you again. Shall we carry on?'],
  recall: ['I am back! Click me if you have a question.', 'Here I am again. What shall we do?'],
  beg: ['Please do not go!'],
  askPrompt: ['What would you like to know?', 'Go ahead. Ask me anything about this lesson.'],
  thinking: ['Let me think about that.', 'Good question. One moment.'],
  lessonStart: ['Let us begin: {title}.', 'Welcome to {title}. We will take it step by step.'],
  cantFind: ['That one is not in my notes yet. Please ask your teacher, or open the lesson and try again.'],
  askFailed: ['Sorry, I could not answer that just now. Please try again in a moment.'],
  busy: ['I am a little busy right now. Please ask me again in a minute.'],
  slowDown: ['You are asking very fast. Let us take a breath and try again in a minute.'],
  distress: ['I am sorry you are going through this. Please tell a teacher, a parent or another adult you trust right now. You do not have to face it alone.'],
  expired: ['Your school subscription has ended, so I cannot help right now. Please tell your school admin.'],
  quizPassed: ['Well done! You passed. I am proud of you.', 'Great work! You are getting the hang of this.'],
  quizFailed: ['That was a hard one, and that is okay. Let us look at it again together.', 'Not this time, but you can try again. I will help you.'],
  lessonDone: ['Lesson complete. Nice job!', 'You finished the lesson. Well done!'],
  certificate: ['You earned a certificate. Congratulations!'],
  slotsAlmostFull: ['Your school is almost out of student slots. You can buy more in Billing.'],
  slotsFull: ['All student slots are in use. Buy more slots to add new students.'],
  landingHero: ['Meet Bearilly, your friendly AI tutor. I teach every subject like a real teacher, and I never get tired.'],
  landingWhat: ['I explain each lesson in simple words, answer your questions, and cheer you on when you do well.'],
  landingLessons: ['Every lesson starts with my explanation. Stuck on something? Just click me and ask.'],
  showcaseAdorable: ['Great job today! You finished your lesson. Shall we try the next one?'],
  showcaseWorried: ['That last test was tricky, and that is okay. Let us go through it together.'],
  showcaseIntense: ['You have been away for a while. Give me ten focused minutes today and you are back on track.'],
};

const DEFAULT_PARAMS = { name: defaultTutorName(), title: 'this lesson' };

export const LINE_KEYS = Object.keys(LINES);

// line('welcome', { name: 'Ornate AI Tutor' }) -> one of the variants, with the placeholders filled in.
// `random` is only a parameter so tests can pick a variant on purpose.
export function line(key, params = {}, random = Math.random) {
  const list = LINES[key];
  if (!list) return '';
  const text = list[Math.floor(random() * list.length) % list.length];
  const values = { ...DEFAULT_PARAMS, ...params };
  return text.replace(/\{(\w+)\}/g, (match, k) => (values[k] === undefined || values[k] === null ? match : String(values[k])));
}
