// ============================================================
// XIVIZLEY — Master Forum & Community Discussion Engine
// lib/data/forum.ts
// ============================================================

export interface ForumTopicItem {
  id: string;
  slug: string;
  title: string;
  category: 'genel' | 'vds' | 'docker' | 'mimari' | 'yardim';
  categoryLabel: string;
  categoryBadge: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  isPinned: boolean;
  viewCount: number;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
  content: string;
  templateId?: string;
  replies: Array<{
    id: string;
    author: {
      name: string;
      avatar: string;
      role: string;
    };
    content: string;
    createdAt: string;
  }>;
}

export const FORUM_TOPICS: ForumTopicItem[] = [
  {
    id: 'topic-1',
    slug: 'odeaweb-vds-docker-performance',
    title: '📢 10 Gbps NVMe VDS Sunucularda Docker Performansı ve Port Yapılandırması',
    category: 'vds',
    categoryLabel: 'VDS & Sunucu',
    categoryBadge: 'border-cyan-500/40 bg-cyan-950/30 text-cyan-300',
    author: {
      name: 'Alperen',
      avatar: '⚡',
      role: 'Sistem Yöneticisi',
    },
    isPinned: true,
    viewCount: 342,
    replyCount: 8,
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-02T08:30:00Z',
    content: `
OWEB (TR Cloud) ve Hosting.com.tr 10 Gbit/s NVMe VDS sunucularında XIVIZLEY tek tıkla kurulum scripti çalıştırırken maksimum I/O performansı almak için dikkat edilmesi gerekenler:

1. **Docker Storage Driver:** \`overlay2\` kullandığınızdan emin olun (\`docker info | grep Storage\`).
2. **Port 80 ve 443 Yönlendirmesi:** Sunucunuzda varsayılan Apache/Nginx kuruluysa durdurup Port 80'i Nginx Proxy Manager'a bırakın.
3. **UFW Güvenlik Duvarı:** Ajan portu 8050'yi sadece kendi IP'nize açmanız önerilir.

Sorularınız ve yaşadığınız port çakışmalarını bu başlık altından iletebilirsiniz!
    `,
    replies: [
      {
        id: 'r1',
        author: {
          name: 'Mehmet K.',
          avatar: '👨‍💻',
          role: 'Topluluk Üyesi',
        },
        content: 'Nginx Proxy Manager ile Port 80 çakışmasını XIVIZLEY çakışma motoru anında yakalayıp 8080 alternatifini önerdi, kurulum harika çalıştı.',
        createdAt: '2026-09-01T14:20:00Z',
      },
      {
        id: 'r2',
        author: {
          name: 'Caner T.',
          avatar: '🐧',
          role: 'DevOps Mühendisi',
        },
        content: 'NVMe disklerde I/O wait değeri %0.1 civarında, 12 konteynerlık stack 15 saniyede ayağa kalktı.',
        createdAt: '2026-09-02T09:10:00Z',
      },
    ],
  },
  {
    id: 'topic-2',
    slug: 'jellyfin-4k-transcoding-hardware-acceleration',
    title: '🎬 Jellyfin 4K NVENC/VAAPI Donanım İvmesi (Hardware Transcoding) Ayarları',
    category: 'mimari',
    categoryLabel: 'Mimari Tasarım',
    categoryBadge: 'border-indigo-500/40 bg-indigo-950/30 text-indigo-300',
    author: {
      name: 'Deniz A.',
      avatar: '🎬',
      role: 'Medya Homelab Uzmanı',
    },
    isPinned: false,
    viewCount: 189,
    replyCount: 5,
    createdAt: '2026-09-01T16:00:00Z',
    updatedAt: '2026-09-02T11:00:00Z',
    templateId: 'jellyfin-media',
    content: `
Jellyfin medya mimarisinde 4K HEVC/H.265 filmleri akıllı TV veya cep telefonuna izlerken CPU'yu %100 yapmamak için \`/dev/dri\` GPU passthrough cihazını konteynere bağlamanız gerekir.

XIVIZLEY editöründe Jellyfin modülünü seçtiğinizde cihaz ve ekran kartı tanıtımı otomatik hazırlanır.

Sorularınız ve GPU sürücü ayarları için yazabilirsiniz.
    `,
    replies: [],
  },
  {
    id: 'topic-3',
    slug: 'pihole-adguard-dns-conflict-solution',
    title: '🛡️ Port 53 Çakışması: systemd-resolved Nasıl Devre Dışı Bırakılır?',
    category: 'yardim',
    categoryLabel: 'Yardım & Destek',
    categoryBadge: 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300',
    author: {
      name: 'Alperen',
      avatar: '⚡',
      role: 'Sistem Yöneticisi',
    },
    isPinned: false,
    viewCount: 275,
    replyCount: 4,
    createdAt: '2026-09-02T07:00:00Z',
    updatedAt: '2026-09-02T12:00:00Z',
    content: `
Ubuntu / Debian sunucularda AdGuard Home veya Pi-hole kurarken sıklıkla karşılaşılan \`bind: address already in use (port 53)\` hatasının çözümü:

\`\`\`bash
# 1. systemd-resolved servisinde DNSStubListener'ı kapatın
sudo sed -i 's/#DNSStubListener=yes/DNSStubListener=no/' /etc/systemd/resolved.conf

# 2. Sembolik bağlantıyı güncelleyin ve servisi yeniden başlatın
sudo rm /etc/resolv.conf
sudo ln -s /run/systemd/resolve/resolv.conf /etc/resolv.conf
sudo systemctl restart systemd-resolved
\`\`\`

İşlem sonrası XIVIZLEY üzerinden AdGuard Home'u Port 53 ile sorunsuz başlatabilirsiniz.
    `,
    replies: [],
  },
];
