window.MicroAgencyTheme = window.MicroAgencyTheme || {};
window.MicroAgencyTheme.generator = (() => {
  const color = window.MicroAgencyTheme.color;
  const scale = window.MicroAgencyTheme.scale;
  const validator = window.MicroAgencyTheme.validator;
  const presets = window.MicroAgencyTheme.palettePresets;
  const fonts = window.MicroAgencyTheme.fontPresets;

  function generateLightTheme(seed = {}) {
    return generateTheme(seed, { mode: 'light' });
  }

  function generateDarkTheme(seed = {}) {
    return generateTheme(seed, { mode: 'dark' });
  }

  function generateThemePair(seed = {}) {
    return { light: generateLightTheme(seed), dark: generateDarkTheme(seed) };
  }

  function generateTheme(seed = {}, options = {}) {
    const resolved = resolveSeed(seed);
    const mode = options.mode || 'light';
    const scales = scale.generateScales(resolved);
    const font = pickFont(options.fontPreset || resolved.fontPreset || resolved.category);
    const tokens = mode === 'dark' ? darkTokens(scales) : lightTokens(scales);
    tokens.primaryForeground = validator.getButtonTextColor(tokens.primary);
    tokens.secondaryForeground = validator.getButtonTextColor(tokens.secondary);
    tokens.accentForeground = validator.getButtonTextColor(tokens.accent);
    tokens.successForeground = validator.getButtonTextColor(tokens.success);
    tokens.warningForeground = validator.getButtonTextColor(tokens.warning);
    tokens.dangerForeground = validator.getButtonTextColor(tokens.danger);
    addTypography(tokens, font);
    addLegacyAliases(tokens);
    const theme = {
      id: `${resolved.id || 'generated'}-${mode}-${Math.random().toString(36).slice(2, 7)}`,
      name: `${resolved.name || 'Generated Theme'} ${mode}`,
      mode,
      seed: resolved,
      scales,
      typography: font,
      tokens,
    };
    return scoreAndRepair(theme);
  }

  function generateManyThemes(count = 12, filters = {}) {
    const candidates = [];
    const source = presets.filter((preset) => !filters.category || preset.category === filters.category);
    for (let index = 0; candidates.length < count && index < count * 8; index += 1) {
      const preset = source[index % source.length] || randomSeed();
      const variant = mutateSeed(preset, index);
      const theme = generateTheme(variant, { mode: filters.mode || (index % 3 === 0 ? 'dark' : 'light') });
      if (theme.valid && !theme.rejected) candidates.push(theme);
    }
    return candidates.slice(0, count);
  }

  function generatePresetVariants(preset) {
    return [generateLightTheme(preset), generateDarkTheme(preset), generateTheme(mutateSeed(preset, 2)), generateTheme(mutateSeed(preset, 3))];
  }

  function scoreTheme(theme) {
    const report = validator.contrastReport(theme);
    const tokens = theme.tokens;
    let score = 0;
    score += report.filter((item) => item.aa).length * 8;
    score += report.filter((item) => item.aaa).length * 2;
    score += validator.validateTheme(theme).ok ? 20 : -80;
    score += color.chromaDistance(tokens.primary, tokens.accent) > .38 ? 12 : -25;
    score += validator.validateTheme({ tokens: { ...tokens, foreground: tokens.mutedForeground, background: tokens.background } }).report[0]?.aa ? 6 : -20;
    score += color.chromaDistance(tokens.surface, tokens.background) > .03 ? 6 : -12;
    score += contrastSafe(tokens.primaryForeground, tokens.primary) ? 8 : -60;
    score += theme.mode === 'dark' || theme.darkModeAvailable ? 4 : 0;
    if (tooBrightForLongForm(tokens.background)) score -= 35;
    return Math.max(0, Math.round(score));
  }

  function scoreAndRepair(theme) {
    const repaired = validator.repairTheme(theme);
    repaired.score = scoreTheme(repaired);
    repaired.rejected = shouldReject(repaired);
    repaired.valid = !repaired.rejected && validator.validateTheme(repaired).ok;
    return repaired;
  }

  function shouldReject(theme) {
    const tokens = theme.tokens;
    return !contrastSafe(tokens.foreground, tokens.background)
      || !contrastSafe(tokens.primaryForeground, tokens.primary)
      || !contrastSafe(tokens.mutedForeground, tokens.background)
      || tooBrightForLongForm(tokens.background)
      || color.chromaDistance(tokens.primary, tokens.accent) < .22
      || color.chromaDistance(tokens.surface, tokens.background) < .015;
  }

  function lightTokens(scales) {
    return {
      background: scales.neutral[50],
      foreground: scales.neutral[950],
      surface: '#ffffff',
      surfaceForeground: scales.neutral[950],
      card: '#ffffff',
      cardForeground: scales.neutral[950],
      primary: scales.primary[600],
      primaryForeground: '#ffffff',
      secondary: scales.secondary[700],
      secondaryForeground: '#ffffff',
      accent: scales.accent[600],
      accentForeground: '#ffffff',
      muted: scales.neutral[100],
      mutedForeground: scales.neutral[700],
      border: scales.neutral[200],
      success: '#15803d',
      successForeground: '#ffffff',
      warning: '#b45309',
      warningForeground: '#ffffff',
      danger: '#dc2626',
      dangerForeground: '#ffffff',
    };
  }

  function darkTokens(scales) {
    return {
      background: scales.neutral[950],
      foreground: scales.neutral[50],
      surface: scales.neutral[900],
      surfaceForeground: scales.neutral[50],
      card: scales.neutral[900],
      cardForeground: scales.neutral[50],
      primary: scales.primary[300],
      primaryForeground: '#020617',
      secondary: scales.secondary[300],
      secondaryForeground: '#020617',
      accent: scales.accent[300],
      accentForeground: '#020617',
      muted: scales.neutral[800],
      mutedForeground: scales.neutral[200],
      border: scales.neutral[700],
      success: '#22c55e',
      successForeground: '#052e16',
      warning: '#facc15',
      warningForeground: '#422006',
      danger: '#f87171',
      dangerForeground: '#450a0a',
    };
  }

  function resolveSeed(seed) {
    if (typeof seed === 'string') return presets.find((preset) => preset.id === seed) || { id: seed, primary: seed };
    return seed?.primary ? seed : randomSeed();
  }

  function randomSeed() {
    const hue = Math.floor(Math.random() * 360);
    return {
      id: 'random',
      name: 'Random accessible seed',
      primary: color.hslToHex({ h: hue, s: .72, l: .46 }),
      secondary: color.hslToHex({ h: (hue + 220) % 360, s: .28, l: .24 }),
      accent: color.hslToHex({ h: (hue + 130) % 360, s: .72, l: .48 }),
    };
  }

  function mutateSeed(seed, index = 0) {
    const delta = ((index % 5) - 2) * .04;
    return {
      ...seed,
      id: `${seed.id || 'seed'}-variant-${index}`,
      primary: color.shiftLightness(seed.primary, delta),
      secondary: color.shiftLightness(seed.secondary, -delta / 2),
      accent: color.shiftLightness(seed.accent, -delta),
    };
  }

  function pickFont(value = '') {
    const key = String(value || '').toLowerCase();
    return fonts.find((font) => font.id === key || font.category.toLowerCase() === key || font.mood.some((tag) => key.includes(tag))) || fonts[0];
  }

  function addTypography(tokens, font) {
    tokens.fontHeading = `${font.headingFont}, ${font.fallback}`;
    tokens.fontBody = `${font.bodyFont}, ${font.fallback}`;
    tokens.baseFontSize = font.baseFontSize;
    tokens.lineHeight = String(font.lineHeight);
    tokens.headingWeight = String(font.headingWeight);
    tokens.bodyWeight = String(font.bodyWeight);
  }

  function addLegacyAliases(tokens) {
    tokens.colorPrimary = tokens.primary;
    tokens.colorSecondary = tokens.secondary;
    tokens.colorAccent = tokens.accent;
    tokens.colorBg = tokens.background;
    tokens.colorSurface = tokens.surface;
    tokens.colorText = tokens.foreground;
    tokens.colorMuted = tokens.mutedForeground;
    tokens.colorBorder = tokens.border;
  }

  function contrastSafe(foreground, background) {
    return window.MicroAgencyTheme.contrast.passesContrast(foreground, background).pass;
  }

  function tooBrightForLongForm(hex) {
    const hsl = color.hexToHsl(hex);
    return hsl.s > .55 && hsl.l > .82;
  }

  return { generateTheme, generateLightTheme, generateDarkTheme, generateThemePair, generateManyThemes, generatePresetVariants, scoreTheme };
})();
