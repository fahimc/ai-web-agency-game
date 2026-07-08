import React from 'react';
import { Info, Menu, RotateCcw } from 'lucide-react';
import { canResumeProject } from '../utils/text.js';

export function Hud({ state, phaseLabel, actions }) {
  const showProgress = state.progress > 0 || ['running', 'approval', 'complete', 'error'].includes(state.phase);
  const canResume = canResumeProject(state);
  const canContinue = ['new_details', 'brief', 'packages', 'payment', 'assets', 'design_options', 'approval'].includes(state.phase) && !state.running;
  return (
    <header className="hud" aria-label="Office HUD">
      <div className="hud-row">
        <div className="brand">
          <div>
            <h1><span>MicroAgency</span> <em>AI</em></h1>
            <small>{state.email ? `Saved locally for ${state.email}` : 'Autonomous static-site studio'}</small>
          </div>
        </div>
        <div className="phase-pill" title="Current office state">
          <span className={`phase-dot ${state.running || state.phase === 'approval' ? 'live' : ''}`} />
          <span>{phaseLabel}</span>
        </div>
        <div className="hud-actions">
          <button className="secondary tiny keep-mobile info-button" type="button" onClick={actions.openAgencyInfo} title="About MicroAgency AI" aria-label="About MicroAgency AI">
            <Info size={16} /> <span>Info</span>
          </button>
          <button className="secondary tiny keep-mobile" type="button" onClick={actions.startFresh}>
            <RotateCcw size={16} /> Reset
          </button>
          {canResume && <button className="green tiny keep-mobile resume-button" type="button" onClick={actions.resumeWork}>Resume</button>}
          {canContinue && <button className="green tiny keep-mobile continue-button" type="button" onClick={actions.openCurrentStep}>Continue</button>}
          <button className="secondary tiny keep-mobile menu-button" type="button" onClick={() => actions.openMenu('status')}>
            <Menu size={16} /> Menu
          </button>
        </div>
      </div>
      <div className={`top-progress ${showProgress ? 'show' : ''}`}>
        <span>{Math.round(state.progress || 0)}%</span>
        <div className="meter"><span style={{ width: `${state.progress || 0}%` }} /></div>
        <span>{state.progressTask || 'Waiting'}</span>
      </div>
    </header>
  );
}
