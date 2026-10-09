export interface FeaturedCommunityStack {
  id: string;
  title: string;
  author: {
    name: string;
    avatar: string;
    badge: string;
  };
  description: string;
  stars: number;
  comments: number;
  views: number;
  tags: string[];
  moduleIds: string[];
  difficulty: 'Kolay' | 'Orta' | 'İleri';
  color: string;
  createdAt: string;
}

export const FEATURED_COMMUNITY_STACKS: FeaturedCommunityStack[] = [
  {
    id: 'official-local-ai-studio',
    title: 'Yerel Yapay Zeka & LLM Stüdyosu (Ollama + Open-WebUI)',
    author: {
      name: 'Alperen (Founder)',
      avatar: '👑',
      badge: 'Kurucu Mimar',
    },
    description: 'Llama 3, DeepSeek R1 ve Mistral gibi yapay zeka modellerini kendi sunucunuzda GPU destekli çalıştırıp ChatGPT benzeri arayüzle kullanın.',
    stars: 1240,
    comments: 89,
    views: 7850,
    tags: ['Yapay Zeka', 'Ollama', 'LLM', 'Resmi'],
    moduleIds: ['ollama', 'open-webui', 'nginx-proxy-manager'],
    difficulty: 'Kolay',
    color: '#8b5cf6',
    createdAt: 'Bugün',
  },
  {
    id: 'media-cinema-beast',
    title: '4K HDR Ultimate Medya & Streaming Sunucusu',
    author: {
      name: 'HomelabberTR',
      avatar: '🎬',
      badge: 'Top Mimar',
    },
    description: 'Jellyfin, Radarr, Sonarr, Overseerr ve qBittorrent ile tam otomatik medya indirme ve 4K yayın merkezi.',
    stars: 642,
    comments: 48,
    views: 3120,
    tags: ['Medya', 'PVR', 'Torrent', '4K'],
    moduleIds: ['jellyfin', 'radarr', 'sonarr', 'overseerr', 'qbittorrent'],
    difficulty: 'Orta',
    color: '#06b6d4',
    createdAt: '2 gün önce',
  },
  {
    id: 'privacy-zero-trust',
    title: 'Zero-Trust Gizlilik & Reklam Engelleyici Kale',
    author: {
      name: 'SecOps_Ninja',
      avatar: '🛡️',
      badge: 'Güvenlik Uzmanı',
    },
    description: 'AdGuard Home DNS filtresi, Vaultwarden şifre kasası, WireGuard VPN ve 2FAuth iki adımlı doğrulama istasyonu.',
    stars: 819,
    comments: 63,
    views: 4590,
    tags: ['Güvenlik', 'VPN', 'DNS', 'Gizlilik'],
    moduleIds: ['adguard-home', 'vaultwarden', 'wireguard', '2fauth'],
    difficulty: 'Kolay',
    color: '#10b981',
    createdAt: '4 gün önce',
  },
  {
    id: 'gaming-party-hub',
    title: 'Multi-Game Dedicated Sunucu & Uzak Masaüstü',
    author: {
      name: 'ProGamer_99',
      avatar: '🎮',
      badge: 'Oyun Mimarı',
    },
    description: 'PaperMC Minecraft eklenti paketi, Palworld sunucusu, RustDesk şifreli uzak masaüstü ve Portainer yönetim paneli.',
    stars: 754,
    comments: 92,
    views: 5120,
    tags: ['Oyun', 'Minecraft', 'Palworld', 'Remote'],
    moduleIds: ['minecraft-paperm', 'palworld', 'rust-server', 'portainer'],
    difficulty: 'İleri',
    color: '#8b5cf6',
    createdAt: '1 hafta önce',
  },
  {
    id: 'ai-automation-dev',
    title: 'Yerel Yapay Zeka (AI) & İş Akışı Otomasyonu',
    author: {
      name: 'CloudDevOps',
      avatar: '🤖',
      badge: 'AI Lab',
    },
    description: 'N8N görsel API otomasyonu, Nextcloud özel bulut depolama, Glances donanım izleme ve Watchtower otomatik güncelleme.',
    stars: 528,
    comments: 31,
    views: 2840,
    tags: ['Otomasyon', 'n8n', 'Nextcloud', 'Monitoring'],
    moduleIds: ['n8n', 'nextcloud', 'glances', 'watchtower'],
    difficulty: 'Orta',
    color: '#f59e0b',
    createdAt: '3 gün önce',
  },
  {
    id: 'smart-family-cloud',
    title: 'Akıllı Ev, Aile Fotoğraf Arşivi & Sesli Kitap',
    author: {
      name: 'SmartHomeGuru',
      avatar: '🏠',
      badge: 'Aile Bulutu',
    },
    description: 'Immich yapay zeka destekli aile albümü, Mealie tarif yöneticisi, Audiobookshelf sesli kitap sunucusu ve Uptime Kuma.',
    stars: 490,
    comments: 27,
    views: 2210,
    tags: ['Aile', 'Fotoğraf', 'Yemek', 'Audiobook'],
    moduleIds: ['immich', 'mealie', 'audiobookshelf', 'uptime-kuma'],
    difficulty: 'Kolay',
    color: '#ec4899',
    createdAt: '5 gün önce',
  },
  {
    id: 'microservices-prod',
    title: 'Production Web & Microservices Altyapısı',
    author: {
      name: 'BackendGuru',
      avatar: '⚡',
      badge: 'Altyapı',
    },
    description: 'Nginx Proxy Manager SSL sonlandırıcı, PostgreSQL veritabanı, Redis cache önbelleği ve pgAdmin yönetim konsolu.',
    stars: 681,
    comments: 44,
    views: 3950,
    tags: ['Web', 'Nginx', 'PostgreSQL', 'Redis'],
    moduleIds: ['nginx-proxy-manager', 'postgresql', 'redis', 'pgadmin'],
    difficulty: 'İleri',
    color: '#3b82f6',
    createdAt: '1 hafta önce',
  },
];
