'use client';

// The property game: a ring of 24 spaces. Tap the big dice to roll, watch your token hop round, and buy or pass when you land on a free property.
// Tap any space to read its price and rent.

import { useEffect, useMemo, useState } from 'react';
import { Die } from './pieces';
import { PROPERTY_RING, propertyTone, seatName } from './logic.js';

const ICON = { start: '➜', chance: '✦', fee: '◈', rest: '☾' };
const SIDE_NAME = ['you', 'them'];

export default function PropertyBoard({ match, busy, onMove, previous, opp, focus = null }) {
  const state = match.state;
  const spaces = state.spaces || [];
  const count = state.players.length;
  const you = Math.min(match.your_side || 0, count - 1);
  const names = state.players.map((_, side) => seatName(match, side, opp));
  const mover = names[state.side] || opp;
  const pointed = focus && focus.kind === 'property' ? focus.spaces || [] : [];
  const [info, setInfo] = useState(null);
  const [rolling, setRolling] = useState(false);
  const pending = state.pending_purchase;
  const space = pending !== null && pending !== undefined ? spaces[pending] : null;
  const me = state.players[you];
  const canAfford = space ? me.cash >= space.cost : false;

  // Tokens hop from where they were to where they are now, one space at a time.
  const from = previous && previous.state && previous.state.players ? previous.state.players.map((p) => p.position) : null;
  const [shown, setShown] = useState(() => state.players.map((p, i) => (from ? from[i] : p.position)));
  useEffect(() => {
    const timers = [];
    state.players.forEach((p, i) => {
      let at = from ? from[i] : p.position;
      const goal = p.position;
      const steps = (goal - at + 24) % 24;
      for (let s = 1; s <= steps; s++) {
        timers.push(setTimeout(() => setShown((cur) => { const next = [...cur]; next[i] = (at + s) % 24; return next; }), 150 * s + (i === you ? 0 : 150 * 4)));
      }
      if (!steps) setShown((cur) => { const next = [...cur]; next[i] = goal; return next; });
    });
    return () => timers.forEach(clearTimeout);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const moved = useMemo(() => {
    if (!from) return null;
    const mine = (state.players[you].position - from[you] + 24) % 24;
    return mine || null;
  }, [from, state.players, you]);

  const showing = info !== null ? spaces[info] : null;
  const ownerOf = (index) => state.owner_by_space[index];
  const roll = () => { if (busy || pending !== null) return; setRolling(true); onMove({ action: 'roll' }); };

  return (
    <div className="pg-game pg-game--property">
      <div className="pg-stage">
        <div className="pg-board pg-property" role="group" aria-label="Property board">
          {spaces.map((sp, index) => {
            const [row, col] = PROPERTY_RING[index];
            const owner = ownerOf(index);
            const here = state.players.map((_, i) => i).filter((i) => shown[i] === index && !state.players[i].out);
            const tone = propertyTone(sp);
            return (
              <button
                key={index}
                type="button"
                className={`pg-space is-${sp.type} ${tone} ${owner !== undefined ? `owned-${SIDE_NAME[owner === you ? 0 : 1]} owner-p${owner}` : ''} ${info === index ? 'is-picked' : ''} ${pending === index ? 'is-pending' : ''} ${pointed.includes(index) ? 'is-focus' : ''}`}
                data-pg-focus={index === pointed[0] ? 'true' : undefined}
                style={{ gridRow: row + 1, gridColumn: col + 1 }}
                aria-label={`${sp.name}${sp.cost ? `, costs ${sp.cost}, rent ${sp.rent}` : ''}${owner !== undefined ? (owner === you ? ', yours' : `, owned by ${names[owner]}`) : ''}`}
                onClick={() => setInfo(info === index ? null : index)}
              >
                {sp.type === 'property' && <i className="pg-band" />}
                <span className="pg-space-icon" aria-hidden>{ICON[sp.type] || ''}</span>
                <span className="pg-space-name">{sp.name}</span>
                {sp.cost && <b className="pg-space-price">{sp.cost}</b>}
                {sp.type === 'fee' && <b className="pg-space-price">−{sp.amount}</b>}
                {sp.type === 'start' && <b className="pg-space-price">+200</b>}
                <span className="pg-tokens">
                  {here.map((i) => <em key={i} className={`pg-token pg-token--p${i} ${i === you ? 'is-you' : 'is-them'}`} title={names[i]}>{i === you ? 'You' : String(names[i] || 'Them').slice(0, 1)}</em>)}
                </span>
              </button>
            );
          })}

          <div className="pg-centre" style={{ gridRow: '2 / 7', gridColumn: '2 / 7' }}>
            {space && !busy ? (
              <div className="pg-offer" role="group" aria-label="Buy this property?">
                <span className={`pg-offer-band ${propertyTone(space)}`} />
                <h3>{space.name}</h3>
                <p>Costs <b>{space.cost}</b> coins. Rent <b>{space.rent}</b> when {count > 2 ? 'someone else' : opp} lands here.</p>
                <div className="pg-offer-actions">
                  <button type="button" className="pg-btn pg-btn--primary" disabled={!canAfford} onClick={() => onMove({ action: 'buy' })}>Buy for {space.cost}</button>
                  <button type="button" className="pg-btn pg-btn--quiet" onClick={() => onMove({ action: 'pass' })}>Skip</button>
                </div>
                {!canAfford && <p className="pg-hint">You have {me.cash} coins, not enough yet.</p>}
              </div>
            ) : (
              <>
                {showing ? (
                  <div className="pg-info" role="status">
                    <h3>{showing.name}</h3>
                    {showing.type === 'property' && <p>Costs {showing.cost} · rent {showing.rent}{ownerOf(info) !== undefined ? ` · ${ownerOf(info) === you ? 'yours' : `${names[ownerOf(info)]}’s`}` : ' · free to buy'}</p>}
                    {showing.type === 'fee' && <p>Pay {showing.amount} coins.</p>}
                    {showing.type === 'chance' && <p>Pick up a surprise: win coins, lose coins or skip ahead.</p>}
                    {showing.type === 'start' && <p>Pass Start to collect 200 coins.</p>}
                    {showing.type === 'rest' && <p>A calm stop. Nothing to pay.</p>}
                  </div>
                ) : (
                  <p className="pg-centre-title">{moved && !busy ? `You moved ${moved} spaces` : 'Property'}</p>
                )}
                <button type="button" className={`pg-dice ${rolling || (busy && match.status === 'active') ? 'is-rolling' : ''}`} disabled={busy || pending !== null} onClick={roll} aria-label="Roll the dice">
                  <Die value={rolling ? 5 : 3} rolling={rolling} size="lg" />
                  <Die value={rolling ? 2 : 4} rolling={rolling} size="lg" />
                  <span className="pg-dice-label">{busy ? (rolling ? 'Rolling…' : `${mover}’s turn`) : 'Tap to roll'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="pg-dock">
        <p className="pg-status" role="status">{busy ? `Waiting for ${mover}` : pending !== null ? 'Buy it or skip it' : 'Your turn: roll the dice'}</p>
        <p className="pg-hint">Land on a free property to buy it. Pass Start for 200 coins. Tap any space to read it.</p>
      </div>
    </div>
  );
}
