import { buildSystem, SEED_PRESETS } from './defaults.js';
import { LEGACY_DIRECTIONS } from './fonts.js';

export const PROJECT_SCHEMA_VERSION = 2;

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function defaultUi() {
  return { mode: 'Studio', section: 'All', context: 'Landing', compare: true, mobileVersion: 'Current', interactionMode: 'select' };
}

/** `initialSystem` is a frozen-in-spirit copy of a system as first built
 * (from a seed, a migration, or a preset) — the reset target for
 * RESET_TOKEN. It's set once here and never updated by ordinary edits, so
 * "reset" always means "back to where this system started", not "back to
 * its last save". */
export function makeSystemEntry(label, system) {
  return { label, system, initialSystem: structuredClone(system) };
}

export function emptyProjectDocument() {
  return {
    schemaVersion: PROJECT_SCHEMA_VERSION,
    systems: {
      current: makeSystemEntry('Current exploration', buildSystem(SEED_PRESETS.editorial)),
      baseline: makeSystemEntry('Saved direction', buildSystem(SEED_PRESETS.modern)),
    },
    activeTheme: 'light',
    ui: defaultUi(),
    snapshots: [],
    locks: {},
  };
}

/** v1 ("bss-project-v1") was a flat {accent,surface,text,font,scale,
 * weight,radius,spacing} pair per system, with font as one of three named
 * directions. This is the exact shape Brand System Studio v0.1 used both
 * in localStorage and in its "Project JSON" export, so both load paths
 * funnel through here. */
export function isLegacyV1Shape(raw) {
  return (
    !!raw && typeof raw === 'object' &&
    !raw.schemaVersion &&
    isLegacyFlatSystem(raw.current) &&
    isLegacyFlatSystem(raw.saved)
  );
}

function isLegacyFlatSystem(v) {
  return (
    !!v && typeof v === 'object' &&
    typeof v.accent === 'string' && typeof v.surface === 'string' && typeof v.text === 'string' &&
    typeof v.font === 'string' && typeof v.scale === 'number' && typeof v.weight === 'number' &&
    typeof v.radius === 'number' && typeof v.spacing === 'number'
  );
}

function legacyFlatToSeed(flat) {
  const direction = LEGACY_DIRECTIONS[flat.font] ?? LEGACY_DIRECTIONS.Editorial;
  return {
    accentHex: flat.accent,
    surfaceHex: flat.surface,
    textHex: flat.text,
    headingFont: direction.heading,
    bodyFont: direction.body,
    headingWeight: flat.weight,
    scale: flat.scale,
    radius: flat.radius,
    spacing: flat.spacing,
  };
}

export function migrateV1ToV2(v1) {
  return {
    schemaVersion: PROJECT_SCHEMA_VERSION,
    systems: {
      current: makeSystemEntry('Current exploration', buildSystem(legacyFlatToSeed(v1.current))),
      baseline: makeSystemEntry('Saved direction', buildSystem(legacyFlatToSeed(v1.saved))),
    },
    activeTheme: 'light',
    ui: defaultUi(),
    snapshots: [],
    locks: {},
    migratedFrom: 'v1',
  };
}

/** Load whatever's in localStorage (or an imported file) and return a v2
 * project document, migrating in place if needed. Never throws — callers
 * get {ok:false, reason} instead, so a corrupt/foreign value never takes
 * down the app on load. */
export function loadAndMigrate(raw) {
  if (raw == null) return { ok: false, reason: 'empty' };
  let parsed = raw;
  if (typeof raw === 'string') {
    try { parsed = JSON.parse(raw); } catch { return { ok: false, reason: 'invalid-json' }; }
  }
  if (parsed?.schemaVersion === PROJECT_SCHEMA_VERSION) {
    return { ok: true, project: parsed, migrated: false };
  }
  if (isLegacyV1Shape(parsed)) {
    return { ok: true, project: migrateV1ToV2(parsed), migrated: true, from: 'v1' };
  }
  return { ok: false, reason: 'unrecognized-shape' };
}

export function createSnapshot(system, name) {
  return { id: newId(), name, createdAt: new Date().toISOString(), system };
}
