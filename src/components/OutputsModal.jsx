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
  const [showHtmlEditor, setShowHtmlEditor] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [revision, setRevision] = useState('');
  const [pageDraft, setPageDraft] = useState('');
  const [contentFields, setContentFields] = useState([]);
  const html = sitePackage ? (sitePackage.files[currentFile] || sitePackage.files[sitePackage.entry] || '') : output;
  const revisionsRemaining = Math.max(0, MAX_REVISIONS - (state.revisionCount || 0));
  useEffect(() => {
    setCurrentFile(sitePackage?.entry || 'index.html');
  }, [sitePackage?.entry, output]);
  useEffect(() => {
    setPageDraft(html);
    setContentFields(extractEditableContent(html));
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
  function updateContentField(id, value) {
    setContentFields((fields) => fields.map((field) => field.id === id ? { ...field, value } : field));
  }
  function saveContentFields() {
    const updatedHtml = applyEditableContent(html, contentFields);
    actions.updateWebsitePageHtml(currentFile, updatedHtml);
    setPageDraft(updatedHtml);
    setContentFields(extractEditableContent(updatedHtml));
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
              <p className="small muted">Update the page copy before approving or downloading the finished site.</p>
            </div>
            {contentFields.length > 0 ? (
              <div className="content-field-editor">
                {contentFields.map((field) => (
                  <label key={field.id}>
                    <span>{field.label}</span>
                    {field.multiline ? (
                      <textarea value={field.value} rows={field.rows || 3} onChange={(event) => updateContentField(field.id, event.target.value)} />
                    ) : (
                      <input value={field.value} onChange={(event) => updateContentField(field.id, event.target.value)} />
                    )}
                  </label>
                ))}
                <button type="button" onClick={saveContentFields}>Save content changes</button>
              </div>
            ) : (
              <div className="empty">No editable text was found on this page.</div>
            )}
            <div className="stack">
              <button type="button" className="secondary" onClick={() => setShowHtmlEditor((value) => !value)}>{showHtmlEditor ? 'Hide advanced HTML' : 'Advanced HTML editor'}</button>
            </div>
            {showHtmlEditor && (
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

const editableTextSelector = [
  'main h1',
  'main h2',
  'main h3',
  'main h4',
  'main p',
  'main li',
  'main a.button',
  'main a.btn',
  'main button',
  'main .tag',
].join(',');

function extractEditableContent(html) {
  const doc = parseHtmlDocument(html);
  if (!doc) return [];
  const textFields = editableTextElements(doc).map((element, index) => {
    const value = normalizedFieldText(element.textContent || '');
    return {
      id: `text-${index}`,
      kind: 'text',
      index,
      label: labelForElement(element, index),
      value,
      multiline: value.length > 70 || ['P', 'LI'].includes(element.tagName),
      rows: value.length > 180 ? 5 : 3,
    };
  }).filter((field) => field.value && !isUtilityText(field.value));
  const imageFields = Array.from(doc.querySelectorAll('main img[alt]')).slice(0, 12).map((element, index) => ({
    id: `image-alt-${index}`,
    kind: 'image-alt',
    index,
    label: `Image ${index + 1} alt text`,
    value: element.getAttribute('alt') || '',
    multiline: false,
  }));
  return [...textFields.slice(0, 40), ...imageFields];
}

function applyEditableContent(html, fields) {
  const doc = parseHtmlDocument(html);
  if (!doc) return html;
  const textElements = editableTextElements(doc);
  const imageElements = Array.from(doc.querySelectorAll('main img[alt]'));
  fields.forEach((field) => {
    const value = String(field.value || '').trim();
    if (field.kind === 'text' && textElements[field.index]) {
      textElements[field.index].textContent = value;
    }
    if (field.kind === 'image-alt' && imageElements[field.index]) {
      imageElements[field.index].setAttribute('alt', value);
    }
  });
  return `<!doctype html>\n${doc.documentElement.outerHTML}`;
}

function parseHtmlDocument(html) {
  if (typeof DOMParser === 'undefined') return null;
  const value = String(html || '').trim();
  if (!value) return null;
  try {
    return new DOMParser().parseFromString(value, 'text/html');
  } catch {
    return null;
  }
}

function editableTextElements(doc) {
  const seen = new Set();
  return Array.from(doc.querySelectorAll(editableTextSelector))
    .filter((element) => {
      if (!element || seen.has(element)) return false;
      seen.add(element);
      if (element.closest('nav, script, style, noscript, svg')) return false;
      const text = normalizedFieldText(element.textContent || '');
      return text && !isUtilityText(text);
    });
}

function labelForElement(element, index) {
  const tag = element.tagName.toLowerCase();
  if (/^h[1-6]$/.test(tag)) return `${tag.toUpperCase()} heading`;
  if (tag === 'p') return `Paragraph ${index + 1}`;
  if (tag === 'li') return `List item ${index + 1}`;
  if (tag === 'a' || tag === 'button') return `Button/link ${index + 1}`;
  return `Text ${index + 1}`;
}

function normalizedFieldText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function isUtilityText(value) {
  return /^(home|about|services?|contact|faq|pricing|gallery|menu|events?|close|open menu|send enquiry)$/i.test(String(value || '').trim());
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
