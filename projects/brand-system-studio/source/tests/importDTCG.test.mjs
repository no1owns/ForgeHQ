import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildSystem, SEED_PRESETS } from '../src/tokens/defaults.js';
import { exportThemeTokens } from '../src/export/dtcgExport.js';
import { reviewDTCGImport, applyDTCGImport } from '../src/tokens/importDTCG.js';
import { resolveToken } from '../src/tokens/project.js';
import { colorToCss } from '../src/tokens/serialize.js';

test('reviewDTCGImport rejects a non-object payload cleanly', () => {
  assert.equal(reviewDTCGImport(null, buildSystem(SEED_PRESETS.editorial), 'light').ok, false);
  assert.equal(reviewDTCGImport([1, 2], buildSystem(SEED_PRESETS.editorial), 'light').ok, false);
  assert.equal(reviewDTCGImport('nope', buildSystem(SEED_PRESETS.editorial), 'light').ok, false);
});

test('reviewDTCGImport rejects a document with no recognized top-level groups', () => {
  const review = reviewDTCGImport({ somethingElse: {} }, buildSystem(SEED_PRESETS.editorial), 'light');
  assert.equal(review.ok, false);
  assert.equal(review.reason, 'no-recognized-groups');
});

test('reviewDTCGImport recognizes a full export of another preset and reports no post-merge errors', () => {
  const modernSystem = buildSystem(SEED_PRESETS.modern);
  const exported = exportThemeTokens(modernSystem, 'light');
  const editorialSystem = buildSystem(SEED_PRESETS.editorial);

  const review = reviewDTCGImport(exported, editorialSystem, 'light');
  assert.equal(review.ok, true);
  assert.deepEqual(review.recognizedGroups.sort(), ['component', 'primitive', 'semantic']);
  assert.deepEqual(review.errors, []);
  assert.deepEqual(review.postMergeErrors, []);
});

test('reviewDTCGImport flags unsupported top-level content without discarding the recognized groups', () => {
  const exported = exportThemeTokens(buildSystem(SEED_PRESETS.modern), 'light');
  const withExtra = { ...exported, mysteryVendorExtension: { foo: 'bar' } };
  const review = reviewDTCGImport(withExtra, buildSystem(SEED_PRESETS.editorial), 'light');
  assert.equal(review.ok, true);
  assert.ok(review.unsupportedGroups.includes('mysteryVendorExtension'));
  assert.ok(review.recognizedGroups.includes('primitive'));
});

test('reviewDTCGImport reports a validation error for a malformed import instead of crashing', () => {
  const broken = { primitive: { color: { $type: 'color', oops: { $value: 'not-a-color' } } } };
  const review = reviewDTCGImport(broken, buildSystem(SEED_PRESETS.editorial), 'light');
  assert.equal(review.ok, true);
  assert.ok(review.errors.some((e) => e.code === 'invalid-value'));
});

test('reviewDTCGImport detects conflicts between the import and the existing system', () => {
  const editorialSystem = buildSystem(SEED_PRESETS.editorial);
  const modernExport = exportThemeTokens(buildSystem(SEED_PRESETS.modern), 'light');
  const review = reviewDTCGImport(modernExport, editorialSystem, 'light');
  assert.ok(review.conflicts.length > 0, 'importing a different preset over an existing one should surface conflicting paths');
  assert.ok(review.conflicts.includes('primitive.color.brand.600'));
});

test('applyDTCGImport with the default (all recognized groups) matches review.previewSystem', () => {
  const editorialSystem = buildSystem(SEED_PRESETS.editorial);
  const modernExport = exportThemeTokens(buildSystem(SEED_PRESETS.modern), 'light');
  const review = reviewDTCGImport(modernExport, editorialSystem, 'light');
  const applied = applyDTCGImport(editorialSystem, review);
  assert.deepEqual(applied, review.previewSystem);
});

test('applyDTCGImport can selectively accept only one recognized group', () => {
  const editorialSystem = buildSystem(SEED_PRESETS.editorial);
  // A semantic-only import that points action.primary at a DIFFERENT
  // primitive step than editorial currently uses (900, not 600) — this
  // is the meaningful case: editorial's and modern's semantic layers
  // use identical alias *paths* (only the primitives they point at
  // differ), so importing modern's semantic alone would be a no-op and
  // wouldn't actually prove selective-group merging does anything.
  const exported = exportThemeTokens(editorialSystem, 'light');
  const remappedSemantic = structuredClone(exported);
  remappedSemantic.semantic.color.action.primary.$value = '{primitive.color.brand.900}';

  const review = reviewDTCGImport(remappedSemantic, editorialSystem, 'light');
  const semanticOnly = applyDTCGImport(editorialSystem, review, { onlyGroups: ['semantic'] });

  // primitive is UNCHANGED (not part of this import)...
  assert.deepEqual(semanticOnly.primitive, editorialSystem.primitive);
  // ...but semantic now resolves through editorial's OWN brand.900 (the
  // import's primitive was never brought in — it composes with what's
  // already there, which is the point of a selective merge).
  const r = resolveToken('semantic.color.action.primary', semanticOnly, 'light');
  const expected = resolveToken('primitive.color.brand.900', editorialSystem, 'light');
  assert.equal(colorToCss(r.value), colorToCss(expected.value));
});

test('reviewDTCGImport never mutates the original target system', () => {
  const editorialSystem = buildSystem(SEED_PRESETS.editorial);
  const before = JSON.stringify(editorialSystem);
  reviewDTCGImport(exportThemeTokens(buildSystem(SEED_PRESETS.modern), 'light'), editorialSystem, 'light');
  assert.equal(JSON.stringify(editorialSystem), before);
});
