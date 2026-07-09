import React, { useMemo, useState } from 'react';
import { Modal } from './Modal.jsx';

const INDUSTRY_OPTIONS = [
  'Local service',
  'Trades',
  'Restaurant / food',
  'Health / wellness',
  'Beauty',
  'Professional services',
  'Legal',
  'Finance',
  'Education',
  'Charity / community',
  'Creative / portfolio',
  'SaaS / technology',
  'Event / venue',
  'Ecommerce / products',
  'Other',
];

const AUDIENCE_OPTIONS = [
  'Local customers',
  'Homeowners',
  'Families',
  'Couples',
  'Small businesses',
  'Startups',
  'Professionals',
  'Students / learners',
  'Visitors / guests',
  'Online shoppers',
  'Other',
];

const GOAL_OPTIONS = [
  'Get more enquiries',
  'Take bookings',
  'Sell products',
  'Show services clearly',
  'Build trust',
  'Show portfolio / work',
  'Launch a new business',
  'Improve an old website',
  'Publish content / articles',
  'Other',
];

const TONE_OPTIONS = [
  'Clean and professional',
  'Friendly and local',
  'Premium and polished',
  'Bold and energetic',
  'Calm and trustworthy',
  'Modern and minimal',
  'Creative and expressive',
];

const TEMPLATE_START_OPTIONS = [
  'Let the designer recommend',
  'Service business / agency style',
  'Visual portfolio / gallery style',
  'Restaurant / venue style',
  'Product / shop style',
  'Blog / article style',
  'Landing page / campaign style',
  'Minimal custom build',
];

const PAGE_OPTIONS = [
  'Home',
  'Services',
  'About',
  'Pricing',
  'Gallery',
  'Portfolio',
  'Testimonials',
  'FAQ',
  'Blog',
  'Contact',
];

const DEFAULT_PAGES = ['Home', 'Services', 'About', 'Contact'];

export function DetailsModal({ state, actions }) {
  const initial = useMemo(() => parseStoredClientDetails(state.clientDetails, state.selectedSitePages), [state.clientDetails, state.selectedSitePages]);
  const [form, setForm] = useState(initial);
  const editingForRevision = state.phase === 'approval';

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function setSelectField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
      [`${field}Other`]: value === 'Other' ? current[`${field}Other`] : '',
    }));
  }

  function togglePage(page) {
    setForm((current) => {
      if (page === 'Home') return current;
      const pages = current.pages.includes(page)
        ? current.pages.filter((item) => item !== page)
        : [...current.pages, page];
      return { ...current, pages: ensureHomePage(pages) };
    });
  }

  function submit(event) {
    event.preventDefault();
    const industry = resolvedValue(form.industry, form.industryOther);
    const audience = resolvedValue(form.audience, form.audienceOther);
    const goal = resolvedValue(form.goal, form.goalOther);
    const pages = ensureHomePage(form.pages);

    if (!form.businessName || !industry || !audience || !goal) {
      actions.notify('Please add the business name, industry, audience, and main goal.');
      return;
    }

    const details = [
      `Business / client name: ${form.businessName}`,
      `Industry: ${industry}`,
      form.location ? `Location / service area: ${form.location}` : '',
      `Ideal customers / audience: ${audience}`,
      `Project goal: ${goal}`,
      form.offer ? `Main offer / service: ${form.offer}` : '',
      form.tone ? `Tone / style: ${form.tone}` : '',
      `Template starting point: ${form.templateStart || 'Let the designer recommend'}`,
      `Pages: ${pages.join(', ')}`,
      form.extraNotes ? `Useful notes: ${form.extraNotes}` : '',
    ].filter(Boolean).join('\n');

    const payload = { clientDetails: details, brief: details, selectedSitePages: pages };
    if (editingForRevision) {
      actions.saveClientEdits(payload);
      actions.closeModal();
      return;
    }
    actions.submitDetails(details, { selectedSitePages: pages });
  }

  function resetForm() {
    setForm(parseStoredClientDetails('', []));
  }

  return (
    <Modal title={editingForRevision ? 'Edit Content Fields' : 'Project Details'} onClose={actions.closeModal} className="details-modal">
      <div className="modal-tabs"><span className="modal-tab active">{editingForRevision ? 'Revision content fields' : 'Quick customer intake'}</span></div>
      <div className="modal-body">
        <form className="details-form intake-form" autoComplete="on" onSubmit={submit}>
          <div className="card form-intro">
            <h3>{editingForRevision ? 'Update the brief' : `Hi ${state.userName || 'there'}, let us get the essentials`}</h3>
            <p className="muted">{editingForRevision ? 'Update only what has changed. The revision will use these fields.' : 'Pick from the options where possible. The designer will refine pages, sections, colours, and direction after payment.'}</p>
          </div>

          <section className="intake-section" aria-labelledby="intake-basics">
            <div className="intake-section-head">
              <span>1</span>
              <div>
                <h3 id="intake-basics">Business basics</h3>
                <p>Enough context to shape the first recommendation.</p>
              </div>
            </div>
            <div className="row">
              <Field label="Business name *" value={form.businessName} onChange={(value) => setField('businessName', value)} required />
              <SelectWithOther
                label="Industry *"
                value={form.industry}
                otherValue={form.industryOther}
                options={INDUSTRY_OPTIONS}
                onSelect={(value) => setSelectField('industry', value)}
                onOther={(value) => setField('industryOther', value)}
                required
              />
            </div>
            <div className="row">
              <Field label="Main offer or service" value={form.offer} onChange={(value) => setField('offer', value)} placeholder="e.g. wedding photography, accounting, roof repairs" />
              <Field label="Location / service area" value={form.location} onChange={(value) => setField('location', value)} placeholder="Optional" />
            </div>
          </section>

          <section className="intake-section" aria-labelledby="intake-goal">
            <div className="intake-section-head">
              <span>2</span>
              <div>
                <h3 id="intake-goal">Audience and goal</h3>
                <p>Use the closest option. Choose Other only if nothing fits.</p>
              </div>
            </div>
            <div className="row">
              <SelectWithOther
                label="Ideal customers *"
                value={form.audience}
                otherValue={form.audienceOther}
                options={AUDIENCE_OPTIONS}
                onSelect={(value) => setSelectField('audience', value)}
                onOther={(value) => setField('audienceOther', value)}
                required
              />
              <SelectWithOther
                label="Main goal *"
                value={form.goal}
                otherValue={form.goalOther}
                options={GOAL_OPTIONS}
                onSelect={(value) => setSelectField('goal', value)}
                onOther={(value) => setField('goalOther', value)}
                required
              />
            </div>
            <label>Tone
              <select value={form.tone} onChange={(event) => setField('tone', event.target.value)}>
                <option value="">Let the designer recommend</option>
                {TONE_OPTIONS.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
            <label>Template starting point
              <select value={form.templateStart} onChange={(event) => setField('templateStart', event.target.value)}>
                {TEMPLATE_START_OPTIONS.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
          </section>

          <section className="intake-section" aria-labelledby="intake-pages">
            <div className="intake-section-head">
              <span>3</span>
              <div>
                <h3 id="intake-pages">Pages</h3>
                <p>Select multiple pages. Deselect anything not needed. Home is always included.</p>
              </div>
            </div>
            <div className="page-picker" role="group" aria-label="Pages">
              {PAGE_OPTIONS.map((page) => {
                const selected = form.pages.includes(page);
                const fixed = page === 'Home';
                return (
                  <button
                    type="button"
                    className={`page-choice ${selected ? 'active' : ''} ${fixed ? 'fixed' : ''}`}
                    key={page}
                    aria-pressed={selected}
                    onClick={() => togglePage(page)}
                  >
                    <span>{page}</span>
                    <small>{fixed ? 'Required' : selected ? 'Selected' : 'Add'}</small>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="intake-section optional" aria-labelledby="intake-notes">
            <div className="intake-section-head">
              <span>4</span>
              <div>
                <h3 id="intake-notes">Optional notes</h3>
                <p>Add anything important. You can leave this blank.</p>
              </div>
            </div>
            <TextField label="Useful notes" value={form.extraNotes} onChange={(value) => setField('extraNotes', value)} placeholder="Competitors, special offers, opening times, must-avoid wording, or anything the team should know." />
          </section>

          <div className="stack form-actions">
            <button type="submit" className="green">{editingForRevision ? 'Save content fields' : 'Save details and continue'}</button>
            <button type="button" className="secondary" onClick={resetForm}>Clear form</button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

function SelectWithOther({ label, value = '', otherValue = '', options, onSelect, onOther, required }) {
  return (
    <div className="select-with-other">
      <label>{label}
        <select value={value} required={required} onChange={(event) => onSelect(event.target.value)}>
          <option value="">Choose one</option>
          {options.map((option) => <option key={option}>{option}</option>)}
        </select>
      </label>
      {value === 'Other' && (
        <Field label={`Custom ${label.replace('*', '').toLowerCase()}`} value={otherValue} onChange={onOther} required={required} />
      )}
    </div>
  );
}

function Field({ label, value = '', onChange, required, placeholder = '' }) {
  return (
    <label>{label}
      <input value={value} required={required} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextField({ label, value = '', onChange, placeholder = '' }) {
  return (
    <label>{label}
      <textarea value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function parseStoredClientDetails(details, selectedSitePages = []) {
  const out = {
    businessName: '',
    industry: '',
    industryOther: '',
    location: '',
    audience: '',
    audienceOther: '',
    goal: '',
    goalOther: '',
    offer: '',
    tone: '',
    templateStart: 'Let the designer recommend',
    pages: ensureHomePage(selectedSitePages.length ? selectedSitePages : DEFAULT_PAGES),
    extraNotes: '',
  };
  String(details || '').split('\n').forEach((line) => {
    const match = line.match(/^-?\s*([^:]+):\s*(.*)$/);
    if (!match) return;
    const key = match[1].toLowerCase().trim();
    const value = match[2].trim();
    if (key.includes('business') || key.includes('client name')) out.businessName = value;
    else if (key.includes('industry')) assignSelectValue(out, 'industry', value, INDUSTRY_OPTIONS);
    else if (key.includes('location')) out.location = value;
    else if (key.includes('audience') || key.includes('customer')) assignSelectValue(out, 'audience', value, AUDIENCE_OPTIONS);
    else if (key.includes('offer') || key.includes('service')) out.offer = value;
    else if (key.includes('goal')) assignSelectValue(out, 'goal', value, GOAL_OPTIONS);
    else if (key === 'pages' || key.includes('pages')) out.pages = ensureHomePage(value.split(',').map((item) => item.trim()));
    else if (key.includes('tone') || key.includes('style')) out.tone = value;
    else if (key.includes('template starting')) out.templateStart = TEMPLATE_START_OPTIONS.includes(value) ? value : 'Let the designer recommend';
    else if (key.includes('notes') || key.includes('else') || key.includes('must')) out.extraNotes = value;
  });
  return out;
}

function assignSelectValue(out, field, value, options) {
  if (options.includes(value)) {
    out[field] = value;
    out[`${field}Other`] = '';
    return;
  }
  out[field] = 'Other';
  out[`${field}Other`] = value;
}

function resolvedValue(value, otherValue) {
  return value === 'Other' ? otherValue.trim() : value.trim();
}

function ensureHomePage(pages = []) {
  return ['Home', ...new Set(pages.map((page) => String(page || '').trim()).filter((page) => page && page !== 'Home'))];
}
