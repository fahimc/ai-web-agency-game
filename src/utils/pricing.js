export const MAX_REVISIONS = 3;
export const STATIC_VOUCHER_CODE = 'MICROAGENCY100';

export const MODEL_OPTIONS = [
  {
    id: 'gpt-5.4-mini',
    label: 'GPT-5.4 mini',
    inputUsdPerM: 0.75,
    outputUsdPerM: 4.50,
  },
  {
    id: 'gpt-5.4',
    label: 'GPT-5.4',
    inputUsdPerM: 2.50,
    outputUsdPerM: 15.00,
  },
  {
    id: 'gpt-5.5',
    label: 'GPT-5.5',
    inputUsdPerM: 5.00,
    outputUsdPerM: 30.00,
  },
];

export const PACKAGE_OPTIONS = [
  {
    id: 'launch',
    name: 'Launch Site',
    modelId: 'gpt-5.4-mini',
    priceGbp: 1,
    summary: 'A sharp one-page starter website for a new customer who needs a fast, credible online presence.',
    steps: [
      'We turn the brief into a simple page plan and section order.',
      'The designer sets the visual direction, tone, and responsive layout.',
      'The developer builds the website preview and the QA pass checks mobile fit, copy, and download files.',
    ],
    produces: [
      'Single-page responsive HTML website',
      'Core sections such as hero, services, about, and contact',
      'QA notes and handover PDF',
    ],
  },
  {
    id: 'growth',
    name: 'Growth Site',
    modelId: 'gpt-5.4',
    priceGbp: 3,
    summary: 'A fuller small-business website pack with stronger structure, richer page sections, and conversion copy.',
    steps: [
      'We shape the offer, audience, page structure, and calls to action from the brief.',
      'The design pass creates a more detailed content journey and visual system.',
      'The build pass produces a polished responsive site, then QA packages the handover.',
    ],
    produces: [
      'Responsive website with deeper content sections',
      'Stronger conversion copy and trust-building blocks',
      'QA notes, revision allowance, and handover PDF',
    ],
  },
  {
    id: 'signature',
    name: 'Signature Site',
    modelId: 'gpt-5.5',
    priceGbp: 5,
    summary: 'A premium generation pass for customers who want more strategic detail, stronger polish, and richer handover.',
    steps: [
      'We produce a more strategic plan covering positioning, journey, and customer objections.',
      'The designer develops a premium direction with section-level detail for the build.',
      'The developer creates the highest-detail preview and QA prepares a comprehensive handover pack.',
    ],
    produces: [
      'Premium responsive website preview',
      'Detailed strategy, design direction, and conversion-focused content',
      'Full QA notes, revision allowance, and project handover PDF',
    ],
  },
];

const BASE_USAGE = {
  inputTokens: 33500,
  outputTokens: 12800,
};

const REVISION_USAGE = {
  inputTokens: 16000,
  outputTokens: 7000,
};

export function modelOption(modelId) {
  return MODEL_OPTIONS.find((model) => model.id === modelId) || MODEL_OPTIONS[0];
}

export function packageOption(packageId) {
  return PACKAGE_OPTIONS.find((item) => item.id === packageId) || PACKAGE_OPTIONS[0];
}

export function packageForModel(modelId) {
  return PACKAGE_OPTIONS.find((item) => item.modelId === modelId) || PACKAGE_OPTIONS[0];
}

export function estimateAiCost(modelId, usdToGbp = 0.79, revisionCount = MAX_REVISIONS) {
  const model = modelOption(modelId);
  const modelIndex = Math.max(0, MODEL_OPTIONS.findIndex((item) => item.id === model.id));
  const revisionTotal = {
    inputTokens: REVISION_USAGE.inputTokens * revisionCount,
    outputTokens: REVISION_USAGE.outputTokens * revisionCount,
  };
  const baseUsd = usageUsd(BASE_USAGE, model);
  const revisionUsd = usageUsd(REVISION_USAGE, model);
  const totalUsd = baseUsd + usageUsd(revisionTotal, model);
  const totalGbp = totalUsd * Number(usdToGbp || 0.79);
  const roundedGbp = Math.max(1, Math.round(totalGbp));
  const publicPriceGbp = Math.max(1 + modelIndex * 2, roundedGbp);
  return {
    model,
    maxRevisions: revisionCount,
    baseUsage: BASE_USAGE,
    revisionUsage: REVISION_USAGE,
    baseUsd,
    baseGbp: baseUsd * Number(usdToGbp || 0.79),
    revisionUsd,
    revisionGbp: revisionUsd * Number(usdToGbp || 0.79),
    totalUsd,
    totalGbp,
    roundedGbp,
    publicPriceGbp,
  };
}

function usageUsd(usage, model) {
  return (usage.inputTokens / 1_000_000) * model.inputUsdPerM
    + (usage.outputTokens / 1_000_000) * model.outputUsdPerM;
}
