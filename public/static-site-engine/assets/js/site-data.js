/* MicroAgencySiteData is intentionally JSON-like.
   Small LLM instructions:
   - Add pages under pages.
   - Add sections as ordered objects with id, kind, layout, spacing, background, content.
   - Prefer component names already supported in components.js.
   - Use Bootstrap-safe semantic content and always include alt text for images. */
window.MicroAgencySiteData = (() => {
  const img = (name) => `/placeholders/${name}`;
  const commonNav = [
    { label: 'Home', href: '/static-site-engine/index.html' },
    { label: 'About', href: '/static-site-engine/pages/about.html' },
    { label: 'Services', href: '/static-site-engine/pages/services.html' },
    { label: 'Contact', href: '/static-site-engine/pages/contact.html' },
  ];
  const buttons = [
    { label: 'Start a project', href: '/static-site-engine/pages/contact.html', style: 'primary' },
    { label: 'View services', href: '/static-site-engine/pages/services.html', style: 'secondary' },
  ];
  const serviceItems = [
    { component: 'service-card', icon: 'W', title: 'Website generation', description: 'Structured static websites composed from reusable sections.', href: '/static-site-engine/pages/services.html' },
    { component: 'service-card', icon: 'C', title: 'Conversion copy', description: 'Clear page journeys, CTAs, FAQs, and trust-building content.' },
    { component: 'service-card', icon: 'D', title: 'Design systems', description: 'Theme tokens, Bootstrap components, and reusable layouts.' },
  ];
  const featureItems = [
    { component: 'feature-card', icon: '1', title: 'Section data first', description: 'Pages are edited as structured data, not brittle hand-coded HTML.' },
    { component: 'feature-card', icon: '2', title: 'Bootstrap foundation', description: 'Nav, forms, cards, accordions, grids, and mobile behaviour use Bootstrap 5.3.' },
    { component: 'feature-card', icon: '3', title: 'Theme tokens', description: 'Colours, spacing, radius, shadows, and typography are changed in one layer.' },
    { component: 'feature-card', icon: '4', title: 'Static output', description: 'Fast HTML, CSS, and JavaScript without a heavy runtime.' },
    { component: 'feature-card', icon: '5', title: 'Reusable templates', description: 'Common business pages can be assembled from proven patterns.' },
  ];
  const testimonials = [
    { component: 'testimonial-card', quote: 'The site explained our offer clearly and gave customers a simple enquiry path.', name: 'Asha Khan', role: 'Local founder', rating: 5 },
    { component: 'testimonial-card', quote: 'The section system made revisions much faster than rebuilding pages from scratch.', name: 'Leon Smith', role: 'Consultant', rating: 5 },
    { component: 'testimonial-card', quote: 'Clean, responsive, and easy to maintain.', name: 'Mira Patel', role: 'Studio owner', rating: 5 },
  ];
  const portfolio = [
    { component: 'portfolio-card', image: img('business-team.jpg'), title: 'Consulting website', category: 'Service business', description: 'A trust-led lead generation site.' },
    { component: 'portfolio-card', image: img('restaurant-table.jpg'), title: 'Local venue', category: 'Local business', description: 'Opening hours, gallery, and booking CTA.' },
    { component: 'portfolio-card', image: img('tech-product.jpg'), title: 'SaaS product', category: 'Product', description: 'Feature-led landing page and pricing.' },
  ];
  const faqs = [
    { question: 'Can this create more than one page?', answer: 'Yes. Pages are data objects and can be rendered from reusable layouts and components.' },
    { question: 'Can a small LLM edit it?', answer: 'Yes. The LLM can add sections or change content in JSON-like structures.' },
    { question: 'Does it use Bootstrap?', answer: 'Yes. Bootstrap 5.3 is used for reliable responsive components.' },
  ];
  const headerBase = { logo: 'MicroAgency AI', homeHref: '/static-site-engine/index.html', nav: commonNav, headerCta: { label: 'Start', href: '/static-site-engine/pages/contact.html', style: 'primary' } };
  const home = {
    ...headerBase,
    title: 'MicroAgency AI',
    description: 'Fast AI-powered websites for small businesses.',
    theme: 'default',
    sections: [
      {
        id: 'hero',
        kind: 'hero',
        layout: { type: 'split-hero', container: 'lg', gap: 'xl', reverse: false },
        spacing: 'lg',
        background: 'default',
        content: {
          eyebrow: 'AI-powered web agency',
          heading: 'Launch a professional website faster.',
          text: 'MicroAgency AI builds clean, modern static websites for small businesses using AI-assisted design and development.',
          buttons,
          badges: ['Bootstrap 5.3', 'Static output', 'Mobile-first'],
          media: { type: 'image', src: img('office-workspace.jpg'), alt: 'Website dashboard preview' },
        },
      },
      { id: 'services', kind: 'services', layout: { type: 'card-grid', container: 'lg', minCardWidth: '260px', maxColumns: 3, equalHeight: true }, spacing: 'md', background: 'surface', content: { eyebrow: 'Services', heading: 'Useful website packages', text: 'Reusable cards, forms, FAQs, galleries, and CTAs make common sites fast to assemble.', items: serviceItems } },
      { id: 'features', kind: 'features', layout: { type: 'bento-grid', container: 'lg' }, spacing: 'md', background: 'default', content: { eyebrow: 'System', heading: 'Built for structured generation', items: featureItems.map((item, index) => ({ ...item, colSpan: index === 0 ? 3 : 2 })) } },
      { id: 'about-preview', kind: 'about', layout: { type: 'two-column', ratio: '1-1', container: 'lg' }, spacing: 'md', background: 'surface', content: { primary: '<div class="eyebrow">About</div><h2 class="section-heading">A compact agency workflow for static sites</h2><p class="lead-text">Strategy, design, development, QA, and handover are represented as reusable page data and components.</p>', media: { type: 'image', src: img('business-team.jpg'), alt: 'Business team planning a website' } } },
      { id: 'process', kind: 'process', layout: { type: 'stack', container: 'md' }, spacing: 'md', background: 'default', content: { eyebrow: 'Process', heading: 'How it works', component: 'process-steps', items: [{ title: 'Brief', description: 'Capture business, audience, offer, and goals.' }, { title: 'Compose', description: 'Choose sections, layouts, and components.' }, { title: 'Ship', description: 'Render static pages and review on mobile.' }] } },
      { id: 'testimonials', kind: 'testimonials', layout: { type: 'horizontal-scroller', container: 'lg' }, spacing: 'md', background: 'surface', content: { eyebrow: 'Proof', heading: 'What clients notice', items: testimonials } },
      { id: 'portfolio', kind: 'portfolio', layout: { type: 'card-grid', container: 'lg', minCardWidth: '280px' }, spacing: 'md', background: 'default', content: { eyebrow: 'Work', heading: 'Example directions', items: portfolio } },
      { id: 'cta', kind: 'cta', layout: { type: 'cta-band', container: 'lg', variant: 'split' }, spacing: 'md', background: 'default', content: { heading: 'Ready to build a clear static site?', text: 'Start with structured data and let the layout engine do the assembly.', buttons: [{ label: 'Start a project', href: '/static-site-engine/pages/contact.html', style: 'primary' }] } },
    ],
  };
  const about = {
    ...headerBase,
    title: 'About MicroAgency AI',
    description: 'About the reusable static site system.',
    theme: 'default',
    sections: [
      { id: 'hero', kind: 'hero', layout: { type: 'centered-hero', container: 'md' }, spacing: 'lg', content: { eyebrow: 'About', heading: 'A small agency system built from reusable sections.', text: 'MicroAgency AI turns business briefs into structured static sites.' } },
      { id: 'story', kind: 'story', layout: { type: 'two-column', ratio: '3-2', container: 'lg' }, spacing: 'md', background: 'surface', content: { primary: '<h2 class="section-heading">The story</h2><p class="lead-text">The engine keeps layout decisions separate from content so AI can safely assemble common pages.</p>', media: { type: 'image', src: img('creative-studio.jpg'), alt: 'Creative studio' } } },
      { id: 'values', kind: 'values', layout: { type: 'card-grid', container: 'lg' }, spacing: 'md', content: { heading: 'Values', items: [{ component: 'feature-card', icon: 'C', title: 'Clear', description: 'Readable structure.' }, { component: 'feature-card', icon: 'S', title: 'Simple', description: 'No heavy runtime.' }, { component: 'feature-card', icon: 'R', title: 'Reusable', description: 'Every section can be recomposed.' }] } },
      { id: 'team', kind: 'team', layout: { type: 'card-grid', container: 'lg' }, spacing: 'md', background: 'surface', content: { heading: 'Team', items: [{ component: 'team-card', image: img('business-team.jpg'), name: 'Nova', role: 'Reception', bio: 'Collects the brief.' }, { component: 'team-card', image: img('office-workspace.jpg'), name: 'Mira', role: 'Designer', bio: 'Sets the direction.' }, { component: 'team-card', image: img('tech-product.jpg'), name: 'Kai', role: 'Developer', bio: 'Builds the static output.' }] } },
      { id: 'stats', kind: 'stats', spacing: 'md', content: { component: 'stats-block', items: [{ number: '26', label: 'Templates', text: 'Common page types.' }, { number: '17', label: 'Layouts', text: 'Responsive primitives.' }, { number: '20', label: 'Components', text: 'Reusable blocks.' }] } },
      { id: 'cta', kind: 'cta', layout: { type: 'cta-band', container: 'lg' }, content: { heading: 'Build from sections, not guesswork.', buttons: [{ label: 'View services', href: './services.html', style: 'primary' }] } },
    ],
  };
  const services = {
    ...headerBase,
    title: 'Services - MicroAgency AI',
    description: 'Static website services.',
    theme: 'service',
    sections: [
      { id: 'hero', kind: 'hero', spacing: 'lg', content: { eyebrow: 'Services', heading: 'Reusable layouts for practical business websites.', text: 'Start from common sections and adapt the content to each client.' } },
      { id: 'service-grid', kind: 'services', layout: { type: 'card-grid', container: 'lg', minCardWidth: '260px' }, background: 'surface', content: { heading: 'What we build', items: serviceItems.concat([{ component: 'service-card', icon: 'L', title: 'Landing pages', description: 'Focused pages for campaigns and offers.' }]) } },
      { id: 'process', kind: 'process', content: { component: 'process-steps', heading: 'Delivery process', items: [{ title: 'Plan', description: 'Choose pages and sections.' }, { title: 'Design', description: 'Apply theme and layout.' }, { title: 'Render', description: 'Ship static HTML.' }] } },
      { id: 'faqs', kind: 'faq', layout: { type: 'single-column', container: 'md' }, background: 'surface', content: { component: 'faq-accordion', heading: 'Questions', items: faqs } },
      { id: 'cta', kind: 'cta', layout: { type: 'cta-band', container: 'lg' }, content: { heading: 'Need a service site?', buttons: [{ label: 'Contact us', href: './contact.html', style: 'primary' }] } },
    ],
  };
  const contact = {
    ...headerBase,
    title: 'Contact - MicroAgency AI',
    description: 'Contact MicroAgency AI.',
    theme: 'default',
    sections: [
      { id: 'hero', kind: 'hero', spacing: 'lg', content: { eyebrow: 'Contact', heading: 'Tell us what the site needs to do.', text: 'Use the form to describe the business, audience, and goal.' } },
      { id: 'contact-form', kind: 'contact', layout: { type: 'two-column', ratio: '3-2', container: 'lg', align: 'start' }, background: 'surface', content: { primary: window.MicroAgencyComponents ? '' : '', items: [], secondary: '<div class="micro-card"><h2>Contact details</h2><p>hello@microagency.ai</p><p class="muted">Response within one working day.</p></div>', component: 'contact-form', services: ['Launch Site', 'Growth Site', 'Signature Site'] } },
      { id: 'location', kind: 'location', layout: { type: 'single-column', container: 'md' }, content: { component: 'map-location', title: 'Remote-first agency', address: 'United Kingdom', hours: 'Monday to Friday, 9:00-17:00', mapLabel: 'Map placeholder' } },
      { id: 'faq', kind: 'faq', layout: { type: 'single-column', container: 'md' }, content: { component: 'faq-accordion', items: faqs } },
    ],
  };
  contact.sections[1].content.primary = window.MicroAgencyComponents ? window.MicroAgencyComponents.render('contact-form', contact.sections[1].content) : '';
  const localBusiness = JSON.parse(JSON.stringify(home));
  localBusiness.title = 'Local Business Example';
  localBusiness.theme = 'local';
  localBusiness.sections[0].content.heading = 'Bring more local customers through the door.';
  localBusiness.sections[0].content.text = 'A practical local website with services, areas served, reviews, gallery, hours, and enquiry CTA.';
  const serviceBusiness = JSON.parse(JSON.stringify(services));
  serviceBusiness.title = 'Service Business Example';
  const templatePlans = {
    homepage: ['hero', 'services-benefits', 'feature-highlights', 'about-preview', 'process', 'testimonials', 'portfolio-preview', 'cta'],
    about: ['page-hero', 'story', 'mission-values', 'team-founder', 'stats', 'cta'],
    'services-overview': ['page-hero', 'service-grid', 'process', 'faqs', 'cta'],
    'service-detail': ['service-hero', 'whats-included', 'benefits', 'process', 'related-services', 'testimonials', 'faqs', 'contact-cta'],
    contact: ['contact-hero', 'contact-form-details', 'opening-hours-location', 'faq'],
    pricing: ['pricing-hero', 'pricing-cards', 'feature-comparison', 'faqs', 'cta'],
    portfolio: ['portfolio-hero', 'portfolio-grid', 'cta'],
    'case-study': ['case-study-hero', 'project-overview', 'problem-solution-results', 'full-width-media', 'stats-results', 'testimonial', 'related-work', 'cta'],
    'blog-listing': ['blog-hero', 'featured-article', 'blog-card-grid', 'category-sidebar'],
    'blog-article': ['article-hero', 'article-body', 'table-of-contents', 'related-articles', 'cta'],
    'landing-page': ['focused-hero', 'problem-solution', 'benefits', 'social-proof', 'offer-pricing', 'faqs', 'final-cta'],
    'local-business': ['local-hero', 'services', 'areas-served', 'reviews', 'gallery', 'opening-hours', 'contact-cta'],
    location: ['area-hero', 'services-in-area', 'local-reviews', 'nearby-areas', 'contact-cta'],
    team: ['team-hero', 'team-grid', 'values', 'cta'],
    faq: ['faq-hero', 'categorised-faqs', 'contact-cta'],
    testimonials: ['reviews-hero', 'featured-testimonials', 'review-grid', 'cta'],
    gallery: ['gallery-hero', 'masonry-gallery', 'cta'],
    'product-overview': ['product-hero', 'product-category-grid', 'features', 'faqs', 'cta'],
    'product-detail': ['product-detail-hero', 'image-spec-two-column', 'features', 'faqs', 'enquiry-cta'],
    booking: ['booking-hero', 'booking-embed', 'service-options', 'preparation-information', 'contact-fallback'],
    'privacy-policy': ['legal-content'],
    'cookie-policy': ['legal-content'],
    terms: ['legal-content'],
    accessibility: ['legal-content'],
    'thank-you': ['confirmation-cover', 'what-happens-next', 'useful-links'],
    '404': ['error-cover', 'useful-links'],
  };
  const templateKinds = Object.keys(templatePlans);
  const templates = Object.fromEntries(templateKinds.map((kind) => [kind, {
    title: kind.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
    theme: 'default',
    sections: templateSections(kind),
  }]));
  function templateSections(kind) {
    if (/privacy|cookie|terms|accessibility/.test(kind)) return [{ id: 'legal', kind: 'legal', layout: { type: 'single-column', container: 'md' }, content: { heading: kind.replace(/-/g, ' '), items: [{ component: 'alert', variant: 'info', title: 'Legal placeholder', text: 'Replace this content with approved legal copy.' }] } }];
    if (/thank-you|404/.test(kind)) return [{ id: 'cover', kind: 'cover', layout: { type: 'cover' }, content: { heading: kind === '404' ? 'Page not found' : 'Thank you', text: 'Use useful links and a clear next step.', buttons: [{ label: 'Return home', href: '/static-site-engine/index.html', style: 'primary' }] } }];
    if (/gallery/.test(kind)) return [{ id: 'gallery', kind: 'gallery', layout: { type: 'masonry', container: 'lg', columns: 3 }, content: { heading: 'Gallery', items: portfolio.map((item) => ({ src: item.image, alt: item.title })) } }];
    if (/pricing/.test(kind)) return [{ id: 'pricing', kind: 'pricing', layout: { type: 'three-column', container: 'lg' }, content: { heading: 'Pricing', items: [{ component: 'pricing-card', name: 'Starter', price: '£1', features: ['One page', 'Contact CTA'], cta: { label: 'Start', href: '#' } }, { component: 'pricing-card', name: 'Growth', price: '£3', highlight: true, features: ['Multi-section', 'Richer copy'], cta: { label: 'Choose', href: '#' } }, { component: 'pricing-card', name: 'Signature', price: '£5', features: ['Premium pass', 'Full handover'], cta: { label: 'Discuss', href: '#' } }] } }];
    return (templatePlans[kind] || ['hero', 'main', 'cta']).map((name, index) => templateSection(name, kind, index));
  }
  function templateSection(name, templateKind, index) {
    const readable = name.replace(/-/g, ' ');
    if (/hero/.test(name)) return { id: name, kind: 'hero', content: { eyebrow: templateKind, heading: `${readable} for ${templateKind.replace(/-/g, ' ')}`, text: 'Template starter section generated by the MicroAgency layout engine.', buttons, media: /split|service|product|local|case/.test(name) ? { type: 'image', src: img('business-team.jpg'), alt: readable } : null } };
    if (/faq/.test(name)) return { id: name, kind: 'faq', layout: { type: 'single-column', container: 'md' }, content: { heading: readable, component: 'faq-accordion', items: faqs } };
    if (/testimonial|review|proof/.test(name)) return { id: name, kind: 'testimonials', layout: { type: 'card-grid', container: 'lg' }, content: { heading: readable, items: testimonials } };
    if (/portfolio|related-work|gallery/.test(name)) return { id: name, kind: /gallery/.test(name) ? 'gallery' : 'portfolio', layout: { type: /gallery/.test(name) ? 'masonry' : 'card-grid', container: 'lg' }, content: { heading: readable, items: /gallery/.test(name) ? portfolio.map((item) => ({ src: item.image, alt: item.title })) : portfolio } };
    if (/process|steps|what-happens/.test(name)) return { id: name, kind: 'process', layout: { type: 'stack', container: 'md' }, content: { heading: readable, component: 'process-steps', items: [{ title: 'Discover', description: 'Understand the need.' }, { title: 'Plan', description: 'Choose sections and content.' }, { title: 'Launch', description: 'Publish the page.' }] } };
    if (/form|contact/.test(name)) return { id: name, kind: 'contact', layout: { type: 'two-column', ratio: '3-2', container: 'lg' }, content: { heading: readable, primary: window.MicroAgencyComponents.render('contact-form', {}), secondary: '<div class="micro-card"><h3>Contact details</h3><p>hello@microagency.ai</p></div>' } };
    if (/media|image|map|location|hours|booking/.test(name)) return { id: name, kind: 'media', layout: { type: /full-width/.test(name) ? 'full-width-media' : 'two-column', container: 'lg' }, content: { heading: readable, media: { type: 'image', src: img('office-workspace.jpg'), alt: readable }, secondary: '<div class="micro-card"><h3>Details</h3><p class="muted">Replace with real practical information.</p></div>' } };
    if (/cta|final/.test(name)) return { id: name, kind: 'cta', layout: { type: 'cta-band', container: 'lg' }, content: { heading: readable, text: 'Move visitors to the next useful action.', buttons: [{ label: 'Contact', href: '/static-site-engine/pages/contact.html', style: 'primary' }] } };
    return { id: name, kind: index === 0 ? 'hero' : 'services', layout: { type: index === 0 ? 'centered-hero' : 'card-grid', container: 'lg' }, content: { eyebrow: templateKind, heading: readable, text: 'Replace this placeholder with specific content for the page.', items: serviceItems } };
  }
  return {
    pages: { home, about, services, contact, localBusiness, serviceBusiness },
    templates,
    examples: { homepage: home, localBusiness, serviceBusiness },
    decisionRules: [
      'If section kind is hero and has media, use split-hero.',
      'If section kind is hero and has no media, use centered-hero.',
      'If section has 3 or more repeated items, use card-grid.',
      'If section is legal or article content, use single-column.',
      'If section has sidebar content, use sidebar layout.',
      'If section is gallery, use masonry layout.',
      'If section is features and has more than 4 items, use bento-grid.',
      'If section is CTA, use cta-band.',
      'If section has tags/buttons/badges, use cluster layout.',
      'If section is a vertical list, use stack layout.',
    ],
  };
})();
