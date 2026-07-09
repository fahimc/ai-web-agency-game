#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildDesignSelectionMarkdown,
  buildExampleSite,
  fallbackDesignRecommendations,
  normalizePalette,
  recommendedStructure,
  siteLayouts,
} from '../src/data/siteBlueprints.js';
import { evaluateWebsiteQuality } from '../src/utils/siteQuality.js';
import { parseSitePackage } from '../src/utils/sitePackage.js';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const command = process.argv[2] || 'help';

if (command === 'generate') {
  await generateFromArgs(process.argv.slice(3));
} else if (command === 'smoke') {
  await runSmoke(process.argv.slice(3));
} else {
  printHelp();
}

function printHelp() {
  console.log(`MicroAgency AI CLI

Usage:
  npm run agency:cli -- generate --brief "Business: ..." --package growth --out cli-runs/demo
  npm run agency:cli:smoke

Commands:
  generate  Build one local customer website package and quality report.
  smoke     Build five representative websites and one aggregate review.
`);
}

async function generateFromArgs(args) {
  const options = parseArgs(args);
  const brief = options.brief || await readBrief(options.briefFile);
  if (!brief.trim()) throw new Error('Provide --brief or --brief-file.');
  const state = createState({
    brief,
    packageId: options.package || 'growth',
    layoutId: options.layout,
    palette: options.palette ? options.palette.split(',').map((color) => color.trim()) : null,
  });
  const result = await buildRun(state, options.out || join('cli-runs', safeId(state.projectName)));
  console.log(formatRunSummary(result));
}

async function runSmoke(args) {
  const options = parseArgs(args);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outRoot = resolve(root, options.out || join('cli-runs', `smoke-${timestamp}`));
  const cases = smokeCases();
  const results = [];
  for (const item of cases) {
    const state = createState(item);
    const result = await buildRun(state, join(outRoot, safeId(item.name)));
    results.push(result);
    console.log(formatRunSummary(result));
  }
  const review = aggregateReview(results);
  await writeFile(join(outRoot, 'review.md'), review);
  console.log(`\nWrote smoke review: ${join(outRoot, 'review.md')}`);
  if (results.some((result) => !result.quality.passed)) {
    process.exitCode = 1;
  }
}

async function readBrief(file) {
  if (!file) return '';
  return readFile(resolve(root, file), 'utf8');
}

function parseArgs(args) {
  const options = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    const next = args[index + 1];
    options[key] = next && !next.startsWith('--') ? next : true;
    if (options[key] === next) index += 1;
  }
  return options;
}

function createState({ brief, packageId = 'growth', layoutId = '', palette = null, name = '' }) {
  const selectedLayout = layoutId
    ? siteLayouts.find((layout) => layout.id === layoutId)
    : fallbackDesignRecommendations({ brief, projectPackage: packageId }, 4)[0] && siteLayouts.find((layout) => layout.id === fallbackDesignRecommendations({ brief, projectPackage: packageId }, 4)[0].layoutId);
  const layout = selectedLayout || siteLayouts[0];
  const structure = recommendedStructure(layout, { brief, projectPackage: packageId });
  const selectedPalette = normalizePalette(palette || layout.palette);
  return {
    email: 'cli@microagency.local',
    projectId: `cli_${Date.now().toString(36)}`,
    projectName: name || businessNameFromBrief(brief),
    brief,
    clientDetails: brief,
    paid: true,
    projectPackage: packageId,
    selectedDesignStyle: layout.id,
    selectedDesignPalette: selectedPalette,
    selectedSitePages: packageId === 'launch' ? ['Home'] : structure.pages,
    selectedSiteSections: structure.sections,
    outputs: {
      SelectedDesign: buildDesignSelectionMarkdown(layout, selectedPalette, structure),
    },
  };
}

async function buildRun(state, outDir) {
  const layout = siteLayouts.find((item) => item.id === state.selectedDesignStyle) || siteLayouts[0];
  const output = buildExampleSite(layout, state, state.selectedDesignPalette);
  const quality = evaluateWebsiteQuality(output, state);
  const sitePackage = parseSitePackage(output);
  const target = resolve(root, outDir);
  if (!target.startsWith(root)) throw new Error(`Refusing to write outside project: ${target}`);
  await mkdir(target, { recursive: true });

  if (sitePackage) {
    const siteDir = join(target, 'site');
    await mkdir(siteDir, { recursive: true });
    for (const [fileName, html] of Object.entries(sitePackage.files)) {
      await writeFile(join(siteDir, fileName), html);
    }
    await writeFile(join(target, 'site-package.json'), output);
  } else {
    await writeFile(join(target, 'index.html'), output);
  }

  await writeFile(join(target, 'selected-design.md'), state.outputs.SelectedDesign);
  await writeFile(join(target, 'quality-report.json'), JSON.stringify(quality, null, 2));
  await writeFile(join(target, 'summary.md'), runMarkdown({ state, layout, quality, sitePackage }));

  return {
    outDir: target,
    state,
    layout,
    quality,
    files: sitePackage ? Object.keys(sitePackage.files) : ['index.html'],
  };
}

function formatRunSummary(result) {
  return [
    '',
    `${result.state.projectName} (${result.state.projectPackage}, ${result.layout.name})`,
    `Output: ${result.outDir}`,
    `Files: ${result.files.join(', ')}`,
    `Quality: ${result.quality.passed ? 'PASS' : 'FAIL'} score ${result.quality.score}`,
    result.quality.failures.length ? `Failures: ${result.quality.failures.join(' | ')}` : 'Failures: none',
  ].join('\n');
}

function runMarkdown({ state, layout, quality, sitePackage }) {
  return [
    `# ${state.projectName}`,
    '',
    `Package: ${state.projectPackage}`,
    `Layout: ${layout.name}`,
    `Palette: ${state.selectedDesignPalette.join(', ')}`,
    `Files: ${sitePackage ? Object.keys(sitePackage.files).join(', ') : 'index.html'}`,
    `Quality: ${quality.passed ? 'PASS' : 'FAIL'} (${quality.score})`,
    '',
    '## Failures',
    quality.failures.length ? quality.failures.map((failure) => `- ${failure}`).join('\n') : '- None',
    '',
    '## Documents',
    ...quality.documents.map((document) => `- ${document.fileName}: score ${document.score}, ${document.wordCount} words, ${document.sectionCount} sections, ${document.headingCount} headings, ${document.ctaCount} CTAs`),
  ].join('\n');
}

function aggregateReview(results) {
  const passed = results.filter((result) => result.quality.passed).length;
  const failures = results.flatMap((result) => result.quality.failures.map((failure) => `${result.state.projectName}: ${failure}`));
  return [
    '# CLI Smoke Review',
    '',
    `Runs: ${results.length}`,
    `Passed: ${passed}`,
    `Failed: ${results.length - passed}`,
    '',
    '## Outputs',
    ...results.map((result) => `- ${result.state.projectName}: ${result.quality.passed ? 'PASS' : 'FAIL'} score ${result.quality.score}; ${result.files.length} files; ${result.outDir}`),
    '',
    '## Issues',
    failures.length ? failures.map((failure) => `- ${failure}`).join('\n') : '- None',
    '',
    '## Review Notes',
    '- The CLI uses the same deterministic fallback generation path as the app quality fallback.',
    '- Multi-page packages should produce separate HTML files for each selected page.',
    '- Generated pages should include Bootstrap mobile navigation, production wording, labelled forms, and rich motion hooks.',
  ].join('\n');
}

function smokeCases() {
  return [
    {
      name: 'BrightNest Plumbing',
      packageId: 'growth',
      brief: `Business: BrightNest Plumbing
Industry: local plumbing and heating
Audience: homeowners and landlords in Leeds
Goal: get emergency repair calls and boiler service enquiries
Offer: emergency plumbing, boiler servicing, leak repairs, bathroom fitting
Tone: trustworthy, fast, practical`,
    },
    {
      name: 'LedgerPilot',
      packageId: 'signature',
      brief: `Business: LedgerPilot
Industry: SaaS accounting automation
Audience: finance teams at growing UK startups
Goal: book product demos
Offer: invoice workflow automation, approvals, spend visibility, integrations
Tone: crisp, technical, confident`,
    },
    {
      name: 'Mira Bridal Studio',
      packageId: 'growth',
      brief: `Business: Mira Bridal Studio
Industry: wedding photography and bridal editorial studio
Audience: brides planning premium city weddings
Goal: showcase photography and get consultation enquiries
Offer: wedding photography, engagement shoots, albums, creative direction
Tone: elegant, editorial, warm`,
    },
    {
      name: 'Oak Table Kitchen',
      packageId: 'growth',
      brief: `Business: Oak Table Kitchen
Industry: restaurant and private dining venue
Audience: local diners, families, and private event organisers
Goal: increase bookings and private dining enquiries
Offer: seasonal British menu, Sunday roasts, private dining, wine evenings
Tone: warm, appetising, polished`,
    },
    {
      name: 'Northstar Tutors',
      packageId: 'launch',
      brief: `Business: Northstar Tutors
Industry: education and exam tutoring
Audience: parents of GCSE and A-level students
Goal: get trial lesson enquiries
Offer: maths tutoring, science tutoring, exam preparation, study planning
Tone: reassuring, structured, encouraging`,
    },
  ];
}

function businessNameFromBrief(brief) {
  const match = String(brief || '').match(/Business:\s*([^\n]+)/i);
  return match?.[1]?.trim() || 'CLI Website';
}

function safeId(value) {
  return String(value || 'run').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'run';
}
