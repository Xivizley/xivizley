import { NextRequest, NextResponse } from 'next/server';
import { MODULE_CATALOG } from '@/lib/data/modules';
import { verifyTurnstileToken } from '@/lib/turnstile';

export const dynamic = 'force-dynamic';

interface AIArchitectResponse {
  title: string;
  explanation: string;
  nodes: Array<{ id: string; moduleId: string; x: number; y: number }>;
  edges: Array<{ source: string; target: string }>;
}

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(key: string, limit: number, windowMs: number = 3600000) {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }

  if (record.count >= limit) {
    return { allowed: false };
  }

  record.count += 1;
  return { allowed: true };
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, turnstileToken } = await request.json();

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return NextResponse.json({ error: 'Prompt gereklidir' }, { status: 400 });
    }

    // 🛡️ Rate Limiting: IP-based (5 valid requests/hour)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown-ip';
    const rateLimitKey = `ai_arch_${ip}`;
    const { allowed } = checkRateLimit(rateLimitKey, 5, 3600000);

    if (!allowed) {
      return NextResponse.json(
        { error: 'Çok fazla AI isteği gönderdiniz. Lütfen 1 saat sonra tekrar deneyiniz.' },
        { status: 429 }
      );
    }

    // Verify Turnstile only if explicitly passed
    if (turnstileToken) {
      const verifyRes = await verifyTurnstileToken(turnstileToken, ip);
      if (!verifyRes.success) {
        return NextResponse.json({ error: 'Güvenlik doğrulaması başarısız oldu' }, { status: 403 });
      }
    }

    const cleanPrompt = prompt.toLowerCase();
    const apiKey = process.env.GEMINI_API_KEY;

    // 1. If Gemini API Key is configured, try calling Gemini API first
    if (apiKey) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `Sen profesyonel bir Homelab, Kurumsal DevOps ve Linux Sunucu Mimarısın. Kullanıcının isteğine, hedef profiline (Aile, Bireysel, Orta Düzey Şirket, Üst Düzey Şirket) ve RAM (1GB, 2GB, 4GB, 6GB, 8GB, 12GB, 16GB, 32GB, 64GB) kısıtlamasına göre mevcut modüller arasından en uygun servisleri seçip bir mimari oluştur.

Mevcut Modüller:
${MODULE_CATALOG.map((m) => `- ${m.id} (${m.name}): ${m.description} [Kategori: ${m.category}]`).join('\n')}

Kullanıcı İsteği: "${prompt}"

Lütfen SADECE aşağıdaki JSON formatında geçerli bir yanıt dön:
{
  "title": "Mimarinin Kısa Başlığı (RAM ve Profili içersin)",
  "explanation": "Neden bu servislerin seçildiğine ve donanım uyumuna dair 1-2 cümlelik açıklama",
  "nodes": [
    { "id": "benzersiz_id", "moduleId": "gecerli_module_id", "x": 100, "y": 200 }
  ],
  "edges": [
    { "source": "kaynak_id", "target": "hedef_id" }
  ]
}
Düğümleri X: 100, 400, 700, 1000 ve Y: 100, 300 aralıklarıyla düzenli yerleştir.`,
                    },
                  ],
                },
              ],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.3,
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText) as AIArchitectResponse;
            const validModuleIds = new Set(MODULE_CATALOG.map((m) => m.id));
            const validNodes = (parsed.nodes || []).filter((n) => validModuleIds.has(n.moduleId));
            if (validNodes.length > 0) {
              return NextResponse.json({
                title: parsed.title || 'AI Tarafından Oluşturulan Mimari',
                explanation: parsed.explanation || 'İsteklerinize uygun servisler otomatik olarak yerleştirildi.',
                nodes: validNodes,
                edges: parsed.edges || [],
              });
            }
          }
        }
      } catch (geminiError) {
        console.warn('Gemini API request failed, falling back to smart heuristic matrix engine:', geminiError);
      }
    }

    // 2. Intelligent Semantic Rule Engine (Instant & 100% Reliable Matrix)
    const matchedModuleIds = new Set<string>();
    let title = 'Özel Homelab Mimarisi';
    let explanation = 'İsteğinize ve donanımınıza uygun servisler tuvale yerleştirildi.';

    // Extract exact RAM number with regex
    const ramMatch = cleanPrompt.match(/(\d+)\s*(?:gb|gigabyte|g\b)/i);
    const specifiedRam = ramMatch ? parseInt(ramMatch[1]!, 10) : null;

    // Detect Profile / Audience
    const isEnterprise = cleanPrompt.includes('üst düzey') || cleanPrompt.includes('kurumsal') || cleanPrompt.includes('holding') || cleanPrompt.includes('enterprise') || cleanPrompt.includes('büyük şirket');
    const isMidCompany = !isEnterprise && (cleanPrompt.includes('orta düzey') || cleanPrompt.includes('orta ölçek') || cleanPrompt.includes('şirket') || cleanPrompt.includes('kobi') || cleanPrompt.includes('startup') || cleanPrompt.includes('ofis') || cleanPrompt.includes('işyeri'));
    const isIndividual = cleanPrompt.includes('bireysel') || cleanPrompt.includes('kişisel') || cleanPrompt.includes('geliştirici') || cleanPrompt.includes('dev') || cleanPrompt.includes('kendim') || cleanPrompt.includes('personal');
    const isFamily = !isEnterprise && !isMidCompany && !isIndividual && (cleanPrompt.includes('aile') || cleanPrompt.includes('family') || cleanPrompt.includes('çocuk') || cleanPrompt.includes('ev'));

    // Base OS & Docker
    const useDebian = (specifiedRam !== null && specifiedRam <= 2) || (specifiedRam === null && (cleanPrompt.includes('düşük') || cleanPrompt.includes('hafif')));
    matchedModuleIds.add(useDebian ? 'debian' : 'ubuntu-server');
    matchedModuleIds.add('docker');

    // ═══════════════════════════════════════════════════════════════
    // MATRIX DISPATCHER: PROFILE + RAM
    // ═══════════════════════════════════════════════════════════════

    // ── 1. AİLE İÇİN (FAMILY / HOME) ──
    if (isFamily || (!isEnterprise && !isMidCompany && !isIndividual)) {
      if (specifiedRam !== null && specifiedRam <= 2) {
        title = `${specifiedRam} GB RAM Hafif Aile Sunucusu`;
        explanation = `${specifiedRam} GB RAM sınırına uygun, hafif tüketimli AdGuard Home (çocuk/reklam filtresi), Vaultwarden (şifreler), Mealie (yemek tarifleri) ve CasaOS eklendi.`;
        ['adguard-home', 'vaultwarden', 'mealie', 'casaos'].forEach((m) => matchedModuleIds.add(m));
      } else if (specifiedRam !== null && specifiedRam <= 6) {
        title = `${specifiedRam} GB RAM Dengeli Aile & Medya Sunucusu`;
        explanation = `${specifiedRam} GB RAM için optimize edilmiş Jellyfin medya akışı, Nextcloud aile bulutu, AdGuard DNS, Vaultwarden, Mealie ve Uptime Kuma hazırlandı.`;
        ['nextcloud', 'jellyfin', 'adguard-home', 'vaultwarden', 'mealie', 'uptime-kuma'].forEach((m) => matchedModuleIds.add(m));
      } else if (specifiedRam !== null && specifiedRam <= 12) {
        title = `${specifiedRam} GB RAM Gelişmiş Aile Multimedya Sunucusu`;
        explanation = `${specifiedRam} GB RAM gücüyle Jellyfin/Plex medya merkezi, Nextcloud, Immich fotoğraf yedekleme, Audiobookshelf, AdGuard, Vaultwarden ve WireGuard VPN kuruldu.`;
        ['nextcloud', 'immich', 'jellyfin', 'adguard-home', 'vaultwarden', 'audiobookshelf', 'mealie', 'wireguard', 'uptime-kuma'].forEach((m) => matchedModuleIds.add(m));
      } else {
        // 16, 32, 64+ GB
        const ramLabel = specifiedRam ? `${specifiedRam} GB RAM ` : '';
        title = `${ramLabel}Yüksek Güçlü Kapsamlı Aile Sunucusu`;
        explanation = `${ramLabel}kapasitesinden tam yararlanmak için 4K Medya (Plex), AI Fotoğraf (Immich), Nextcloud, Vaultwarden, AdGuard Home, Audiobookshelf, Mealie, Otomatik Dizi/Film İndirme ve İzleme servisleri eklendi.`;
        ['plex', 'immich', 'nextcloud', 'adguard-home', 'vaultwarden', 'audiobookshelf', 'mealie', 'overseerr', 'radarr', 'sonarr', 'qbittorrent', 'uptime-kuma', 'portainer'].forEach((m) => matchedModuleIds.add(m));
      }
    }

    // ── 2. BİREYSEL / GELİŞTİRİCİ (INDIVIDUAL / DEV) ──
    else if (isIndividual) {
      if (specifiedRam !== null && specifiedRam <= 2) {
        title = `${specifiedRam} GB RAM Bireysel Güvenlik & Tünel Sunucusu`;
        explanation = `${specifiedRam} GB RAM için optimize edilmiş WireGuard/Tailscale güvenli uzaktan erişim, Vaultwarden şifre kasası, 2FAuth ve Glances sistem takipçisi eklendi.`;
        ['wireguard', 'tailscale', 'vaultwarden', '2fauth', 'glances'].forEach((m) => matchedModuleIds.add(m));
      } else if (specifiedRam !== null && specifiedRam <= 6) {
        title = `${specifiedRam} GB RAM Bireysel Geliştirici & Otomasyon Sunucusu`;
        explanation = `${specifiedRam} GB RAM ile Nginx Proxy Manager, n8n iş akışı otomasyonu, Vaultwarden, WireGuard, Uptime Kuma ve qBittorrent hazırlandı.`;
        ['nginx-proxy-manager', 'n8n', 'vaultwarden', '2fauth', 'wireguard', 'uptime-kuma', 'qbittorrent'].forEach((m) => matchedModuleIds.add(m));
      } else if (specifiedRam !== null && specifiedRam <= 12) {
        title = `${specifiedRam} GB RAM Güçlü Bireysel Homelab & Bulut`;
        explanation = `${specifiedRam} GB RAM için Nextcloud, Immich fotoğraf yapay zekası, n8n otomasyon, Nginx Proxy Manager, WireGuard, Vaultwarden, Portainer ve Duplicati yedekleme eklendi.`;
        ['nextcloud', 'immich', 'n8n', 'nginx-proxy-manager', 'wireguard', 'vaultwarden', 'portainer', 'uptime-kuma', 'duplicati'].forEach((m) => matchedModuleIds.add(m));
      } else {
        // 16, 32, 64+ GB
        const ramLabel = specifiedRam ? `${specifiedRam} GB RAM ` : '';
        title = `${ramLabel}Üst Seviye Bireysel Power-User & Oyun/Geliştirici Stack`;
        explanation = `${ramLabel}gücüyle Nginx Proxy Manager, Cloudflared, n8n, Immich, Nextcloud, Vaultwarden, Portainer, Uptime Kuma, Glances, Minecraft PaperMC ve Duplicati entegre edildi.`;
        ['nginx-proxy-manager', 'cloudflared', 'n8n', 'immich', 'nextcloud', 'vaultwarden', '2fauth', 'tailscale', 'portainer', 'uptime-kuma', 'glances', 'minecraft-paperm', 'duplicati'].forEach((m) => matchedModuleIds.add(m));
      }
    }

    // ── 3. ORTA DÜZEY ŞİRKET (MID-TIER COMPANY / SMB / STARTUP) ──
    else if (isMidCompany) {
      if (specifiedRam !== null && specifiedRam <= 4) {
        title = `${specifiedRam || 4} GB RAM Orta Düzey Şirket Temel Altyapısı`;
        explanation = `KOBİ ve startup ekipleri için Nginx Proxy Manager (SSL), Vaultwarden (ekip şifreleri), 2FAuth, WireGuard şirket VPN'i, Uptime Kuma ve Duplicati otomatik yedekleme eklendi.`;
        ['nginx-proxy-manager', 'vaultwarden', '2fauth', 'wireguard', 'uptime-kuma', 'duplicati'].forEach((m) => matchedModuleIds.add(m));
      } else if (specifiedRam !== null && specifiedRam <= 12) {
        title = `${specifiedRam} GB RAM Orta Düzey Şirket İşbirliği & Otomasyon Sunucusu`;
        explanation = `${specifiedRam} GB RAM ile Nextcloud (ekip döküman & dosya paylaşımı), n8n (iş akışları ve CRM entegrasyonu), Vaultwarden, Nginx Proxy Manager, WireGuard, Portainer ve Uptime Kuma hazırlandı.`;
        ['nextcloud', 'n8n', 'nginx-proxy-manager', 'vaultwarden', '2fauth', 'wireguard', 'portainer', 'uptime-kuma', 'duplicati'].forEach((m) => matchedModuleIds.add(m));
      } else {
        // 16, 32, 64+ GB
        const ramLabel = specifiedRam ? `${specifiedRam} GB RAM ` : '';
        title = `${ramLabel}Orta Düzey Şirket Tam Kapsamlı Bulut & Otomasyon Altyapısı`;
        explanation = `${ramLabel}kurumsal donanımıyla Nextcloud Enterprise dosya işbirliği, n8n ileri seviye API otomasyonu, Nginx Proxy Manager, Cloudflared tüneli, Vaultwarden, Tailscale şube ağı, Portainer ve 7/24 Uptime Kuma izleme devrede.`;
        ['nextcloud', 'n8n', 'nginx-proxy-manager', 'cloudflared', 'vaultwarden', '2fauth', 'wireguard', 'tailscale', 'portainer', 'uptime-kuma', 'glances', 'duplicati'].forEach((m) => matchedModuleIds.add(m));
      }
    }

    // ── 4. ÜST DÜZEY ŞİRKET (KURUMSAL / ENTERPRISE) ──
    else if (isEnterprise) {
      if (specifiedRam !== null && specifiedRam <= 8) {
        title = `${specifiedRam || 8} GB RAM Kurumsal Güvenlik & Ağ Geçidi`;
        explanation = `Kurumsal seviyede Nginx Proxy Manager (WAF/SSL), Cloudflared Zero Trust, Vaultwarden (organizasyonel gizli anahtarlar), 2FAuth, WireGuard ve Uptime Kuma SLA izleme eklendi.`;
        ['nginx-proxy-manager', 'cloudflared', 'vaultwarden', '2fauth', 'wireguard', 'uptime-kuma', 'portainer', 'duplicati'].forEach((m) => matchedModuleIds.add(m));
      } else {
        // 16, 32, 64+ GB
        const ramLabel = specifiedRam ? `${specifiedRam} GB RAM ` : '';
        title = `${ramLabel}Üst Düzey Kurumsal Yüksek Erişilebilir Şirket Altyapısı`;
        explanation = `${ramLabel}güçlü kurumsal sunucular için Nginx Proxy Manager, Cloudflared Zero-Trust tünelleri, Nextcloud Enterprise, Vaultwarden organizasyon kasası, 2FAuth, n8n kurumsal API orkestrasyonu, Tailscale & WireGuard çoklu şube ağı, Portainer konteyner yönetimi, Uptime Kuma ve Duplicati şifreli yedekleme hazırlandı.`;
        ['nginx-proxy-manager', 'cloudflared', 'nextcloud', 'vaultwarden', '2fauth', 'n8n', 'wireguard', 'tailscale', 'portainer', 'uptime-kuma', 'glances', 'duplicati'].forEach((m) => matchedModuleIds.add(m));
      }
    }

    // ── 5. Specific Keyword Matchers (Direct user intent additions) ──
    if (cleanPrompt.includes('home assistant') || cleanPrompt.includes('akıllı ev') || cleanPrompt.includes('smart home') || cleanPrompt.includes('iot')) {
      matchedModuleIds.add('home-assistant');
      matchedModuleIds.add('nginx-proxy-manager');
    }
    if (cleanPrompt.includes('authentik') || cleanPrompt.includes('sso') || cleanPrompt.includes('kimlik') || cleanPrompt.includes('ldap') || cleanPrompt.includes('2fa')) {
      matchedModuleIds.add('authentik');
      matchedModuleIds.add('postgresql');
      matchedModuleIds.add('redis');
    }
    if (cleanPrompt.includes('searxng') || cleanPrompt.includes('arama motoru') || cleanPrompt.includes('search engine')) {
      matchedModuleIds.add('searxng');
    }
    if (cleanPrompt.includes('ollama') || cleanPrompt.includes('yapay zeka') || cleanPrompt.includes('llm') || cleanPrompt.includes('ai') || cleanPrompt.includes('deepseek')) {
      matchedModuleIds.add('ollama');
      matchedModuleIds.add('open-webui');
    }
    if (cleanPrompt.includes('minecraft') || cleanPrompt.includes('oyun') || cleanPrompt.includes('game')) {
      matchedModuleIds.add('minecraft-paperm');
    }
    if (cleanPrompt.includes('torrent') || cleanPrompt.includes('film') || cleanPrompt.includes('dizi') || cleanPrompt.includes('jellyfin') || cleanPrompt.includes('plex')) {
      if (!matchedModuleIds.has('jellyfin') && !matchedModuleIds.has('plex')) {
        matchedModuleIds.add('jellyfin');
      }
      matchedModuleIds.add('qbittorrent');
      matchedModuleIds.add('radarr');
      matchedModuleIds.add('sonarr');
    }

    // Convert matched modules to layout nodes & edges
    const nodes: Array<{ id: string; moduleId: string; x: number; y: number }> = [];
    const edges: Array<{ source: string; target: string }> = [];

    const modulesList = Array.from(matchedModuleIds);
    let col = 0;
    let row = 0;

    const baseOsId = useDebian ? 'debian' : 'ubuntu-server';

    modulesList.forEach((modId, index) => {
      const nodeId = `node_${modId}_${index}`;
      const x = 100 + col * 320;
      const y = 100 + row * 180;

      nodes.push({ id: nodeId, moduleId: modId, x, y });

      if (modId !== baseOsId && modId !== 'docker') {
        const dockerNode = nodes.find((n) => n.moduleId === 'docker');
        if (dockerNode) {
          edges.push({ source: dockerNode.id, target: nodeId });
        }
      } else if (modId === 'docker') {
        const osNode = nodes.find((n) => n.moduleId === baseOsId);
        if (osNode) {
          edges.push({ source: osNode.id, target: nodeId });
        }
      }

      row++;
      if (row >= 3) {
        row = 0;
        col++;
      }
    });

    return NextResponse.json({
      title,
      explanation,
      nodes,
      edges,
    });
  } catch (error) {
    console.error('AI Architect API Error:', error);
    return NextResponse.json({ error: 'AI mimarisi oluşturulurken hata oluştu' }, { status: 500 });
  }
}
