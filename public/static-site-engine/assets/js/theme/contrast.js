window.MicroAgencyTheme = window.MicroAgencyTheme || {};
window.MicroAgencyTheme.contrast = (() => {
  const color = window.MicroAgencyTheme.color;

  function hexToRgb(hex) {
    return color.hexToRgb(hex);
  }

  function srgbToLinear(value) {
    const channel = Number(value) / 255;
    return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
  }

  function luminance(hex) {
    const { r, g, b } = hexToRgb(hex);
    return .2126 * srgbToLinear(r) + .7152 * srgbToLinear(g) + .0722 * srgbToLinear(b);
  }

  function contrastRatio(foreground, background) {
    const fg = luminance(foreground);
    const bg = luminance(background);
    const light = Math.max(fg, bg);
    const dark = Math.min(fg, bg);
    return (light + .05) / (dark + .05);
  }

  function passesContrast(foreground, background, options = {}) {
    const ratio = contrastRatio(foreground, background);
    const level = options.level || 'AA';
    const large = Boolean(options.large);
    const ui = Boolean(options.ui);
    const minimum = level === 'AAA'
      ? (large ? 4.5 : 7)
      : (ui || large ? 3 : 4.5);
    return { pass: ratio >= minimum, ratio, minimum };
  }

  return { hexToRgb, srgbToLinear, luminance, contrastRatio, passesContrast };
})();
