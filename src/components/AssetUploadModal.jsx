import React, { useState } from 'react';
import { formatFileSize, readReviewFile, UPLOAD_LIMITS, validateReviewFiles } from '../utils/reviewAssets.js';
import { Modal } from './Modal.jsx';

export function AssetUploadModal({ state, actions }) {
  const [busy, setBusy] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  async function handleFiles(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;
    const validation = validateReviewFiles(files);
    if (!validation.ok) {
      setUploadMessage(validation.errors.join(' '));
      actions.notify('Upload limits exceeded.');
      return;
    }
    setBusy(true);
    setUploadMessage('');
    try {
      const assets = [];
      for (const file of files) {
        assets.push(await readReviewFile(file));
      }
      actions.addReviewAssets(assets);
      setUploadMessage(`${assets.length} file${assets.length === 1 ? '' : 's'} added.`);
    } catch (error) {
      const message = `File upload failed: ${error?.message || error}`;
      setUploadMessage(message);
      actions.notify(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="Project Files" onClose={actions.closeModal} className="details-modal">
      <div className="modal-body">
        <div className="card form-intro">
          <h3>Optional files for the team</h3>
          <p className="muted">Rin can pass images and documents to the designer and developer. Add anything useful now, or skip this step.</p>
        </div>
        <div className="review-tools">
          <div className="upload-rules">
            <b>Upload limits</b>
            <p className="small muted">
              Up to {UPLOAD_LIMITS.maxFiles} files per upload, {formatFileSize(UPLOAD_LIMITS.maxBatchBytes)} total.
              Images under {formatFileSize(UPLOAD_LIMITS.maxEmbeddableImageBytes)} can be embedded.
              Images up to {formatFileSize(UPLOAD_LIMITS.maxReferenceImageBytes)} are used as reference only.
              PDFs/docs up to {formatFileSize(UPLOAD_LIMITS.maxDocumentBytes)} are used as context only.
            </p>
          </div>
          <label className="upload-drop">{busy ? 'Reading files...' : 'Upload images/docs'}
            <input type="file" multiple accept="image/*,.txt,.md,.csv,.json,.pdf,.docx,.doc" onChange={handleFiles} disabled={busy} />
          </label>
          {uploadMessage && <p className={`small ${/failed|too large|must|up to|exceeded/i.test(uploadMessage) ? 'danger-text' : 'muted'}`}>{uploadMessage}</p>}
          {state.reviewAssets?.length > 0 ? (
            <div className="asset-list">
              {state.reviewAssets.map((asset) => (
                <div className="asset-item" key={asset.id}>
                  {String(asset.type || '').startsWith('image/') && asset.dataUrl ? <img src={asset.dataUrl} alt="" /> : <span className="asset-doc">{String(asset.type || '').startsWith('image/') ? 'IMG' : 'DOC'}</span>}
                  <div><b>{asset.name}</b><small>{asset.type || 'file'} - {Math.round((asset.size || 0) / 1024)} KB</small></div>
                  <button type="button" className="secondary" onClick={() => actions.removeReviewAsset(asset.id)}>Remove</button>
                </div>
              ))}
            </div>
          ) : (
            <p className="small muted">No files uploaded. This is optional.</p>
          )}
          <div className="stack form-actions">
            <button type="button" className="green" onClick={actions.skipAssetUpload}>Continue to design options</button>
            <button type="button" className="secondary" onClick={actions.skipAssetUpload}>Skip files</button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
