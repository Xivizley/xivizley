import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || 'Görsel Homelab & Docker Mimarı';
    const subtitle =
      searchParams.get('subtitle') ||
      'Sürükle-bırak servisleri bağla, port çakışmalarını otomatik çöz ve 1-tıkla sunucuna kur.';
    const modulesParam = searchParams.get('modules');
    const modules = modulesParam
      ? modulesParam.split(',').map((m) => m.trim()).filter(Boolean).slice(0, 6)
      : ['AdGuard', 'Nginx Proxy', 'Jellyfin', 'Nextcloud', 'Vaultwarden'];

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#08090e',
            backgroundImage:
              'radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.05) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.05) 2%, transparent 0%), radial-gradient(circle at 80% 20%, rgba(6, 182, 212, 0.15), transparent 40%), radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.15), transparent 40%)',
            backgroundSize: '100px 100px, 100px 100px, 100% 100%, 100% 100%',
            padding: '60px 70px',
            fontFamily: 'system-ui, sans-serif',
            color: '#f8fafc',
            border: '2px solid rgba(56, 189, 248, 0.2)',
          }}
        >
          {/* Top Brand Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: 900,
                  color: '#ffffff',
                  boxShadow: '0 0 24px rgba(6, 182, 212, 0.4)',
                }}
              >
                X
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: '28px',
                    fontWeight: 900,
                    letterSpacing: '-1px',
                    color: '#ffffff',
                  }}
                >
                  XIVIZLEY
                </span>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#38bdf8',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                  }}
                >
                  Visual Homelab Architect
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                padding: '8px 18px',
                borderRadius: '30px',
                fontSize: '14px',
                color: '#38bdf8',
                fontWeight: 600,
              }}
            >
              <span>🚀 1-Click VDS Deploy</span>
            </div>
          </div>

          {/* Center Main Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              maxWidth: '960px',
            }}
          >
            <h1
              style={{
                fontSize: '52px',
                fontWeight: 900,
                letterSpacing: '-1.5px',
                lineHeight: 1.15,
                margin: 0,
                color: '#ffffff',
                textShadow: '0 4px 20px rgba(0,0,0,0.5)',
              }}
            >
              {title}
            </h1>
            <p
              style={{
                fontSize: '22px',
                fontWeight: 500,
                lineHeight: 1.4,
                color: '#94a3b8',
                margin: 0,
              }}
            >
              {subtitle}
            </p>
          </div>

          {/* Bottom Service Badges & Domain */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              paddingTop: '24px',
              borderTop: '1px solid rgba(51, 65, 85, 0.6)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {modules.map((mod, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(56, 189, 248, 0.35)',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#e2e8f0',
                  }}
                >
                  <span style={{ color: '#38bdf8' }}>📦</span>
                  <span>{mod}</span>
                </div>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '16px',
                fontWeight: 700,
                color: '#38bdf8',
              }}
            >
              <span>xivizley.com.tr</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (err) {
    console.error('[OG ERROR]', err);
    return new Response('Failed to generate OG image', { status: 500 });
  }
}
