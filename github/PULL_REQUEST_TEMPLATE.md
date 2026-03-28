## What this PR does / why we need it

(Provide a short summary.)

## Acceptance checklist

- [ ] Branch builds without TypeScript errors (CI green)
- [ ] Tests pass (unit + integration as appropriate)
- [ ] Dashboard page renders and shows six foundational cards
- [ ] Funding calculator sliders update total revenue and endowment chart in real time
- [ ] Charts lazy-load when cards are expanded (per-card lazy) or load with Suspense fallback
- [ ] The preserved TSX snippet exists in client/src/data/dashboard-sample.ts
- [ ] Accessibility: card headers are keyboard focusable, aria-expanded toggles
- [ ] LocalStorage persists card open/closed state
- [ ] Reviewer has run bundle-analyze (optional) and confirmed chunk sizes are acceptable

## Testing notes / how to review locally

- npm ci
- npm run build
- npm start
- Visit the Dashboard route and exercise sliders and expand cards.

## Deployment notes

- This repo is connected to Render; see docs/DEPLOYMENT.md for deploy steps and secrets required.
