import { flatten, resolve, resolveComposite } from './resolve.js';
import { validateDocument } from './validate.js';
import { COMPOSITE_TYPES } from './schema.js';

/** Merge a system's three layers into one DTCG document for a given
 * theme. `semantic.*` paths resolve against that theme's semantic layer;
 * `primitive.*` and `component.*` are theme-independent. This is the unit
 * that gets validated, resolved, and exported — see tokens/serialize.js
 * and the "one self-contained token file per theme" packaging note in
 * export/agentPackage.js. */
export function mergeForTheme(system, theme) {
  const semantic = system.semanticByTheme[theme] ?? system.semanticByTheme.light;
  return { primitive: system.primitive, semantic, component: system.component };
}

export function validateSystem(system) {
  const byTheme = {};
  for (const theme of Object.keys(system.semanticByTheme)) {
    byTheme[theme] = validateDocument(mergeForTheme(system, theme));
  }
  return byTheme;
}

export function validateProjectDocument(project) {
  const errors = [];
  if (!project || typeof project !== 'object' || Array.isArray(project)) {
    errors.push({ code: 'invalid-project-shape', message: 'Project document is not an object.' });
    return { ok: false, errors };
  }
  if (project.schemaVersion !== 2) {
    errors.push({ code: 'invalid-schema-version', path: 'schemaVersion', message: `Expected schemaVersion 2, got ${String(project.schemaVersion)}.` });
  }
  if (!project.systems || typeof project.systems !== 'object') {
    errors.push({ code: 'missing-systems', path: 'systems', message: 'Project is missing the systems object.' });
    return { ok: errors.length === 0, errors };
  }
  for (const key of ['current', 'baseline']) {
    const entry = project.systems[key];
    if (!entry || typeof entry !== 'object') {
      errors.push({ code: `missing-${key}-system`, path: `systems.${key}`, message: `Project is missing systems.${key}.` });
      continue;
    }
    const system = entry.system;
    if (!system || typeof system !== 'object' || !system.primitive || !system.semanticByTheme || !system.component) {
      errors.push({ code: `invalid-${key}-system`, path: `systems.${key}.system`, message: `systems.${key}.system is missing a primitive/semantic/component structure.` });
      continue;
    }
    const byTheme = validateSystem(system);
    for (const [theme, result] of Object.entries(byTheme)) {
      for (const err of result.errors) {
        errors.push({ code: err.code, path: `${key}/${theme}/${err.path || ''}`.replace(/\/+$/, ''), message: `${err.message}` });
      }
    }
  }
  if (!project.ui || typeof project.ui !== 'object') {
    errors.push({ code: 'missing-ui', path: 'ui', message: 'Project is missing the ui state.' });
  }
  if (!project.activeTheme || typeof project.activeTheme !== 'string') {
    errors.push({ code: 'missing-active-theme', path: 'activeTheme', message: 'Project is missing activeTheme.' });
  }
  if (!Array.isArray(project.snapshots)) {
    errors.push({ code: 'invalid-snapshots', path: 'snapshots', message: 'Project snapshots must be an array.' });
  }
  if (!project.locks || typeof project.locks !== 'object' || Array.isArray(project.locks)) {
    errors.push({ code: 'invalid-locks', path: 'locks', message: 'Project locks must be an object.' });
  }
  return { ok: errors.length === 0, errors };
}

/** Resolve a token path to its display-ready literal, including composite
 * sub-fields. `theme` picks which semantic layer component tokens
 * (indirectly) resolve against. */
export function resolveToken(path, system, theme) {
  const flat = flatten(mergeForTheme(system, theme));
  const entry = flat.get(path);
  if (!entry) return { ok: false, error: 'missing', path };
  if (COMPOSITE_TYPES.has(entry.type)) {
    const { value, subResolutions } = resolveComposite(entry, flat);
    return { ok: true, path, type: entry.type, value, subResolutions, composite: true };
  }
  return resolve(path, flat);
}

export function flattenSystem(system, theme) {
  return flatten(mergeForTheme(system, theme));
}
