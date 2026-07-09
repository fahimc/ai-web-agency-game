# Website Quality Review

## Why the generated sites were weak

1. The production flow asks the LLM to use the MicroAgency section engine, but it does not require a structured section JSON output. The model can still return arbitrary HTML.
2. The richer static-site engine in `public/static-site-engine` is mostly documentation/runtime sample code. The React production fallback still uses `buildExampleSite()` from `src/data/siteBlueprints.js`.
3. The old WebsiteHTML quality gate checked only complete HTML, required files, responsive nav, and banned preview wording. A thin page with one generic section could pass.
4. The fallback pages were too shallow. Home had only a few sections, and non-home pages were often a single section.
5. Page content was generated separately, but the fallback generator did not deeply use it to build substantial page bodies.
6. Forms in the fallback used placeholders instead of visible labels.
7. Animation and interaction patterns were limited to Bootstrap basics.

## Changes made in this pass

- Added a production website quality evaluator in `src/utils/siteQuality.js`.
- WebsiteHTML now falls back when output is too thin, lacks sections, has weak CTA structure, misses mobile nav, or includes agency-facing wording.
- Strengthened fallback site generation with fuller home pages, multi-section subpages, proof, FAQs, final CTAs, accessible labelled forms, and small reduced-motion-safe entrance animation.

## Template import strategy

Do not scrape or copy arbitrary live commercial websites. Public visibility does not mean reuse rights.

Use only sources with explicit compatible licences, preferably MIT/Apache/BSD/CC0. Store the source URL, licence, commit/tag, attribution, and import date. Convert source templates into MicroAgency section recipes and design heuristics rather than shipping copied site pages.

High-value safe starting points:

- Start Bootstrap: MIT-licensed Bootstrap templates.
- Individual Start Bootstrap repos such as Business Frontpage and Modern Business.
- MIT-licensed GitHub template repos discovered from `bootstrap-5-template`, `html-template`, and `tailwind-template` topics after licence verification.

Avoid sources that restrict redistribution/resale or use GPL unless the product is prepared to comply with GPL obligations. Some high-quality free templates are not suitable for bundling in a commercial generator.

## Next recommended build work

1. Make the LLM output structured page data first: `theme`, `pages`, and `sections`, then render with the section engine.
2. Port the static section registry into an importable module used by the React fallback builder.
3. Build a template-source importer that verifies licence files before extracting sections.
4. Add Playwright screenshot checks for generated pages at mobile and desktop sizes.
5. Add per-industry template recipes: local service, restaurant, photographer, consultant, SaaS, healthcare, legal, beauty, events, education, charity, portfolio, trades, finance.
6. Add animation tokens and reusable motion presets: reveal, stagger, counter, carousel, sticky CTA, gallery lightbox, FAQ accordion, and offcanvas menu.
