/* Colour conversion helpers. The API is intentionally small so OKLCH can be
   added later without changing the theme generator call sites. */
window.MicroAgencyTheme = window.MicroAgencyTheme || {};
window.MicroAgencyTheme.color = (() => {
  function clamp(value, min = 0, max = 1) {
    return Math.min(max, Math.max(min, Number(value) || 0));
  }

  function normalizeHex(hex) {
    const value = String(hex || '').trim().replace('#', '');
    if (/^[0-9a-f]{3}$/i.test(value)) {
      return `#${value.split('').map((char) => char + char).join('')}`.toLowerCase();
    }
    return /^[0-9a-f]{6}$/i.test(value) ? `#${value.toLowerCase()}` : '#000000';
  }

  function hexToRgb(hex) {
    const clean = normalizeHex(hex).slice(1);
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16),
    };
  }

  function rgbToHex({ r, g, b }) {
    return `#${[r, g, b].map((part) => Math.round(clamp(part, 0, 255)).toString(16).padStart(2, '0')).join('')}`;
  }

  function hexToHsl(hex) {
    const { r, g, b } = hexToRgb(hex);
    const nr = r / 255;
    const ng = g / 255;
    const nb = b / 255;
    const max = Math.max(nr, ng, nb);
    const min = Math.min(nr, ng, nb);
    const lightness = (max + min) / 2;
    if (max === min) return { h: 0, s: 0, l: lightness };
    const delta = max - min;
    const saturation = lightness > .5 ? delta / (2 - max - min) : delta / (max + min);
    const hue = max === nr
      ? (ng - nb) / delta + (ng < nb ? 6 : 0)
      : max === ng
        ? (nb - nr) / delta + 2
        : (nr - ng) / delta + 4;
    return { h: hue * 60, s: saturation, l: lightness };
  }

  function hslToHex({ h, s, l }) {
    const hue = (((Number(h) || 0) % 360) + 360) % 360 / 360;
    const sat = clamp(s);
    const light = clamp(l);
    if (sat === 0) {
      const gray = light * 255;
      return rgbToHex({ r: gray, g: gray, b: gray });
    }
    const q = light < .5 ? light * (1 + sat) : light + sat - light * sat;
    const p = 2 * light - q;
    const channel = (offset) => {
      let t = hue + offset;
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    return rgbToHex({ r: channel(1 / 3) * 255, g: channel(0) * 255, b: channel(-1 / 3) * 255 });
  }

  function mix(hexA, hexB, amount = .5) {
    const a = hexToRgb(hexA);
    const b = hexToRgb(hexB);
    const t = clamp(amount);
    return rgbToHex({
      r: a.r + (b.r - a.r) * t,
      g: a.g + (b.g - a.g) * t,
      b: a.b + (b.b - a.b) * t,
    });
  }

  function shiftLightness(hex, delta) {
    const hsl = hexToHsl(hex);
    return hslToHex({ ...hsl, l: clamp(hsl.l + delta) });
  }

  function chromaDistance(hexA, hexB) {
    const a = hexToHsl(hexA);
    const b = hexToHsl(hexB);
    const hue = Math.min(Math.abs(a.h - b.h), 360 - Math.abs(a.h - b.h)) / 180;
    return hue + Math.abs(a.s - b.s) + Math.abs(a.l - b.l);
  }

  return { clamp, normalizeHex, hexToRgb, rgbToHex, hexToHsl, hslToHex, mix, shiftLightness, chromaDistance };
})();
