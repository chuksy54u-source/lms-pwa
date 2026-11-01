'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { chunkText, clamp, estimateMs, moodSpeech, nextMouth, pickVoice, randomBetween } from './bearCore';

const hasSpeech = () =>
  typeof window !== 'undefined' && 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function';

/**
 * Text-to-speech for the bear.
 *
 *   const sp = useBearSpeech({ voice: { gender: 'feminine', lang: 'en-NG' } });
 *   sp.speak('Well done!', { emotion: 'adorable' });
 *   <BearMascot speaking={sp.speaking} mouth={sp.speaking ? sp.mouth : undefined} />
 *
 * Every line also lands in `caption`, so the UI can always show it. If the browser cannot speak
 * (muted, still locked, no support) the bear "talks" silently for a natural length instead.
 */
export default function useBearSpeech(options = {}) {
  const prefs = options.voice || {};
  const [supported, setSupported] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [muted, setMutedState] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [mouth, setMouth] = useState('closed');
  const [caption, setCaption] = useState('');
  const [voiceUsed, setVoiceUsed] = useState('');

  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;
  const mutedRef = useRef(false);
  const readyRef = useRef(false);
  const pendingRef = useRef(null); // a line waiting for the first tap
  const runRef = useRef(0); // id of the current speech run; callbacks from an older run ignore themselves
  const timers = useRef([]);
  const voices = useRef([]);
  const speakRef = useRef(null);

  const later = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  }, []);
  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const cancel = useCallback(() => {
    runRef.current += 1;
    clearTimers();
    if (hasSpeech()) window.speechSynthesis.cancel();
    setSpeaking(false);
    setMouth('closed');
  }, [clearTimers]);

  // Step the jaw on a timer (110 to 160 ms per step) until `stop()` says the browser's word events took over.
  const jawTimer = useCallback(
    (run, stop) => {
      const tick = () => {
        if (runRef.current !== run || (stop && stop())) return;
        setMouth((m) => nextMouth(m));
        later(tick, randomBetween(110, 160));
      };
      tick();
    },
    [later],
  );

  const speak = useCallback(
    (text, opts = {}) => {
      const line = String(text || '').trim();
      if (!line) return;
      const synth = hasSpeech() ? window.speechSynthesis : null;
      const busy = !!synth && (synth.speaking || synth.pending);
      cancel(); // one voice at a time; this also bumps the run id
      const run = runRef.current;
      setCaption(line);
      pendingRef.current = null;
      setSpeaking(true);

      const finish = () => {
        if (runRef.current !== run) return;
        clearTimers();
        setSpeaking(false);
        setMouth('closed');
        if (opts.onEnd) opts.onEnd();
      };

      if (!synth || mutedRef.current || !readyRef.current) {
        if (synth && !mutedRef.current) pendingRef.current = { text: line, opts }; // speak it on the first tap
        jawTimer(run);
        later(finish, estimateMs(line));
        return;
      }

      const begin = () => {
        if (runRef.current !== run) return;
        const list = voices.current.length ? voices.current : synth.getVoices();
        const { voice, nudge, how } = pickVoice(list, prefsRef.current);
        setVoiceUsed(voice ? `${voice.name} (${how})` : 'browser default');
        const { rate, pitch } = moodSpeech(opts.emotion || 'adorable', prefsRef.current, nudge);
        const chunks = chunkText(line);
        let started = false;
        let boundarySeen = false;
        let wordIds = [];

        const onWord = (e) => {
          boundarySeen = true;
          wordIds.forEach(clearTimeout);
          setMouth('wide');
          wordIds = [
            later(() => setMouth('half'), 110),
            later(() => setMouth('closed'), clamp((e.charLength || 4) * 55, 170, 420)),
          ];
        };

        const next = (i) => {
          if (runRef.current !== run) return;
          if (i >= chunks.length) {
            finish();
            return;
          }
          const u = new window.SpeechSynthesisUtterance(chunks[i]);
          if (voice) u.voice = voice;
          u.lang = (voice && voice.lang) || prefsRef.current.lang || 'en-NG';
          u.rate = rate;
          u.pitch = pitch;
          u.onstart = () => {
            if (started || runRef.current !== run) return;
            started = true;
            jawTimer(run, () => boundarySeen);
          };
          u.onboundary = (e) => {
            if (runRef.current === run && (!e.name || e.name === 'word')) onWord(e);
          };
          u.onend = () => next(i + 1);
          u.onerror = (e) => {
            if (runRef.current !== run) return; // we cancelled it on purpose
            if (e.error === 'not-allowed') {
              readyRef.current = false;
              setAudioReady(false);
              pendingRef.current = { text: line, opts };
            }
            finish();
          };
          synth.speak(u);
        };
        next(0);
      };

      // Chrome can drop a speak() that comes straight after cancel() while something was playing.
      if (busy) later(begin, 60);
      else begin();
    },
    [cancel, clearTimers, jawTimer, later],
  );
  speakRef.current = speak;

  useEffect(() => {
    if (!hasSpeech()) return undefined;
    setSupported(true);
    const synth = window.speechSynthesis;
    const load = () => {
      voices.current = synth.getVoices();
    };
    load();
    if (synth.addEventListener) synth.addEventListener('voiceschanged', load);

    // Browsers keep audio locked until the page has had a real tap, click or key press.
    const markReady = () => {
      readyRef.current = true;
      setAudioReady(true);
      const p = pendingRef.current;
      if (p && speakRef.current) speakRef.current(p.text, p.opts);
    };
    if (navigator.userActivation && navigator.userActivation.hasBeenActive) {
      readyRef.current = true;
      setAudioReady(true);
    }
    const events = ['pointerup', 'keydown', 'touchend', 'click'];
    events.forEach((n) => window.addEventListener(n, markReady, { once: true, passive: true }));
    return () => {
      if (synth.removeEventListener) synth.removeEventListener('voiceschanged', load);
      events.forEach((n) => window.removeEventListener(n, markReady));
      cancel();
    };
  }, [cancel]);

  // Call this from the "Tap to hear Bearilly" button: the tap itself is what the browser wants.
  const unlock = useCallback(() => {
    readyRef.current = true;
    setAudioReady(true);
    const p = pendingRef.current;
    if (p) {
      speak(p.text, p.opts);
      return;
    }
    if (hasSpeech() && !window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
      const u = new window.SpeechSynthesisUtterance(' ');
      u.volume = 0;
      window.speechSynthesis.speak(u);
    }
  }, [speak]);

  const setMuted = useCallback(
    (v) => {
      mutedRef.current = !!v;
      setMutedState(!!v);
      if (v) cancel();
    },
    [cancel],
  );
  const toggleMute = useCallback(() => setMuted(!mutedRef.current), [setMuted]);
  const clearCaption = useCallback(() => setCaption(''), []);

  return {
    speak,
    cancel,
    unlock,
    speaking,
    mouth,
    caption,
    clearCaption,
    muted,
    setMuted,
    toggleMute,
    supported,
    audioReady,
    needsTap: supported && !muted && !audioReady,
    voiceUsed,
  };
}
