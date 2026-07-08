import React, { useMemo } from 'react';
import { employeeList, employees } from '../data/employees.js';
import { outputOrder } from '../data/outputs.js';
import { listProjects } from '../services/storage.js';
import { canResumeProject } from '../utils/text.js';
import { Modal } from './Modal.jsx';

const tabs = [
  ['status', 'Status'],
  ['projects', 'Projects'],
  ['convos', 'Convos'],
  ['help', 'Help'],
];

export function MenuModal({ state, actions, menuTab, phaseLabel }) {
  return (
    <Modal title="Office Menu" onClose={actions.closeModal}>
      <nav className="modal-tabs">
        {tabs.map(([id, label]) => <button type="button" className={`modal-tab ${menuTab === id ? 'active' : ''}`} key={id} onClick={() => actions.setMenuTab(id)}>{label}</button>)}
      </nav>
      <div className="modal-body">
        {menuTab === 'status' && <Status state={state} actions={actions} phaseLabel={phaseLabel} />}
        {menuTab === 'projects' && <Projects state={state} actions={actions} />}
        {menuTab === 'convos' && <Timeline empty="No conversation yet." items={state.convos.slice().reverse()} />}
        {menuTab === 'help' && <Help />}
      </div>
    </Modal>
  );
}

function Projects({ state, actions }) {
  const projects = useMemo(() => listProjects(state.email), [state.email, state.lastSaved, state.projectId, state.availableProjects]);
  if (!state.email) return <div className="empty">Enter an email first, then saved projects for that customer will appear here.</div>;
  return (
    <div className="modal-grid">
      <div className="card">
        <h3>Saved projects</h3>
        <p className="muted">Resume incomplete projects or open completed ones without starting over.</p>
        <div className="stack">
          <button type="button" onClick={() => actions.startNewProjectForEmail(state.email)}>Start new project</button>
        </div>
      </div>
      <div className="card">
        <h3>Current customer</h3>
        <p><b>Email:</b> {state.email}</p>
        <p><b>Active project:</b> {state.projectName || 'Not selected'}</p>
      </div>
      <div className="project-list">
        {!projects.length && <div className="empty">No saved projects for this email yet.</div>}
        {projects.map((project) => {
          const isCurrent = project.projectId === state.projectId;
          const incomplete = !project.complete;
          return (
            <div className="project-item" key={project.projectId}>
              <div>
                <b>{project.projectName}</b>
                <span className="muted small">
                  {project.complete ? 'Complete' : `${Math.round(project.progress || 0)}% complete`} {project.lastSaved ? `- saved ${project.lastSaved}` : ''}
                </span>
              </div>
              <div className="stack project-actions">
                {isCurrent && <span className="project-pill">Current</span>}
                <button type="button" className={incomplete ? 'green' : 'secondary'} onClick={() => actions.loadProject(state.email, project.projectId)}>
                  {incomplete ? 'Resume' : 'Open'}
                </button>
                <button type="button" className="secondary" onClick={() => actions.exportSavedProject(state.email, project.projectId)}>Export</button>
                <button type="button" className="red" onClick={() => actions.deleteSavedProject(state.email, project.projectId)}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Status({ state, actions, phaseLabel }) {
  const complete = outputOrder.filter((key) => state.outputs[key]).length;
  const activeEmployee = employees[state.activeEmployee] || employees.reception;
  const canResume = canResumeProject(state);
  const canContinue = ['new_details', 'brief', 'packages', 'payment', 'design_options', 'approval'].includes(state.phase) && !state.running;
  return (
    <div className="modal-grid">
      <div className="card">
        <h3>Current run</h3>
        <p><b>Phase:</b> {phaseLabel}</p>
        <p><b>Progress:</b> {Math.round(state.progress)}%</p>
        <p><b>Current stage:</b> {activeEmployee.role}</p>
        <p><b>Outputs ready:</b> {complete}/{outputOrder.length}</p>
        <p className="muted small">Open detailed outputs from the outputs pill at the bottom of the office screen.</p>
        <div className="stack">
          {canContinue && <button type="button" className="green" onClick={actions.openCurrentStep}>Continue current step</button>}
          {canResume && <button type="button" className="green" onClick={actions.resumeWork}>Resume work</button>}
          <button type="button" className="secondary" onClick={() => actions.notify('Saved locally.')}>Save now</button>
        </div>
      </div>
      <div className="card">
        <h3>Office rules</h3>
        <p className="muted">Chat opens only when the agency needs a reply. After the project form is sent, the team works until website preview approval.</p>
      </div>
      <div className="card">
        <h3>Team</h3>
        {employeeList.map((employee) => <p key={employee.id}><b>{employee.name}</b><br /><span className="muted">{employee.role}</span></p>)}
      </div>
      <div className="card">
        <h3>Session</h3>
        <p><b>Email:</b> {state.email || 'Not set'}</p>
        <p><b>Last saved:</b> {state.lastSaved || 'Not saved yet'}</p>
        <div className="stack">
          <button type="button" className="red" onClick={() => actions.resetToChoice(true)}>New office run</button>
        </div>
      </div>
    </div>
  );
}

function Timeline({ items, empty }) {
  if (!items.length) return <div className="empty">{empty}</div>;
  return <div className="log-list">{items.map((item, index) => <div className="log-item" key={`${item.time}-${index}`}><b>{item.who} <span className="muted small">{item.time}</span></b>{item.text}</div>)}</div>;
}

function Help() {
  return (
    <div className="modal-grid">
      <div className="card"><h3>Flow</h3><p>Enter your name, save your email, complete the project form, then review the website preview.</p></div>
      <div className="card"><h3>Real outputs</h3><p>The agency creates strategy, design direction, website HTML, QA notes, and a project handover PDF.</p></div>
    </div>
  );
}
