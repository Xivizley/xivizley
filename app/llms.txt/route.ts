import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-static';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'llms.txt');
    const content = fs.readFileSync(filePath, 'utf-8');

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    });
  } catch {
    return new NextResponse(
      "# XIVIZLEY — Visual Homelab & Docker Compose Architect\n\n> XIVIZLEY, 115 Docker servisini görsel tuvalde sürükle-bırak bağlayıp tek SSH komutuyla VDS'e kuran, ücretsiz ve MIT lisanslı self-host mimarlık aracıdır.\n\nhttps://xivizley.com.tr",
      {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      }
    );
  }
}
