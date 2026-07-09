import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildEngineCapabilityContext,
  buildExampleSite,
  siteLayouts,
} from '../src/data/siteBlueprints.js';
import {
  findPlaceholderImages,
  placeholderImageCategories,
  placeholderImageLibrary,
} from '../src/data/placeholderImageLibrary.js';
import { parseSitePackage } from '../src/utils/sitePackage.js';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

assert.ok(placeholderImageLibrary.length >= 150, `expected a large image library, got ${placeholderImageLibrary.length}`);
assert.ok(placeholderImageCategories.length >= 20, `expected broad category coverage, got ${placeholderImageCategories.length}`);

for (const image of placeholderImageLibrary) {
  assert.ok(image.path.startsWith('/placeholders/library/'), `${image.id} should use a local placeholder path`);
  assert.ok(image.alt, `${image.id} should include alt text`);
  assert.ok(image.category, `${image.id} should include a category`);
  assert.ok(image.slots?.length, `${image.id} should include section slots`);
  assert.ok(existsSync(join(root, 'public', image.path)), `${image.path} should exist on disk`);
}

const restaurantImages = findPlaceholderImages({
  text: 'restaurant private dining chef menu venue',
  category: 'restaurant',
  slot: 'hero',
  limit: 4,
});
assert.ok(restaurantImages.length >= 4, 'restaurant lookups should return multiple local images');
assert.ok(restaurantImages.every((image) => image.category === 'restaurant'), 'restaurant lookups should prioritise restaurant imagery');

const context = buildEngineCapabilityContext();
assert.match(context, /Generated local placeholder image library available/);
assert.match(context, /restaurant: Restaurant slots/);
assert.match(context, /\/placeholders\/library\/restaurant\//);

const layout = siteLayouts.find((item) => item.id === 'restaurant-venue');
const output = buildExampleSite(layout, {
  projectName: 'Oak Table Kitchen',
  projectPackage: 'growth',
  selectedSitePages: ['Home', 'Menu', 'Gallery', 'Contact'],
  brief: [
    'Business: Oak Table Kitchen',
    'Industry: restaurant and private dining venue',
    'Audience: local diners and private event organisers',
    'Goal: increase bookings',
    'Offer: seasonal menu, private dining, wine evenings',
  ].join('\n'),
});

const sitePackage = parseSitePackage(output);
assert.ok(sitePackage, 'growth package should produce separate HTML files');
const fullSiteHtml = Object.values(sitePackage.files).join('\n');
const localImageMatches = [...fullSiteHtml.matchAll(/\/placeholders\/library\/restaurant\/restaurant-\d+\.jpg/g)].map((match) => match[0]);
assert.ok(localImageMatches.length >= 3, 'generated restaurant site should use local restaurant placeholder images');
assert.ok(new Set(localImageMatches).size >= 3, 'generated restaurant site should use varied local restaurant imagery');

console.log('Placeholder image regression tests passed.');
