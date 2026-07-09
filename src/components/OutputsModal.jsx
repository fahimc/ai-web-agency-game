import React, { useEffect, useMemo, useState } from 'react';
import { employees } from '../data/employees.js';
import { outputNames, outputOrder, outputOwners } from '../data/outputs.js';
import { MAX_REVISIONS } from '../utils/pricing.js';
import { normalizeFileName, parseSitePackage } from '../utils/sitePackage.js';
import { Modal } from './Modal.jsx';

export function OutputsModal({ state, actions, previewOnly = false }) {
  const key = state.activeOutput || 'Plan';
  if (previewOnly) {
    return (
      <Modal title="Website Preview" onClose={actions.closeModal} className="website-preview-modal">
        <div className="modal-body">
          <Website state={state} actions={actions} previewOnly />
        </div>
      </Modal>
    );
  }
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

function Website({ state, actions, previewOnly = false }) {
  const output = state.outputs.WebsiteHTML || '';
  const sitePackage = useMemo(() => parseSitePackage(output), [output]);
  const [currentFile, setCurrentFile] = useState(sitePackage?.entry || 'index.html');
  const [showRevision, setShowRevision] = useState(false);
  const [showReviewTools, setShowReviewTools] = useState(false);
  const [showPageEditor, setShowPageEditor] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [revision, setRevision] = useState('');
  const [pageDraft, setPageDraft] = useState('');
  const html = sitePackage ? (sitePackage.files[currentFile] || sitePackage.files[sitePackage.entry] || '') : output;
  const revisionsRemaining = Math.max(0, MAX_REVISIONS - (state.revisionCount || 0));
  useEffect(() => {
    setCurrentFile(sitePackage?.entry || 'index.html');
  }, [sitePackage?.entry, output]);
  useEffect(() => {
    setPageDraft(html);
  }, [html, currentFile]);
  function handleFrameLoad(event) {
    if (!sitePackage) return;
    const doc = event.currentTarget.contentDocument;
    if (!doc) return;
    doc.addEventListener('click', (clickEvent) => {
      const link = clickEvent.target?.closest?.('a[href]');
      if (!link) return;
      const rawHref = link.getAttribute('href') || '';
      const fileName = normalizeFileName(rawHref.split('#')[0]);
      if (!fileName || !sitePackage.files[fileName]) return;
      clickEvent.preventDefault();
      setCurrentFile(fileName);
      setFullScreen((value) => value);
    });
  }
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
  function savePageDraft() {
    actions.updateWebsitePageHtml(currentFile, pageDraft);
    setShowPageEditor(false);
  }
  const imageAssets = (state.reviewAssets || []).filter((asset) => String(asset.type || '').startsWith('image/') && asset.dataUrl);
  return (
    <div className={`split-preview ${previewOnly ? 'preview-only' : ''}`}>
      <aside className="approval-card">
        <strong>Website preview</strong>
        <p className="muted">Review the customer site, approve it, or request a revision.</p>
        {sitePackage && <p className="small"><b>{currentFile}</b> from {Object.keys(sitePackage.files).length} HTML files.</p>}
        <p className="small"><b>{revisionsRemaining}</b> of {MAX_REVISIONS} revisions remaining.</p>
        <div className="stack">
          <button type="button" className="green" disabled={!html} onClick={() => setFullScreen(true)}>View full screen</button>
          {!previewOnly && <button type="button" onClick={actions.copyCurrentOutput}>{sitePackage ? 'Copy package' : 'Copy HTML'}</button>}
          {!previewOnly && <button type="button" className="secondary" onClick={actions.downloadCurrentOutput}>{sitePackage ? 'Download site .zip' : 'Download HTML'}</button>}
          {state.phase === 'approval' && <button type="button" className="secondary" onClick={() => setShowReviewTools((value) => !value)}>Edit content/images</button>}
          {state.phase === 'approval' && <button type="button" className="green" onClick={actions.approve}>Approve preview</button>}
          {state.phase === 'approval' && <button type="button" className="secondary" disabled={revisionsRemaining <= 0} onClick={() => setShowRevision((value) => !value)}>Request revision</button>}
        </div>
        {sitePackage && (
          <div className="site-file-list">
            {Object.keys(sitePackage.files).map((fileName) => (
              <button type="button" className={fileName === currentFile ? 'active' : ''} key={fileName} onClick={() => setCurrentFile(fileName)}>
                {fileName}
              </button>
            ))}
          </div>
        )}
        {showReviewTools && (
          <div className="review-tools">
            <div>
              <b>Content and assets</b>
              <p className="small muted">Edit this page directly before sending a revision request.</p>
            </div>
            <div className="stack">
              <button type="button" className="secondary" onClick={() => setShowPageEditor((value) => !value)}>{showPageEditor ? 'Hide HTML editor' : 'Edit current page HTML'}</button>
            </div>
            {showPageEditor && (
              <div className="page-html-editor">
                <textarea value={pageDraft} onChange={(event) => setPageDraft(event.target.value)} aria-label="Current page HTML" />
                <button type="button" onClick={savePageDraft}>Save page HTML</button>
              </div>
            )}
            {state.reviewAssets?.length > 0 && (
              <div className="asset-list">
                {state.reviewAssets.map((asset) => (
                  <div className="asset-item" key={asset.id}>
                    {String(asset.type || '').startsWith('image/') && asset.dataUrl ? <img src={asset.dataUrl} alt="" /> : <span className="asset-doc">{String(asset.type || '').startsWith('image/') ? 'IMG' : 'DOC'}</span>}
                    <div><b>{asset.name}</b><small>{asset.type || 'file'} - {Math.round((asset.size || 0) / 1024)} KB</small></div>
                    {String(asset.type || '').startsWith('image/') && <button type="button" className="secondary" onClick={() => actions.replaceWebsiteImage(asset.id, currentFile, 'page')}>Use here</button>}
                    {String(asset.type || '').startsWith('image/') && <button type="button" className="secondary" onClick={() => actions.replaceWebsiteImage(asset.id, currentFile, 'site')}>Use all</button>}
                    <button type="button" className="secondary" onClick={() => actions.removeReviewAsset(asset.id)}>Remove</button>
                  </div>
                ))}
              </div>
            )}
            {imageAssets.length > 0 && <p className="small muted">Saved project images can be applied immediately.</p>}
          </div>
        )}
        {showRevision && (
          <form className="revision-form" onSubmit={submitRevision}>
            <button type="button" className="secondary" onClick={actions.openDetails}>Edit content fields</button>
            <label>Revision request
              <textarea value={revision} onChange={(event) => setRevision(event.target.value)} placeholder="Tell Mira what should change in the content, images, design, layout, or sections." />
            </label>
            <button type="submit">Send to designer</button>
          </form>
        )}
      </aside>
      <div className="card">{html ? <iframe className="preview-frame" sandbox="allow-same-origin allow-scripts" title="Generated website preview" srcDoc={html} onLoad={handleFrameLoad} /> : <div className="empty">Website preview is not ready yet.</div>}</div>
      {fullScreen && (
        <div className="site-fullscreen" role="dialog" aria-modal="true" aria-label="Full screen website preview">
          <div className="site-fullscreen-bar">
            <div>
              <b>Website preview</b>
              <span>Review the customer site at full size.</span>
            </div>
            <div className="stack">
              {state.phase === 'approval' && <button type="button" className="green" onClick={actions.approve}>Approve preview</button>}
              <button type="button" className="secondary" onClick={actions.downloadCurrentOutput}>{sitePackage ? 'Download site .zip' : 'Download HTML'}</button>
              <button type="button" className="secondary" onClick={() => setFullScreen(false)}>Close</button>
            </div>
          </div>
          <iframe className="site-fullscreen-frame" sandbox="allow-same-origin allow-scripts" title="Full screen generated website preview" srcDoc={html} onLoad={handleFrameLoad} />
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
