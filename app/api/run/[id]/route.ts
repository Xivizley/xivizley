import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateVdsDeployScript } from '@/lib/generators/deploymentGenerator';
import type { ArchitectNode, ArchitectEdge } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const arch = await db.architecture.findUnique({
      where: { id },
    });

    if (!arch) {
      return new NextResponse(
        `#!/usr/bin/env bash\necho "❌ Hata: Belirtilen mimari (${id}) bulunamadı veya silinmiş."\nexit 1\n`,
        {
          status: 404,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        }
      );
    }

    let nodes: ArchitectNode[] = [];
    let edges: ArchitectEdge[] = [];
    if (arch.canvasJson) {
      try {
        const parsed = JSON.parse(arch.canvasJson);
        if (Array.isArray(parsed)) {
          nodes = parsed;
        } else {
          nodes = parsed.nodes || [];
          edges = parsed.edges || [];
        }
      } catch {
        nodes = [];
        edges = [];
      }
    }

    const script = generateVdsDeployScript(nodes, edges, { title: arch.title });

    return new NextResponse(script, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (error) {
    console.error('Run API Error:', error);
    return new NextResponse(
      `#!/usr/bin/env bash\necho "❌ Hata: Script oluşturulurken bir sorun oluştu."\nexit 1\n`,
      {
        status: 500,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      }
    );
  }
}
