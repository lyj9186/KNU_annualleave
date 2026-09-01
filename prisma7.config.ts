// Prisma 7 config. Loaded by the Prisma CLI (migrate / db push / studio / generate).
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // DIRECT_URL: unpooled connection for DDL / migrations (recommended on Neon).
    // Falls back to DATABASE_URL when it is not set.
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
});
