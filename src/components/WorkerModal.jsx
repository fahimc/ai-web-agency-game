import React from 'react';
import { employees } from '../data/employees.js';
import { Modal } from './Modal.jsx';

export function WorkerModal({ state, actions }) {
  const employee = employees[state.activeEmployee] || employees.reception;
  const currentQuest = state.quests.find((quest) => quest.employeeId === employee.id && quest.status === 'working');
  const finished = state.quests.filter((quest) => quest.employeeId === employee.id && quest.status === 'done').slice(0, 4);
  return (
    <Modal title={`${employee.name} is ${currentQuest ? 'working' : 'ready'}`} onClose={actions.closeModal} className="details-modal">
      <div className="modal-body">
        <div className="card">
          <h3>{employee.role}</h3>
          <p className="muted">{currentQuest ? `Current task: ${currentQuest.title}` : 'No active task right now.'}</p>
          <p>{state.speech?.employeeId === employee.id ? state.speech.text : employee.voice}</p>
        </div>
        <div className="card">
          <h3>Recent work</h3>
          {finished.length ? finished.map((quest) => <p key={quest.title}><b>{quest.title}</b><br /><span className="muted small">{quest.status}</span></p>) : <p className="muted">Nothing completed by this person yet.</p>}
        </div>
      </div>
    </Modal>
  );
}
