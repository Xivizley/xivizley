import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function GET() {
  const content = `Contact: mailto:security@xivizley.com.tr
Expires: 2027-12-31T23:59:59.000Z
Preferred-Languages: tr, en
Canonical: https://xivizley.com.tr/.well-known/security.txt
Policy: https://xivizley.com.tr/privacy
Acknowledgments: https://xivizley.com.tr/about
`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
