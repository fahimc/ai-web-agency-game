import React from 'react';
import { employees } from '../data/employees.js';
import { outputNames, outputOrder, outputOwners } from '../data/outputs.js';
import { Modal } from './Modal.jsx';

export function OutputsModal({ state, actions }) {
  const key = state.activeOutput || 'Plan';
  return (
    <Modal title="Output Workbench" onClose={actions.closeModal}>
      <nav className="modal-tabs">
        {outputOrder.map((outputKey) => (
          <button type="button" className={`modal-tab ${key === outputKey ? 'active' : ''}`} key={outputKey} onClick={() => actions.setActiveOutput(outputKey)}>
            {state.outputs[outputKey] ? 'OK ' : ''}{outputNames[outputKey]}
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
  return (
    <div className="split-preview">
      <aside className="approval-card">
        <strong>Website preview</strong>
        <p className="muted">This is the real HTML output from Kai. Review it here, then approve or request changes when chat is open.</p>
        <div className="stack">
          <button type="button" onClick={actions.copyCurrentOutput}>Copy HTML</button>
          <button type="button" className="secondary" onClick={actions.downloadCurrentOutput}>Download HTML</button>
          {state.phase === 'approval' && <button type="button" className="green" onClick={actions.approve}>Approve preview</button>}
        </div>
        {state.phase === 'approval' && <p className="small">Need changes? Close Outputs and type the change request in the chat box.</p>}
      </aside>
      <div className="card">{html ? <iframe className="preview-frame" sandbox="allow-same-origin" title="Generated website preview" srcDoc={html} /> : <div className="empty">Website preview is not ready yet.</div>}</div>
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
        <h3>Project details and invoice</h3>
        {value ? <iframe className="preview-frame" title="Project PDF preview" src={value} /> : <div className="empty">The PDF will appear after preview approval and QA.</div>}
      </div>
    </>
  );
}
