window.MicroAgencySectionExamples = window.MicroAgencySectionExamples || {};
window.MicroAgencySectionExamples.restaurantSite = {
  title: 'Olive Yard',
  description: 'Neighbourhood restaurant and seasonal menu.',
  theme: 'local',
  sections: [
    { id: 'header', type: 'header-with-cta', content: { logo: 'Olive Yard', nav: [{ label: 'Menu', href: '#menu' }, { label: 'Gallery', href: '#gallery' }, { label: 'Hours', href: '#hours' }], cta: { label: 'Book a table', href: '#booking' } }, settings: { paddingTop: 'xs', paddingBottom: 'xs' } },
    { id: 'hero', type: 'hero-split', layout: { container: 'lg' }, content: { eyebrow: 'Seasonal neighbourhood dining', title: 'Fresh plates, warm service and easy booking.', text: 'A restaurant website direction with menu highlights, imagery, opening hours and booking.', buttons: [{ label: 'Book a table', href: '#booking' }], media: { src: '/placeholders/restaurant-table.jpg', alt: 'Restaurant table with seasonal dishes' } }, settings: { background: 'background', paddingTop: '2xl' } },
    { id: 'menu', type: 'pricing-cards', layout: { container: 'lg' }, content: { title: 'Menu highlights', items: [{ name: 'Lunch', price: 'from GBP 12', note: 'Seasonal plates and lighter dishes.', features: ['Daily soup', 'Fresh salads', 'House focaccia'] }, { name: 'Dinner', price: 'from GBP 19', note: 'A fuller evening menu.', features: ['Handmade pasta', 'Grilled mains', 'Desserts'] }, { name: 'Private dining', price: 'Ask', note: 'Small groups and celebrations.', features: ['Set menus', 'Wine options', 'Dedicated table'] }] }, settings: { background: 'surface' } },
    { id: 'gallery', type: 'gallery-grid', layout: { container: 'lg' }, content: { title: 'A look inside', items: [{ src: '/placeholders/restaurant-table.jpg', alt: 'Restaurant table' }, { src: '/placeholders/premium-interior.jpg', alt: 'Dining room interior' }, { src: '/placeholders/event-audience.jpg', alt: 'Guests at a venue' }] }, settings: { background: 'background' } },
    { id: 'hours', type: 'opening-hours', content: { title: 'Opening hours', items: [{ day: 'Tue-Thu', hours: '12:00-22:00' }, { day: 'Fri-Sat', hours: '12:00-23:00' }, { day: 'Sun-Mon', hours: 'Closed' }] }, settings: { background: 'surface' } },
    { id: 'booking', type: 'cta-band', content: { title: 'Book your table', text: 'Reserve online or call the team for group bookings.', buttons: [{ label: 'Book now', href: '#' }] }, settings: { background: 'background' } },
  ],
};
