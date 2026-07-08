window.MicroAgencyTheme = window.MicroAgencyTheme || {};
window.MicroAgencyTheme.scale = (() => {
  const color = window.MicroAgencyTheme.color;
  const stops = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  const lightness = [.97, .93, .86, .76, .64, .52, .42, .34, .26, .20, .13];

  function generateTonalScale(seed, options = {}) {
    const base = color.hexToHsl(seed);
    const saturation = color.clamp(options.saturation ?? base.s, .04, .92);
    return stops.reduce((scale, stop, index) => {
      const satAdjust = stop <= 100 ? .72 : stop >= 800 ? .9 : 1;
      scale[stop] = color.hslToHex({
        h: base.h,
        s: color.clamp(saturation * satAdjust),
        l: lightness[index],
      });
      return scale;
    }, {});
  }

  function generateNeutralScale(seed = '#64748b') {
    const base = color.hexToHsl(seed);
    const neutralSeed = color.hslToHex({ h: base.h, s: Math.min(base.s, .14), l: base.l });
    return generateTonalScale(neutralSeed, { saturation: Math.min(base.s, .14) });
  }

  function generateScales(seed = {}) {
    return {
      primary: generateTonalScale(seed.primary || '#2563eb'),
      secondary: generateTonalScale(seed.secondary || '#0f172a'),
      accent: generateTonalScale(seed.accent || '#14b8a6'),
      neutral: generateNeutralScale(seed.neutral || seed.secondary || '#64748b'),
    };
  }

  return { stops, generateTonalScale, generateNeutralScale, generateScales };
})();
