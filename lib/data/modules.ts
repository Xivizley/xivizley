// ============================================================
// XIVIZLEY Server Architect — Static Module Catalog
// lib/data/modules.ts
//
// This file is the SINGLE SOURCE OF TRUTH for all supported
// server components. It is imported client-side ONLY.
// Never fetch this data from the database — keep it static.
// ============================================================

import type { AdvancedSettingDef } from '../types';

// ─── Type Definitions ───────────────────────────────────────

export type ModuleCategory =
  | 'os'
  | 'platform'
  | 'network'
  | 'proxy'
  | 'tunnel'
  | 'app'
  | 'media'
  | 'security'
  | 'game'
  | 'storage';

export interface PortDefinition {
  /** Internal container port */
  internal: number;
  /** Default host port (user can override) */
  default: number;
  /** Human-readable label */
  label: string;
  /** Whether this port MUST NOT be remapped (e.g. DNS port 53) */
  locked?: boolean;
  /** Protocol */
  protocol?: 'tcp' | 'udp' | 'both';
}

export interface EnvVariable {
  key: string;
  defaultValue: string;
  description: string;
  required: boolean;
  secret?: boolean;
}

export interface VolumeDefinition {
  hostPath: string;
  containerPath: string;
  label: string;
}

export interface ModuleDependency {
  moduleId: string;
  reason: string;
}

export interface ResourceRequirement {
  ramMB: number;
  cpuCores: number;
  diskGB: number;
}

export interface ModuleDefinition {
  id: string;
  name: string;
  description: string;
  category: ModuleCategory;
  /** Docker Hub / GHCR image name */
  dockerImage: string;
  /** Semver or tag */
  defaultTag: string;
  ports: PortDefinition[];
  environment: EnvVariable[];
  volumes: VolumeDefinition[];
  /** Other modules that should be present for this to work properly */
  suggestedDependencies: ModuleDependency[];
  /** Runtime constraints or notes */
  notes: string[];
  /** Icon identifier (maps to Lucide icon name or custom SVG key) */
  icon: string;
  /** Accent colour for the canvas node card */
  color: string;
  /** Whether this module runs as host-level install vs. Docker container */
  isHostInstall?: boolean;
  /** Whether this is an OS selection (only one allowed per canvas) */
  isOS?: boolean;
  /** Java version requirement if applicable */
  javaVersion?: number;
  /** Dynamic advanced settings for this module */
  settings?: AdvancedSettingDef[];
  /** Estimated hardware resource requirements */
  resources?: ResourceRequirement;
}

// ─── Module Catalog ─────────────────────────────────────────

export const MODULE_CATALOG: ModuleDefinition[] = [
  // ──────────────────────────────────────────────────────────
  // OPERATING SYSTEMS
  // ──────────────────────────────────────────────────────────
  {
    id: 'ubuntu-server',
    name: 'Ubuntu Server',
    description: 'Ubuntu 22.04 LTS — en popüler Linux sunucu dağıtımı.',
    category: 'os',
    dockerImage: 'ubuntu',
    defaultTag: '22.04',
    ports: [],
    environment: [],
    volumes: [],
    suggestedDependencies: [],
    notes: [
      'Temel İşletim Sistemi seçimi. Mimari başına sadece bir işletim sistemi seçilebilir.',
      'apt tabanlı kurulum komutları oluşturur.',
    ],
    icon: 'Server',
    color: '#E95420',
    isHostInstall: true,
    isOS: true,
  },
  {
    id: 'debian',
    name: 'Debian',
    description: 'Debian 12 (Bookworm) — kararlı, minimal, yaygın destekli.',
    category: 'os',
    dockerImage: 'debian',
    defaultTag: 'bookworm-slim',
    ports: [],
    environment: [],
    volumes: [],
    suggestedDependencies: [],
    notes: [
      'Temel İşletim Sistemi seçimi. Mimari başına sadece bir işletim sistemi seçilebilir.',
      'apt tabanlı kurulum komutları oluşturur.',
    ],
    icon: 'Cpu',
    color: '#A80030',
    isHostInstall: true,
    isOS: true,
  },

  // ──────────────────────────────────────────────────────────
  // PLATFORM / RUNTIME
  // ──────────────────────────────────────────────────────────
  {
    id: 'docker',
    name: 'Docker Engine',
    description: 'Docker CE + Docker Compose eklentisi — konteyner çalışma zamanı temeli.',
    category: 'platform',
    dockerImage: '',
    defaultTag: '',
    ports: [],
    environment: [],
    volumes: [],
    suggestedDependencies: [],
    notes: [
      'Resmi Docker APT deposu aracılığıyla sunucu düzeyinde kurulum.',
      'Tüm konteyner tabanlı modüller için gereklidir.',
      'Oluşturulan komut: apt install docker-ce docker-compose-plugin',
    ],
    icon: 'Container',
    color: '#2496ED',
    isHostInstall: true,
  },
  {
    id: 'casaos',
    name: 'CasaOS',
    description: 'CasaOS kişisel bulut OS — kullanıcı dostu, Docker tabanlı ev laboratuvarı yönetim arayüzü.',
    category: 'platform',
    dockerImage: 'casaos/casaos',
    defaultTag: 'latest',
    ports: [
      { internal: 80, default: 80, label: 'Web UI (HTTP)', protocol: 'tcp' },
      { internal: 443, default: 443, label: 'Web UI (HTTPS)', protocol: 'tcp' },
    ],
    environment: [],
    volumes: [
      { hostPath: '/var/lib/casaos', containerPath: '/var/lib/casaos', label: 'CasaOS Data' },
    ],
    suggestedDependencies: [{ moduleId: 'docker', reason: 'CasaOS requires Docker Engine' }],
    notes: [
      'Resmi tek satırlık komutla kurulum: curl -fsSL https://get.casaos.io | sudo bash',
      'Port 80/443 Nginx Proxy Manager ile çakışır — sadece birini seçin.',
    ],
    icon: 'Home',
    color: '#0F7ACC',
    isHostInstall: true,
  },

  // ──────────────────────────────────────────────────────────
  // NETWORKING
  // ──────────────────────────────────────────────────────────
  {
    id: 'adguard-home',
    name: 'AdGuard Home',
    description: 'Ağ genelinde reklam ve izleyici engelleyen DNS sunucusu.',
    category: 'network',
    dockerImage: 'adguard/adguardhome',
    defaultTag: 'latest',
    ports: [
      { internal: 53,   default: 53,   label: 'DNS (TCP)', protocol: 'tcp', locked: true },
      { internal: 53,   default: 53,   label: 'DNS (UDP)', protocol: 'udp', locked: true },
      { internal: 80,   default: 3080, label: 'Setup / Web UI (HTTP)', protocol: 'tcp' },
      { internal: 443,  default: 3443, label: 'Web UI (HTTPS)', protocol: 'tcp' },
      { internal: 3000, default: 3000, label: 'Initial Setup UI', protocol: 'tcp' },
    ],
    environment: [],
    volumes: [
      { hostPath: './adguard/work',    containerPath: '/opt/adguardhome/work',    label: 'Work Dir' },
      { hostPath: './adguard/conf',    containerPath: '/opt/adguardhome/conf',    label: 'Config Dir' },
    ],
    suggestedDependencies: [{ moduleId: 'docker', reason: 'Runs as a Docker container' }],
    notes: [
      'Port 53 KİLİTLİDİR — İşletim sistemi düzeyindeki systemd-resolved önce devre dışı bırakılmalıdır.',
      'İlk kurulum 3000 portunda gerçekleşir; daha sonra 80/443 portlarına taşınır.',
      '53 portunu bağlayan başka herhangi bir hizmetle çakışır.',
    ],
    icon: 'ShieldCheck',
    color: '#67B346',
    settings: [
      {
        id: 'resetPassword',
        type: 'boolean',
        label: 'Şifreyi Sıfırla (admin / admin)',
        description: 'Bunu açarsanız, kurulum sonrası kullanıcı adı admin, şifre admin olur.',
        defaultValue: false,
      },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // REVERSE PROXY / TUNNELS
  // ──────────────────────────────────────────────────────────
  {
    id: 'nginx-proxy-manager',
    name: 'Nginx Proxy Manager',
    description: 'Let\'s Encrypt UI aracılığıyla SSL sertifikalarıyla kolay ters vekil sunucu (reverse proxy).',
    category: 'proxy',
    dockerImage: 'jc21/nginx-proxy-manager',
    defaultTag: 'latest',
    ports: [
      { internal: 80,  default: 80,  label: 'HTTP Proxy',   protocol: 'tcp' },
      { internal: 443, default: 443, label: 'HTTPS Proxy',  protocol: 'tcp' },
      { internal: 81,  default: 81,  label: 'Admin UI',     protocol: 'tcp' },
    ],
    environment: [],
    volumes: [
      { hostPath: './nginx-pm/data',   containerPath: '/data',              label: 'NPM Data' },
      { hostPath: './nginx-pm/letsencrypt', containerPath: '/etc/letsencrypt', label: 'SSL Certs' },
    ],
    suggestedDependencies: [{ moduleId: 'docker', reason: 'Runs as a Docker container' }],
    notes: [
      'Varsayılan giriş: admin@example.com / changeme (hemen değiştirin!).',
      '80 ve 443 portları CasaOS web UI ile çakışır — sadece bir tanesi bu portları bağlayabilir.',
    ],
    icon: 'Globe',
    color: '#F78C40',
  },
  {
    id: 'cloudflared',
    name: 'Cloudflare Tunnel',
    description: 'Yerel hizmetleri port yönlendirme olmadan dışa açan sıfır güven tüneli (Zero-trust tunnel).',
    category: 'tunnel',
    dockerImage: 'cloudflare/cloudflared',
    defaultTag: 'latest',
    ports: [],
    environment: [
      {
        key: 'TUNNEL_TOKEN',
        defaultValue: 'YOUR_TUNNEL_TOKEN_HERE',
        description: 'Cloudflare Zero Trust tünel tokenı — Zero Trust kontrol panelinden alın.',
        required: true,
        secret: true,
      },
    ],
    volumes: [],
    suggestedDependencies: [],
    notes: [
      'Gelen (inbound) port gerektirmez — sadece giden (outbound) tünel.',
      'Tokenınızı buradan edinin: Cloudflare Dashboard → Zero Trust → Networks → Tunnels.',
      'Eğer HTTP giriş (ingress) kullanılıyorsa, aynı 80/443 portlarında Nginx Proxy Manager ile uyumsuzdur.',
    ],
    icon: 'Cloud',
    color: '#F48120',
    settings: [
      {
        id: 'tunnelToken',
        type: 'string',
        label: 'Cloudflare Tunnel Token',
        description: 'Zero Trust dashboard\'dan aldığınız token.',
        placeholder: 'eyJhIjoi...',
        defaultValue: '',
      },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // SELF-HOSTED APPS
  // ──────────────────────────────────────────────────────────
  {
    id: 'nextcloud',
    name: 'Nextcloud',
    description: 'Kendi sunucunuzda barındırabileceğiniz üretkenlik platformu: dosyalar, takvim, kişiler ve daha fazlası.',
    category: 'app',
    dockerImage: 'nextcloud',
    defaultTag: '28-apache',
    ports: [
      { internal: 80, default: 8080, label: 'Web UI', protocol: 'tcp' },
    ],
    environment: [
      { key: 'NEXTCLOUD_ADMIN_USER', defaultValue: 'admin', description: 'Yönetici Kullanıcı Adı', required: true },
      { key: 'NEXTCLOUD_ADMIN_PASSWORD', defaultValue: 'CHANGE_ME_SECURE_PASSWORD', description: 'Yönetici Şifresi (En az 10 karakter güçlü şifre)', required: true, secret: true },
      { key: 'NEXTCLOUD_TRUSTED_DOMAINS', defaultValue: '*', description: 'Güvenilir Alan Adları (Tüm IP ve Domainlere Otomatik İzin Ver)', required: true },
      { key: 'SQLITE_DATABASE', defaultValue: 'nextcloud', description: 'Varsayılan Veritabanı', required: false },
    ],
    volumes: [
      { hostPath: './nextcloud/html', containerPath: '/var/www/html', label: 'Nextcloud Files' },
    ],
    suggestedDependencies: [{ moduleId: 'nginx-proxy-manager', reason: 'HTTPS reverse proxy recommended' }],
    notes: [
      'Ayrı bir MariaDB/MySQL konteyneri gerektirir (bir DB modülü ekleyin).',
      'HTTPS için bir ters vekil sunucu (Nginx PM veya Cloudflare Tunnel) kullanın.',
      '⚠️ "Güvenilmeyen etki alanı" hatasında tek komut: docker exec -u www-data nextcloud php occ config:system:set trusted_domains 1 --value="*"',
    ],
    icon: 'FolderCloud',
    color: '#0082C9',
    settings: [
      {
        id: 'dbType',
        type: 'select',
        label: 'Veritabanı Türü',
        description: 'Hangi veritabanı motorunu kullanacağınızı seçin.',
        defaultValue: 'sqlite',
        options: [
          { label: 'SQLite (Basit/Tek Kullanıcılı)', value: 'sqlite' },
          { label: 'PostgreSQL (Önerilen)', value: 'postgres' },
          { label: 'MariaDB', value: 'mariadb' },
        ],
      },
      {
        id: 'dataPath',
        type: 'string',
        label: 'Veri Depolama Yolu (Volume)',
        description: 'Dosyalarınızın ana makinede nerede saklanacağı.',
        defaultValue: './nextcloud/html',
        placeholder: '/mnt/storage/nextcloud',
      },
    ],
  },
  {
    id: 'immich',
    name: 'Immich',
    description: 'Yüksek performanslı, kendi sunucunuzda barındırabileceğiniz fotoğraf ve video yönetim çözümü.',
    category: 'app',
    dockerImage: 'ghcr.io/immich-app/immich-server',
    defaultTag: 'release',
    ports: [
      { internal: 2283, default: 2283, label: 'Web / API', protocol: 'tcp' },
    ],
    environment: [
      { key: 'DB_HOSTNAME',       defaultValue: 'immich_postgres', description: 'Postgres hostname',   required: true  },
      { key: 'DB_USERNAME',       defaultValue: 'postgres',        description: 'Postgres username',   required: true  },
      { key: 'DB_PASSWORD',       defaultValue: 'CHANGE_ME',       description: 'Postgres password',   required: true, secret: true },
      { key: 'DB_DATABASE_NAME',  defaultValue: 'immich',          description: 'Postgres DB name',    required: true  },
      { key: 'REDIS_HOSTNAME',    defaultValue: 'immich_redis',    description: 'Redis hostname',      required: true  },
      { key: 'UPLOAD_LOCATION',   defaultValue: './library',       description: 'Photo library path',  required: true  },
    ],
    volumes: [
      { hostPath: './immich/library', containerPath: '/usr/src/app/upload', label: 'Photo Library' },
    ],
    suggestedDependencies: [
      { moduleId: 'nginx-proxy-manager', reason: 'HTTPS reverse proxy recommended' },
    ],
    notes: [
      'Ayrıca immich-microservices, immich-machine-learning, redis ve postgres konteynerlerini gerektirir.',
      'Temel olarak immich.app sitesindeki resmi docker-compose.yml dosyasını kullanın — bu basitleştirilmiş bir versiyon oluşturur.',
    ],
    icon: 'Image',
    color: '#4250AF',
    settings: [
      {
        id: 'dbType',
        type: 'select',
        label: 'Veritabanı Türü',
        description: 'Immich için veritabanı motoru (Postgres önerilir).',
        defaultValue: 'postgres',
        options: [
          { label: 'PostgreSQL (Önerilen)', value: 'postgres' },
          { label: 'SQLite (Basit/Tek Kullanıcılı)', value: 'sqlite' },
        ],
      },
      {
        id: 'dataPath',
        type: 'string',
        label: 'Medya Depolama Yolu (Volume)',
        description: 'Fotoğraf ve videolarınızın saklanacağı klasör yolu.',
        defaultValue: './immich/library',
        placeholder: '/mnt/storage/immich',
      },
    ],
  },
  {
    id: 'jellyfin',
    name: 'Jellyfin',
    description: 'Özgür yazılım medya sistemi — medya koleksiyonunuzu her yere yayınlayın.',
    category: 'media',
    dockerImage: 'jellyfin/jellyfin',
    defaultTag: 'latest',
    ports: [
      { internal: 8096, default: 8096, label: 'HTTP Web UI',         protocol: 'tcp' },
      { internal: 8920, default: 8920, label: 'HTTPS Web UI',        protocol: 'tcp' },
      { internal: 7359, default: 7359, label: 'Auto-discovery (UDP)', protocol: 'udp' },
      { internal: 1900, default: 1900, label: 'DLNA Discovery (UDP)', protocol: 'udp' },
    ],
    environment: [
      { key: 'JELLYFIN_PublishedServerUrl', defaultValue: 'http://YOUR_SERVER_IP:8096', description: 'Public server URL', required: false },
    ],
    volumes: [
      { hostPath: './jellyfin/config', containerPath: '/config',   label: 'Config'         },
      { hostPath: './jellyfin/cache',  containerPath: '/cache',    label: 'Cache'          },
      { hostPath: '/mnt/media',        containerPath: '/media',    label: 'Media Library'  },
    ],
    suggestedDependencies: [],
    notes: [
      'GPU donanım hızlandırması (transcoding) için uygun cihaz geçişini (passthrough) ekleyin.',
      'Donanım hızlandırmayı düşünün: --device /dev/dri (Intel/AMD) veya NVIDIA runtime.',
    ],
    icon: 'Play',
    color: '#00A4DC',
    settings: [
      {
        id: 'hardwareAcceleration',
        type: 'boolean',
        label: 'Donanım İvmesi (Hardware Acceleration)',
        description: 'Video kod dönüştürme için /dev/dri aygıtını konteynere bağlar (Intel/AMD iGPU için).',
        defaultValue: false,
      },
      {
        id: 'mediaPath',
        type: 'string',
        label: 'Medya Klasörü Yolu',
        description: 'Filmlerinizin ve dizilerinizin bulunduğu ana klasör.',
        defaultValue: '/mnt/media',
        placeholder: '/mnt/storage/media',
      },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // SECURITY
  // ──────────────────────────────────────────────────────────
  {
    id: 'vaultwarden',
    name: 'Vaultwarden',
    description: 'Rust ile yazılmış gayri resmi Bitwarden uyumlu sunucu — hafif parola yöneticisi.',
    category: 'security',
    dockerImage: 'vaultwarden/server',
    defaultTag: 'latest',
    ports: [
      { internal: 80, default: 8180, label: 'Web UI / API', protocol: 'tcp' },
    ],
    environment: [
      { key: 'ADMIN_TOKEN',      defaultValue: 'CHANGE_ME_STRONG_TOKEN', description: 'Admin panel token (use openssl rand)',   required: true, secret: true },
      { key: 'SIGNUPS_ALLOWED',  defaultValue: 'false',                  description: 'Allow new user sign-ups',               required: false },
      { key: 'DOMAIN',           defaultValue: 'https://vault.yourdomain.com', description: 'Public URL (required for HTTPS)', required: true  },
    ],
    volumes: [
      { hostPath: './vaultwarden/data', containerPath: '/data', label: 'Vault Data' },
    ],
    suggestedDependencies: [{ moduleId: 'nginx-proxy-manager', reason: 'HTTPS is REQUIRED by Bitwarden clients' }],
    notes: [
      'HTTPS zorunludur — Bitwarden istemcileri HTTP üzerinden bağlanmayı reddeder.',
      'ADMIN_TOKEN oluşturmak için: openssl rand -base64 48',
      'Hesabınızı oluşturduktan sonra SIGNUPS_ALLOWED=false olarak ayarlayın.',
    ],
    icon: 'Lock',
    color: '#175DDC',
    settings: [
      {
        id: 'enableAdmin',
        type: 'boolean',
        label: 'Admin Panelini Etkinleştir',
        description: 'Web üzerinden admin ayarlarına erişimi açar.',
        defaultValue: true,
      },
      {
        id: 'allowSignups',
        type: 'boolean',
        label: 'Yeni Kullanıcı Kayıtlarına İzin Ver',
        description: 'Kendi hesabınızı oluşturduktan sonra bunu kapatmanız önerilir.',
        defaultValue: false,
      },
    ],
  },
  {
    id: '2fauth',
    name: '2FAuth',
    description: 'Web tabanlı, kendi sunucunuzda barındırabileceğiniz 2FA (TOTP/HOTP) kimlik doğrulayıcı uygulaması.',
    category: 'security',
    dockerImage: '2fauth/2fauth',
    defaultTag: 'latest',
    ports: [
      { internal: 8000, default: 8008, label: 'Web UI', protocol: 'tcp' },
    ],
    environment: [
      { key: 'APP_NAME',  defaultValue: '2FAuth',                      description: 'Application name',     required: false },
      { key: 'APP_URL',   defaultValue: 'http://localhost:8008',        description: 'Public URL',           required: true  },
      { key: 'APP_KEY',   defaultValue: 'base64:CHANGE_ME_32_CHARS',   description: 'Laravel app key',      required: true, secret: true },
    ],
    volumes: [
      { hostPath: './2fauth/data', containerPath: '/2fauth', label: '2FAuth Data' },
    ],
    suggestedDependencies: [],
    notes: [
      'APP_KEY oluşturmak için: php artisan key:generate --show (veya konteyner içi komutu kullanın).',
    ],
    icon: 'KeyRound',
    color: '#E74C3C',
  },

  // ──────────────────────────────────────────────────────────
  // GAME SERVERS
  // ──────────────────────────────────────────────────────────
  {
    id: 'minecraft-paperm',
    name: 'Minecraft PaperMC',
    description: 'Eklenti (plugin) destekli, yüksek performanslı Minecraft sunucu çatalı.',
    category: 'game',
    dockerImage: 'papermc/paper',
    defaultTag: 'latest',
    ports: [
      { internal: 25565, default: 25565, label: 'Game Port (TCP)', protocol: 'tcp' },
      { internal: 25565, default: 25565, label: 'Game Port (UDP)', protocol: 'udp' },
    ],
    environment: [
      { key: 'JAVA_OPTS', defaultValue: '-Xms1G -Xmx4G',   description: 'JVM bellek bayrakları',                    required: false },
      { key: 'EULA',      defaultValue: 'true',             description: 'Minecraft EULA kabulü',                   required: true  },
      { key: 'MEMORY',    defaultValue: '4G',               description: 'Sunucu RAM miktarı (örn: 2G, 4G, 8G)',   required: false },
      { key: 'VERSION',   defaultValue: '1.21.4',           description: 'Minecraft Sunucu Sürümü (1.21.4, 1.21.11, LATEST)', required: false },
      { key: 'TYPE',      defaultValue: 'PAPER',            description: 'Sunucu Türü (PAPER, PURPUR, VANILLA, FABRIC)', required: false },
    ],
    volumes: [
      { hostPath: './minecraft/data',    containerPath: '/data',    label: 'World & Config' },
      { hostPath: './minecraft/plugins', containerPath: '/plugins', label: 'Plugins'        },
    ],
    suggestedDependencies: [],
    notes: [
      'Java 21 gerektirir — Docker imajı bunu otomatik olarak halleder.',
      'Önerilen eklentiler: EssentialsX, AuthMe, ViaVersion, SkinsRestorer.',
      'Minecraft Son Kullanıcı Lisans Sözleşmesi\'ni kabul etmek için EULA=true olarak ayarlayın.',
      'En az 2GB RAM ayırın. Küçük bir topluluk sunucusu için 4GB önerilir.',
    ],
    icon: 'Gamepad2',
    color: '#4CAF50',
    javaVersion: 21,
  },
  {
    id: 'fivem',
    name: 'FiveM Server',
    description: 'Grand Theft Auto V için FiveM çok oyunculu (multiplayer) modu.',
    category: 'game',
    dockerImage: 'spritsail/fivem',
    defaultTag: 'latest',
    ports: [
      { internal: 30120, default: 30120, label: 'Game Port (TCP)', protocol: 'tcp' },
      { internal: 30120, default: 30120, label: 'Game Port (UDP)', protocol: 'udp' },
      { internal: 40120, default: 40120, label: 'txAdmin Web Panel', protocol: 'tcp' },
    ],
    environment: [
      { key: 'LICENSE_KEY',    defaultValue: 'YOUR_CFXRE_LICENSE_KEY', description: 'FiveM license key from keymaster.fivem.net', required: true, secret: true },
      { key: 'SERVER_NAME',    defaultValue: 'My FiveM Server',         description: 'Server display name',                        required: false },
      { key: 'MAX_CLIENTS',    defaultValue: '32',                      description: 'Maximum concurrent players',                 required: false },
    ],
    volumes: [
      { hostPath: './fivem/data',      containerPath: '/config',           label: 'Server Config' },
      { hostPath: './fivem/resources', containerPath: '/config/resources', label: 'FiveM Resources' },
    ],
    suggestedDependencies: [
      { moduleId: 'mysql', reason: 'Roleplay (QB-Core/ESX) scriptleri ve oyuncu verileri için MySQL/MariaDB gereklidir.' },
    ],
    notes: [
      'txAdmin web yönetim paneline http://sunucu-ip:40120 adresinden erişebilirsiniz.',
      'Lisans anahtarını buradan edinin: https://keymaster.fivem.net',
      'FiveM Hizmet Şartları, tüm oyuncuların yasal GTA V kopyasına sahip olmasını gerektirir.',
      'Güvenlik duvarı/yönlendiricinizde 30120 (TCP/UDP) ve 40120 (TCP) portları açık olmalıdır.',
    ],
    icon: 'Car',
    color: '#F44336',
  },
  {
    id: 'pi-hole',
    name: 'Pi-hole',
    description: 'Ağ genelinde reklam engelleyici ve DNS sunucusu.',
    category: 'network',
    dockerImage: 'pihole/pihole',
    defaultTag: 'latest',
    ports: [
      { internal: 53, default: 53, label: 'DNS (TCP)', protocol: 'tcp', locked: true },
      { internal: 53, default: 53, label: 'DNS (UDP)', protocol: 'udp', locked: true },
      { internal: 80, default: 8053, label: 'Web UI (HTTP)', protocol: 'tcp' },
    ],
    environment: [
      { key: 'TZ', defaultValue: 'Europe/Istanbul', description: 'Timezone', required: false },
      { key: 'WEBPASSWORD', defaultValue: 'CHANGE_ME', description: 'Web arayüzü parolası', required: true, secret: true },
    ],
    volumes: [
      { hostPath: './pihole/etc', containerPath: '/etc/pihole', label: 'Pi-hole Config' },
      { hostPath: './pihole/dnsmasq', containerPath: '/etc/dnsmasq.d', label: 'Dnsmasq Config' },
    ],
    suggestedDependencies: [],
    notes: [
      '53 portu kilitlidir — AdGuard Home veya systemd-resolved ile çakışabilir.',
      'İşletim sistemi düzeyinde systemd-resolved kullanılıyorsa kapatılması gerekir.',
    ],
    icon: 'ShieldBan',
    color: '#96060C',
    settings: [
      {
        id: 'resetPassword',
        type: 'boolean',
        label: 'Şifreyi Sıfırla (admin / admin)',
        description: 'Kurulumda admin şifresini admin olarak belirler.',
        defaultValue: false,
      },
    ],
  },
  {
    id: 'wireguard',
    name: 'WireGuard',
    description: 'Hızlı, modern ve güvenli VPN tüneli.',
    category: 'network',
    dockerImage: 'linuxserver/wireguard',
    defaultTag: 'latest',
    ports: [
      { internal: 51820, default: 51820, label: 'VPN Port (UDP)', protocol: 'udp', locked: true },
    ],
    environment: [
      { key: 'PUID', defaultValue: '1000', description: 'User ID', required: false },
      { key: 'PGID', defaultValue: '1000', description: 'Group ID', required: false },
      { key: 'TZ', defaultValue: 'Europe/Istanbul', description: 'Timezone', required: false },
      { key: 'SERVERURL', defaultValue: 'auto', description: 'Sunucu adresi veya IP (auto olabilir)', required: false },
      { key: 'PEERS', defaultValue: '3', description: 'Oluşturulacak peer (istemci) sayısı', required: false },
    ],
    volumes: [
      { hostPath: './wireguard/config', containerPath: '/config', label: 'WireGuard Config' },
      { hostPath: '/lib/modules', containerPath: '/lib/modules', label: 'Kernel Modules' },
    ],
    suggestedDependencies: [],
    notes: [
      'NET_ADMIN ve SYS_MODULE yeteneklerine (capabilities) ihtiyaç duyar.',
      'Host sistemin kernel modüllerine erişim gerektirir.',
    ],
    icon: 'Shield',
    color: '#88171A',
  },
  {
    id: 'tailscale',
    name: 'Tailscale',
    description: 'Sıfır yapılandırmalı mesh VPN ağı.',
    category: 'network',
    dockerImage: 'tailscale/tailscale',
    defaultTag: 'latest',
    ports: [],
    environment: [
      { key: 'TS_AUTHKEY', defaultValue: 'YOUR_TAILSCALE_AUTH_KEY', description: 'Tailscale yetkilendirme anahtarı', required: true, secret: true },
    ],
    volumes: [
      { hostPath: './tailscale/data', containerPath: '/var/lib/tailscale', label: 'Tailscale Data' },
      { hostPath: '/dev/net/tun', containerPath: '/dev/net/tun', label: 'TUN Device' },
    ],
    suggestedDependencies: [],
    notes: [
      'Port yönlendirmeye (port forwarding) gerek duymayan mesh VPN.',
      'Host sistemin /dev/net/tun aygıtına erişim gerektirir.',
    ],
    icon: 'Network',
    color: '#4B5563',
  },
  {
    id: 'portainer',
    name: 'Portainer',
    description: 'Docker ortamınızı yönetmek için hafif yönetim arayüzü.',
    category: 'platform',
    dockerImage: 'portainer/portainer-ce',
    defaultTag: 'latest',
    ports: [
      { internal: 9000, default: 9000, label: 'Web UI (HTTP)', protocol: 'tcp' },
      { internal: 9443, default: 9443, label: 'Web UI (HTTPS)', protocol: 'tcp' },
    ],
    environment: [],
    volumes: [
      { hostPath: '/var/run/docker.sock', containerPath: '/var/run/docker.sock', label: 'Docker Socket' },
      { hostPath: './portainer/data', containerPath: '/data', label: 'Portainer Data' },
    ],
    suggestedDependencies: [{ moduleId: 'docker', reason: 'Portainer requires Docker Engine' }],
    notes: [
      'Docker soketine (docker.sock) erişim gerektirir.',
      'İlk kurulumdan hemen sonra yönetici parolasını belirlemelisiniz.',
    ],
    icon: 'LayoutDashboard',
    color: '#13BEF9',
  },
  {
    id: 'plex',
    name: 'Plex Media Server',
    description: 'Medya koleksiyonunuzu düzenleyin ve herhangi bir cihaza yayınlayın.',
    category: 'media',
    dockerImage: 'linuxserver/plex',
    defaultTag: 'latest',
    ports: [
      { internal: 32400, default: 32400, label: 'Web UI', protocol: 'tcp' },
    ],
    environment: [
      { key: 'PUID', defaultValue: '1000', description: 'User ID', required: false },
      { key: 'PGID', defaultValue: '1000', description: 'Group ID', required: false },
      { key: 'TZ', defaultValue: 'Europe/Istanbul', description: 'Timezone', required: false },
      { key: 'VERSION', defaultValue: 'docker', description: 'Plex sürümü', required: false },
      { key: 'PLEX_CLAIM', defaultValue: 'YOUR_CLAIM_TOKEN', description: 'Plex hak talebi (claim) tokeni', required: false },
    ],
    volumes: [
      { hostPath: './plex/config', containerPath: '/config', label: 'Plex Config' },
      { hostPath: './plex/transcode', containerPath: '/transcode', label: 'Transcode Directory' },
      { hostPath: '/mnt/media', containerPath: '/data', label: 'Media Library' },
    ],
    suggestedDependencies: [],
    notes: [
      'Token almak için https://plex.tv/claim adresini ziyaret edebilirsiniz.',
      'Donanım hızlandırma (transcoding) için ekstra cihaz yapılandırması (passthrough) gerekebilir.',
    ],
    icon: 'Tv',
    color: '#E5A00D',
    settings: [
      {
        id: 'hardwareAcceleration',
        type: 'boolean',
        label: 'Donanım İvmesi (Hardware Acceleration)',
        description: 'Video kod dönüştürme için /dev/dri aygıtını konteynere bağlar (Intel/AMD iGPU için).',
        defaultValue: false,
      },
      {
        id: 'mediaPath',
        type: 'string',
        label: 'Medya Klasörü Yolu',
        description: 'Filmlerinizin ve dizilerinizin bulunduğu ana klasör.',
        defaultValue: '/mnt/media',
        placeholder: '/mnt/storage/media',
      },
    ],
  },
  {
    id: 'qbittorrent',
    name: 'qBittorrent',
    description: 'Hafif ve güçlü açık kaynaklı BitTorrent istemcisi.',
    category: 'storage',
    dockerImage: 'linuxserver/qbittorrent',
    defaultTag: 'latest',
    ports: [
      { internal: 8080, default: 8080, label: 'Web UI', protocol: 'tcp' },
      { internal: 6881, default: 6881, label: 'Torrent (TCP)', protocol: 'tcp' },
      { internal: 6881, default: 6881, label: 'Torrent (UDP)', protocol: 'udp' },
    ],
    environment: [
      { key: 'PUID', defaultValue: '1000', description: 'User ID', required: false },
      { key: 'PGID', defaultValue: '1000', description: 'Group ID', required: false },
      { key: 'TZ', defaultValue: 'Europe/Istanbul', description: 'Timezone', required: false },
      { key: 'WEBUI_PORT', defaultValue: '8080', description: 'Web UI Port', required: false },
    ],
    volumes: [
      { hostPath: './qbittorrent/config', containerPath: '/config', label: 'qBittorrent Config' },
      { hostPath: './downloads', containerPath: '/downloads', label: 'Downloads' },
    ],
    suggestedDependencies: [],
    notes: [
      'Varsayılan kullanıcı adı: admin, parolası ise loglardan (veya adminadmin/admin) öğrenilebilir.',
      '6881 portunun yönlendirici (router) üzerinden açılması indirme performansını artırır.',
    ],
    icon: 'Download',
    color: '#4285F4',
  },
  {
    id: 'uptime-kuma',
    name: 'Uptime Kuma',
    description: 'Kolay kullanımlı, kendi sunucunuzda barındırabileceğiniz hizmet izleme aracı.',
    category: 'app',
    dockerImage: 'louislam/uptime-kuma',
    defaultTag: 'latest',
    ports: [
      { internal: 3001, default: 3001, label: 'Web UI', protocol: 'tcp' },
    ],
    environment: [],
    volumes: [
      { hostPath: './uptime-kuma/data', containerPath: '/app/data', label: 'Uptime Kuma Data' },
    ],
    suggestedDependencies: [],
    notes: [
      'Kurulumdan sonra ilk ziyaretinizde yönetici hesabı oluşturmalısınız.',
      'Çok çeşitli bildirim servislerini (Telegram, Discord, vb.) destekler.',
    ],
    icon: 'Activity',
    color: '#5CDD8B',
  },
  {
    id: 'heimdall',
    name: 'Heimdall',
    description: 'Tüm web uygulamalarınız için şık bir uygulama kontrol paneli.',
    category: 'app',
    dockerImage: 'linuxserver/heimdall',
    defaultTag: 'latest',
    ports: [
      { internal: 80, default: 3080, label: 'Web UI (HTTP)', protocol: 'tcp' },
      { internal: 443, default: 3443, label: 'Web UI (HTTPS)', protocol: 'tcp' },
    ],
    environment: [
      { key: 'PUID', defaultValue: '1000', description: 'User ID', required: false },
      { key: 'PGID', defaultValue: '1000', description: 'Group ID', required: false },
      { key: 'TZ', defaultValue: 'Europe/Istanbul', description: 'Timezone', required: false },
    ],
    volumes: [
      { hostPath: './heimdall/config', containerPath: '/config', label: 'Heimdall Config' },
    ],
    suggestedDependencies: [],
    notes: [
      'Ana sayfanız olarak kullanabileceğiniz, hizmetlerinize kolay erişim sağlayan bir portal.',
    ],
    icon: 'LayoutGrid',
    color: '#FFD700',
  },
  {
    id: 'duplicati',
    name: 'Duplicati',
    description: 'Şifreli yedeklemeleri çevrimiçi depolamak için ücretsiz bir yedekleme istemcisi.',
    category: 'storage',
    dockerImage: 'linuxserver/duplicati',
    defaultTag: 'latest',
    ports: [
      { internal: 8200, default: 8200, label: 'Web UI', protocol: 'tcp' },
    ],
    environment: [
      { key: 'PUID', defaultValue: '1000', description: 'User ID', required: false },
      { key: 'PGID', defaultValue: '1000', description: 'Group ID', required: false },
      { key: 'TZ', defaultValue: 'Europe/Istanbul', description: 'Timezone', required: false },
    ],
    volumes: [
      { hostPath: './duplicati/config', containerPath: '/config', label: 'Duplicati Config' },
      { hostPath: './duplicati/backups', containerPath: '/backups', label: 'Local Backups' },
      { hostPath: '/source', containerPath: '/source', label: 'Source Files (to backup)' },
    ],
    suggestedDependencies: [],
    notes: [
      'Yedeklemek istediğiniz dizinleri konteyner içindeki /source yoluna bağlamalısınız.',
      'S3, FTP, WebDAV gibi birçok farklı hedefe yedekleme yapabilir.',
    ],
    icon: 'FolderSync',
    color: '#1A5C2F',
  },
  {
    id: 'overseerr',
    name: 'Overseerr',
    description: 'Medya talep ve keşif platformu. Plex ekosistemi ile entegre çalışır.',
    category: 'media',
    dockerImage: 'sctx/overseerr',
    defaultTag: 'latest',
    ports: [
      { internal: 5055, default: 5055, label: 'Web UI', protocol: 'tcp' },
    ],
    environment: [
      { key: 'PUID', defaultValue: '1000', description: 'User ID', required: false },
      { key: 'PGID', defaultValue: '1000', description: 'Group ID', required: false },
      { key: 'TZ', defaultValue: 'Europe/Istanbul', description: 'Timezone', required: false },
    ],
    volumes: [
      { hostPath: './overseerr/config', containerPath: '/app/config', label: 'Overseerr Config' },
    ],
    suggestedDependencies: [],
    notes: [],
    icon: 'Film',
    color: '#D97706',
  },
  {
    id: 'radarr',
    name: 'Radarr',
    description: 'Film koleksiyonu yöneticisi (PVR). Torrent ve Usenet ile otomatik indirir.',
    category: 'media',
    dockerImage: 'linuxserver/radarr',
    defaultTag: 'latest',
    ports: [
      { internal: 7878, default: 7878, label: 'Web UI', protocol: 'tcp' },
    ],
    environment: [
      { key: 'PUID', defaultValue: '1000', description: 'User ID', required: false },
      { key: 'PGID', defaultValue: '1000', description: 'Group ID', required: false },
      { key: 'TZ', defaultValue: 'Europe/Istanbul', description: 'Timezone', required: false },
    ],
    volumes: [
      { hostPath: './radarr/config', containerPath: '/config', label: 'Radarr Config' },
      { hostPath: './movies', containerPath: '/movies', label: 'Movies' },
      { hostPath: './downloads', containerPath: '/downloads', label: 'Downloads' },
    ],
    suggestedDependencies: [],
    notes: [],
    icon: 'Video',
    color: '#EAB308',
  },
  {
    id: 'sonarr',
    name: 'Sonarr',
    description: 'Dizi koleksiyonu yöneticisi. Yeni bölümleri otomatik takip eder ve indirir.',
    category: 'media',
    dockerImage: 'linuxserver/sonarr',
    defaultTag: 'latest',
    ports: [
      { internal: 8989, default: 8989, label: 'Web UI', protocol: 'tcp' },
    ],
    environment: [
      { key: 'PUID', defaultValue: '1000', description: 'User ID', required: false },
      { key: 'PGID', defaultValue: '1000', description: 'Group ID', required: false },
      { key: 'TZ', defaultValue: 'Europe/Istanbul', description: 'Timezone', required: false },
    ],
    volumes: [
      { hostPath: './sonarr/config', containerPath: '/config', label: 'Sonarr Config' },
      { hostPath: './tvshows', containerPath: '/tv', label: 'TV Shows' },
      { hostPath: './downloads', containerPath: '/downloads', label: 'Downloads' },
    ],
    suggestedDependencies: [],
    notes: [],
    icon: 'Tv',
    color: '#3B82F6',
  },
  {
    id: 'n8n',
    name: 'n8n',
    description: 'Açık kaynak iş akışı otomasyon platformu. Uygulamaları birbirine bağlar.',
    category: 'app',
    dockerImage: 'n8nio/n8n',
    defaultTag: 'latest',
    ports: [
      { internal: 5678, default: 5678, label: 'Web UI', protocol: 'tcp' },
    ],
    environment: [
      { key: 'GENERIC_TIMEZONE', defaultValue: 'Europe/Istanbul', description: 'Timezone', required: false },
      { key: 'WEBHOOK_URL', defaultValue: 'http://localhost:5678/', description: 'Webhook URL', required: false },
    ],
    volumes: [
      { hostPath: './n8n/data', containerPath: '/home/node/.n8n', label: 'n8n Data' },
    ],
    suggestedDependencies: [],
    notes: [],
    icon: 'Workflow',
    color: '#EF4444',
  },
  {
    id: 'glances',
    name: 'Glances',
    description: 'Sistem izleme (monitoring) aracı. CPU, RAM, Ağ ve Disk durumunu gösterir.',
    category: 'app',
    dockerImage: 'nicolargo/glances',
    defaultTag: 'latest-full',
    ports: [
      { internal: 61208, default: 61208, label: 'Web UI', protocol: 'tcp' },
      { internal: 61209, default: 61209, label: 'XML-RPC', protocol: 'tcp' },
    ],
    environment: [
      { key: 'GLANCES_OPT', defaultValue: '-w', description: 'Glances options', required: false },
    ],
    volumes: [
      { hostPath: '/var/run/docker.sock', containerPath: '/var/run/docker.sock:ro', label: 'Docker Socket' },
      { hostPath: '/', containerPath: '/host:ro', label: 'Host Root' },
    ],
    suggestedDependencies: [],
    notes: [],
    icon: 'Activity',
    color: '#10B981',
  },
  {
    id: 'mealie',
    name: 'Mealie',
    description: 'Tarif yöneticisi ve yemek planlayıcı.',
    category: 'app',
    dockerImage: 'ghcr.io/mealie-recipes/mealie',
    defaultTag: 'v1.0.0-beta-5',
    ports: [
      { internal: 9925, default: 9925, label: 'Web UI', protocol: 'tcp' },
    ],
    environment: [
      { key: 'ALLOW_SIGNUP', defaultValue: 'true', description: 'Allow signup', required: false },
      { key: 'PUID', defaultValue: '1000', description: 'User ID', required: false },
      { key: 'PGID', defaultValue: '1000', description: 'Group ID', required: false },
      { key: 'TZ', defaultValue: 'Europe/Istanbul', description: 'Timezone', required: false },
    ],
    volumes: [
      { hostPath: './mealie/data', containerPath: '/app/data/', label: 'Mealie Data' },
    ],
    suggestedDependencies: [],
    notes: [],
    icon: 'ChefHat',
    color: '#F97316',
  },
  {
    id: 'audiobookshelf',
    name: 'Audiobookshelf',
    description: 'Sesli kitap ve podcast barındırma/yayınlama sunucusu.',
    category: 'media',
    dockerImage: 'ghcr.io/advplyr/audiobookshelf',
    defaultTag: 'latest',
    ports: [
      { internal: 13378, default: 13378, label: 'Web UI', protocol: 'tcp' },
    ],
    environment: [
      { key: 'PUID', defaultValue: '1000', description: 'User ID', required: false },
      { key: 'PGID', defaultValue: '1000', description: 'Group ID', required: false },
      { key: 'TZ', defaultValue: 'Europe/Istanbul', description: 'Timezone', required: false },
    ],
    volumes: [
      { hostPath: './audiobookshelf/config', containerPath: '/config', label: 'Config' },
      { hostPath: './audiobookshelf/metadata', containerPath: '/metadata', label: 'Metadata' },
      { hostPath: './audiobooks', containerPath: '/audiobooks', label: 'Audiobooks' },
      { hostPath: './podcasts', containerPath: '/podcasts', label: 'Podcasts' },
    ],
    suggestedDependencies: [],
    notes: [],
    icon: 'Headphones',
    color: '#A855F7',
  },
  {
    id: 'romm',
    name: 'RomM',
    description: 'Retro oyun ROM yöneticisi ve kütüphanesi.',
    category: 'game',
    dockerImage: 'zurdi15/romm',
    defaultTag: 'latest',
    ports: [
      { internal: 8080, default: 8080, label: 'Web UI', protocol: 'tcp' },
    ],
    environment: [
      { key: 'DB_HOST', defaultValue: 'localhost', description: 'Database Host', required: false },
      { key: 'DB_PORT', defaultValue: '3306', description: 'Database Port', required: false },
    ],
    volumes: [
      { hostPath: './romm/library', containerPath: '/library', label: 'ROM Library' },
      { hostPath: './romm/assets', containerPath: '/assets', label: 'Assets' },
      { hostPath: './romm/config', containerPath: '/config', label: 'Config' },
    ],
    suggestedDependencies: [],
    notes: [],
    icon: 'Gamepad2',
    color: '#8B5CF6',
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    description: 'Gelişmiş açık kaynaklı ilişkisel veritabanı. Yüksek performans ve güvenilirlik sunar.',
    category: 'storage',
    dockerImage: 'postgres',
    defaultTag: '16-alpine',
    ports: [
      { internal: 5432, default: 5432, label: 'Postgres DB', protocol: 'tcp' },
    ],
    environment: [
      { key: 'POSTGRES_DB', defaultValue: 'immich', description: 'Veritabanı Adı', required: true },
      { key: 'POSTGRES_USER', defaultValue: 'postgres', description: 'Kullanıcı Adı', required: true },
      { key: 'POSTGRES_PASSWORD', defaultValue: 'CHANGE_ME_SECURE_PASSWORD', description: 'Kullanıcı Şifresi', required: true, secret: true },
    ],
    volumes: [
      { hostPath: './postgres/data', containerPath: '/var/lib/postgresql/data', label: 'DB Data' },
    ],
    suggestedDependencies: [],
    notes: ['Immich, Nextcloud veya diğer servisler için merkezi veritabanı motorudur.'],
    icon: 'Server',
    color: '#336791',
  },
  {
    id: 'redis',
    name: 'Redis',
    description: 'Yüksek performanslı bellek içi veri yapısı deposu ve önbellek sunucusu.',
    category: 'app',
    dockerImage: 'redis',
    defaultTag: '7-alpine',
    ports: [
      { internal: 6379, default: 6379, label: 'Redis Cache', protocol: 'tcp' },
    ],
    environment: [],
    volumes: [
      { hostPath: './redis/data', containerPath: '/data', label: 'Redis Data' },
    ],
    suggestedDependencies: [],
    notes: ['Immich ve Nextcloud için hızlı kuyruk ve önbellek sağlar.'],
    icon: 'Activity',
    color: '#DC382D',
  },
  {
    id: 'custom',
    name: 'Özel Konteyner',
    description: 'Kendi Docker imajınızı ve özel port/ortam değişkenlerinizi içeren bağımsız konteyner.',
    category: 'app',
    dockerImage: 'custom/image',
    defaultTag: 'latest',
    ports: [],
    environment: [],
    volumes: [],
    suggestedDependencies: [],
    notes: ['Özel Docker imajı tanımlamak için yapılandırma panelini kullanabilirsiniz.'],
    icon: 'Box',
    color: '#06b6d4',
  },
  {
    id: 'palworld',
    name: 'Palworld Server',
    description: 'Palworld adanmış (dedicated) çok oyunculu sunucusu.',
    category: 'game',
    dockerImage: 'thijsvanloef/palworld-server-docker',
    defaultTag: 'latest',
    ports: [
      { internal: 8211, default: 8211, label: 'Game Port (UDP)', protocol: 'udp' },
      { internal: 27015, default: 27015, label: 'RCON Port', protocol: 'tcp' },
    ],
    environment: [
      { key: 'SERVER_NAME', defaultValue: 'XIVIZLEY Palworld Server', description: 'Sunucu Görünen Adı', required: true },
      { key: 'SERVER_PASSWORD', defaultValue: 'Secret123', description: 'Giriş Şifresi', required: false, secret: true },
      { key: 'ADMIN_PASSWORD', defaultValue: 'AdminSecret123', description: 'Yönetici Şifresi', required: true, secret: true },
      { key: 'PLAYERS', defaultValue: '32', description: 'Maksimum Oyuncu Sayısı', required: true },
    ],
    volumes: [
      { hostPath: './palworld/data', containerPath: '/palworld', label: 'Oyun ve Kayıt Dosyaları' },
    ],
    resources: { ramMB: 8192, cpuCores: 4, diskGB: 30 },
    suggestedDependencies: [],
    notes: ['Palworld sunucusu en az 8 GB RAM ve 4 çekirdek CPU gerektirir.'],
    icon: 'Gamepad2',
    color: '#3B82F6',
  },
  {
    id: 'rust-server',
    name: 'Rust Dedicated Server',
    description: 'Rust hayatta kalma oyunu için tam yapılandırılmış sunucu.',
    category: 'game',
    dockerImage: 'didstopia/rust-server',
    defaultTag: 'latest',
    ports: [
      { internal: 28015, default: 28015, label: 'Game Port', protocol: 'udp' },
      { internal: 28016, default: 28016, label: 'RCON Web UI', protocol: 'tcp' },
      { internal: 28082, default: 28082, label: 'Rust+ Companion App', protocol: 'tcp' },
    ],
    environment: [
      { key: 'RUST_SERVER_NAME', defaultValue: 'XIVIZLEY Rust Server', description: 'Sunucu Adı', required: true },
      { key: 'RUST_RCON_PASSWORD', defaultValue: 'RconPass123', description: 'RCON Şifresi', required: true, secret: true },
      { key: 'RUST_MAXPLAYERS', defaultValue: '50', description: 'Oyuncu Limiti', required: true },
    ],
    volumes: [
      { hostPath: './rust/server', containerPath: '/steamcmd/rust', label: 'Rust Sunucu Dosyaları' },
    ],
    resources: { ramMB: 6144, cpuCores: 4, diskGB: 25 },
    suggestedDependencies: [],
    notes: ['Oyuncuların bağlanabilmesi için 28015 UDP portunun dışa açık olması gerekir.'],
    icon: 'Gamepad2',
    color: '#CE422B',
  },
  {
    id: 'filebrowser',
    name: 'FileBrowser',
    description: 'CasaOS benzeri web tabanlı görsel dosya yöneticisi. Sunucudaki tüm dosyaları tarayıcıdan düzenleyin, yükleyin ve yönetin.',
    category: 'app',
    dockerImage: 'filebrowser/filebrowser',
    defaultTag: 'latest',
    ports: [
      { internal: 80, default: 8088, label: 'Web UI', protocol: 'tcp' },
    ],
    environment: [],
    volumes: [
      { hostPath: '/root', containerPath: '/srv', label: 'Sunucu Dosyaları' },
      { hostPath: './filebrowser/data', containerPath: '/database', label: 'Veritabanı' },
      { hostPath: './filebrowser/config', containerPath: '/config', label: 'Ayarlar' },
    ],
    resources: { ramMB: 64, cpuCores: 1, diskGB: 1 },
    suggestedDependencies: [],
    notes: ['Varsayılan giriş: admin / admin. Giriş yaptıktan sonra şifrenizi değiştirmeyi unutmayın.'],
    icon: 'FolderSync',
    color: '#2196F3',
  },
  {
    id: 'wordpress',
    name: 'WordPress',
    description: 'Dünyanın en popüler web sitesi ve blog oluşturma platformu.',
    category: 'app',
    dockerImage: 'wordpress',
    defaultTag: 'latest',
    ports: [
      { internal: 80, default: 8085, label: 'Web Port' },
    ],
    environment: [
      { key: 'WORDPRESS_DB_HOST', defaultValue: 'mysql:3306', description: 'MySQL Sunucu Adresi', required: true },
      { key: 'WORDPRESS_DB_NAME', defaultValue: 'wordpress', description: 'Veritabanı Adı', required: true },
      { key: 'WORDPRESS_DB_USER', defaultValue: 'wp_user', description: 'Veritabanı Kullanıcısı', required: true },
      { key: 'WORDPRESS_DB_PASSWORD', defaultValue: 'wp_password123', description: 'Veritabanı Şifresi', required: true, secret: true },
    ],
    volumes: [
      { hostPath: './wordpress/html', containerPath: '/var/www/html', label: 'WordPress Site Dosyaları' },
    ],
    resources: { ramMB: 512, cpuCores: 1, diskGB: 5 },
    suggestedDependencies: [{ moduleId: 'mysql', reason: 'WordPress verilerini saklamak için MySQL gereklidir.' }],
    notes: ['Çalışması için bir MySQL veya MariaDB konteynerine bağlanmalıdır.'],
    icon: 'Globe',
    color: '#21759B',
  },
  {
    id: 'mysql',
    name: 'MySQL Server',
    description: 'İlişkisel veritabanı yönetim sistemi (RDBMS).',
    category: 'storage',
    dockerImage: 'mysql',
    defaultTag: '8.0',
    ports: [
      { internal: 3306, default: 3306, label: 'MySQL Port' },
    ],
    environment: [
      { key: 'MYSQL_ROOT_PASSWORD', defaultValue: 'rootpassword123', description: 'Root Şifresi', required: true, secret: true },
      { key: 'MYSQL_DATABASE', defaultValue: 'wordpress', description: 'Varsayılan Veritabanı', required: false },
      { key: 'MYSQL_USER', defaultValue: 'wp_user', description: 'Kullanıcı Adı', required: false },
      { key: 'MYSQL_PASSWORD', defaultValue: 'wp_password123', description: 'Kullanıcı Şifresi', required: false, secret: true },
    ],
    volumes: [
      { hostPath: './mysql/data', containerPath: '/var/lib/mysql', label: 'Veritabanı Depolama' },
    ],
    resources: { ramMB: 1024, cpuCores: 1, diskGB: 10 },
    suggestedDependencies: [],
    notes: ['Güçlü bir root şifresi belirlemeniz önerilir.'],
    icon: 'HardDrive',
    color: '#00758F',
  },
  {
    id: 'pgadmin',
    name: 'pgAdmin 4',
    description: 'PostgreSQL veritabanları için gelişmiş web tabanlı yönetim arayüzü.',
    category: 'platform',
    dockerImage: 'dpage/pgadmin4',
    defaultTag: 'latest',
    ports: [
      { internal: 80, default: 5050, label: 'Web Arayüzü' },
    ],
    environment: [
      { key: 'PGADMIN_DEFAULT_EMAIL', defaultValue: 'admin@xivizley.local', description: 'Giriş E-postası', required: true },
      { key: 'PGADMIN_DEFAULT_PASSWORD', defaultValue: 'Admin123!', description: 'Giriş Şifresi', required: true, secret: true },
    ],
    volumes: [
      { hostPath: './pgadmin/data', containerPath: '/var/lib/pgadmin', label: 'pgAdmin Verileri' },
    ],
    resources: { ramMB: 512, cpuCores: 1, diskGB: 2 },
    suggestedDependencies: [{ moduleId: 'postgresql', reason: 'PostgreSQL veritabanını yönetmek için kullanılır.' }],
    notes: ['PostgreSQL konteynerinize bağlanarak tabloları ve sorguları yönetebilirsiniz.'],
    icon: 'LayoutDashboard',
    color: '#336791',
  },
  {
    id: 'watchtower',
    name: 'Watchtower',
    description: 'Çalışan Docker konteynerlerini otomatik olarak en son sürüme günceller.',
    category: 'platform',
    dockerImage: 'containrrr/watchtower',
    defaultTag: 'latest',
    ports: [],
    environment: [
      { key: 'WATCHTOWER_CLEANUP', defaultValue: 'true', description: 'Eski İmajları Temizle', required: false },
      { key: 'WATCHTOWER_POLL_INTERVAL', defaultValue: '86400', description: 'Kontrol Aralığı (Saniye)', required: false },
    ],
    volumes: [
      { hostPath: '/var/run/docker.sock', containerPath: '/var/run/docker.sock', label: 'Docker Socket' },
    ],
    resources: { ramMB: 128, cpuCores: 0.5, diskGB: 1 },
    suggestedDependencies: [],
    notes: ['Docker socket erişimi gerektirir. Konteynerleriniz için otomatik arka plan güncelleyicisidir.'],
    icon: 'Activity',
    color: '#10B981',
  },
  {
    id: 'valheim',
    name: 'Valheim Dedicated Server',
    description: 'İskandinav mitolojisi temalı hayatta kalma oyunu sunucusu.',
    category: 'game',
    dockerImage: 'lloesche/valheim-server',
    defaultTag: 'latest',
    ports: [
      { internal: 2456, default: 2456, label: 'Game Port (UDP)', protocol: 'udp' },
      { internal: 2457, default: 2457, label: 'Steam Query Port (UDP)', protocol: 'udp' },
    ],
    environment: [
      { key: 'SERVER_NAME', defaultValue: 'XIVIZLEY Valheim Realm', description: 'Sunucu Adı', required: true },
      { key: 'WORLD_NAME', defaultValue: 'Dedicated', description: 'Dünya Adı', required: true },
      { key: 'SERVER_PASS', defaultValue: 'SecretValheim123', description: 'Sunucu Şifresi (Min 5 karakter)', required: true, secret: true },
      { key: 'SERVER_PUBLIC', defaultValue: 'true', description: 'Sunucu Listesinde Göster', required: false },
    ],
    volumes: [
      { hostPath: './valheim/saves', containerPath: '/config', label: 'Kayıt ve Dünya Dosyaları' },
      { hostPath: './valheim/server', containerPath: '/opt/valheim', label: 'Oyun Dosyaları' },
    ],
    resources: { ramMB: 4096, cpuCores: 2, diskGB: 10 },
    suggestedDependencies: [],
    notes: ['Valheim için 2456-2457 UDP portlarının yönlendirilmesi gerekir.'],
    icon: 'Gamepad2',
    color: '#B45309',
  },
  {
    id: 'project-zomboid',
    name: 'Project Zomboid Server',
    description: 'Zombi kıyametinde hayatta kalma çok oyunculu sunucusu.',
    category: 'game',
    dockerImage: 'renegademaster/zomboid-dedicated-server',
    defaultTag: 'latest',
    ports: [
      { internal: 16261, default: 16261, label: 'UDP Direct Port', protocol: 'udp' },
      { internal: 8766, default: 8766, label: 'Steam Port (UDP)', protocol: 'udp' },
    ],
    environment: [
      { key: 'SERVER_NAME', defaultValue: 'XIVIZLEY Zomboid Server', description: 'Sunucu Adı', required: true },
      { key: 'ADMIN_PASSWORD', defaultValue: 'AdminSecret123', description: 'Admin Şifresi', required: true, secret: true },
    ],
    volumes: [
      { hostPath: './zomboid/data', containerPath: '/home/steam/Zomboid', label: 'Zomboid Verileri ve Modlar' },
    ],
    resources: { ramMB: 4096, cpuCores: 2, diskGB: 15 },
    suggestedDependencies: [],
    notes: ['Modlu sunucular için minimum 6 GB RAM önerilir.'],
    icon: 'Gamepad2',
    color: '#991B1B',
  },
  {
    id: 'cs2-server',
    name: 'Counter-Strike 2 (CS2)',
    description: 'Valve Counter-Strike 2 / CS:GO Dedicated Server.',
    category: 'game',
    dockerImage: 'joedrumgoole/cs2-server',
    defaultTag: 'latest',
    ports: [
      { internal: 27015, default: 27016, label: 'Game Port (UDP)', protocol: 'udp' },
      { internal: 27020, default: 27020, label: 'GOTV Port (UDP)', protocol: 'udp' },
    ],
    environment: [
      { key: 'SRCDS_TOKEN', defaultValue: 'GSLT_TOKEN_HERE', description: 'Steam GSLT Token (Gerekli)', required: true, secret: true },
      { key: 'CS2_SERVERNAME', defaultValue: 'XIVIZLEY CS2 Server', description: 'Sunucu Adı', required: true },
      { key: 'CS2_RCONPW', defaultValue: 'RconSecret123', description: 'RCON Şifresi', required: true, secret: true },
      { key: 'CS2_MAXPLAYERS', defaultValue: '12', description: 'Oyuncu Limiti', required: true },
    ],
    volumes: [
      { hostPath: './cs2/data', containerPath: '/home/steam/cs2-dedicated', label: 'CS2 Sunucu Dosyaları' },
    ],
    resources: { ramMB: 4096, cpuCores: 4, diskGB: 35 },
    suggestedDependencies: [],
    notes: ['Steam üzerinden bir GSLT (Game Server Login Token) almanız gerekmektedir.'],
    icon: 'Gamepad2',
    color: '#F59E0B',
  },
  {
    id: 'terraria',
    name: 'Terraria Server (TShock)',
    description: 'TShock eklenti destekli Terraria çok oyunculu sunucusu.',
    category: 'game',
    dockerImage: 'ryshe/terraria',
    defaultTag: 'latest',
    ports: [
      { internal: 7777, default: 7777, label: 'Terraria Port (TCP)' },
    ],
    environment: [
      { key: 'WORLD_NAME', defaultValue: 'XIVIZLEY_World', description: 'Dünya İsmi', required: true },
      { key: 'SERVER_PASSWORD', defaultValue: 'Terra123', description: 'Giriş Şifresi', required: false, secret: true },
      { key: 'MAX_PLAYERS', defaultValue: '16', description: 'Oyuncu Limiti', required: true },
    ],
    volumes: [
      { hostPath: './terraria/world', containerPath: '/root/.local/share/Terraria/Worlds', label: 'Dünya Kayıtları' },
      { hostPath: './terraria/config', containerPath: '/config', label: 'TShock Ayarları' },
    ],
    resources: { ramMB: 2048, cpuCores: 1, diskGB: 5 },
    suggestedDependencies: [],
    notes: ['Hafif ve çok kararlı bir 2D macera oyun sunucusudur.'],
    icon: 'Gamepad2',
    color: '#10B981',
  },
  {
    id: 'assetto-corsa',
    name: 'Assetto Corsa Server',
    description: 'Simülasyon yarış oyunu Assetto Corsa dedicated sunucusu.',
    category: 'game',
    dockerImage: 'darik/assetto-corsa-server',
    defaultTag: 'latest',
    ports: [
      { internal: 9600, default: 9600, label: 'UDP Port', protocol: 'udp' },
      { internal: 9600, default: 9601, label: 'TCP Port', protocol: 'tcp' },
      { internal: 8081, default: 8086, label: 'HTTP Server Port', protocol: 'tcp' },
    ],
    environment: [
      { key: 'SERVER_NAME', defaultValue: 'XIVIZLEY Racing Track', description: 'Pist ve Sunucu Adı', required: true },
      { key: 'PASSWORD', defaultValue: 'Race123', description: 'Giriş Şifresi', required: false, secret: true },
    ],
    volumes: [
      { hostPath: './assetto/content', containerPath: '/server/content', label: 'Pistler ve Araçlar' },
      { hostPath: './assetto/cfg', containerPath: '/server/cfg', label: 'Sunucu Yapılandırması' },
    ],
    resources: { ramMB: 2048, cpuCores: 2, diskGB: 15 },
    suggestedDependencies: [],
    notes: ['Özel pist ve araç modlarınızı volume klasörüne kopyalayabilirsiniz.'],
    icon: 'Car',
    color: '#EF4444',
  },
  {
    id: 'ark-survival',
    name: 'ARK: Survival Evolved',
    description: 'Dinozor temalı açık dünya hayatta kalma sunucusu.',
    category: 'game',
    dockerImage: 'thrn/ark-server',
    defaultTag: 'latest',
    ports: [
      { internal: 7777, default: 7778, label: 'Game Port (UDP)', protocol: 'udp' },
      { internal: 27015, default: 27017, label: 'Query Port (UDP)', protocol: 'udp' },
      { internal: 32330, default: 32330, label: 'RCON Port', protocol: 'tcp' },
    ],
    environment: [
      { key: 'SESSION_NAME', defaultValue: 'XIVIZLEY ARK Server', description: 'Sunucu Adı', required: true },
      { key: 'SERVER_PASSWORD', defaultValue: 'ArkSecret123', description: 'Sunucu Şifresi', required: false, secret: true },
      { key: 'ADMIN_PASSWORD', defaultValue: 'AdminArk123', description: 'Admin Şifresi', required: true, secret: true },
    ],
    volumes: [
      { hostPath: './ark/saved', containerPath: '/ark/ShooterGame/Saved', label: 'Kayıt Dosyaları' },
    ],
    resources: { ramMB: 8192, cpuCores: 4, diskGB: 40 },
    suggestedDependencies: [],
    notes: ['ARK sunucusu yüksek bellek (RAM) ve disk alanı gerektirir.'],
    icon: 'Gamepad2',
    color: '#06B6D4',
  },
  {
    id: 'stirling-pdf',
    name: 'Stirling-PDF',
    description: 'Güçlü, %100 yerel ve gizlilik odaklı hepsi bir arada PDF araç kiti.',
    category: 'app',
    dockerImage: 'froodit/stirling-pdf',
    defaultTag: 'latest',
    ports: [
      { internal: 8080, default: 8085, label: 'Web UI', protocol: 'tcp' },
    ],
    environment: [
      { key: 'DOCKER_ENABLE_SECURITY', defaultValue: 'false', description: 'Kullanıcı giriş koruması', required: false },
      { key: 'INSTALL_BOOK_AND_ADVANCED_HTML_OPS', defaultValue: 'false', description: 'Gelişmiş dönüştürme araçları', required: false },
    ],
    volumes: [
      { hostPath: './stirling-pdf/configs', containerPath: '/configs', label: 'Ayarlar' },
      { hostPath: './stirling-pdf/logs', containerPath: '/logs', label: 'Loglar' },
    ],
    suggestedDependencies: [],
    notes: [
      'PDF birleştirme, bölme, OCR ile taranmış metin tanıma ve şifreleme/çözme işlemlerini tarayıcınızdan yapın.',
    ],
    icon: 'FileText',
    color: '#DC2626',
  },
  {
    id: 'rustdesk-server',
    name: 'RustDesk Server',
    description: 'Açık kaynaklı kendi kendine barındırılan uzaktan masaüstü sunucusu (AnyDesk / TeamViewer alternatifi).',
    category: 'network',
    dockerImage: 'rustdesk/rustdesk-server',
    defaultTag: 'latest',
    ports: [
      { internal: 21115, default: 21115, label: 'NAT Type Test', protocol: 'tcp' },
      { internal: 21116, default: 21116, label: 'ID/Rendezvous TCP', protocol: 'tcp' },
      { internal: 21116, default: 21116, label: 'ID/Rendezvous UDP', protocol: 'udp' },
      { internal: 21117, default: 21117, label: 'Relay Server', protocol: 'tcp' },
    ],
    environment: [],
    volumes: [
      { hostPath: './rustdesk/data', containerPath: '/root', label: 'Server Data & Keys' },
    ],
    suggestedDependencies: [],
    notes: [
      'Kendi özel ve şifreli uzaktan masaüstü altyapınızı oluşturmanızı sağlar.',
    ],
    icon: 'Shield',
    color: '#EA580C',
  },
  {
    id: 'gitea',
    name: 'Gitea',
    description: 'Hafif, bağımsız ve güçlü kendi kendine barındırılan Git/GitHub servisi.',
    category: 'platform',
    dockerImage: 'gitea/gitea',
    defaultTag: 'latest',
    ports: [
      { internal: 3000, default: 3000, label: 'Web UI', protocol: 'tcp' },
      { internal: 22, default: 2222, label: 'SSH Git Port', protocol: 'tcp' },
    ],
    environment: [
      { key: 'USER_UID', defaultValue: '1000', description: 'User ID', required: false },
      { key: 'USER_GID', defaultValue: '1000', description: 'Group ID', required: false },
    ],
    volumes: [
      { hostPath: './gitea/data', containerPath: '/data', label: 'Gitea Verileri' },
      { hostPath: '/etc/timezone', containerPath: '/etc/timezone', label: 'Zaman Dilimi' },
    ],
    suggestedDependencies: [
      { moduleId: 'postgresql', reason: 'Gelişmiş kullanıcı ve depo veritabanı' },
    ],
    notes: ['Kendi özel Git depolarınızı, issue tracker ve CI/CD pipeline süreçlerinizi yönetin.'],
    icon: 'GitBranch',
    color: '#609926',
  },
  {
    id: 'minio',
    name: 'MinIO S3 Storage',
    description: 'Yüksek performanslı, Amazon S3 uyumlu nesne depolama (Object Storage) sunucusu.',
    category: 'storage',
    dockerImage: 'minio/minio',
    defaultTag: 'latest',
    ports: [
      { internal: 9000, default: 9000, label: 'S3 API Port', protocol: 'tcp' },
      { internal: 9001, default: 9001, label: 'Web Konsolu', protocol: 'tcp' },
    ],
    environment: [
      { key: 'MINIO_ROOT_USER', defaultValue: 'admin', description: 'Yönetici Kullanıcı Adı', required: true },
      { key: 'MINIO_ROOT_PASSWORD', defaultValue: 'MinioAdminSecret123!', description: 'Yönetici Şifresi', required: true, secret: true },
    ],
    volumes: [
      { hostPath: './minio/data', containerPath: '/data', label: 'S3 Depolama Alanı' },
    ],
    suggestedDependencies: [],
    notes: ['Yedekleriniz ve dosyalarınız için AWS S3 standardında özel depolama sağlar.'],
    icon: 'HardDrive',
    color: '#C72C48',
  },
  {
    id: 'grafana',
    name: 'Grafana',
    description: 'Sunucu metrikleri, loglar ve sistem performansı için görselleştirme ve analiz paneli.',
    category: 'platform',
    dockerImage: 'grafana/grafana',
    defaultTag: 'latest',
    ports: [
      { internal: 3000, default: 3003, label: 'Web UI Dashboard', protocol: 'tcp' },
    ],
    environment: [
      { key: 'GF_SECURITY_ADMIN_USER', defaultValue: 'admin', description: 'Yönetici Adı', required: false },
      { key: 'GF_SECURITY_ADMIN_PASSWORD', defaultValue: 'GrafanaAdmin123!', description: 'Yönetici Şifresi', required: false, secret: true },
    ],
    volumes: [
      { hostPath: './grafana/data', containerPath: '/var/lib/grafana', label: 'Dashboard & Veriler' },
    ],
    suggestedDependencies: [
      { moduleId: 'glances', reason: 'Sistem metriklerini görselleştirmek için' },
    ],
    notes: ['Prometheus ve Glances verilerini canlı grafikler ve alarmlarla görselleştirir.'],
    icon: 'Activity',
    color: '#F46800',
  },
  {
    id: 'paperless-ngx',
    name: 'Paperless-ngx',
    description: 'Fatura, makbuz ve evraklarınızı OCR ile aranabilir dijital arşive dönüştürür.',
    category: 'storage',
    dockerImage: 'ghcr.io/paperless-ngx/paperless-ngx',
    defaultTag: 'latest',
    ports: [
      { internal: 8000, default: 8000, label: 'Web UI', protocol: 'tcp' },
    ],
    environment: [
      { key: 'PAPERLESS_REDIS', defaultValue: 'redis://redis:6379', description: 'Redis Bağlantısı', required: true },
      { key: 'PAPERLESS_TIME_ZONE', defaultValue: 'Europe/Istanbul', description: 'Zaman Dilimi', required: false },
      { key: 'PAPERLESS_OCR_LANGUAGE', defaultValue: 'tur+eng', description: 'OCR Dilleri', required: false },
    ],
    volumes: [
      { hostPath: './paperless/data', containerPath: '/usr/src/paperless/data', label: 'Veriler' },
      { hostPath: './paperless/media', containerPath: '/usr/src/paperless/media', label: 'Taranan Belgeler' },
      { hostPath: './paperless/export', containerPath: '/usr/src/paperless/export', label: 'Dışa Aktarma' },
      { hostPath: './paperless/consume', containerPath: '/usr/src/paperless/consume', label: 'İçeri Alma Klasörü' },
    ],
    suggestedDependencies: [
      { moduleId: 'redis', reason: 'OCR ve belge işleme kuyruğu' },
    ],
    notes: ['Consume klasörüne PDF veya resim attığınızda otomatik OCR yapıp etiketler.'],
    icon: 'FileText',
    color: '#059669',
  },
  {
    id: 'home-assistant',
    name: 'Home Assistant',
    description: 'Açık kaynaklı, gizlilik odaklı akıllı ev ve IoT otomasyon platformu.',
    category: 'app',
    dockerImage: 'ghcr.io/home-assistant/home-assistant',
    defaultTag: 'stable',
    ports: [
      { internal: 8123, default: 8123, label: 'Web UI', protocol: 'tcp' },
    ],
    environment: [
      { key: 'TZ', defaultValue: 'Europe/Istanbul', description: 'Zaman Dilimi', required: false },
    ],
    volumes: [
      { hostPath: './homeassistant/config', containerPath: '/config', label: 'Konfigürasyon' },
      { hostPath: '/etc/localtime', containerPath: '/etc/localtime', label: 'Zaman Dilimi' },
    ],
    suggestedDependencies: [],
    notes: ['Evdeki akıllı cihazlarınızı buluta bağımlı kalmadan yerel ağınızda yönetin.'],
    icon: 'Home',
    color: '#03A9F4',
  },
  {
    id: 'ghost',
    name: 'Ghost CMS',
    description: 'Yüksek hızlı, modern blog, bülten ve içerik yönetim sistemi.',
    category: 'app',
    dockerImage: 'ghost',
    defaultTag: '5-alpine',
    ports: [
      { internal: 2368, default: 2368, label: 'Web Port', protocol: 'tcp' },
    ],
    environment: [
      { key: 'NODE_ENV', defaultValue: 'production', description: 'Ortam', required: false },
      { key: 'url', defaultValue: 'http://localhost:2368', description: 'Blog URL Adresi', required: true },
    ],
    volumes: [
      { hostPath: './ghost/content', containerPath: '/var/lib/ghost/content', label: 'İçerik ve Temalar' },
    ],
    suggestedDependencies: [
      { moduleId: 'mysql', reason: 'Yüksek performanslı üretim veritabanı' },
    ],
    notes: ['Substack ve Medium alternatifi profesyonel blog ve bülten altyapısı.'],
    icon: 'Globe',
    color: '#7C3AED',
  },
  {
    id: 'pocketbase',
    name: 'PocketBase',
    description: 'Tek dosyada SQLite, gerçek zamanlı abonelikler ve kullanıcı yetkilendirme backend servisi.',
    category: 'platform',
    dockerImage: 'ghcr.io/muchobien/pocketbase',
    defaultTag: 'latest',
    ports: [
      { internal: 8090, default: 8090, label: 'Web Admin & API', protocol: 'tcp' },
    ],
    environment: [],
    volumes: [
      { hostPath: './pocketbase/pb_data', containerPath: '/pb_data', label: 'SQLite Veritabanı ve Dosyalar' },
    ],
    suggestedDependencies: [],
    notes: ['Firebase ve Supabase alternatifi, sıfır kurulum gerektiren ultra hafif backend.'],
    icon: 'Database',
    color: '#D97706',
  },
  {
    id: 'ollama',
    name: 'Ollama AI',
    description: 'Kendi sunucunda Llama 3, DeepSeek, Mistral gibi yerel yapay zeka modellerini çalıştırma motoru.',
    category: 'platform',
    dockerImage: 'ollama/ollama',
    defaultTag: 'latest',
    ports: [
      { internal: 11434, default: 11434, label: 'Ollama API Port', protocol: 'tcp' },
    ],
    environment: [
      { key: 'OLLAMA_ORIGINS', defaultValue: '*', description: 'CORS İzinleri', required: false },
    ],
    volumes: [
      { hostPath: './ollama/data', containerPath: '/root/.ollama', label: 'İndirilen Yapay Zeka Modelleri' },
    ],
    suggestedDependencies: [
      { moduleId: 'open-webui', reason: 'ChatGPT benzeri kullanıcı dostu sohbet arayüzü' },
    ],
    notes: ['Verileriniz sunucunuzda kalır, internete bağımlı olmadan yüksek hızlı yerel yapay zeka çalıştırır.'],
    icon: 'Bot',
    color: '#10B981',
  },
  {
    id: 'open-webui',
    name: 'Open WebUI',
    description: 'Ollama ve yerel yapay zeka modelleri için ChatGPT benzeri gelişmiş web sohbet arayüzü.',
    category: 'app',
    dockerImage: 'ghcr.io/open-webui/open-webui',
    defaultTag: 'main',
    ports: [
      { internal: 8080, default: 3080, label: 'Web UI Port', protocol: 'tcp' },
    ],
    environment: [
      { key: 'OLLAMA_BASE_URL', defaultValue: 'http://ollama:11434', description: 'Ollama Sunucu URL', required: true },
    ],
    volumes: [
      { hostPath: './open-webui/data', containerPath: '/app/backend/data', label: 'Kullanıcı Sohbetleri ve Ayarlar' },
    ],
    suggestedDependencies: [
      { moduleId: 'ollama', reason: 'Yapay zeka modellerini çalıştıran arka uç servisi' },
    ],
    notes: ['RAG doküman yükleme, sesli sohbet ve çoklu model desteğiyle tam teşekküllü AI stüdyosu.'],
    icon: 'Sparkles',
    color: '#3B82F6',
  },
  {
    id: 'valheim-server',
    name: 'Valheim Server',
    description: 'Valheim İskandinav mitolojisi hayatta kalma özel sunucusu.',
    category: 'game',
    dockerImage: 'lloesche/valheim-server',
    defaultTag: 'latest',
    ports: [
      { internal: 2456, default: 2456, label: 'Game Port (UDP)', protocol: 'udp' },
      { internal: 2457, default: 2457, label: 'Query Port (UDP)', protocol: 'udp' },
    ],
    environment: [
      { key: 'SERVER_NAME', defaultValue: 'XIVIZLEY Valheim Realm', description: 'Sunucu Adı', required: true },
      { key: 'WORLD_NAME', defaultValue: 'Dedicated', description: 'Dünya Adı', required: true },
      { key: 'SERVER_PASS', defaultValue: 'secret123', description: 'Giriş Şifresi (En az 5 karakter)', required: true, secret: true },
    ],
    volumes: [
      { hostPath: './valheim/config', containerPath: '/config', label: 'Dünya Kayıtları' },
      { hostPath: './valheim/data', containerPath: '/opt/valheim', label: 'Sunucu Dosyaları' },
    ],
    suggestedDependencies: [],
    notes: ['Crossplay (PC & Konsol) desteği, otomatik dünya yedekleme ve Discord webhook bildirimleri.'],
    icon: 'Shield',
    color: '#EAB308',
  },
  {
    id: 'minecraft-bedrock',
    name: 'Minecraft Bedrock Server',
    description: 'Telefon (Android & iOS), Tablet, Xbox ve Windows 10/11 için resmi adanmış (BDS) Minecraft Bedrock sunucusu.',
    category: 'game',
    dockerImage: 'itzg/minecraft-bedrock-server',
    defaultTag: 'latest',
    ports: [
      { internal: 19132, default: 19132, label: 'Bedrock Port (UDP)', protocol: 'udp', locked: true },
    ],
    environment: [
      { key: 'EULA', defaultValue: 'TRUE', description: 'Mojang EULA Kabulü', required: true },
      { key: 'SERVER_NAME', defaultValue: 'XIVIZLEY Bedrock Dedicated', description: 'Sunucu Adı', required: false },
      { key: 'GAMEMODE', defaultValue: 'survival', description: 'Oyun Modu', required: false },
      { key: 'DIFFICULTY', defaultValue: 'normal', description: 'Zorluk Seviyesi', required: false },
      { key: 'ONLINE_MODE', defaultValue: 'false', description: 'Xbox Live Giriş Zorunluluğu', required: false },
      { key: 'ALLOW_CHEATS', defaultValue: 'true', description: 'Hileler ve Komut İzinleri', required: false },
    ],
    volumes: [
      { hostPath: './bedrock/data', containerPath: '/data', label: 'Dünya ve Sunucu Dosyaları' },
    ],
    suggestedDependencies: [],
    notes: ['Resmi Bedrock Dedicated Server (BDS) motoru, Behavior/Resource paket desteği ve mobil/konsol doğrudan bağlantı.'],
    icon: 'Gamepad2',
    color: '#10B981',
  },
  {
    id: 'mosquitto',
    name: 'Mosquitto MQTT Broker',
    description: 'Hafif, popüler MQTT broker; IoT ve Home Assistant entegrasyonu için ideal.',
    category: 'network',
    dockerImage: 'eclipse-mosquitto',
    defaultTag: 'latest',
    ports: [
      { internal: 1883, default: 1883, label: 'MQTT (TCP)', protocol: 'tcp', locked: true },
      { internal: 9001, default: 9001, label: 'WebSocket (TCP)', protocol: 'tcp', locked: false },
    ],
    environment: [
      { key: 'TZ', defaultValue: 'Europe/Istanbul', description: 'Zaman Dilimi', required: false },
    ],
    volumes: [
      { hostPath: './mosquitto/config', containerPath: '/mosquitto/config', label: 'Mosquitto Config' },
      { hostPath: './mosquitto/data', containerPath: '/mosquitto/data', label: 'Mosquitto Data' },
    ],
    suggestedDependencies: [],
    notes: ['Home Assistant ve diğer IoT cihazlarıyla MQTT üzerinden iletişim kurmak için kullanılır.'],
    icon: 'Cloud',
    color: '#FF6600',
  },
  {
    id: 'tika',
    name: 'Apache Tika',
    description: 'Belge tipini algılayan ve içerik çıkaran servis; PDF, DOCX, ODT gibi formatlar.',
    category: 'app',
    dockerImage: 'apache/tika',
    defaultTag: 'latest',
    ports: [
      { internal: 9998, default: 9998, label: 'Tika REST (TCP)', protocol: 'tcp', locked: true },
    ],
    environment: [
      { key: 'TZ', defaultValue: 'Europe/Istanbul', description: 'Zaman Dilimi', required: false },
    ],
    volumes: [],
    suggestedDependencies: [],
    notes: ['Belge içeriği çıkarmak ve OCR işlemleri için diğer servislerle birlikte kullanılabilir.'],
    icon: 'FileText',
    color: '#0F9D58',
  },
  {
    id: 'gotenberg',
    name: 'Gotenberg PDF Generator',
    description: "Web API üzerinden HTML ve Markdown'ı PDF'ye dönüştüren servis.",
    category: 'app',
    dockerImage: 'thecodingmachine/gotenberg',
    defaultTag: '7',
    ports: [
      { internal: 3000, default: 3000, label: 'Gotenberg (TCP)', protocol: 'tcp', locked: true },
    ],
    environment: [
      { key: 'TZ', defaultValue: 'Europe/Istanbul', description: 'Zaman Dilimi', required: false },
    ],
    volumes: [],
    suggestedDependencies: [],
    notes: ['PDF raporları ve belgeleri otomatik oluşturmak için kullanılabilir.'],
    icon: 'FilePdf',
    color: '#4285F4',
  },
  {
    id: 'authentik',
    name: 'Authentik SSO & Identity',
    description: 'Açık kaynaklı kimlik sağlayıcı (IdP), 2FA ve Single Sign-On (SSO) yönetim platformu.',
    category: 'security',
    dockerImage: 'ghcr.io/goauthentik/server',
    defaultTag: 'latest',
    ports: [
      { internal: 9000, default: 9000, label: 'Authentik HTTP UI', protocol: 'tcp' },
      { internal: 9443, default: 9443, label: 'Authentik HTTPS UI', protocol: 'tcp' },
    ],
    environment: [
      { key: 'AUTHENTIK_SECRET_KEY', defaultValue: 'CHANGE_ME_SECRET', description: 'Gizli Anahtar', required: true, secret: true },
      { key: 'AUTHENTIK_REDIS__HOST', defaultValue: 'redis', description: 'Redis Host', required: true },
      { key: 'AUTHENTIK_POSTGRESQL__HOST', defaultValue: 'postgresql', description: 'Postgres Host', required: true },
    ],
    volumes: [
      { hostPath: './authentik/media', containerPath: '/media', label: 'Medya Verisi' },
      { hostPath: './authentik/custom-templates', containerPath: '/templates', label: 'Özel Şablonlar' },
    ],
    suggestedDependencies: [
      { moduleId: 'postgresql', reason: 'Kullanıcı veritabanı depolaması için gereklidir' },
      { moduleId: 'redis', reason: 'Oturum önbelleği için gereklidir' },
    ],
    notes: ['Tüm homelab servislerinize tek bir kurumsal hesap ve 2FA ile giriş yapın.'],
    icon: 'KeyRound',
    color: '#FD4B2D',
  },
  {
    id: 'searxng',
    name: 'SearXNG',
    description: 'Gizlilik odaklı, reklam içermeyen ve izleme yapmayan açık kaynaklı meta arama motoru.',
    category: 'app',
    dockerImage: 'searxng/searxng',
    defaultTag: 'latest',
    ports: [
      { internal: 8080, default: 8888, label: 'SearXNG Web UI', protocol: 'tcp' },
    ],
    environment: [
      { key: 'SEARXNG_BASE_URL', defaultValue: 'http://localhost:8888/', description: 'Site Temel URL', required: false },
    ],
    volumes: [
      { hostPath: './searxng', containerPath: '/etc/searxng', label: 'SearXNG Konfigürasyon' },
    ],
    suggestedDependencies: [],
    notes: ['Google, Bing ve DuckDuckGo sonuçlarını anonimleştirerek tek bir arayüzde birleştirir.'],
    icon: 'Globe',
    color: '#0084FF',
  },
  {
    id: 'supabase-studio',
    name: 'Supabase Studio',
    description: 'Açık kaynaklı Firebase alternatifi PostgreSQL yönetim arayüzü, REST API ve kimlik doğrulama merkezi.',
    category: 'app',
    dockerImage: 'supabase/studio',
    defaultTag: 'latest',
    ports: [
      { internal: 3000, default: 3000, label: 'Studio Web UI', protocol: 'tcp' },
      { internal: 8000, default: 8000, label: 'Kong API Gateway', protocol: 'tcp' },
    ],
    environment: [
      { key: 'STUDIO_PG_META_URL', defaultValue: 'http://meta:8080', description: 'Meta API URL', required: false },
      { key: 'SUPABASE_URL', defaultValue: 'http://localhost:8000', description: 'Supabase Temel URL', required: false },
    ],
    volumes: [
      { hostPath: './supabase/data', containerPath: '/var/lib/postgresql/data', label: 'Veritabanı Depolama' },
    ],
    suggestedDependencies: [
      { moduleId: 'postgresql', reason: 'Supabase ana veri katmanı için PostgreSQL gereklidir' },
      { moduleId: 'redis', reason: 'Gerçek zamanlı abonelikler ve önbellek için gereklidir' },
    ],
    notes: ['PostgreSQL 15, GoTrue Auth, PostgREST ve Kong API gateway ile entegre çalışır.'],
    icon: 'Database',
    color: '#3ECF8E',
    resources: { ramMB: 2048, cpuCores: 2, diskGB: 20 },
  },
  {
    id: 'pterodactyl-panel',
    name: 'Pterodactyl Panel',
    description: 'Minecraft, CS2, Rust ve oyun sunucularını web arayüzünden yönetmek için açık kaynaklı oyun kontrol paneli.',
    category: 'game',
    dockerImage: 'ghcr.io/pterodactyl/panel',
    defaultTag: 'latest',
    ports: [
      { internal: 80, default: 8085, label: 'Panel Web UI', protocol: 'tcp' },
      { internal: 443, default: 8445, label: 'SSL Portu', protocol: 'tcp' },
    ],
    environment: [
      { key: 'APP_ENV', defaultValue: 'production', description: 'Çalışma Ortamı', required: true },
      { key: 'APP_URL', defaultValue: 'http://localhost:8085', description: 'Panel URL', required: true },
      { key: 'DB_HOST', defaultValue: 'mariadb', description: 'Veritabanı Sunucusu', required: true },
    ],
    volumes: [
      { hostPath: './pterodactyl/var', containerPath: '/app/var/', label: 'Panel Verileri & Konfigürasyon' },
      { hostPath: './pterodactyl/logs', containerPath: '/app/storage/logs', label: 'Sistem Logları' },
    ],
    suggestedDependencies: [
      { moduleId: 'mysql', reason: 'Kullanıcı ve sunucu veritabanı için MariaDB gereklidir' },
      { moduleId: 'redis', reason: 'Kuyruk işlemleri ve önbellek için Redis gereklidir' },
    ],
    notes: ['Wings düğümleri ile iletişim kurarak oyun sunucusu konteynerlerini yönetir.'],
    icon: 'Gamepad2',
    color: '#0099FF',
    resources: { ramMB: 1024, cpuCores: 1, diskGB: 15 },
  },
  {
    id: 'comfyui',
    name: 'ComfyUI',
    description: 'Stable Diffusion, SDXL ve Flux modelleri için düğüm tabanlı profesyonel AI görsel üretim stüdyosu.',
    category: 'app',
    dockerImage: 'yanwk/comfyui-boot',
    defaultTag: 'latest',
    ports: [
      { internal: 8188, default: 8188, label: 'Web UI', protocol: 'tcp' },
    ],
    environment: [
      { key: 'CLI_ARGS', defaultValue: '--listen 0.0.0.0 --port 8188', description: 'Başlatma Parametreleri', required: false },
    ],
    volumes: [
      { hostPath: './comfyui/models', containerPath: '/app/models', label: 'AI Modelleri & Checkpoints' },
      { hostPath: './comfyui/output', containerPath: '/app/output', label: 'Çıktı Görselleri' },
    ],
    resources: { ramMB: 8192, cpuCores: 4, diskGB: 20 },
    suggestedDependencies: [],
    notes: ['NVIDIA GPU sürücüleriniz kuruluysa GPU hızlandırmasıyla çalışır.'],
    icon: 'Image',
    color: '#A855F7',
  },
  {
    id: 'dify',
    name: 'Dify AI',
    description: 'Görsel RAG pipeline ve yapay zeka ajan (agent) geliştirme platformu.',
    category: 'app',
    dockerImage: 'langgenius/dify-web',
    defaultTag: 'latest',
    ports: [
      { internal: 3000, default: 3005, label: 'Web UI', protocol: 'tcp' },
    ],
    environment: [
      { key: 'CONSOLE_API_URL', defaultValue: 'http://localhost:5001', description: 'API Backend URL', required: false },
    ],
    volumes: [
      { hostPath: './dify/storage', containerPath: '/app/storage', label: 'Vektör Verileri & Dosyalar' },
    ],
    resources: { ramMB: 4096, cpuCores: 2, diskGB: 10 },
    suggestedDependencies: [
      { moduleId: 'postgresql', reason: 'Uygulama ve ajan veritabanı' },
    ],
    notes: ['Ollama veya OpenAI modellerinizi bağlayarak kendi özel AI asistanlarınızı oluşturun.'],
    icon: 'Workflow',
    color: '#2563EB',
  },
  {
    id: 'flowise',
    name: 'Flowise',
    description: 'LangChain tabanlı sürükle-bırak yapay zeka sohbet robotu ve akış oluşturucu.',
    category: 'app',
    dockerImage: 'flowiseai/flowise',
    defaultTag: 'latest',
    ports: [
      { internal: 3000, default: 3006, label: 'Web UI', protocol: 'tcp' },
    ],
    environment: [
      { key: 'PORT', defaultValue: '3000', description: 'İç Port', required: false },
    ],
    volumes: [
      { hostPath: './flowise/data', containerPath: '/root/.flowise', label: 'Akış Veritabanı' },
    ],
    resources: { ramMB: 2048, cpuCores: 2, diskGB: 5 },
    suggestedDependencies: [
      { moduleId: 'ollama', reason: 'Yerel LLM modellerini bağlamak için' },
    ],
    notes: ['Kod yazmadan LangChain ajanları ve araç çağırma (tool calling) akışları tasarlayın.'],
    icon: 'Workflow',
    color: '#06B6D4',
  },
  {
    id: 'umami',
    name: 'Umami Analytics',
    description: 'Gizlilik odaklı, çerezsiz ve hafif açık kaynak web analiz platformu. Google Analytics alternatifi.',
    category: 'app',
    dockerImage: 'ghcr.io/umami-software/umami',
    defaultTag: 'postgresql-latest',
    ports: [
      { internal: 3000, default: 3005, label: 'Web UI', protocol: 'tcp' },
    ],
    environment: [
      { key: 'DATABASE_URL', defaultValue: 'postgresql://umami:umami_pass@postgres:5432/umami', description: 'PostgreSQL Bağlantı Adresi', required: true, secret: true },
      { key: 'DATABASE_TYPE', defaultValue: 'postgresql', description: 'Veritabanı Türü (postgresql)', required: false },
      { key: 'APP_SECRET', defaultValue: 'change-me-to-a-random-secret', description: 'Uygulama Güvenlik Anahtarı', required: true, secret: true },
    ],
    volumes: [],
    resources: { ramMB: 512, cpuCores: 1, diskGB: 2 },
    suggestedDependencies: [
      { moduleId: 'postgresql', reason: 'Analiz verilerini depolamak için PostgreSQL gereklidir.' },
    ],
    notes: ['PostgreSQL veritabanı ile birlikte çalışır. GDPR uyumlu ve çerezsiz web analizi sunar.'],
    icon: 'Activity',
    color: '#2563EB',
  },
  {
    id: 'nocodb',
    name: 'NocoDB',
    description: 'Açık kaynak Airtable alternatifi. İlişkisel veritabanlarını akıllı elektronik tablolara dönüştürür.',
    category: 'app',
    dockerImage: 'nocodb/nocodb',
    defaultTag: 'latest',
    ports: [
      { internal: 8080, default: 8089, label: 'Web UI', protocol: 'tcp' },
    ],
    environment: [
      { key: 'NC_DB', defaultValue: '', description: 'Harici DB Bağlantı URL (boşsa yerel SQLite kullanır)', required: false },
    ],
    volumes: [
      { hostPath: './nocodb/data', containerPath: '/usr/app/data', label: 'Veri Deposu' },
    ],
    resources: { ramMB: 512, cpuCores: 1, diskGB: 5 },
    suggestedDependencies: [],
    notes: ['Varsayılan olarak dahili SQLite kullanır, istendiğinde harici PostgreSQL veya MySQL bağlanabilir.'],
    icon: 'LayoutGrid',
    color: '#10B981',
  },
  {
    id: 'kavita',
    name: 'Kavita',
    description: 'Manga, çizgi roman ve e-kitaplar için hızlı, modern ve zengin özellikli dijital kütüphane sunucusu.',
    category: 'media',
    dockerImage: 'kavitareader/kavita',
    defaultTag: 'latest',
    ports: [
      { internal: 5000, default: 5005, label: 'Web UI', protocol: 'tcp' },
    ],
    environment: [
      { key: 'TZ', defaultValue: 'Europe/Istanbul', description: 'Zaman Dilimi', required: false },
    ],
    volumes: [
      { hostPath: './kavita/data', containerPath: '/kavita/config', label: 'Konfigürasyon' },
      { hostPath: './kavita/manga', containerPath: '/manga', label: 'Manga Dizini' },
      { hostPath: './kavita/books', containerPath: '/books', label: 'Kitap Dizini' },
    ],
    resources: { ramMB: 512, cpuCores: 1, diskGB: 10 },
    suggestedDependencies: [],
    notes: ['EPUB, PDF, CBR/CBZ formatlarını yerleşik web okuyucusu ile destekler. OPDS desteği mevcuttur.'],
    icon: 'BookOpen',
    color: '#0284C7',
  },
  {
    id: 'changedetection',
    name: 'Changedetection.io',
    description: 'Web sayfası değişiklik ve fiyat takip aracı. Element veya metin değişikliklerinde anında bildirim gönderir.',
    category: 'app',
    dockerImage: 'ghcr.io/dgtlmoon/changedetection.io',
    defaultTag: 'latest',
    ports: [
      { internal: 5000, default: 5003, label: 'Web UI', protocol: 'tcp' },
    ],
    environment: [
      { key: 'TZ', defaultValue: 'Europe/Istanbul', description: 'Zaman Dilimi', required: false },
    ],
    volumes: [
      { hostPath: './changedetection/data', containerPath: '/datastore', label: 'Veri Deposu' },
    ],
    resources: { ramMB: 256, cpuCores: 1, diskGB: 2 },
    suggestedDependencies: [],
    notes: ['Web sitelerindeki fiyat, stok veya içerik güncellemelerini izleyip Telegram, Discord, E-posta bildirimleri atar.'],
    icon: 'Activity',
    color: '#EC4899',
  },
  {
    id: 'penpot',
    name: 'Penpot',
    description: 'Açık kaynak Figma alternatifi. Tasarım ve prototip oluşturma için web tabanlı vektörel UI/UX aracı.',
    category: 'app',
    dockerImage: 'penpotapp/frontend',
    defaultTag: 'latest',
    ports: [
      { internal: 80, default: 9010, label: 'Web UI', protocol: 'tcp' },
    ],
    environment: [
      { key: 'PENPOT_FLAGS', defaultValue: 'enable-registration enable-login-with-password', description: 'Penpot Özellik Bayrakları', required: false },
    ],
    volumes: [
      { hostPath: './penpot/assets', containerPath: '/opt/data/assets', label: 'Medya & Çıktı Deposu' },
    ],
    resources: { ramMB: 2048, cpuCores: 2, diskGB: 10 },
    suggestedDependencies: [
      { moduleId: 'postgresql', reason: 'Veritabanı yönetimi için PostgreSQL gereklidir.' },
    ],
    notes: ['SVG yerel formatını kullanır. Takım çalışması ve arayüz prototipleme için kendi sunucunuzda barındırabilirsiniz.'],
    icon: 'Palette',
    color: '#8B5CF6',
  },
  {
    id: 'calibre-web',
    name: 'Calibre-Web',
    description: 'Temiz ve modern e-kitap kütüphanesi arayüzü. EPUB, PDF ve Kindle desteği.',
    category: 'media',
    dockerImage: 'linuxserver/calibre-web',
    defaultTag: 'latest',
    ports: [
      { internal: 8083, default: 8083, label: 'Web UI', protocol: 'tcp' },
    ],
    environment: [
      { key: 'PUID', defaultValue: '1000', description: 'User ID', required: false },
      { key: 'PGID', defaultValue: '1000', description: 'Group ID', required: false },
      { key: 'TZ', defaultValue: 'Europe/Istanbul', description: 'Zaman Dilimi', required: false },
    ],
    volumes: [
      { hostPath: './calibre-web/config', containerPath: '/config', label: 'Konfigürasyon' },
      { hostPath: './calibre-web/books', containerPath: '/books', label: 'Kitap Deposu' },
    ],
    resources: { ramMB: 512, cpuCores: 1, diskGB: 5 },
    suggestedDependencies: [],
    notes: ['Mevcut Calibre kütüphanenizi web üzerinden okumanızı ve yönetmenizi sağlar.'],
    icon: 'BookOpen',
    color: '#0284C7',
  },
  {
    id: 'it-tools',
    name: 'IT-Tools',
    description: 'Geliştiriciler ve sistem yöneticileri için 70+ kullanışlı web aracı (Token, Regex, Hash, Formatlayıcılar).',
    category: 'app',
    dockerImage: 'corentinth/it-tools',
    defaultTag: 'latest',
    ports: [
      { internal: 80, default: 2080, label: 'Web UI', protocol: 'tcp' },
    ],
    environment: [],
    volumes: [],
    resources: { ramMB: 128, cpuCores: 1, diskGB: 1 },
    suggestedDependencies: [],
    notes: ['Tamamen istemci tarafında çalışan ultra hızlı ve güvenli IT araç kutusu.'],
    icon: 'Wrench',
    color: '#3B82F6',
  },
  {
    id: 'localai',
    name: 'LocalAI',
    description: 'Tüketici donanımında çalışan yerel OpenAI uyumlu REST API ve yapay zeka çıkarım motoru.',
    category: 'platform',
    dockerImage: 'localai/localai',
    defaultTag: 'latest',
    ports: [
      { internal: 8080, default: 8085, label: 'API Port', protocol: 'tcp' },
    ],
    environment: [
      { key: 'MODELS_PATH', defaultValue: '/models', description: 'Model Dizini', required: false },
      { key: 'DEBUG', defaultValue: 'true', description: 'Hata Ayıklama', required: false },
    ],
    volumes: [
      { hostPath: './localai/models', containerPath: '/models', label: 'AI Modelleri' },
    ],
    resources: { ramMB: 8192, cpuCores: 4, diskGB: 20 },
    suggestedDependencies: [],
    notes: ['GPU veya CPU ile LLaMA, GPT4All, Whisper ve Stable Diffusion modellerini çalıştırabilir.'],
    icon: 'Cpu',
    color: '#10B981',
  },
  {
    id: 'mariadb',
    name: 'MariaDB',
    description: 'Topluluk tarafından geliştirilen yüksek performanslı ve güvenilir ilişkisel SQL veritabanı.',
    category: 'storage',
    dockerImage: 'mariadb',
    defaultTag: 'latest',
    ports: [
      { internal: 3306, default: 3307, label: 'MySQL Port', protocol: 'tcp' },
    ],
    environment: [
      { key: 'MARIADB_ROOT_PASSWORD', defaultValue: 'mariadb_root_pass', description: 'Root Şifresi', required: true, secret: true },
      { key: 'MARIADB_DATABASE', defaultValue: 'app_db', description: 'Varsayılan Veritabanı', required: false },
      { key: 'MARIADB_USER', defaultValue: 'db_user', description: 'Kullanıcı Adı', required: false },
      { key: 'MARIADB_PASSWORD', defaultValue: 'db_pass', description: 'Kullanıcı Şifresi', required: false, secret: true },
    ],
    volumes: [
      { hostPath: './mariadb/data', containerPath: '/var/lib/mysql', label: 'Veri Dizini' },
    ],
    resources: { ramMB: 512, cpuCores: 1, diskGB: 10 },
    suggestedDependencies: [],
    notes: ['MySQL yerine doğrudan tak-çıkar uyumlu yüksek verimli SQL veritabanı.'],
    icon: 'Database',
    color: '#C026D3',
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    description: 'Belge tabanlı (NoSQL) modern veritabanı, JSON benzeri esnek BSON döküman depolama.',
    category: 'storage',
    dockerImage: 'mongo',
    defaultTag: 'latest',
    ports: [
      { internal: 27017, default: 27017, label: 'MongoDB Port', protocol: 'tcp' },
    ],
    environment: [
      { key: 'MONGO_INITDB_ROOT_USERNAME', defaultValue: 'root', description: 'Root Kullanıcı', required: true },
      { key: 'MONGO_INITDB_ROOT_PASSWORD', defaultValue: 'mongo_secret_pass', description: 'Root Şifre', required: true, secret: true },
    ],
    volumes: [
      { hostPath: './mongodb/data', containerPath: '/data/db', label: 'Veritabanı Verisi' },
    ],
    resources: { ramMB: 1024, cpuCores: 1, diskGB: 10 },
    suggestedDependencies: [],
    notes: ['Modern web ve mobil uygulamalar için yüksek ölçeklenebilir doküman veri tabanı.'],
    icon: 'Database',
    color: '#16A34A',
  },
  {
    id: 'dozzle',
    name: 'Dozzle',
    description: 'Docker konteyner loglarını gerçek zamanlı izlemek için hafif, yapılandırma gerektirmeyen web paneli.',
    category: 'platform',
    dockerImage: 'amir20/dozzle',
    defaultTag: 'latest',
    ports: [
      { internal: 8080, default: 8888, label: 'Web UI', protocol: 'tcp' },
    ],
    environment: [],
    volumes: [
      { hostPath: '/var/run/docker.sock', containerPath: '/var/run/docker.sock', label: 'Docker Socket' },
    ],
    resources: { ramMB: 64, cpuCores: 1, diskGB: 1 },
    suggestedDependencies: [],
    notes: ['Hafif bellek kullanımı ile tüm Docker konteyner loglarını canlı arayüzde filtrelemenizi sağlar.'],
    icon: 'Terminal',
    color: '#F59E0B',
  },
  {
    id: 'netdata',
    name: 'Netdata',
    description: 'Saniyelik çözünürlükle sunucu CPU, RAM, Disk, Ağ ve servislerini izleyen gerçek zamanlı analiz motoru.',
    category: 'platform',
    dockerImage: 'netdata/netdata',
    defaultTag: 'latest',
    ports: [
      { internal: 19999, default: 19999, label: 'Web UI & Metrics', protocol: 'tcp' },
    ],
    environment: [],
    volumes: [
      { hostPath: '/proc', containerPath: '/host/proc', label: 'Sistem Süreçleri' },
      { hostPath: '/sys', containerPath: '/host/sys', label: 'Sistem Donanımı' },
      { hostPath: '/var/run/docker.sock', containerPath: '/var/run/docker.sock', label: 'Docker Socket' },
    ],
    resources: { ramMB: 256, cpuCores: 1, diskGB: 2 },
    suggestedDependencies: [],
    notes: ['Sıfır konfigürasyon ile binlerce donanım ve yazılım metriğini görselleştirir.'],
    icon: 'Activity',
    color: '#00AB44',
  },
  {
    id: 'prometheus',
    name: 'Prometheus',
    description: 'Bulut yerel izleme ve uyarı için zaman serisi tabanlı lider metrik toplama sistemi.',
    category: 'platform',
    dockerImage: 'prom/prometheus',
    defaultTag: 'latest',
    ports: [
      { internal: 9090, default: 9090, label: 'Prometheus UI', protocol: 'tcp' },
    ],
    environment: [],
    volumes: [
      { hostPath: './prometheus/data', containerPath: '/prometheus', label: 'Metrik Verisi' },
    ],
    resources: { ramMB: 512, cpuCores: 1, diskGB: 10 },
    suggestedDependencies: [{ moduleId: 'grafana', reason: 'Paneller ve grafikler için Grafana önerilir.' }],
    notes: ['PromQL sorgu dili ve esnek scrape hedefleri ile sunucu sağlığını izler.'],
    icon: 'Activity',
    color: '#E6522C',
  },
  {
    id: 'caddy',
    name: 'Caddy Server',
    description: 'Otomatik Let\'s Encrypt SSL yönetimi, modern HTTP/3 desteği ve sezgisel Caddyfile yapılandırması.',
    category: 'proxy',
    dockerImage: 'caddy',
    defaultTag: 'latest',
    ports: [
      { internal: 80, default: 80, label: 'HTTP Port', protocol: 'tcp' },
      { internal: 443, default: 443, label: 'HTTPS Port', protocol: 'tcp' },
    ],
    environment: [],
    volumes: [
      { hostPath: './caddy/Caddyfile', containerPath: '/etc/caddy/Caddyfile', label: 'Caddyfile' },
      { hostPath: './caddy/data', containerPath: '/data', label: 'Sertifika Verisi' },
      { hostPath: './caddy/config', containerPath: '/config', label: 'Konfigürasyon' },
    ],
    resources: { ramMB: 128, cpuCores: 1, diskGB: 1 },
    suggestedDependencies: [],
    notes: ['Sıfır çaba ile otomatik SSL ve ters vekil sunucusu.'],
    icon: 'ShieldCheck',
    color: '#22D3EE',
  },
  {
    id: 'traefik',
    name: 'Traefik Proxy',
    description: 'Konteyner ve mikroservisler için tasarlanmış modern, dinamik HTTP ters vekil ve yük dengeleyici.',
    category: 'proxy',
    dockerImage: 'traefik',
    defaultTag: 'v3.0',
    ports: [
      { internal: 80, default: 80, label: 'Web Port', protocol: 'tcp' },
      { internal: 443, default: 443, label: 'WebSecure Port', protocol: 'tcp' },
      { internal: 8080, default: 8082, label: 'Dashboard', protocol: 'tcp' },
    ],
    environment: [],
    volumes: [
      { hostPath: '/var/run/docker.sock', containerPath: '/var/run/docker.sock', label: 'Docker Socket' },
      { hostPath: './traefik/acme.json', containerPath: '/acme.json', label: 'SSL Sertifikaları' },
    ],
    resources: { ramMB: 128, cpuCores: 1, diskGB: 1 },
    suggestedDependencies: [],
    notes: ['Docker etiketlerini (labels) otomatik okuyarak dinamik yönlendirme sağlar.'],
    icon: 'Network',
    color: '#24A1C1',
  },
  {
    id: 'rabbitmq',
    name: 'RabbitMQ',
    description: 'Yüksek verimli mesaj kuyruğu sunucusu ve web tabanlı yönetim konsolu.',
    category: 'platform',
    dockerImage: 'rabbitmq',
    defaultTag: '3-management',
    ports: [
      { internal: 5672, default: 5672, label: 'AMQP Port', protocol: 'tcp' },
      { internal: 15672, default: 15672, label: 'Management UI', protocol: 'tcp' },
    ],
    environment: [
      { key: 'RABBITMQ_DEFAULT_USER', defaultValue: 'admin', description: 'Admin Kullanıcı', required: true },
      { key: 'RABBITMQ_DEFAULT_PASS', defaultValue: 'rabbit_secret_pass', description: 'Admin Şifre', required: true, secret: true },
    ],
    volumes: [
      { hostPath: './rabbitmq/data', containerPath: '/var/lib/rabbitmq', label: 'Kuyruk Verisi' },
    ],
    resources: { ramMB: 512, cpuCores: 1, diskGB: 5 },
    suggestedDependencies: [],
    notes: ['Mikroservisler arası asenkron mesajlaşma ve görev kuyrukları için endüstri standardı.'],
    icon: 'Layers',
    color: '#FF6600',
  },
  {
    id: 'typesense',
    name: 'Typesense',
    description: 'Algolia alternatifi, bellek içi ultra hızlı ve yazım hatası toleranslı açık kaynak arama motoru.',
    category: 'storage',
    dockerImage: 'typesense/typesense',
    defaultTag: '0.25.2',
    ports: [
      { internal: 8108, default: 8108, label: 'API Port', protocol: 'tcp' },
    ],
    environment: [
      { key: 'TYPESENSE_API_KEY', defaultValue: 'xyz_typesense_api_key', description: 'API Anahtarı', required: true, secret: true },
      { key: 'TYPESENSE_DATA_DIR', defaultValue: '/data', description: 'Veri Dizini', required: false },
    ],
    volumes: [
      { hostPath: './typesense/data', containerPath: '/data', label: 'İndeks Verisi' },
    ],
    resources: { ramMB: 512, cpuCores: 1, diskGB: 5 },
    suggestedDependencies: [],
    notes: ['Milisaniye altı arama tepki süresi sunan C++ tabanlı modern arama motoru.'],
    icon: 'Search',
    color: '#EF4444',
  },
  {
    id: 'meilisearch',
    name: 'Meilisearch',
    description: 'Geliştiriciler için süper hızlı, sezgisel ve Türkçe dil dostu açık kaynak arama motoru.',
    category: 'storage',
    dockerImage: 'getmeili/meilisearch',
    defaultTag: 'latest',
    ports: [
      { internal: 7700, default: 7700, label: 'HTTP Port', protocol: 'tcp' },
    ],
    environment: [
      { key: 'MEILI_MASTER_KEY', defaultValue: 'meili_master_secret_key', description: 'Anahtar', required: true, secret: true },
      { key: 'MEILI_ENV', defaultValue: 'production', description: 'Ortam', required: false },
    ],
    volumes: [
      { hostPath: './meilisearch/data', containerPath: '/meili_data', label: 'Veri Dizini' },
    ],
    resources: { ramMB: 512, cpuCores: 1, diskGB: 5 },
    suggestedDependencies: [],
    notes: ['Kullanıcı yazarken anında sonuç üreten (search-as-you-type) arama çözümü.'],
    icon: 'Search',
    color: '#FF4F81',
  },
  {
    id: 'vikunja',
    name: 'Vikunja',
    description: 'Kendi sunucunuzda barındırabileceğiniz kapsamlı yapılacaklar listesi ve Kanban proje yöneticisi.',
    category: 'app',
    dockerImage: 'vikunja/vikunja',
    defaultTag: 'latest',
    ports: [
      { internal: 3456, default: 3456, label: 'Web UI', protocol: 'tcp' },
    ],
    environment: [
      { key: 'VIKUNJA_SERVICE_JWTSECRET', defaultValue: 'vikunja_secret_jwt_token', description: 'JWT Gizli Anahtarı', required: true, secret: true },
    ],
    volumes: [
      { hostPath: './vikunja/files', containerPath: '/app/vikunja/files', label: 'Dosya Ekleri' },
    ],
    resources: { ramMB: 256, cpuCores: 1, diskGB: 2 },
    suggestedDependencies: [],
    notes: ['Kanban tahtası, Gantt grafiği ve liste görünümleriyle Todoist / Trello alternatifi.'],
    icon: 'CheckSquare',
    color: '#10B981',
  },
  {
    id: 'trilium',
    name: 'Trilium Notes',
    description: 'Kişisel bilgi tabanı ve hiyerarşik not alma uygulaması, genişletilebilir ve şifreli depolama.',
    category: 'app',
    dockerImage: 'zadam/trilium',
    defaultTag: 'latest',
    ports: [
      { internal: 8080, default: 8086, label: 'Web UI', protocol: 'tcp' },
    ],
    environment: [],
    volumes: [
      { hostPath: './trilium/data', containerPath: '/home/node/trilium-data', label: 'Not Verisi' },
    ],
    resources: { ramMB: 256, cpuCores: 1, diskGB: 5 },
    suggestedDependencies: [],
    notes: ['Not ağaçları, zihin haritaları ve revizyon geçmişi ile ikinci beyin (Second Brain).'],
    icon: 'FileText',
    color: '#059669',
  },
  {
    id: 'affine',
    name: 'AFFiNE',
    description: 'Notlar, beyaz tahta ve veritabanı belgelerini birleştiren yeni nesil Notion ve Miro alternatifi.',
    category: 'app',
    dockerImage: 'ghcr.io/toeverything/affine',
    defaultTag: 'latest',
    ports: [
      { internal: 3010, default: 3010, label: 'Web UI', protocol: 'tcp' },
    ],
    environment: [
      { key: 'AFFINE_SERVER_PORT', defaultValue: '3010', description: 'Port', required: false },
    ],
    volumes: [
      { hostPath: './affine/data', containerPath: '/root/.affine', label: 'Çalışma Alanı Verisi' },
    ],
    resources: { ramMB: 1024, cpuCores: 2, diskGB: 5 },
    suggestedDependencies: [],
    notes: ['Gizlilik öncelikli, yerel depolamalı hibrit doküman ve tuval editörü.'],
    icon: 'Layout',
    color: '#4F46E5',
  },
  {
    id: 'plane',
    name: 'Plane',
    description: 'Yazılım ekipleri için Jira ve Linear alternatifi açık kaynak proje ve sprint yönetim platformu.',
    category: 'app',
    dockerImage: 'makeplane/plane-frontend',
    defaultTag: 'latest',
    ports: [
      { internal: 80, default: 8090, label: 'Web UI', protocol: 'tcp' },
    ],
    environment: [],
    volumes: [
      { hostPath: './plane/data', containerPath: '/app/data', label: 'Proje Verisi' },
    ],
    resources: { ramMB: 1024, cpuCores: 2, diskGB: 10 },
    suggestedDependencies: [{ moduleId: 'postgresql', reason: 'Plane veri tabanı için PostgreSQL gerekir.' }],
    notes: ['Hata izleme, döngüler (cycles), modüller ve yol haritaları ile modern iş akışı.'],
    icon: 'Kanban',
    color: '#3B82F6',
  },
  {
    id: 'snipe-it',
    name: 'Snipe-IT',
    description: 'Kurumsal IT donanım, lisans, aksesuar ve envanter varlık yönetim sistemi.',
    category: 'app',
    dockerImage: 'snipe/snipe-it',
    defaultTag: 'latest',
    ports: [
      { internal: 80, default: 8088, label: 'Web UI', protocol: 'tcp' },
    ],
    environment: [
      { key: 'APP_URL', defaultValue: 'http://localhost:8088', description: 'Sistem URL', required: true },
      { key: 'APP_KEY', defaultValue: 'base64:snipe_it_secret_encryption_key', description: 'Şifreleme Anahtarı', required: true, secret: true },
    ],
    volumes: [
      { hostPath: './snipeit/data', containerPath: '/var/lib/snipeit', label: 'Envanter Verisi' },
    ],
    resources: { ramMB: 512, cpuCores: 1, diskGB: 5 },
    suggestedDependencies: [{ moduleId: 'mysql', reason: 'MySQL veritabanı gereklidir.' }],
    notes: ['Barkod okuma, QR kod üretimi ve varlık zimmetleme süreçleri.'],
    icon: 'Package',
    color: '#F97316',
  },
  {
    id: 'bookstack',
    name: 'BookStack',
    description: 'Kitap, bölüm ve sayfa organizasyon yapısıyla sezgisel dokümantasyon ve bilgi tabanı.',
    category: 'app',
    dockerImage: 'lscr.io/linuxserver/bookstack',
    defaultTag: 'latest',
    ports: [
      { internal: 80, default: 6875, label: 'Web UI', protocol: 'tcp' },
    ],
    environment: [
      { key: 'APP_URL', defaultValue: 'http://localhost:6875', description: 'Erişim Adresi', required: true },
      { key: 'DB_HOST', defaultValue: 'mariadb:3306', description: 'Veritabanı Hostu', required: true },
    ],
    volumes: [
      { hostPath: './bookstack/config', containerPath: '/config', label: 'Konfigürasyon' },
    ],
    resources: { ramMB: 512, cpuCores: 1, diskGB: 5 },
    suggestedDependencies: [{ moduleId: 'mariadb', reason: 'Veritabanı için MariaDB veya MySQL gerekir.' }],
    notes: ['WYSIWYG ve Markdown desteği ile şık dokümantasyon motoru.'],
    icon: 'Book',
    color: '#0284C7',
  },
  {
    id: 'wikijs',
    name: 'Wiki.js',
    description: 'Node.js tabanlı modern, esnek ve Git senkronizasyonlu güçlü wiki platformu.',
    category: 'app',
    dockerImage: 'ghcr.io/requarks/wiki',
    defaultTag: '2',
    ports: [
      { internal: 3000, default: 3005, label: 'Web UI', protocol: 'tcp' },
    ],
    environment: [
      { key: 'DB_TYPE', defaultValue: 'postgres', description: 'DB Türü', required: true },
    ],
    volumes: [],
    resources: { ramMB: 512, cpuCores: 1, diskGB: 2 },
    suggestedDependencies: [{ moduleId: 'postgresql', reason: 'PostgreSQL veritabanı gereklidir.' }],
    notes: ['2.x sürümü zengin arama ve yetkilendirme yeteneklerine sahiptir.'],
    icon: 'Globe',
    color: '#1E40AF',
  },
  {
    id: 'navidrome',
    name: 'Navidrome',
    description: 'Modern, hafif ve Subsonic uyumlu kişisel müzik yayın sunucusu ve koleksiyon yöneticisi.',
    category: 'media',
    dockerImage: 'deluan/navidrome',
    defaultTag: 'latest',
    ports: [
      { internal: 4533, default: 4533, label: 'Web UI & API', protocol: 'tcp' },
    ],
    environment: [
      { key: 'ND_SCROBBLE_LASTFM', defaultValue: 'false', description: 'LastFM', required: false },
    ],
    volumes: [
      { hostPath: './navidrome/data', containerPath: '/data', label: 'Navidrome Verisi' },
      { hostPath: './navidrome/music', containerPath: '/music', label: 'Müzik Klasörü' },
    ],
    resources: { ramMB: 256, cpuCores: 1, diskGB: 2 },
    suggestedDependencies: [],
    notes: ['Düşük kaynak tüketimi ile iOS, Android ve masaüstü Subsonic istemcilerini destekler.'],
    icon: 'Music',
    color: '#10B981',
  },
  {
    id: 'photoprism',
    name: 'PhotoPrism',
    description: 'Google Photos alternatifi, yapay zeka yüz tanıma ve konum etiketli kişisel fotoğraf sunucusu.',
    category: 'media',
    dockerImage: 'photoprism/photoprism',
    defaultTag: 'latest',
    ports: [
      { internal: 2342, default: 2342, label: 'Web UI', protocol: 'tcp' },
    ],
    environment: [
      { key: 'PHOTOPRISM_ADMIN_PASSWORD', defaultValue: 'photoprism_admin_pass', description: 'Yönetici Şifresi', required: true, secret: true },
    ],
    volumes: [
      { hostPath: './photoprism/originals', containerPath: '/photoprism/originals', label: 'Orijinal Fotoğraflar' },
      { hostPath: './photoprism/storage', containerPath: '/photoprism/storage', label: 'Önbellek & Veritabanı' },
    ],
    resources: { ramMB: 2048, cpuCores: 2, diskGB: 10 },
    suggestedDependencies: [],
    notes: ['TensorFlow tabanlı nesne ve yüz sınıflandırma yeteneği sunar.'],
    icon: 'Image',
    color: '#EC4899',
  },
  {
    id: 'wallabag',
    name: 'Wallabag',
    description: 'Pocket alternatifi, web makalelerini ve sayfalarını reklamsız okumak için kendi sunucunuzda arşivleyin.',
    category: 'app',
    dockerImage: 'wallabag/wallabag',
    defaultTag: 'latest',
    ports: [
      { internal: 80, default: 8089, label: 'Web UI', protocol: 'tcp' },
    ],
    environment: [
      { key: 'SYMFONY__ENV__DOMAIN_NAME', defaultValue: 'http://localhost:8089', description: 'Alan Adı', required: true },
    ],
    volumes: [
      { hostPath: './wallabag/data', containerPath: '/var/www/wallabag/data', label: 'Veri Dizini' },
    ],
    resources: { ramMB: 256, cpuCores: 1, diskGB: 2 },
    suggestedDependencies: [],
    notes: ['Tarayıcı eklentileri ve mobil uygulamalarla tek tıkla sayfa kaydeder.'],
    icon: 'Bookmark',
    color: '#14B8A6',
  },
  {
    id: 'linkwarden',
    name: 'Linkwarden',
    description: 'Web sitelerini, PDF ve ekran görüntülerini kalıcı arşivleyen ortak yer imi yöneticisi.',
    category: 'app',
    dockerImage: 'ghcr.io/linkwarden/linkwarden',
    defaultTag: 'latest',
    ports: [
      { internal: 3000, default: 3006, label: 'Web UI', protocol: 'tcp' },
    ],
    environment: [
      { key: 'NEXTAUTH_SECRET', defaultValue: 'linkwarden_nextauth_secret_key', description: 'Gizli Anahtar', required: true, secret: true },
    ],
    volumes: [
      { hostPath: './linkwarden/data', containerPath: '/data/data', label: 'Arşiv Deposu' },
    ],
    resources: { ramMB: 512, cpuCores: 1, diskGB: 5 },
    suggestedDependencies: [{ moduleId: 'postgresql', reason: 'PostgreSQL veritabanı gereklidir.' }],
    notes: ['Kaydettiğiniz sayfaların otomatik ekran görüntüsünü ve PDF kopyasını saklar.'],
    icon: 'Bookmark',
    color: '#6366F1',
  },
  {
    id: 'shlink',
    name: 'Shlink',
    description: 'Kendi alan adınızla çalışan güçlü, istatistikli açık kaynak URL kısaltma motoru.',
    category: 'app',
    dockerImage: 'shlinkio/shlink',
    defaultTag: 'latest',
    ports: [
      { internal: 8080, default: 8091, label: 'Web Port', protocol: 'tcp' },
    ],
    environment: [
      { key: 'DEFAULT_DOMAIN', defaultValue: 'shlink.local', description: 'Varsayılan Domain', required: true },
    ],
    volumes: [
      { hostPath: './shlink/data', containerPath: '/etc/shlink/data', label: 'Veritabanı Dosyaları' },
    ],
    resources: { ramMB: 256, cpuCores: 1, diskGB: 2 },
    suggestedDependencies: [],
    notes: ['Tıklama analitiği, coğrafi konum tespiti ve QR kod desteği sunar.'],
    icon: 'Link',
    color: '#06B6D4',
  },
  {
    id: 'speedtest-tracker',
    name: 'Speedtest Tracker',
    description: 'Ookla Speedtest altyapısı ile internet indirme ve yükleme hızınızı periyodik ölçen grafikli takipçi.',
    category: 'network',
    dockerImage: 'lscr.io/linuxserver/speedtest-tracker',
    defaultTag: 'latest',
    ports: [
      { internal: 80, default: 8092, label: 'Web UI', protocol: 'tcp' },
    ],
    environment: [
      { key: 'SPEEDTEST_SCHEDULE', defaultValue: '0 * * * *', description: 'Zamanlama (Cron)', required: false },
    ],
    volumes: [
      { hostPath: './speedtest/config', containerPath: '/config', label: 'Konfigürasyon' },
    ],
    resources: { ramMB: 256, cpuCores: 1, diskGB: 2 },
    suggestedDependencies: [],
    notes: ['İnternet servis sağlayıcınızın vaat ettiği hızı verip vermediğini raporlar.'],
    icon: 'Activity',
    color: '#EAB308',
  },
  {
    id: 'wg-easy',
    name: 'WireGuard Easy',
    description: 'İstemci QR kodları üreten, tek tıkla WireGuard VPN tünelleri kuran modern web paneli.',
    category: 'network',
    dockerImage: 'ghcr.io/wg-easy/wg-easy',
    defaultTag: 'latest',
    ports: [
      { internal: 51820, default: 51820, label: 'WireGuard UDP', protocol: 'udp' },
      { internal: 51821, default: 51821, label: 'Web Yönetim UI', protocol: 'tcp' },
    ],
    environment: [
      { key: 'PASSWORD', defaultValue: 'wgeasy_admin_pass', description: 'Panel Şifresi', required: true, secret: true },
      { key: 'WG_HOST', defaultValue: 'sunucu_ip_adresiniz', description: 'Sunucu IP veya Domain', required: true },
    ],
    volumes: [
      { hostPath: './wgeasy/etc-wireguard', containerPath: '/etc/wireguard', label: 'VPN Konfigürasyonu' },
    ],
    resources: { ramMB: 128, cpuCores: 1, diskGB: 1 },
    suggestedDependencies: [],
    notes: ['Mobil cihazlar ve dizüstü bilgisayarlar için saniyeler içinde QR kod oluşturur.'],
    icon: 'Shield',
    color: '#84CC16',
  },
  {
    id: 'headscale',
    name: 'Headscale',
    description: 'Tailscale istemcileri için açık kaynak, bağımsız kontrol sunucusu motoru.',
    category: 'network',
    dockerImage: 'headscale/headscale',
    defaultTag: 'latest',
    ports: [
      { internal: 8080, default: 8093, label: 'Kontrol Portu', protocol: 'tcp' },
    ],
    environment: [],
    volumes: [
      { hostPath: './headscale/config', containerPath: '/etc/headscale', label: 'Konfigürasyon' },
    ],
    resources: { ramMB: 256, cpuCores: 1, diskGB: 2 },
    suggestedDependencies: [],
    notes: ['Kendi kontrol sunucunuzla tamamen özel ve bağımsız bir Tailscale mesh ağı kurun.'],
    icon: 'Network',
    color: '#3B82F6',
  },
  {
    id: 'crowdsec',
    name: 'CrowdSec',
    description: 'Saldırgan IP adreslerini kitle kaynaklı tespit edip engelleyen modern IPS ve güvenlik kalkanı.',
    category: 'security',
    dockerImage: 'crowdsecurity/crowdsec',
    defaultTag: 'latest',
    ports: [
      { internal: 8080, default: 8094, label: 'LAPI Port', protocol: 'tcp' },
    ],
    environment: [],
    volumes: [
      { hostPath: './crowdsec/config', containerPath: '/etc/crowdsec', label: 'Konfigürasyon' },
      { hostPath: '/var/log', containerPath: '/var/log', label: 'Sunucu Logları' },
    ],
    resources: { ramMB: 256, cpuCores: 1, diskGB: 2 },
    suggestedDependencies: [],
    notes: ['Global topluluk verisiyle zararlı botları ve brute-force saldırılarını anında engeller.'],
    icon: 'ShieldAlert',
    color: '#F43F5E',
  },
  {
    id: 'fail2ban',
    name: 'Fail2ban',
    description: 'Başarısız SSH ve web oturum açma girişimlerini izleyerek saldırganları iptables ile banlayan güvenlik bekçisi.',
    category: 'security',
    dockerImage: 'crazymax/fail2ban',
    defaultTag: 'latest',
    ports: [],
    environment: [],
    volumes: [
      { hostPath: '/var/log', containerPath: '/var/log', label: 'Sistem Logları' },
    ],
    resources: { ramMB: 128, cpuCores: 1, diskGB: 1 },
    suggestedDependencies: [],
    notes: ['Host seviyesinde veya Docker konteyner loglarında brute-force saldırılarını durdurur.'],
    icon: 'Shield',
    color: '#DC2626',
  },
  {
    id: 'loki',
    name: 'Grafana Loki',
    description: 'Yatay ölçeklenebilir, yüksek erişilebilir log toplama ve indeksleme sistemi (Loglar için Prometheus).',
    category: 'platform',
    dockerImage: 'grafana/loki',
    defaultTag: 'latest',
    ports: [
      { internal: 3100, default: 3100, label: 'HTTP API', protocol: 'tcp' },
    ],
    environment: [],
    volumes: [
      { hostPath: './loki/data', containerPath: '/loki', label: 'Log Verisi' },
    ],
    resources: { ramMB: 512, cpuCores: 1, diskGB: 10 },
    suggestedDependencies: [{ moduleId: 'grafana', reason: 'Log sorgulama panelleri için Grafana önerilir.' }],
    notes: ['LogQL ile Grafana üzerinde tüm konteyner loglarını tek merkezden inceleyin.'],
    icon: 'Layers',
    color: '#F59E0B',
  },
  {
    id: 'tempo',
    name: 'Grafana Tempo',
    description: 'Kullanımı kolay, yüksek hacimli dağıtık izleme (distributed tracing) depolama motoru.',
    category: 'platform',
    dockerImage: 'grafana/tempo',
    defaultTag: 'latest',
    ports: [
      { internal: 3200, default: 3200, label: 'HTTP Port', protocol: 'tcp' },
    ],
    environment: [],
    volumes: [
      { hostPath: './tempo/data', containerPath: '/tmp/tempo', label: 'Trace Verisi' },
    ],
    resources: { ramMB: 512, cpuCores: 1, diskGB: 10 },
    suggestedDependencies: [{ moduleId: 'grafana', reason: 'Trace görselleştirme için Grafana önerilir.' }],
    notes: ['OpenTelemetry ile mikroservis isteklerinin rotasını ve darboğazlarını tespit eder.'],
    icon: 'Activity',
    color: '#F97316',
  },
  {
    id: 'uptime-flare',
    name: 'Uptime Flare',
    description: 'Modern, hafif durum sayfası ve API servis sağlık takipçisi.',
    category: 'app',
    dockerImage: 'ghcr.io/lyc8503/uptime-flare',
    defaultTag: 'latest',
    ports: [
      { internal: 3000, default: 3001, label: 'Web UI', protocol: 'tcp' },
    ],
    environment: [],
    volumes: [],
    resources: { ramMB: 128, cpuCores: 1, diskGB: 1 },
    suggestedDependencies: [],
    notes: ['Genel veya özel durum sayfası (Status Page) olarak servis kesintilerini duyurur.'],
    icon: 'CheckCircle2',
    color: '#10B981',
  },
  {
    id: 'keycloak',
    name: 'Keycloak',
    description: 'Kurumsal seviyede Single-Sign-On (SSO), OAuth 2.0 ve OpenID Connect kimlik doğrulama sunucusu.',
    category: 'security',
    dockerImage: 'quay.io/keycloak/keycloak',
    defaultTag: 'latest',
    ports: [
      { internal: 8080, default: 8443, label: 'HTTP Port', protocol: 'tcp' },
    ],
    environment: [
      { key: 'KEYCLOAK_ADMIN', defaultValue: 'admin', description: 'Admin Kullanıcı', required: true },
      { key: 'KEYCLOAK_ADMIN_PASSWORD', defaultValue: 'keycloak_admin_secret', description: 'Admin Şifre', required: true, secret: true },
    ],
    volumes: [],
    resources: { ramMB: 1024, cpuCores: 2, diskGB: 5 },
    suggestedDependencies: [{ moduleId: 'postgresql', reason: 'Üretim ortamı için PostgreSQL gereklidir.' }],
    notes: ['Gelişmiş kullanıcı dizinleri, 2FA/MFA ve LDAP entegrasyonu sunar.'],
    icon: 'Key',
    color: '#0284C7',
  },
  {
    id: 'metabase',
    name: 'Metabase',
    description: 'Veritabanlarınızı bağlayarak SQL bilmeden dakikalar içinde görsel paneller ve grafikler oluşturun.',
    category: 'platform',
    dockerImage: 'metabase/metabase',
    defaultTag: 'latest',
    ports: [
      { internal: 3000, default: 3007, label: 'Web UI', protocol: 'tcp' },
    ],
    environment: [
      { key: 'MB_DB_FILE', defaultValue: '/metabase-data/metabase.db', description: 'Veritabanı Dosyası', required: false },
    ],
    volumes: [
      { hostPath: './metabase/data', containerPath: '/metabase-data', label: 'Metabase Verisi' },
    ],
    resources: { ramMB: 1024, cpuCores: 1, diskGB: 5 },
    suggestedDependencies: [],
    notes: ['İş zekası (BI) raporlaması ve otomatik zamanlanmış e-posta bültenleri.'],
    icon: 'BarChart',
    color: '#5046E5',
  },
  {
    id: 'baserow',
    name: 'Baserow',
    description: 'Açık kaynak Airtable alternatifi, kodsuz ilişkisel veritabanı ve iş uygulaması geliştirme platformu.',
    category: 'app',
    dockerImage: 'baserow/baserow',
    defaultTag: 'latest',
    ports: [
      { internal: 80, default: 8095, label: 'Web UI', protocol: 'tcp' },
    ],
    environment: [
      { key: 'BASEROW_PUBLIC_URL', defaultValue: 'http://localhost:8095', description: 'Genel Adres', required: true },
    ],
    volumes: [
      { hostPath: './baserow/data', containerPath: '/baserow/data', label: 'Baserow Verisi' },
    ],
    resources: { ramMB: 1024, cpuCores: 2, diskGB: 10 },
    suggestedDependencies: [],
    notes: ['Ekipler için tablo görünümleri, formlar ve anlık API uç noktaları oluşturur.'],
    icon: 'Table',
    color: '#0284C7',
  },
  {
    id: 'appwrite',
    name: 'Appwrite',
    description: 'Web, mobil ve flutter geliştiricileri için güvenli açık kaynak Backend-as-a-Service (BaaS) platformu.',
    category: 'platform',
    dockerImage: 'appwrite/appwrite',
    defaultTag: 'latest',
    ports: [
      { internal: 80, default: 8096, label: 'Web UI & API', protocol: 'tcp' },
    ],
    environment: [
      { key: '_APP_ENV', defaultValue: 'production', description: 'Ortam', required: false },
    ],
    volumes: [
      { hostPath: './appwrite/data', containerPath: '/storage', label: 'Depolama' },
    ],
    resources: { ramMB: 1024, cpuCores: 2, diskGB: 10 },
    suggestedDependencies: [],
    notes: ['Auth, Database, Storage, Functions ve Cloud Messaging servislerini tek çatı altında sunar.'],
    icon: 'Layers',
    color: '#FD366E',
  },
  {
    id: 'clickhouse',
    name: 'ClickHouse',
    description: 'Milyarlarca satır üzerinde gerçek zamanlı analitik sorgular yürüten sütun tabanlı veritabanı.',
    category: 'storage',
    dockerImage: 'clickhouse/clickhouse-server',
    defaultTag: 'latest',
    ports: [
      { internal: 8123, default: 8123, label: 'HTTP Interface', protocol: 'tcp' },
      { internal: 9000, default: 9000, label: 'Native Client', protocol: 'tcp' },
    ],
    environment: [],
    volumes: [
      { hostPath: './clickhouse/data', containerPath: '/var/lib/clickhouse', label: 'Veritabanı Dosyaları' },
    ],
    resources: { ramMB: 2048, cpuCores: 2, diskGB: 20 },
    suggestedDependencies: [],
    notes: ['Log analitiği, tıklama akışı ve büyük veri raporlamasında aşırı hızlıdır.'],
    icon: 'Database',
    color: '#FFCC00',
  },
  {
    id: 'neo4j',
    name: 'Neo4j',
    description: 'Grafik ve ağ ilişkilerini modellemek için tasarlanmış lider Cypher sorgulu çizge veritabanı.',
    category: 'storage',
    dockerImage: 'neo4j',
    defaultTag: 'latest',
    ports: [
      { internal: 7474, default: 7474, label: 'HTTP Browser', protocol: 'tcp' },
      { internal: 7687, default: 7687, label: 'Bolt Protocol', protocol: 'tcp' },
    ],
    environment: [
      { key: 'NEO4J_AUTH', defaultValue: 'neo4j/neo4j_secret_pass', description: 'Giriş Bilgileri', required: true, secret: true },
    ],
    volumes: [
      { hostPath: './neo4j/data', containerPath: '/data', label: 'Çizge Verisi' },
    ],
    resources: { ramMB: 1024, cpuCores: 2, diskGB: 10 },
    suggestedDependencies: [],
    notes: ['Sosyal ağlar, dolandırıcılık tespiti ve karmaşık bilgi ağları için idealdir.'],
    icon: 'Share2',
    color: '#018BFF',
  },
  {
    id: 'palworld-rcon',
    name: 'Palworld Web RCON',
    description: 'Palworld sunucuları için oyuncu yönetimi, yedekleme ve komut çalıştırma web arayüzü.',
    category: 'game',
    dockerImage: 'gorillash/palworld-save-tools',
    defaultTag: 'latest',
    ports: [
      { internal: 8212, default: 8212, label: 'Web UI', protocol: 'tcp' },
    ],
    environment: [],
    volumes: [
      { hostPath: './palworld/data', containerPath: '/palworld/data', label: 'Kayıt Dosyaları' },
    ],
    resources: { ramMB: 256, cpuCores: 1, diskGB: 2 },
    suggestedDependencies: [{ moduleId: 'palworld', reason: 'Palworld Dedicated sunucusu ile birlikte kullanılır.' }],
    notes: ['Web tarayıcısından canlı oyuncu listesi, kick/ban ve otomatik duyurular gönderir.'],
    icon: 'Gamepad2',
    color: '#3B82F6',
  },
];

export interface MinecraftPlugin {
  id: string;
  name: string;
  description: string;
  jarUrl: string;
  fileName: string;
  required: boolean;
}

export const MINECRAFT_PLUGINS: MinecraftPlugin[] = [
  {
    id: 'veinminer',
    name: 'VeinMiner (SimpleVeinMiner)',
    description: 'Maden damarlarını (Kömür, Demir, Elmas vb.) tek bir vuruşta zincirleme kırma eklentisi.',
    jarUrl: 'https://github.com/2008Choco/VeinMiner/releases/download/v2.4.0/VeinMiner-Bukkit-2.4.0.jar',
    fileName: 'VeinMiner.jar',
    required: false,
  },
  {
    id: 'smoothtimber',
    name: 'SmoothTimber',
    description: 'Ağaçların en alt odununu kırınca bütün ağacı gerçekçi şekilde anında devirme eklentisi.',
    jarUrl: 'https://api.spiget.org/v2/resources/39965/download',
    fileName: 'SmoothTimber.jar',
    required: false,
  },
  {
    id: 'actionhealth',
    name: 'ActionHealth',
    description: 'Tecrübe barının (XP) hemen üstünde arkadaşlarının ve canavarların canlı can durumunu gösterir.',
    jarUrl: 'https://api.spiget.org/v2/resources/2661/download',
    fileName: 'ActionHealth.jar',
    required: false,
  },
  {
    id: 'gsit',
    name: 'GSit',
    description: 'Merdivenlere oturma, yere yatma (/sit, /lay, /crawl) ve oyuncuların sırtına binme sistemi.',
    jarUrl: 'https://github.com/Gecolay/GSit/releases/latest/download/GSit.jar',
    fileName: 'GSit.jar',
    required: false,
  },
  {
    id: 'voicechat',
    name: 'Simple Voice Chat',
    description: 'Oyun içi 3D yakınlık mesafeli (proximity) gerçek zamanlı sesli sohbet sistemi.',
    jarUrl: 'https://api.spiget.org/v2/resources/93794/download',
    fileName: 'voicechat.jar',
    required: false,
  },
  {
    id: 'geysermc',
    name: 'GeyserMC & Floodgate',
    description: 'Bedrock (Mobil, Tablet, Windows 10/11) oyuncularının Java sunucusuna doğrudan girmesini sağlar.',
    jarUrl: 'https://download.geysermc.org/v2/projects/geyser/versions/latest/builds/latest/downloads/spigot',
    fileName: 'Geyser-Spigot.jar',
    required: false,
  },
  {
    id: 'essentialsx',
    name: 'EssentialsX',
    description: 'Temel sunucu komutları: /home, /tp, /spawn, /warp ve ekonomi sistemi.',
    jarUrl: 'https://ci.ender.zone/job/EssentialsX/lastSuccessfulBuild/artifact/jars/EssentialsX.jar',
    fileName: 'EssentialsX.jar',
    required: false,
  },
  {
    id: 'authme',
    name: 'AuthMe Reloaded',
    description: 'Cracked sunucularda Türkçe /register ve /login oyuncu şifre koruma sistemi.',
    jarUrl: 'https://github.com/AuthMe/AuthMeReloaded/releases/latest/download/AuthMe.jar',
    fileName: 'AuthMe.jar',
    required: false,
  },
  {
    id: 'viaversion',
    name: 'ViaVersion & ViaBackwards',
    description: '1.8.x ile 1.21.x arasındaki TÜM Minecraft sürümlerinin aynı sunucuya bağlanmasını sağlar.',
    jarUrl: 'https://github.com/ViaVersion/ViaVersion/releases/download/5.11.0/ViaVersion-5.11.0.jar',
    fileName: 'ViaVersion.jar',
    required: false,
  },
  {
    id: 'skinsrestorer',
    name: 'SkinsRestorer',
    description: 'Tüm korsan ve orijinal oyuncuların özel Minecraft skinlerini görüntülemesini sağlar.',
    jarUrl: 'https://github.com/SkinsRestorer/SkinsRestorer/releases/latest/download/SkinsRestorer.jar',
    fileName: 'SkinsRestorer.jar',
    required: false,
  },
  {
    id: 'dynmap',
    name: 'Dynmap',
    description: 'Minecraft dünyanızı web tarayıcısından 3D Google Maps gibi canlı izlemenizi sağlar.',
    jarUrl: 'https://api.spiget.org/v2/resources/274/download',
    fileName: 'Dynmap.jar',
    required: false,
  },
  {
    id: 'luckperms',
    name: 'LuckPerms',
    description: 'Gelişmiş yetki (permissions) ve grup yönetim sistemi.',
    jarUrl: 'https://download.luckperms.net/1556/bukkit/loader/LuckPerms-Bukkit.jar',
    fileName: 'LuckPerms-Bukkit.jar',
    required: false,
  },
];

export interface FiveMPlugin {
  id: string;
  name: string;
  description: string;
  category: 'admin' | 'roleplay' | 'vehicle' | 'audio' | 'map';
  downloadUrl: string;
  folderName: string;
  ensureCommand: string;
  extraConfig?: string[];
  badge: string;
  required?: boolean;
}

export interface FiveMPluginPack {
  id: string;
  name: string;
  emoji: string;
  description: string;
  badge: string;
  pluginIds: string[];
}

export const FIVEM_PLUGINS: FiveMPlugin[] = [
  {
    id: 'vmenu',
    name: 'vMenu (Tanrı Modu & Araç Menüsü)',
    description: 'Sınırsız süper araba çağırma, modifiye/tuning, ölümsüzlük, hava durumu, polis kapatma ve ışınlanma menüsü.',
    category: 'admin',
    downloadUrl: 'https://github.com/TomGrobbe/vMenu/releases/download/v3.8.61/vMenu-3.8.61.zip',
    folderName: 'vMenu',
    ensureCommand: 'ensure vMenu',
    extraConfig: [
      'exec permissions.cfg',
      'add_ace builtin.everyone "vMenu.Everything" allow',
    ],
    badge: 'Admin & Araç',
    required: false,
  },
  {
    id: 'speedometer',
    name: 'StreetHUD (Dijital Hız & Vites Kadranı)',
    description: 'Araçlara bindiğinde ekranda çıkan modern dijital hız (KM/H), devir, vites ve yakıt göstergesi.',
    category: 'vehicle',
    downloadUrl: 'https://github.com/alexdhg/fivem-standalone-speedometer/archive/refs/heads/master.zip',
    folderName: 'speedometer',
    ensureCommand: 'ensure speedometer',
    badge: 'Hız Kadranı',
    required: false,
  },
  {
    id: 'drift-mode',
    name: 'DriftHandling (Shift ile Yanlama Modu)',
    description: 'Shift tuşuna basarak araçlarla gerçekçi drift ve yanlama fiziği sunan drift motoru.',
    category: 'vehicle',
    downloadUrl: 'https://github.com/MoravianLion/Drift-Script/archive/refs/heads/master.zip',
    folderName: 'drift-mode',
    ensureCommand: 'ensure drift-mode',
    badge: 'Drift Modu',
    required: false,
  },
  {
    id: 'pma-voice',
    name: 'pma-voice (3D Konumsal Ses & Telsiz)',
    description: 'FiveM için endüstri standardı 3D yakınlık tabanlı mekansal sesli sohbet ve telsiz altyapısı.',
    category: 'audio',
    downloadUrl: 'https://github.com/AvarianKnight/pma-voice/archive/refs/heads/master.zip',
    folderName: 'pma-voice',
    ensureCommand: 'ensure pma-voice',
    badge: '3D Ses',
    required: false,
  },
  {
    id: 'oxmysql',
    name: 'oxmysql (Yüksek Hızlı MySQL Kütüphanesi)',
    description: 'FiveM roleplay scriptlerinin MySQL veritabanına sıfır gecikmeli bağlanmasını sağlayan async kütüphane.',
    category: 'roleplay',
    downloadUrl: 'https://github.com/overextended/oxmysql/releases/latest/download/oxmysql.zip',
    folderName: 'oxmysql',
    ensureCommand: 'ensure oxmysql',
    badge: 'Veritabanı',
    required: false,
  },
  {
    id: 'bob74_ipl',
    name: 'bob74_ipl (Tüm Binaları & MLO Kapılarını Açma)',
    description: 'GTA V haritasındaki hastaneler, polis merkezleri, kumarhane ve Maze Bank gibi tüm kilitli binaların kapılarını açar.',
    category: 'map',
    downloadUrl: 'https://github.com/Bob74/bob74_ipl/archive/refs/heads/master.zip',
    folderName: 'bob74_ipl',
    ensureCommand: 'ensure bob74_ipl',
    badge: 'Açık Binalar',
    required: false,
  },
  {
    id: 'postal-map',
    name: 'PostalCode Minimap (Posta Kodlu Harita)',
    description: 'Radar ve haritaya 4 haneli posta kodlarını ekleyerek konum bildirimini ve navigasyonu kolaylaştırır.',
    category: 'map',
    downloadUrl: 'https://github.com/DevBlocky/nearest-postal/archive/refs/heads/master.zip',
    folderName: 'nearest-postal',
    ensureCommand: 'ensure nearest-postal',
    badge: 'GPS & Harita',
    required: false,
  },
  {
    id: 'easy-time',
    name: 'cd_easytime (Gerçekçi Hava & Dinamik Saat)',
    description: 'Yumuşak hava durumu geçişleri, senkronize gece/gündüz döngüsü ve kar/fırtına efektleri.',
    category: 'admin',
    downloadUrl: 'https://github.com/dsheedes/cd_easytime/archive/refs/heads/master.zip',
    folderName: 'cd_easytime',
    ensureCommand: 'ensure cd_easytime',
    badge: 'Hava & Saat',
    required: false,
  },
];

export const FIVEM_PLUGIN_PACKS: FiveMPluginPack[] = [
  {
    id: 'pack-sandbox-solo',
    name: 'Sandbox & vMenu Tanrı Paketi',
    emoji: '🎮',
    description: 'Tek başına veya arkadaşlarla takılmak için araç spawn, modifiye, ölümsüzlük, hız kadranı, drift ve açık binalar.',
    badge: 'Önerilen (Solo / Eğlence)',
    pluginIds: ['vmenu', 'speedometer', 'drift-mode', 'easy-time', 'bob74_ipl'],
  },
  {
    id: 'pack-drift-racing',
    name: 'Sokak Yarışı & Drift Paketi',
    emoji: '🏎️',
    description: 'Hız göstergesi, drift kontrolü ve süper araba çağırma üzerine kurulu hafif sokak paketi.',
    badge: 'Yarış & Drift',
    pluginIds: ['vmenu', 'speedometer', 'drift-mode'],
  },
  {
    id: 'pack-roleplay-base',
    name: 'Roleplay Temel Altyapı Paketi',
    emoji: '💼',
    description: 'Roleplay için yüksek performanslı MySQL, 3D sesli telsiz, açık binalar ve posta kodlu GPS haritası.',
    badge: 'Roleplay (RP)',
    pluginIds: ['oxmysql', 'pma-voice', 'bob74_ipl', 'postal-map', 'easy-time'],
  },
  {
    id: 'pack-voice-mlo',
    name: '3D Ses & Açık Binalar Paketi',
    emoji: '🎙️',
    description: '3D yakınlık mesafeli ses sistemi, telsiz frekansları ve tüm GTA V iç mekanları.',
    badge: 'Ses & Harita',
    pluginIds: ['pma-voice', 'bob74_ipl'],
  },
];

// ─── Helpers ────────────────────────────────────────────────

/** Look up a module by ID. Throws if not found. */
export function getModuleById(id: string): ModuleDefinition {
  const mod = MODULE_CATALOG.find((m) => m.id === id);
  if (!mod) throw new Error(`Module not found: ${id}`);
  return mod;
}

/** Filter modules by category. */
export function getModulesByCategory(category: ModuleCategory): ModuleDefinition[] {
  return MODULE_CATALOG.filter((m) => m.category === category);
}

/** Get all unique categories present in the catalog. */
export function getAllCategories(): ModuleCategory[] {
  return [...new Set(MODULE_CATALOG.map((m) => m.category))];
}

/** Human-readable category labels */
export const CATEGORY_LABELS: Record<ModuleCategory, string> = {
  os:       'İşletim Sistemi',
  platform: 'Platform & Çalışma Ortamı',
  network:  'Ağ & DNS',
  proxy:    'Reverse Proxy',
  tunnel:   'Tünel',
  app:      'Uygulamalar',
  media:    'Medya',
  security: 'Güvenlik',
  game:     'Oyun Sunucuları',
  storage:  'Depolama',
};

export const LOCALIZED_CATEGORY_LABELS: Record<string, Record<ModuleCategory, string>> = {
  tr: {
    os:       'İşletim Sistemi',
    platform: 'Platform & Çalışma Ortamı',
    network:  'Ağ & DNS',
    proxy:    'Reverse Proxy',
    tunnel:   'Tünel',
    app:      'Uygulamalar',
    media:    'Medya',
    security: 'Güvenlik',
    game:     'Oyun Sunucuları',
    storage:  'Depolama',
  },
  en: {
    os:       'Operating System',
    platform: 'Platform & Runtime',
    network:  'Network & DNS',
    proxy:    'Reverse Proxy',
    tunnel:   'Tunnel & VPN',
    app:      'Applications',
    media:    'Media & Streaming',
    security: 'Security',
    game:     'Game Servers',
    storage:  'Storage & Cloud',
  },
  pt: {
    os:       'Sistema Operacional',
    platform: 'Plataforma & Runtime',
    network:  'Rede & DNS',
    proxy:    'Proxy Reverso',
    tunnel:   'Túnel & VPN',
    app:      'Aplicações',
    media:    'Mídia & Streaming',
    security: 'Segurança',
    game:     'Servidores de Jogos',
    storage:  'Armazenamento & Nuvem',
  },
};

export function getCategoryLabel(category: ModuleCategory, lang: string = 'tr'): string {
  const dict = LOCALIZED_CATEGORY_LABELS[lang] ?? LOCALIZED_CATEGORY_LABELS['tr'];
  return dict?.[category] ?? CATEGORY_LABELS[category] ?? category;
}

/** Well-known ports that are commonly contested — used for conflict highlighting */
export const CONTESTED_PORTS = new Set([53, 80, 443, 8080, 8443, 3000, 3001, 8096]);

/** Suggest alternative ports when a conflict is detected */
export const PORT_ALTERNATIVES: Record<number, number[]> = {
  80:   [8080, 8081, 8000],
  443:  [8443, 8444, 9443],
  8080: [8081, 8082, 8888],
  3000: [3001, 3002, 4000],
  8096: [8097, 8098],
  2283: [2284, 2285],
  9000: [9001, 9002],
  9443: [9444, 9445],
  51820: [51821, 51822],
  32400: [32401, 32402],
  8200: [8201, 8202],
  6881: [6882, 6883],
  3001: [3002, 3003],
  5055: [5056, 5057],
  7878: [7879, 7880],
  8989: [8990, 8991],
  5678: [5679, 5680],
  61208: [61218, 61228],
  9925: [9926, 9927],
  13378: [13379, 13380],
  5432: [5433, 5434],
  6379: [6380, 6381],
  3306: [3307, 3308],
  5050: [5051, 5052],
  8085: [8086, 8087],
  8211: [8212, 8213],
  11434: [11435, 11436],
  28015: [28017, 28018],
  28016: [28017, 28018],
  28082: [28083, 28084],
  2456: [2458, 2459],
  2457: [2458, 2459],
  16261: [16262, 16263],
  7777: [7778, 7779],
  9600: [9602, 9603],
  8123: [8124, 8125],
  8888: [8889, 8890],
  8188: [8189, 8190],
  3005: [3007, 3008],
  8089: [8090, 8091],
  5005: [5006, 5007],
  5003: [5004, 5008],
  9010: [9011, 9012],
};


