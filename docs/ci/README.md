# CI/CD (GitLab) for gaia-commons-council-app-4.0

This document explains the GitLab CI pipeline, required CI variables, the manual migration policy, and how to trigger deployments.

Pipeline overview

- install: npm ci (caches node_modules)
- lint_and_test: TypeScript check + unit tests
- build: npm run build (produces `dist/` artifacts)
- migrate_production: Manual, protected job that runs `npx drizzle-kit push` against the production DB (only runs on `main`)
- deploy_to_render: Triggers a Render deploy via the Render API (requires RENDER_API_KEY and RENDER_SERVICE_ID)

Required GitLab CI variables (add these at Project → Settings → CI/CD → Variables)

- PRODUCTION_DATABASE_URL (protected, masked) — production Postgres connection string
- SESSION_SECRET (protected, masked) — session signing secret
- DEPLOY_URL — public app URL
- CORS_ALLOWED_ORIGINS — comma-separated allowed origins
- RENDER_API_KEY (protected, masked) — Render API token with deploy rights
- RENDER_SERVICE_ID (protected) — Render service identifier

Optional (for Docker image deployment):

- DOCKER_REGISTRY
- DOCKER_USERNAME
- DOCKER_PASSWORD

Manual migration policy

- Migrations to production are manual and require a maintainer to run `migrate_production`.
- Recommended steps before running the migration:
  1. Create a backup of the production database (pg_dump or DB snapshot).
  2. Verify CI build artifacts and tests passed for the commit.
  3. Review migration SQL in `migrations/`.
  4. Trigger the migration job in GitLab UI (CI > Jobs > play on `migrate_production` for main).
  5. After successful migration, trigger `deploy_to_render` or wait for automated deploy job.

Rollback guidance

- If a migration deploy causes issues, restore the database from the backup/snapshot.
- Revert the commit in Git and trigger a redeploy (or use Render's rollback function).

Triggering deploy manually via GitLab API (example)

- If you need to trigger a job via the GitLab API (example for triggering a pipeline on main):
