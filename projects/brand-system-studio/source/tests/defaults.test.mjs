import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildSystem, SEED_PRESETS } from '../src/tokens/defaults.js';
import { mergeForTheme, validateSystem, resolveToken, flattenSystem } from '../src/tokens/project.js';
import { contrastRatio } from '../src/tokens/color-math.js';
import { colorToCss } from '../src/tokens/serialize.js';

for (const [name, seed] of Object.entries(SEED_PRESETS)) {
  test(`buildSystem(${name}) produces a valid document in both themes`, () => {
    const system = buildSystem(seed);
    const byTheme = validateSystem(system);
    for (const [theme, result] of Object.entries(byTheme)) {
      assert.deepEqual(result.errors, [], `${name}/${theme} should have no validation errors: ${JSON.stringify(result.errors)}`);
    }
  });

  test(`buildSystem(${name}) resolves component tokens through semantic to primitive, per theme`, () => {
    const system = buildSystem(seed);
    for (const theme of ['light', 'dark']) {
      const r = resolveToken('component.button.primary.background', system, theme);
      assert.equal(r.ok, true);
      assert.equal(r.chain[0], 'component.button.primary.background');
      assert.ok(r.chain.some((p) => p.startsWith('semantic.color.action.primary')));
      assert.ok(r.chain.some((p) => p.startsWith('primitive.color.brand.')));
      assert.ok(colorToCss(r.value));
    }
  });

  test(`buildSystem(${name}) light/dark themes produce different resolved surface colors`, () => {
    const system = buildSystem(seed);
    const light = resolveToken('semantic.color.surface.default', system, 'light');
    const dark = resolveToken('semantic.color.surface.default', system, 'dark');
    assert.notEqual(colorToCss(light.value), colorToCss(dark.value));
  });

  test(`buildSystem(${name}) text/surface contrast meets WCAG AA in both themes`, () => {
    const system = buildSystem(seed);
    for (const theme of ['light', 'dark']) {
      const text = resolveToken('semantic.color.text.primary', system, theme);
      const surface = resolveToken('semantic.color.surface.default', system, theme);
      const ratio = contrastRatio(colorToCss(text.value), colorToCss(surface.value));
      assert.ok(ratio >= 4.5, `${name}/${theme} text-on-surface contrast is ${ratio.toFixed(2)}:1, below AA`);
    }
  });

  test(`buildSystem(${name}) resolves typography composite tokens`, () => {
    const system = buildSystem(seed);
    const r = resolveToken('semantic.typography.heading.1', system, 'light');
    assert.equal(r.ok, true);
    assert.equal(r.composite, true);
    assert.ok(r.value.fontFamily);
    assert.ok(r.value.fontSize);
    assert.ok(r.value.fontWeight);
  });
}

test('mergeForTheme falls back to light when a theme is unknown', () => {
  const system = buildSystem(SEED_PRESETS.editorial);
  const merged = mergeForTheme(system, 'sepia');
  assert.equal(merged.semantic, system.semanticByTheme.light);
});

test('flattenSystem exposes every layer under stable, namespaced paths', () => {
  const system = buildSystem(SEED_PRESETS.editorial);
  const flat = flattenSystem(system, 'light');
  assert.ok(flat.has('primitive.color.brand.600'));
  assert.ok(flat.has('semantic.color.action.primary'));
  assert.ok(flat.has('component.button.primary.background'));
});
