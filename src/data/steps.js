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
    task: 'Create the final design direction for a high-converting responsive website using the selected design direction, colour palette, pages, sections, and MicroAgency Blocks component system. Include layout, section order, visual style, typography feel, UX notes, microcopy guidance, accessibility notes and mobile-first considerations. Treat the selected pages and sections as client-approved unless the brief makes one impossible.',
  },
  {
    key: 'WebsiteHTML',
    employee: 'dev',
    progress: 70,
    quest: 'Website preview',
    complex: true,
    contextKeys: ['Plan', 'TaskBoard', 'SelectedDesign', 'DesignDirection'],
    task: 'Build the final production customer website as one complete single-file HTML document using the selected design direction, colour palette, approved pages, approved sections, and MicroAgency Blocks component system. Requirements: return only valid HTML starting with <!doctype html>; include all CSS inside <style>; no external libraries; include a visible navigation menu. For Launch Site, navigation links must use one-page section hashes such as href="#services" with matching id="services". For Growth Site and Signature Site, navigation must behave like multiple pages inside the single HTML file: use page routes such as href="#/pricing", create matching page containers such as id="pricing", and show one page at a time with a small inline script. Create real content for every approved page even if sensible dummy production copy is needed; do not include agency-facing labels such as example, sample, concept, preview, customer website, visual direction, or design direction inside the customer site; responsive mobile-first layout; strong conversion copy; clear CTAs; accessible semantic markup; polished modern design. Use local /placeholders assets where imagery is useful.',
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
