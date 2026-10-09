import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const label = searchParams.get('label') || 'XIVIZLEY';
  const status = searchParams.get('status') || searchParams.get('text') || 'Deploy Stack';
  const theme = searchParams.get('theme') || 'aurora'; // 'aurora' | 'cyan' | 'dark'

  // Estimate text widths for dynamic SVG layout
  const labelWidth = Math.max(54, Math.round(label.length * 7.2) + 20);
  const statusWidth = Math.max(86, Math.round(status.length * 7.4) + 24);
  const totalWidth = labelWidth + statusWidth;
  const height = 28;

  let rightBg = '#0c1628';
  let accentColor = '#38bdf8';
  let strokeColor = 'rgba(56, 189, 248, 0.35)';

  if (theme === 'cyan') {
    rightBg = '#06283d';
    accentColor = '#22d3ee';
    strokeColor = 'rgba(34, 211, 238, 0.4)';
  } else if (theme === 'dark') {
    rightBg = '#181b26';
    accentColor = '#cbd5e1';
    strokeColor = 'rgba(255, 255, 255, 0.12)';
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height}" viewBox="0 0 ${totalWidth} ${height}" role="img" aria-label="${label}: ${status}">
  <title>${label}: ${status}</title>
  <defs>
    <linearGradient id="grad-badge" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="${rightBg}" />
    </linearGradient>
    <linearGradient id="grad-accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#818cf8" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Container Box with Rounded Edges & Glass Border -->
  <rect width="${totalWidth}" height="${height}" rx="6" fill="url(#grad-badge)" stroke="${strokeColor}" stroke-width="1" />

  <!-- Left Divider -->
  <line x1="${labelWidth}" y1="0" x2="${labelWidth}" y2="${height}" stroke="${strokeColor}" stroke-width="1" />

  <!-- Left Logo Icon (Stylized XIVIZLEY Architecture Layers) -->
  <g transform="translate(7, 7)">
    <path d="M7 1L1 4.5L7 8L13 4.5L7 1Z" fill="#38bdf8" opacity="0.95" />
    <path d="M1 8L7 11.5L13 8" stroke="#818cf8" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
  </g>

  <!-- Left Label Text -->
  <text x="${26 + (labelWidth - 26) / 2}" y="18" fill="#e2e8f0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="11" font-weight="700" text-anchor="middle" letter-spacing="0.4">
    ${label}
  </text>

  <!-- Pulsing Live Dot -->
  <circle cx="${labelWidth + 12}" cy="14" r="3" fill="${accentColor}" filter="url(#glow)">
    <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
  </circle>

  <!-- Right Status Text -->
  <text x="${labelWidth + 20 + (statusWidth - 20) / 2}" y="18" fill="${accentColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="11" font-weight="700" text-anchor="middle" letter-spacing="0.2">
    ${status}
  </text>
</svg>`;

  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
