# Placeholder images

These local placeholder images are used by MicroAgency design directions, generated sites, and template previews.

## Legacy images

The top-level JPG files are the original Unsplash placeholder set used before the larger image library was added.

- `business-team.jpg`
- `office-workspace.jpg`
- `restaurant-table.jpg`
- `wellness-studio.jpg`
- `tech-product.jpg`
- `premium-interior.jpg`
- `event-audience.jpg`
- `education-laptop.jpg`
- `creative-studio.jpg`
- `community-impact.jpg`

## Generated category library

The larger generated library lives in `/placeholders/library/` and is indexed by:

- `/placeholders/library.json`
- `src/data/placeholderImageLibrary.js`
- `docs/placeholder-images.md`

The current library contains keyworded LoremFlickr Creative Commons placeholder photos across common website categories such as business, trades, restaurant, wellness, SaaS, legal, finance, property, ecommerce, fashion, events, travel, charity, and community.

Run `node tools/download-placeholder-images.mjs` to refresh the category library.
