import assert from 'node:assert/strict';
import { previewSteps, completionSteps } from '../src/data/steps.js';
import {
  aiAutomationReview,
  buildScriptedPageContent,
  cheapModelForTask,
  scriptAgencyStep,
  shouldScriptAgencyStep,
} from '../src/services/scriptedAgency.js';
import { selectModelForRequest } from '../src/services/openai.js';
import { evaluateWebsiteQuality } from '../src/utils/siteQuality.js';
import { parseSitePackage } from '../src/utils/sitePackage.js';

function baseState(overrides = {}) {
  return {
    projectName: 'Oak Table Kitchen',
    projectPackage: 'growth',
    projectModel: 'gpt-5.5',
    selectedDesignStyle: 'restaurant-venue',
    selectedDesignPalette: ['#2f1b12', '#c2410c', '#fff7ed', '#f59e0b', '#ffffff'],
    selectedSitePages: ['Home', 'Menu', 'Gallery', 'Events', 'Contact'],
    selectedSiteSections: ['Hero', 'Featured products', 'Gallery', 'Testimonials', 'Location map', 'FAQ', 'Final CTA'],
    settings: {
      selectedModel: 'gpt-5.5',
      fastModel: 'gpt-4.1-mini',
      complexModel: 'gpt-4.1',
    },
    brief: [
      'Business: Oak Table Kitchen',
      'Industry: restaurant and private dining venue',
      'Audience: local diners, families, and private event organisers',
      'Goal: increase bookings and private dining enquiries',
      'Offer: seasonal British menu, Sunday roasts, private dining, wine evenings',
      'Tone: warm, appetising, polished',
    ].join('\n'),
    outputs: {},
    ...overrides,
  };
}

function testScriptedPreviewPath() {
  const state = baseState();
  const scriptableKeys = previewSteps.filter((step) => shouldScriptAgencyStep(step, state)).map((step) => step.key);
  assert.deepEqual(scriptableKeys, ['Plan', 'TaskBoard', 'DesignDirection', 'WebsiteHTML']);

  for (const step of previewSteps) {
    if (step.key === 'WebsiteHTML') {
      state.outputs.PageContent = buildScriptedPageContent(state);
    }
    if (!shouldScriptAgencyStep(step, state)) continue;
    state.outputs[step.key] = scriptAgencyStep(step, state);
  }

  assert.match(state.outputs.Plan, /Commercial Strategy/);
  assert.match(state.outputs.TaskBoard, /Production Task Board/);
  assert.match(state.outputs.DesignDirection, /Restaurant \/ Venue/);

  const packageOutput = parseSitePackage(state.outputs.WebsiteHTML);
  assert.ok(packageOutput, 'growth package should be a multi-file site package');
  assert.deepEqual(Object.keys(packageOutput.files), ['index.html', 'menu.html', 'gallery.html', 'events.html', 'contact.html']);

  const quality = evaluateWebsiteQuality(state.outputs.WebsiteHTML, state);
  assert.equal(quality.passed, true, quality.failures.join(' '));

  const qaStep = completionSteps.find((step) => step.key === 'QAReport');
  assert.equal(shouldScriptAgencyStep(qaStep, state), true);
  const qa = scriptAgencyStep(qaStep, state);
  assert.match(qa, /Quality result: Pass/);
}

function testCheapModelRouting() {
  const state = baseState();
  assert.equal(cheapModelForTask('designRecommendations', state), 'gpt-4.1-mini');
  assert.equal(
    selectModelForRequest({ settings: state.settings, state, complex: true, modelOverride: cheapModelForTask('designRecommendations', state) }),
    'gpt-4.1-mini',
  );
  assert.equal(
    selectModelForRequest({ settings: state.settings, state, complex: true }),
    'gpt-5.5',
    'without override, paid package model remains available for genuinely complex custom work',
  );
}

function testAutomationReviewBudget() {
  const review = aiAutomationReview(baseState());
  assert.ok(review.beforeModelCalls > review.afterStandardModelCalls);
  assert.ok(review.savedStandardModelCalls >= 4, `expected call reduction, got ${review.savedStandardModelCalls}`);
  assert.match(review.after.join('\n'), /Page content pack: cheap model per approved page/);
  assert.match(review.after.join('\n'), /Website HTML: scripted/);
  assert.match(review.after.join('\n'), /cheap model/);
}

function photographyState(overrides = {}) {
  return baseState({
    projectName: 'Photography 101',
    projectPackage: 'growth',
    selectedDesignStyle: 'portfolio-studio',
    selectedDesignPalette: ['#111111', '#f5f5f5', '#ffffff', '#737373', '#e5e5e5'],
    selectedSitePages: ['Home', 'Services', 'About', 'Contact'],
    selectedSiteSections: ['Hero', 'Portfolio Grid', 'Services Grid', 'About Story', 'Testimonials', 'Contact Form'],
    brief: [
      'Business: Photography 101',
      'Industry: wedding photography studio',
      'Audience: brides and couples planning a wedding',
      'Goal: gain customers',
      'Offer: wedding photography, engagement shoots, albums, and timeline advice',
      'Tone: warm, editorial, reassuring',
    ].join('\n'),
    outputs: {
      PageContent: [
        '## Home',
        'Page objective: Help couples understand Photography 101 and enquire with confidence.',
        'Visitor intent: Couples want to see style, coverage, and whether the studio feels right for their wedding.',
        'Hero headline: Wedding photography with calm direction and editorial detail',
        'Hero support copy: Photography 101 captures the people, atmosphere, and small details of a wedding day with clear guidance before, during, and after the event.',
        '',
        'Content block 1: A focused wedding story',
        'Couples see a complete sense of the day, from preparations and ceremony moments to portraits, speeches, dance floor images, and quiet details.',
        'CTA idea: View wedding coverage',
        'Content block 2: Guidance before the day',
        'The studio helps with timings, group lists, venue light, and practical plans so the photography feels natural and organised.',
        'CTA idea: Plan the photography',
        'Content block 3: Albums and keepsakes',
        'Finished galleries can be turned into albums, parent books, and print collections that preserve the wedding beyond the online gallery.',
        'CTA idea: Ask about albums',
        'Trust and proof: Couples get clear communication, realistic timelines, and a photographer who keeps the day moving without taking over.',
        'Primary CTA: Check availability',
        '',
        '---',
        '',
        '## Services',
        'Page objective: Show the photography services couples can commission.',
        'Visitor intent: Couples want to compare coverage, engagement shoots, albums, and planning support.',
        'Hero headline: Wedding photography services shaped around your day',
        'Hero support copy: Choose the right coverage, add engagement portraits, and understand the album options before asking for a date check.',
        '',
        'Content block 1: Wedding day coverage',
        'Coverage can include morning preparations, ceremony, portraits, reception details, speeches, evening guests, and first dance depending on the plan.',
        'CTA idea: Compare coverage',
        'Content block 2: Engagement sessions',
        'A pre-wedding shoot helps couples get comfortable in front of the camera and creates images for invitations, websites, and guest books.',
        'CTA idea: Add a session',
        'Content block 3: Albums and prints',
        'Album design turns the finished gallery into a lasting story with layout guidance, paper choices, and parent book options.',
        'CTA idea: Ask about albums',
        'Trust and proof: Every service is explained with timings, deliverables, and next steps so couples can choose without pressure.',
        'Primary CTA: Request a date check',
        '',
        '---',
        '',
        '## About',
        'Page objective: Build confidence in the studio style and working approach.',
        'Visitor intent: Couples want to know who will be at the wedding and how the experience will feel.',
        'Hero headline: A calm studio for weddings that feel personal',
        'Hero support copy: Photography 101 combines gentle direction, observation, and practical planning so couples can enjoy the day while the important moments are covered.',
        '',
        'Content block 1: Calm on the day',
        'The photographer gives direction when it helps and steps back when moments need space, keeping portraits relaxed and the schedule moving.',
        'CTA idea: Meet the studio',
        'Content block 2: Clear communication',
        'Couples receive planning notes, timeline checks, and gallery expectations before the wedding, with simple handover after delivery.',
        'CTA idea: Ask a question',
        'Content block 3: Editorial but natural',
        'The style balances polished portraits, real emotion, venue atmosphere, and the small details couples planned carefully.',
        'CTA idea: View the style',
        'Trust and proof: The studio is built around reassurance, preparation, and a finished gallery that feels like the day.',
        'Primary CTA: Start an enquiry',
        '',
        '---',
        '',
        '## Contact',
        'Page objective: Make it easy to enquire about a wedding date.',
        'Visitor intent: Couples want to send the date, venue, and coverage needs quickly from mobile.',
        'Hero headline: Check your wedding date',
        'Hero support copy: Send the date, venue, rough timings, and the kind of coverage you want. Photography 101 will reply with availability and the most useful next step.',
        '',
        'Content block 1: What to include',
        'Share the wedding date, venue, guest count, ceremony time, and whether you are interested in albums or engagement portraits.',
        'CTA idea: Send details',
        'Content block 2: What happens next',
        'The studio checks availability, recommends a coverage route, and suggests a quick call if the date and style look like a good fit.',
        'CTA idea: Request availability',
        'Content block 3: No-pressure enquiry',
        'The first message is a fit check, not a commitment, so couples can ask practical questions before booking.',
        'CTA idea: Start the conversation',
        'Trust and proof: Clear replies, useful questions, and practical next steps help couples decide without confusion.',
        'Primary CTA: Send enquiry',
      ].join('\n'),
    },
    ...overrides,
  });
}

function testMultiPageUsesApprovedPagesAndCopy() {
  const state = photographyState();
  const output = scriptAgencyStep({ key: 'WebsiteHTML' }, state);
  const packageOutput = parseSitePackage(output);
  assert.ok(packageOutput, 'growth package should be a multi-file site package');
  assert.deepEqual(Object.keys(packageOutput.files), ['index.html', 'services.html', 'about.html', 'contact.html']);
  assert.match(packageOutput.files['services.html'], /Wedding photography services shaped around your day/);
  assert.match(packageOutput.files['about.html'], /A calm studio for weddings that feel personal/);
  assert.match(packageOutput.files['contact.html'], /Check your wedding date/);
  assert.match(packageOutput.files['index.html'], /class="brand-logo"/, 'final site should render a generated SVG business logo');
  assert.match(packageOutput.files['index.html'], /class="brand-logo" viewBox="0 0 520 112"/, 'navbar logo should use compact visible viewBox');
  assert.doesNotMatch(packageOutput.files['index.html'], /class="brand-logo" viewBox="0 0 1000 690"/, 'navbar logo must not use the large export artboard');
  assert.match(packageOutput.files['index.html'], /<text x="100"[^>]+fill="#111111">Photography 101<\/text>/, 'navbar wordmark should be readable on a light navbar');
  assert.match(packageOutput.files['index.html'], /Photography 101 logo/, 'generated logo should have accessible title text');
  assert.doesNotMatch(output, /href="#\/|href="#services"|Selected work and capabilities|Lead with|Explain what|Use this space/i);
  const quality = evaluateWebsiteQuality(output, state);
  assert.equal(quality.passed, true, quality.failures.join(' '));
}

function testMalformedMarkdownAndInternalSectionLabelsAreRemoved() {
  const state = photographyState({
    projectName: 'MakyMaky',
    selectedDesignStyle: 'local-service',
    selectedDesignPalette: ['#0f3d2e', '#2f7d62', '#faf8f1', '#d6b36a', '#ffffff'],
    selectedSitePages: ['Home', 'Services', 'Contact'],
    selectedSiteSections: ['Header with CTA', 'Hero Split with parallax', 'Services Grid', 'Features Bento', 'Portfolio Grid', 'Contact Form'],
    brief: [
      'Business: MakyMaky',
      'Industry: website development',
      'Audience: Professionals',
      'Goal: Show services clearly',
      'Offer: website development',
    ].join('\n'),
    outputs: {
      PageContent: [
        '## Home',
        '```markdown',
        '# Home Page Content for MakyMaky',
        'Page Objective To introduce MakyMaky as a premier creative website development studio in London.',
        '',
        'Hero headline: MakyMaky built to show services clearly',
        'Hero support copy: Website development from MakyMaky, explained in practical terms.',
        '',
        'Content block 1: Clear service strategy',
        'MakyMaky helps professional clients understand what kind of website they need, what content matters, and how the project should move from brief to launch.',
        'CTA idea: Discuss a project',
        '```',
        '',
        '---',
        '',
        '## Contact',
        '```markdown',
        '# Contact Page Content for MakyMaky',
        'Page Objective Facilitate clear, professional, and approachable communication between MakyMaky and potential clients.',
        'Hero headline: Contact MakyMaky',
        'Hero support copy: Send the project essentials and get a clear response.',
        'Content block 1: What to send',
        'Share the project type, timeline, goals, existing website, and any examples of sites you like.',
        'CTA idea: Send project details',
        '```',
      ].join('\n'),
    },
  });
  const output = scriptAgencyStep({ key: 'WebsiteHTML' }, state);
  const packageOutput = parseSitePackage(output);
  assert.ok(packageOutput, 'growth package should still be a multi-file package');
  const allHtml = Object.values(packageOutput.files).join('\n');
  assert.doesNotMatch(allHtml, /```|markdown|Page Objective|Visitor Intent|Content block|Hero support copy/i);
  assert.doesNotMatch(allHtml, /Header with CTA|Hero Split|Services Grid|Features Bento|Portfolio Grid|Contact Form/i);
  assert.match(packageOutput.files['index.html'], /class="brand-logo" viewBox="0 0 520 112"/, 'malformed-copy package should still render a visible compact logo');
  assert.match(packageOutput.files['index.html'], /MakyMaky built to show services clearly/);
  assert.match(packageOutput.files['contact.html'], /Send the project essentials and get a clear response/);
  const quality = evaluateWebsiteQuality(output, state);
  assert.equal(quality.passed, true, quality.failures.join(' '));
}

function testLaunchPackageStaysOnePage() {
  const state = photographyState({
    projectPackage: 'launch',
    selectedSitePages: ['Home', 'Services', 'About', 'Contact'],
    selectedSiteSections: ['Hero', 'Services', 'About', 'Contact details', 'Final CTA'],
  });
  const output = scriptAgencyStep({ key: 'WebsiteHTML' }, state);
  assert.equal(parseSitePackage(output), null, 'launch package should be a single HTML document');
  assert.match(output, /href="#services"/);
  assert.match(output, /id="services"/);
  assert.doesNotMatch(output, /services\.html|about\.html|contact\.html/);
}

testScriptedPreviewPath();
testCheapModelRouting();
testAutomationReviewBudget();
testMultiPageUsesApprovedPagesAndCopy();
testMalformedMarkdownAndInternalSectionLabelsAreRemoved();
testLaunchPackageStaysOnePage();
console.log('Scripted agency regression tests passed.');
