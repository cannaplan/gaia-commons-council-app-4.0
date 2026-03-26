import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

const databaseUrl =
  process.env.DATABASE_URL || process.env.PRODUCTION_DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL (or PRODUCTION_DATABASE_URL) must be set. Did you forget to provision a database?",
  );
}

const useSSL =
  databaseUrl.includes("sslmode=require") ||
  process.env.NODE_ENV === "production";

export const pool = new Pool({
  connectionString: databaseUrl,
  ...(useSSL ? { ssl: { rejectUnauthorized: false } } : {}),
});
export const db = drizzle(pool, { schema });
