import { defineConfig } from "drizzle-kit";

const dbUrl =
  process.env.NODE_ENV === "production"
    ? process.env.PRODUCTION_DATABASE_URL ?? process.env.DATABASE_URL
    : process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error(
    "DATABASE_URL not set. Set DATABASE_URL (for local/dev) or PRODUCTION_DATABASE_URL (for production/CI).",
  );
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
});
