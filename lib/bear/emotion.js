// The emotion engine: turns a student's recent performance into the bear's state.
// Pure and framework-free, so it runs the same in a Next.js route, a Supabase edge function or a unit test.
//
//   computeTutorState(metrics, guard) -> { emotion, intensity, pose, reasons, say }
//
// metrics  (what you can read from Supabase)
//   studentId          string, only used to pick a stable message variant
//   isNew              true for a brand-new student (nothing graded yet)
//   performanceIndex   0 to 100. If missing it is the average of the last 5 recentScores
//   recentScores       percentages, oldest first
//   idleDays           whole days since the student last did anything
//   consecutiveFails   failed assessments in a row
//   nextStep           short name of the next lesson, for example "Fractions, lesson 3"
// guard    (wellbeing rules, usually from the school's settings and today's history)
//   maxMood                    'adorable' | 'worried' | 'intense'  strongest mood the school allows (default 'intense')
//   intenseShownToday          true once an Intense session has already happened today
//   taskFinishedSinceIntense   true as soon as the student finishes any task
//   date                       'YYYY-MM-DD', makes message variants stable per day
//   thresholds                 override any of THRESHOLDS

export const MOODS = ['adorable', 'worried', 'intense']; // 'pleading' is interface-only (first dismiss tap)
export const THRESHOLDS = {
  good: 65, // index at or above this = Adorable
  struggling: 40, // index under this = seriously slipping
  lowScore: 50, // a score under this counts as a "low score"
  worriedIdleDays: 3,
  intenseIdleDays: 5,
  intenseFails: 3,
};

const RANK = { adorable: 0, worried: 1, intense: 2 };
const whole = (v) => (Number.isFinite(+v) ? Math.max(0, Math.floor(+v)) : 0);
const percent = (v) => (v === null || v === undefined || v === '' || !Number.isFinite(+v) ? null : Math.min(100, Math.max(0, +v)));

function averageLast(scores, n) {
  const list = (scores || []).map(Number).filter(Number.isFinite).slice(-n);
  return list.length ? list.reduce((a, b) => a + b, 0) / list.length : null;
}
function trailingLow(scores, limit) {
  let n = 0;
  for (let i = (scores || []).length - 1; i >= 0 && Number(scores[i]) < limit; i -= 1) n += 1;
  return n;
}
function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Every message ends with one small next step, and none of them ever shames the student.
const LINES = {
  new: ['Hi, I am your study tutor! I will help you learn every subject. {step}'],
  adorable: ['Great work today! {step}', 'You are doing really well! {step}', 'Look at you go! {step}'],
  returning: ['I missed you! {step}', 'Welcome back! {step}'],
  worried: ['This part is tricky, and that is okay. {step}', 'Let us go over this together. {step}', 'I am here to help. {step}'],
  intense: ['Time to refocus. {step}', 'You can turn this around. {step}', 'Let us get back on track. {step}'],
  gentle: ['Let us ease back in. {step}', 'No pressure. {step}'],
};
const STEPS = {
  new: 'Tap a course to begin.',
  adorable: 'Shall we start the next lesson?',
  returning: 'Want to pick up where you left off?',
  worried: 'Let us do one question together.',
  intense: 'Try 10 focused minutes today.',
  gentle: 'One small step today?',
};
function stepFor(kind, next) {
  if (!next) return STEPS[kind];
  if (kind === 'new' || kind === 'adorable') return `Next up: ${next}.`;
  if (kind === 'intense') return `Start with ${next} for 10 focused minutes.`;
  return `Let us start with ${next}.`;
}

function intensityFor(emotion, idx, idle, fails) {
  if (emotion === 'adorable') return idx === null ? 0 : idx >= 92 ? 3 : idx >= 80 ? 2 : 1;
  if (emotion === 'worried') return idx === null || idx >= 65 ? 0 : idx >= 50 ? 1 : idx >= 40 ? 2 : 3;
  return idle >= 10 || fails >= 5 ? 3 : idle >= 7 || fails >= 4 ? 2 : 1;
}

export function computeTutorState(metrics = {}, guard = {}) {
  const t = { ...THRESHOLDS, ...(guard.thresholds || {}) };
  const idx = percent(metrics.performanceIndex) ?? averageLast(metrics.recentScores, 5);
  const idle = whole(metrics.idleDays);
  const fails = whole(metrics.consecutiveFails);
  const lowRun = trailingLow(metrics.recentScores, t.lowScore);
  const reasons = [];
  let emotion = 'adorable';
  let kind = 'adorable';

  if (metrics.isNew || idx === null) {
    reasons.push('new_student');
    kind = 'new';
  } else {
    const veryLow = idx < t.struggling;
    const midBand = idx >= t.struggling && idx < t.good;
    if (veryLow) reasons.push('index_under_40');
    else if (midBand) reasons.push('index_40_to_64');
    if (lowRun >= 2) reasons.push('two_low_scores');
    if (idle >= t.intenseIdleDays) reasons.push('idle_5_days');
    else if (idle >= t.worriedIdleDays) reasons.push('idle_3_days');
    if (fails >= t.intenseFails) reasons.push('three_fails');

    if (veryLow && (idle >= t.intenseIdleDays || fails >= t.intenseFails)) {
      emotion = 'intense';
      kind = 'intense';
    } else if (veryLow || midBand || lowRun >= 2 || idle >= t.worriedIdleDays) {
      emotion = 'worried';
      kind = idx >= t.good && lowRun < 2 ? 'returning' : 'worried';
    } else {
      reasons.push('doing_well');
    }
  }

  // Wellbeing guardrails: at most one Intense session a day, softened as soon as any task is finished.
  if (emotion === 'intense' && (guard.intenseShownToday || guard.taskFinishedSinceIntense)) {
    emotion = 'worried';
    kind = 'gentle';
    reasons.push('intense_softened');
  }
  // The school can cap the strongest mood: friendly only, up to worried, or up to intense.
  const cap = RANK[guard.maxMood] ?? 2;
  if (RANK[emotion] > cap) {
    emotion = MOODS[cap];
    kind = 'gentle';
    reasons.push('school_cap');
  }

  // "Getting worse needs two checks in a row; getting better applies at once" (roadmap Phase 2). The caller passes the mood
  // from the previous check as holdAt; a mood worse than that waits for the next check.
  const hold = RANK[guard.holdAt];
  if (hold !== undefined && RANK[emotion] > hold) {
    emotion = MOODS[hold];
    kind = hold === 0 ? 'adorable' : 'gentle';
    reasons.push('waiting_for_second_check');
  }

  let pose = 'idle';
  if (emotion === 'worried') pose = 'cheeks';
  else if (emotion === 'intense') pose = 'coach';
  else if (kind === 'new' || kind === 'returning') pose = 'wave';
  else if (kind === 'adorable' && metrics.nextStep) pose = 'point';

  const day = guard.date || new Date().toISOString().slice(0, 10);
  const lines = LINES[kind];
  const line = lines[hash(`${metrics.studentId || ''}|${day}|${kind}`) % lines.length];
  const intensity = kind === 'gentle' && emotion === 'adorable' ? 0 : intensityFor(emotion, idx, idle, fails);

  return { emotion, intensity, pose, reasons, say: line.replace('{step}', stepFor(kind, metrics.nextStep)) };
}
