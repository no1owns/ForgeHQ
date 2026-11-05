import { TOKEN_TYPES, COMPOSITE_TYPES, isValidName, isToken, isGroup } from './schema.js';
import { flatten, resolve, parseAlias } from './resolve.js';

/**
 * Validate a DTCG-shaped document. Returns { errors, warnings }, never
 * throws — callers decide what's fatal. Every entry has a stable `code`
 * so the UI/tests can key off it without string-matching messages.
 */
export function validateDocument(doc) {
  const errors = [];
  const warnings = [];

  walkNames(doc, '', errors);

  const flatMap = flatten(doc);
  const seenLower = new Map();

  for (const [path, entry] of flatMap) {
    const lower = path.toLowerCase();
    if (seenLower.has(lower) && seenLower.get(lower) !== path) {
      warnings.push({ code: 'case-collision', path, message: `"${path}" and "${seenLower.get(lower)}" differ only by case; some consumers lower-case paths and would collide.` });
    } else {
      seenLower.set(lower, path);
    }

    if (!entry.type) {
      errors.push({ code: 'missing-type', path, message: `Token "${path}" has no $type and none is inherited from an ancestor group.` });
      continue;
    }
    const typeDef = TOKEN_TYPES[entry.type];
    if (!typeDef) {
      errors.push({ code: 'unknown-type', path, message: `Token "${path}" declares unsupported $type "${entry.type}".` });
      continue;
    }

    validateValueAgainstType(path, entry, typeDef, flatMap, errors, warnings);
  }

  return { errors, warnings };
}

function walkNames(node, basePath, errors) {
  if (!node || typeof node !== 'object') return;
  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith('$')) continue;
    if (!isValidName(key)) {
      errors.push({ code: 'invalid-name', path: basePath ? `${basePath}.${key}` : key, message: `"${key}" uses a reserved character (one of . { } $) in a token/group name.` });
    }
    if (isGroup(child)) walkNames(child, basePath ? `${basePath}.${key}` : key, errors);
  }
}

function validateValueAgainstType(path, entry, typeDef, flatMap, errors, warnings) {
  const alias = parseAlias(entry.value);

  if (alias !== null) {
    const r = resolve(path, flatMap);
    if (!r.ok) {
      if (r.error === 'missing') {
        errors.push({ code: 'missing-reference', path, message: `"${path}" references "${r.missing}", which does not exist.` });
      } else if (r.error === 'circular') {
        errors.push({ code: 'circular-reference', path, message: `"${path}" is part of a circular alias chain: ${r.chain.join(' -> ')}.` });
      } else {
        errors.push({ code: 'alias-error', path, message: `"${path}" could not be resolved (${r.error}).` });
      }
      return;
    }
    const targetEntry = flatMap.get(r.terminalPath);
    if (targetEntry && targetEntry.type && targetEntry.type !== entry.type) {
      errors.push({
        code: 'type-mismatch',
        path,
        message: `"${path}" is declared $type "${entry.type}" but resolves through "${r.terminalPath}" of $type "${targetEntry.type}".`,
      });
      return;
    }
    if (!typeDef.check(r.value)) {
      errors.push({ code: 'invalid-value', path, message: `"${path}" resolves to a value that doesn't match $type "${entry.type}".` });
    }
    return;
  }

  if (COMPOSITE_TYPES.has(entry.type)) {
    validateComposite(path, entry, typeDef, flatMap, errors, warnings);
    return;
  }

  if (!typeDef.check(entry.value)) {
    errors.push({ code: 'invalid-value', path, message: `"${path}" has a $value that doesn't match $type "${entry.type}": ${JSON.stringify(entry.value)}.` });
  }
}

function validateComposite(path, entry, typeDef, flatMap, errors, warnings) {
  if (!typeDef.check(entry.value)) {
    errors.push({ code: 'invalid-value', path, message: `"${path}" is missing required fields for composite type "${entry.type}".` });
    return;
  }
  for (const [field, expectedType] of Object.entries(typeDef.subfields)) {
    const raw = entry.value[field];
    if (raw === undefined) continue; // optional sub-fields are allowed
    const subAlias = parseAlias(raw);
    if (subAlias !== null) {
      const r = resolve(subAlias, flatMap);
      if (!r.ok) {
        errors.push({ code: 'missing-reference', path: `${path}.${field}`, message: `"${path}.${field}" references "${subAlias}", which could not be resolved.` });
        continue;
      }
      if (r.type && r.type !== expectedType) {
        warnings.push({ code: 'composite-type-mismatch', path: `${path}.${field}`, message: `"${path}.${field}" expects a ${expectedType} token but "${subAlias}" is ${r.type}.` });
      }
    } else {
      const subTypeDef = TOKEN_TYPES[expectedType];
      if (subTypeDef && !subTypeDef.check(raw)) {
        warnings.push({ code: 'composite-value-shape', path: `${path}.${field}`, message: `"${path}.${field}" has a literal value that doesn't look like a ${expectedType}.` });
      }
    }
  }
}

/** Detect duplicate paths that arise from merging two documents (e.g.
 * import + current project) — this can't happen within one well-formed
 * JSON object (object keys are unique) so it's checked explicitly at
 * merge time rather than in validateDocument. */
export function findMergeConflicts(flatMapA, flatMapB) {
  const conflicts = [];
  for (const path of flatMapB.keys()) {
    if (flatMapA.has(path)) conflicts.push(path);
  }
  return conflicts;
}
