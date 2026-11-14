'use client';

// THE BEAR'S CORNER. The study tutor lives beside the board for the whole game: on a wide screen it stands next to the board with
// a speech bubble above it and its buttons beside it; on a phone it is a slim strip above the board that opens into the same panel.
// The bear speaks here itself (its own voice, a sound button, a "say it again" button), so the game never depends on the floating bear
// that is tucked away during a game. The bear's face follows what it is saying (cheering, worried, thinking), little emotes pop up over its head, and when it explains
// a move it points its arm at the square, pit or token on the board. All the words come from the server (the tutor engine), never
// from this file, so the teaching always matches the real position.

import { useEffect, useMemo, useRef, useState } from 'react';
import BearMascot from '../bear/BearMascot';
import useBearSpeech from '../bear/useBearSpeech';
import Icon, { EMOTE_ICON } from '../ui/icons';
import { defaultTutorName } from '../../lib/app/brand.js';
import { readBearPrefs, writeBearPrefs, applyBearPrefs, onBearPrefs, DEFAULT_BEAR_PREFS } from '../../lib/app/bearPrefs';
import { speechOf } from './logic.js';

const QUIET = { emotion: 'adorable', pose: 'idle', emote: '', celebrate: false };
// Little shapes (drawn in CSS, no emoji) thrown up when the bear celebrates.
const CONFETTI = ['dot', 'bar', 'star', 'square', 'star', 'dot'];
// Emotes that are warm gold; the rest are navy.
const WARM = new Set(['cheer', 'star', 'win', 'streak', 'idea', 'clap']);

// The questions a student can tap. Against a classmate the bear never picks the move, so those buttons are not offered.
function chipsFor({ mode, bearGame, finished }) {
  if (finished) return [{ id: 'status', label: 'How did I play?', icon: 'chart' }, { id: 'rules', label: 'Rules', icon: 'book' }, { id: 'quiz', label: 'Quiz me', icon: 'target' }];
  const list = [];
  if (mode !== 'fair') list.push({ id: 'hint', label: 'Hint', icon: 'bulb' }, { id: 'why', label: 'Why?', icon: 'help' });
  list.push({ id: 'quiz', label: 'Quiz me', icon: 'target' }, { id: 'rules', label: 'Rules', icon: 'book' }, { id: 'status', label: 'Who is ahead?', icon: 'chart' });
  if (bearGame) list.push({ id: 'bear', label: 'What did you do?', icon: 'bear' });
  return list;
}

// The bear's sound controls: turn its voice off or on, and hear the last thing it said again. While the browser has not been touched
// yet (it keeps sound locked until the first tap) the speaker pulses and says so.
function VoiceButtons({ name, sp, sound, line, onToggle, onReplay, compact = false }) {
  const locked = sp.needsTap;
  // The browser's first press also unlocks sound, and that re-draws this button before its click arrives. Remember that the press began
  // while the button still said "tap to hear", so the same press is not then read as "turn the voice off".
  const pressedLocked = useRef(false);
  const label = locked ? `Tap to hear ${name}` : sound ? `Turn ${name}'s voice off` : `Turn ${name}'s voice on`;
  return (
    <span className={`pg-voice ${compact ? 'pg-voice--strip' : ''}`} role="group" aria-label={`${name}'s voice`}>
      {sound && !locked && line ? (
        <button type="button" className="pg-voice-btn" onClick={onReplay} aria-label="Hear that again" title="Hear that again"><Icon name="refresh" size={16} /></button>
      ) : null}
      <button
        type="button"
        className={`pg-voice-btn ${locked ? 'is-locked' : ''} ${sp.speaking ? 'is-speaking' : ''} ${!sound ? 'is-off' : ''}`}
        onPointerDown={() => { pressedLocked.current = locked; }}
        onKeyDown={() => { pressedLocked.current = locked; }}
        onClick={() => { const wasLocked = pressedLocked.current || locked; pressedLocked.current = false; onToggle(wasLocked); }}
        aria-pressed={!sound}
        aria-label={label}
        title={label}
      >
        <Icon name={sound ? 'sound' : 'soundOff'} size={18} />
      </button>
    </span>
  );
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
  name = defaultTutorName(), game = 'the game', mode = 'friendly', bearGame = false, finished = false,
  bubble, focus, myTurn, busy, thinking, onAsk, onPlay, onShow, voice,
}) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [prefs, setPrefs] = useState(DEFAULT_BEAR_PREFS);
  const sp = useBearSpeech({ voice });
  const { speak, setMuted } = sp;
  const spoken = useRef(0);
  const [wide, setWide] = useState(false);
  const bubbleRef = useRef(null);
  const mood = (bubble && bubble.mood) || QUIET;
  const seq = bubble ? bubble.seq : 0;

  // On a wide screen the whole bear stands beside the board (its arm can reach the board); on a phone only its head and shoulders show.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const query = window.matchMedia('(min-width: 880px) and (min-aspect-ratio: 5/4)');
    const update = () => setWide(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  // The person's own bear settings (Me > Bear settings): sound on or off. Read before the first line is spoken.
  useEffect(() => {
    const use = (p) => { setPrefs(p); setMuted(!p.sound); applyBearPrefs(p); };
    use(readBearPrefs());
    return onBearPrefs(use);
  }, [setMuted]);

  // Say each new note once, out loud, in the bear's own voice. (If the browser has not been touched yet it waits for the first tap.)
  const line = bubble && bubble.speech ? bubble.speech : '';
  useEffect(() => {
    if (!line || spoken.current === seq) return;
    spoken.current = seq;
    speak(line, { emotion: mood.emotion });
  }, [seq, line, speak, mood.emotion]);

  // A new note starts at the top of the bubble.
  useEffect(() => {
    if (bubbleRef.current) bubbleRef.current.scrollTop = 0;
  }, [seq]);

  const chips = useMemo(() => chipsFor({ mode, bearGame, finished }), [mode, bearGame, finished]);
  const emotion = thinking ? 'intense' : mood.emotion || 'adorable';
  const pose = thinking ? 'coach' : focus ? 'point' : mood.pose || 'idle';
  const showFocus = Boolean(focus);
  const emoteName = thinking ? 'think' : mood.emote;
  const emoteIcon = EMOTE_ICON[emoteName] || null;
  const celebrate = Boolean(mood.celebrate) && !thinking;
  const main = bubble && bubble.main;
  const extras = (bubble && bubble.extras) || [];
  const peek = thinking ? 'Let me think about that…' : main ? [main.headline, main.text].filter(Boolean).join(' · ') : `Hi! I am ${name}. Ask me anything about ${game}.`;

  // On a phone the open panel covers the board, so pointing at something (or playing the bear's move) folds it away.
  const show = (value, fold) => { onShow(value); if (value && fold && !wide) setOpen(false); };
  const play = (move) => { onPlay(move); if (!wide) setOpen(false); };

  // The sound button: while the browser is still locked it unlocks (and says the waiting line); otherwise it turns the voice off or on.
  function toggleSound(wasLocked) {
    if (wasLocked === true || sp.needsTap) { sp.unlock(); return; }
    const next = !prefs.sound;
    writeBearPrefs({ sound: next });
    if (next) { sp.unlock(); if (line) speak(line, { emotion: mood.emotion }); }
  }
  function replay() {
    sp.unlock();
    if (line) speak(line, { emotion: mood.emotion });
  }

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
              speaking={sp.speaking}
              mouth={sp.speaking ? sp.mouth : undefined}
              celebrate={celebrate}
              pointAt={showFocus ? '[data-pg-focus="true"]' : undefined}
              dismissible={false}
              escToDismiss={false}
              label={name}
              className="pg-bear-art"
              style={{ width: '100%' }}
            />
          </div>
          {emoteIcon && <span key={`emote-${seq}`} className={`pg-emote ${WARM.has(emoteName) ? 'is-warm' : ''}`} aria-hidden><Icon name={emoteIcon} size={wide ? 26 : 18} stroke={2} /></span>}
          {celebrate && (
            <span key={`confetti-${seq}`} className="pg-confetti" aria-hidden>
              {CONFETTI.map((piece, index) => <i key={index} className={`pg-conf pg-conf--${piece}`} style={{ '--i': index }} />)}
            </span>
          )}
          <span className="pg-bear-name">{name}</span>
          {wide && sp.supported && <VoiceButtons name={name} sp={sp} sound={prefs.sound} line={line} onToggle={toggleSound} onReplay={replay} />}
        </div>

        <button type="button" className="pg-bear-peek" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
          <span>{peek}</span>
          <Icon name={open ? 'chevronUp' : 'chevronDown'} size={16} />
        </button>
        {!wide && sp.supported && <VoiceButtons name={name} sp={sp} sound={prefs.sound} line={line} onToggle={toggleSound} onReplay={replay} compact />}

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
                <Icon name={chip.icon} size={16} /> {chip.label}
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
