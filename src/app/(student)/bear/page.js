'use client';

import { useEffect, useRef, useState } from 'react';
import { useBear } from '../../../components/bear/BearProvider';
import { useTenant } from '../../../components/app/TenantProvider';
import { Button, Icon, Select } from '../../../components/ui';
import { useCourses, useMe } from '../../../lib/app/student';
import { apiPost } from '../../../lib/api/client';
import { line } from '../../../lib/bear/lines';
import { firstName } from '../../../lib/app/format';
import { useQueryParam, useTitle } from '../../../lib/app/hooks';

const ERROR_LINE = { SUBSCRIPTION_EXPIRED: 'expired', SUBSCRIPTION_REQUIRED: 'expired', SUBSCRIPTION_READ_ONLY: 'expired', FEATURE_NOT_INCLUDED: 'expired', RATE_LIMITED: 'slowDown', AI_BUSY: 'busy' };

export default function BearChat() {
  const me = useMe();
  const bear = useBear();
  const { tutor } = useTenant();
  const name = (tutor && tutor.name) || 'Bear AI';
  useTitle(name);
  const courses = useCourses();
  const [msgs, setMsgs] = useState(null);
  const [text, setText] = useState('');
  const [thinking, setThinking] = useState(false);
  const [courseId, setCourseId] = useState('');
  const endRef = useRef(null);
  const lastQuestion = useRef('');

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch('/api/v1/tutor/messages', { credentials: 'same-origin' });
        if (!res.ok) return;
        const data = await res.json();
        const past = (data || []).slice().reverse().flatMap((m) => [
          { id: `${m.id}-q`, who: 'me', text: m.question },
          { id: `${m.id}-a`, who: 'bear', text: m.answer, grounded: m.grounded },
        ]);
        setMsgs([...past.slice(-12), { id: 'hello', who: 'bear', text: `Hi ${firstName(me?.full_name || '')}! What are we studying today?` }]);
      } catch (e) {
        setMsgs([{ id: 'hello', who: 'bear', text: `Hi ${firstName(me?.full_name || '')}! What are we studying today?` }]);
      }
    }
    if (!msgs) fetchHistory();
  }, [me, msgs]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  const mine = (courses.data || []).filter((c) => c.enrolled !== false);

  return (
    <main className="app-main" id="main">
      <div className="chat">
        <header className="chat-head">
          <div className="grow">
            <h1>{name}</h1>
            <p className="small muted">Your study buddy · answers from your lessons</p>
          </div>
        </header>
        {mine.length > 0 && (
          <div style={{ paddingTop: 12 }}>
            <Select label="Ask about" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              <option value="">All my courses</option>
              {mine.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </Select>
          </div>
        )}
        <div className="chat-log" aria-live="polite">
          {(msgs || []).map((m) => (
            <div key={m.id} className={`msg ${m.who === 'me' ? 'msg-me' : 'msg-bear'}`}>
              {m.text}
              {m.who === 'bear' && m.id !== 'hello' && (
                <div className="msg-meta">
                  <button type="button" className="link-btn" onClick={() => bear.say(m.text, { emotion: m.emotion || 'adorable', pose: m.pose || 'point' })}>
                    <Icon name="sound" size={14} /> Listen
                  </button>
                </div>
              )}
            </div>
          ))}
          {thinking && <div className="msg msg-bear">Thinking...</div>}
          <div ref={endRef} />
        </div>
        <form className="composer" onSubmit={(e) => { e.preventDefault(); send(text); }}>
          <textarea id="ask" rows={1} placeholder="Ask anything…" value={text} onChange={(e) => setText(e.target.value)} />
          <Button type="submit" disabled={!text.trim() || thinking}>Send</Button>
        </form>
      </div>
    </main>
  );
}