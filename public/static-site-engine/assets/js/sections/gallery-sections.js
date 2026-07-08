(() => {
  const S = window.MicroAgencySections;
  S.register({ 'gallery-grid': S.renderers.galleryGrid });
  S.registerPlaceholders([
    'gallery-masonry', 'gallery-carousel', 'gallery-lightbox',
    'gallery-before-after', 'gallery-video-grid', 'gallery-instagram-style',
    'gallery-logo-wall',
  ]);
})();
