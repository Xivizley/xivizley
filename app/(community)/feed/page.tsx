// ============================================================
// Community Feed Page — /app/(community)/feed/page.tsx
// Server Component with ISR (revalidate every 60 seconds).
// N+1 protected: single Prisma query with all necessary joins.
// ============================================================

import React from 'react';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { Navbar } from '@/components/shared/Navbar';
import type { ArchitectureDTO } from '@/lib/types';
import { FeedClient } from './FeedClient';

export const metadata: Metadata = {
  title: 'Topluluk & Homelab Şablonları',
  description: 'Topluluk tarafından paylaşılan popüler Docker ve Homelab mimarilerini keşfedin, tek tıkla kendi sunucunuza kurun.',
  openGraph: {
    title: 'Topluluk & Homelab Şablonları — XIVIZLEY',
    description: 'Popüler Docker mimarileri, 4K medya sunucuları, oyun sunucuları ve gizlilik şablonları.',
    images: ['/og.png'],
  },
};

// ISR: revalidate every 60 seconds
export const revalidate = 60;
export const dynamic = 'force-static';

// ─── Data Fetching ───────────────────────────────────────────

async function getPublicArchitectures(): Promise<ArchitectureDTO[]> {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL is not set. Returning empty feed.');
    return [];
  }

  try {
    const rows = await db.architecture.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' },
      take: 48,
      select: {
        id: true,
        title: true,
        description: true,
        canvasJson: true,
        thumbnail: true,
        isPublic: true,
        viewCount: true,
        createdAt: true,
        user: {
          select: { id: true, name: true, image: true },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });

    return rows.map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
      description: row.description ?? null,
      thumbnail: row.thumbnail ?? null,
    })) satisfies ArchitectureDTO[];
  } catch (error) {
    console.error('Failed to fetch architectures:', error);
    return [];
  }
}

// ─── Page ────────────────────────────────────────────────────

export default async function FeedPage() {
  const architectures = await getPublicArchitectures();

  return (
    <div className="min-h-screen bg-[#08090e] text-slate-100">
      <Navbar />
      <FeedClient architectures={architectures} />
    </div>
  );
}
