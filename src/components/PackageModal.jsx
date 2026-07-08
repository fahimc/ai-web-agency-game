import React from 'react';
import { Modal } from './Modal.jsx';
import { PACKAGE_OPTIONS, modelOption } from '../utils/pricing.js';

export function PackageModal({ state, actions }) {
  return (
    <Modal title="Choose Website Package" onClose={actions.closeModal} className="package-modal">
      <div className="modal-tabs"><span className="modal-tab active">What the client pays for</span></div>
      <div className="modal-body package-body">
        <div className="package-intro">
          <h3>Here is what we offer</h3>
          <p className="muted">Each package starts from the brief you just gave Nova. Select a package to move to secure payment.</p>
        </div>
        <div className="package-grid">
          {PACKAGE_OPTIONS.map((item) => {
            const model = modelOption(item.modelId);
            const active = state.projectPackage === item.id;
            return (
              <article className={`package-card ${active ? 'active' : ''}`} key={item.id}>
                <div>
                  <div className="package-card-head">
                    <h3>{item.name}</h3>
                    <strong>£{item.priceGbp}</strong>
                  </div>
                  <p className="muted">{item.summary}</p>
                  <p className="small muted">Generation model: {model.label}</p>
                </div>
                <div>
                  <h4>Agency steps</h4>
                  <ol>
                    {item.steps.map((step) => <li key={step}>{step}</li>)}
                  </ol>
                </div>
                <div>
                  <h4>Customer receives</h4>
                  <ul>
                    {item.produces.map((output) => <li key={output}>{output}</li>)}
                  </ul>
                </div>
                <button type="button" className="green package-select" onClick={() => actions.selectPackage(item.id)}>
                  Select {item.name}
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
