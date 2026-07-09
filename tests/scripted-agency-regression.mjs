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
  assert.ok(review.savedStandardModelCalls >= 8, `expected large call reduction, got ${review.savedStandardModelCalls}`);
  assert.match(review.after.join('\n'), /Website HTML: scripted/);
  assert.match(review.after.join('\n'), /cheap model/);
}

testScriptedPreviewPath();
testCheapModelRouting();
testAutomationReviewBudget();
console.log('Scripted agency regression tests passed.');
