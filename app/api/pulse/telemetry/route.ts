import { NextResponse } from 'next/server';

// ============================================================
// XIVIZLEY Pulse Telemetry Proxy
// Proxies https://pulse.xivizley.com.tr/api/telemetry with 15s SWR cache & fallback
// ============================================================

export const revalidate = 15;

const FALLBACK_TELEMETRY = {
  ok: true,
  timestamp: new Date().toISOString(),
  isFallback: true,
  summary: {
    upCount: 4,
    downCount: 0,
    totalCount: 4,
    uptimePercentage: 100,
    avgLatencyMs: 28,
  },
  monitors: [
    {
      id: 'mon-minecraft',
      name: '🎮 Minecraft PaperMC (Sunucu B)',
      target: '178.210.168.163:25565',
      type: 'tcp',
      status: 'up',
      latencyMs: 18,
      uptime: 99.95,
    },
    {
      id: 'mon-xivizley',
      name: '🌐 XIVIZLEY Ana Platform',
      target: 'https://xivizley.com.tr',
      type: 'http',
      status: 'up',
      latencyMs: 42,
      uptime: 100,
    },
    {
      id: 'mon-sunucu-a',
      name: '⚡ Sunucu A (Odeaweb Test VDS)',
      target: '109.104.120.126:80',
      type: 'tcp',
      status: 'up',
      latencyMs: 14,
      uptime: 99.8,
    },
    {
      id: 'mon-sso',
      name: '🔐 XIVIZLEY SSO & Suite',
      target: 'https://suite.xivizley.com.tr',
      type: 'http',
      status: 'up',
      latencyMs: 38,
      uptime: 99.9,
    },
  ],
};

export async function GET() {
  try {
    const res = await fetch('https://pulse.xivizley.com.tr/api/telemetry', {
      headers: {
        'User-Agent': 'XIVIZLEY-Canvas-Proxy/1.0 (+https://xivizley.com.tr)',
      },
      next: { revalidate: 15 },
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) {
      return NextResponse.json(FALLBACK_TELEMETRY);
    }

    const data = await res.json();
    return NextResponse.json({ ...data, isFallback: false });
  } catch {
    // Offline fallback if network or VDS is unreachable
    return NextResponse.json(FALLBACK_TELEMETRY);
  }
}
