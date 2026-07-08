export const previewSteps = [
  {
    key: 'Plan',
    employee: 'director',
    progress: 15,
    quest: 'Commercial strategy',
    complex: true,
    task: 'Create a concise commercial strategy for this client. Include objective, target customer, offer, conversion goal, key sections, tone, risks, and final recommendation. Output in clear markdown.',
  },
  {
    key: 'TaskBoard',
    employee: 'pm',
    progress: 30,
    quest: 'Production task board',
    contextKeys: ['Plan'],
    task: 'Turn the strategy into a production task board. Include stages, owner, dependencies, acceptance criteria, and what can be done autonomously without asking the client.',
  },
  {
    key: 'DesignDirection',
    employee: 'design',
    progress: 48,
    quest: 'Visual design direction',
    contextKeys: ['Plan', 'TaskBoard', 'SelectedDesign'],
    task: 'Create the final design direction for a high-converting responsive website using the selected design direction, colour palette, pages, sections, and Bootstrap 5.3 + MicroAgency Blocks component system. Include layout, section order, visual style, typography feel, UX notes, microcopy guidance, accessibility notes and mobile-first considerations. Require a Bootstrap responsive navbar with a visible hamburger toggler on mobile. Treat the selected pages and sections as client-approved unless the brief makes one impossible.',
  },
  {
    key: 'WebsiteHTML',
    employee: 'dev',
    progress: 70,
    quest: 'Website preview',
    complex: true,
    contextKeys: ['Plan', 'TaskBoard', 'SelectedDesign', 'DesignDirection', 'PageContent'],
    task: 'Build the final production customer website using the selected design direction, colour palette, approved pages, approved sections, page content pack, and Bootstrap 5.3 + MicroAgency Blocks component system. Include Bootstrap 5.3 CSS and bootstrap.bundle JS from jsDelivr in every HTML document, then add local CSS variables and theme overrides. The header must be a Bootstrap responsive navbar using navbar-expand-md, navbar-toggler, collapse navbar-collapse, navbar-nav, nav-item, nav-link, aria labels, and a visible hamburger menu on mobile. Use Bootstrap components where helpful: cards, forms, accordions for FAQ, modal/offcanvas when appropriate, carousel for galleries, grid utilities, buttons, badges, alerts, and responsive spacing. For Launch Site only: return one complete single-file HTML document starting with <!doctype html>; navigation links must use one-page section hashes such as href="#services" with matching id="services". For Growth Site and Signature Site: return JSON only with shape {"kind":"microagency-site-package-v1","entry":"index.html","files":{"index.html":"<!doctype html>...","about.html":"<!doctype html>...","contact.html":"<!doctype html>..."}}. Growth/Signature must create one separate .html file for every approved page, with Home as index.html; navigation must use normal file links such as href="about.html" and href="contact.html", not hashes, not #/ routes, and not hidden page panels. Each file must be a full standalone HTML document with its own <style> and visible navigation. Build each approved page as a substantial production page with its own hero or intro, detailed body sections, proof, useful copy, and CTA; do not make pages a single generic card grid. If the brief is thin, use sensible common industry content and dummy production details. Do not include agency-facing labels such as example, sample, concept, preview, customer website, visual direction, or design direction inside the customer site; responsive mobile-first layout; strong conversion copy; clear CTAs; accessible semantic markup; polished modern design. Use local /placeholders assets where imagery is useful.',
  },
];

export const completionSteps = [
  {
    key: 'QAReport',
    employee: 'qa',
    progress: 92,
    quest: 'Quality check and handover notes',
    contextKeys: ['Plan', 'TaskBoard', 'DesignDirection', 'WebsiteHTML'],
    task: 'Create a concise QA and handover report for the generated website. Include responsive checks, accessibility checks, copy checks, potential issues, launch notes, and recommended next improvements. Do not write an email.',
  },
];
