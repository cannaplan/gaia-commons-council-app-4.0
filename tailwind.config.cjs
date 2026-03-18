// tailwind.config.cjs - safe CommonJS Tailwind config for CI
const path = require('path');

module.exports = {
  darkMode: 'class',
  content: [
    './client/index.html',
    './client/src/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,ts,tsx}'
  ],
  theme: {
    extend: {}
  },
  plugins: []
};
