import { SliderField, ColorField, SelectField } from './Fields.jsx';
import { getAtPath } from '../tokens/edit.js';
import { flattenSystem, resolveToken } from '../tokens/project.js';
import { colorToCss } from '../tokens/serialize.js';
import { contrastRatio } from '../tokens/color-math.js';
import { FONT_CATALOG } from '../tokens/fonts.js';

const BRAND_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

function tokensOfType(system, theme, type) {
  const flat = flattenSystem(system, theme);
  return [...flat.entries()].filter(([, e]) => e.type === type).map(([path]) => path);
}

function Field({ sysKey, path, theme, actions, locks, render }) {
  const locked = !!locks[path];
  return render({
    onReset: () => actions.resetToken(sysKey, path, theme),
    locked,
    onToggleLock: () => actions.toggleLock(path),
  });
}

export function ColorPanel({ sysKey, system, theme, actions, locks, guided }) {
  const flat = flattenSystem(system, theme);
  const colorPaths = tokensOfType(system, theme, 'color').filter((p) => p.startsWith('primitive.color.'));

  const roles = [
    { path: 'semantic.color.action.primary', label: 'Primary action' },
    { path: 'semantic.color.action.secondary', label: 'Secondary action' },
    { path: 'semantic.color.text.primary', label: 'Text — primary' },
    { path: 'semantic.color.text.muted', label: 'Text — muted' },
    { path: 'semantic.color.text.inverse', label: 'Text — inverse' },
    { path: 'semantic.color.surface.default', label: 'Surface — default' },
    { path: 'semantic.color.surface.raised', label: 'Surface — raised' },
    { path: 'semantic.color.border.subtle', label: 'Border — subtle' },
    { path: 'semantic.color.border.strong', label: 'Border — strong' },
    { path: 'semantic.color.status.success', label: 'Status — success' },
    { path: 'semantic.color.status.warning', label: 'Status — warning' },
    { path: 'semantic.color.status.error', label: 'Status — error' },
    { path: 'semantic.color.status.info', label: 'Status — info' },
  ];

  const textPrimary = resolveToken('semantic.color.text.primary', system, theme);
  const surfaceDefault = resolveToken('semantic.color.surface.default', system, theme);
  const btnText = resolveToken('component.button.primary.text', system, theme);
  const btnBg = resolveToken('component.button.primary.background', system, theme);

  return (
    <section className="control-section">
      <h2>{guided ? 'Your palette' : 'Color'}</h2>

      {!guided && (
        <>
          <h3 className="panel-subhead">Primitive — brand scale</h3>
          <div className="scale-row">
            {BRAND_STEPS.map((step) => {
              const path = `primitive.color.brand.${step}`;
              const node = getAtPath(system.primitive, `color.brand.${step}`);
              return (
                <Field key={path} sysKey={sysKey} path={path} theme={theme} actions={actions} locks={locks}>
                  {({ onReset, locked, onToggleLock }) => (
                    <div className="scale-swatch-field">
                      <span className="scale-step-label">{step}{locked ? ' 🔒' : ''}</span>
                      <input
                        type="color" value={node.$value.hex}
                        onInput={(e) => actions.editValueLive(sysKey, path, hexToColorValue(e.target.value), { theme })}
                        onChange={(e) => actions.editValue(sysKey, path, hexToColorValue(e.target.value), { theme })}
                      />
                      <button type="button" className="icon-button" onClick={onToggleLock} aria-pressed={locked}>{locked ? 'Unlock' : 'Lock'}</button>
                      <button type="button" className="icon-button" onClick={onReset}>Reset</button>
                    </div>
                  )}
                </Field>
              );
            })}
          </div>
          <button
            type="button" className="secondary-action"
            onClick={() => actions.regenerateScale(sysKey, 'primitive.color.brand', getAtPath(system.primitive, 'color.brand.600').$value.hex)}
          >
            Regenerate scale from Brand 600
          </button>
        </>
      )}

      <h3 className="panel-subhead">{guided ? 'Colors' : 'Semantic roles'}</h3>
      {roles.map(({ path, label }) => {
        const r = resolveToken(path, system, theme);
        return (
          <div className="alias-field" key={path}>
            <span className="alias-field-label">{label}</span>
            <span className="resolved-swatch" style={{ background: r.ok ? colorToCss(r.value) : 'transparent' }} />
            <select
              value={r.ok ? r.terminalPath : ''}
              onChange={(e) => actions.editAlias(sysKey, path, e.target.value, { theme })}
            >
              {colorPaths.map((p) => <option key={p} value={p}>{p.replace('primitive.color.', '')}</option>)}
            </select>
          </div>
        );
      })}

      <div className="contrast-note">
        Text / surface: {textPrimary.ok && surfaceDefault.ok ? contrastRatio(colorToCss(textPrimary.value), colorToCss(surfaceDefault.value)).toFixed(1) : '—'}:1
        <br />
        Button text / background: {btnText.ok && btnBg.ok ? contrastRatio(colorToCss(btnText.value), colorToCss(btnBg.value)).toFixed(1) : '—'}:1
        <br />
        <span>Separate from visual character — this checks contrast only, nothing else.</span>
      </div>
    </section>
  );
}

const SIZE_STEPS = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'];
const LH_STEPS = ['tight', 'normal', 'relaxed'];

export function TypePanel({ sysKey, system, theme, actions, locks, guided }) {
  const headingFamily = getAtPath(system.primitive, 'font.family.heading').$value;
  const bodyFamily = getAtPath(system.primitive, 'font.family.body').$value;
  const headingId = Object.values(FONT_CATALOG).find((f) => f.stack.join(', ') === (Array.isArray(headingFamily) ? headingFamily.join(', ') : headingFamily))?.id ?? 'fraunces';
  const bodyId = Object.values(FONT_CATALOG).find((f) => f.stack.join(', ') === (Array.isArray(bodyFamily) ? bodyFamily.join(', ') : bodyFamily))?.id ?? 'systemSans';
  const headingWeight = getAtPath(system.primitive, 'font.weight.heading').$value;

  function setFont(role, fontId) {
    const font = FONT_CATALOG[fontId];
    actions.editValue(sysKey, `primitive.font.family.${role}`, font.stack, { theme });
    if (role === 'heading') {
      const nearest = font.weights.reduce((best, w) => (Math.abs(w - headingWeight) < Math.abs(best - headingWeight) ? w : best), font.weights[0]);
      actions.editValue(sysKey, 'primitive.font.weight.heading', nearest, { theme });
    }
  }

  return (
    <section className="control-section">
      <h2>{guided ? 'Your typography' : 'Typography'}</h2>
      <SelectField
        label="Heading font" value={headingId}
        options={Object.values(FONT_CATALOG).map((f) => ({ value: f.id, label: f.label }))}
        onChange={(id) => setFont('heading', id)}
      />
      <SelectField
        label="Body font" value={bodyId}
        options={Object.values(FONT_CATALOG).map((f) => ({ value: f.id, label: f.label }))}
        onChange={(id) => setFont('body', id)}
      />
      <div className="font-sample" style={{ fontFamily: Array.isArray(headingFamily) ? headingFamily.join(', ') : headingFamily }}>Aa <span>{FONT_CATALOG[headingId]?.label} / {FONT_CATALOG[bodyId]?.label}</span></div>

      <Field sysKey={sysKey} path="primitive.font.weight.heading" theme={theme} actions={actions} locks={locks}>
        {({ onReset }) => (
          <label className="pairing">
            Heading weight
            <select value={headingWeight} onChange={(e) => actions.editValue(sysKey, 'primitive.font.weight.heading', +e.target.value, { theme })}>
              {FONT_CATALOG[headingId].weights.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </label>
        )}
      </Field>

      {!guided && (
        <>
          <h3 className="panel-subhead">Size steps</h3>
          <div className="size-steps-grid">
            {SIZE_STEPS.map((step) => {
              const path = `primitive.font.size.${step}`;
              const node = getAtPath(system.primitive, `font.size.${step}`);
              return (
                <label key={step} className="size-step-field">
                  <span>{step}</span>
                  <input
                    type="number" min={8} max={160} value={node.$value.value}
                    onChange={(e) => actions.editValue(sysKey, path, { value: +e.target.value, unit: 'px' }, { theme })}
                  />
                </label>
              );
            })}
          </div>

          <h3 className="panel-subhead">Line height</h3>
          {LH_STEPS.map((step) => (
            <Field key={step} sysKey={sysKey} path={`primitive.font.lineHeight.${step}`} theme={theme} actions={actions} locks={locks}>
              {({ onReset }) => (
                <SliderField
                  label={step} value={getAtPath(system.primitive, `font.lineHeight.${step}`).$value} min={1} max={2.2} step={0.05}
                  onInput={(v) => actions.editValueLive(sysKey, `primitive.font.lineHeight.${step}`, v, { theme })}
                  onCommit={(v) => actions.editValue(sysKey, `primitive.font.lineHeight.${step}`, v, { theme })}
                  onReset={onReset}
                />
              )}
            </Field>
          ))}
        </>
      )}
    </section>
  );
}

export function LayoutPanel({ sysKey, system, theme, actions, locks, guided }) {
  const radiusSteps = ['sm', 'md', 'lg'];
  const spaceSteps = [1, 2, 3, 4, 6, 8, 12, 16];

  return (
    <section className="control-section">
      <h2>{guided ? 'Shape and rhythm' : 'Geometry & spacing'}</h2>

      {radiusSteps.map((step) => (
        <Field key={step} sysKey={sysKey} path={`primitive.dimension.radius.${step}`} theme={theme} actions={actions} locks={locks}>
          {({ onReset }) => (
            <SliderField
              label={`Radius — ${step}`} value={getAtPath(system.primitive, `dimension.radius.${step}`).$value.value} min={0} max={48} unit="px"
              onInput={(v) => actions.editValueLive(sysKey, `primitive.dimension.radius.${step}`, { value: v, unit: 'px' }, { theme })}
              onCommit={(v) => actions.editValue(sysKey, `primitive.dimension.radius.${step}`, { value: v, unit: 'px' }, { theme })}
              onReset={onReset}
            />
          )}
        </Field>
      ))}

      <Field sysKey={sysKey} path="primitive.dimension.borderWidth.default" theme={theme} actions={actions} locks={locks}>
        {({ onReset }) => (
          <SliderField
            label="Border width" value={getAtPath(system.primitive, 'dimension.borderWidth.default').$value.value} min={0} max={6} step={0.5} unit="px"
            onInput={(v) => actions.editValueLive(sysKey, 'primitive.dimension.borderWidth.default', { value: v, unit: 'px' }, { theme })}
            onCommit={(v) => actions.editValue(sysKey, 'primitive.dimension.borderWidth.default', { value: v, unit: 'px' }, { theme })}
            onReset={onReset}
          />
        )}
      </Field>

      {!guided && (
        <>
          <h3 className="panel-subhead">Spacing scale</h3>
          <div className="size-steps-grid">
            {spaceSteps.map((step) => {
              const path = `primitive.dimension.space.${step}`;
              const node = getAtPath(system.primitive, `dimension.space.${step}`);
              return (
                <label key={step} className="size-step-field">
                  <span>{step}</span>
                  <input type="number" min={0} max={200} value={node.$value.value} onChange={(e) => actions.editValue(sysKey, path, { value: +e.target.value, unit: 'px' }, { theme })} />
                </label>
              );
            })}
          </div>
          <div className="density-row">
            <span className="hint">Density (scales the whole spacing set):</span>
            {[['Compact', 0.75], ['Comfortable', 1], ['Spacious', 1.3]].map(([label, mult]) => (
              <button key={label} type="button" className="icon-button" onClick={() => {
                for (const step of spaceSteps) {
                  const base = getAtPath(system.primitive, `dimension.space.${step}`).$value.value;
                  actions.editValue(sysKey, `primitive.dimension.space.${step}`, { value: Math.round(base * mult * 10) / 10, unit: 'px' }, { theme });
                }
              }}>{label}</button>
            ))}
          </div>

          <h3 className="panel-subhead">Content</h3>
          <Field sysKey={sysKey} path="primitive.dimension.contentWidth" theme={theme} actions={actions} locks={locks}>
            {({ onReset }) => (
              <SliderField
                label="Content width" value={getAtPath(system.primitive, 'dimension.contentWidth').$value.value} min={600} max={1600} step={20} unit="px"
                onInput={(v) => actions.editValueLive(sysKey, 'primitive.dimension.contentWidth', { value: v, unit: 'px' }, { theme })}
                onCommit={(v) => actions.editValue(sysKey, 'primitive.dimension.contentWidth', { value: v, unit: 'px' }, { theme })}
                onReset={onReset}
              />
            )}
          </Field>
          <Field sysKey={sysKey} path="primitive.dimension.gutter" theme={theme} actions={actions} locks={locks}>
            {({ onReset }) => (
              <SliderField
                label="Gutter" value={getAtPath(system.primitive, 'dimension.gutter').$value.value} min={8} max={64} unit="px"
                onInput={(v) => actions.editValueLive(sysKey, 'primitive.dimension.gutter', { value: v, unit: 'px' }, { theme })}
                onCommit={(v) => actions.editValue(sysKey, 'primitive.dimension.gutter', { value: v, unit: 'px' }, { theme })}
                onReset={onReset}
              />
            )}
          </Field>
          <p className="hint">
            Responsive behavior isn't a DTCG value type — this app's responsive rules live in the generated DESIGN.md guidance
            for the agent export, not as invented token fields.
          </p>
        </>
      )}
    </section>
  );
}

const COMPONENT_COLOR_FIELDS = [
  { path: 'component.button.primary.background', label: 'Button (primary) background' },
  { path: 'component.button.primary.text', label: 'Button (primary) text' },
  { path: 'component.button.secondary.background', label: 'Button (secondary) background' },
  { path: 'component.button.secondary.text', label: 'Button (secondary) text' },
  { path: 'component.input.background', label: 'Input background' },
  { path: 'component.input.text', label: 'Input text' },
  { path: 'component.card.background', label: 'Card background' },
  { path: 'component.nav.background', label: 'Nav background' },
  { path: 'component.nav.text', label: 'Nav text' },
];

export function ComponentPanel({ sysKey, system, theme, actions }) {
  const colorPaths = tokensOfType(system, theme, 'color').filter((p) => p.startsWith('semantic.') || p.startsWith('primitive.color.'));

  return (
    <section className="control-section">
      <h2>Components</h2>
      <p className="hint">Component tokens should reference semantic roles — this lists the semantic (and, if needed, primitive) targets each one currently points to.</p>
      {COMPONENT_COLOR_FIELDS.map(({ path, label }) => {
        const r = resolveToken(path, system, theme);
        const current = r.ok ? r.chain[1] ?? r.terminalPath : '';
        return (
          <div className="alias-field" key={path}>
            <span className="alias-field-label">{label}</span>
            <span className="resolved-swatch" style={{ background: r.ok ? colorToCss(r.value) : 'transparent' }} />
            <select value={current} onChange={(e) => actions.editAlias(sysKey, path, e.target.value, { theme })}>
              {colorPaths.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        );
      })}
    </section>
  );
}

function hexToColorValue(hex) {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  const round3 = (n) => Math.round(n * 1000) / 1000;
  return { colorSpace: 'srgb', components: [round3(parseInt(m[1], 16) / 255), round3(parseInt(m[2], 16) / 255), round3(parseInt(m[3], 16) / 255)], alpha: 1, hex: hex.toLowerCase() };
}
