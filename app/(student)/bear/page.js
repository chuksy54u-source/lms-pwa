'use client';

import { useEffect, useRef, useState } from 'react';
import BearArt from '../../../components/app/BearArt';
import { useBear } from '../../../components/bear/BearProvider';
import { useTenant } from '../../../components/app/TenantProvider';
import { Button, Icon, Select } from '../../../components/ui';
import { useCourses, useMe } from '../../../lib/app/student';
import useApi from '../../../lib/app/useApi';
import { apiPost } from '../../../lib/api/client';
import { line } from '../../../lib/bear/lines';
import { firstName } from '../../../lib/app/format';
import { useQueryParam, useTitle } from '../../../lib/app/hooks';

const ERROR_LINE = { SUBSCRIPTION_EXPIRED: 'expired', SUBSCRIPTION_REQUIRED: 'expired', SUBSCRIPTION_READ_ONLY: 'expired', FEATURE_NOT_INCLUDED: 'expired', RATE_LIMITED: 'slowDown', AI_BUSY: 'busy' };

// AI TUTOR chat. Questions go to POST /tutor/ask; the server answers ONLY from the lesson notes of this school's
// courses and never as "an AI". Answers arrive whole (no streaming, decision D20), so we show a typing indicator.
// Tap "Listen" and the bear in the corner reads an answer aloud.
export default function BearChat() {
  const me = useMe();
  const bear = useBear();
  const { tutor } = useTenant();
  const name = (tutor && tutor.name) || 'Study tutor';
  useTitle(name);
  const courses = useCourses();
  const history = useApi('/api/v1/tutor/messages?limit=20');
  const preset = useQueryParam('q');
  const [courseId, setCourseId] = useState('');
  const [msgs, setMsgs] = useState(null);
  const [text, setText] = useState('');
  const [thinking, setThinking] = useState(false);
  const endRef = useRef(null);
  const sentPreset = useRef(false);
  const lastQuestion = useRef('');

  // First screen: earlier questions (newest last), then the greeting.
  useEffect(() => {
    if (msgs !== null || history.loading) return;
    const past = ((history.data || []).slice().reverse()).flatMap((m) => [
      { id: `${m.id}-q`, who: 'me', text: m.question },
      { id: `${m.id}-a`, who: 'bear', text: m.answer, grounded: m.grounded },
    ]);
    setMsgs([...past.slice(-12), { id: 'hello', who: 'bear', text: `Hi ${firstName(me && me.full_name)}! What are we studying today?` }]);
  }, [history.loading, history.data, msgs, me]);

  useEffect(() => {
    document.body.classList.add('on-chat');
    return () => document.body.classList.remove('on-chat');
  }, []);

  useEffect(() => {
    endRef.current && endRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [msgs, thinking]);

  async function send(q) {
    const question = String(q || '').trim();
    if (!question || thinking) return;
    lastQuestion.current = question;
    setText('');
    setMsgs((m) => [...(m || []), { id: `q${Date.now()}`, who: 'me', text: question }]);
    setThinking(true);
    try {
      const res = await apiPost('/api/v1/tutor/ask', { question, context: courseId ? { courseId } : {} });
      setMsgs((m) => [...m, { id: `a${Date.now()}`, who: 'bear', fresh: true, text: res.answer, grounded: res.grounded, lesson: res.lesson, emotion: res.emotion, pose: res.pose }]);
    } catch (err) {
      setMsgs((m) => [...m, { id: `e${Date.now()}`, who: 'bear', text: line(ERROR_LINE[err.code] || 'askFailed'), failed: true }]);
    } finally {
      setThinking(false);
    }
  }

  useEffect(() => {
    if (preset && msgs && !sentPreset.current) {
      sentPreset.current = true;
      send(preset);
    }
  }, [preset, msgs]); // eslint-disable-line react-hooks/exhaustive-deps

  const lastBear = msgs ? [...msgs].reverse().find((m) => m.who === 'bear' && !m.failed && m.id !== 'hello') : null;
  const suggestions = lastBear
    ? [
        ['Quiz me', `Ask me one quick question to check I understood: ${lastQuestion.current}`],
        ['Give an example', `Give me a simple example for: ${lastQuestion.current}`],
        ['Simpler', `Explain that more simply: ${lastQuestion.current}`],
      ]
    : [
        ['What should I revise?', 'What should I revise first?'],
        ['Quiz me', 'Quiz me on my last lesson'],
        ['Explain a key word', 'Explain the most important word in my current lesson'],
      ];
  const mine = (courses.data || []).filter((c) => c.enrolled !== false);

  return (
    <main className="app-main" id="main">
      <div className="chat">
        <header className="chat-head">
          <BearArt className="bear-mini" size="head" />
          <div className="grow">
            <h1 style={{ fontSize: '1.15rem' }}>{name}</h1>
            <p className="small muted">Your study buddy · answers from your lessons</p>
          </div>
        </header>
        {mine.length > 0 && (
          <div style={{ paddingTop: 12 }}>
            <Select label="Ask about" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              <option value="">All my courses</option>
              {mine.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </Select>
          </div>
        )}
        <div className="chat-log" aria-live="polite">
          {(msgs || []).map((m) => (
            <div key={m.id} className={`msg ${m.who === 'me' ? 'msg-me' : 'msg-bear'}`}>
              {m.fresh ? <TypeOut text={m.text} /> : m.text}
              {m.who === 'bear' && m.id !== 'hello' && (
                <div className="msg-meta">
                  <button type="button" className="link-btn" onClick={() => bear.say(m.text, { emotion: m.emotion || 'adorable', pose: m.pose || 'point' })}>
                    <Icon name="sound" size={14} /> Listen
                  </button>
                  {m.lesson && <span className="tiny muted">From: {m.lesson.title}</span>}
                  {m.grounded === false && !m.failed && <span className="tiny muted">Not in my notes yet</span>}
                </div>
              )}
            </div>
          ))}
          {thinking && (
            <div className="msg msg-bear" aria-label={`${name} is typing`}>
              <span className="typing">
                <span />
                <span />
                <span />
              </span>
            </div>
          )}
          {msgs && !thinking && (
            <div className="chips" style={{ flexWrap: 'wrap' }}>
              {suggestions.map(([label, q]) => (
                <button key={label} type="button" className="chip" onClick={() => send(q)}>
                  {label}
                </button>
              ))}
            </div>
          )}
          <div ref={endRef} />
        </div>
        <form
          className="composer"
          onSubmit={(e) => {
            e.preventDefault();
            send(text);
          }}
        >
          <label htmlFor="ask" className="sr-only">
            Ask {name} anything
          </label>
          <textarea
            id="ask"
            rows={1}
            placeholder="Ask anything…"
            value={text}
            maxLength={500}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send(text);
              }
            }}
          />
          <Button type="submit" aria-label="Send" disabled={!text.trim() || thinking}>
            <Icon name="send" size={20} />
          </Button>
        </form>
      </div>
    </main>
  );
}

// The answer appears word by word, like the bear is typing it (roadmap Phase 2: "streaming text").
// The API sends the whole answer at once (decision D20), so this is only how it is shown; screen readers get the full
// text straight away, and anyone who asked for less motion sees it all at once.
function TypeOut({ text }) {
  const words = String(text || '').split(/(\s+)/);
  const [n, setN] = useState(0);
  useEffect(() => {
    let reduced = false;
    try {
      reduced = document.documentElement.dataset.bearMotion === 'reduced' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) {
      reduced = false;
    }
    if (reduced) {
      setN(words.length);
      return undefined;
    }
    const t = setInterval(() => setN((k) => (k >= words.length ? (clearInterval(t), k) : k + 2)), 45);
    return () => clearInterval(t);
  }, [text]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      <span aria-hidden="true">{words.slice(0, n).join('')}</span>
      <span className="sr-only">{text}</span>
    </>
  );
}
