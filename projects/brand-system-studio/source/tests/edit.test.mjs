import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildSystem, SEED_PRESETS } from '../src/tokens/defaults.js';
import { getAtPath, setTokenValue, setTokenAlias, renameTokenPath, regenerateScale } from '../src/tokens/edit.js';
import { resolveToken, flattenSystem, validateSystem } from '../src/tokens/project.js';
import { colorToCss } from '../src/tokens/serialize.js';

test('setTokenValue edits a primitive literal without mutating the input', () => {
  const system = buildSystem(SEED_PRESETS.editorial);
  const before = JSON.stringify(system);
  const next = setTokenValue(system, 'primitive.dimension.space.4', { value: 99, unit: 'px' });
  assert.equal(JSON.stringify(system), before, 'input system must not be mutated');
  assert.equal(getAtPath(next.primitive, 'dimension.space.4').$value.value, 99);
});

test('setTokenValue edits a composite sub-field without touching the rest', () => {
  const system = buildSystem(SEED_PRESETS.editorial);
  const next = setTokenValue(system, 'semantic.typography.heading.1', 700, { theme: 'light', subfield: 'fontWeight' });
  const node = getAtPath(next.semanticByTheme.light, 'typography.heading.1');
  assert.equal(node.$value.fontWeight, 700);
  assert.equal(node.$value.fontFamily, '{primitive.font.family.heading}'); // untouched
});

test('setTokenValue on semantic only affects the targeted theme', () => {
  const system = buildSystem(SEED_PRESETS.editorial);
  const next = setTokenValue(system, 'semantic.color.text.primary', '{primitive.color.brand.900}', { theme: 'light' });
  assert.notEqual(
    getAtPath(next.semanticByTheme.light, 'color.text.primary').$value,
    getAtPath(system.semanticByTheme.light, 'color.text.primary').$value,
  );
  assert.equal(
    JSON.stringify(getAtPath(next.semanticByTheme.dark, 'color.text.primary')),
    JSON.stringify(getAtPath(system.semanticByTheme.dark, 'color.text.primary')),
  );
});

test('setTokenAlias reassigns which token a reference points to', () => {
  const system = buildSystem(SEED_PRESETS.editorial);
  const next = setTokenAlias(system, 'semantic.color.action.secondary', 'primitive.color.brand.900', { theme: 'light' });
  const r = resolveToken('semantic.color.action.secondary', next, 'light');
  assert.equal(r.terminalPath, 'primitive.color.brand.900');
});

test('renameTokenPath moves a token and rewrites every reference to it', () => {
  const system = buildSystem(SEED_PRESETS.editorial);
  const { system: renamed, renamedReferences } = renameTokenPath(system, 'primitive.color.brand.600', 'primitive.color.brand.600main');
  assert.ok(renamedReferences > 0, 'expected at least one alias to have referenced brand.600 (component.button.primary.background does)');
  // old path no longer resolves as a token...
  assert.equal(getAtPath(renamed.primitive, 'color.brand.600'), undefined);
  // ...new path exists and old references now point to it
  assert.ok(getAtPath(renamed.primitive, 'color.brand.600main'));
  for (const theme of ['light', 'dark']) {
    const result = validateSystem(renamed)[theme];
    assert.deepEqual(result.errors, [], `renamed system should still validate cleanly: ${JSON.stringify(result.errors)}`);
  }
});

test('renameTokenPath renaming a group updates nested references too', () => {
  const system = buildSystem(SEED_PRESETS.editorial);
  const { system: renamed } = renameTokenPath(system, 'primitive.color.brand', 'primitive.color.primary');
  const flat = flattenSystem(renamed, 'light');
  assert.ok(flat.has('primitive.color.primary.600'));
  assert.ok(!flat.has('primitive.color.brand.600'));
  const r = resolveToken('component.button.primary.background', renamed, 'light');
  assert.equal(r.ok, true);
  assert.ok(r.terminalPath.startsWith('primitive.color.primary.'));
});

test('regenerateScale respects locks and leaves other steps alone', () => {
  const system = buildSystem(SEED_PRESETS.editorial);
  const lockedPath = 'primitive.color.brand.900';
  const before900 = getAtPath(system.primitive, 'color.brand.900').$value.hex;
  const next = regenerateScale(system, 'primitive.color.brand', '#223344', { [lockedPath]: true });
  assert.equal(getAtPath(next.primitive, 'color.brand.900').$value.hex, before900, 'locked step must not change');
  assert.notEqual(getAtPath(next.primitive, 'color.brand.500').$value.hex, getAtPath(system.primitive, 'color.brand.500').$value.hex);
  assert.deepEqual(validateSystem(next).light.errors, []);
});
