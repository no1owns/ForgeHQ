import { isToken, isGroup } from './schema.js';

const ALIAS_RE = /^\{([^{}]+)\}$/;

export function parseAlias(value) {
  if (typeof value !== 'string') return null;
  const m = ALIAS_RE.exec(value.trim());
  return m ? m[1] : null;
}

export function makeAlias(path) {
  return `{${path}}`;
}

/**
 * Walk a DTCG-shaped document into a flat Map<path, entry>.
 * entry: { path, type, value, description, extensions, group:boolean=false }
 * $type is inherited from the nearest ancestor group that declares one.
 */
export function flatten(doc, { basePath = '', inheritedType = undefined } = {}) {
  const out = new Map();
  if (!doc || typeof doc !== 'object') return out;

  for (const [key, node] of Object.entries(doc)) {
    if (key.startsWith('$')) continue;
    const path = basePath ? `${basePath}.${key}` : key;

    if (isToken(node)) {
      out.set(path, {
        path,
        type: node.$type ?? inheritedType,
        value: node.$value,
        description: node.$description,
        extensions: node.$extensions,
      });
    } else if (isGroup(node)) {
      const groupType = node.$type ?? inheritedType;
      for (const [childPath, childEntry] of flatten(node, { basePath: path, inheritedType: groupType })) {
        out.set(childPath, childEntry);
      }
    }
    // anything else (arrays, primitives at this level) is malformed and
    // surfaced by validate.js, not silently skipped there.
  }
  return out;
}

/**
 * Resolve a single path to its terminal literal value, following alias
 * chains. Returns a result object rather than throwing, so callers (UI,
 * validators) can report problems instead of crashing mid-render.
 */
export function resolve(path, flatMap, { maxDepth = 12 } = {}) {
  const chain = [];
  let current = path;

  for (let depth = 0; depth < maxDepth; depth++) {
    if (chain.includes(current)) {
      return { ok: false, error: 'circular', chain: [...chain, current], path };
    }
    chain.push(current);

    const entry = flatMap.get(current);
    if (!entry) {
      return { ok: false, error: 'missing', chain, path, missing: current };
    }

    const alias = parseAlias(entry.value);
    if (alias === null) {
      return { ok: true, value: entry.value, type: entry.type, chain, path, terminalPath: current };
    }
    current = alias;
  }
  return { ok: false, error: 'max-depth', chain, path };
}

/** Resolve a composite ($value is an object) token, including any
 * sub-fields that are themselves aliases (e.g. typography.fontFamily). */
export function resolveComposite(entry, flatMap) {
  const out = {};
  const subResolutions = {};
  for (const [key, val] of Object.entries(entry.value)) {
    const alias = parseAlias(val);
    if (alias !== null) {
      const r = resolve(alias, flatMap);
      subResolutions[key] = r;
      out[key] = r.ok ? r.value : undefined;
    } else {
      out[key] = val;
    }
  }
  return { value: out, subResolutions };
}

/** Resolve every token in a flat map; returns a Map<path, result> plus a
 * flat list of problems for convenience (validate.js builds on this). */
export function resolveAll(flatMap) {
  const results = new Map();
  const problems = [];
  for (const path of flatMap.keys()) {
    const r = resolve(path, flatMap);
    results.set(path, r);
    if (!r.ok) problems.push(r);
  }
  return { results, problems };
}
