import React, { useState } from 'react';
import { employees } from '../data/employees.js';
import { outputNames, outputOrder, outputOwners } from '../data/outputs.js';
import { MAX_REVISIONS } from '../utils/pricing.js';
import { Modal } from './Modal.jsx';

export function OutputsModal({ state, actions }) {
  const key = state.activeOutput || 'Plan';
  return (
    <Modal title="Output Workbench" onClose={actions.closeModal}>
      <nav className="modal-tabs">
        {outputOrder.map((outputKey) => (
          <button type="button" className={`modal-tab ${key === outputKey ? 'active' : ''}`} key={outputKey} onClick={() => actions.setActiveOutput(outputKey)}>
            <span>{outputNames[outputKey]}</span>
            <small className={`output-status ${state.outputs[outputKey] ? 'ready' : ''}`}>{state.outputs[outputKey] ? 'Ready' : 'Pending'}</small>
          </button>
        ))}
      </nav>
      <div className="modal-body">
        {key === 'WebsiteHTML' ? <Website state={state} actions={actions} /> : key === 'ProjectPDF' ? <ProjectPdf state={state} actions={actions} /> : <TextOutput outputKey={key} state={state} actions={actions} />}
      </div>
    </Modal>
  );
}

function TextOutput({ outputKey, state, actions }) {
  const owner = employees[outputOwners[outputKey]] || employees.reception;
  const value = state.outputs[outputKey] || '';
  return (
    <>
      <div className="downloadbar">
        <button type="button" onClick={actions.copyCurrentOutput}>Copy</button>
        <button type="button" className="secondary" onClick={actions.downloadCurrentOutput}>Download .md</button>
      </div>
      <div className="card">
        <h3>{owner.name} - {outputNames[outputKey]}</h3>
        {value ? <div className="output-box">{value}</div> : <div className="empty">{owner.name} has not produced this output yet.</div>}
      </div>
    </>
  );
}

function Website({ state, actions }) {
  const html = state.outputs.WebsiteHTML || '';
  const [showRevision, setShowRevision] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [revision, setRevision] = useState('');
  const revisionsRemaining = Math.max(0, MAX_REVISIONS - (state.revisionCount || 0));
  function submitRevision(event) {
    event.preventDefault();
    const text = revision.trim();
    if (!text) {
      actions.notify('Describe the revision first.');
      return;
    }
    actions.requestRevision(text);
    setRevision('');
    setShowRevision(false);
  }
  return (
    <div className="split-preview">
      <aside className="approval-card">
        <strong>Website preview</strong>
        <p className="muted">This is the real HTML output from Kai. Review it here, approve it, or request a revision.</p>
        <p className="small"><b>{revisionsRemaining}</b> of {MAX_REVISIONS} revisions remaining.</p>
        <div className="stack">
          <button type="button" className="green" disabled={!html} onClick={() => setFullScreen(true)}>View full screen</button>
          <button type="button" onClick={actions.copyCurrentOutput}>Copy HTML</button>
          <button type="button" className="secondary" onClick={actions.downloadCurrentOutput}>Download HTML</button>
          {state.phase === 'approval' && <button type="button" className="green" onClick={actions.approve}>Approve preview</button>}
          {state.phase === 'approval' && <button type="button" className="secondary" disabled={revisionsRemaining <= 0} onClick={() => setShowRevision((value) => !value)}>Request revision</button>}
        </div>
        {showRevision && (
          <form className="revision-form" onSubmit={submitRevision}>
            <label>Revision request
              <textarea value={revision} onChange={(event) => setRevision(event.target.value)} placeholder="Tell Mira what should change in the design, layout, copy, or sections..." />
            </label>
            <button type="submit">Send to designer</button>
          </form>
        )}
      </aside>
      <div className="card">{html ? <iframe className="preview-frame" sandbox="allow-same-origin allow-scripts" title="Generated website preview" srcDoc={html} /> : <div className="empty">Website preview is not ready yet.</div>}</div>
      {fullScreen && (
        <div className="site-fullscreen" role="dialog" aria-modal="true" aria-label="Full screen website preview">
          <div className="site-fullscreen-bar">
            <div>
              <b>Website preview</b>
              <span>Review the customer site at full size.</span>
            </div>
            <div className="stack">
              {state.phase === 'approval' && <button type="button" className="green" onClick={actions.approve}>Approve preview</button>}
              <button type="button" className="secondary" onClick={actions.downloadCurrentOutput}>Download HTML</button>
              <button type="button" className="secondary" onClick={() => setFullScreen(false)}>Close</button>
            </div>
          </div>
          <iframe className="site-fullscreen-frame" sandbox="allow-same-origin allow-scripts" title="Full screen generated website preview" srcDoc={html} />
        </div>
      )}
    </div>
  );
}

function ProjectPdf({ state, actions }) {
  const value = state.outputs.ProjectPDF || '';
  return (
    <>
      <div className="downloadbar">
        <button type="button" className="secondary" onClick={actions.downloadCurrentOutput} disabled={!value}>Download PDF</button>
      </div>
      <div className="card">
        <h3>Project handover pack</h3>
        {value ? <iframe className="preview-frame" title="Project PDF preview" src={value} /> : <div className="empty">The PDF will appear after preview approval and QA.</div>}
      </div>
    </>
  );
}
