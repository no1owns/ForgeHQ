import { validateDocument } from './validate.js';
import { flatten } from './resolve.js';
import { validateSystem, flattenSystem } from './project.js';

const KNOWN_TOP_LEVEL = new Set(['primitive', 'semantic', 'component']);

/**
 * Review (don't apply) importing a raw DTCG-shaped JSON document into one
 * system's primitive/semantic(theme)/component layers. Reports what would
 * happen without touching anything — the caller only calls applyDTCGImport
 * once the user accepts. "Conflicts" are paths that exist both in the
 * import and the current system with a different value.
 */
export function reviewDTCGImport(raw, targetSystem, theme) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, reason: 'not-an-object' };
  }

  const recognizedGroups = Object.keys(raw).filter((k) => KNOWN_TOP_LEVEL.has(k));
  const unsupportedGroups = Object.keys(raw).filter((k) => !KNOWN_TOP_LEVEL.has(k) && !k.startsWith('$'));
  if (recognizedGroups.length === 0) {
    return { ok: false, reason: 'no-recognized-groups', unsupportedGroups };
  }

  const { errors, warnings } = validateDocument(raw);

  const currentFlat = flattenSystem(targetSystem, theme);
  const importFlat = flatten(raw);
  const conflicts = [];
  for (const [path, entry] of importFlat) {
    const existing = currentFlat.get(mapImportPathToSystemPath(path, raw));
    if (existing && JSON.stringify(existing.value) !== JSON.stringify(entry.value)) {
      conflicts.push(path);
    }
  }

  const previewSystem = mergeGroups(targetSystem, raw, theme, recognizedGroups);
  const postMergeErrors = validateSystem(previewSystem)[theme]?.errors ?? [];

  return {
    ok: true,
    raw,
    theme,
    recognizedGroups,
    unsupportedGroups,
    errors,
    warnings,
    conflicts,
    postMergeErrors,
    previewSystem,
  };
}

// The imported doc's top-level groups are 'primitive'/'semantic'/
// 'component' same as our internal layout, so paths line up 1:1 — this
// indirection exists so a future looser import format doesn't have to
// change the conflict-detection call site.
function mapImportPathToSystemPath(path) {
  return path;
}

function mergeGroups(targetSystem, raw, theme, groups) {
  const next = structuredClone(targetSystem);
  if (groups.includes('primitive') && raw.primitive) next.primitive = raw.primitive;
  if (groups.includes('semantic') && raw.semantic) next.semanticByTheme[theme] = raw.semantic;
  if (groups.includes('component') && raw.component) next.component = raw.component;
  return next;
}

/** Apply a reviewed import, re-deriving the merged system from the
 * original (pre-import) system so the caller can selectively accept only
 * some of the recognized groups (e.g. bring in `semantic` but reject
 * `component` from the same file) instead of all-or-nothing. Defaults to
 * every group the review recognized, i.e. the same result as
 * review.previewSystem. */
export function applyDTCGImport(targetSystem, review, { onlyGroups = review.recognizedGroups } = {}) {
  return mergeGroups(targetSystem, review.raw, review.theme, onlyGroups);
}
