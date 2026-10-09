import { NextRequest, NextResponse } from 'next/server';
import { generateVdsDeployScript, sanitizeBashDisplayString } from '@/lib/generators/deploymentGenerator';
import { MODULE_CATALOG } from '@/lib/data/modules';
import type { ArchitectNode } from '@/lib/types';

export const dynamic = 'force-dynamic';

function validateAndSanitizeNodes(rawNodes: unknown): ArchitectNode[] {
  if (!Array.isArray(rawNodes)) {
    throw new Error('Düğüm listesi bir dizi olmalıdır.');
  }

  if (rawNodes.length > 50) {
    throw new Error('Maksimum 50 servis tanımlanabilir.');
  }

  const safeNodes: ArchitectNode[] = [];

  for (let i = 0; i < rawNodes.length; i++) {
    const item = rawNodes[i];
    if (!item || typeof item !== 'object') continue;

    const data = (item as Record<string, unknown>).data as Record<string, unknown> || {};
    const rawModuleId = String(data.moduleId || 'service');
    // Module ID must be strictly alphanumeric + hyphens/underscores
    const safeModuleId = rawModuleId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);

    // Verify against catalog - forbid unvetted arbitrary services via public deploy endpoint
    const catalogModule = MODULE_CATALOG.find((m) => m.id === safeModuleId);
    if (!catalogModule) {
      throw new Error(`Güvenlik Uyarısı: '${safeModuleId}' doğrulanmış katalog servisi değildir.`);
    }

    const safeLabel = sanitizeBashDisplayString(
      typeof data.label === 'string' ? data.label : catalogModule.name,
      80
    );

    const safeContainerName = typeof data.customContainerName === 'string'
      ? data.customContainerName.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 64)
      : undefined;

    // Validate portOverrides
    const safePortOverrides: Record<number, number> = {};
    if (data.portOverrides && typeof data.portOverrides === 'object') {
      for (const [k, v] of Object.entries(data.portOverrides as Record<string, unknown>)) {
        const intK = parseInt(k, 10);
        const intV = parseInt(String(v), 10);
        if (Number.isInteger(intK) && intK > 0 && intK <= 65535 && Number.isInteger(intV) && intV > 0 && intV <= 65535) {
          safePortOverrides[intK] = intV;
        }
      }
    }

    // Validate customPorts
    const safeCustomPorts: Array<{ host: number; container: number; protocol?: 'tcp' | 'udp' }> = [];
    if (Array.isArray(data.customPorts)) {
      for (const p of data.customPorts) {
        if (!p || typeof p !== 'object') continue;
        const hostPort = parseInt(String((p as Record<string, unknown>).host), 10);
        const containerPort = parseInt(String((p as Record<string, unknown>).container), 10);
        if (
          Number.isInteger(hostPort) && hostPort > 0 && hostPort <= 65535 &&
          Number.isInteger(containerPort) && containerPort > 0 && containerPort <= 65535
        ) {
          safeCustomPorts.push({
            host: hostPort,
            container: containerPort,
            protocol: (p as Record<string, unknown>).protocol === 'udp' ? 'udp' : 'tcp',
          });
        }
      }
    }

    // Validate selected plugins strictly
    const safePlugins = Array.isArray(data.selectedPlugins)
      ? data.selectedPlugins
          .filter((pl: unknown): pl is string => typeof pl === 'string' && /^[a-zA-Z0-9_-]+$/.test(pl))
          .slice(0, 20)
      : undefined;

    const rawPos = (item as Record<string, unknown>).position as { x?: unknown; y?: unknown } | undefined;
    const posX = typeof rawPos?.x === 'number' && Number.isFinite(rawPos.x) ? rawPos.x : 0;
    const posY = typeof rawPos?.y === 'number' && Number.isFinite(rawPos.y) ? rawPos.y : 0;

    safeNodes.push({
      id: String((item as Record<string, unknown>).id || `node-${i}`).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 36),
      type: 'moduleNode',
      position: { x: posX, y: posY },
      data: {
        moduleId: catalogModule.id,
        label: safeLabel,
        customContainerName: safeContainerName,
        portOverrides: safePortOverrides,
        envOverrides: {},
        hasConflict: false,
        conflicts: [],
        advancedSettings: {},
        customPorts: safeCustomPorts.length > 0 ? safeCustomPorts : undefined,
        isCustom: false,
        selectedPlugins: safePlugins || [],
      },
    });
  }

  return safeNodes;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dataParam = searchParams.get('data');
    const titleParam = searchParams.get('title') || 'XIVIZLEY VDS Smart Deployment';

    if (!dataParam) {
      return new NextResponse(
        `#!/usr/bin/env bash\necho "❌ Hata: Veri parametresi eksik."\nexit 1\n`,
        {
          status: 400,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        }
      );
    }

    // CDN & Reverse Proxy safe query-string threshold (16 KB)
    if (dataParam.length > 16384) {
      return new NextResponse(
        `#!/usr/bin/env bash\necho "❌ Hata: İstek verisi izin verilen sınırı aşıyor (Maksimum 16 KB)."\nexit 1\n`,
        {
          status: 400,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        }
      );
    }

    let decodedJson = '';
    try {
      decodedJson = Buffer.from(dataParam, 'base64url').toString('utf-8');
      JSON.parse(decodedJson);
    } catch {
      decodedJson = Buffer.from(dataParam, 'base64').toString('utf-8');
    }
    const rawNodes = JSON.parse(decodedJson);
    const nodes = validateAndSanitizeNodes(rawNodes);

    const safeTitle = sanitizeBashDisplayString(titleParam, 80);
    const script = generateVdsDeployScript(nodes, [], { title: safeTitle });

    return new NextResponse(script, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (error) {
    console.error('Run Raw API Error:', error);
    return new NextResponse(
      `#!/usr/bin/env bash\necho "❌ Hata: Geçersiz veya güvenilmeyen veri formatı."\nexit 1\n`,
      {
        status: 400,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawNodes = body.nodes || [];
    const nodes = validateAndSanitizeNodes(rawNodes);
    const edges = Array.isArray(body.edges) ? body.edges : [];
    const title = sanitizeBashDisplayString(body.title || 'XIVIZLEY VDS Smart Deployment', 80);

    const script = generateVdsDeployScript(nodes, edges, { title });

    return new NextResponse(script, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Run Raw POST API Error:', error);
    return new NextResponse(
      `#!/usr/bin/env bash\necho "❌ Hata: Script oluşturulamadı."\nexit 1\n`,
      {
        status: 400,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      }
    );
  }
}
