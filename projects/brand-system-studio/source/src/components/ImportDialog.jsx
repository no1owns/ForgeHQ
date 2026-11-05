import { useState } from 'react';
import { loadAndMigrate } from '../tokens/migrate.js';
import { reviewDTCGImport, applyDTCGImport } from '../tokens/importDTCG.js';

/**
 * Reads a file, classifies it (versioned project JSON, legacy v1 project,
 * or a DTCG token document) and shows a review before anything is
 * applied — the original project is untouched until the user accepts.
 */
export default function ImportDialog({ project, activeTheme, onClose, onImportProject, onImportTokens, onNotice }) {
  const [state, setState] = useState({ step: 'pick' }); // pick | project-review | dtcg-review | error
  const [raw, setRaw] = useState(null);

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    let parsed;
    try {
      parsed = JSON.parse(await file.text());
    } catch {
      setState({ step: 'error', message: 'This file is not valid JSON.' });
      return;
    }
    setRaw(parsed);

    const migration = loadAndMigrate(parsed);
    if (migration.ok) {
      setState({ step: 'project-review', migration });
      return;
    }

    const dtcgReview = reviewDTCGImport(parsed, project.systems.current.system, activeTheme);
    if (dtcgReview.ok) {
      setState({ step: 'dtcg-review', review: dtcgReview, acceptedGroups: new Set(dtcgReview.recognizedGroups) });
      return;
    }

    setState({ step: 'error', message: 'This file is not a recognized Brand System Studio project or a DTCG token file (no recognized top-level groups).' });
  }

  function handleKeyDown(e) {
    if (e.key !== 'Tab') return;
    const nodes = [...e.currentTarget.querySelectorAll('button, input, select')];
    const first = nodes[0], last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  return (
    <div className="modal-backdrop" onClick={(ev) => { if (ev.target === ev.currentTarget) onClose(); }}>
      <section onKeyDown={handleKeyDown} className="export-dialog" role="dialog" aria-modal="true" aria-label="Import a project or token file">
        <div className="dialog-title">
          <h2>Import</h2>
          <button autoFocus onClick={onClose}>Close</button>
        </div>

        {state.step === 'pick' && (
          <>
            <p>A Brand System Studio project export (current format or the original v0.1 format) or a DTCG token file. Nothing is replaced until you review and accept it.</p>
            <label className="import-button">
              Choose file&hellip;
              <input type="file" accept="application/json,.json" onChange={handleFile} />
            </label>
          </>
        )}

        {state.step === 'error' && (
          <>
            <p className="inspector-error">{state.message}</p>
            <button onClick={() => setState({ step: 'pick' })}>Try another file</button>
          </>
        )}

        {state.step === 'project-review' && (
          <ProjectReview
            migration={state.migration}
            onCancel={() => setState({ step: 'pick' })}
            onAccept={() => { onImportProject(state.migration.project); onNotice(state.migration.migrated ? 'Project imported and migrated to the current format.' : 'Project imported.'); onClose(); }}
          />
        )}

        {state.step === 'dtcg-review' && (
          <DtcgReview
            review={state.review}
            acceptedGroups={state.acceptedGroups}
            onToggleGroup={(g) => setState((s) => {
              const next = new Set(s.acceptedGroups);
              next.has(g) ? next.delete(g) : next.add(g);
              return { ...s, acceptedGroups: next };
            })}
            onCancel={() => setState({ step: 'pick' })}
            onAccept={(mode) => {
              const target = project.systems.current.system;
              const onlyGroups = mode === 'replace' ? state.review.recognizedGroups : [...state.acceptedGroups];
              const nextSystem = applyDTCGImport(target, state.review, { onlyGroups });
              onImportTokens(nextSystem);
              onNotice(`Imported ${onlyGroups.join(', ')} into the current system.`);
              onClose();
            }}
          />
        )}
      </section>
    </div>
  );
}

function ProjectReview({ migration, onCancel, onAccept }) {
  return (
    <>
      <p>
        Recognized as a {migration.migrated ? `v0.1 (legacy) project — will be migrated to the current format.` : 'current-format project.'}
      </p>
      <ul className="import-summary">
        <li>Current system: {migration.project.systems.current.label}</li>
        <li>Saved/baseline system: {migration.project.systems.baseline.label}</li>
        <li>Snapshots: {migration.project.snapshots?.length ?? 0}</li>
        <li>Themes: {Object.keys(migration.project.systems.current.system.semanticByTheme).join(', ')}</li>
      </ul>
      <p className="hint">Importing replaces your current project entirely. Your present project is not deleted until you accept — cancel to keep working on it.</p>
      <div className="export-tabs">
        <button onClick={onCancel}>Cancel</button>
        <button className="primary" onClick={onAccept}>Replace current project</button>
      </div>
    </>
  );
}

function DtcgReview({ review, acceptedGroups, onToggleGroup, onCancel, onAccept }) {
  return (
    <>
      <p>Recognized groups: <code>{review.recognizedGroups.join(', ')}</code></p>
      {review.unsupportedGroups.length > 0 && (
        <p className="hint">Unsupported/ignored top-level content: <code>{review.unsupportedGroups.join(', ')}</code></p>
      )}
      {review.errors.length > 0 && (
        <div className="import-errors">
          <b>{review.errors.length} validation error(s):</b>
          <ul>{review.errors.slice(0, 10).map((e, i) => <li key={i}>{e.message}</li>)}</ul>
        </div>
      )}
      {review.conflicts.length > 0 && (
        <p className="hint">{review.conflicts.length} token path(s) in this file differ from your current system's values.</p>
      )}
      {review.postMergeErrors.length > 0 && (
        <p className="inspector-error">Importing everything recognized would leave {review.postMergeErrors.length} validation error(s) — review before accepting.</p>
      )}

      <p>Choose which recognized groups to bring in:</p>
      <ul className="import-group-choices">
        {review.recognizedGroups.map((g) => (
          <li key={g}>
            <label>
              <input type="checkbox" checked={acceptedGroups.has(g)} onChange={() => onToggleGroup(g)} /> {g}
            </label>
          </li>
        ))}
      </ul>

      <div className="export-tabs">
        <button onClick={onCancel}>Cancel</button>
        <button className="primary" disabled={acceptedGroups.size === 0 || review.errors.length > 0} onClick={() => onAccept('selected')}>
          Import selected groups into current
        </button>
      </div>
      {review.errors.length > 0 && <p className="hint">Fix the validation errors above in the source file before this can be imported.</p>}
    </>
  );
}
