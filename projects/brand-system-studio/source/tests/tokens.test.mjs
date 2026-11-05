import { test } from 'node:test';
import assert from 'node:assert/strict';

import { flatten, resolve, parseAlias } from '../src/tokens/resolve.js';
import { validateDocument } from '../src/tokens/validate.js';
import { toCSSVariables, colorToCss, dimensionToCss } from '../src/tokens/serialize.js';

function doc() {
  return {
    color: {
      $type: 'color',
      brand: {
        600: { $value: { colorSpace: 'srgb', components: [0.71, 0.31, 0.2], alpha: 1, hex: '#b64e32' } },
      },
    },
    semantic: {
      color: {
        $type: 'color',
        action: { primary: { $value: '{color.brand.600}' } },
      },
    },
  };
}

test('flatten applies $type inheritance from ancestor groups', () => {
  const flat = flatten(doc());
  assert.equal(flat.get('color.brand.600').type, 'color');
  assert.equal(flat.get('semantic.color.action.primary').type, 'color');
});

test('parseAlias recognizes {path} and rejects plain strings', () => {
  assert.equal(parseAlias('{color.brand.600}'), 'color.brand.600');
  assert.equal(parseAlias('#ffffff'), null);
  assert.equal(parseAlias(42), null);
});

test('resolve follows a single-hop alias to its literal value', () => {
  const flat = flatten(doc());
  const r = resolve('semantic.color.action.primary', flat);
  assert.equal(r.ok, true);
  assert.equal(r.terminalPath, 'color.brand.600');
  assert.deepEqual(r.chain, ['semantic.color.action.primary', 'color.brand.600']);
});

test('resolve follows multi-hop chains', () => {
  const d = {
    a: { $type: 'number', $value: 1 },
    b: { $type: 'number', $value: '{a}' },
    c: { $type: 'number', $value: '{b}' },
  };
  const flat = flatten(d);
  const r = resolve('c', flat);
  assert.equal(r.ok, true);
  assert.equal(r.value, 1);
  assert.deepEqual(r.chain, ['c', 'b', 'a']);
});

test('resolve detects circular aliases instead of looping forever', () => {
  const d = {
    a: { $type: 'number', $value: '{b}' },
    b: { $type: 'number', $value: '{a}' },
  };
  const flat = flatten(d);
  const r = resolve('a', flat);
  assert.equal(r.ok, false);
  assert.equal(r.error, 'circular');
});

test('resolve reports a missing reference by name', () => {
  const d = { a: { $type: 'number', $value: '{nope}' } };
  const flat = flatten(d);
  const r = resolve('a', flat);
  assert.equal(r.ok, false);
  assert.equal(r.error, 'missing');
  assert.equal(r.missing, 'nope');
});

test('validateDocument accepts a well-formed document with no errors', () => {
  const { errors } = validateDocument(doc());
  assert.deepEqual(errors, []);
});

test('validateDocument flags a reserved character in a token/group name', () => {
  const bad = { 'bad.name': { $type: 'number', $value: 1 } };
  const { errors } = validateDocument(bad);
  assert.ok(errors.some((e) => e.code === 'invalid-name'));
});

test('validateDocument flags a token with no $type and nothing inherited', () => {
  const bad = { loose: { $value: 1 } };
  const { errors } = validateDocument(bad);
  assert.ok(errors.some((e) => e.code === 'missing-type'));
});

test('validateDocument flags a value shape that does not match its $type', () => {
  const bad = { count: { $type: 'number', $value: 'not a number' } };
  const { errors } = validateDocument(bad);
  assert.ok(errors.some((e) => e.code === 'invalid-value'));
});

test('validateDocument flags a missing alias target', () => {
  const bad = { a: { $type: 'color', $value: '{nowhere}' } };
  const { errors } = validateDocument(bad);
  assert.ok(errors.some((e) => e.code === 'missing-reference'));
});

test('validateDocument flags a circular alias chain', () => {
  const bad = {
    a: { $type: 'color', $value: '{b}' },
    b: { $type: 'color', $value: '{a}' },
  };
  const { errors } = validateDocument(bad);
  assert.ok(errors.some((e) => e.code === 'circular-reference'));
});

test('validateDocument flags a type mismatch across an alias', () => {
  const bad = {
    dim: { $type: 'dimension', $value: { value: 4, unit: 'px' } },
    col: { $type: 'color', $value: '{dim}' },
  };
  const { errors } = validateDocument(bad);
  assert.ok(errors.some((e) => e.code === 'type-mismatch'));
});

test('validateDocument validates composite typography sub-fields', () => {
  const good = {
    font: { family: { $type: 'fontFamily', $value: 'Inter' } },
    size: { base: { $type: 'dimension', $value: { value: 16, unit: 'px' } } },
    heading: {
      $type: 'typography',
      $value: { fontFamily: '{font.family}', fontSize: '{size.base}', fontWeight: 500, lineHeight: 1.2 },
    },
  };
  assert.deepEqual(validateDocument(good).errors, []);

  const bad = {
    heading: { $type: 'typography', $value: { fontFamily: 'Inter' } }, // missing required fields
  };
  assert.ok(validateDocument(bad).errors.some((e) => e.code === 'invalid-value'));
});

test('colorToCss / dimensionToCss produce usable CSS literals', () => {
  assert.equal(dimensionToCss({ value: 16, unit: 'px' }), '16px');
  assert.equal(colorToCss({ colorSpace: 'srgb', components: [1, 0, 0], alpha: 1, hex: '#ff0000' }), '#ff0000');
  assert.equal(colorToCss({ colorSpace: 'srgb', components: [1, 0, 0], alpha: 1 }), 'rgb(255, 0, 0)');
});

test('toCSSVariables preserves alias relationships as var() references', () => {
  const flat = flatten(doc());
  const css = toCSSVariables(flat);
  assert.match(css, /--color-brand-600: #b64e32;/);
  assert.match(css, /--semantic-color-action-primary: var\(--color-brand-600\);/);
});
