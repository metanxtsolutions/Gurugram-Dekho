import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * CLI configuration — used by `prisma migrate` and `prisma db`, not by the
 * runtime client (that lives in lib/db.ts with its own driver adapter).
 *
 * Migrations need a DIRECT connection. Neon's DATABASE_URL points at its
 * PgBouncer pooler, which runs in transaction mode and cannot hold the
 * session-level advisory lock Prisma takes while migrating. Neon exposes the
 * unpooled endpoint separately, so prefer it here and fall back for local
 * development, where DATABASE_URL is already a direct connection.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL_UNPOOLED"] ?? process.env["DATABASE_URL"],
  },
});
