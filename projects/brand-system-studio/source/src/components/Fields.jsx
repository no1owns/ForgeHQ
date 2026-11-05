/**
 * A slider with a numeric field beside it (per the "numeric fields beside
 * sliders" requirement). `onInput` fires on every drag tick for live
 * preview; `onCommit` fires once, on release/blur, as the one meaningful
 * undo step — callers wire these straight to store.editValueLive /
 * store.editValue.
 */
export function SliderField({ label, value, min, max, step = 1, unit = '', onInput, onCommit, onReset, locked, onToggleLock }) {
  return (
    <label className="slider-field">
      <span>
        {label}
        <output>{value}{unit}</output>
      </span>
      <div className="slider-row">
        <input
          type="range" min={min} max={max} step={step} value={value}
          onInput={(e) => onInput(+e.target.value)}
          onChange={(e) => onCommit(+e.target.value)}
        />
        <input
          type="number" className="numeric-field" min={min} max={max} step={step} value={value}
          onChange={(e) => onCommit(+e.target.value)}
        />
        <FieldButtons onReset={onReset} locked={locked} onToggleLock={onToggleLock} />
      </div>
    </label>
  );
}

export function ColorField({ label, hex, onInput, onCommit, onReset, locked, onToggleLock }) {
  return (
    <label className="color-field">
      <span>{label}</span>
      <input type="color" value={hex} onInput={(e) => onInput(e.target.value)} onChange={(e) => onCommit(e.target.value)} aria-label={`${label} color`} />
      <input
        className="hex-field" key={hex} defaultValue={hex} maxLength={7} aria-label={`${label} hex`}
        onBlur={(e) => {
          if (/^#[0-9a-f]{6}$/i.test(e.target.value)) onCommit(e.target.value.toLowerCase());
          else e.target.value = hex;
        }}
      />
      <FieldButtons onReset={onReset} locked={locked} onToggleLock={onToggleLock} />
    </label>
  );
}

export function SelectField({ label, value, options, onChange }) {
  return (
    <label className="pairing">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

function FieldButtons({ onReset, locked, onToggleLock }) {
  if (!onReset && !onToggleLock) return null;
  return (
    <span className="field-buttons">
      {onToggleLock && (
        <button type="button" className={`icon-button${locked ? ' active' : ''}`} onClick={onToggleLock} title={locked ? 'Unlock (allow palette regeneration to change this)' : 'Lock (protect from palette regeneration)'} aria-pressed={locked}>
          {locked ? 'Locked' : 'Lock'}
        </button>
      )}
      {onReset && <button type="button" className="icon-button" onClick={onReset} title="Reset to its original value">Reset</button>}
    </span>
  );
}
