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
    task: 'Create the final design direction for a high-converting responsive website using the selected design direction, colour palette, and MicroAgency Blocks component system. Include layout, section order, visual style, typography feel, UX notes, microcopy guidance, accessibility notes and mobile-first considerations. Do not switch to a different layout style unless the brief makes the selected direction impossible.',
  },
  {
    key: 'WebsiteHTML',
    employee: 'dev',
    progress: 70,
    quest: 'Website preview',
    complex: true,
    contextKeys: ['Plan', 'TaskBoard', 'SelectedDesign', 'DesignDirection'],
    task: 'Build a complete production-quality single-file HTML landing page for the client using the selected design direction, colour palette, and MicroAgency Blocks component system. Requirements: return only valid HTML starting with <!doctype html>; include all CSS inside <style>; no external libraries; responsive mobile-first layout; strong conversion copy; clear CTAs; accessible semantic markup; sections based on the project intake form; polished modern design. Use the selected layout as the structure, not just inspiration.',
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
