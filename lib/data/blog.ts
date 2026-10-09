// ============================================================
// XIVIZLEY — Master SEO Blog & Homelab Knowledge Database
// lib/data/blog.ts
// 100% Mapped: Every single one of the 18 templates has a valid blog article
// ============================================================

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: 'media' | 'game' | 'cloud' | 'security' | 'devops' | 'ai';
  categoryLabel: string;
  readTime: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  publishedAt: string;
  updatedAt: string;
  templateId: string;
  tags: string[];
  icon: string;
  content: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    slug: 'minecraft-papermc-docker-kurulumu',
    title: 'Docker ile 1-Tıkla Minecraft PaperMC 1.21.4 Sunucusu Kurulumu',
    subtitle: 'ViaVersion, AuthMe ve EssentialsX eklentileriyle sıfır gecikmeli (20 TPS) sunucu kurma rehberi.',
    description: 'Linux VDS üzerinde Docker ve PaperMC kullanarak yüksek performanslı, eklenti destekli Minecraft 1.21.4 sunucusu nasıl kurulur? Adım adım anlatım.',
    category: 'game',
    categoryLabel: 'Oyun Sunucuları',
    readTime: '6 dk okuma',
    author: {
      name: 'Alperen',
      avatar: '⚡',
      role: 'XIVIZLEY Kurucu & Sistem Mimarı',
    },
    publishedAt: '2026-09-01',
    updatedAt: '2026-09-02',
    templateId: 'minecraft-papermc-ultimate',
    tags: ['Minecraft', 'PaperMC', 'Docker', 'VDS', 'ViaVersion', 'Port 25565'],
    icon: '⛏️',
    content: `
## Giriş: Neden PaperMC ve Docker?

Minecraft sunucusu işletirken en büyük iki zorluk **performans düşüşü (TPS düşmesi)** ve **bağımlılık çakışmalarıdır**. Standart Vanilla Java sunucuları tek çekirdeğe yüklenirken, **PaperMC** optimizasyonları sayesinde sunucu performansını %300'e kadar artırır.

---

## Kurulum ve Konfigürasyon

XIVIZLEY Mimarında hazırdır:

\`\`\`bash
# XIVIZLEY CLI ile doğrudan kurulum yapmak için:
durum kur minecraft
\`\`\`
`,
  },
  {
    id: '2',
    slug: 'nextcloud-homelab-rehberi',
    title: 'Kendi Gizli Bulut Depolamanızı Kurun: Nextcloud 28 + PostgreSQL',
    subtitle: 'Google Drive ve Dropbox\'a ücretsiz, uçtan uca şifreli ve limitsiz alternatif.',
    description: 'Verilerinizi kendi kontrolünüzde tutun. Docker Compose ile Nextcloud 28, PostgreSQL ve Redis önbellek mimarisini 5 dakikada kurun.',
    category: 'cloud',
    categoryLabel: 'Bulut Depolama',
    readTime: '8 dk okuma',
    author: {
      name: 'Alperen',
      avatar: '⚡',
      role: 'XIVIZLEY Kurucu & Sistem Mimarı',
    },
    publishedAt: '2026-09-01',
    updatedAt: '2026-09-02',
    templateId: 'nextcloud-collabora-office',
    tags: ['Nextcloud', 'PostgreSQL', 'Redis', 'Self-Hosted', 'Cloud'],
    icon: '☁️',
    content: `
## Kendi Bulut Sunucunuza Neden İhtiyacınız Var?

Ticari bulut sağlayıcıları dosya boyutlarına sınır getirirken, verilerinizi üçüncü taraf sunucularda tarar. **Nextcloud**, fotoğraflarınızı ve belgelerinizi kendi VDS sunucunuza otomatik senkronize eder.
`,
  },
  {
    id: '3',
    slug: 'jellyfin-4k-ev-sinemasi',
    title: 'Jellyfin + Radarr + Sonarr ile Otomatik 4K Medya Sunucusu',
    subtitle: 'Kendi reklamsız Netflix ve Spotify sunucunuzu oluşturun.',
    description: 'Jellyfin medya sunucusu, otomatik içerik indirici Radarr ve Sonarr ile evinizde 4K HDR sinema deneyimi yaşayın.',
    category: 'media',
    categoryLabel: 'Medya & Akış',
    readTime: '7 dk okuma',
    author: {
      name: 'Alperen',
      avatar: '⚡',
      role: 'XIVIZLEY Kurucu & Sistem Mimarı',
    },
    publishedAt: '2026-09-01',
    updatedAt: '2026-09-02',
    templateId: 'ultimate-4k-media-suite',
    tags: ['Jellyfin', 'Radarr', 'Sonarr', 'Plex', '4K Sinema'],
    icon: '🎬',
    content: `
## Jellyfin Nedir?

Plex'in tamamen açık kaynaklı ve ücretsiz alternatifi olan **Jellyfin**, lisans ücreti istemeden tüm cihazlarınıza 4K içerik yayını yapar.
`,
  },
  {
    id: '4',
    slug: 'vaultwarden-sifre-kasasi-kurulumu',
    title: 'Vaultwarden ile Sınırsız ve Şifreli Parola Kasası Kurulumu',
    subtitle: 'Bitwarden altyapısını hafif C++ sürümüyle VDS sunucunuzda çalıştırın.',
    description: '1Password ve LastPass fiyat artışlarından kaçının. Tüm cihazlarınızda senkronize çalışan ücretsiz Vaultwarden parola kasasını kurun.',
    category: 'security',
    categoryLabel: 'Ağ & Güvenlik',
    readTime: '5 dk okuma',
    author: {
      name: 'Alperen',
      avatar: '⚡',
      role: 'XIVIZLEY Kurucu & Sistem Mimarı',
    },
    publishedAt: '2026-09-01',
    updatedAt: '2026-09-02',
    templateId: 'cyber-security-fortress',
    tags: ['Vaultwarden', 'Bitwarden', 'Güvenlik', 'Parola Kasası', 'SSL'],
    icon: '🔐',
    content: `
## Vaultwarden Nedir?

**Vaultwarden**, Bitwarden'ın Rust/C++ ile yazılmış hafif sürümüdür. Sadece **15 MB RAM** harcar ve şifrelerinizi uçtan uca korur.
`,
  },
  {
    id: '5',
    slug: 'immich-google-fotograflar-alternatifi',
    title: 'Google Fotoğraflar\'a Yapay Zekalı Alternatif: Immich Kurulumu',
    subtitle: 'Yüz tanıma, nesne tespiti ve mobil otomatik yedekleme özellikli kendi fotoğraf sunucunuz.',
    description: 'Google Photos alan sınırından kurtulun. Docker Compose ile yüz tanıma ve yapay zeka destekli Immich fotoğraf arşivleme sunucusunu kurun.',
    category: 'media',
    categoryLabel: 'Medya & Depolama',
    readTime: '6 dk okuma',
    author: {
      name: 'Alperen',
      avatar: '⚡',
      role: 'XIVIZLEY Kurucu & Sistem Mimarı',
    },
    publishedAt: '2026-09-02',
    updatedAt: '2026-09-02',
    templateId: 'immich-ai-photo-vault',
    tags: ['Immich', 'Google Photos', 'AI', 'Yüz Tanıma', 'Docker'],
    icon: '📸',
    content: `
## Immich Nedir?

**Immich**, Google Fotoğraflar istemcisinin birebir açık kaynaklı ve yüksek performanslı alternatifidir. Mobil uygulamasıyla fotoğrafları otomatik yedekler.
`,
  },
  {
    id: '6',
    slug: 'home-assistant-docker-compose',
    title: 'Docker Compose ile Home Assistant Akıllı Ev Otomasyonu',
    subtitle: 'Tüm akıllı ev cihazlarınızı tek bir güvenli panelden yönetin.',
    description: 'Zigbee, Wi-Fi ve Bluetooth sensörlerinizi Home Assistant ile bağlayın. Docker üzerinde sıfır gecikmeli akıllı ev otomasyonu rehberi.',
    category: 'devops',
    categoryLabel: 'Otomasyon & DevOps',
    readTime: '7 dk okuma',
    author: {
      name: 'Alperen',
      avatar: '⚡',
      role: 'XIVIZLEY Kurucu & Sistem Mimarı',
    },
    publishedAt: '2026-09-02',
    updatedAt: '2026-09-02',
    templateId: 'home-assistant-smart-home',
    tags: ['Home Assistant', 'Akıllı Ev', 'IoT', 'Docker'],
    icon: '🏠',
    content: `
## Home Assistant Nedir?

**Home Assistant**, Apple HomeKit ve Google Home cihazlarını tek bir çatı altında toplayan açık kaynaklı akıllı ev merkezidir.
`,
  },
  {
    id: '7',
    slug: 'paperless-ngx-dokuman-yonetimi',
    title: 'Paperless-ngx ile Kağıtsız Ofis: Belgeleri OCR ile Dijitalleştirin',
    subtitle: 'Fatura, sözleşme ve belgelerinizi tarayıp indeksleyen yapay zekalı arşiv sistemi.',
    description: 'Fatura kaybetmeye son. Paperless-ngx ve Tesseract OCR ile tüm Türkçe belgelerinizi aranabilir dijital arşive dönüştürün.',
    category: 'cloud',
    categoryLabel: 'Kurumsal & Bulut',
    readTime: '6 dk okuma',
    author: {
      name: 'Alperen',
      avatar: '⚡',
      role: 'XIVIZLEY Kurucu & Sistem Mimarı',
    },
    publishedAt: '2026-09-02',
    updatedAt: '2026-09-02',
    templateId: 'paperless-ngx-dms',
    tags: ['Paperless-ngx', 'OCR', 'Evrak Arşivi', 'PDF', 'Docker'],
    icon: '📄',
    content: `
## Paperless-ngx Nedir?

**Paperless-ngx**, taranmış PDF belgelerini OCR ile okuyup arama yapılabilir hale getiren arşiv sistemidir.
`,
  },
  {
    id: '8',
    slug: 'wordpress-ultra-hiz-yigini',
    title: 'WordPress Ultra Hız Yığını: Redis + Nginx Proxy SSL Kurulumu',
    subtitle: 'Yüksek trafikli bloglar için Redis nesne önbelleği ve MariaDB optimizasyonu.',
    description: 'WordPress sitenizin açılış hızını milisaniyelere düşürün. Docker Compose ile WordPress, Redis ve Nginx Proxy Manager kurma rehberi.',
    category: 'cloud',
    categoryLabel: 'Web & CMS',
    readTime: '6 dk okuma',
    author: {
      name: 'Alperen',
      avatar: '⚡',
      role: 'XIVIZLEY Kurucu & Sistem Mimarı',
    },
    publishedAt: '2026-09-02',
    updatedAt: '2026-09-02',
    templateId: 'wordpress-ultra',
    tags: ['WordPress', 'Redis', 'MariaDB', 'Nginx', 'SEO'],
    icon: '🌐',
    content: `
## WordPress Önbellek Mimarisi

Redis nesne önbellekleme veritabanı sorgularını %90 azaltarak yüksek trafikte çökmesini önler.
`,
  },
  {
    id: '9',
    slug: 'ghost-cms-yayincilik-yigini',
    title: 'Ghost CMS ile Modern Bülten ve Paralı Yayıncılık Yığını',
    subtitle: 'SEO uyumlu, reklamsız ve süper hızlı haber/blog platformu.',
    description: 'Ghost CMS, MySQL 8 ve Nginx SSL ile abonelik tabanlı içerik platformunuzu 1 tıkla kurun.',
    category: 'cloud',
    categoryLabel: 'Web & CMS',
    readTime: '5 dk okuma',
    author: {
      name: 'Alperen',
      avatar: '⚡',
      role: 'XIVIZLEY Kurucu & Sistem Mimarı',
    },
    publishedAt: '2026-09-02',
    updatedAt: '2026-09-02',
    templateId: 'ghost-pro-publishing',
    tags: ['Ghost CMS', 'MySQL', 'Bülten', 'Yayıncılık'],
    icon: '✍️',
    content: `
## Ghost CMS Neden Tercih Edilir?

Node.js altyapısı sayesinde WordPress'e göre 20 kat daha hızlı yüklenir ve dahili e-posta bülten sistemi sunar.
`,
  },
  {
    id: '10',
    slug: 'strapi-headless-cms-rehberi',
    title: 'Strapi Headless CMS + PostgreSQL ile Esnek API Sunucusu',
    subtitle: 'Mobil uygulamalar ve React/Next.js siteleri için Node.js tabanlı CMS.',
    description: 'Özelleştirilebilir REST ve GraphQL API sunucusu Strapi CMS\'i Docker üzerinde yayınlama rehberi.',
    category: 'devops',
    categoryLabel: 'Geliştirici & DevOps',
    readTime: '7 dk okuma',
    author: {
      name: 'Alperen',
      avatar: '⚡',
      role: 'XIVIZLEY Kurucu & Sistem Mimarı',
    },
    publishedAt: '2026-09-02',
    updatedAt: '2026-09-02',
    templateId: 'strapi-headless-cms',
    tags: ['Strapi', 'Headless CMS', 'PostgreSQL', 'GraphQL'],
    icon: '🚀',
    content: `
## Headless CMS Avantajı

İçerik yönetimini ön yüzden ayırarak her istemciye (iOS, Android, Web) hızlı API verisi sunar.
`,
  },
  {
    id: '11',
    slug: 'audiobookshelf-sesli-kitap-sunucusu',
    title: 'Audiobookshelf ile Kendi Audible & Podcast Sunucunuzu Kurun',
    subtitle: 'Sesli kitaplarınızı ve podcast yayınlarınızı mobil cihazlarda dinleyin.',
    description: 'Kitap kaldığı yeri hatırlama, dinleme geçmişi ve çevrimdışı indirme destekli Audiobookshelf kurulum rehberi.',
    category: 'media',
    categoryLabel: 'Medya & Akış',
    readTime: '5 dk okuma',
    author: {
      name: 'Alperen',
      avatar: '⚡',
      role: 'XIVIZLEY Kurucu & Sistem Mimarı',
    },
    publishedAt: '2026-09-02',
    updatedAt: '2026-09-02',
    templateId: 'audiobookshelf-media',
    tags: ['Audiobookshelf', 'Audible', 'Podcast', 'Sesli Kitap'],
    icon: '🎧',
    content: `
## Kendi Sesli Kitap Arşiviniz

Audiobookshelf, dinleme konumunuzu tüm cihazlar arasında senkronize eder.
`,
  },
  {
    id: '12',
    slug: 'pihole-dns-reklam-engelleme',
    title: 'Pi-hole & Unbound DNS ile Tüm Ağda Reklam ve Takipçi Engelleme',
    subtitle: 'Akıllı TV, telefon ve bilgisayarlardaki tüm reklamları DNS seviyesinde süzün.',
    description: 'Ev ağınızdaki tüm cihazları reklam ve fidye yazılımlarından koruyun. Pi-hole ve Unbound recursive DNS kurulumu.',
    category: 'security',
    categoryLabel: 'Ağ & Güvenlik',
    readTime: '6 dk okuma',
    author: {
      name: 'Alperen',
      avatar: '⚡',
      role: 'XIVIZLEY Kurucu & Sistem Mimarı',
    },
    publishedAt: '2026-09-02',
    updatedAt: '2026-09-02',
    templateId: 'pihole-privacy-gateway',
    tags: ['Pi-hole', 'DNS', 'Unbound', 'Reklam Engelleme'],
    icon: '🛡️',
    content: `
## DNS Seviyesinde Filtreleme

Uygulama veya siteler açılmadan önce reklam sunucularına giden DNS sorgularını engeller.
`,
  },
  {
    id: '13',
    slug: 'fivem-gta5-sunucu-kurulumu',
    title: 'Linux VDS Üzerinde Docker ile FiveM GTA 5 Roleplay Sunucusu',
    subtitle: 'txAdmin, MariaDB ve artifact güncellemeleriyle yüksek performanslı RP sunucusu.',
    description: 'FiveM GTA V roleplay sunucunuzu Docker konteyneri ile sıfır gecikmeli kurun.',
    category: 'game',
    categoryLabel: 'Oyun Sunucuları',
    readTime: '8 dk okuma',
    author: {
      name: 'Alperen',
      avatar: '⚡',
      role: 'XIVIZLEY Kurucu & Sistem Mimarı',
    },
    publishedAt: '2026-09-02',
    updatedAt: '2026-09-02',
    templateId: 'fivem-roleplay-stack',
    tags: ['FiveM', 'GTA V', 'txAdmin', 'Roleplay', 'MariaDB'],
    icon: '🚗',
    content: `
## txAdmin & FiveM Altyapısı

txAdmin paneli sayesinde oyuncuları ve kaynakları (resources) web arayüzünden yönetin.
`,
  },
  {
    id: '14',
    slug: 'palworld-sunucu-kurulumu-docker',
    title: 'Docker ile Palworld Dedicated Sunucu Kurulumu ve RAM Optimizasyonu',
    subtitle: 'PalGuard ve otomatik kayıt yedeklemeli Palworld sunucusu işletme.',
    description: 'Linux VDS üzerinde Palworld dedicated server kurun, bellek sızıntılarını önleyin.',
    category: 'game',
    categoryLabel: 'Oyun Sunucuları',
    readTime: '6 dk okuma',
    author: {
      name: 'Alperen',
      avatar: '⚡',
      role: 'XIVIZLEY Kurucu & Sistem Mimarı',
    },
    publishedAt: '2026-09-02',
    updatedAt: '2026-09-02',
    templateId: 'palworld-dedicated-stack',
    tags: ['Palworld', 'SteamCMD', 'Dedicated Server', 'Oyun'],
    icon: '👾',
    content: `
## Palworld RAM Yönetimi

Palworld sunucuları zamanla bellek harcamasını artırır; otomatik yeniden başlatma scriptimiz RAM birikmesini önler.
`,
  },
  {
    id: '15',
    slug: 'cs2-counter-strike-2-sunucusu',
    title: 'Counter-Strike 2 (CS2) Linux Dedicated Sunucu Kurulumu',
    subtitle: 'Metamod:Source ve CS2 eklenti desteğiyle 128-tick performansı.',
    description: 'SteamCMD ve Docker ile CS2 maç ve topluluk sunucusu kurma rehberi.',
    category: 'game',
    categoryLabel: 'Oyun Sunucuları',
    readTime: '7 dk okuma',
    author: {
      name: 'Alperen',
      avatar: '⚡',
      role: 'XIVIZLEY Kurucu & Sistem Mimarı',
    },
    publishedAt: '2026-09-02',
    updatedAt: '2026-09-02',
    templateId: 'cs2-arena-stack',
    tags: ['CS2', 'Counter-Strike 2', 'SteamCMD', 'Metamod'],
    icon: '🎯',
    content: `
## CS2 Sunucu Performansı

Düşük ping ve 10 Gbps hat desteği için OWEB (TR Cloud) / Hosting.com.tr VDS lokasyonları önerilir.
`,
  },
  {
    id: '16',
    slug: 'romm-retro-oyun-kutuphanesi',
    title: 'RomM ile Kendi Retro Oyun Kütüphanenizi ve EmuDeck Sunucunuzu Kurun',
    subtitle: 'SNES, PS1, N64 ve GBA ROM\'larınızı web tarayıcısından oynayın.',
    description: 'Retro oyun koleksiyonunuzu görseller, kapaklar ve kayıt dosyalarıyla RomM platformunda barındırın.',
    category: 'game',
    categoryLabel: 'Oyun & Emülasyon',
    readTime: '5 dk okuma',
    author: {
      name: 'Alperen',
      avatar: '⚡',
      role: 'XIVIZLEY Kurucu & Sistem Mimarı',
    },
    publishedAt: '2026-09-02',
    updatedAt: '2026-09-02',
    templateId: 'romm-retro-arcade-stack',
    tags: ['RomM', 'Retro', 'ROM', 'Emülasyon', 'Arcade'],
    icon: '🕹️',
    content: `
## RomM Nedir?

RomM, tüm retro oyun ROM dosyalarınızı tarayıcı üzerinden emüle edip oynamanızı sağlayan kütüphanedir.
`,
  },
  {
    id: '17',
    slug: 'baserow-nocode-veritabani',
    title: 'Baserow ile Airtable Alternatifi Kodsuz (No-Code) Veritabanı Kurun',
    subtitle: 'Airtable kısıtlamaları olmadan kendi veri tablolarınızı ve otomasyonlarınızı oluşturun.',
    description: 'Docker Compose ile Baserow ve PostgreSQL No-Code veritabanı platformu kurulum rehberi.',
    category: 'devops',
    categoryLabel: 'Verimlilik & DevOps',
    readTime: '6 dk okuma',
    author: {
      name: 'Alperen',
      avatar: '⚡',
      role: 'XIVIZLEY Kurucu & Sistem Mimarı',
    },
    publishedAt: '2026-09-02',
    updatedAt: '2026-09-02',
    templateId: 'baserow-nocode-suite',
    tags: ['Baserow', 'Airtable', 'No-Code', 'PostgreSQL'],
    icon: '📊',
    content: `
## Baserow Advantage

Verilerinizi kendi PostgreSQL veritabanınızda tutarak sınırsız satır ve sütun kullanmanızı sağlar.
`,
  },
  {
    id: '18',
    slug: 'grafana-prometheus-izleme-yigini',
    title: 'Grafana + Prometheus + Node Exporter ile Sunucu İzleme Yığını',
    subtitle: 'VDS CPU, RAM, Disk I/O ve ağ trafiğini canlı grafiklerle takip edin.',
    description: 'Sunucularınızın sağlık durumunu anlık izleyin. Prometheus metrik toplayıcı ve Grafana dashboard kurulumu.',
    category: 'devops',
    categoryLabel: 'İzleme & DevOps',
    readTime: '8 dk okuma',
    author: {
      name: 'Alperen',
      avatar: '⚡',
      role: 'XIVIZLEY Kurucu & Sistem Mimarı',
    },
    publishedAt: '2026-09-02',
    updatedAt: '2026-09-02',
    templateId: 'production-observability',
    tags: ['Grafana', 'Prometheus', 'Node Exporter', 'Monitoring'],
    icon: '📈',
    content: `
## Canlı Sunucu İzleme

Prometheus tüm VDS metriklerini toplar, Grafana ise anlık görsel grafiklere dönüştürür.
`,
  },
  {
    id: '19',
    slug: 'casaos-ve-jellyfin-ile-kisisel-netflix-kurulumu',
    title: 'CasaOS & Jellyfin ile Evinizi 10 Dakikada Netflix\'e Dönüştürün (2026 Rehberi)',
    subtitle: 'Sıfır komut bilgisiyle 4K HDR kişisel medya sunucusu kurma ve OWEB 10 Gbps VDS optimizasyonları.',
    description: 'Evdeki bir cihaza veya Linux VDS sunucuya CasaOS ve Jellyfin kurarak kendi ücretsiz Netflix alternatifinizi nasıl oluşturursunuz? Donanım hızlandırma ve port yönlendirme rehberi.',
    category: 'media',
    categoryLabel: 'Medya & Akış',
    readTime: '7 dk okuma',
    author: {
      name: 'Alperen',
      avatar: '⚡',
      role: 'XIVIZLEY Kurucu & Sistem Mimarı',
    },
    publishedAt: '2026-09-10',
    updatedAt: '2026-09-10',
    templateId: 'ultimate-4k-media-suite',
    tags: ['CasaOS', 'Jellyfin', 'Homelab', 'Netflix Alternatifi', 'OWEB 10 Gbps', 'Docker', 'VDS'],
    icon: '🎬',
    content: `
## Neden Jellyfin ve CasaOS?

Abonelik ücretlerinin her geçen gün arttığı bu dönemde, arşivlediğiniz film ve dizileri kendi sunucunuzdan tüm cihazlarınıza (TV, telefon, tablet) aktarmak hiç olmadığı kadar popüler. **Jellyfin**, Plex'e tamamen açık kaynaklı ve ücretsiz en güçlü alternatiftir. **CasaOS** ise tüm bu Docker yığınını şık bir web masaüstü arayüzü ile yönetmenizi sağlar.

---

## 1. Hangi Altyapıyı Seçmelisiniz?

4K HDR içeriklerin donmadan ve takılmadan akabilmesi için sunucunuzun bant genişliği ve disk okuma hızı hayati önem taşır.

* **Yerel Ağ (Evde):** Eski bir mini PC veya Raspberry Pi 4/5 kullanabilirsiniz.
* **Bulut / VDS (Her Yerden Erişim):** Ev internetinin upload sınırına takılmamak için **OWEB TR Cloud (10 Gbit/s Port & Datacenter NVMe)** altyapısını öneriyoruz. 10 Gbps port hızı sayesinde aynı anda 10 farklı kullanıcıya 4K transcoding akışı dahi sağlasanız bant genişliği darboğazı yaşamazsınız.

---

## 2. 1-Tıkla Kurulum

XIVIZLEY ile bu mimariyi kurmak tek bir komuttan ibarettir. Temiz bir Ubuntu 24.04 sunucuda terminali açın ve çalıştırın:

\`\`\`bash
# XIVIZLEY 4K Medya Yığınını Otomatik Kur
curl -fsSL https://get.casaos.io | bash
\`\`\`

Ardından tarayıcınızdan \`http://sunucu-ip-adresiniz\` yazarak CasaOS paneline girin ve App Store'dan veya XIVIZLEY Architect tuvalinden Jellyfin modülünü ekleyin.

---

## 3. Donanım Hızlandırma (Transcoding) İpuçları

* Intel CPU kullanıyorsanız **QuickSync (QSV)** donanım hızlandırmasını aktif edin.
* \`docker-compose.yml\` içerisinde \`/dev/dri\` cihazını Jellyfin container'ına bağlayın.
* XIVIZLEY Architect üzerindeki **4K Medya Paketi** bu ayarları otomatik olarak tanımlı getirir.
`,
  },
];
