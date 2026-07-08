window.MicroAgencySectionExamples = window.MicroAgencySectionExamples || {};
window.MicroAgencySectionExamples.portfolioSite = {
  title: 'Mira Studio',
  description: 'Portfolio website for a creative studio.',
  theme: 'default',
  sections: [
    { id: 'header', type: 'header-with-cta', content: { logo: 'Mira Studio', nav: [{ label: 'Work', href: '#work' }, { label: 'About', href: '#about' }, { label: 'Journal', href: '#journal' }], cta: { label: 'Enquire', href: '#contact' } }, settings: { paddingTop: 'xs', paddingBottom: 'xs' } },
    { id: 'hero', type: 'hero-centered', layout: { container: 'lg' }, content: { eyebrow: 'Brand and digital studio', title: 'Visual systems for founders and growing teams.', text: 'A portfolio direction with selected work, proof, story and enquiry paths.', buttons: [{ label: 'View work', href: '#work' }, { label: 'Start a project', href: '#contact', style: 'outline' }] }, settings: { background: 'background', paddingTop: '2xl', paddingBottom: '2xl' } },
    { id: 'work', type: 'portfolio-grid', layout: { container: 'lg', columns: { desktop: 3, tablet: 2, mobile: 1 } }, content: { title: 'Selected work', items: [{ image: '/placeholders/creative-studio.jpg', title: 'Studio refresh', text: 'Identity and web direction.' }, { image: '/placeholders/tech-product.jpg', title: 'Product launch', text: 'Landing page and content system.' }, { image: '/placeholders/premium-interior.jpg', title: 'Venue brand', text: 'Editorial site and photography.' }] }, settings: { background: 'surface' } },
    { id: 'about', type: 'intro-two-column', layout: { container: 'lg' }, content: { eyebrow: 'About', title: 'Small senior team, clear creative process.', text: 'The studio helps teams turn ideas into a visual direction that can be shipped.', secondaryText: 'Use this section to explain credibility, approach and the kinds of clients that fit best.' }, settings: { background: 'background' } },
    { id: 'journal', type: 'blog-card-grid', layout: { container: 'lg', columns: { desktop: 3, tablet: 2, mobile: 1 } }, content: { title: 'Notes', items: [{ title: 'Choosing a visual route', text: 'How to compare design directions.' }, { title: 'What makes a good homepage', text: 'A simple structure for clarity.' }, { title: 'Preparing a useful brief', text: 'The information that speeds up design.' }] }, settings: { background: 'surface' } },
    { id: 'contact', type: 'cta-split', content: { title: 'Have a project in mind?', text: 'Share the brief and timeline.', secondaryText: 'Available for selected new projects this month.', buttons: [{ label: 'Enquire', href: 'mailto:hello@example.com' }] }, settings: { background: 'background' } },
  ],
};
