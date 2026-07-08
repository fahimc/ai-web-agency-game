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
    task: 'Create the final design direction for a high-converting responsive website using the selected design direction, colour palette, pages, sections, and Bootstrap 5.3 + MicroAgency Layout Engine. Use the supplied MicroAgency capability context: section library, registered section types, layout primitives, reusable components, Bootstrap behaviours, colour palette presets, typography presets, placeholder images, and extension rules. Think in this architecture: Page -> Sections -> Layouts -> Components -> Content. Explicitly choose which available sections/layouts/components/palettes/typography the build should leverage, and only recommend a custom section, custom palette, or custom component when the existing system cannot express the brief. Include layout primitive choices, section order, visual style, typography feel, UX notes, microcopy guidance, accessibility notes and mobile-first considerations. Require a Bootstrap responsive navbar with a visible hamburger toggler on mobile. Treat the selected pages and sections as client-approved unless the brief makes one impossible.',
  },
  {
    key: 'WebsiteHTML',
    employee: 'dev',
    progress: 70,
    quest: 'Website preview',
    complex: true,
    contextKeys: ['Plan', 'TaskBoard', 'SelectedDesign', 'DesignDirection', 'PageContent'],
    task: 'Build the final production customer website using the selected design direction, colour palette, approved pages, approved sections, page content pack, and Bootstrap 5.3 + MicroAgency Layout Engine patterns. Use the supplied MicroAgency capability context and leverage the available section library, layout primitives, reusable components, Bootstrap behaviours, colour palette presets, typography presets, semantic theme tokens, and placeholder images. Compose pages as ordered website sections first, then use components inside those sections: header, footer, hero text, button groups, service cards, feature cards, pricing cards, testimonials, portfolio cards, blog cards, team cards, FAQ accordions, contact/newsletter forms, gallery grids, stats, process steps, logo strips, map/location blocks, and alerts. You may add a custom section, custom palette, custom typography pairing, or custom component if the available system does not fit the brief, but keep it consistent with the MicroAgency section architecture and accessible theme tokens. Include Bootstrap 5.3 CSS and bootstrap.bundle JS from jsDelivr in every HTML document, then add local CSS variables and theme overrides. The header must be a Bootstrap responsive navbar using navbar-expand-md, navbar-toggler, collapse navbar-collapse, navbar-nav, nav-item, nav-link, aria labels, and a visible hamburger menu on mobile. For Launch Site only: return one complete single-file HTML document starting with <!doctype html>; navigation links must use one-page section hashes such as href="#services" with matching id="services". For Growth Site and Signature Site: return JSON only with shape {"kind":"microagency-site-package-v1","entry":"index.html","files":{"index.html":"<!doctype html>...","about.html":"<!doctype html>...","contact.html":"<!doctype html>..."}}. Growth/Signature must create one separate .html file for every approved page, with Home as index.html; navigation must use normal file links such as href="about.html" and href="contact.html", not hashes, not #/ routes, and not hidden page panels. Each file must be a full standalone HTML document with its own <style> and visible navigation. Build each approved page as a substantial production page with its own hero or intro, detailed body sections, proof, useful copy, and CTA; do not make pages a single generic card grid. If the brief is thin, use sensible common industry content and dummy production details. Do not include agency-facing labels such as example, sample, concept, preview, customer website, visual direction, or design direction inside the customer site; responsive mobile-first layout; strong conversion copy; clear CTAs; accessible semantic markup; polished modern design. Use local /placeholders assets where imagery is useful.',
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
