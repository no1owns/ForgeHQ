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
