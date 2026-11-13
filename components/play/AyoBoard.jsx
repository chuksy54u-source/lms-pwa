'use client';

// Ayo: your six pits are the bottom row. Tap a pit to see where its seeds will land (and what they would win), then tap it again or press Sow.
// You can also pick the seeds up and drag them onto the board. Seeds travel to the right along your row, then back along your opponent's.

import { useMemo, useState } from 'react';
import { Seeds } from './pieces';
import useDrag from './useDrag.js';
import { ayoPreview, lastMoveOf, legalAyoPits } from './logic.js';

export default function AyoBoard({ match, busy, onMove, opp, focus = null }) {
  const state = match.state;
  const you = match.your_side === 1 ? 1 : 0;
  const them = 1 - you;
  const [picked, setPicked] = useState(null);
  const legal = useMemo(() => (busy ? [] : legalAyoPits(state, you)), [state, you, busy]);
  const last = lastMoveOf(match);
  const lastPit = last && last.move && Number.isInteger(last.move.pit) ? last.move.pit : null;

  const play = (pit) => {
    if (busy || !legal.includes(pit)) { setPicked(null); return; }
    setPicked(null);
    onMove({ pit });
  };

  const drag = useDrag({
    renderGhost: ({ count }) => <span className="pg-handful"><Seeds count={count} max={14} /><b>{count}</b></span>,
    onTap: ({ pit }) => {
      if (busy || !legal.includes(pit)) { setPicked(null); return; }
      if (picked === pit) play(pit);
      else setPicked(pit);
    },
    onDrop: ({ pit }) => play(pit),
    size: 64,
  });

  const active = drag.dragging ? drag.dragging.pit : picked;
  const preview = useMemo(() => (active !== null && active !== undefined && legal.includes(active) ? ayoPreview(state, you, active) : null), [active, legal, state, you]);
  const path = new Set(preview ? preview.path : []);
  const taken = new Set(preview ? preview.taken : []);

  // What the tutor is pointing at: pits it talks about, and the pit it would sow (or the one where seeds end).
  const pointed = focus && focus.kind === 'ayo' ? focus : null;
  const pointedPits = new Set(pointed ? [...(pointed.pits || []), ...(Number.isInteger(pointed.from) ? [pointed.from] : []), ...(Number.isInteger(pointed.to) ? [pointed.to] : [])] : []);
  const aimPit = pointed ? (Number.isInteger(pointed.from) ? pointed.from : [...pointedPits][0]) : null;

  const mineRow = Array.from({ length: 6 }, (_, i) => you * 6 + i);
  const theirRow = Array.from({ length: 6 }, (_, i) => them * 6 + (5 - i));

  const pit = (index, mine) => {
    const count = state.pits[index];
    const can = mine && legal.includes(index);
    const classes = [
      'pg-pit',
      mine ? 'is-mine' : 'is-theirs',
      can ? 'can-play' : '',
      active === index ? 'is-selected' : '',
      path.has(index) ? 'in-path' : '',
      preview && preview.last === index ? 'is-landing' : '',
      taken.has(index) ? 'is-taken' : '',
      lastPit === index ? 'is-last' : '',
      pointedPits.has(index) ? 'is-focus' : '',
      pointed && pointed.from === index ? 'is-focus-start' : '',
      pointed && pointed.to === index ? 'is-focus-end' : '',
      mine && !can && count === 0 ? 'is-empty' : '',
    ].filter(Boolean).join(' ');
    const label = `${mine ? 'Your' : `${opp}’s`} pit ${(index % 6) + 1}, ${count} seed${count === 1 ? '' : 's'}${can ? ', you can sow it' : ''}`;
    return (
      <button
        key={index}
        type="button"
        data-drop={`pit:${index}`}
        data-pg-focus={index === aimPit ? 'true' : undefined}
        aria-label={label}
        className={classes}
        {...drag.bind({ pit: index, count }, { draggable: can })}
      >
        <span className="pg-pit-bowl"><Seeds count={count} /></span>
        <b className="pg-pit-count">{count}</b>
        <i className="pg-pit-no" aria-hidden="true">{(index % 6) + 1}</i>
      </button>
    );
  };

  const message = busy ? `Waiting for ${opp}` : preview ? (preview.captured ? `Sowing pit ${(active % 6) + 1} wins ${preview.captured} seeds` : `Sowing pit ${(active % 6) + 1}: ${state.pits[active]} seeds`) : 'Your move: pick a pit';

  return (
    <div className="pg-game pg-game--ayo">
      <div className="pg-stage">
        <div className={`pg-board pg-ayo ${drag.dragging ? 'is-dragging' : ''}`} role="group" aria-label="Ayo board" data-drop="pit:board">
          <div className="pg-store is-theirs" aria-label={`${opp}’s seeds won`}>
            <Seeds count={state.scores[them]} max={18} />
            <b>{state.scores[them]}</b>
          </div>
          <div className="pg-ayo-rows">
            <div className="pg-row is-theirs">{theirRow.map((p) => pit(p, false))}</div>
            <div className="pg-row is-mine">{mineRow.map((p) => pit(p, true))}</div>
          </div>
          <div className="pg-store is-mine" aria-label="Your seeds won">
            <Seeds count={state.scores[you]} max={18} />
            <b>{state.scores[you]}</b>
          </div>
        </div>
      </div>
      <div className="pg-dock">
        <p className={`pg-status ${preview && preview.captured ? 'is-good' : ''}`} role="status">{message}</p>
        <p className="pg-hint">First to 25 seeds wins. Tap a pit to preview, tap it again to sow. Or drag its seeds onto the board.</p>
        <div className="pg-actions">
          <button type="button" className="pg-btn pg-btn--primary" disabled={busy || !preview} onClick={() => play(active)}>Sow these seeds</button>
        </div>
      </div>
      {drag.ghost}
    </div>
  );
}
