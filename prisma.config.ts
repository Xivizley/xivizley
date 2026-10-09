// ============================================================
// XIVIZLEY — Prisma v7 Configuration
// prisma.config.ts
//
// Prisma v7 moves connection URLs out of schema.prisma into
// this config file. See: https://pris.ly/d/config-datasource
// ============================================================

import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env['DATABASE_URL'] ?? 'postgresql://dummy:dummy@localhost:5432/dummy',
  },
});
