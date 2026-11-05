import { test } from 'node:test';
import assert from 'node:assert/strict';

import { generateTonalScale, contrastRatio, hexToHsl, hslToHex } from '../src/tokens/color-math.js';

test('generateTonalScale preserves the exact input hex at its closest step', () => {
  const scale = generateTonalScale('#b64e32');
  assert.ok(Object.values(scale).includes('#b64e32'), `expected #b64e32 to survive exactly in ${JSON.stringify(scale)}`);
});

test('generateTonalScale produces 10 steps, each a valid hex', () => {
  const scale = generateTonalScale('#5f6c50');
  assert.equal(Object.keys(scale).length, 10);
  for (const hex of Object.values(scale)) assert.match(hex, /^#[0-9a-f]{6}$/);
});

test('contrastRatio is symmetric and returns 21:1 for black/white', () => {
  assert.ok(Math.abs(contrastRatio('#000000', '#ffffff') - 21) < 0.01);
  assert.equal(contrastRatio('#123456', '#abcdef'), contrastRatio('#abcdef', '#123456'));
});

test('hslToHex(hexToHsl(x)) round-trips within rounding error', () => {
  const original = '#b64e32';
  const roundTripped = hslToHex(hexToHsl(original));
  assert.equal(roundTripped, original);
});
