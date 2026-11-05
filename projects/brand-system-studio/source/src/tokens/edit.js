import { makeAlias } from './resolve.js';
import { generateTonalScale } from './color-math.js';

export function getAtPath(root, dottedPath) {
  let node = root;
  for (const key of dottedPath.split('.')) {
    if (node == null) return undefined;
    node = node[key];
  }
  return node;
}

function layerOf(path) {
  const dot = path.indexOf('.');
  return { layer: path.slice(0, dot), subPath: path.slice(dot + 1) };
}

/** Which layer document (within a cloned system) a full "layer.sub.path"
 * token path lives in. `theme` selects which semantic document — edits
 * always target the currently-previewed theme's semantic layer, leaving
 * the other theme's mapping untouched (that's a deliberate per-theme
 * editing model, not an oversight: a color chosen for dark mode is not
 * assumed to be right for light mode too). */
function resolveLayerDoc(system, layer, theme) {
  if (layer === 'primitive') return system.primitive;
  if (layer === 'component') return system.component;
  if (layer === 'semantic') return system.semanticByTheme[theme] ?? system.semanticByTheme.light;
  return null;
}

/** Set a token's literal $value (or, for a composite token, one named
 * sub-field of it) at `path`, returning a new system object. Does not
 * mutate the input. */
export function setTokenValue(system, path, value, { theme = 'light', subfield = null } = {}) {
  const { layer, subPath } = layerOf(path);
  const next = structuredClone(system);
  const doc = resolveLayerDoc(next, layer, theme);
  if (!doc) return system;

  const keys = subPath.split('.');
  let node = doc;
  for (let i = 0; i < keys.length - 1; i++) {
    if (node[keys[i]] === undefined) return system; // path doesn't exist; no-op rather than throw
    node = node[keys[i]];
  }
  const lastKey = keys[keys.length - 1];
  const token = node[lastKey];
  if (!token) return system;

  if (subfield) {
    node[lastKey] = { ...token, $value: { ...token.$value, [subfield]: value } };
  } else {
    node[lastKey] = { ...token, $value: value };
  }
  return next;
}

/** Point a token's $value at a different alias target (reassigning which
 * primitive/semantic role it references), as distinct from editing a
 * literal value — this is the "edit primitive values and alias
 * assignments separately" requirement. */
export function setTokenAlias(system, path, targetPath, opts = {}) {
  return setTokenValue(system, path, makeAlias(targetPath), opts);
}

function walkAliasStrings(node, visit) {
  if (node == null || typeof node !== 'object') return;
  if ('$value' in node) {
    if (typeof node.$value === 'string') {
      const updated = visit(node.$value);
      if (updated !== node.$value) node.$value = updated;
    } else if (node.$value && typeof node.$value === 'object') {
      for (const key of Object.keys(node.$value)) {
        if (typeof node.$value[key] === 'string') {
          const updated = visit(node.$value[key]);
          if (updated !== node.$value[key]) node.$value[key] = updated;
        }
      }
    }
    return;
  }
  for (const key of Object.keys(node)) {
    if (!key.startsWith('$')) walkAliasStrings(node[key], visit);
  }
}

/** Move a token (or group) from oldPath to newPath within its layer, and
 * rewrite every {oldPath...} alias across ALL layers/themes that pointed
 * into it (including references into a renamed *group*, e.g. renaming
 * "color.brand" to "color.primary" updates "{color.brand.600}" to
 * "{color.primary.600}" too). Returns {system, renamedReferences}: a
 * count so the UI can show what it actually changed. */
export function renameTokenPath(system, oldPath, newPath) {
  const { layer: oldLayer, subPath: oldSub } = layerOf(oldPath);
  const { layer: newLayer, subPath: newSub } = layerOf(newPath);
  if (oldLayer !== newLayer) {
    throw new Error('renameTokenPath cannot move a token across layers (primitive/semantic/component)');
  }

  const next = structuredClone(system);
  const docsToEditIn = oldLayer === 'semantic' ? Object.values(next.semanticByTheme) : [resolveLayerDoc(next, oldLayer, null)];

  for (const doc of docsToEditIn) {
    const oldKeys = oldSub.split('.');
    const newKeys = newSub.split('.');
    let parent = doc;
    for (let i = 0; i < oldKeys.length - 1; i++) parent = parent?.[oldKeys[i]];
    const node = parent?.[oldKeys[oldKeys.length - 1]];
    if (node === undefined) continue;
    delete parent[oldKeys[oldKeys.length - 1]];

    let destParent = doc;
    for (let i = 0; i < newKeys.length - 1; i++) {
      destParent[newKeys[i]] ??= {};
      destParent = destParent[newKeys[i]];
    }
    destParent[newKeys[newKeys.length - 1]] = node;
  }

  let renamedReferences = 0;
  const rewrite = (value) => {
    if (value === oldPath || value.startsWith(`${oldPath}.`)) {
      renamedReferences++;
      return newPath + value.slice(oldPath.length);
    }
    return value;
  };
  // Aliases are stored as "{path}"; rewrite inside the braces.
  const visit = (raw) => {
    const m = /^\{([^{}]+)\}$/.exec(raw);
    if (!m) return raw;
    const rewritten = rewrite(m[1]);
    return rewritten === m[1] ? raw : `{${rewritten}}`;
  };
  walkAliasStrings(next.primitive, visit);
  for (const semanticDoc of Object.values(next.semanticByTheme)) walkAliasStrings(semanticDoc, visit);
  walkAliasStrings(next.component, visit);

  return { system: next, renamedReferences };
}

/** Regenerate a tonal scale (e.g. primitive.color.brand) from one of its
 * own steps, skipping any step whose full path is in `locks`. Explicit,
 * on-demand — never runs as a side effect of an unrelated edit. */
export function regenerateScale(system, scaleGroupPath, baseHex, locks = {}) {
  const scale = generateTonalScale(baseHex);
  if (!scale) return system;
  let next = system;
  for (const [step, hex] of Object.entries(scale)) {
    const path = `${scaleGroupPath}.${step}`;
    if (locks[path]) continue;
    const { r, g, b } = hexComponents(hex);
    next = setTokenValue(next, path, { colorSpace: 'srgb', components: [r, g, b], alpha: 1, hex });
  }
  return next;
}

function hexComponents(hex) {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  const round3 = (n) => Math.round(n * 1000) / 1000;
  return { r: round3(parseInt(m[1], 16) / 255), g: round3(parseInt(m[2], 16) / 255), b: round3(parseInt(m[3], 16) / 255) };
}
