// ============================================================
// XIVIZLEY — Prisma Client Singleton
// lib/db.ts
//
// Prevents multiple Prisma Client instances during Next.js
// hot-reload in development (global cache pattern).
// Only used in API routes and Server Components — never in
// client components.
// ============================================================

import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Vercel / Neon Serverless connection
const connectionString = process.env['DATABASE_URL'] || 'postgresql://neondb_owner:npg_Ajx3a8CQPcLG@ep-soft-band-aybb4g5f-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require';
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env['NODE_ENV'] === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env['NODE_ENV'] !== 'production') globalForPrisma.prisma = db;
