import { GUIDED_DIMENSIONS, computeGuidedEdits } from '../tokens/guided.js';

/**
 * Plain-language choices that edit the SAME underlying system Studio mode
 * edits — each one computes an explicit set of token diffs (see
 * tokens/guided.js) and applies them via APPLY_TOKEN_DIFF, respecting
 * locks. Nothing here is a separate "guided system"; switching to Studio
 * shows the exact tokens these choices just changed.
 */
export default function GuidedPanel({ system, locks, onApply }) {
  return (
    <section className="control-section guided-panel">
      <p className="mode-help">Shape your visual voice in plain language. Every choice shows which tokens it changes, and updates the live preview.</p>
      {Object.entries(GUIDED_DIMENSIONS).map(([dimId, dim]) => (
        <div className="guided-dimension" key={dimId}>
          <h3 className="panel-subhead">{dim.label}</h3>
          <p className="hint">{dim.help}</p>
          <div className="guided-levels">
            {dim.levels.map((level) => {
              const edits = computeGuidedEdits(system, dimId, level.id, locks);
              const skipped = dim.apply(system, level).length - edits.length;
              return (
                <button
                  key={level.id}
                  type="button"
                  className="guided-level-button"
                  onClick={() => onApply(edits)}
                  title={`Changes: ${dim.affects.join(', ')}${skipped ? ` (${skipped} locked token(s) skipped)` : ''}`}
                >
                  {level.label}
                </button>
              );
            })}
          </div>
          <p className="hint guided-affects">Changes: <code>{dim.affects.join(', ')}</code></p>
        </div>
      ))}
    </section>
  );
}
