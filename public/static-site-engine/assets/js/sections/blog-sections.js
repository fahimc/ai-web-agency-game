(() => {
  const S = window.MicroAgencySections;
  S.register({
    'blog-card-grid': S.renderers.blogCardGrid,
    'article-body': S.renderers.articleBody,
  });
  S.registerPlaceholders([
    'blog-featured-post', 'blog-list', 'blog-sidebar-layout', 'blog-category-tabs',
    'blog-author-box', 'blog-related-posts', 'article-table-of-contents',
    'article-hero',
  ]);
})();
