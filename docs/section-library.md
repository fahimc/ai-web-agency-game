# MicroAgency AI Section Library

The section library is the website-level building system for the static layout engine. It is designed for small LLMs to create production-ready static pages by editing structured page data.

## What A Section Is

A section is a reusable website block such as a hero, service grid, pricing cards, FAQ accordion, team grid, CTA band, or legal page. Sections are larger than atomic components. They contain layout, content, behaviour, and settings in one predictable object.

```js
{
  id: 'services',
  type: 'services-grid',
  variant: 'cards',
  layout: {
    container: 'lg',
    columns: { desktop: 3, tablet: 2, mobile: 1 },
    gap: 'lg',
    align: 'stretch'
  },
  content: {
    eyebrow: 'What we do',
    title: 'Website services for small businesses',
    text: 'Choose the right service for your next launch.',
    items: []
  },
  behaviour: { bootstrap: null },
  settings: {
    background: 'surface',
    paddingTop: 'xl',
    paddingBottom: 'xl'
  }
}
```

## Page Composition

A page is an ordered list of section objects:

```js
const page = {
  title: 'Example Site',
  description: 'A static website generated from sections.',
  theme: 'default',
  sections: [
    { id: 'header', type: 'header-with-cta', content: {} },
    { id: 'hero', type: 'hero-split', content: {} },
    { id: 'services', type: 'services-grid', content: {} },
    { id: 'footer', type: 'footer-standard', content: {} }
  ]
};
```

Render with:

```js
document.querySelector('#site-root').innerHTML = MicroAgencySections.renderPage(page);
```

The existing layout engine also delegates any section with a `type` field to `MicroAgencySections.renderSection(section)`.

## Add A New Section Type

1. Choose the closest existing category file in `assets/js/sections/`.
2. Add a renderer only if an existing section plus `variant` cannot express the need.
3. Register it:

```js
MicroAgencySections.register({
  'new-section-type': renderNewSectionType
});
```

Renderer functions should:

- Return safe HTML strings.
- Escape user-provided text with `MicroAgencySections.escapeHtml`.
- Use semantic HTML.
- Use Bootstrap classes and data attributes where useful.
- Use theme variables like `var(--background)`, `var(--foreground)`, `var(--primary)`, and matching foreground tokens.

## Add A Variant

Prefer variants over new section types:

```js
{
  type: 'services-grid',
  variant: 'image-cards'
}
```

Inside the renderer, branch on `section.variant` only for real visual or content structure differences. Do not create a new renderer for tiny details such as a button style or a card icon.

## Bootstrap Behaviour Mapping

The registry exposes `bootstrapBehaviourMap`:

```js
{
  'faq-accordion': 'accordion',
  'services-tabs': 'tabs',
  'features-tabs': 'tabs',
  'testimonials-carousel': 'carousel',
  'gallery-lightbox': 'modal',
  'team-bio-modal': 'modal',
  'header-offcanvas-mobile': 'offcanvas',
  'filter-sidebar-section': 'offcanvas',
  'form-success-message': 'toast',
  'article-table-of-contents': 'scrollspy'
}
```

Use Bootstrap through the `behaviour` object and generated markup. Do not create inaccessible custom accordions, tabs, carousels, modals, or offcanvas menus.

## Example Page Data

Example pages live in:

```text
assets/js/examples/microagency-homepage.js
assets/js/examples/local-business-site.js
assets/js/examples/service-business-site.js
assets/js/examples/restaurant-site.js
assets/js/examples/portfolio-site.js
```

Each file adds a page object to `window.MicroAgencySectionExamples`.

## LLM Authoring Guide

Rules for the AI when creating pages:

- Choose from existing section types first.
- Prefer variants instead of inventing new section types.
- Use semantic content fields.
- Do not manually write raw HTML unless absolutely necessary.
- Use validated theme tokens.
- Use Bootstrap behaviours only through the `behaviour` object.
- Do not use inaccessible accordions, tabs, or modals.
- Always include alt text for images.
- Keep pages as ordered arrays of section objects.
- Keep content short, clear, and business-focused.

## Implemented Core Sections

The first production-ready set includes:

`header-with-cta`, `footer-standard`, `hero-centered`, `hero-split`, `hero-with-form`, `intro-centered`, `intro-two-column`, `services-grid`, `services-tabs`, `features-grid`, `features-bento`, `features-tabs`, `process-numbered-cards`, `process-timeline`, `pricing-cards`, `pricing-comparison`, `testimonials-grid`, `testimonials-carousel`, `logo-strip`, `portfolio-grid`, `gallery-grid`, `cta-band`, `cta-split`, `contact-form-split`, `contact-details-cards`, `faq-accordion`, `team-grid`, `stats-bar`, `blog-card-grid`, `article-body`, `areas-served`, `opening-hours`, `multi-step-form`, `legal-page`, `thank-you-section`, and `404-section`.

Other requested section types are registered as placeholders so an LLM can discover that the type exists without assuming it is production-ready.
