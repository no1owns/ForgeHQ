import { resolveToken } from '../tokens/project.js';
import { colorToCss, dimensionToCss } from '../tokens/serialize.js';

function literalPreview(type, value) {
  if (type === 'color') return { swatch: colorToCss(value), text: value?.hex ?? colorToCss(value) };
  if (type === 'dimension') return { text: dimensionToCss(value) };
  if (type === 'fontFamily') return { text: Array.isArray(value) ? value.join(', ') : value };
  return { text: typeof value === 'object' ? JSON.stringify(value) : String(value) };
}

/**
 * Shows the token chain for whatever's selected in Preview — e.g.
 * "Button background -> Action primary -> Brand 600" — with each link
 * clickable to re-center the inspector on it (following the alias chain
 * outward from component, toward primitive).
 */
export default function Inspector({ system, theme, path, onFollow, onClose }) {
  if (!path) {
    return (
      <aside className="inspector-panel inspector-empty">
        <p className="hint">Select an element in the preview (Select mode) to inspect its token chain.</p>
      </aside>
    );
  }

  const result = resolveToken(path, system, theme);

  return (
    <aside className="inspector-panel">
      <div className="inspector-head">
        <h3>Token inspector</h3>
        <button className="text-button" onClick={onClose} aria-label="Close inspector">Close</button>
      </div>

      {!result.ok && (
        <p className="inspector-error">
          Could not resolve "{path}" ({result.error}
          {result.error === 'missing' && `: ${result.missing}`}).
        </p>
      )}

      {result.ok && !result.composite && (
        <>
          <ol className="alias-chain">
            {result.chain.map((p, i) => (
              <li key={p}>
                <button className={`chain-link${i === result.chain.length - 1 ? ' terminal' : ''}`} onClick={() => onFollow(p)}>
                  {p}
                </button>
                {i < result.chain.length - 1 && <span className="chain-arrow">&rarr;</span>}
              </li>
            ))}
          </ol>
          <ResolvedValue type={result.type} value={result.value} />
        </>
      )}

      {result.ok && result.composite && (
        <div className="composite-fields">
          {Object.entries(result.subResolutions ?? {}).map(([field, sub]) => (
            <div key={field} className="composite-field">
              <div className="composite-field-name">{field}</div>
              <ol className="alias-chain small">
                {sub.ok ? sub.chain.map((p, i) => (
                  <li key={p}>
                    <button className={`chain-link${i === sub.chain.length - 1 ? ' terminal' : ''}`} onClick={() => onFollow(p)}>{p}</button>
                    {i < sub.chain.length - 1 && <span className="chain-arrow">&rarr;</span>}
                  </li>
                )) : <li className="inspector-error">unresolved ({sub.error})</li>}
              </ol>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}

function ResolvedValue({ type, value }) {
  const preview = literalPreview(type, value);
  return (
    <div className="resolved-value">
      {preview.swatch && <span className="resolved-swatch" style={{ background: preview.swatch }} />}
      <code>{preview.text}</code>
      <span className="resolved-type">{type}</span>
    </div>
  );
}
