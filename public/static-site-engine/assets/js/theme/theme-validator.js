window.MicroAgencyTheme = window.MicroAgencyTheme || {};
window.MicroAgencyTheme.validator = (() => {
  const contrast = window.MicroAgencyTheme.contrast;
  const color = window.MicroAgencyTheme.color;
  const corePairs = [
    ['foreground', 'background'],
    ['surfaceForeground', 'surface'],
    ['cardForeground', 'card'],
    ['primaryForeground', 'primary'],
    ['secondaryForeground', 'secondary'],
    ['accentForeground', 'accent'],
    ['mutedForeground', 'muted'],
    ['successForeground', 'success'],
    ['warningForeground', 'warning'],
    ['dangerForeground', 'danger'],
  ];

  function pickReadableForeground(background, candidates = ['#ffffff', '#0f172a', '#111827', '#020617']) {
    return candidates
      .map((candidate) => ({ color: color.normalizeHex(candidate), ratio: contrast.contrastRatio(candidate, background) }))
      .sort((a, b) => b.ratio - a.ratio)[0].color;
  }

  function getButtonTextColor(background) {
    return pickReadableForeground(background, ['#ffffff', '#f8fafc', '#0f172a', '#111827', '#020617']);
  }

  function ensureReadablePair(foreground, background, options = {}) {
    const aa = contrast.passesContrast(foreground, background, options);
    if (aa.pass) return { foreground: color.normalizeHex(foreground), background: color.normalizeHex(background), changed: false };
    const readable = pickReadableForeground(background);
    return { foreground: readable, background: color.normalizeHex(background), changed: true };
  }

  function contrastReport(theme) {
    const tokens = theme.tokens || theme;
    return corePairs.map(([fgKey, bgKey]) => {
      const foreground = tokens[fgKey];
      const background = tokens[bgKey];
      const ratio = contrast.contrastRatio(foreground, background);
      const aa = contrast.passesContrast(foreground, background, { level: 'AA' });
      const aaa = contrast.passesContrast(foreground, background, { level: 'AAA' });
      return {
        pair: `${fgKey} on ${bgKey}`,
        foreground,
        background,
        ratio: Number(ratio.toFixed(2)),
        aa: aa.pass,
        aaa: aaa.pass,
        suggestedFix: aa.pass ? '' : `Use ${pickReadableForeground(background)} or adjust ${bgKey} tone.`,
      };
    });
  }

  function validateTheme(theme) {
    const report = contrastReport(theme);
    return { ok: report.every((item) => item.aa), report };
  }

  function repairTheme(theme) {
    const next = { ...theme, tokens: { ...(theme.tokens || theme) } };
    corePairs.forEach(([fgKey, bgKey]) => {
      const repaired = ensureReadablePair(next.tokens[fgKey], next.tokens[bgKey]);
      next.tokens[fgKey] = repaired.foreground;
      if (contrast.passesContrast(next.tokens[fgKey], next.tokens[bgKey]).pass) return;
      const scaleName = bgKey.replace(/background|surface|card|muted/i, 'neutral').replace(/Foreground$/, '');
      const scale = next.scales?.[scaleName] || next.scales?.neutral || {};
      const candidate = Object.values(scale).find((shade) => contrast.passesContrast(next.tokens[fgKey], shade).pass);
      if (candidate) next.tokens[bgKey] = candidate;
      next.tokens[fgKey] = pickReadableForeground(next.tokens[bgKey]);
    });
    next.contrastReport = contrastReport(next);
    next.valid = next.contrastReport.every((item) => item.aa);
    return next;
  }

  return { corePairs, pickReadableForeground, getButtonTextColor, ensureReadablePair, contrastReport, validateTheme, repairTheme };
})();
