(() => {
  const S = window.MicroAgencySections;
  S.register({ 'team-grid': S.renderers.teamGrid });
  S.registerPlaceholders([
    'team-cards', 'team-list', 'team-founder-profile',
    'team-leadership', 'team-carousel', 'team-bio-modal',
  ]);
})();
