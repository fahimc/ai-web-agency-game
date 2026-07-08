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
assets/js/theme/color-convert.js
assets/js/theme/contrast.js
assets/js/theme/scale-generator.js
assets/js/theme/palette-presets.js
assets/js/theme/theme-generator.js
assets/js/theme/theme-validator.js
assets/js/theme/font-presets.js
assets/js/theme/theme-exporter.js
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

## Theme Generator

The theme system creates accessible semantic themes. AI-generated pages should use theme roles such as `primary`, `background`, `card`, and `mutedForeground`; they should not manually invent foreground/background pairs for each component.

Every generated theme includes these semantic tokens:

```text
background, foreground, surface, surfaceForeground, card, cardForeground,
primary, primaryForeground, secondary, secondaryForeground, accent,
accentForeground, muted, mutedForeground, border, success,
successForeground, warning, warningForeground, danger, dangerForeground
```

The generator also adds compatibility aliases such as `colorPrimary`, `colorBg`, and `colorText` so older engine CSS still works.

### Generate From Preset

```js
const theme = MicroAgencyTheme.generator.generateTheme('saas-blue');
MicroAgencyTheme.exporter.injectTheme(theme);
```

### Generate 100 Valid Random Themes

```js
const themes = MicroAgencyTheme.generator.generateManyThemes(100);
```

### Validate A Theme

```js
const report = MicroAgencyTheme.validator.validateTheme(theme);
console.table(report.report);
```

### Repair A Theme

```js
const repaired = MicroAgencyTheme.validator.repairTheme(theme);
```

### Apply A Theme To A Static Page

```js
const preset = MicroAgencyTheme.palettePresets.find((item) => item.category === 'local business');
const theme = MicroAgencyTheme.generator.generateLightTheme(preset);
MicroAgencyTheme.exporter.injectTheme(theme);
```

### Export CSS Variables

```js
const css = MicroAgencyTheme.exporter.themeToCssVariables(theme);
```

Output:

```css
:root {
  --background: #ffffff;
  --foreground: #0f172a;
  --surface: #f8fafc;
  --surface-foreground: #0f172a;
  --primary: #2563eb;
  --primary-foreground: #ffffff;
  --accent: #14b8a6;
  --accent-foreground: #042f2e;
  --muted: #f1f5f9;
  --muted-foreground: #475569;
  --border: #e2e8f0;
  --font-heading: Inter, ui-sans-serif, system-ui, sans-serif;
  --font-body: Inter, ui-sans-serif, system-ui, sans-serif;
}
```

### Add A Palette Preset

Add an object to `assets/js/theme/palette-presets.js`:

```js
{
  id: 'clinic-calm',
  name: 'Clinic Calm',
  category: 'healthcare',
  primary: '#0f766e',
  secondary: '#164e63',
  accent: '#f97316',
  mood: ['calm', 'trusted'],
  industries: ['clinics', 'therapy']
}
```

### Add A Typography Preset

Add an object to `assets/js/theme/font-presets.js`. Body text should stay at `16px` or larger, line height should stay between `1.5` and `1.75`, and small text should avoid thin weights.
