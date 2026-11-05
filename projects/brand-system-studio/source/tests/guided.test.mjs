import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildSystem, SEED_PRESETS } from '../src/tokens/defaults.js';
import { setTokenValue, getAtPath } from '../src/tokens/edit.js';
import { computeGuidedEdits, GUIDED_DIMENSIONS } from '../src/tokens/guided.js';
import { validateSystem } from '../src/tokens/project.js';

test('geometry "softer" scales radius up relative to the current value, not to a fixed number', () => {
  const system = buildSystem(SEED_PRESETS.editorial);
  const edits = computeGuidedEdits(system, 'geometry', 'soft');
  const mdEdit = edits.find((e) => e.path === 'primitive.dimension.radius.md');
  const before = getAtPath(system.primitive, 'dimension.radius.md').$value.value;
  assert.ok(mdEdit.value.value > before, `expected softer radius (${mdEdit.value.value}) to exceed current (${before})`);
});

test('geometry "sharper" and "softer" move radius in opposite directions', () => {
  const system = buildSystem(SEED_PRESETS.editorial);
  const before = getAtPath(system.primitive, 'dimension.radius.md').$value.value;
  const sharper = computeGuidedEdits(system, 'geometry', 'sharp').find((e) => e.path === 'primitive.dimension.radius.md').value.value;
  const softer = computeGuidedEdits(system, 'geometry', 'soft').find((e) => e.path === 'primitive.dimension.radius.md').value.value;
  assert.ok(sharper < before && before < softer);
});

test('applying a guided edit set to a differently-customized system scales from ITS current value', () => {
  // Two systems with different starting radii should land on different
  // absolute values after the same "softer" choice — it's relative, not
  // an absolute preset.
  const a = buildSystem(SEED_PRESETS.editorial); // radius 4
  const b = setTokenValue(buildSystem(SEED_PRESETS.editorial), 'primitive.dimension.radius.md', { value: 20, unit: 'px' });
  const softerA = computeGuidedEdits(a, 'geometry', 'soft').find((e) => e.path === 'primitive.dimension.radius.md').value.value;
  const softerB = computeGuidedEdits(b, 'geometry', 'soft').find((e) => e.path === 'primitive.dimension.radius.md').value.value;
  assert.notEqual(softerA, softerB);
});

test('locked tokens are excluded from guided edits', () => {
  const system = buildSystem(SEED_PRESETS.editorial);
  const edits = computeGuidedEdits(system, 'geometry', 'soft', { 'primitive.dimension.radius.md': true });
  assert.ok(!edits.some((e) => e.path === 'primitive.dimension.radius.md'));
  assert.ok(edits.some((e) => e.path === 'primitive.dimension.radius.sm'), 'unlocked sibling steps should still be included');
});

test('applying any guided dimension/level to either preset keeps the system valid', () => {
  for (const seed of Object.values(SEED_PRESETS)) {
    for (const [dimId, dim] of Object.entries(GUIDED_DIMENSIONS)) {
      for (const level of dim.levels) {
        let system = buildSystem(seed);
        const edits = computeGuidedEdits(system, dimId, level.id);
        for (const edit of edits) system = setTokenValue(system, edit.path, edit.value);
        const errors = validateSystem(system).light.errors;
        assert.deepEqual(errors, [], `${dimId}/${level.id} broke validation: ${JSON.stringify(errors)}`);
      }
    }
  }
});

test('density "compact" shrinks the spacing scale, "spacious" grows it', () => {
  const system = buildSystem(SEED_PRESETS.editorial);
  const before = getAtPath(system.primitive, 'dimension.space.6').$value.value;
  const compact = computeGuidedEdits(system, 'density', 'compact').find((e) => e.path === 'primitive.dimension.space.6').value.value;
  const spacious = computeGuidedEdits(system, 'density', 'spacious').find((e) => e.path === 'primitive.dimension.space.6').value.value;
  assert.ok(compact < before && before < spacious);
});
