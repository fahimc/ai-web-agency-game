# Template Library

MicroAgency AI uses a local library of license-checked templates as design references for generated websites.

The library is not a raw site copier. Templates are used to teach the LLM common patterns such as hero composition, responsive navigation, portfolio grids, timelines, cards, forms, carousels, blog structures, ecommerce layouts, and dashboard shells.

## Files

```text
tools/template-source-manifest.json
tools/audit-template-sources.mjs
tools/download-template-library.mjs
tools/generate-template-knowledge.mjs
template-library/vendor/
template-library/templates.json
src/data/templateLibrary.js
```

## Workflow

```bash
npm run templates:sync
```

This runs:

1. `templates:audit` to check or confirm allowed licences.
2. `templates:download` to clone allowed template repositories into `template-library/vendor/`.
3. `templates:generate` to build a compact template catalogue for the app and LLM prompts.

## Licence Rule

Only import templates with explicit compatible licences such as MIT, Apache-2.0, BSD, or CC0.

Do not scrape arbitrary live websites. Public websites are not reusable template sources unless their licence allows it.

## LLM Authoring Rule

When generating a customer site, the LLM should:

- Read `downloadedTemplateSummary()` from `src/data/templateLibrary.js`.
- Pick relevant template references by use case and section pattern.
- Rebuild the output with MicroAgency sections and Bootstrap components.
- Use semantic theme tokens and validated contrast.
- Use original copy based on the client brief.
- Use local/client imagery and alt text.
- Add rich motion only through the MicroAgency motion system.
- Never include agency-facing labels such as example, sample, preview, customer website, visual direction, or design direction in the final site.

## Motion System

Generated sites can use:

- `reveal` for scroll entrance.
- `stagger` for card groups.
- `parallax-media` with `data-parallax`.
- `float-card` for subtle hero/media movement.
- `depth-panel` for layered visual depth.

The motion system respects `prefers-reduced-motion` and should be used for polish, not for essential content.
