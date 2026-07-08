import React from 'react';
import { employeeList } from '../data/employees.js';
import { Modal } from './Modal.jsx';

const steps = [
  {
    title: 'Tell us about the business',
    text: 'The receptionist collects the customer details, website goals, audience, offer, tone, and any must-have pages.',
  },
  {
    title: 'Choose the right package',
    text: 'The customer sees clear package options that explain what the agency will do, what will be produced, and what gets handed over.',
  },
  {
    title: 'Pick a design direction',
    text: 'The designer recommends a few visual routes, colour palettes, pages, and sections so the customer can choose the style before production starts.',
  },
  {
    title: 'The team builds the site',
    text: 'The office team turns the brief and selected direction into strategy, design, website copy, page structure, and a working site preview.',
  },
  {
    title: 'Review and handover',
    text: 'The customer approves the preview or asks for changes. Once approved, the agency prepares QA notes and a handover pack.',
  },
];

export function AgencyInfoModal({ actions }) {
  return (
    <Modal title="About MicroAgency AI" onClose={actions.closeModal} className="agency-info-modal">
      <div className="modal-tabs"><span className="modal-tab active">Agency guide</span><span className="modal-tab preview-label">Meet the team</span></div>
      <div className="modal-body agency-info-body">
        <section className="agency-hero">
          <div>
            <p className="eyebrow-text">What it is</p>
            <h2>A small virtual web agency that guides customers from brief to finished site.</h2>
            <p>
              MicroAgency AI is an interactive website-building experience. Instead of dropping a customer into a blank form,
              it presents a friendly office team that asks the right questions, recommends the next step, and produces a
              complete website direction and preview.
            </p>
          </div>
          <div className="agency-summary-card">
            <b>What customers get</b>
            <span>Clear packages, design options, colour choices, page recommendations, a generated website preview, revision support, and a handover pack.</span>
          </div>
        </section>

        <section>
          <h3>How it works</h3>
          <div className="agency-steps">
            {steps.map((step, index) => (
              <article className="agency-step" key={step.title}>
                <span>{index + 1}</span>
                <div>
                  <b>{step.title}</b>
                  <p>{step.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h3>Meet the team</h3>
          <div className="team-grid">
            {employeeList.map((employee) => (
              <article className="team-card" key={employee.id}>
                <span className="team-avatar" style={{ background: employee.shirt }}>{employee.icon}</span>
                <div>
                  <b>{employee.name}</b>
                  <small>{employee.role}</small>
                  <p>{teamDescription(employee.id)}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </Modal>
  );
}

function teamDescription(id) {
  const descriptions = {
    reception: 'Welcomes customers, explains the flow, collects details, and keeps the project moving.',
    director: 'Reviews the business goal and shapes the commercial strategy behind the site.',
    pm: 'Turns the brief into a clear plan, task list, and production order.',
    design: 'Recommends design directions, colour palettes, pages, sections, and the final visual route.',
    dev: 'Builds the website preview from the selected direction and customer brief.',
    qa: 'Checks the finished work and prepares the handover notes for the customer.',
  };
  return descriptions[id] || 'Helps move the project from brief to finished handover.';
}
