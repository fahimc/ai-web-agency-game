(() => {
  const S = window.MicroAgencySections;
  S.register({
    'header-with-cta': S.renderers.headerWithCta,
    'footer-standard': S.renderers.footerStandard,
  });
  S.registerPlaceholders([
    'header-basic', 'header-centered', 'header-transparent', 'header-sticky',
    'header-offcanvas-mobile', 'header-mega-menu', 'header-topbar',
    'footer-columns', 'footer-minimal', 'footer-with-newsletter',
  ]);
})();
