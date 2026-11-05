import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildSystem, SEED_PRESETS } from '../src/tokens/defaults.js';
import { exportThemeTokens, exportAllThemeTokens } from '../src/export/dtcgExport.js';
import { buildThemedCSS } from '../src/export/cssExport.js';
import { generateDesignDoc } from '../src/export/designDoc.js';
import { buildAgentPackage } from '../src/export/agentPackage.js';
import { validateDocument } from '../src/tokens/validate.js';
import { resolveToken } from '../src/tokens/project.js';
import { colorToCss } from '../src/tokens/serialize.js';

const system = buildSystem(SEED_PRESETS.editorial);

test('exportThemeTokens produces a self-contained, individually-valid DTCG document per theme', () => {
  for (const theme of ['light', 'dark']) {
    const doc = exportThemeTokens(system, theme);
    assert.ok(doc.primitive && doc.semantic && doc.component);
    const { errors } = validateDocument(doc);
    assert.deepEqual(errors, [], `${theme} export should validate cleanly: ${JSON.stringify(errors)}`);
  }
});

test('exportAllThemeTokens returns one entry per theme', () => {
  const all = exportAllThemeTokens(system);
  assert.deepEqual(Object.keys(all).sort(), ['dark', 'light']);
});

test('exported DTCG documents are plain JSON-safe (round-trip through JSON.stringify/parse unchanged)', () => {
  const doc = exportThemeTokens(system, 'light');
  const roundTripped = JSON.parse(JSON.stringify(doc));
  assert.deepEqual(roundTripped, doc);
});

test('buildThemedCSS resolves component composite tokens (e.g. card shadow) to real CSS', () => {
  const css = buildThemedCSS(system);
  assert.match(css, /--component-card-shadow-offsetY:\s*2px;/);
  assert.match(css, /--component-card-border-color:\s*var\(--semantic-color-border-subtle\);/);
});

test('buildThemedCSS emits a dark theme selector with different resolved values than light', () => {
  const css = buildThemedCSS(system);
  assert.match(css, /\[data-theme="dark"\]/);
  const lightSurfaceMatch = /:root, \[data-theme="light"\] \{[\s\S]*?--semantic-color-surface-default:\s*([^;]+);/.exec(css);
  const darkBlockMatch = /\[data-theme="dark"\] \{[\s\S]*?--semantic-color-surface-default:\s*([^;]+);/.exec(css);
  assert.ok(lightSurfaceMatch && darkBlockMatch);
  assert.notEqual(lightSurfaceMatch[1], darkBlockMatch[1]);
});

test('buildThemedCSS does not duplicate theme-independent primitive/component vars per theme', () => {
  const css = buildThemedCSS(system);
  const occurrences = css.split('--primitive-color-brand-600:').length - 1;
  assert.equal(occurrences, 1, 'primitive values should be emitted once under :root, not once per theme');
});

test('generateDesignDoc quotes the actual resolved accent color, not a placeholder', () => {
  const doc = generateDesignDoc(system);
  const accent = resolveToken('primitive.color.brand.600', system, 'light');
  assert.ok(doc.includes(colorToCss(accent.value)));
});

test('generateDesignDoc reports contrast for every theme it is given', () => {
  const doc = generateDesignDoc(system, { themes: ['light', 'dark'] });
  assert.match(doc, /\*\*light\*\*: text\.primary on surface\.default/);
  assert.match(doc, /\*\*dark\*\*: text\.primary on surface\.default/);
});

test('buildAgentPackage produces the documented file set with consistent manifest paths', () => {
  const { files, manifest } = buildAgentPackage(system, { name: 'test-brand' });
  const names = files.map((f) => f.name);
  assert.ok(names.includes('tokens.json'));
  assert.ok(names.includes('tokens.dark.json'), 'non-default theme should get its own file');
  assert.ok(!names.includes('tokens.light.json'), 'default theme should not be duplicated under its own theme-suffixed name');
  assert.ok(names.includes('tokens.css'));
  assert.ok(names.includes('DESIGN.md'));
  assert.ok(names.includes('manifest.json'));
  assert.ok(names.includes('README.md'));
  // every path the manifest references must actually be in the file list
  assert.ok(names.includes(manifest.files.tokens));
  assert.ok(names.includes(manifest.files.css));
  assert.ok(names.includes(manifest.files.design));
  assert.ok(names.includes(manifest.files.readme));
  for (const file of Object.values(manifest.files.extraThemeTokens)) assert.ok(names.includes(file));
});

test('buildAgentPackage: tokens.json is valid JSON matching exportThemeTokens for the default theme', () => {
  const { files } = buildAgentPackage(system, { defaultTheme: 'light' });
  const tokensJson = JSON.parse(files.find((f) => f.name === 'tokens.json').content);
  assert.deepEqual(tokensJson, exportThemeTokens(system, 'light'));
});

test('buildAgentPackage: DESIGN.md and tokens.json cannot disagree on the accent color (both generated from the same system)', () => {
  const { files } = buildAgentPackage(system);
  const design = files.find((f) => f.name === 'DESIGN.md').content;
  const tokens = JSON.parse(files.find((f) => f.name === 'tokens.json').content);
  assert.ok(design.includes(tokens.primitive.color.brand['600'].$value.hex));
});
