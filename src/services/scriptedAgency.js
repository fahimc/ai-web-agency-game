import {
  buildDesignSelectionMarkdown,
  buildExampleSite,
  directionSummary,
  normalizePalette,
  recommendedStructure,
  siteLayouts,
} from '../data/siteBlueprints.js';
import { evaluateWebsiteQuality } from '../utils/siteQuality.js';
import { parseSitePackage } from '../utils/sitePackage.js';

export const SCRIPTED_STANDARD_KEYS = new Set([
  'Plan',
  'TaskBoard',
  'DesignDirection',
  'WebsiteHTML',
  'QAReport',
]);

export function shouldScriptAgencyStep(step, state = {}) {
  if (!step?.key || step.replace) return false;
  if (state.settings?.forceModelForStandardOutputs) return false;
  return SCRIPTED_STANDARD_KEYS.has(step.key);
}

export function scriptAgencyStep(step, state = {}) {
  const key = step?.key;
  if (key === 'Plan') return buildScriptedPlan(state);
  if (key === 'TaskBoard') return buildScriptedTaskBoard(state);
  if (key === 'DesignDirection') return buildScriptedDesignDirection(state);
  if (key === 'WebsiteHTML') return buildScriptedWebsite(state);
  if (key === 'QAReport') return buildScriptedQaReport(state);
  return '';
}

export function buildScriptedPageContent(state = {}) {
  const pages = contentPagesForState(state);
  return pages.map((page) => `## ${page}\n${fallbackPageContent(page, state)}`).join('\n\n---\n\n');
}

export function cheapModelForTask(taskType, state = {}) {
  const fast = state.settings?.fastModel || 'gpt-4.1-mini';
  const selected = state.settings?.selectedModel || state.projectModel || fast;
  if (['designRecommendations', 'revisionDesignPlan', 'pageContent'].includes(taskType)) return fast;
  return selected;
}

export function aiAutomationReview(state = {}) {
  const pages = contentPagesForState(state);
  const before = [
    'Design recommendations',
    'Commercial strategy',
    'Production task board',
    'Visual design direction',
    ...pages.map((page) => `Page content: ${page}`),
    'Website HTML',
    'QA report',
  ];
  const after = [
    `Design recommendations: cheap model (${cheapModelForTask('designRecommendations', state)})`,
    'Commercial strategy: scripted',
    'Production task board: scripted',
    'Visual design direction document: scripted from selected design',
    'Page content pack: scripted from brief, pages, sections, and uploaded context notes',
    'Website HTML: scripted through MicroAgency static builder and quality gate',
    'QA report: scripted from generated package quality report',
  ];
  return {
    beforeModelCalls: before.length,
    afterStandardModelCalls: 1,
    savedStandardModelCalls: Math.max(0, before.length - 1),
    before,
    after,
  };
}

function buildScriptedPlan(state) {
  const brief = parseBrief(state.brief || state.clientDetails || '');
  const business = brief.businessName || state.projectName || 'the business';
  const industry = brief.industry || 'the market';
  const audience = brief.audience || 'prospective customers';
  const offer = brief.offer || industry;
  const goal = brief.goal || 'generate qualified enquiries';
  const layout = selectedLayout(state);
  const structure = approvedStructure(state, layout);
  return [
    `# Commercial Strategy`,
    '',
    `## Objective`,
    `${business} needs a ${packageLabel(state)} that helps ${audience} understand ${offer} and move toward ${goal}.`,
    '',
    `## Target Customer`,
    `${audience}. The site should assume visitors are comparing options quickly on mobile and need plain-language reassurance before they enquire.`,
    '',
    `## Offer`,
    `${offer}. Explain what is included, who it suits, what happens next, and what details the customer should send.`,
    '',
    `## Recommended Structure`,
    `Pages: ${structure.pages.join(', ')}.`,
    `Sections: ${structure.sections.join(', ')}.`,
    '',
    `## Design Route`,
    `${layout.name}: ${directionSummary(layout)} Tone: ${layout.tone}.`,
    '',
    `## Risks`,
    `- Thin brief: use sensible ${industry} defaults and clearly labelled enquiry routes.`,
    '- Mobile visitors: keep navigation, CTA, form, and proof easy to reach.',
    '- Trust gap: use process notes, response expectations, FAQs, and practical proof.',
    '',
    `## Final Recommendation`,
    `Build a polished, accessible, responsive site with clear navigation, production copy, local placeholder or client imagery, and one obvious enquiry path on every page.`,
  ].join('\n');
}

function buildScriptedTaskBoard(state) {
  const layout = selectedLayout(state);
  const structure = approvedStructure(state, layout);
  return [
    '# Production Task Board',
    '',
    '| Stage | Owner | Work | Acceptance Criteria |',
    '| --- | --- | --- | --- |',
    `| Strategy | Amina Hart | Confirm audience, offer, goal, pages, and conversion path. | Strategy references ${structure.pages.length} approved page(s) and the selected ${layout.name} route. |`,
    '| Content | Mira Sol | Prepare page objectives, hero copy, trust/proof, FAQs, and CTA copy. | Each page has enough content for a real production page, not a thin card list. |',
    '| Design | Mira Sol | Map selected palette, typography feel, section order, imagery, and motion treatment. | Uses Bootstrap, MicroAgency sections, semantic theme tokens, and accessible contrast. |',
    '| Build | Kai Rivers | Generate standalone HTML files with Bootstrap navigation and local CSS/JS. | Launch returns one HTML file; Growth/Signature return separate HTML files for every approved page. |',
    '| QA | Jo Lane | Check mobile nav, page links, forms, wording, section count, and handover notes. | Quality gate passes with no agency-facing wording. |',
    '',
    '## Autonomous Work',
    '- Use scripted builder for standard plan, task board, content pack, HTML, and QA.',
    '- Use a cheap model only for initial design recommendations or revision interpretation.',
    '- Use fallback industry copy when the brief is thin.',
    '- Use local placeholders or uploaded client images where appropriate.',
  ].join('\n');
}

function buildScriptedDesignDirection(state) {
  const layout = selectedLayout(state);
  const palette = normalizePalette(state.selectedDesignPalette?.length ? state.selectedDesignPalette : layout.palette);
  const structure = approvedStructure(state, layout);
  return [
    buildDesignSelectionMarkdown(layout, palette, structure),
    '',
    '## Production Build Direction',
    `Use ${layout.name} as the source route. The site should feel ${layout.tone.toLowerCase()}, with strong mobile hierarchy and clear CTAs.`,
    '',
    '## Layout Choices',
    '- Header: Bootstrap responsive navbar with hamburger toggler on mobile.',
    '- Hero: split hero with supporting media and parallax motion where appropriate.',
    '- Body: section-first composition using services, benefits, proof, process, FAQ, contact, and any approved page-specific sections.',
    '- Motion: use reveal, staggered cards, parallax media, and reduced-motion fallback.',
    '',
    '## Accessibility',
    '- Use visible focus states, labels on form fields, alt text on images, and semantic headings.',
    '- Use semantic theme tokens and readable foreground/background pairs.',
  ].join('\n');
}

function buildScriptedWebsite(state) {
  const layout = selectedLayout(state);
  const palette = normalizePalette(state.selectedDesignPalette?.length ? state.selectedDesignPalette : layout.palette);
  return buildExampleSite(layout, state, palette);
}

function buildScriptedQaReport(state) {
  const website = state.outputs?.WebsiteHTML || buildScriptedWebsite(state);
  const report = evaluateWebsiteQuality(website, state);
  const sitePackage = parseSitePackage(website);
  const files = sitePackage ? Object.keys(sitePackage.files) : ['index.html'];
  return [
    '# QA And Handover Notes',
    '',
    `Quality result: ${report.passed ? 'Pass' : 'Needs attention'} (${report.score}/100).`,
    `Files checked: ${files.join(', ')}.`,
    '',
    '## Checks Completed',
    '- Responsive Bootstrap navigation with mobile hamburger.',
    '- Standalone HTML documents for approved pages.',
    '- Section count, headings, forms, calls to action, and copy depth.',
    '- Customer-facing wording with no preview/sample/design labels.',
    '- Local placeholder/client imagery and alt text where images are present.',
    '- Reduced-motion-safe reveal/parallax system included.',
    '',
    '## Quality Findings',
    report.failures.length ? report.failures.map((failure) => `- ${failure}`).join('\n') : '- No blocking issues found.',
    '',
    '## Launch Notes',
    '- Replace placeholder contact details, testimonials, pricing, and any dummy proof with verified client information before public launch.',
    '- Replace placeholder imagery with client-approved images when available.',
    '- Connect the contact form to the client inbox or CRM.',
  ].join('\n');
}

function contentPagesForState(state) {
  if (state.projectPackage === 'launch') {
    const sections = (state.selectedSiteSections?.length ? state.selectedSiteSections : ['Services', 'About', 'FAQ', 'Contact details', 'Final CTA'])
      .filter((item) => !/^hero$/i.test(String(item || '')));
    return uniqueItems(['Home', ...sections]).slice(0, 10);
  }
  const pages = state.selectedSitePages?.length
    ? state.selectedSitePages
    : approvedStructure(state, selectedLayout(state)).pages;
  return uniqueItems(['Home', ...pages]).slice(0, 8);
}

function fallbackPageContent(page, state) {
  const brief = parseBrief(state.brief || state.clientDetails || '');
  const business = brief.businessName || state.projectName || 'the business';
  const industry = brief.industry || 'the service';
  const audience = brief.audience || 'customers';
  const offer = brief.offer || industry;
  const goal = brief.goal || 'make an enquiry';
  const lower = String(page || '').toLowerCase();
  return [
    `Page objective: Help ${audience} understand ${offer} and move confidently toward ${goal}.`,
    `Visitor intent: The visitor wants plain-language information, reassurance, and a clear next action from ${business}.`,
    `Hero headline: ${heroHeadlineForPage(lower, business, offer, goal)}`,
    `Hero support copy: ${business} explains ${offer} clearly, answers the practical questions ${audience} usually have, and makes the next step easy.`,
    '',
    ...pageBlocksFor(lower, { business, industry, audience, offer, goal }).map((block, index) => [
      `Content block ${index + 1}: ${block.title}`,
      block.body,
      `CTA idea: ${block.cta}`,
    ].join('\n')),
    '',
    `Trust and proof: Add short testimonials, common customer questions, process reassurance, clear response times, and practical signals that ${business} is credible.`,
    `Primary CTA: ${ctaForGoal(goal)}`,
  ].join('\n');
}

function pageBlocksFor(page, context) {
  const { business, industry, audience, offer, goal } = context;
  if (page.includes('service')) {
    return [
      { title: `Core ${offer} support`, body: `${business} should explain the main service clearly: what is included, who it suits, what problem it solves, and what the customer receives.`, cta: 'Ask about this service' },
      { title: 'Tailored recommendation', body: `Give ${audience} a way to understand which option fits their situation, budget, timeline, and level of support needed.`, cta: 'Get a recommendation' },
      { title: 'Delivery and communication', body: 'Explain how the work is planned, confirmed, delivered, and checked so customers know what will happen after they enquire.', cta: 'Start the process' },
    ];
  }
  if (page.includes('about')) {
    return [
      { title: `Why ${business} exists`, body: `${business} focuses on ${offer} for ${audience}. Explain the practical problem the business solves, the standard it works to, and the kind of customer it is best suited for.`, cta: 'See how we can help' },
      { title: 'How we work', body: 'Explain the working style in simple stages: first conversation, recommendation, delivery, review, and support.', cta: 'Start with a quick enquiry' },
      { title: 'What customers can expect', body: `Set expectations around communication, quality, timing, and the details ${audience} should prepare before contacting ${business}.`, cta: 'Ask a question' },
    ];
  }
  if (page.includes('pricing')) {
    return [
      { title: 'Simple starting options', body: `Present a starter, standard, and complete route for ${offer}. Each option should explain who it suits, what is included, and what affects final price.`, cta: 'Request the right option' },
      { title: 'What changes the quote', body: `Mention scope, timing, location, quantity, support level, and choices that commonly change cost in ${industry}.`, cta: 'Send your details' },
      { title: 'No-pressure next step', body: 'Reassure visitors that an enquiry is used to understand the request and recommend the right route.', cta: 'Get a clear recommendation' },
    ];
  }
  if (page.includes('faq')) {
    return [
      { title: 'Before you enquire', body: `Answer what ${business} offers, who it is for, how quickly the team replies, and what information helps the first response.`, cta: 'Send the essentials' },
      { title: 'Choosing the right option', body: `Explain how ${audience} can compare options, understand fit, and avoid paying for more than they need.`, cta: 'Ask for guidance' },
      { title: 'Timings and practical details', body: 'Cover lead times, availability, preparation, and what happens after the first message.', cta: 'Check availability' },
    ];
  }
  if (page.includes('contact') || page.includes('book')) {
    return [
      { title: 'What to send', body: `Ask for name, email, what the customer needs, approximate timing, location if relevant, and preferences for ${offer}.`, cta: 'Send enquiry' },
      { title: 'What happens next', body: `${business} reviews the message, asks any missing questions, and replies with the clearest recommended next step.`, cta: 'Start the conversation' },
      { title: 'Reassurance', body: 'Make response expectations clear and keep the form short enough to complete on mobile.', cta: 'Contact us today' },
    ];
  }
  return [
    { title: `What ${business} offers`, body: `${business} helps ${audience} with ${offer}. Explain the offer in plain language, show who it is best for, and connect it to ${goal}.`, cta: 'Find the right next step' },
    { title: 'Why it matters', body: `Explain the customer problem, the practical benefit, and the outcome visitors can expect from a good ${industry} provider.`, cta: 'Compare the options' },
    { title: 'How to get started', body: 'Give a short process from first enquiry to recommendation, delivery, and follow-up.', cta: 'Start an enquiry' },
  ];
}

function selectedLayout(state) {
  return siteLayouts.find((item) => item.id === state.selectedDesignStyle) || siteLayouts[0];
}

function approvedStructure(state, layout) {
  const recommended = recommendedStructure(layout, state);
  return {
    pages: state.projectPackage === 'launch'
      ? ['Home']
      : uniqueItems(state.selectedSitePages?.length ? state.selectedSitePages : recommended.pages),
    sections: uniqueItems(state.selectedSiteSections?.length ? state.selectedSiteSections : recommended.sections),
  };
}

function parseBrief(text) {
  const fields = {};
  String(text || '').split('\n').forEach((line) => {
    const match = line.match(/^([^:]+):\s*(.+)$/);
    if (!match) return;
    const key = match[1].toLowerCase();
    const value = match[2].trim();
    if (key.includes('business') || key.includes('client name')) fields.businessName = value;
    else if (key.includes('industry')) fields.industry = value;
    else if (key.includes('audience') || key.includes('customer')) fields.audience = value;
    else if (key.includes('goal')) fields.goal = value;
    else if (key.includes('offer') || key.includes('service')) fields.offer = value;
  });
  return fields;
}

function heroHeadlineForPage(page, business, offer, goal) {
  if (page.includes('service')) return `${offer} from ${business}, explained clearly`;
  if (page.includes('about')) return `A clearer way to choose ${business}`;
  if (page.includes('pricing')) return 'Choose the right level of support';
  if (page.includes('case')) return 'Real situations, clear outcomes';
  if (page.includes('faq')) return 'Questions answered before you enquire';
  if (page.includes('contact') || page.includes('book')) return 'Start with a simple enquiry';
  return `${business} built to help you ${goal}`;
}

function ctaForGoal(goal) {
  return /book|call|appointment/i.test(goal) ? 'Book a call' : /buy|order|shop/i.test(goal) ? 'Start an order' : 'Start an enquiry';
}

function packageLabel(state) {
  if (state.projectPackage === 'launch') return 'one-page Launch Site';
  if (state.projectPackage === 'signature') return 'multi-page Signature Site';
  return 'multi-page Growth Site';
}

function uniqueItems(items) {
  return [...new Set((items || []).map((item) => String(item || '').trim()).filter(Boolean))];
}
