# Deployment (Render) — instructions & recommended settings

This project is deployable to Render. Below are recommended steps to connect the repo and the optional GitHub Action that triggers deploys.

1. Connect repository to Render (recommended - automatic previews)
   - Go to https://dashboard.render.com and sign in.
   - Create a new Web Service → Connect to your GitHub repo `cannaplan/gaia-commons-council-app-4.0`.
   - Select the branch to deploy (e.g., `main`).
   - Build Command: `npm run build`
   - Publish Directory: `dist/public`
   - Render will automatically create deploys for pushes to the connected branch and PR previews for PRs.

2. (Optional) GitHub Actions trigger deploy
   - If you want the GitHub Actions workflow to explicitly trigger a Render deploy, add the following repository secrets:
     - `RENDER_API_KEY` — Create an API Key on Render (Account → API Keys → New API Key). Treat this as a secret.
     - `RENDER_SERVICE_ID` — Find the service id in the Render dashboard for the service you want to trigger (in the URL or via the service settings).
   - After adding secrets, the workflow `.github/workflows/deploy-to-render.yml` will POST to Render to create a deploy on push to `main` or when manually triggered.

3. Verifying a deploy
   - Check the Render dashboard for build logs.
   - Visit the service URL (provided by Render) and navigate to the Dashboard route.
   - Validate charts render and that the Funding Calculator interactions update projections.

4. Environment variables & secrets
   - If your dashboard reads real API keys, add them in Render service Environment settings or set them as GitHub Secrets if used by Actions.

5. Notes about preview deployments
   - Render will create a new deploy for each branch/PR if configured. This provides preview URLs for reviewers.
   - If you prefer Netlify/Vercel previews, follow those provider docs instead; CI remains the same.

6. Troubleshooting
   - If builds fail on Render, download the build logs and ensure `npm ci` and `npm run build` succeed locally.
   - Confirm publish directory configuration matches your project (this project uses Vite with output configured as `dist/public` in vite.config.ts).
