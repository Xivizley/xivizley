// ============================================================
// XIVIZLEY — Cloud Push Next.js Server Relay Proxy
// app/api/cloud-push/relay/route.ts
// Bypasses browser Mixed Content (HTTPS -> HTTP) and self-signed TLS
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import http from 'http';
import https from 'https';
import net from 'net';
import dns from 'dns';

export const dynamic = 'force-dynamic';

function extractIPv4FromMapped(clean: string): string | null {
  if (clean.startsWith('::ffff:') || clean.startsWith('0:0:0:0:0:ffff:')) {
    const rest = clean.replace(/^.*ffff:/, '');
    if (rest.includes('.')) {
      return rest;
    }
    const parts = rest.split(':');
    if (parts.length === 2) {
      const p1 = parseInt(parts[0] || '0', 16);
      const p2 = parseInt(parts[1] || '0', 16);
      if (!isNaN(p1) && !isNaN(p2)) {
        const a = (p1 >> 8) & 0xff;
        const b = p1 & 0xff;
        const c = (p2 >> 8) & 0xff;
        const d = p2 & 0xff;
        return `${a}.${b}.${c}.${d}`;
      }
    }
  }
  return null;
}

function isPrivateOrReservedIP(ipStr: string): boolean {
  let clean = ipStr.toLowerCase().trim().replace(/^\[|\]$/g, '');

  const mappedIpv4 = extractIPv4FromMapped(clean);
  if (mappedIpv4) {
    clean = mappedIpv4;
  }

  if (net.isIPv4(clean)) {
    const parts = clean.split('.').map(Number);
    if (parts.length !== 4) return true;
    const a = parts[0];
    const b = parts[1];
    const c = parts[2];
    const d = parts[3];
    if (a === undefined || b === undefined || c === undefined || d === undefined) return true;
    if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(d)) return true;

    // 0.0.0.0/8 (Current network)
    if (a === 0) return true;
    // 10.0.0.0/8 (Private RFC1918)
    if (a === 10) return true;
    // 100.64.0.0/10 (Carrier-grade NAT)
    if (a === 100 && b >= 64 && b <= 127) return true;
    // 127.0.0.0/8 (Loopback)
    if (a === 127) return true;
    // 169.254.0.0/16 (Link-local & Cloud Metadata)
    if (a === 169 && b === 254) return true;
    // 172.16.0.0/12 (Private RFC1918: 172.16.x.x - 172.31.x.x)
    if (a === 172 && b >= 16 && b <= 31) return true;
    // 192.0.0.0/24 & 192.0.2.0/24
    if (a === 192 && b === 0 && (c === 0 || c === 2)) return true;
    // 192.168.0.0/16 (Private RFC1918)
    if (a === 192 && b === 168) return true;
    // 198.18.0.0/15 (Benchmark)
    if (a === 198 && (b === 18 || b === 19)) return true;
    // 198.51.100.0/24 & 203.0.113.0/24
    if ((a === 198 && b === 51 && c === 100) || (a === 203 && b === 0 && c === 113)) return true;
    // 224.0.0.0/4 (Multicast) & 240.0.0.0/4 (Reserved / Broadcast)
    if (a >= 224) return true;

    return false;
  }

  if (net.isIPv6(clean)) {
    if (clean === '::1' || clean === '::') return true;
    if (clean.startsWith('fc') || clean.startsWith('fd')) return true; // Unique Local
    if (clean.startsWith('fe80:')) return true; // Link-local
    if (clean.startsWith('ff')) return true; // Multicast
    return false;
  }

  return false;
}

function isBlockedHostname(host: string): boolean {
  const clean = host.toLowerCase().trim().replace(/^\[|\]$/g, '');
  if (
    clean === 'localhost' ||
    clean.endsWith('.localhost') ||
    clean.endsWith('.local') ||
    clean.endsWith('.internal') ||
    clean === 'metadata.google.internal' ||
    clean === 'metadata.internal' ||
    clean === 'instance-data'
  ) {
    return true;
  }
  return false;
}

async function validateHostSecurity(host: string): Promise<boolean> {
  const clean = host.toLowerCase().trim().replace(/^\[|\]$/g, '');
  if (isBlockedHostname(clean) || isPrivateOrReservedIP(clean)) {
    return false;
  }
  if (net.isIP(clean)) {
    return true;
  }
  try {
    const addresses = await dns.promises.lookup(clean, { all: true });
    for (const record of addresses) {
      if (isPrivateOrReservedIP(record.address)) {
        return false;
      }
    }
  } catch {
    return false;
  }
  return true;
}

function makeRelayRequest(
  urlStr: string,
  headers: Record<string, string>,
  bodyData: string
): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(urlStr);
    const isHttps = parsed.protocol === 'https:';
    const client = isHttps ? https : http;

    const req = client.request(
      urlStr,
      {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Length': Buffer.byteLength(bodyData),
        },
        rejectUnauthorized: false, // 🛡️ Allow self-signed TLS certificates for private user VDS agents
        timeout: 30000,
      },
      (res) => {
        let rawData = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          resolve({ status: res.statusCode || 200, body: rawData });
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Sunucu isteği zaman aşımına uğradı (30s)'));
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(bodyData);
    req.end();
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { targetUrl, composeYaml, title, token, agentToken } = body;
    const authToken = token || agentToken || req.headers.get('x-agent-token') || req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

    if (!targetUrl) {
      return NextResponse.json({ error: 'Ajan URL adresi belirtilmedi.' }, { status: 400 });
    }

    // Sanitize target URL
    targetUrl = targetUrl.trim().replace(/\/$/, '');
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }

    // SSRF Guard: Block cloud metadata, loopback, IPv4-mapped IPv6, and DNS rebinding to private IPs
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(targetUrl);
    } catch {
      return NextResponse.json({ error: 'Geçersiz URL formatı.' }, { status: 400 });
    }

    const host = parsedUrl.hostname.toLowerCase().trim();
    const isAllowedHost = await validateHostSecurity(host);
    if (!isAllowedHost) {
      return NextResponse.json(
        { error: 'Güvenlik İhlali: Özel/Yerel ağ (RFC1918), Loopback veya Bulut Metadata adreslerine SSRF erişimi engellendi.' },
        { status: 403 }
      );
    }

    // Target endpoint resolution (e.g. https://192.168.1.100:8050/api/cloud-push)
    const endpoint = targetUrl.endsWith('/api/cloud-push')
      ? targetUrl
      : `${targetUrl}/api/cloud-push`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
      headers['x-agent-token'] = authToken;
    }

    const payload = JSON.stringify({ composeYaml, title });
    let relayRes: { status: number; body: string };

    try {
      relayRes = await makeRelayRequest(endpoint, headers, payload);
    } catch (relayErr: unknown) {
      // If HTTPS failed, try HTTP fallback
      if (endpoint.startsWith('https://')) {
        const httpEndpoint = endpoint.replace(/^https:\/\//, 'http://');
        relayRes = await makeRelayRequest(httpEndpoint, headers, payload);
      } else {
        throw relayErr;
      }
    }

    let parsedData: any = {};
    try {
      parsedData = JSON.parse(relayRes.body);
    } catch {}

    if (relayRes.status >= 400) {
      return NextResponse.json(
        { error: parsedData.error || `Ajan hata döndürdü (HTTP ${relayRes.status})` },
        { status: relayRes.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: parsedData.message || 'Stack başarıyla canlıya alındı!',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Bağlantı hatası';
    return NextResponse.json(
      {
        error: `Ajana ulaşılamadı (${errorMsg}). Sunucunuzda Port 8050 açık ve XIVIZLEY OS çalışıyor mu?`,
      },
      { status: 502 }
    );
  }
}
