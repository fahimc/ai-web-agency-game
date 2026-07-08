window.MicroAgencySectionExamples = window.MicroAgencySectionExamples || {};
window.MicroAgencySectionExamples.localBusinessSite = {
  title: 'Green Lane Repairs',
  description: 'Local repair services for homeowners.',
  theme: 'local',
  sections: [
    { id: 'header', type: 'header-with-cta', layout: { container: 'xl' }, content: { logo: 'Green Lane Repairs', nav: [{ label: 'Services', href: '#services' }, { label: 'Areas', href: '#areas' }, { label: 'Hours', href: '#hours' }], cta: { label: 'Request a quote', href: '#contact' } }, behaviour: { bootstrap: 'collapse', sticky: true }, settings: { background: 'background', paddingTop: 'xs', paddingBottom: 'xs' } },
    { id: 'hero', type: 'hero-split', layout: { container: 'lg' }, content: { eyebrow: 'Local home repairs', title: 'Reliable help for practical jobs around the home.', text: 'Fast response, clear pricing and tidy work for homeowners across the area.', buttons: [{ label: 'Request a quote', href: '#contact' }], media: { src: '/placeholders/business-team.jpg', alt: 'Local service team preparing a customer job' } }, settings: { background: 'background', paddingTop: '2xl' } },
    { id: 'services', type: 'services-grid', layout: { container: 'lg', columns: { desktop: 3, tablet: 2, mobile: 1 } }, content: { title: 'Common services', items: [{ title: 'Repairs', text: 'Small fixes handled properly.' }, { title: 'Maintenance', text: 'Planned visits for ongoing care.' }, { title: 'Emergency help', text: 'Urgent support when timing matters.' }] }, settings: { background: 'surface' } },
    { id: 'proof', type: 'testimonials-grid', layout: { container: 'lg', columns: { desktop: 3, tablet: 2, mobile: 1 } }, content: { title: 'Customers trust the work', items: [{ quote: 'Clear, punctual and easy to book.', name: 'Aisha K' }, { quote: 'Explained everything before starting.', name: 'Mark T' }, { quote: 'Good tidy finish and fair price.', name: 'Sarah L' }] }, settings: { background: 'background' } },
    { id: 'areas', type: 'areas-served', layout: { container: 'lg', columns: { desktop: 4, tablet: 2, mobile: 1 } }, content: { title: 'Areas served', items: ['Leyton', 'Stratford', 'Walthamstow', 'Hackney'].map((area) => ({ title: area, text: 'Local appointments available.' })) }, settings: { background: 'surface' } },
    { id: 'hours', type: 'opening-hours', layout: { container: 'md' }, content: { title: 'Opening hours', items: [{ day: 'Mon-Fri', hours: '8:00-18:00' }, { day: 'Saturday', hours: '9:00-14:00' }, { day: 'Sunday', hours: 'Emergency only' }] }, settings: { background: 'background' } },
    { id: 'contact', type: 'cta-band', layout: { container: 'lg' }, content: { title: 'Need a local repair?', text: 'Send the job details and get a practical next step.', buttons: [{ label: 'Request a quote', href: 'mailto:hello@example.com' }] }, settings: { background: 'background' } },
  ],
};
