import React, { useMemo, useState } from 'react';
import { employeeList, employees } from '../data/employees.js';
import { outputOrder } from '../data/outputs.js';
import { listProjects } from '../services/storage.js';
import { Modal } from './Modal.jsx';

const tabs = [
  ['status', 'Status'],
  ['projects', 'Projects'],
  ['client', 'Client'],
  ['quests', 'Task Log'],
  ['convos', 'Convos'],
  ['activity', 'Activity'],
  ['settings', 'Settings'],
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
        {menuTab === 'client' && <Client state={state} actions={actions} />}
        {menuTab === 'quests' && <Quests state={state} />}
        {menuTab === 'convos' && <Timeline empty="No conversation yet." items={state.convos.slice().reverse()} />}
        {menuTab === 'activity' && <Timeline empty="No activity logs yet." items={state.logs} />}
        {menuTab === 'settings' && <Settings state={state} actions={actions} />}
        {menuTab === 'help' && <Help />}
      </div>
    </Modal>
  );
}

function Projects({ state, actions }) {
  const projects = useMemo(() => listProjects(state.email), [state.email, state.lastSaved, state.projectId]);
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
              <div className="stack">
                {isCurrent && <span className="project-pill">Current</span>}
                <button type="button" className={incomplete ? 'green' : 'secondary'} onClick={() => actions.loadProject(state.email, project.projectId)}>
                  {incomplete ? 'Resume' : 'Open'}
                </button>
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
  return (
    <div className="modal-grid">
      <div className="card">
        <h3>Current run</h3>
        <p><b>Phase:</b> {phaseLabel}</p>
        <p><b>Progress:</b> {Math.round(state.progress)}%</p>
        <p><b>Active employee:</b> {activeEmployee.name}</p>
        <p><b>Outputs ready:</b> {complete}/{outputOrder.length}</p>
        <div className="stack">
          <button type="button" onClick={() => actions.openOutputs(state.activeOutput || 'Plan')}>Open outputs</button>
          {state.phase === 'error' && <button type="button" className="green" onClick={actions.resumeWork}>Resume work</button>}
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
          <button type="button" className="secondary" onClick={actions.exportJSON}>Export JSON</button>
        </div>
      </div>
    </div>
  );
}

function Client({ state, actions }) {
  const [client, setClient] = useState({ userName: state.userName, email: state.email, clientDetails: state.clientDetails, brief: state.brief });
  const setField = (field, value) => setClient((current) => ({ ...current, [field]: value }));
  return (
    <div className="modal-grid">
      <div className="card">
        <h3>Client details</h3>
        <label>Name<input value={client.userName} onChange={(event) => setField('userName', event.target.value)} /></label>
        <label>Email<input value={client.email} onChange={(event) => setField('email', event.target.value)} /></label>
        <label>Project form / brief<textarea value={client.clientDetails} onChange={(event) => setField('clientDetails', event.target.value)} /></label>
        <button type="button" onClick={() => actions.saveClientEdits(client)}>Save client info</button>
      </div>
      <div className="card">
        <h3>Saved sessions</h3>
        <p className="muted">Returning customers load by email from browser storage on this device.</p>
      </div>
    </div>
  );
}

function Quests({ state }) {
  if (!state.quests.length) return <div className="empty">No tasks yet. Send a brief and the employees will create the task log as they work.</div>;
  return (
    <div className="quest-list">
      {state.quests.map((quest) => {
        const employee = employees[quest.employeeId] || employees.reception;
        return <div className="quest-item" key={quest.title}><div className="quest-icon">{quest.status === 'done' ? 'OK' : '...'}</div><div><b>{quest.title}</b><span className="muted">{employee.name} - {employee.role}</span></div><span className="muted small">{quest.status}</span></div>;
      })}
    </div>
  );
}

function Timeline({ items, empty }) {
  if (!items.length) return <div className="empty">{empty}</div>;
  return <div className="log-list">{items.map((item, index) => <div className="log-item" key={`${item.time}-${index}`}><b>{item.who} <span className="muted small">{item.time}</span></b>{item.text}</div>)}</div>;
}

function Settings({ state, actions }) {
  const [settings, setSettings] = useState(state.settings);
  const [apiKey, setApiKey] = useState(actions.getApiKey());
  const setField = (field, value) => setSettings((current) => ({ ...current, [field]: value }));
  return (
    <div className="modal-grid">
      <div className="card">
        <h3>Model routing</h3>
        <p className="small muted">For production, use a backend proxy. Direct browser keys are for local testing only.</p>
        <label>OpenAI API key<input type="password" value={apiKey} onChange={(event) => setApiKey(event.target.value)} /></label>
        <label className="check"><input type="checkbox" checked={settings.rememberKey} onChange={(event) => setField('rememberKey', event.target.checked)} /> Remember key on this device</label>
        <label>Optional proxy endpoint<input value={settings.proxyUrl} onChange={(event) => setField('proxyUrl', event.target.value)} /></label>
        <div className="row">
          <label>Fast web model<input value={settings.fastModel} onChange={(event) => setField('fastModel', event.target.value)} /></label>
          <label>Complex OpenAI model<input value={settings.complexModel} onChange={(event) => setField('complexModel', event.target.value)} /></label>
        </div>
        <label>Autonomy<select value={settings.autonomy} onChange={(event) => setField('autonomy', event.target.value)}><option>Balanced</option><option>Careful</option><option>Aggressive</option></select></label>
        <button type="button" onClick={() => actions.saveSettingsFromForm(settings, apiKey)}>Save settings</button>
      </div>
      <div className="card">
        <h3>Run controls</h3>
        <div className="stack">
          <button type="button" className="green" onClick={actions.resumeWork}>Resume work</button>
          <button type="button" className="secondary" onClick={actions.stopRun}>Stop current run</button>
          <button type="button" className="red" onClick={() => actions.resetToChoice(true)}>Reset office</button>
        </div>
      </div>
    </div>
  );
}

function Help() {
  return (
    <div className="modal-grid">
      <div className="card"><h3>Flow</h3><p>Enter your name, save your email, complete the project form, then review the website preview.</p></div>
      <div className="card"><h3>Real outputs</h3><p>The agency creates strategy, task board, design direction, website HTML, QA notes, and a project PDF with invoice draft.</p></div>
    </div>
  );
}
