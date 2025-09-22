// Add this to enable PWA with next-pwa
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
});

module.exports = withPWA({
  // ...your existing Next.js config
});