import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildSystem, SEED_PRESETS } from '../src/tokens/defaults.js';
import { readCharacter, characterBand } from '../src/tokens/character.js';

test('readCharacter returns exactly four rules summing to the score, for both presets', () => {
  for (const seed of Object.values(SEED_PRESETS)) {
    const system = buildSystem(seed);
    const { score, rules } = readCharacter(system);
    assert.equal(rules.length, 4);
    assert.equal(rules.reduce((n, r) => n + r.value, 0), score);
    assert.ok(score >= 0 && score <= 100);
  }
});

test('characterBand covers the full 0-100 range with the five original band names', () => {
  assert.equal(characterBand(0), 'Conventional');
  assert.equal(characterBand(30), 'Emerging');
  assert.equal(characterBand(60), 'Characterful');
  assert.equal(characterBand(85), 'Distinctive');
  assert.equal(characterBand(95), 'Highly differentiated');
});

test('editorial (serif heading) scores higher type-contrast than modern (sans heading)', () => {
  const editorial = readCharacter(buildSystem(SEED_PRESETS.editorial));
  const modern = readCharacter(buildSystem(SEED_PRESETS.modern));
  const rule = (r) => r.rules.find((x) => x.name === 'Type contrast').value;
  assert.ok(rule(editorial) > rule(modern));
});
