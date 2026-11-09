'use client';

import { useEffect, useRef, useState } from 'react';
import BearMascot from './BearMascot';
import useBearSpeech from './useBearSpeech';

const STORE_KEY = 'bearilly:dismissed';

const PLACEMENT = {
  'bottom-right': { position: 'fixed', right: 16, bottom: 16, alignItems: 'flex-end' },
  'bottom-left': { position: 'fixed', left: 16, bottom: 16, alignItems: 'flex-start' },
  inline: { alignItems: 'flex-start' },
};

// Default look for the speech bubble. Restyle it with the classes bear-guide, bear-guide__bubble
// and bear-guide__button, or skip BearGuide and wire BearMascot + useBearSpeech yourself.
const bubbleStyle = {
  background: '#FFF8EA',
  color: '#4A2C17',
  border: '3px solid #5A3A22',
  borderRadius: 18,
  padding: '10px 14px',
  font: '500 15px/1.4 system-ui, -apple-system, "Segoe UI", sans-serif',
  boxShadow: '0 4px 0 rgba(90, 58, 34, 0.25)',
};
const buttonStyle = {
  appearance: 'none',
  cursor: 'pointer',
  border: '2px solid #5A3A22',
  background: '#C99B68',
  color: '#2B1A10',
  borderRadius: 999,
  padding: '6px 12px',
  font: '600 13px/1 system-ui, -apple-system, "Segoe UI", sans-serif',
};
const ghostStyle = { ...buttonStyle, background: 'transparent' };

/**
 * Bear + voice + captions in one piece.
 *
 *   <BearGuide tutorState={state} settings={school.tutor} pointAt="#start-lesson" />
 *
 * tutorState  the JSON from GET /api/v1/students/:id/tutor-state  { emotion, pose, say, ... }
 * say         optional line that overrides tutorState.say (for example a page-specific hint)
 * settings    what a school admin can set:
 *               { tutorName, greeting, furColor, accessories: { head, face, neck },
 *                 schoolColors: { primary, secondary }, voice: { gender, lang, preferred, rate, pitch } }
 * placement   'bottom-right' (default) | 'bottom-left' | 'inline'
 * remember    keep the bear dismissed for the rest of the browser session (default true)
 */
export default function BearGuide({
  tutorState,
  say,
  settings = {},
  pointAt,
  placement = 'bottom-right',
  size = 'full',
  width,
  remember = true,
  celebrate = false,
  className = '',
  onDismiss,
  onRecall,
}) {
  const emotion = (tutorState && tutorState.emotion) || 'adorable';
  const pose = (tutorState && tutorState.pose) || 'idle';
  const line = say || (tutorState && tutorState.say) || settings.greeting || '';
  const name = settings.tutorName || 'Bearilly';

  const sp = useBearSpeech({ voice: settings.voice });
  const speak = sp.speak;
  const [dismissed, setDismissed] = useState(null); // null until sessionStorage has been read
  const spoken = useRef('');

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

  // Say each new line once, in the voice of the current mood.
  useEffect(() => {
    if (dismissed !== false || !line) return;
    const key = `${emotion}|${line}`;
    if (spoken.current === key) return;
    spoken.current = key;
    speak(line, { emotion });
  }, [dismissed, line, emotion, speak]);

  const store = (value) => {
    if (!remember) return;
    try {
      window.sessionStorage.setItem(STORE_KEY, value);
    } catch (err) {
      /* private mode: the bear just comes back on the next page load */
    }
  };

  if (dismissed === null) return null; // one frame while storage is read

  return (
    <div
      className={`bear-guide ${className}`.trim()}
      style={{ zIndex: 50, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 'min(92vw, 340px)', ...PLACEMENT[placement] }}
    >
      {!dismissed && (
        <div className="bear-guide__bubble" style={bubbleStyle}>
          <p aria-live="polite" style={{ margin: 0 }}>
            {sp.caption || line}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {sp.needsTap && (
              <button type="button" className="bear-guide__button" style={buttonStyle} onClick={sp.unlock}>
                Tap to hear {name}
              </button>
            )}
            <button type="button" className="bear-guide__button" style={ghostStyle} onClick={sp.toggleMute} aria-pressed={sp.muted}>
              {sp.muted ? 'Sound off' : 'Sound on'}
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
        size={size}
        width={width}
        pointAt={pointAt}
        celebrate={celebrate}
        startDismissed={dismissed}
        label={name}
        onBeg={() => speak('Please do not go!', { emotion: 'pleading' })}
        onStay={sp.clearCaption}
        onDismiss={() => {
          sp.cancel();
          sp.clearCaption();
          store('1');
          setDismissed(true);
          if (onDismiss) onDismiss();
        }}
        onRecall={() => {
          store('0');
          spoken.current = '';
          setDismissed(false);
          if (onRecall) onRecall();
        }}
      />
    </div>
  );
}
