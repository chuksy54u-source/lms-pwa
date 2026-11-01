'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import BearLayers from './BearArt';
import { BEAR_CSS } from './bearCss';
import { ACCESSORIES, DEFAULT_WIDTH, EMOTIONS, EYES, MOUTHS, POSES, SIZES, VIEWBOXES } from './bearMeta';
import { MOOD_RANK, aimAngle, furTokens, lookFor, nextMouth, randomBetween, schoolTokens } from './bearCore';

const Layers = memo(BearLayers); // static art: React never re-renders it, state changes only touch the <svg> attributes
const MOOD_WORD = { adorable: 'happy', worried: 'worried', intense: 'determined', pleading: 'pleading' };
const NO_AIM = { on: false, side: 'r', look: 'none' };
const oneOf = (list, v, fallback) => (list.includes(v) ? v : fallback);

/**
 * Bearilly, the animated bear. The backend decides the mood; this component only draws it.
 *
 * Spec props:  emotion, mouth, eyes, pose, accessories, furColor, size, speaking, pointAt, onDismiss
 * Extras:      schoolColors, width, celebrate, dismissible, escToDismiss, startDismissed, onBeg, onStay, onRecall,
 *              onPress (click on a standing bear), begSignal (host starts the dismiss: change the number),
 *              label, className, style
 *
 * mouth / eyes are optional. Leave them out and the bear blinks on its own and moves its jaw while
 * `speaking` is true. Pass them to drive the face yourself (for example from useBearSpeech).
 */
export default function BearMascot({
  emotion = 'adorable',
  mouth,
  eyes,
  pose = 'idle',
  accessories,
  furColor,
  schoolColors,
  size = 'full',
  width,
  speaking = false,
  pointAt,
  celebrate = false,
  dismissible = true,
  escToDismiss = true,
  startDismissed = false,
  onDismiss,
  onBeg,
  onStay,
  onRecall,
  onPress,
  begSignal = 0,
  label = 'Bearilly',
  className = '',
  style,
}) {
  const svgRef = useRef(null);
  const [phase, setPhase] = useState(startDismissed ? 'gone' : 'shown'); // shown | begging | leaving | gone
  const phaseRef = useRef(phase);
  const [blink, setBlink] = useState('open');
  const [jaw, setJaw] = useState('closed');
  const [fade, setFade] = useState(false);
  const [bounce, setBounce] = useState(false);
  const [entering, setEntering] = useState(false);
  const [aim, setAim] = useState(NO_AIM);
  const begTimer = useRef(0);
  const leaveTimer = useRef(0);
  const enterTimer = useRef(0);
  const callbacks = useRef({});
  callbacks.current = { onDismiss, onBeg, onStay, onRecall, onPress };

  const sz = oneOf(SIZES, size, 'full');
  const em = oneOf(EMOTIONS, emotion, 'adorable');
  const begging = phase === 'begging';
  const leaving = phase === 'leaving';

  // ---------------------------------------------------------------- what is drawn right now
  const wantsPoint = !!pointAt && (pose === 'idle' || pose === 'point') && phase === 'shown';
  const pointing = wantsPoint && aim.on;
  const shownEmotion = begging ? 'pleading' : leaving ? 'adorable' : em;
  const shownPose = begging ? 'clasp' : leaving ? 'wave' : pointing ? 'point' : oneOf(POSES, pose, 'idle');
  const shownSide = leaving ? 'r' : pointing ? aim.side : 'r';
  const shownMouth = mouth ? oneOf(MOUTHS, mouth, 'closed') : speaking ? jaw : 'closed';
  const shownEyes = eyes ? oneOf(EYES, eyes, 'open') : blink;
  const shownLook = pointing && shownEmotion === 'adorable' ? aim.look : 'none';

  // ---------------------------------------------------------------- dismiss: tap 1 begs, tap 2 leaves
  const setPhaseNow = useCallback((p) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  const tap = useCallback(() => {
    if (!dismissible) return;
    const p = phaseRef.current;
    if (p === 'shown') {
      setPhaseNow('begging');
      if (callbacks.current.onBeg) callbacks.current.onBeg();
      clearTimeout(begTimer.current);
      begTimer.current = setTimeout(() => {
        if (phaseRef.current === 'begging') {
          setPhaseNow('shown'); // the 4 second window closed: the bear stays
          if (callbacks.current.onStay) callbacks.current.onStay();
        }
      }, 4000);
    } else if (p === 'begging') {
      clearTimeout(begTimer.current);
      setPhaseNow('leaving');
      leaveTimer.current = setTimeout(() => {
        setPhaseNow('gone');
        if (callbacks.current.onDismiss) callbacks.current.onDismiss();
      }, 600);
    }
  }, [dismissible, setPhaseNow]);

  const recall = useCallback(() => {
    setPhaseNow('shown');
    setEntering(true);
    clearTimeout(enterTimer.current);
    enterTimer.current = setTimeout(() => setEntering(false), 600);
    if (callbacks.current.onRecall) callbacks.current.onRecall();
  }, [setPhaseNow]);

  // A click on a standing bear. If the host gave onPress (the "ask me" box), the click goes there and dismissing
  // starts elsewhere (begSignal, or Esc twice). A click on a begging bear still sends it away.
  const press = useCallback(() => {
    if (phaseRef.current === 'shown' && callbacks.current.onPress) {
      callbacks.current.onPress();
      return;
    }
    tap();
  }, [tap]);

  // The host can start the "please do not go" step itself, for example from a Hide button.
  const lastBeg = useRef(begSignal);
  useEffect(() => {
    if (begSignal === lastBeg.current) return;
    lastBeg.current = begSignal;
    if (phaseRef.current === 'shown') tap();
  }, [begSignal, tap]);

  useEffect(() => {
    if (!dismissible || !escToDismiss) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape' && !e.defaultPrevented && !e.repeat) tap(); // Esc twice = double tap
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dismissible, escToDismiss, tap]);

  useEffect(
    () => () => {
      clearTimeout(begTimer.current);
      clearTimeout(leaveTimer.current);
      clearTimeout(enterTimer.current);
    },
    [],
  );

  // ---------------------------------------------------------------- blink: every 3 to 6 s, 120 ms, now and then a double blink
  useEffect(() => {
    if (eyes) return undefined;
    let id = 0;
    const later = (fn, ms) => {
      id = setTimeout(fn, ms);
    };
    const cycle = () =>
      later(() => {
        setBlink('closed');
        later(() => {
          setBlink('open');
          if (Math.random() < 0.18) {
            later(() => {
              setBlink('closed');
              later(() => {
                setBlink('open');
                cycle();
              }, 110);
            }, 140);
          } else cycle();
        }, 120);
      }, randomBetween(3000, 6000));
    cycle();
    return () => clearTimeout(id);
  }, [eyes]);

  // ---------------------------------------------------------------- talking jaw, used when the parent gives `speaking` but no `mouth`
  useEffect(() => {
    if (!speaking || mouth) {
      setJaw('closed');
      return undefined;
    }
    let id = 0;
    const tick = () => {
      setJaw((m) => nextMouth(m));
      id = setTimeout(tick, randomBetween(110, 160));
    };
    tick();
    return () => clearTimeout(id);
  }, [speaking, mouth]);

  // ---------------------------------------------------------------- mood change: cross-fade, and a small bounce when it improves
  const prevEmotion = useRef(shownEmotion);
  useEffect(() => {
    const prev = prevEmotion.current;
    if (prev === shownEmotion) return undefined;
    prevEmotion.current = shownEmotion;
    setFade(true);
    const t1 = setTimeout(() => setFade(false), 450);
    let t2 = 0;
    const a = MOOD_RANK[shownEmotion];
    const b = MOOD_RANK[prev];
    if (a !== undefined && b !== undefined && a < b) {
      setBounce(true);
      t2 = setTimeout(() => setBounce(false), 650);
    }
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [shownEmotion]);

  // ---------------------------------------------------------------- pointAt: rotate the nearer arm toward the target
  useEffect(() => {
    const svg = svgRef.current;
    const reset = () => {
      if (!svg) return;
      svg.style.removeProperty('--aim-r');
      svg.style.removeProperty('--aim-l');
    };
    if (!svg || !wantsPoint) {
      reset();
      setAim((a) => (a.on ? NO_AIM : a));
      return undefined;
    }
    let raf = 0;
    const toScreen = (m, x, y) => {
      const p = new DOMPoint(x, y).matrixTransform(m);
      return [p.x, p.y];
    };
    const update = () => {
      raf = 0;
      let target = null;
      try {
        target = document.querySelector(pointAt);
      } catch (err) {
        target = null;
      }
      const armR = svg.querySelector('.aim-r');
      const armL = svg.querySelector('.aim-l');
      const wrapR = armR && armR.parentNode; // static group whose origin is the shoulder
      const wrapL = armL && armL.parentNode;
      const mR = wrapR && wrapR.getScreenCTM();
      const mL = wrapL && wrapL.getScreenCTM();
      if (!target || !mR || !mL) {
        reset();
        setAim((a) => (a.on ? NO_AIM : a));
        return;
      }
      const r = target.getBoundingClientRect();
      const tx = r.left + r.width / 2;
      const ty = r.top + r.height / 2;
      const [midX] = toScreen(mR, -60, 0); // figure x=200 is the bear's midline
      const side = tx < midX ? 'l' : 'r';
      const p = new DOMPoint(tx, ty).matrixTransform((side === 'r' ? mR : mL).inverse());
      const deg = aimAngle(side, p.x, p.y);
      svg.style.setProperty(side === 'r' ? '--aim-r' : '--aim-l', `${deg.toFixed(1)}deg`);
      svg.style.setProperty(side === 'r' ? '--aim-l' : '--aim-r', '0deg');
      const [hx, hy] = toScreen(mR, -60, -140); // head centre on screen
      const look = lookFor(tx - hx, ty - hy, svg.getBoundingClientRect().width || 1);
      setAim((a) => (a.on && a.side === side && a.look === look ? a : { on: true, side, look }));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    schedule();
    const late = [setTimeout(schedule, 250), setTimeout(schedule, 1000)]; // layout and fonts settle
    window.addEventListener('resize', schedule);
    window.addEventListener('scroll', schedule, true);
    return () => {
      cancelAnimationFrame(raf);
      late.forEach(clearTimeout);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', schedule, true);
    };
  }, [pointAt, wantsPoint, sz]);

  // ---------------------------------------------------------------- render
  const acc = accessories || {};
  const tokens = useMemo(
    () => ({ ...furTokens(furColor), ...schoolTokens(schoolColors) }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [furColor, schoolColors && schoolColors.primary, schoolColors && schoolColors.secondary],
  );

  const art = (
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      className="bearilly"
      viewBox={VIEWBOXES[sz]}
      role="img"
      aria-label={`${label}, looking ${MOOD_WORD[shownEmotion]}`}
      data-size={sz}
      data-emotion={shownEmotion}
      data-eyes={shownEyes}
      data-mouth={shownMouth}
      data-pose={shownPose}
      data-side={shownSide}
      data-look={shownLook}
      data-acc-head={oneOf(ACCESSORIES.head, acc.head, 'none')}
      data-acc-face={oneOf(ACCESSORIES.face, acc.face, 'none')}
      data-acc-neck={oneOf(ACCESSORIES.neck, acc.neck, 'none')}
      data-fade={fade ? '' : undefined}
      data-celebrate={celebrate || bounce ? '' : undefined}
      data-speaking={speaking ? 'true' : 'false'}
      style={{ width: '100%', height: 'auto' }}
    >
      <Layers />
    </svg>
  );

  return (
    <span
      className={`bearilly-root ${className}`.trim()}
      data-phase={phase}
      data-entering={entering ? '' : undefined}
      style={{ width: phase === 'gone' ? 'auto' : width || DEFAULT_WIDTH[sz], ...tokens, ...style }}
    >
      <style dangerouslySetInnerHTML={{ __html: BEAR_CSS }} />
      {phase === 'gone' ? (
        <button type="button" className="bearilly-tab" onClick={recall} aria-label={`Call ${label} back`} title={`Call ${label} back`}>
          <PawIcon />
        </button>
      ) : dismissible ? (
        <button
          type="button"
          className="bearilly-hit"
          onClick={press}
          aria-label={begging ? `${label} is asking to stay. Press again to send ${label} away.` : onPress ? `${label}. Press to ask a question.` : `${label}. Press twice to dismiss.`}
        >
          {art}
        </button>
      ) : (
        art
      )}
    </span>
  );
}

function PawIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <g fill="#5A3A22">
        <ellipse cx="12" cy="16" rx="5.5" ry="4.6" />
        <ellipse cx="5.6" cy="11" rx="2.1" ry="2.7" />
        <ellipse cx="9.4" cy="6.6" rx="2.1" ry="2.9" />
        <ellipse cx="14.6" cy="6.6" rx="2.1" ry="2.9" />
        <ellipse cx="18.4" cy="11" rx="2.1" ry="2.7" />
      </g>
    </svg>
  );
}
