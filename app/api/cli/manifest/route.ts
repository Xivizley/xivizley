import { NextResponse } from 'next/server';
import { MODULE_CATALOG } from '@/lib/data/modules';
import { STACK_TEMPLATES } from '@/lib/data/templates';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(
    {
      version: '1.0.0',
      author: 'Alperen',
      platform: 'XIVIZLEY Industrial Engine',
      generatedAt: new Date().toISOString(),
      moduleCount: MODULE_CATALOG.length,
      templateCount: STACK_TEMPLATES.length,
      modules: MODULE_CATALOG,
      templates: STACK_TEMPLATES,
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=300',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
