# MicroAgency AI Static Layout Engine

This folder contains a reusable static website layout engine for AI-generated business websites.

The architecture is:

```text
Page -> Sections -> Layouts -> Components -> Content
```

A small LLM should add or edit pages by changing `assets/js/site-data.js`. It should prefer JSON-like page objects over hand-coding HTML.

## Files

```text
index.html
pages/about.html
pages/services.html
pages/contact.html
assets/css/tokens.css
assets/css/base.css
assets/css/layouts.css
assets/css/components.css
assets/css/theme.css
assets/js/site-data.js
assets/js/layout-engine.js
assets/js/components.js
assets/js/main.js
```

## How To Add A Page

1. Add a new entry to `MicroAgencySiteData.pages`.
2. Set `title`, `description`, `theme`, and an ordered `sections` array.
3. Copy one of the simple HTML wrappers in `pages/` and set `body data-page="your-page-id"`.

## How To Add A Section

Add an object like this to a page:

```js
{
  id: 'services',
  kind: 'services',
  layout: { type: 'card-grid', container: 'lg', minCardWidth: '260px', maxColumns: 3 },
  spacing: 'lg',
  background: 'default',
  content: {
    eyebrow: 'Services',
    heading: 'What we can build',
    items: [
      { component: 'service-card', icon: 'B', title: 'Brochure site', description: 'A clear static website.', href: './pages/services.html' }
    ]
  }
}
```

## How To Add A Layout

1. Add CSS to `assets/css/layouts.css`.
2. Add or update rendering in `renderLayout()` inside `assets/js/layout-engine.js`.
3. Keep the layout mobile-first and responsive.

## How To Add A Component

1. Add a renderer to `MicroAgencyComponents` in `assets/js/components.js`.
2. Use the component from section `content.items`.
3. Keep markup semantic and Bootstrap-compatible.

## Layout Decision Rules

- Hero with media: `split-hero`.
- Hero without media: `centered-hero`.
- Three or more repeated items: `card-grid`.
- Legal or article content: `single-column`.
- Sidebar content: `sidebar`.
- Gallery: `masonry`.
- Feature sections with more than four items: `bento-grid`.
- CTA: `cta-band`.
- Tags/buttons/badges: `cluster`.
- Vertical lists: `stack`.
