// ============================================================
// API Route: /api/architectures
// POST: Save architecture (authenticated)
// GET:  Fetch public architectures feed
// ============================================================

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import type { ArchitectureDTO } from '@/lib/types';
import rateLimit from '@/lib/rateLimit';
import { verifyTurnstileToken } from '@/lib/turnstile';

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 users per second
});

export async function GET() {
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
        user: { select: { id: true, name: true, image: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    const data = rows.map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
      description: row.description ?? null,
      thumbnail: row.thumbnail ?? null,
    })) satisfies ArchitectureDTO[];

    return NextResponse.json({ data });
  } catch (error) {
    console.warn('[GET /api/architectures] Database unavailable, returning empty list:', error);
    return NextResponse.json({ data: [] }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    try {
      await limiter.check(5, ip); // 5 requests per minute
    } catch {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as {
      title?: unknown;
      description?: unknown;
      canvasJson?: unknown;
      thumbnail?: unknown;
      isPublic?: unknown;
      turnstileToken?: unknown;
    };

    // Verify Turnstile if token is provided
    if (body.turnstileToken && typeof body.turnstileToken === 'string') {
      const verifyRes = await verifyTurnstileToken(body.turnstileToken, ip);
      if (!verifyRes.success) {
        return NextResponse.json({ error: 'Güvenlik doğrulaması başarısız oldu' }, { status: 403 });
      }
    }

    // Validate required fields
    if (typeof body.title !== 'string' || body.title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (typeof body.canvasJson !== 'string' || body.canvasJson.trim().length === 0) {
      return NextResponse.json({ error: 'canvasJson is required' }, { status: 400 });
    }

    // Validate canvasJson is valid JSON
    try {
      JSON.parse(body.canvasJson);
    } catch {
      return NextResponse.json({ error: 'canvasJson must be valid JSON' }, { status: 400 });
    }

    const architecture = await db.architecture.create({
      data: {
        title: body.title.trim().slice(0, 120),
        description: typeof body.description === 'string'
          ? body.description.trim().slice(0, 500)
          : null,
        canvasJson: body.canvasJson,
        thumbnail: typeof body.thumbnail === 'string' ? body.thumbnail : null,
        isPublic: body.isPublic === false ? false : true,
        userId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        description: true,
        canvasJson: true,
        thumbnail: true,
        isPublic: true,
        viewCount: true,
        createdAt: true,
        user: { select: { id: true, name: true, image: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    const data: ArchitectureDTO = {
      ...architecture,
      createdAt: architecture.createdAt.toISOString(),
      description: architecture.description ?? null,
      thumbnail: architecture.thumbnail ?? null,
    };

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/architectures]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
