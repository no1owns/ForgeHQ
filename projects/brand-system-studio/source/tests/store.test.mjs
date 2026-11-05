import { test } from 'node:test';
import assert from 'node:assert/strict';

import { reducer } from '../src/state/store.js';
import { emptyProjectDocument } from '../src/tokens/migrate.js';
import { getAtPath } from '../src/tokens/edit.js';
import { resolveToken } from '../src/tokens/project.js';
import { colorToCss } from '../src/tokens/serialize.js';

function freshState() {
  return { past: [], present: emptyProjectDocument(), future: [] };
}

test('EDIT_VALUE with commit:false updates present but not history (live preview)', () => {
  const s0 = freshState();
  const s1 = reducer(s0, { type: 'EDIT_VALUE', system: 'current', path: 'primitive.dimension.space.4', value: { value: 40, unit: 'px' }, commit: false });
  assert.equal(s1.past.length, 0);
  assert.equal(getAtPath(s1.present.systems.current.system.primitive, 'dimension.space.4').$value.value, 40);
});

test('EDIT_VALUE with commit:true pushes one history entry', () => {
  const s0 = freshState();
  const s1 = reducer(s0, { type: 'EDIT_VALUE', system: 'current', path: 'primitive.dimension.space.4', value: { value: 40, unit: 'px' }, commit: true });
  assert.equal(s1.past.length, 1);
  assert.equal(s1.future.length, 0);
});

test('a slider drag (many live edits) then release (one commit) is ONE undo step', () => {
  let s = freshState();
  for (const v of [20, 25, 30, 35, 40]) {
    s = reducer(s, { type: 'EDIT_VALUE', system: 'current', path: 'primitive.dimension.space.4', value: { value: v, unit: 'px' }, commit: false });
  }
  s = reducer(s, { type: 'EDIT_VALUE', system: 'current', path: 'primitive.dimension.space.4', value: { value: 40, unit: 'px' }, commit: true });
  assert.equal(s.past.length, 1, 'five live ticks + one commit should be exactly one history entry');
  const undone = reducer(s, { type: 'UNDO' });
  assert.equal(getAtPath(undone.present.systems.current.system.primitive, 'dimension.space.4').$value.value, 16, 'undo returns to the pre-drag value (space.4 defaults to 16px for the editorial preset)');
});

test('UNDO then REDO restores the same state', () => {
  const s0 = freshState();
  const s1 = reducer(s0, { type: 'EDIT_VALUE', system: 'current', path: 'primitive.dimension.space.4', value: { value: 99, unit: 'px' }, commit: true });
  const undone = reducer(s1, { type: 'UNDO' });
  assert.deepEqual(undone.present, s0.present);
  const redone = reducer(undone, { type: 'REDO' });
  assert.deepEqual(redone.present, s1.present);
});

test('UNDO on empty history is a no-op', () => {
  const s0 = freshState();
  const s1 = reducer(s0, { type: 'UNDO' });
  assert.equal(s1, s0);
});

test('a new EDIT_VALUE clears redo history (no stale futures)', () => {
  let s = freshState();
  s = reducer(s, { type: 'EDIT_VALUE', system: 'current', path: 'primitive.dimension.space.4', value: { value: 50, unit: 'px' }, commit: true });
  s = reducer(s, { type: 'UNDO' });
  assert.equal(s.future.length, 1);
  s = reducer(s, { type: 'EDIT_VALUE', system: 'current', path: 'primitive.dimension.space.6', value: { value: 60, unit: 'px' }, commit: true });
  assert.equal(s.future.length, 0);
});

test('RESET_TOKEN restores a token to its as-loaded value, undoably', () => {
  let s = freshState();
  s = reducer(s, { type: 'EDIT_VALUE', system: 'current', path: 'primitive.dimension.space.4', value: { value: 999, unit: 'px' }, commit: true });
  s = reducer(s, { type: 'RESET_TOKEN', system: 'current', path: 'primitive.dimension.space.4' });
  assert.equal(getAtPath(s.present.systems.current.system.primitive, 'dimension.space.4').$value.value, 16);
  const undone = reducer(s, { type: 'UNDO' });
  assert.equal(getAtPath(undone.present.systems.current.system.primitive, 'dimension.space.4').$value.value, 999, 'undoing the reset returns the edited value');
});

test('KEEP copies current into baseline and REVERT copies baseline into current', () => {
  let s = freshState();
  s = reducer(s, { type: 'EDIT_VALUE', system: 'current', path: 'primitive.dimension.space.4', value: { value: 7, unit: 'px' }, commit: true });
  s = reducer(s, { type: 'KEEP' });
  assert.equal(getAtPath(s.present.systems.baseline.system.primitive, 'dimension.space.4').$value.value, 7);

  s = reducer(s, { type: 'EDIT_VALUE', system: 'current', path: 'primitive.dimension.space.4', value: { value: 123, unit: 'px' }, commit: true });
  s = reducer(s, { type: 'REVERT' });
  assert.equal(getAtPath(s.present.systems.current.system.primitive, 'dimension.space.4').$value.value, 7, 'revert restores the kept baseline, not the pre-kept original');
});

test('TOGGLE_LOCK + REGENERATE_SCALE: locked step is untouched, others regenerate', () => {
  let s = freshState();
  const lockedPath = 'primitive.color.brand.900';
  const before = getAtPath(s.present.systems.current.system.primitive, 'color.brand.900').$value.hex;
  s = reducer(s, { type: 'TOGGLE_LOCK', path: lockedPath });
  s = reducer(s, { type: 'REGENERATE_SCALE', system: 'current', scaleGroupPath: 'primitive.color.brand', baseHex: '#114477' });
  assert.equal(getAtPath(s.present.systems.current.system.primitive, 'color.brand.900').$value.hex, before);
  assert.notEqual(getAtPath(s.present.systems.current.system.primitive, 'color.brand.500').$value.hex, before);
});

test('CREATE_SNAPSHOT then RESTORE_SNAPSHOT brings the system back exactly', () => {
  let s = freshState();
  s = reducer(s, { type: 'EDIT_VALUE', system: 'current', path: 'primitive.dimension.space.4', value: { value: 42, unit: 'px' }, commit: true });
  s = reducer(s, { type: 'CREATE_SNAPSHOT', name: 'Spacing at 42' });
  const snapshotId = s.present.snapshots[0].id;
  s = reducer(s, { type: 'EDIT_VALUE', system: 'current', path: 'primitive.dimension.space.4', value: { value: 1000, unit: 'px' }, commit: true });
  s = reducer(s, { type: 'RESTORE_SNAPSHOT', id: snapshotId });
  assert.equal(getAtPath(s.present.systems.current.system.primitive, 'dimension.space.4').$value.value, 42);
});

test('SET_THEME and SET_UI are not undo-stacked (pure navigation)', () => {
  let s = freshState();
  s = reducer(s, { type: 'SET_THEME', theme: 'dark' });
  s = reducer(s, { type: 'SET_UI', patch: { mode: 'Guided' } });
  assert.equal(s.past.length, 0);
  assert.equal(s.present.activeTheme, 'dark');
  assert.equal(s.present.ui.mode, 'Guided');
});

test('EDIT_VALUE on semantic only changes the active theme, resolution reflects it', () => {
  let s = freshState();
  s = reducer(s, { type: 'SET_THEME', theme: 'light' });
  s = reducer(s, { type: 'EDIT_VALUE', system: 'current', path: 'semantic.color.surface.default', value: '{primitive.color.brand.900}', commit: true });
  const r = resolveToken('semantic.color.surface.default', s.present.systems.current.system, 'light');
  assert.equal(r.terminalPath, 'primitive.color.brand.900');
  const darkR = resolveToken('semantic.color.surface.default', s.present.systems.current.system, 'dark');
  assert.notEqual(darkR.terminalPath, 'primitive.color.brand.900', 'dark theme mapping must be untouched by a light-theme edit');
});
