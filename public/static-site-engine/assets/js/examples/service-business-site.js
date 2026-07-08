window.MicroAgencySectionExamples = window.MicroAgencySectionExamples || {};
window.MicroAgencySectionExamples.serviceBusinessSite = {
  title: 'Northstar Consulting',
  description: 'Advisory services for growing teams.',
  theme: 'service',
  sections: [
    { id: 'header', type: 'header-with-cta', layout: { container: 'xl' }, content: { logo: 'Northstar Consulting', nav: [{ label: 'Approach', href: '#process' }, { label: 'Services', href: '#services' }, { label: 'FAQ', href: '#faq' }], cta: { label: 'Book a call', href: '#contact' } }, settings: { paddingTop: 'xs', paddingBottom: 'xs' } },
    { id: 'hero', type: 'hero-centered', layout: { container: 'md' }, content: { eyebrow: 'Operations consulting', title: 'Sharper systems for teams that need clarity.', text: 'A practical consulting site with proof, process and a clear route to enquire.', buttons: [{ label: 'Book a call', href: '#contact' }] }, settings: { background: 'background', paddingTop: '2xl', paddingBottom: '2xl' } },
    { id: 'services', type: 'services-tabs', layout: { container: 'lg', columns: { desktop: 3, tablet: 2, mobile: 1 } }, content: { title: 'Ways we help', tabs: [{ label: 'Strategy', items: [{ title: 'Planning', text: 'Set priorities and decision rules.' }, { title: 'Roadmaps', text: 'Turn goals into manageable action.' }] }, { label: 'Delivery', items: [{ title: 'Process design', text: 'Improve handoffs and accountability.' }, { title: 'Team rhythm', text: 'Create repeatable working habits.' }] }] }, settings: { background: 'surface' } },
    { id: 'process', type: 'process-numbered-cards', layout: { container: 'lg', columns: { desktop: 3, tablet: 3, mobile: 1 } }, content: { title: 'Simple consulting process', items: [{ title: 'Diagnose', text: 'Understand the current workflow.' }, { title: 'Prioritise', text: 'Choose the highest leverage fixes.' }, { title: 'Implement', text: 'Support practical rollout.' }] }, settings: { background: 'background' } },
    { id: 'faq', type: 'faq-accordion', layout: { container: 'md' }, content: { title: 'Common questions', items: [{ question: 'How long does a project take?', answer: 'Most focused projects start with a two-week diagnostic.' }, { question: 'Do you work remotely?', answer: 'Yes, remote and hybrid support is available.' }] }, settings: { background: 'surface' } },
    { id: 'contact', type: 'contact-form-split', layout: { container: 'lg' }, content: { title: 'Start with a short call', form: { submitLabel: 'Request call' }, details: [{ title: 'Email', text: 'hello@northstar.example' }] }, settings: { background: 'background' } },
  ],
};
