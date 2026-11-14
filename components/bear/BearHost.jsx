'use client';

import { useContext, useEffect, useRef, useState } from 'react';
import BearMascot from './BearMascot';
import useBearSpeech from './useBearSpeech';
import { BearViewContext } from './BearProvider';
import { line as scripted } from '../../lib/bear/lines.js';
import { defaultTutorName } from '../../lib/app/brand.js';
import { readBearPrefs, writeBearPrefs, applyBearPrefs, onBearPrefs, reducedMotion } from '../../lib/app/bearPrefs';

const STORE_KEY = 'bearilly:dismissed';

const PLACEMENT = {
  'bottom-right': { position: 'fixed', right: 16, bottom: 16, alignItems: 'flex-end' },
  'bottom-left': { position: 'fixed', left: 16, bottom: 16, alignItems: 'flex-start' },
  inline: { alignItems: 'flex-start' },
};
// Restyle through the classes bear-host, bear-host__bubble and bear-host__button.
const bubbleStyle = {
  background: '#FFF8EA', color: '#4A2C17', border: '3px solid #5A3A22', borderRadius: 18, padding: '10px 14px',
  font: '500 15px/1.4 system-ui, -apple-system, "Segoe UI", sans-serif', boxShadow: '0 4px 0 rgba(90, 58, 34, 0.25)',
  maxHeight: '45vh', overflowY: 'auto',
};
const buttonStyle = {
  appearance: 'none', cursor: 'pointer', border: '2px solid #5A3A22', background: '#C99B68', color: '#2B1A10', borderRadius: 999,
  padding: '6px 12px', font: '600 13px/1 system-ui, -apple-system, "Segoe UI", sans-serif',
};
const ghostStyle = { ...buttonStyle, background: 'transparent' };
const inputStyle = {
  flex: 1, minWidth: 0, border: '2px solid #5A3A22', borderRadius: 10, padding: '6px 10px', background: '#FFFFFF', color: '#2B1A10',
  font: '500 14px/1.3 system-ui, -apple-system, "Segoe UI", sans-serif',
};

function useNarrow() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;
    const mq = window.matchMedia('(max-width: 640px)');
    const update = () => setNarrow(mq.matches);
    update();
    if (mq.addEventListener) mq.addEventListener('change', update);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', update);
    };
  }, []);
  return narrow;
}

function HostInner({ view, placement, width, remember, className, tapAction }) {
  const { settings, tutorState, utterance, pointSel, celebrating, askOpen, setAskOpen, asking, ask } = view;
  const name = settings.tutorName || defaultTutorName();
  const sp = useBearSpeech({ voice: settings.voice });
  const { speak, cancel, clearCaption } = sp;
  const narrow = useNarrow();
  const [dismissed, setDismissed] = useState(null); // null until sessionStorage has been read
  const [begSignal, setBegSignal] = useState(0);
  const [begging, setBegging] = useState(false);
  const [question, setQuestion] = useState('');
  const [thinking] = useState(() => scripted('thinking'));
  const inputRef = useRef(null);
  const spokenId = useRef(0);
  const mood = (tutorState && tutorState.emotion) || 'adorable';
  const [prefs, setPrefs] = useState(null);
  const { setMuted } = sp;

  // The person's own bear settings (Me > Bear settings): sound, captions that stay, reduced motion.
  useEffect(() => {
    const use = (p) => {
      setPrefs(p);
      setMuted(!p.sound);
      applyBearPrefs(p);
    };
    use(readBearPrefs());
    return onBearPrefs(use);
  }, [setMuted]);

  useEffect(() => {
    let was = false;
    if (remember) {
      try {
        was = window.sessionStorage.getItem(STORE_KEY) === '1';
      } catch (err) {
        was = false;
      }
    }
    setDismissed(was);
  }, [remember]);

  // Speak each new line once, in the voice of its mood.
  useEffect(() => {
    if (dismissed !== false || !utterance || spokenId.current === utterance.id) return;
    spokenId.current = utterance.id;
    // During a Playground game the bear in the game's own corner does the talking; this one is tucked away, so it stays quiet.
    if (document.documentElement.classList.contains('pg-lock')) return;
    speak(utterance.text, { emotion: utterance.emotion || mood });
  }, [dismissed, utterance, mood, speak]);

  // bear.stop() was called: go quiet.
  useEffect(() => {
    if (!utterance) {
      cancel();
      clearCaption();
    }
  }, [utterance, cancel, clearCaption]);

  // The speech bubble goes away a few seconds after the bear stops talking (unless the ask box is open).
  useEffect(() => {
    if (sp.speaking || !sp.caption || askOpen || asking || (prefs && prefs.captions === 'stay')) return undefined;
    const t = setTimeout(clearCaption, 9000);
    return () => clearTimeout(t);
  }, [sp.speaking, sp.caption, askOpen, asking, clearCaption, prefs]);

  useEffect(() => {
    if (askOpen && inputRef.current) inputRef.current.focus();
  }, [askOpen]);

  const store = (value) => {
    if (!remember) return;
    try {
      window.sessionStorage.setItem(STORE_KEY, value);
    } catch (err) {
      /* private mode: the bear just comes back on the next page load */
    }
  };

  const openAskBox = () => {
    setAskOpen(true);
    speak(scripted('askPrompt'), { emotion: mood });
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    const q = question.trim();
    if (!q || asking) return;
    setQuestion('');
    await ask(q);
  };

  if (dismissed === null) return null; // one frame while storage is read

  const active = !!utterance && (sp.speaking || !!sp.caption);
  const emotion = (active && utterance.emotion) || mood;
  const pose = (active && utterance.pose) || (tutorState && tutorState.pose) || 'idle';
  const text = asking ? thinking : sp.caption;
  const showBubble = askOpen || asking || !!sp.caption;

  return (
    <div
      className={`bear-host ${className}`.trim()}
      style={{ zIndex: 50, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 'min(92vw, 340px)', ...PLACEMENT[placement] }}
    >
      {!dismissed && showBubble && (
        <div className="bear-host__bubble" style={bubbleStyle}>
          {text && (
            <p aria-live="polite" style={{ margin: 0 }}>
              {text}
            </p>
          )}
          {begging && <p style={{ margin: '6px 0 0', fontSize: 13, opacity: 0.8 }}>Click me again if you really want me to go.</p>}
          {askOpen && (
            <form onSubmit={onSubmit} style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <input
                ref={inputRef}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    setAskOpen(false);
                  }
                }}
                placeholder={`Ask ${name} anything`}
                aria-label={`Type your question for ${name}`}
                maxLength={500}
                style={inputStyle}
              />
              <button type="submit" className="bear-host__button" style={buttonStyle} disabled={asking || !question.trim()}>
                Ask
              </button>
            </form>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {sp.needsTap && (
              <button type="button" className="bear-host__button" style={buttonStyle} onClick={sp.unlock}>
                Tap to hear {name}
              </button>
            )}
            {!askOpen && (
              <button type="button" className="bear-host__button" style={buttonStyle} onClick={openAskBox}>
                Ask a question
              </button>
            )}
            <button type="button" className="bear-host__button" style={ghostStyle} onClick={() => writeBearPrefs({ sound: sp.muted })} aria-pressed={sp.muted}>
              {sp.muted ? 'Sound off' : 'Sound on'}
            </button>
            <button
              type="button"
              className="bear-host__button"
              style={ghostStyle}
              onClick={() => {
                setAskOpen(false);
                setBegSignal((n) => n + 1);
              }}
            >
              Hide
            </button>
          </div>
        </div>
      )}
      <BearMascot
        emotion={emotion}
        pose={pose}
        speaking={sp.speaking}
        mouth={sp.speaking ? sp.mouth : undefined}
        accessories={settings.accessories}
        furColor={settings.furColor}
        schoolColors={settings.schoolColors}
        size={narrow ? 'bust' : 'full'}
        width={width || (narrow ? 130 : 190)}
        pointAt={pointSel || undefined}
        celebrate={celebrating && !(prefs && reducedMotion(prefs))}
        startDismissed={dismissed}
        label={name}
        escToDismiss={!askOpen}
        onPress={tapAction === 'ask' ? () => (askOpen ? setAskOpen(false) : openAskBox()) : undefined}
        begSignal={begSignal}
        onBeg={() => {
          setBegging(true);
          speak(scripted('beg'), { emotion: 'pleading' });
        }}
        onStay={() => {
          setBegging(false);
          clearCaption();
        }}
        onDismiss={() => {
          cancel();
          clearCaption();
          store('1');
          setBegging(false);
          setAskOpen(false);
          setDismissed(true);
        }}
        onRecall={() => {
          store('0');
          setDismissed(false);
          speak(scripted('recall'), { emotion: mood });
        }}
      />
    </div>
  );
}

/**
 * The bear that lives on the page. Mount it once (BearRoot does this). Everything else talks to it with useBear().
 *
 * tapAction  'ask' (default): clicking the bear opens the ask box. To dismiss: the Hide button, or Esc twice.
 *            'dismiss':       the original behaviour. Click the bear twice to dismiss; ask with the "Ask a question" button.
 * placement  'bottom-right' (default) | 'bottom-left' | 'inline'
 */
export default function BearHost({ placement = 'bottom-right', width, remember = true, className = '', tapAction = 'ask' }) {
  const view = useContext(BearViewContext);
  if (!view || !view.enabled) return null;
  return <HostInner view={view} placement={placement} width={width} remember={remember} className={className} tapAction={tapAction} />;
}
