window.MicroAgencyTheme = window.MicroAgencyTheme || {};
window.MicroAgencyTheme.exporter = (() => {
  const storageKey = 'microagency_static_themes_v1';

  function kebab(key) {
    return String(key).replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
  }

  function themeToCssVariables(theme) {
    const tokens = theme.tokens || theme;
    const lines = Object.entries(tokens)
      .filter(([, value]) => typeof value === 'string' || typeof value === 'number')
      .map(([key, value]) => `  --${kebab(key)}: ${value};`);
    return `:root {\n${lines.join('\n')}\n}`;
  }

  function injectTheme(theme, target = document.documentElement) {
    const tokens = theme.tokens || theme;
    Object.entries(tokens).forEach(([key, value]) => {
      if (typeof value === 'string' || typeof value === 'number') target.style.setProperty(`--${kebab(key)}`, value);
    });
    target.dataset.generatedTheme = theme.id || 'generated';
    target.dataset.themeMode = theme.mode || 'light';
  }

  function readStore() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '{}');
    } catch {
      return {};
    }
  }

  function saveTheme(theme) {
    const store = readStore();
    const id = theme.id || `theme-${Date.now()}`;
    store[id] = { ...theme, id };
    localStorage.setItem(storageKey, JSON.stringify(store));
    return store[id];
  }

  function loadTheme(themeId) {
    return readStore()[themeId] || null;
  }

  return { themeToCssVariables, injectTheme, saveTheme, loadTheme };
})();

window.MicroAgencyTheme.examples = {
  fromPreset() {
    return window.MicroAgencyTheme.generator.generateTheme('saas-blue');
  },
  oneHundredRandom() {
    return window.MicroAgencyTheme.generator.generateManyThemes(100);
  },
  validate(theme) {
    return window.MicroAgencyTheme.validator.validateTheme(theme);
  },
  repair(theme) {
    return window.MicroAgencyTheme.validator.repairTheme(theme);
  },
  apply(theme) {
    return window.MicroAgencyTheme.exporter.injectTheme(theme);
  },
  css(theme) {
    return window.MicroAgencyTheme.exporter.themeToCssVariables(theme);
  },
};

Object.assign(window.MicroAgencyTheme, {
  hexToRgb: window.MicroAgencyTheme.contrast.hexToRgb,
  srgbToLinear: window.MicroAgencyTheme.contrast.srgbToLinear,
  luminance: window.MicroAgencyTheme.contrast.luminance,
  contrastRatio: window.MicroAgencyTheme.contrast.contrastRatio,
  passesContrast: window.MicroAgencyTheme.contrast.passesContrast,
  pickReadableForeground: window.MicroAgencyTheme.validator.pickReadableForeground,
  getButtonTextColor: window.MicroAgencyTheme.validator.getButtonTextColor,
  ensureReadablePair: window.MicroAgencyTheme.validator.ensureReadablePair,
  generateTheme: window.MicroAgencyTheme.generator.generateTheme,
  generateLightTheme: window.MicroAgencyTheme.generator.generateLightTheme,
  generateDarkTheme: window.MicroAgencyTheme.generator.generateDarkTheme,
  generateThemePair: window.MicroAgencyTheme.generator.generateThemePair,
  generateManyThemes: window.MicroAgencyTheme.generator.generateManyThemes,
  generatePresetVariants: window.MicroAgencyTheme.generator.generatePresetVariants,
  scoreTheme: window.MicroAgencyTheme.generator.scoreTheme,
  themeToCssVariables: window.MicroAgencyTheme.exporter.themeToCssVariables,
  injectTheme: window.MicroAgencyTheme.exporter.injectTheme,
  saveTheme: window.MicroAgencyTheme.exporter.saveTheme,
  loadTheme: window.MicroAgencyTheme.exporter.loadTheme,
});
