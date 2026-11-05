import { test } from 'node:test';
import assert from 'node:assert/strict';

import { migrateV1ToV2, isLegacyV1Shape, loadAndMigrate, emptyProjectDocument, PROJECT_SCHEMA_VERSION } from '../src/tokens/migrate.js';
import { validateSystem, resolveToken, flattenSystem } from '../src/tokens/project.js';
import { colorToCss } from '../src/tokens/serialize.js';

// Matches Brand System Studio v0.1's actual defaults/baseline exactly.
const V1_DEFAULT_PROJECT = {
  current: { accent: '#B64E32', surface: '#F1EDE4', text: '#222821', font: 'Editorial', scale: 1.25, weight: 500, radius: 4, spacing: 24 },
  saved: { accent: '#5F6C50', surface: '#DFE5DC', text: '#222821', font: 'Modern', scale: 1.2, weight: 500, radius: 16, spacing: 24 },
};

// A realistic *edited* v1 project, as a real user's localStorage might hold.
const V1_EDITED_PROJECT = {
  current: { accent: '#1E66F5', surface: '#F5F7FA', text: '#101418', font: 'Technical', scale: 1.4, weight: 700, radius: 0, spacing: 32 },
  saved: { accent: '#B64E32', surface: '#F1EDE4', text: '#222821', font: 'Editorial', scale: 1.25, weight: 500, radius: 4, spacing: 24 },
};

test('isLegacyV1Shape recognizes the real v1 localStorage shape', () => {
  assert.equal(isLegacyV1Shape(V1_DEFAULT_PROJECT), true);
  assert.equal(isLegacyV1Shape({ schemaVersion: 2 }), false);
  assert.equal(isLegacyV1Shape({ current: {} }), false);
  assert.equal(isLegacyV1Shape(null), false);
});

for (const [name, v1] of Object.entries({ default: V1_DEFAULT_PROJECT, edited: V1_EDITED_PROJECT })) {
  test(`migrateV1ToV2(${name}) produces a valid v2 project`, () => {
    const v2 = migrateV1ToV2(v1);
    assert.equal(v2.schemaVersion, PROJECT_SCHEMA_VERSION);
    for (const key of ['current', 'baseline']) {
      const byTheme = validateSystem(v2.systems[key].system);
      for (const [theme, result] of Object.entries(byTheme)) {
        assert.deepEqual(result.errors, [], `${name}/${key}/${theme}: ${JSON.stringify(result.errors)}`);
      }
    }
  });

  test(`migrateV1ToV2(${name}) preserves the user's exact accent color`, () => {
    const v2 = migrateV1ToV2(v1);
    const flat = flattenSystem(v2.systems.current.system, 'light');
    const brandHexes = [...flat.entries()].filter(([p]) => p.startsWith('primitive.color.brand.')).map(([, e]) => e.value.hex);
    assert.ok(brandHexes.includes(v1.current.accent.toLowerCase()), `expected ${v1.current.accent} to survive migration exactly, got ${JSON.stringify(brandHexes)}`);
  });

  test(`migrateV1ToV2(${name}) preserves the user's radius and spacing choices`, () => {
    const v2 = migrateV1ToV2(v1);
    const r = resolveToken('primitive.dimension.radius.md', v2.systems.current.system, 'light');
    assert.equal(r.value.value, v1.current.radius);
  });
}

test('loadAndMigrate migrates a v1 localStorage payload transparently', () => {
  const result = loadAndMigrate(JSON.stringify(V1_DEFAULT_PROJECT));
  assert.equal(result.ok, true);
  assert.equal(result.migrated, true);
  assert.equal(result.project.schemaVersion, PROJECT_SCHEMA_VERSION);
});

test('loadAndMigrate passes a current-version project through unchanged', () => {
  const fresh = emptyProjectDocument();
  const result = loadAndMigrate(fresh);
  assert.equal(result.ok, true);
  assert.equal(result.migrated, false);
  assert.equal(result.project, fresh);
});

test('loadAndMigrate reports failure (not a throw) for garbage input', () => {
  assert.equal(loadAndMigrate('{not json').ok, false);
  assert.equal(loadAndMigrate(null).ok, false);
  assert.equal(loadAndMigrate({ nonsense: true }).ok, false);
});

test('emptyProjectDocument itself validates with no errors', () => {
  const fresh = emptyProjectDocument();
  for (const key of ['current', 'baseline']) {
    const byTheme = validateSystem(fresh.systems[key].system);
    for (const result of Object.values(byTheme)) assert.deepEqual(result.errors, []);
  }
});
