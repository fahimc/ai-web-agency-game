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
