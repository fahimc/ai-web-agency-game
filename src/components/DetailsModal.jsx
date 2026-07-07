import React, { useMemo, useState } from 'react';
import { Modal } from './Modal.jsx';

export function DetailsModal({ state, actions }) {
  const initial = useMemo(() => parseStoredClientDetails(state.clientDetails), [state.clientDetails]);
  const [form, setForm] = useState(initial);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    if (!form.businessName || !form.industry || !form.audience || !form.goal) {
      actions.notify('Please fill in business name, industry, ideal customers, and project goal.');
      return;
    }
    const details = [
      `Business / client name: ${form.businessName}`,
      `Industry: ${form.industry}`,
      form.location ? `Location: ${form.location}` : '',
      `Ideal customers / audience: ${form.audience}`,
      `Project goal: ${form.goal}`,
      form.offer ? `Main offer / service: ${form.offer}` : '',
      form.tone ? `Tone / style: ${form.tone}` : '',
      form.pages ? `Pages / sections wanted: ${form.pages}` : '',
      form.mustHaves ? `Must-haves: ${form.mustHaves}` : '',
      form.extraNotes ? `Extra notes: ${form.extraNotes}` : '',
    ].filter(Boolean).join('\n');
    actions.submitDetails(details);
  }

  return (
    <Modal title="Client Details" onClose={actions.closeModal} className="details-modal">
      <div className="modal-tabs"><span className="modal-tab active">New customer intake</span></div>
      <div className="modal-body">
        <form className="details-form" autoComplete="on" onSubmit={submit}>
          <div className="card form-intro">
            <h3>Hi {state.userName || 'there'}, please fill in this form</h3>
            <p className="muted">This is the brief. Once you send it, the office starts work without asking for a separate message.</p>
          </div>
          <div className="row">
            <Field label="Business / client name *" value={form.businessName} onChange={(value) => setField('businessName', value)} required />
            <Field label="Industry *" value={form.industry} onChange={(value) => setField('industry', value)} required />
          </div>
          <div className="row">
            <Field label="Location" value={form.location} onChange={(value) => setField('location', value)} />
            <Field label="Ideal customers *" value={form.audience} onChange={(value) => setField('audience', value)} required />
          </div>
          <div className="row">
            <Field label="Main offer / service" value={form.offer} onChange={(value) => setField('offer', value)} />
            <label>Tone / style
              <select value={form.tone} onChange={(event) => setField('tone', event.target.value)}>
                <option value="">Choose a tone</option>
                <option>Premium and polished</option>
                <option>Friendly and local</option>
                <option>Bold and energetic</option>
                <option>Calm and professional</option>
                <option>Minimal and modern</option>
                <option>Playful and creative</option>
              </select>
            </label>
          </div>
          <TextField label="Main project goal *" value={form.goal} onChange={(value) => setField('goal', value)} />
          <TextField label="Pages or sections needed" value={form.pages} onChange={(value) => setField('pages', value)} />
          <MustHaveTags value={form.mustHaves} onChange={(value) => setField('mustHaves', value)} />
          <TextField label="Must-haves" value={form.mustHaves} onChange={(value) => setField('mustHaves', value)} />
          <TextField label="Anything else the team should know?" value={form.extraNotes} onChange={(value) => setField('extraNotes', value)} />
          <div className="stack form-actions">
            <button type="submit" className="green">Save details and continue</button>
            <button type="button" className="secondary" onClick={() => setForm(parseStoredClientDetails(''))}>Clear form</button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

function MustHaveTags({ value = '', onChange }) {
  const tags = [
    'Hero section',
    'Services section',
    'About section',
    'Contact form',
    'Testimonials',
    'FAQ',
    'Gallery',
    'Pricing section',
    'SEO basics',
    'Responsive layout',
    'Fast loading',
    'Privacy policy',
  ];
  const selected = value.split(',').map((item) => item.trim()).filter(Boolean);
  function toggle(tag) {
    const next = selected.includes(tag) ? selected.filter((item) => item !== tag) : [...selected, tag];
    onChange(next.join(', '));
  }
  return (
    <div>
      <span className="field-label">Must-have helpers</span>
      <div className="tag-palette">
        {tags.map((tag) => <button type="button" className={`tag-chip ${selected.includes(tag) ? 'active' : ''}`} key={tag} onClick={() => toggle(tag)}>{tag}</button>)}
      </div>
    </div>
  );
}

function Field({ label, value = '', onChange, required }) {
  return (
    <label>{label}
      <input value={value} required={required} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextField({ label, value = '', onChange }) {
  return (
    <label>{label}
      <textarea value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function parseStoredClientDetails(details) {
  const out = {
    businessName: '',
    industry: '',
    location: '',
    audience: '',
    goal: '',
    offer: '',
    tone: '',
    pages: '',
    mustHaves: '',
    extraNotes: '',
  };
  String(details || '').split('\n').forEach((line) => {
    const match = line.match(/^-?\s*([^:]+):\s*(.*)$/);
    if (!match) return;
    const key = match[1].toLowerCase().trim();
    const value = match[2].trim();
    if (key.includes('business') || key.includes('client name')) out.businessName = value;
    else if (key.includes('industry')) out.industry = value;
    else if (key.includes('location')) out.location = value;
    else if (key.includes('audience') || key.includes('customer')) out.audience = value;
    else if (key.includes('offer') || key.includes('service')) out.offer = value;
    else if (key.includes('goal')) out.goal = value;
    else if (key.includes('pages') || key.includes('section')) out.pages = value;
    else if (key.includes('tone') || key.includes('style')) out.tone = value;
    else if (key.includes('must')) out.mustHaves = value;
    else if (key.includes('notes') || key.includes('else')) out.extraNotes = value;
  });
  return out;
}
