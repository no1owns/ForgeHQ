import { useReducer, useEffect, useMemo, useRef } from 'react';
import { emptyProjectDocument, loadAndMigrate, createSnapshot, makeSystemEntry, PROJECT_SCHEMA_VERSION } from '../tokens/migrate.js';
import { setTokenValue, setTokenAlias, renameTokenPath, regenerateScale, getAtPath } from '../tokens/edit.js';
import { buildSystem } from '../tokens/defaults.js';
import { validateSystem } from '../tokens/project.js';

export const STORAGE_KEY = 'bss-project-v2';
const LEGACY_STORAGE_KEY = 'bss-project-v1';

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return { project: emptyProjectDocument(), migrated: false, loadError: null };
    const result = loadAndMigrate(raw);
    if (result.ok) return { project: result.project, migrated: result.migrated, loadError: null };
    return { project: emptyProjectDocument(), migrated: false, loadError: result.reason };
  } catch {
    return { project: emptyProjectDocument(), migrated: false, loadError: 'storage-unavailable' };
  }
}

function initialHistoryState() {
  const { project, migrated, loadError } = loadInitial();
  return { past: [], present: project, future: [], migrated, loadError, storageOk: true };
}

function withSystem(project, key, nextSystem) {
  return { ...project, systems: { ...project.systems, [key]: { ...project.systems[key], system: nextSystem } } };
}

function commitTo(state, nextProject) {
  // If a live-preview sequence (a slider drag) is in progress, the correct
  // "previous" history entry is what present was BEFORE that sequence
  // started (liveBase) — not state.present, which already reflects the
  // last live tick. Without this, undo would land back on the last live
  // frame instead of truly undoing the drag.
  const previous = state.liveBase ?? state.present;
  return { ...state, past: [...state.past, previous].slice(-100), present: nextProject, future: [], liveBase: null };
}

export function reducer(state, action) {
  switch (action.type) {
    case 'EDIT_VALUE': {
      const { system, path, value, theme, subfield, commit } = action;
      const sysDoc = state.present.systems[system].system;
      const nextSys = setTokenValue(sysDoc, path, value, { theme: theme ?? state.present.activeTheme, subfield });
      const nextProject = withSystem(state.present, system, nextSys);
      if (commit) return commitTo(state, nextProject);
      // Live preview: remember the pre-drag present exactly once, the
      // first tick of the sequence, then just keep updating present.
      return { ...state, present: nextProject, liveBase: state.liveBase ?? state.present };
    }
    case 'EDIT_ALIAS': {
      const { system, path, targetPath, theme } = action;
      const sysDoc = state.present.systems[system].system;
      const nextSys = setTokenAlias(sysDoc, path, targetPath, { theme: theme ?? state.present.activeTheme });
      return commitTo(state, withSystem(state.present, system, nextSys));
    }
    case 'RENAME_TOKEN': {
      const { system, oldPath, newPath } = action;
      const sysDoc = state.present.systems[system].system;
      const { system: nextSys } = renameTokenPath(sysDoc, oldPath, newPath);
      return commitTo(state, withSystem(state.present, system, nextSys));
    }
    case 'REGENERATE_SCALE': {
      const { system, scaleGroupPath, baseHex } = action;
      const sysDoc = state.present.systems[system].system;
      const nextSys = regenerateScale(sysDoc, scaleGroupPath, baseHex, state.present.locks);
      return commitTo(state, withSystem(state.present, system, nextSys));
    }
    case 'RESET_TOKEN': {
      const { system, path, theme } = action;
      const sysDoc = state.present.systems[system].system;
      const initial = state.present.systems[system].initialSystem ?? sysDoc;
      const t = theme ?? state.present.activeTheme;
      const layer = path.split('.')[0];
      const subPath = path.slice(path.indexOf('.') + 1);
      const originalNode = layer === 'semantic'
        ? getAtPath(initial.semanticByTheme[t], subPath)
        : getAtPath(layer === 'primitive' ? initial.primitive : initial.component, subPath);
      if (!originalNode) return state;
      const nextSys = setTokenValue(sysDoc, path, originalNode.$value, { theme: t });
      return commitTo(state, withSystem(state.present, system, nextSys));
    }
    case 'TOGGLE_LOCK': {
      const locks = { ...state.present.locks };
      if (locks[action.path]) delete locks[action.path]; else locks[action.path] = true;
      return commitTo(state, { ...state.present, locks });
    }
    case 'KEEP': {
      // "Keep" makes the current exploration the new saved baseline — that
      // moment also becomes the baseline's new reset target (makeSystemEntry
      // refreshes initialSystem), not the preset it started the session on.
      const nextProject = {
        ...state.present,
        systems: {
          ...state.present.systems,
          baseline: makeSystemEntry(state.present.systems.baseline.label, structuredClone(state.present.systems.current.system)),
        },
      };
      return commitTo(state, nextProject);
    }
    case 'REVERT': {
      const nextProject = {
        ...state.present,
        systems: {
          ...state.present.systems,
          current: makeSystemEntry(state.present.systems.current.label, structuredClone(state.present.systems.baseline.system)),
        },
      };
      return commitTo(state, nextProject);
    }
    case 'CREATE_SNAPSHOT': {
      const snap = createSnapshot(structuredClone(state.present.systems.current.system), action.name);
      return commitTo(state, { ...state.present, snapshots: [snap, ...state.present.snapshots].slice(0, 50) });
    }
    case 'RESTORE_SNAPSHOT': {
      const snap = state.present.snapshots.find((s) => s.id === action.id);
      if (!snap) return state;
      return commitTo(state, withSystem(state.present, 'current', structuredClone(snap.system)));
    }
    case 'DELETE_SNAPSHOT': {
      return commitTo(state, { ...state.present, snapshots: state.present.snapshots.filter((s) => s.id !== action.id) });
    }
    case 'SET_UI': {
      // UI prefs (mode/section/context/etc.) are not undo-stacked — they're
      // navigation, not edits to the system.
      return { ...state, present: { ...state.present, ui: { ...state.present.ui, ...action.patch } } };
    }
    case 'SET_THEME': {
      return { ...state, present: { ...state.present, activeTheme: action.theme } };
    }
    case 'APPLY_PRESET': {
      // The legacy Editorial/Modern/Technical directions: replace `current`
      // wholesale with a system built from a named seed. This is distinct
      // from a Guided-mode adjustment (APPLY_TOKEN_DIFF below), which
      // nudges specific tokens on the *existing* system instead of
      // replacing it.
      const nextSys = buildSystem(action.seed);
      const entry = makeSystemEntry(state.present.systems.current.label, nextSys);
      return commitTo(state, { ...state.present, systems: { ...state.present.systems, current: entry } });
    }
    case 'APPLY_TOKEN_DIFF': {
      // Guided mode: apply a named set of {path, value, theme?, subfield?}
      // edits to the *existing* current system (see guided.js), instead of
      // rebuilding it from a seed — so a plain-language nudge doesn't
      // discard unrelated customizations.
      let sysDoc = state.present.systems.current.system;
      for (const edit of action.edits) {
        sysDoc = setTokenValue(sysDoc, edit.path, edit.value, { theme: edit.theme ?? state.present.activeTheme, subfield: edit.subfield });
      }
      return commitTo(state, withSystem(state.present, 'current', sysDoc));
    }
    case 'IMPORT_REPLACE': {
      return commitTo(state, action.project);
    }
    case 'IMPORT_SYSTEM': {
      // A DTCG token-file import (as opposed to a whole project import):
      // replaces just `current`'s system with one already merged by
      // tokens/importDTCG.js (selected groups applied, the rest carried
      // over from what was there), not the whole project document.
      return commitTo(state, withSystem(state.present, 'current', action.system));
    }
    case 'IMPORT_MERGE': {
      // Merge only the named system(s) from the imported project into the
      // current one, leaving everything else (the other system, snapshots,
      // locks, UI) untouched.
      let nextProject = state.present;
      for (const key of action.systemKeys) {
        if (action.project.systems[key]) {
          nextProject = withSystem(nextProject, key, structuredClone(action.project.systems[key].system));
        }
      }
      return commitTo(state, nextProject);
    }
    case 'UNDO': {
      if (!state.past.length) return state;
      const previous = state.past[state.past.length - 1];
      return { ...state, past: state.past.slice(0, -1), present: previous, future: [state.present, ...state.future].slice(0, 100) };
    }
    case 'REDO': {
      if (!state.future.length) return state;
      const [next, ...rest] = state.future;
      return { ...state, past: [...state.past, state.present].slice(-100), present: next, future: rest };
    }
    default:
      return state;
  }
}

export function useProjectStore() {
  const [state, dispatch] = useReducer(reducer, undefined, initialHistoryState);
  const saveTimer = useRef(null);

  useEffect(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.present));
      } catch {
        // storage unavailable (private mode, quota) — surfaced in the UI via storageOk
      }
    }, 150);
    return () => clearTimeout(saveTimer.current);
  }, [state.present]);

  const actions = useMemo(() => ({
    editValue: (system, path, value, opts = {}) => dispatch({ type: 'EDIT_VALUE', system, path, value, commit: true, ...opts }),
    editValueLive: (system, path, value, opts = {}) => dispatch({ type: 'EDIT_VALUE', system, path, value, commit: false, ...opts }),
    editAlias: (system, path, targetPath, opts = {}) => dispatch({ type: 'EDIT_ALIAS', system, path, targetPath, ...opts }),
    renameToken: (system, oldPath, newPath) => dispatch({ type: 'RENAME_TOKEN', system, oldPath, newPath }),
    regenerateScale: (system, scaleGroupPath, baseHex) => dispatch({ type: 'REGENERATE_SCALE', system, scaleGroupPath, baseHex }),
    resetToken: (system, path, theme) => dispatch({ type: 'RESET_TOKEN', system, path, theme }),
    toggleLock: (path) => dispatch({ type: 'TOGGLE_LOCK', path }),
    keep: () => dispatch({ type: 'KEEP' }),
    revert: () => dispatch({ type: 'REVERT' }),
    createSnapshot: (name) => dispatch({ type: 'CREATE_SNAPSHOT', name }),
    restoreSnapshot: (id) => dispatch({ type: 'RESTORE_SNAPSHOT', id }),
    deleteSnapshot: (id) => dispatch({ type: 'DELETE_SNAPSHOT', id }),
    setUi: (patch) => dispatch({ type: 'SET_UI', patch }),
    setTheme: (theme) => dispatch({ type: 'SET_THEME', theme }),
    applyPreset: (seed) => dispatch({ type: 'APPLY_PRESET', seed }),
    applyTokenDiff: (edits) => dispatch({ type: 'APPLY_TOKEN_DIFF', edits }),
    importReplace: (project) => dispatch({ type: 'IMPORT_REPLACE', project }),
    importSystem: (system) => dispatch({ type: 'IMPORT_SYSTEM', system }),
    importMerge: (project, systemKeys) => dispatch({ type: 'IMPORT_MERGE', project, systemKeys }),
    undo: () => dispatch({ type: 'UNDO' }),
    redo: () => dispatch({ type: 'REDO' }),
  }), []);

  const validation = useMemo(() => ({
    current: validateSystem(state.present.systems.current.system),
    baseline: validateSystem(state.present.systems.baseline.system),
  }), [state.present.systems]);

  return {
    project: state.present,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    migrated: state.migrated,
    loadError: state.loadError,
    validation,
    actions,
  };
}

export { PROJECT_SCHEMA_VERSION };
