'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { apiGet, apiPost } from '../../lib/api/client.js';
import { line as scripted } from '../../lib/bear/lines.js';

// Two doors into the same room:
//   useBear()          what the rest of the app calls (say, explainLesson, ask...). Never re-renders when the bear talks.
//   BearViewContext    what <BearHost> reads to draw the bear. Only BearHost uses it.
export const BearApiContext = createContext(null);
export const BearViewContext = createContext(null);

const MOOD_KEY = 'bearilly:mood';
const DEFAULT_SETTINGS = { tutorName: 'Bearilly', greeting: '', voice: { gender: 'feminine', lang: 'en-NG' } };

const noop = () => {};
const NOOP_API = {
  say: noop, sayKey: noop, explainLesson: noop, ask: async () => null, openAsk: noop, closeAsk: noop,
  setContext: noop, pointAt: noop, stopPointing: noop, celebrate: noop, refresh: async () => null, stop: noop,
};

/**
 * The remote control for the bear. Call it from any component:
 *   const bear = useBear();
 *   bear.say('Well done!');
 * Outside a <BearProvider> every call quietly does nothing, so a page never crashes because of the bear.
 */
export function useBear() {
  return useContext(BearApiContext) || NOOP_API;
}

export default function BearProvider({ children, settings, studentId, enabled = true }) {
  const cfg = useMemo(() => ({ ...DEFAULT_SETTINGS, ...(settings || {}) }), [settings]);
  const [tutorState, setTutorState] = useState(null);
  const [utterance, setUtterance] = useState(null);
  const [pointSel, setPointSel] = useState(null);
  const [celebrating, setCelebrating] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const [asking, setAsking] = useState(false);
  const idRef = useRef(0);
  const ctxRef = useRef({}); // what the student is looking at: { courseId, lessonId, lessonTitle }
  const stateRef = useRef(null);
  const celebrateTimer = useRef(0);
  stateRef.current = tutorState;

  useEffect(() => () => clearTimeout(celebrateTimer.current), []);

  const celebrate = useCallback(() => {
    setCelebrating(true);
    clearTimeout(celebrateTimer.current);
    celebrateTimer.current = setTimeout(() => setCelebrating(false), 1400);
  }, []);

  // Say one line. A new line interrupts the old one.
  //   opts: { emotion, pose, pointAt: '#selector', celebrate: true }
  const say = useCallback(
    (text, opts = {}) => {
      const t = String(text || '').trim();
      if (!t) return;
      idRef.current += 1;
      setUtterance({ id: idRef.current, text: t, emotion: opts.emotion, pose: opts.pose });
      if (opts.pointAt !== undefined) setPointSel(opts.pointAt || null);
      if (opts.celebrate) celebrate();
    },
    [celebrate],
  );

  // Say a pre-written line from lib/bear/lines.js: bear.sayKey('quizPassed')
  const sayKey = useCallback((key, params, opts) => say(scripted(key, { name: cfg.tutorName, ...(params || {}) }), opts), [say, cfg.tutorName]);

  const pointAt = useCallback((selector) => setPointSel(selector || null), []);
  const stopPointing = useCallback(() => setPointSel(null), []);
  const stop = useCallback(() => {
    idRef.current += 1;
    setUtterance(null);
    setPointSel(null);
  }, []);
  const setContext = useCallback((c) => {
    ctxRef.current = { ...(c || {}) };
  }, []);
  const openAsk = useCallback(() => setAskOpen(true), []);
  const closeAsk = useCallback(() => setAskOpen(false), []);

  // A student opens a lesson: the bear speaks the lesson's READY-MADE explanation. No AI here.
  const explainLesson = useCallback(
    (lesson, opts = {}) => {
      if (!lesson) return;
      ctxRef.current = { courseId: lesson.course_id || lesson.courseId, lessonId: lesson.id, lessonTitle: lesson.title };
      const text = lesson.explanation || scripted('lessonStart', { title: lesson.title || 'this lesson' });
      say(text, { emotion: 'adorable', pose: 'point', pointAt: opts.pointAt === undefined ? '#lesson-title' : opts.pointAt });
    },
    [say],
  );

  // A student asks a question. The server (Gemini, reading the lesson notes) answers; the bear speaks it as itself.
  const ask = useCallback(
    async (question, extra) => {
      const q = String(question || '').trim();
      if (!q) return null;
      setAsking(true);
      try {
        const data = await apiPost('/api/v1/tutor/ask', { question: q, context: { ...ctxRef.current, ...(extra || {}) } });
        const mood = (stateRef.current && stateRef.current.emotion) || 'adorable';
        say(data.answer, { emotion: data.emotion || mood, pose: data.pose || 'point' });
        return data;
      } catch (err) {
        const code = err && err.code;
        const key = code === 'SUBSCRIPTION_EXPIRED' ? 'expired' : code === 'RATE_LIMITED' ? 'slowDown' : code === 'AI_BUSY' ? 'busy' : 'askFailed';
        say(scripted(key), { emotion: 'worried', pose: 'cheeks' });
        return null;
      } finally {
        setAsking(false);
      }
    },
    [say],
  );

  // Fetch the student's mood from the server. Speaks the mood line once per session, or every time with { force: true }.
  const refresh = useCallback(
    async (opts = {}) => {
      if (!studentId) return null;
      try {
        const s = await apiGet(`/api/v1/students/${encodeURIComponent(studentId)}/tutor-state`);
        setTutorState(s);
        if (opts.speak !== false && s && s.say) {
          let last = null;
          try {
            last = window.sessionStorage.getItem(MOOD_KEY);
          } catch (e) {
            last = null;
          }
          if (opts.force || last !== s.emotion) {
            try {
              window.sessionStorage.setItem(MOOD_KEY, s.emotion);
            } catch (e) {
              /* private mode: it just speaks again next time */
            }
            say(s.say, { emotion: s.emotion, pose: s.pose });
          }
        }
        return s;
      } catch (err) {
        return null;
      }
    },
    [studentId, say],
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  // A visitor with no student account: say the school's greeting, if it has one.
  useEffect(() => {
    if (!studentId && cfg.greeting) say(cfg.greeting);
  }, [studentId, cfg.greeting, say]);

  const api = useMemo(
    () => ({
      say, sayKey, explainLesson, ask, openAsk, closeAsk, setContext, pointAt, stopPointing, celebrate, stop,
      refresh: (o) => refresh({ force: true, ...(o || {}) }), // after a test result: re-check the mood and say its line
    }),
    [say, sayKey, explainLesson, ask, openAsk, closeAsk, setContext, pointAt, stopPointing, celebrate, stop, refresh],
  );

  const view = useMemo(
    () => ({ enabled, settings: cfg, tutorState, utterance, pointSel, celebrating, askOpen, setAskOpen, asking, ask }),
    [enabled, cfg, tutorState, utterance, pointSel, celebrating, askOpen, asking, ask],
  );

  return (
    <BearApiContext.Provider value={api}>
      <BearViewContext.Provider value={view}>{children}</BearViewContext.Provider>
    </BearApiContext.Provider>
  );
}
