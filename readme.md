# MicroAgency AI

MicroAgency AI is a responsive React/Vite app that presents an AI web agency as a virtual office. A customer completes intake, selects a package, pays or applies a voucher, chooses a design direction, reviews the generated site, requests revisions, and receives a handover pack.

Production site:

```text
https://ai-web-agency.netlify.app
```

GitHub:

```text
https://github.com/fahimc/ai-web-agency-game
```

## Features

- Pixel-art virtual office with staff desks, speech bubbles, pan/zoom, mobile framing, and employee inspection.
- Returning and new customer flows saved by email in browser `localStorage`.
- Multi-project support per customer email.
- Project export and delete controls in **Office Menu > Projects**.
- Structured client intake form for business name, industry, audience, goal, offer, tone, pages, and must-haves.
- Three customer-facing packages: `Launch Site`, `Growth Site`, and `Signature Site`.
- PayPal checkout through Netlify Functions.
- Voucher field in payment for approved voucher codes.
- Post-payment design direction picker led by Mira Sol, the designer.
- 3-4 recommended design directions per brief with previous/next navigation.
- Full-screen preview for each proposed client site example.
- Colour palette recommendations plus custom colour selection, capped at five colours.
- Recommended pages and sections from presets, with client add/remove controls.
- Local placeholder image assets used by templates and design previews.
- AI generation through Netlify `openai-response` function.
- Website preview approval and revision loop.
- QA notes and PDF handover generation.

## Customer Flow

1. Nova asks whether the visitor is a new or returning customer.
2. Returning customers enter an email and choose a saved project.
3. Existing projects automatically resume to the correct next step instead of opening the menu.
4. New customers enter an email and complete the project details form.
5. Nova presents three package options explaining what the agency will do and deliver.
6. Customer selects a package and completes PayPal checkout or applies a voucher.
7. Mira presents recommended design directions, colour palettes, pages, and sections.
8. Customer selects a direction and structure.
9. The agency generates strategy, task board, design direction, and website preview.
10. Customer approves the preview or requests revisions.
11. QA completes handover notes and a PDF pack.

## Design System And Templates

The design picker is powered by `src/data/siteBlueprints.js`, and the reusable static layout engine lives in:

```text
public/static-site-engine/
```

It contains:

- `Bootstrap 5.3 + MicroAgency Layout Engine` component and layout notes.
- A section-based architecture: `Page -> Sections -> Layouts -> Components -> Content`.
- A working static engine with `renderPage(pageData)`, `renderSection(section)`, `renderLayout(layout, content)`, `renderComponent(component)`, `getLayoutClass(layout)`, and `applyTheme(theme)`.
- CSS tokens for spacing, container widths, type scale, radius, shadows, colours, breakpoints, gaps, buttons, cards, and themes.
- An accessible colour palette and typography theme generator with semantic tokens, WCAG contrast validation, repair, 30 palette presets, font presets, CSS variable export, and local theme save/load.
- A section library with registry-driven website sections, Bootstrap behaviour mapping, 36 production section renderers, placeholder stubs for the wider section catalogue, and example page data for common site types.
- Layout primitives including single-column, wide single-column, two-column ratios, asymmetric, sidebar, three-column, responsive card grid, bento grid, split hero, centered hero, full-width media, masonry, horizontal scroller, stack, cluster, cover, and CTA band.
- Reusable components including header, footer, hero text, button groups, service/feature/pricing/testimonial/portfolio/blog/team cards, FAQ accordion, contact/newsletter forms, gallery, stats, process steps, logo strip, map/location, and notices.
- Page templates for homepage, about, services, service detail, contact, pricing, portfolio, case study, blog listing, blog article, landing page, local business, location, team, FAQ, testimonials, gallery, product overview/detail, booking, legal pages, thank you, and 404.
- Common layout directions such as local service, SaaS product, premium editorial, portfolio, restaurant/venue, wellness, event, marketplace, nonprofit, and education.
- Brief-aware recommendations for design direction.
- Colour palette recommendations.
- Page presets such as `Home`, `Services`, `Pricing`, `Gallery`, `FAQ`, and `Contact`.
- Section presets such as `Hero`, `Services`, `Process`, `Testimonials`, `Pricing`, `Lead capture form`, and `Final CTA`.
- Preview HTML generation for example client sites.
- A licensed template reference library generated from 25 MIT Start Bootstrap repositories.
- A compact LLM knowledge file at `src/data/templateLibrary.js` describing available templates, use cases, section patterns, Bootstrap components, and motion patterns.
- A reusable generated-site motion layer at `src/data/siteMotion.js` for scroll reveal, staggered cards, parallax media, floating panels, and reduced-motion fallbacks.

Selected design choices are saved into the `SelectedDesign` output and passed into the final design/build prompts.

The static engine can be opened locally after `npm run dev` at:

```text
http://127.0.0.1:5173/static-site-engine/index.html
```

Small-model editing rule: add new pages or sections by changing `public/static-site-engine/assets/js/site-data.js`; only add new renderers in `components.js` when an existing component cannot express the content.

## Licensed Template Library

The project includes a local reference library of license-checked website templates:

```text
template-library/
  templates.json
  vendor/
src/data/templateLibrary.js
tools/template-source-manifest.json
tools/audit-template-sources.mjs
tools/download-template-library.mjs
tools/generate-template-knowledge.mjs
```

Use these scripts to audit, download, and regenerate the LLM catalogue:

```bash
npm run templates:audit
npm run templates:download
npm run templates:generate
npm run templates:sync
```

The downloaded templates are reference material for composition, section patterns, Bootstrap behaviours, and motion ideas. Generated customer sites should still be rebuilt through MicroAgency sections, validated theme tokens, accessible Bootstrap markup, local placeholder/client imagery, and original client-specific copy.

## Placeholder Images

Local placeholder assets live in:

```text
public/placeholders/
```

Included image categories:

- business/team
- office/workspace
- restaurant
- wellness
- tech/product
- premium/interior
- event
- education
- creative studio
- community/nonprofit

The images are downloaded from Unsplash and documented in `public/placeholders/README.md`. Template previews reference local `/placeholders/...` paths so generated examples do not depend on remote image URLs.

## Project Structure

```text
index.html
netlify.toml
netlify/
  functions/
    _paypal.cjs
    openai-response.cjs
    paypal-capture-order.cjs
    paypal-config.cjs
    paypal-create-order.cjs
public/
  placeholders/
  static-site-engine/
    index.html
    pages/
    assets/
      css/
      js/
docs/
  section-library.md
  template-library.md
template-library/
  templates.json
  vendor/
src/
  App.jsx
  main.jsx
  styles.css
  components/
    ChatDock.jsx
    DesignOptionsModal.jsx
    DetailsModal.jsx
    Hud.jsx
    MenuModal.jsx
    Modal.jsx
    OfficeScene.jsx
    OutputsModal.jsx
    PackageModal.jsx
    PauseModal.jsx
    PaymentModal.jsx
    Toast.jsx
    WorkerModal.jsx
  data/
    employees.js
    outputs.js
    siteMotion.js
    siteBlueprints.js
    templateLibrary.js
    steps.js
  game/
    OfficeCanvasEngine.js
  hooks/
    useAgencyController.js
  services/
    modelClient.js
    netlify.js
    openai.js
    storage.js
  utils/
    pdf.js
    pricing.js
    text.js
  workers/
    modelWorker.js
```

## Local Development

Install dependencies:

```bash
npm install
```

Run the Vite dev server:

```bash
npm run dev
```

Build production assets:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Deployment

The project is configured for Netlify.

```bash
npm run build
netlify deploy --prod --dir dist --functions netlify/functions
```

Useful scripts:

```bash
npm run netlify:status
npm run deploy
npm run deploy:prod
```

The current Netlify app uses:

```text
Site: ai-web-agency
Production URL: https://ai-web-agency.netlify.app
```

## Environment Variables

Set these in Netlify for production:

```text
OPENAI_API_KEY
PAYPAL_CLIENT_ID
PAYPAL_CLIENT_SECRET
PAYPAL_ENV
```

`PAYPAL_ENV` should be `sandbox` or `live`.

## Payment And Voucher

Package pricing is defined in `src/utils/pricing.js` and mirrored in `netlify/functions/_paypal.cjs`.

Current packages:

- `Launch Site`
- `Growth Site`
- `Signature Site`

Voucher code:

```text
MICROAGENCY100
```

The voucher allows continuing without PayPal and is intended for approved testing or manual payment cases.

## Persistence

Project data is stored in browser `localStorage`.

Saved data includes:

- customer email and name
- project id and project name
- selected package and model
- payment state
- selected design direction, palette, pages, and sections
- project brief
- generated outputs
- task log and conversation log
- progress and phase

Projects can be resumed, exported as JSON, or deleted from **Office Menu > Projects**.

## Notes

- The app is a static frontend with Netlify Functions for server-side API work.
- The OpenAI API key should not be exposed in the browser in production.
- Vite currently reports a large chunk warning during build because PDF/html libraries are bundled into the app.
