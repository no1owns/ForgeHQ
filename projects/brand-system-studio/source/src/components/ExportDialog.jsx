import { useState } from 'react';
import { exportThemeTokens } from '../export/dtcgExport.js';
import { buildThemedCSS } from '../export/cssExport.js';
import { buildAgentZip } from '../export/agentPackage.js';

function download(name, content, type) {
  const blob = content instanceof Uint8Array ? new Blob([content], { type }) : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const TABS = ['DTCG tokens', 'CSS variables', 'Project JSON', 'Agent package'];

export default function ExportDialog({ project, activeTheme, onClose, onNotice }) {
  const [tab, setTab] = useState('DTCG tokens');
  const [theme, setTheme] = useState(activeTheme);
  const system = project.systems.current.system;

  function handleKeyDown(e) {
    if (e.key !== 'Tab') return;
    const nodes = [...e.currentTarget.querySelectorAll('button, select')];
    const first = nodes[0], last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  const tokensPreview = tab === 'DTCG tokens' ? JSON.stringify(exportThemeTokens(system, theme), null, 2) : null;
  const cssPreview = tab === 'CSS variables' ? buildThemedCSS(system) : null;
  const projectPreview = tab === 'Project JSON' ? JSON.stringify(project, null, 2) : null;

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <section onKeyDown={handleKeyDown} className="export-dialog" role="dialog" aria-modal="true" aria-label="Export your system">
        <div className="dialog-title">
          <h2>Take your system with you.</h2>
          <button autoFocus onClick={onClose}>Close</button>
        </div>
        <p>DTCG tokens, generated CSS, the full project state, or a documented package for an AI agent to consume.</p>
        <div className="export-tabs">
          {TABS.map((t) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>)}
        </div>

        {tab === 'DTCG tokens' && (
          <>
            <label className="pairing">
              Theme
              <select value={theme} onChange={(e) => setTheme(e.target.value)}>
                {Object.keys(system.semanticByTheme).map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <pre>{tokensPreview}</pre>
            <button className="primary" onClick={() => { download(`tokens.${theme}.json`, tokensPreview, 'application/json'); onNotice('DTCG tokens downloaded.'); }}>Download tokens.{theme}.json</button>
          </>
        )}

        {tab === 'CSS variables' && (
          <>
            <pre>{cssPreview}</pre>
            <button className="primary" onClick={() => { download('tokens.css', cssPreview, 'text/css'); onNotice('CSS downloaded.'); }}>Download tokens.css</button>
          </>
        )}

        {tab === 'Project JSON' && (
          <>
            <p className="hint">Includes both comparison systems, both themes each, snapshots, locks, and UI state — everything needed to restore this project exactly.</p>
            <pre>{projectPreview}</pre>
            <button className="primary" onClick={() => { download('brand-studio-project.json', projectPreview, 'application/json'); onNotice('Project JSON downloaded.'); }}>Download project JSON</button>
          </>
        )}

        {tab === 'Agent package' && (
          <>
            <p className="hint">
              A ZIP with tokens.json (default theme), a tokens.&lt;theme&gt;.json per additional theme, tokens.css, a generated DESIGN.md,
              manifest.json, and a README — all generated live from the current system, so they can't drift apart.
              <br /><br />
              <strong>Compatibility note:</strong> this is a DTCG export; compatibility with Figma, Tokens Studio, or any other specific tool has
              not been tested in this session and is not claimed. See the project README for what has and hasn't been verified.
            </p>
            <button
              className="primary"
              onClick={() => {
                const { bytes } = buildAgentZip(system, { name: 'brand-system', defaultTheme: theme });
                download('brand-system-agent-package.zip', bytes, 'application/zip');
                onNotice('Agent package downloaded.');
              }}
            >
              Download agent-package.zip
            </button>
          </>
        )}
      </section>
    </div>
  );
}
