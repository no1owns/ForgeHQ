import { useState } from 'react';
import { readCharacter, characterBand } from '../tokens/character.js';

const BANDS = ['Conventional', 'Emerging', 'Characterful', 'Distinctive', 'Highly differentiated'];

/**
 * Demoted to a collapsed-by-default panel, not a headline number in the
 * main workspace — usability and interoperability take priority over
 * encouraging anyone to maximize this score. Collapsed, it shows only the
 * band name and an expand control; nothing here is styled to draw the eye
 * the way the comparison/export controls are.
 */
export default function CharacterPanel({ currentSystem, baselineSystem }) {
  const [open, setOpen] = useState(false);
  const [showWhy, setShowWhy] = useState(false);
  const current = readCharacter(currentSystem);
  const baseline = readCharacter(baselineSystem);

  return (
    <section className="character-panel">
      <button className="character-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span>Visual character <small>(experimental, collapsed by default)</small></span>
        <b>{characterBand(current.score)}</b>
      </button>

      {open && (
        <div className="character-body">
          <p className="hint">A reading of your choices, not a verdict on your brand — and not an accessibility, uniqueness, or quality score. See "Why this reading?" below.</p>
          <div className="band-labels">
            {BANDS.map((b) => <span key={b} className={characterBand(current.score) === b ? 'current-band' : ''}>{b}</span>)}
          </div>
          <div className="ruler">
            <span className="old-marker" style={{ left: `${baseline.score}%` }} title="Saved direction reading">{baseline.score}</span>
            <span className="current-marker" style={{ left: `${current.score}%` }} title="Current exploration reading">{current.score}</span>
          </div>
          <div className="ruler-ticks">{[0, 25, 50, 75, 100].map((x) => <span key={x}>{x}</span>)}</div>

          <button className="text-button" aria-expanded={showWhy} onClick={() => setShowWhy(!showWhy)}>{showWhy ? 'Hide criteria' : 'Why this reading?'}</button>
          {showWhy && (
            <div className="criteria">
              <p>Four hand-authored rules, not a trained model or a comparison with existing brands. Scores reflect this limited rubric, not market rarity — popular choices are not inherently worse. Needs designer validation before being relied on.</p>
              {current.rules.map((rule) => (
                <div className="rule" key={rule.name}>
                  <b>{rule.name} &middot; {rule.value} points</b>
                  <p>{rule.why}</p>
                </div>
              ))}
              <p className="hint">Consistency, expressive range, and fit with brand intent need human review across the preview contexts — not measured here. Accessibility is checked separately (see the contrast readouts in the Color panel), not folded into this score.</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
