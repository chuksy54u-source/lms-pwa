'use client';

// THE BEAR'S CORNER. The study tutor lives beside the board for the whole game: on a wide screen it stands next to the board with
// a speech bubble above it and its buttons beside it; on a phone it is a slim strip above the board that opens into the same panel.
// The bear's face follows what it is saying (cheering, worried, thinking), little emotes pop up over its head, and when it explains
// a move it points its arm at the square, pit or token on the board. All the words come from the server (the tutor engine), never
// from this file, so the teaching always matches the real position.

import { useEffect, useMemo, useRef, useState } from 'react';
import BearMascot from '../bear/BearMascot';
import { estimateMs } from '../bear/bearCore';

const QUIET = { emotion: 'adorable', pose: 'idle', emote: '', celebrate: false };
const CONFETTI = ['🎉', '⭐', '✨', '🎊', '⭐', '✨'];

// The questions a student can tap. Against a classmate the bear never picks the move, so those buttons are not offered.
function chipsFor({ mode, bearGame, finished }) {
  if (finished) return [{ id: 'status', label: 'How did I play?', icon: '📊' }, { id: 'rules', label: 'Rules', icon: '📖' }, { id: 'quiz', label: 'Quiz me', icon: '🎯' }];
  const list = [];
  if (mode !== 'fair') list.push({ id: 'hint', label: 'Hint', icon: '💡' }, { id: 'why', label: 'Why?', icon: '🤔' });
  list.push({ id: 'quiz', label: 'Quiz me', icon: '🎯' }, { id: 'rules', label: 'Rules', icon: '📖' }, { id: 'status', label: 'Who is ahead?', icon: '📊' });
  if (bearGame) list.push({ id: 'bear', label: 'What did you do?', icon: '🐻' });
  return list;
}

function Quiz({ quiz, onShow }) {
  const [picked, setPicked] = useState(null);
  const done = picked !== null;
  return (
    <div className="pg-quiz">
      <p className="pg-quiz-q">{quiz.question}</p>
      <div className="pg-quiz-choices" role="group" aria-label="Choose an answer">
        {quiz.choices.map((choice) => {
          const right = done && choice.id === quiz.answer_id;
          const wrong = done && picked === choice.id && choice.id !== quiz.answer_id;
          return (
            <button
              key={choice.id}
              type="button"
              className={`pg-quiz-choice ${right ? 'is-right' : ''} ${wrong ? 'is-wrong' : ''}`}
              disabled={done}
              onClick={() => {
                setPicked(choice.id);
                if (quiz.focus && onShow) onShow(quiz.focus);
              }}
            >
              {choice.label}
            </button>
          );
        })}
      </div>
      {done && (
        <p className={`pg-quiz-explain ${picked === quiz.answer_id ? 'is-right' : 'is-wrong'}`} role="status">
          <b>{picked === quiz.answer_id ? 'Yes! ' : 'Not quite. '}</b>{quiz.explain}
        </p>
      )}
    </div>
  );
}

function NoteBlock({ note, canPlay, busy, onPlay, onShow, shown, compact = false }) {
  if (!note) return null;
  return (
    <div className={`pg-note ${compact ? 'pg-note--extra' : ''}`}>
      {note.headline && <h3 className="pg-note-head">{note.headline}</h3>}
      {note.text && <p className="pg-note-text">{note.text}</p>}
      {note.points && note.points.length > 0 && (
        <ul className="pg-note-points">{note.points.map((point, index) => <li key={index}>{point}</li>)}</ul>
      )}
      {note.concept && (
        <p className="pg-note-concept"><b>{note.concept.title}.</b> {note.concept.text}</p>
      )}
      {note.quiz && <Quiz key={note.quiz.question} quiz={note.quiz} onShow={onShow} />}
      {(note.move || note.focus) && (
        <div className="pg-note-actions">
          {note.focus && (
            <button type="button" className="pg-btn pg-btn--soft" onClick={() => onShow(shown ? null : note.focus, true)}>
              {shown ? 'Hide on the board' : 'Show me on the board'}
            </button>
          )}
          {note.move && canPlay && (
            <button type="button" className="pg-btn pg-btn--primary pg-btn--small" disabled={busy} onClick={() => onPlay(note.move)}>
              Play this move
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * @param bubble  { main, extras[], seq, mood }   what the bear is saying now (notes come from the tutor engine)
 * @param focus   what the bear is pointing at on the board (null when nothing)
 */
export default function BearCorner({
  name = 'Bearilly', game = 'the game', mode = 'friendly', bearGame = false, finished = false,
  bubble, focus, myTurn, busy, thinking, onAsk, onPlay, onShow,
}) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [wide, setWide] = useState(false);
  const bubbleRef = useRef(null);
  const mood = (bubble && bubble.mood) || QUIET;
  const seq = bubble ? bubble.seq : 0;
  const text = bubble && bubble.main ? bubble.main.text : '';

  // On a wide screen the whole bear stands beside the board (its arm can reach the board); on a phone only its head and shoulders show.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const query = window.matchMedia('(min-width: 880px) and (min-aspect-ratio: 5/4)');
    const update = () => setWide(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  // The jaw moves for about as long as the line would take to say.
  useEffect(() => {
    if (!text) return undefined;
    setSpeaking(true);
    const timer = setTimeout(() => setSpeaking(false), Math.min(9000, estimateMs(text)));
    return () => clearTimeout(timer);
  }, [seq, text]);

  // A new note starts at the top of the bubble.
  useEffect(() => {
    if (bubbleRef.current) bubbleRef.current.scrollTop = 0;
  }, [seq]);

  const chips = useMemo(() => chipsFor({ mode, bearGame, finished }), [mode, bearGame, finished]);
  const emotion = thinking ? 'intense' : mood.emotion || 'adorable';
  const pose = thinking ? 'coach' : focus ? 'point' : mood.pose || 'idle';
  const showFocus = Boolean(focus);
  const emote = thinking ? '🤔' : mood.emote;
  const celebrate = Boolean(mood.celebrate) && !thinking;
  const main = bubble && bubble.main;
  const extras = (bubble && bubble.extras) || [];
  const peek = thinking ? 'Let me think about that…' : main ? [main.headline, main.text].filter(Boolean).join(' · ') : `Hi! I am ${name}. Ask me anything about ${game}.`;

  // On a phone the open panel covers the board, so pointing at something (or playing the bear's move) folds it away.
  const show = (value, fold) => { onShow(value); if (value && fold && !wide) setOpen(false); };
  const play = (move) => { onPlay(move); if (!wide) setOpen(false); };

  function submit(event) {
    event.preventDefault();
    const value = typed.trim();
    if (!value || thinking) return;
    onAsk('text', value);
    setTyped('');
  }

  return (
    <div className="pg-bear-wrap">
      <section className={`pg-bear is-${mode} ${open ? 'is-open' : ''} ${thinking ? 'is-thinking' : ''}`} aria-label={`${name}, your study tutor`}>
        <div className="pg-bear-figure">
          <div className="pg-bear-stage">
            <BearMascot
              key={celebrate ? `party-${seq}` : 'bear'}
              size={wide ? 'full' : 'bust'}
              emotion={emotion}
              pose={pose}
              speaking={speaking}
              celebrate={celebrate}
              pointAt={showFocus ? '[data-pg-focus="true"]' : undefined}
              dismissible={false}
              escToDismiss={false}
              label={name}
              className="pg-bear-art"
              style={{ width: '100%' }}
            />
          </div>
          {emote && <span key={`emote-${seq}`} className="pg-emote" aria-hidden>{emote}</span>}
          {celebrate && (
            <span key={`confetti-${seq}`} className="pg-confetti" aria-hidden>
              {CONFETTI.map((piece, index) => <i key={index} style={{ '--i': index }}>{piece}</i>)}
            </span>
          )}
          <span className="pg-bear-name">{name}</span>
        </div>

        <button type="button" className="pg-bear-peek" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
          <span>{peek}</span>
          <i aria-hidden>{open ? '▾' : '▸'}</i>
        </button>

        <div className="pg-bear-bubble" ref={bubbleRef} role="status" aria-live="polite">
          {thinking ? (
            <p className="pg-note-text pg-thinking">Let me think about that<span aria-hidden>…</span></p>
          ) : main ? (
            <>
              <NoteBlock note={main} canPlay={myTurn && !finished} busy={busy} onPlay={play} onShow={show} shown={showFocus} />
              {extras.map((extra, index) => (
                <NoteBlock key={index} note={extra} canPlay={myTurn && !finished} busy={busy} onPlay={play} onShow={show} shown={showFocus} compact />
              ))}
            </>
          ) : (
            <p className="pg-note-text">Hi! I am {name}. I will watch your game, cheer you on, and explain things. Tap a button or type a question.</p>
          )}
        </div>

        <div className="pg-bear-actions">
          <div className="pg-chips" role="group" aria-label={`Ask ${name}`}>
            {chips.map((chip) => (
              <button key={chip.id} type="button" className="pg-chip-btn" disabled={thinking} onClick={() => { onAsk(chip.id); if (chip.id === 'hint' || chip.id === 'why') setOpen(true); }}>
                <span aria-hidden>{chip.icon}</span> {chip.label}
              </button>
            ))}
          </div>
          <form className="pg-ask" onSubmit={submit}>
            <input
              type="text"
              value={typed}
              maxLength={300}
              onChange={(event) => setTyped(event.target.value)}
              placeholder={`Ask ${name} about ${game}…`}
              aria-label={`Ask ${name} a question`}
              autoComplete="off"
              enterKeyHint="send"
            />
            <button type="submit" className="pg-btn pg-btn--primary pg-btn--small" disabled={!typed.trim() || thinking}>Ask</button>
          </form>
        </div>
      </section>
    </div>
  );
}
