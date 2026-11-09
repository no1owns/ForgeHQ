import { flatten, resolve, resolveComposite } from './resolve.js';
import { validateDocument } from './validate.js';
import { COMPOSITE_TYPES } from './schema.js';

/** Merge a system's three layers into one DTCG document for a given theme. */
export function mergeForTheme(system, theme) {
  const semantic = system.semanticByTheme[theme] ?? system.semanticByTheme.light;
  return { primitive: system.primitive, semantic, component: system.component };
}

export function validateSystem(system) {
  if (!system || typeof system !== 'object' || !system.semanticByTheme || typeof system.semanticByTheme !== 'object') {
    return { _project: { errors: [{ code: 'invalid-system', path: '', message: 'System is missing semanticByTheme.' }], warnings: [] } };
  }
  const byTheme = {};
  for (const theme of Object.keys(system.semanticByTheme)) {
    try {
      byTheme[theme] = validateDocument(mergeForTheme(system, theme));
    } catch (error) {
      byTheme[theme] = { errors: [{ code: 'invalid-system', path: '', message: `Could not validate ${theme} theme: ${error.message}` }], warnings: [] };
    }
  }
  if (!Object.keys(byTheme).length) {
    byTheme._project = { errors: [{ code: 'missing-themes', path: 'semanticByTheme', message: 'System has no theme mappings.' }], warnings: [] };
  }
  return byTheme;
}

/** Validate the enclosing project shape before code dereferences nested data. */
export function validateProjectDocument(project) {
  const errors = [];
  const add = (code, path, message) => errors.push({ code, path, message });
  if (!project || typeof project !== 'object' || Array.isArray(project)) {
    add('invalid-project-shape', '', 'Project document must be an object.');
    return { ok: false, errors };
  }
  if (project.schemaVersion !== 2) add('invalid-schema-version', 'schemaVersion', 'Project schema version is not supported.');
  if (!project.systems || typeof project.systems !== 'object' || Array.isArray(project.systems)) {
    add('missing-systems', 'systems', 'Project is missing the systems object.');
  } else {
    for (const key of ['current', 'baseline']) {
      const entry = project.systems[key];
      if (!entry || typeof entry !== 'object' || Array.isArray(entry) || typeof entry.label !== 'string') {
        add('invalid-system-entry', `systems.${key}`, `Project is missing a valid systems.${key} entry.`);
        continue;
      }
      const system = entry.system;
      if (!system || typeof system !== 'object' || !system.primitive || !system.component || !system.semanticByTheme || typeof system.semanticByTheme !== 'object' || Array.isArray(system.semanticByTheme)) {
        add('invalid-system', `systems.${key}.system`, `systems.${key}.system must contain primitive, component, and semanticByTheme objects.`);
        continue;
      }
      const themes = Object.keys(system.semanticByTheme);
      if (!themes.length || themes.some((theme) => !system.semanticByTheme[theme] || typeof system.semanticByTheme[theme] !== 'object')) {
        add('invalid-themes', `systems.${key}.system.semanticByTheme`, `systems.${key}.system must contain valid theme documents.`);
        continue;
      }
      for (const [theme, result] of Object.entries(validateSystem(system))) {
        for (const error of result.errors) {
          add(error.code, `systems.${key}.system.${theme}${error.path ? `.${error.path}` : ''}`, error.message);
        }
      }
    }
  }
  if (!project.ui || typeof project.ui !== 'object' || Array.isArray(project.ui)) add('invalid-ui', 'ui', 'Project is missing its UI state.');
  if (typeof project.activeTheme !== 'string' || !project.activeTheme) add('invalid-active-theme', 'activeTheme', 'Project is missing its active theme.');
  if (!Array.isArray(project.snapshots)) add('invalid-snapshots', 'snapshots', 'Project snapshots must be an array.');
  if (!project.locks || typeof project.locks !== 'object' || Array.isArray(project.locks)) add('invalid-locks', 'locks', 'Project locks must be an object.');
  return { ok: errors.length === 0, errors };
}

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
