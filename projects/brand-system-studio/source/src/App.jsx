import { useState, useEffect } from 'react';
import { useProjectStore } from './state/store.js';
import Preview from './components/Preview.jsx';
import Inspector from './components/Inspector.jsx';
import { ColorPanel, TypePanel, LayoutPanel, ComponentPanel } from './components/StudioPanels.jsx';
import GuidedPanel from './components/GuidedPanel.jsx';
import CharacterPanel from './components/CharacterPanel.jsx';
import ExportDialog from './components/ExportDialog.jsx';
import ImportDialog from './components/ImportDialog.jsx';

const CONTEXTS = ['Landing', 'Product', 'Specimen', 'Identity', 'Components'];
const SECTIONS = ['All', 'Color', 'Type', 'Shape', 'Components'];

export function App() {
  const { project, canUndo, canRedo, migrated, loadError, actions } = useProjectStore();
  const [notice, setNotice] = useState('');
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [selectedPath, setSelectedPath] = useState(null);
  const [snapshotName, setSnapshotName] = useState('');

  const { ui, activeTheme, systems, locks, snapshots } = project;
  const currentSystem = systems.current.system;
  const baselineSystem = systems.baseline.system;
  const changed = JSON.stringify(currentSystem) !== JSON.stringify(baselineSystem);

  useEffect(() => {
    if (migrated) setNotice('Your saved project was migrated from an earlier version — nothing was lost.');
    else if (loadError && loadError !== 'empty') setNotice(`Could not load a saved project (${loadError}); starting fresh.`);
  }, [migrated, loadError]);

  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(''), 4500);
    return () => clearTimeout(id);
  }, [notice]);

  // Global undo/redo keyboard shortcuts (not inside a text field).
  useEffect(() => {
    function onKeyDown(e) {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); actions.undo(); }
      else if (mod && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) { e.preventDefault(); actions.redo(); }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [actions]);

  const panelProps = { sysKey: 'current', system: currentSystem, theme: activeTheme, actions, locks };

  return (
    <div className="studio">
      <header className="app-header">
        <div className="app-title">Brand System Studio</div>
        <span className="tagline">Same system. More control.</span>

        <div className="mode-switch" aria-label="Editing mode">
          {['Guided', 'Studio'].map((m) => (
            <button key={m} aria-pressed={ui.mode === m} className={ui.mode === m ? 'active' : ''} onClick={() => actions.setUi({ mode: m })}>{m}</button>
          ))}
        </div>

        <div className="theme-switch" aria-label="Preview theme">
          {['light', 'dark'].map((t) => (
            <button key={t} aria-pressed={activeTheme === t} className={activeTheme === t ? 'active' : ''} onClick={() => actions.setTheme(t)}>{t}</button>
          ))}
        </div>

        <div className="history-buttons">
          <button disabled={!canUndo} onClick={actions.undo} title="Undo (Ctrl/Cmd+Z)">Undo</button>
          <button disabled={!canRedo} onClick={actions.redo} title="Redo (Ctrl/Cmd+Shift+Z)">Redo</button>
        </div>

        <button onClick={() => setShowImport(true)}>Import</button>
        <button className="export-button" onClick={() => setShowExport(true)}>Export</button>
      </header>

      <div className="workspace">
        <aside className="inspector">
          <nav className="inspector-tabs">
            {SECTIONS.map((s) => <button key={s} onClick={() => actions.setUi({ section: s })} className={ui.section === s ? 'selected' : ''} aria-pressed={ui.section === s}>{s}</button>)}
          </nav>

          {ui.mode === 'Guided' ? (
            <GuidedPanel system={currentSystem} locks={locks} onApply={actions.applyTokenDiff} />
          ) : (
            <>
              {(ui.section === 'All' || ui.section === 'Color') && <ColorPanel {...panelProps} />}
              {(ui.section === 'All' || ui.section === 'Type') && <TypePanel {...panelProps} />}
              {(ui.section === 'All' || ui.section === 'Shape') && <LayoutPanel {...panelProps} />}
              {(ui.section === 'All' || ui.section === 'Components') && <ComponentPanel {...panelProps} />}
            </>
          )}

          <section className="project-tools">
            <span>{loadError === 'storage-unavailable' ? 'Local save unavailable. Export to keep your work.' : 'Saved locally'}</span>
            <div className="snapshot-tools">
              <input placeholder="Snapshot name" value={snapshotName} onChange={(e) => setSnapshotName(e.target.value)} />
              <button disabled={!snapshotName.trim()} onClick={() => { actions.createSnapshot(snapshotName.trim()); setSnapshotName(''); setNotice('Snapshot saved.'); }}>Save snapshot</button>
            </div>
            {snapshots.length > 0 && (
              <ul className="snapshot-list">
                {snapshots.map((s) => (
                  <li key={s.id}>
                    <button onClick={() => { actions.restoreSnapshot(s.id); setNotice(`Restored "${s.name}".`); }}>{s.name}</button>
                    <button className="icon-button" onClick={() => actions.deleteSnapshot(s.id)} aria-label={`Delete snapshot ${s.name}`}>&times;</button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>

        <main>
          <div className="canvas-toolbar">
            <nav aria-label="Preview context">
              {CONTEXTS.map((c) => <button key={c} className={ui.context === c ? 'selected' : ''} aria-pressed={ui.context === c} onClick={() => actions.setUi({ context: c })}>{c}</button>)}
            </nav>
            <div className="toolbar-right">
              <div className="interaction-switch" aria-label="Interaction mode">
                {['select', 'interact'].map((m) => (
                  <button key={m} aria-pressed={ui.interactionMode === m} className={ui.interactionMode === m ? 'active' : ''} onClick={() => actions.setUi({ interactionMode: m })}>
                    {m === 'select' ? 'Select' : 'Interact'}
                  </button>
                ))}
              </div>
              <div className="view-toggle">
                {['Single', 'Compare'].map((x) => (
                  <button key={x} aria-pressed={ui.compare === (x === 'Compare')} className={ui.compare === (x === 'Compare') ? 'active' : ''} onClick={() => actions.setUi({ compare: x === 'Compare' })}>{x}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="mobile-comparison">
            {['Saved', 'Current'].map((x) => (
              <button key={x} className={ui.mobileVersion === x ? 'active' : ''} onClick={() => actions.setUi({ mobileVersion: x })}>{x}</button>
            ))}
          </div>

          <div className={`preview-grid ${!ui.compare ? 'single' : ''} mobile-${ui.mobileVersion.toLowerCase()}`}>
            {ui.compare && (
              <div className="saved-preview">
                <Preview
                  system={baselineSystem} theme={activeTheme} context={ui.context} label="Saved direction" scopeId="baseline"
                  selectable={ui.interactionMode === 'select'} selectedPath={selectedPath} onSelect={setSelectedPath}
                />
              </div>
            )}
            <div className="current-preview">
              <Preview
                system={currentSystem} theme={activeTheme} context={ui.context} label="Current exploration" scopeId="current"
                selectable={ui.interactionMode === 'select'} selectedPath={selectedPath} onSelect={setSelectedPath}
              />
            </div>
          </div>

          {ui.interactionMode === 'select' && (
            <Inspector system={currentSystem} theme={activeTheme} path={selectedPath} onFollow={setSelectedPath} onClose={() => setSelectedPath(null)} />
          )}

          <div className="comparison-actions">
            <button className="primary" disabled={!changed} onClick={() => { actions.keep(); setNotice('Direction kept. Your comparison baseline is updated.'); }}>Keep this direction</button>
            <button disabled={!changed} onClick={() => { actions.revert(); setNotice('Restored your saved direction.'); }}>Revert</button>
            <small>{changed ? 'Exploring changes' : 'Matches saved direction'}</small>
          </div>

          <CharacterPanel currentSystem={currentSystem} baselineSystem={baselineSystem} />

          <footer className="app-footer">
            <a href="https://work.akintilo.com" className="lab-link">THE LAB</a>
            <span>Brand System Studio / working prototype</span>
          </footer>
        </main>
      </div>

      {notice && <div className="toast" role="status">{notice}</div>}

      {showExport && <ExportDialog project={project} activeTheme={activeTheme} onClose={() => setShowExport(false)} onNotice={setNotice} />}
      {showImport && (
        <ImportDialog
          project={project}
          activeTheme={activeTheme}
          onClose={() => setShowImport(false)}
          onImportProject={actions.importReplace}
          onImportTokens={actions.importSystem}
          onNotice={setNotice}
        />
      )}
    </div>
  );
}
