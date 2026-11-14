'use client';

// One drag-and-click engine for every Playground board.
//   • Press and release without moving  → a TAP (click). Boards use this to select a piece, then tap where to put it.
//   • Press, move a little, release      → a DRAG. A ghost of the piece follows the finger or mouse; letting go on a square
//     marked data-drop="..." drops it there. Letting go anywhere else cancels, so nothing is played by accident.
// It works with a mouse, a finger and a pen (Pointer Events), and a keyboard press on a button counts as a tap.

import { createElement, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const THRESHOLD = 7; // pixels the pointer must travel before a press becomes a drag
const FINGER_LIFT = 46; // on a touch screen the ghost floats above the finger so the finger does not hide it

export function dropTargetAt(x, y) {
  if (typeof document === 'undefined') return null;
  const el = document.elementFromPoint(x, y);
  const target = el && el.closest ? el.closest('[data-drop]') : null;
  return target ? target.getAttribute('data-drop') : null;
}

export default function useDrag({ onTap, onDrop, renderGhost, size = 52 } = {}) {
  const [drag, setDrag] = useState(null); // { payload, over }
  const ghost = useRef(null);
  const where = useRef({ x: 0, y: 0 });
  const live = useRef({ onTap, onDrop, renderGhost });
  live.current = { onTap, onDrop, renderGhost };
  const cleanup = useRef(null);

  useEffect(() => () => { if (cleanup.current) cleanup.current(); }, []);

  const place = useCallback((point) => {
    where.current = point;
    if (ghost.current) ghost.current.style.transform = `translate3d(${point.x - size / 2}px, ${point.y - size / 2}px, 0)`;
  }, [size]);

  useLayoutEffect(() => {
    if (drag) place(where.current);
  }, [drag, place]);

  // bind(payload, { draggable }) returns the props to spread on an element. Every element should also carry data-drop if it can receive a drop.
  const bind = useCallback((payload, { draggable = true } = {}) => ({
    onPointerDown(event) {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      if (cleanup.current) cleanup.current();
      const start = { x: event.clientX, y: event.clientY };
      const touch = event.pointerType === 'touch' || event.pointerType === 'pen';
      let dragging = false;
      let over = null;
      const point = (ev) => ({ x: ev.clientX, y: ev.clientY - (touch ? FINGER_LIFT : 0) });
      const move = (ev) => {
        if (!draggable) return;
        if (!dragging) {
          if (Math.hypot(ev.clientX - start.x, ev.clientY - start.y) < THRESHOLD) return;
          dragging = true;
          place(point(ev));
          over = dropTargetAt(point(ev).x, point(ev).y);
          setDrag({ payload, over });
          return;
        }
        const p = point(ev);
        place(p);
        const next = dropTargetAt(p.x, p.y);
        if (next !== over) {
          over = next;
          setDrag({ payload, over });
        }
      };
      const stop = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', cancel);
        cleanup.current = null;
      };
      const up = (ev) => {
        stop();
        if (dragging) {
          const p = point(ev);
          const target = dropTargetAt(p.x, p.y);
          setDrag(null);
          if (target && live.current.onDrop) live.current.onDrop(payload, target);
        } else if (live.current.onTap) {
          live.current.onTap(payload);
        }
      };
      const cancel = () => {
        stop();
        if (dragging) setDrag(null);
      };
      cleanup.current = () => { stop(); setDrag(null); };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', cancel);
    },
    // A press on the keyboard (Enter or Space on a button) arrives as a click with no pointer; treat it as a tap.
    onClick(event) {
      if (event.detail === 0 && live.current.onTap) live.current.onTap(payload);
    },
    onDragStart(event) { event.preventDefault(); },
  }), [place]);

  const ghostNode = drag && typeof document !== 'undefined' && live.current.renderGhost
    ? createPortal(
      createElement('div', { ref: ghost, className: 'pg-ghost', 'aria-hidden': true, style: { width: size, height: size } }, live.current.renderGhost(drag.payload)),
      document.body,
    )
    : null;

  return { bind, dragging: drag ? drag.payload : null, over: drag ? drag.over : null, ghost: ghostNode };
}
