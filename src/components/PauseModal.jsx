import React from 'react';
import { friendlyPauseText } from '../utils/text.js';

export function PauseModal({ state, actions }) {
  return (
    <div className="overlay show" aria-hidden="false">
      <section className="pause-card" role="dialog" aria-modal="true" aria-label="Agency paused">
        <h2>Agency paused</h2>
        <p>{friendlyPauseText(state.error)}</p>
        <div className="stack">
          <button type="button" onClick={() => actions.openMenu('settings')}>Open settings</button>
          <button type="button" className="green" onClick={actions.resumeWork}>Resume work</button>
          <button type="button" className="secondary" onClick={actions.closeModal}>Not now</button>
        </div>
      </section>
    </div>
  );
}
