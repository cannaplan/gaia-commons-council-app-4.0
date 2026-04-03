# CI & Bundle Analysis — local commands

- Install
  npm ci

- Build
  npm run build

- Test
  npm test

- Run bundle analyzer locally (install source-map-explorer)
  npx source-map-explorer build/static/js/\*.js --html bundle-report.html
  # open bundle-report.html in a browser

Notes:

- If your project uses Vite or a different output directory, replace `build/static/js/*.js` accordingly (e.g. `dist/assets/*.js`).
