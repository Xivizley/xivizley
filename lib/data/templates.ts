// ============================================================
// XIVIZLEY — Master Full-Stack Architecture Database
// lib/data/templates.ts
// Every stack includes full OS + Platform + Routing + Apps + DB
// ============================================================

export type TemplateCategory =
  | 'all'
  | 'web'
  | 'ai'
  | 'ecommerce'
  | 'media'
  | 'security'
  | 'game'
  | 'devops'
  | 'enterprise';

export interface StackTemplate {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: TemplateCategory;
  isPro: boolean;
  difficulty: 'Kolay' | 'Orta' | 'İleri Düzey';
  minRamGB: number;
  icon: string;
  color: string;
  tags: string[];
  moduleIds: string[];
  composeSnippet: string;
}

export const TEMPLATE_CATEGORIES: Array<{ id: TemplateCategory; label: string; icon: string }> = [
  { id: 'all', label: 'Tüm Şablonlar', icon: '✨' },
  { id: 'web', label: 'Web Siteleri & CMS', icon: '🌐' },
  { id: 'ai', label: 'Yapay Zeka & LLM', icon: '🤖' },
  { id: 'ecommerce', label: 'E-Ticaret & SaaS', icon: '🛍️' },
  { id: 'media', label: '4K Medya & Sinema', icon: '🎬' },
  { id: 'security', label: 'Ağ & Siber Güvenlik', icon: '🛡️' },
  { id: 'game', label: 'Oyun Sunucuları', icon: '🎮' },
  { id: 'devops', label: 'DevOps & İzleme', icon: '📊' },
  { id: 'enterprise', label: 'Kurumsal & Ofis', icon: '💼' },
];

export const STACK_TEMPLATES: StackTemplate[] = [
  // ═════════════════════════════════════════════════════════════
  // 0. YAPAY ZEKA & YEREL LLM STÜDYOSU
  // ═════════════════════════════════════════════════════════════
  {
    id: 'local-ai-ollama',
    title: 'Yerel Yapay Zeka & LLM Stüdyosu',
    subtitle: 'Ubuntu + Docker + Ollama + Open-WebUI + Nginx Proxy',
    description: 'Kendi sunucunuzda Llama 3, DeepSeek R1 ve Mistral gibi yapay zeka modellerini çalıştırın. ChatGPT benzeri modern Open-WebUI arayüzü ve SSL korumalı ters vekil ile donatılmıştır.',
    category: 'ai',
    isPro: false,
    difficulty: 'Orta',
    minRamGB: 8,
    icon: '🤖',
    color: '#10B981',
    tags: ['Ubuntu', 'Docker', 'Ollama', 'Open-WebUI', 'DeepSeek', 'Llama3', 'LocalAI'],
    moduleIds: ['ubuntu-server', 'docker', 'ollama', 'open-webui', 'nginx-proxy-manager'],
    composeSnippet: `version: '3.8'

services:
  ollama:
    image: ollama/ollama:latest
    container_name: ollama
    restart: unless-stopped
    ports:
      - "11434:11434"
    volumes:
      - ./ollama/data:/root/.ollama
    environment:
      - OLLAMA_ORIGINS=*

  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: open-webui
    restart: unless-stopped
    ports:
      - "8088:8080"
    environment:
      - OLLAMA_BASE_URL=http://ollama:11434
    volumes:
      - ./open-webui/data:/app/backend/data
    depends_on:
      - ollama`,
  },
  // ═════════════════════════════════════════════════════════════
  // 1. WEB SITELERI, BLOG & CMS
  // ═════════════════════════════════════════════════════════════
  {
    id: 'wordpress-ultra',
    title: 'WordPress Ultra Hız Yığını',
    subtitle: 'Ubuntu + Docker + Nginx + WordPress + MariaDB + Redis',
    description: 'Yüksek trafikli blog ve kurumsal siteler için Redis nesne önbelleği, Nginx Proxy SSL ve optimize edilmiş MariaDB içeren eksiksiz WordPress mimarisi.',
    category: 'web',
    isPro: false,
    difficulty: 'Kolay',
    minRamGB: 2,
    icon: '🌐',
    color: '#21759B',
    tags: ['Ubuntu', 'Docker', 'WordPress', 'MariaDB', 'Redis', 'Nginx', 'Blog'],
    moduleIds: ['ubuntu-server', 'docker', 'nginx-proxy-manager', 'wordpress', 'mysql', 'redis'],
    composeSnippet: `services:
  wordpress:
    image: wordpress:latest
    restart: unless-stopped
    ports: ["8080:80"]
    environment:
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_NAME: wordpress
      WORDPRESS_DB_USER: wp_user
      WORDPRESS_DB_PASSWORD: wp_secure_password
    volumes: ["./wp-data:/var/www/html"]
    depends_on: [db, redis]

  db:
    image: mariadb:10.11
    restart: unless-stopped
    environment:
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wp_user
      MYSQL_PASSWORD: wp_secure_password
      MYSQL_ROOT_PASSWORD: db_root_password
    volumes: ["./db-data:/var/lib/mysql"]

  redis:
    image: redis:alpine
    restart: unless-stopped`,
  },
  {
    id: 'ghost-pro-publishing',
    title: 'Ghost Modern Yayıncılık Yığını',
    subtitle: 'Ubuntu + Docker + Nginx Proxy + Ghost CMS + MySQL 8',
    description: 'Bültenler, paralı abonelikler ve SEO odaklı modern teknoloji blogları için eksiksiz Ghost yayıncılık mimarisi.',
    category: 'web',
    isPro: false,
    difficulty: 'Kolay',
    minRamGB: 2,
    icon: '✍️',
    color: '#738A9C',
    tags: ['Ubuntu', 'Docker', 'Ghost', 'MySQL', 'Nginx', 'Blog', 'Bülten'],
    moduleIds: ['ubuntu-server', 'docker', 'nginx-proxy-manager', 'mysql'],
    composeSnippet: `services:
  ghost:
    image: ghost:5-alpine
    restart: unless-stopped
    ports: ["2368:2368"]
    environment:
      url: http://localhost:2368
      NODE_ENV: production
      database__client: mysql
      database__connection__host: ghost-db
      database__connection__user: ghost
      database__connection__password: ghost_password
      database__connection__database: ghost_db
    volumes: ["./ghost-content:/var/lib/ghost/content"]

  ghost-db:
    image: mysql:8.0
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: root_secure_password
      MYSQL_DATABASE: ghost_db
      MYSQL_USER: ghost
      MYSQL_PASSWORD: ghost_password
    volumes: ["./ghost-db-data:/var/lib/mysql"]`,
  },
  {
    id: 'strapi-headless-cms',
    title: 'Strapi Headless CMS & API',
    subtitle: 'Ubuntu + Docker + Nginx + Strapi Node + PostgreSQL + pgAdmin',
    description: 'Mobil uygulamalar ve Next.js frontend projeleriniz için REST ve GraphQL destekli esnek Headless CMS ve PostgreSQL mimarisi.',
    category: 'web',
    isPro: true,
    difficulty: 'Orta',
    minRamGB: 4,
    icon: '🚀',
    color: '#4945FF',
    tags: ['Ubuntu', 'Docker', 'Strapi', 'Node.js', 'PostgreSQL', 'pgAdmin', 'API'],
    moduleIds: ['ubuntu-server', 'docker', 'nginx-proxy-manager', 'postgresql', 'pgadmin'],
    composeSnippet: `services:
  strapi:
    image: strapi/strapi:latest
    restart: unless-stopped
    ports: ["1337:1337"]
    environment:
      DATABASE_CLIENT: postgres
      DATABASE_HOST: strapi-db
      DATABASE_PORT: 5432
      DATABASE_NAME: strapi
      DATABASE_USERNAME: strapi
      DATABASE_PASSWORD: strapi_password
    volumes: ["./strapi-app:/srv/app"]

  strapi-db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: strapi
      POSTGRES_USER: strapi
      POSTGRES_PASSWORD: strapi_password
    volumes: ["./strapi-db-data:/var/lib/postgresql/data"]`,
  },

  // ═════════════════════════════════════════════════════════════
  // 2. 4K MEDYA, SİNEMA & DİZİ
  // ═════════════════════════════════════════════════════════════
  {
    id: 'ultimate-4k-media-suite',
    title: 'Ultimate 4K Ev Sineması & Medya Kalesi',
    subtitle: 'Ubuntu + Docker + Plex + Jellyfin + Radarr + Sonarr + Overseerr + qBittorrent',
    description: 'Tüm film ve dizilerinizi otomatik indiren, altyazılarını çeken, afişlerini düzenleyen ve tüm televizyonlarınıza 4K HDR yayın yapan devasa medya kalesi.',
    category: 'media',
    isPro: true,
    difficulty: 'Orta',
    minRamGB: 4,
    icon: '🍿',
    color: '#00A4DC',
    tags: ['Ubuntu', 'Docker', 'Jellyfin', 'Plex', 'Radarr', 'Sonarr', 'Overseerr', 'qBittorrent', '4K'],
    moduleIds: ['ubuntu-server', 'docker', 'plex', 'jellyfin', 'radarr', 'sonarr', 'overseerr', 'qbittorrent'],
    composeSnippet: `services:
  jellyfin:
    image: jellyfin/jellyfin:latest
    restart: unless-stopped
    ports: ["8096:8096"]
    volumes:
      - ./jellyfin/config:/config
      - ./media/movies:/data/movies
      - ./media/tv:/data/tv

  radarr:
    image: linuxserver/radarr:latest
    restart: unless-stopped
    ports: ["7878:7878"]
    volumes:
      - ./radarr/config:/config
      - ./media/movies:/movies
      - ./downloads:/downloads

  sonarr:
    image: linuxserver/sonarr:latest
    restart: unless-stopped
    ports: ["8989:8989"]
    volumes:
      - ./sonarr/config:/config
      - ./media/tv:/tv
      - ./downloads:/downloads

  qbittorrent:
    image: linuxserver/qbittorrent:latest
    restart: unless-stopped
    ports: ["8080:8080"]
    volumes:
      - ./qbittorrent/config:/config
      - ./downloads:/downloads`,
  },
  {
    id: 'immich-ai-photo-vault',
    title: 'Immich AI Fotoğraf & Yedekleme Kasası',
    subtitle: 'Ubuntu + Docker + Nginx + Immich AI + PostgreSQL + Redis',
    description: 'Telefonunuzdaki tüm fotoğrafları ve 4K videoları otomatik yedekleyen, haritada gösteren ve yerel yapay zeka ile yüz tanıyan fotoğraf sunucusu.',
    category: 'media',
    isPro: true,
    difficulty: 'Orta',
    minRamGB: 4,
    icon: '📸',
    color: '#4255FF',
    tags: ['Ubuntu', 'Docker', 'Immich', 'Google Photos', 'Fotoğraf', 'PostgreSQL', 'Redis'],
    moduleIds: ['ubuntu-server', 'docker', 'nginx-proxy-manager', 'immich', 'postgresql', 'redis'],
    composeSnippet: `services:
  immich-server:
    image: ghcr.io/immich-app/immich-server:release
    restart: unless-stopped
    ports: ["2283:2283"]
    environment:
      DB_HOSTNAME: immich-db
      DB_DATABASE_NAME: immich
      DB_USERNAME: immich
      DB_PASSWORD: immich_password
      REDIS_HOSTNAME: immich-redis
    volumes: ["./photos:/usr/src/app/upload"]

  immich-db:
    image: tensorchord/pgvecto-rs:pg14-v0.2.0
    restart: unless-stopped
    environment:
      POSTGRES_DB: immich
      POSTGRES_USER: immich
      POSTGRES_PASSWORD: immich_password
    volumes: ["./immich-db:/var/lib/postgresql/data"]

  immich-redis:
    image: redis:6.2-alpine
    restart: unless-stopped`,
  },
  {
    id: 'audiobookshelf-media',
    title: 'Audiobookshelf Sesli Kitap & Podcast Kasası',
    subtitle: 'Ubuntu + Docker + Nginx + Audiobookshelf + FileBrowser',
    description: 'Sesli kitaplarınızı ve podcastlerinizi saklayın; nerede kaldığınızı telefonunuzdaki uygulamayla otomatik eşitleyin.',
    category: 'media',
    isPro: false,
    difficulty: 'Kolay',
    minRamGB: 2,
    icon: '🎧',
    color: '#8B5CF6',
    tags: ['Ubuntu', 'Docker', 'Audiobookshelf', 'FileBrowser', 'Sesli Kitap'],
    moduleIds: ['ubuntu-server', 'docker', 'nginx-proxy-manager', 'audiobookshelf', 'filebrowser'],
    composeSnippet: `services:
  audiobookshelf:
    image: ghcr.io/advplyr/audiobookshelf:latest
    restart: unless-stopped
    ports: ["13378:80"]
    volumes:
      - ./audiobooks:/audiobooks
      - ./podcasts:/podcasts
      - ./config:/config`,
  },

  // ═════════════════════════════════════════════════════════════
  // 3. AĞ, VPN & SİBER GÜVENLİK
  // ═════════════════════════════════════════════════════════════
  {
    id: 'cyber-security-fortress',
    title: 'Siber Güvenlik & Reklamsız DNS Kalesi',
    subtitle: 'Ubuntu + Docker + Nginx + AdGuard Home + WireGuard VPN + Vaultwarden',
    description: 'Ev ve sunucu ağınızdaki tüm reklamları ve zararlı siteleri engelleyen, güvenli şifre kasası barındıran ve dışarıdan WireGuard ile güvenli tünel açan güvenlik üssü.',
    category: 'security',
    isPro: false,
    difficulty: 'Kolay',
    minRamGB: 2,
    icon: '🛡️',
    color: '#10B981',
    tags: ['Ubuntu', 'Docker', 'AdGuard', 'Nginx Proxy', 'WireGuard', 'Vaultwarden', 'DNS'],
    moduleIds: ['ubuntu-server', 'docker', 'nginx-proxy-manager', 'adguard-home', 'wireguard', 'vaultwarden'],
    composeSnippet: `services:
  adguard:
    image: adguard/adguardhome:latest
    restart: unless-stopped
    ports: ["53:53/tcp", "53:53/udp", "3000:3000", "80:80"]
    volumes:
      - ./adguard/work:/opt/adguardhome/work
      - ./adguard/conf:/opt/adguardhome/conf

  vaultwarden:
    image: vaultwarden/server:latest
    restart: unless-stopped
    ports: ["8085:80"]
    volumes: ["./vaultwarden/data:/data"]

  wireguard:
    image: linuxserver/wireguard:latest
    restart: unless-stopped
    cap_add: [NET_ADMIN, SYS_MODULE]
    ports: ["51820:51820/udp"]
    volumes: ["./wireguard/config:/config"]`,
  },
  {
    id: 'pihole-privacy-gateway',
    title: 'Pi-hole + WireGuard Tam Gizlilik Kalkanı',
    subtitle: 'Debian + Docker + Pi-hole DNS + WireGuard + Tailscale',
    description: 'Telefonunuz ve bilgisayarınız nereden bağlanırsa bağlansın tüm reklamları engelleyen ve trafiği şifreleyen taşınabilir VPN kalkanı.',
    category: 'security',
    isPro: false,
    difficulty: 'Kolay',
    minRamGB: 2,
    icon: '🔒',
    color: '#EF4444',
    tags: ['Debian', 'Docker', 'Pi-hole', 'WireGuard', 'Tailscale', 'Adblock'],
    moduleIds: ['debian', 'docker', 'pi-hole', 'wireguard', 'tailscale'],
    composeSnippet: `services:
  pihole:
    image: pihole/pihole:latest
    restart: unless-stopped
    ports: ["53:53/tcp", "53:53/udp", "8053:80"]
    environment:
      TZ: Europe/Istanbul
      WEBPASSWORD: admin_password_change_me
    volumes:
      - ./pihole/etc:/etc/pihole
      - ./pihole/dnsmasq:/etc/dnsmasq.d`,
  },

  // ═════════════════════════════════════════════════════════════
  // 4. OYUN SUNUCULARI
  // ═════════════════════════════════════════════════════════════
  {
    id: 'minecraft-papermc-ultimate',
    title: 'Minecraft 1.21 PaperMC Pro Sunucu',
    subtitle: 'Ubuntu + Docker + Portainer + PaperMC Minecraft + Glances',
    description: 'Tüm sürümlerden oyuncuların katılabildiği, Türkçe hazır komutlara sahip, cracked & premium uyumlu, 20.0 TPS optimize edilmiş Minecraft sunucu mimarisi.',
    category: 'game',
    isPro: false,
    difficulty: 'Kolay',
    minRamGB: 3,
    icon: '⛏️',
    color: '#22C55E',
    tags: ['Ubuntu', 'Docker', 'Portainer', 'Minecraft', 'PaperMC', '1.21', 'Glances'],
    moduleIds: ['ubuntu-server', 'docker', 'portainer', 'minecraft-paperm', 'glances'],
    composeSnippet: `services:
  minecraft:
    image: itzg/minecraft-server:latest
    container_name: xivizley-minecraft
    restart: unless-stopped
    ports: ["25565:25565"]
    environment:
      EULA: "TRUE"
      TYPE: "PAPER"
      VERSION: "LATEST"
      MEMORY: "2500M"
      ONLINE_MODE: "FALSE"
      MOTD: "§6§lXIVIZLEY §bSurvival §e⚡ Arkadaslarla Oyna!"
    volumes: ["./minecraft-data:/data"]`,
  },
  {
    id: 'fivem-sandbox-stack',
    title: 'GTA V FiveM Sandbox & vMenu Eğlence Sunucusu',
    subtitle: 'FiveM FXServer + vMenu Tanrı Modu + StreetHUD + DriftMode + Bob74 IPL',
    description: 'Arkadaşlarınızla serbestçe süper araba çağırmak, sınırsız modifiye yapmak, drift atmak ve GTA V haritasındaki tüm gizli binaları gezmek için vMenu tam yetkili hazır oyun sunucusu.',
    category: 'game',
    isPro: false,
    difficulty: 'Kolay',
    minRamGB: 4,
    icon: '🎮',
    color: '#06B6D4',
    tags: ['FiveM', 'GTA V', 'vMenu', 'Drift', 'StreetHUD', 'Sandbox'],
    moduleIds: ['fivem'],
    composeSnippet: `services:
  fivem:
    image: spritsail/fivem:latest
    restart: unless-stopped
    ports: ["30120:30120/tcp", "30120:30120/udp", "40120:40120/tcp"]
    volumes:
      - ./fivem/data:/config
      - ./fivem/resources:/config/resources`,
  },
  {
    id: 'fivem-roleplay-stack',
    title: 'GTA V FiveM Roleplay Sunucu Altyapısı',
    subtitle: 'Ubuntu + Docker + Portainer + FiveM FXServer + MariaDB + phpMyAdmin',
    description: 'Kendi GTA V RP sunucunuzu açmak için optimize edilmiş txAdmin, MariaDB veritabanı ve web yönetim paneli mimarisi.',
    category: 'game',
    isPro: true,
    difficulty: 'İleri Düzey',
    minRamGB: 8,
    icon: '🚗',
    color: '#FF6B00',
    tags: ['Ubuntu', 'Docker', 'FiveM', 'GTA V', 'Roleplay', 'MariaDB', 'txAdmin'],
    moduleIds: ['ubuntu-server', 'docker', 'portainer', 'fivem', 'mysql'],
    composeSnippet: `services:
  fivem:
    image: spritsail/fivem:latest
    restart: unless-stopped
    ports: ["30120:30120/tcp", "30120:30120/udp", "40120:40120/tcp"]
    volumes:
      - ./fivem/data:/config
      - ./fivem/resources:/config/resources`,
  },
  {
    id: 'palworld-dedicated-stack',
    title: 'Palworld Dedicated Co-op Sunucusu',
    subtitle: 'Ubuntu + Docker + Portainer + Palworld Server + Uptime Kuma',
    description: 'Arkadaşlarınızla kesintisiz Palworld oynamak için yüksek performanslı, otomatik hafıza temizleyicili ve kesinti alarmlı sunucu mimarisi.',
    category: 'game',
    isPro: true,
    difficulty: 'Orta',
    minRamGB: 12,
    icon: '🐾',
    color: '#F59E0B',
    tags: ['Ubuntu', 'Docker', 'Palworld', 'Portainer', 'Uptime Kuma', 'Dedicated'],
    moduleIds: ['ubuntu-server', 'docker', 'portainer', 'palworld', 'uptime-kuma'],
    composeSnippet: `services:
  palworld:
    image: thijsvanloef/palworld-server-docker:latest
    restart: unless-stopped
    ports: ["8211:8211/udp", "27015:27015/udp"]
    environment:
      PORT: 8211
      PLAYERS: 16
      SERVER_NAME: "XIVIZLEY Palworld Server"
    volumes: ["./palworld-data:/palworld"]`,
  },
  {
    id: 'cs2-arena-stack',
    title: 'Counter-Strike 2 (CS2) Özel Turnuva Arenası',
    subtitle: 'Ubuntu + Docker + Portainer + CS2 Server + Glances',
    description: 'Kendi topluluk turnuvalarınız, antrenman veya 5v5 maçlarınız için gecikmesiz Counter-Strike 2 sunucu mimarisi.',
    category: 'game',
    isPro: true,
    difficulty: 'Orta',
    minRamGB: 8,
    icon: '🎯',
    color: '#EAB308',
    tags: ['Ubuntu', 'Docker', 'CS2', 'Counter-Strike', 'Portainer', 'Glances'],
    moduleIds: ['ubuntu-server', 'docker', 'portainer', 'cs2-server', 'glances'],
    composeSnippet: `services:
  cs2:
    image: cm2network/cs2:latest
    restart: unless-stopped
    ports: ["27015:27015/tcp", "27015:27015/udp"]
    environment:
      SRCDS_TOKEN: YOUR_STEAM_GSLT_TOKEN
      CS2_SERVERNAME: "XIVIZLEY CS2 Pro Arena"
    volumes: ["./cs2-data:/home/steam/cs2-dedicated"]`,
  },
  {
    id: 'romm-retro-arcade-stack',
    title: 'RomM Retro Oyun ROM Kütüphanesi & Emulator',
    subtitle: 'Ubuntu + Docker + Nginx + RomM + MariaDB',
    description: 'GameBoy, PS1, SNES, N64 ve Arcade oyun ROM\'larınızı webden yönetin ve doğrudan tarayıcıda oynayın!',
    category: 'game',
    isPro: false,
    difficulty: 'Kolay',
    minRamGB: 2,
    icon: '👾',
    color: '#8B5CF6',
    tags: ['Ubuntu', 'Docker', 'RomM', 'Retro', 'Emulator', 'MariaDB', 'Nginx'],
    moduleIds: ['ubuntu-server', 'docker', 'nginx-proxy-manager', 'romm', 'mysql'],
    composeSnippet: `services:
  romm:
    image: zurdi15/romm:latest
    restart: unless-stopped
    ports: ["8080:8080"]
    environment:
      DB_HOST: romm-db
      DB_NAME: romm
      DB_USER: romm
      DB_PASS: romm_password
    volumes:
      - ./romm/library:/library
      - ./romm/assets:/assets`,
  },

  // ═════════════════════════════════════════════════════════════
  // 5. E-TİCARET, OTOMASYON & NO-CODE
  // ═════════════════════════════════════════════════════════════
  {
    id: 'n8n-automation-hub',
    title: 'n8n Mega İş Akışı & Webhook Kasası',
    subtitle: 'Ubuntu + Docker + Nginx + n8n + PostgreSQL + Redis',
    description: 'Zapier ve Make yerine kendi sunucunuzda sınırsız ve ücretsiz çalışan 400+ entegrasyonlu iş akışı otomasyon merkezi.',
    category: 'ecommerce',
    isPro: false,
    difficulty: 'Kolay',
    minRamGB: 2,
    icon: '⚡',
    color: '#FF6D5A',
    tags: ['Ubuntu', 'Docker', 'n8n', 'Zapier', 'PostgreSQL', 'Redis', 'Nginx'],
    moduleIds: ['ubuntu-server', 'docker', 'nginx-proxy-manager', 'n8n', 'postgresql', 'redis'],
    composeSnippet: `services:
  n8n:
    image: n8nio/n8n:latest
    restart: unless-stopped
    ports: ["5678:5678"]
    environment:
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: postgres
      DB_POSTGRESDB_DATABASE: n8n
      DB_POSTGRESDB_USER: n8n
      DB_POSTGRESDB_PASSWORD: n8n_secure_password
      GENERIC_TIMEZONE: Europe/Istanbul
    volumes: ["./n8n-data:/home/node/.n8n"]

  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: n8n
      POSTGRES_USER: n8n
      POSTGRES_PASSWORD: n8n_secure_password
    volumes: ["./n8n-db:/var/lib/postgresql/data"]`,
  },
  {
    id: 'baserow-nocode-suite',
    title: 'Baserow No-Code Veritabanı & Müşteri Formları',
    subtitle: 'Ubuntu + Docker + Nginx + Baserow + PostgreSQL + Redis',
    description: 'Kod yazmadan ilişkisel veritabanları, formlar ve müşteri tabloları oluşturmanızı sağlayan en güçlü Airtable alternatifi.',
    category: 'ecommerce',
    isPro: true,
    difficulty: 'Orta',
    minRamGB: 4,
    icon: '📊',
    color: '#2F52E0',
    tags: ['Ubuntu', 'Docker', 'Baserow', 'Airtable', 'PostgreSQL', 'Redis', 'Nginx'],
    moduleIds: ['ubuntu-server', 'docker', 'nginx-proxy-manager', 'postgresql', 'redis'],
    composeSnippet: `services:
  baserow:
    image: baserow/baserow:1.24.0
    restart: unless-stopped
    ports: ["8080:80"]
    environment:
      BASEROW_PUBLIC_URL: http://localhost:8080
    volumes: ["./baserow-data:/baserow/data"]`,
  },

  // ═════════════════════════════════════════════════════════════
  // 6. DEVOPS, İZLEME & YEDEKLEME
  // ═════════════════════════════════════════════════════════════
  {
    id: 'production-observability',
    title: 'DevOps Tam Gözlemlenebilirlik & İzleme Üssü',
    subtitle: 'Ubuntu + Docker + Portainer + Uptime Kuma + Glances + Duplicati',
    description: 'Tüm sunucularınızın CPU, RAM, disk, ağ trafiği ve Docker konteyner metriklerini gösteren ve kesintilerde bildirim atan profesyonel DevOps izleme istasyonu.',
    category: 'devops',
    isPro: false,
    difficulty: 'Orta',
    minRamGB: 2,
    icon: '📊',
    color: '#F46800',
    tags: ['Ubuntu', 'Docker', 'Portainer', 'Uptime Kuma', 'Glances', 'Duplicati', 'DevOps'],
    moduleIds: ['ubuntu-server', 'docker', 'portainer', 'uptime-kuma', 'glances', 'duplicati'],
    composeSnippet: `services:
  portainer:
    image: portainer/portainer-ce:latest
    restart: unless-stopped
    ports: ["9000:9000", "9443:9443"]
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./portainer-data:/data

  uptime-kuma:
    image: louislam/uptime-kuma:latest
    restart: unless-stopped
    ports: ["3001:3001"]
    volumes: ["./uptime-kuma-data:/app/data"]`,
  },

  // ═════════════════════════════════════════════════════════════
  // 7. KURUMSAL & OFİS
  // ═════════════════════════════════════════════════════════════
  {
    id: 'tpl-personal-cloud',
    title: 'Kişisel Bulut & Güvenli Depolama',
    subtitle: 'Nextcloud + Immich + PostgreSQL + Redis + Duplicati',
    description: 'Tüm kişisel dosyalarınız, yapay zeka fotoğraflarınız ve yedekleriniz için eksiksiz self-hosted bulut mimarisi.',
    category: 'enterprise',
    isPro: true,
    difficulty: 'Orta',
    minRamGB: 8,
    icon: '☁️',
    color: '#3B82F6',
    tags: ['Nextcloud', 'Immich', 'PostgreSQL', 'Redis', 'Duplicati', 'Cloud'],
    moduleIds: ['nextcloud', 'immich', 'postgresql', 'redis', 'duplicati'],
    composeSnippet: `services:
  nextcloud:
    image: nextcloud:latest
  immich:
    image: ghcr.io/immich-app/immich-server:release
  postgres:
    image: postgres:16-alpine
  redis:
    image: redis:7-alpine
  duplicati:
    image: linuxserver/duplicati:latest`,
  },
  {
    id: 'nextcloud-collabora-office',
    title: 'Kurumsal Özel Bulut & Canlı Ofis',
    subtitle: 'Ubuntu + Docker + Nginx + Nextcloud Hub + MariaDB + Redis + Vaultwarden',
    description: 'Google Drive ve Microsoft Office alternatifi; şirket içi dosya paylaşımı, canlı Word/Excel düzenleme, takvim ve güvenli şifre kasası içeren devasa bulut ofisi mimarisi.',
    category: 'enterprise',
    isPro: true,
    difficulty: 'Orta',
    minRamGB: 4,
    icon: '💼',
    color: '#0082C9',
    tags: ['Ubuntu', 'Docker', 'Nextcloud', 'MariaDB', 'Redis', 'Vaultwarden', 'Nginx'],
    moduleIds: ['ubuntu-server', 'docker', 'nginx-proxy-manager', 'nextcloud', 'mysql', 'redis', 'vaultwarden'],
    composeSnippet: `services:
  nextcloud:
    image: nextcloud:apache
    restart: unless-stopped
    ports: ["8080:80"]
    environment:
      MYSQL_HOST: nextcloud-db
      MYSQL_DATABASE: nextcloud
      MYSQL_USER: nextcloud
      MYSQL_PASSWORD: nextcloud_secure_password
      REDIS_HOST: nextcloud-redis
    volumes: ["./nextcloud-data:/var/www/html"]

  nextcloud-db:
    image: mariadb:10.11
    restart: unless-stopped
    environment:
      MYSQL_DATABASE: nextcloud
      MYSQL_USER: nextcloud
      MYSQL_PASSWORD: nextcloud_secure_password
      MYSQL_ROOT_PASSWORD: db_root_password
    volumes: ["./nextcloud-db:/var/lib/mysql"]

  nextcloud-redis:
    image: redis:alpine
    restart: unless-stopped`,
  },
  {
    id: 'casaos-starter-home',
    title: 'CasaOS Akıllı Ev & Medya İstasyonu',
    subtitle: 'Debian + Docker + CasaOS + Jellyfin + qBittorrent + FileBrowser',
    description: 'Yeni başlayanlar için tarayıcıdan tek tıkla uygulama kurulan modern CasaOS arayüzü ve entegre medya indirme istasyonu.',
    category: 'enterprise',
    isPro: false,
    difficulty: 'Kolay',
    minRamGB: 2,
    icon: '🏠',
    color: '#00D1B2',
    tags: ['Debian', 'Docker', 'CasaOS', 'Jellyfin', 'qBittorrent', 'FileBrowser'],
    moduleIds: ['debian', 'docker', 'casaos', 'jellyfin', 'qbittorrent', 'filebrowser'],
    composeSnippet: `services:
  jellyfin:
    image: jellyfin/jellyfin:latest
    restart: unless-stopped
    ports: ["8096:8096"]
    volumes: ["./media:/data"]

  qbittorrent:
    image: linuxserver/qbittorrent:latest
    restart: unless-stopped
    ports: ["8080:8080"]
    volumes: ["./downloads:/downloads"]`,
  },
  {
    id: 'home-assistant-smart-home',
    title: 'Home Assistant Akıllı Ev Çözümü',
    subtitle: 'Home Assistant + Mosquitto MQTT + PostgreSQL (+ Redis Opsiyonel)',
    description: 'Tam otomatik akıllı ev mimarisi, MQTT iletişimi ve veri depolama.',
    category: 'enterprise',
    isPro: false,
    difficulty: 'Orta',
    minRamGB: 2,
    icon: '🏠',
    color: '#FF6600',
    tags: ['Home Assistant', 'Mosquitto', 'Docker', 'IoT'],
    moduleIds: ['home-assistant', 'mosquitto', 'postgresql', 'redis'],
    composeSnippet: `services:
  home-assistant:
    image: homeassistant/home-assistant:stable
    restart: unless-stopped
    ports: ["8123:8123"]
    volumes: ["./homeassistant:/config"]
  mosquitto:
    image: eclipse-mosquitto:latest
    restart: unless-stopped
    ports: ["1883:1883","9001:9001"]
    volumes: ["./mosquitto/config:/mosquitto/config","./mosquitto/data:/mosquitto/data"]
  postgresql:
    image: postgres:15
    restart: unless-stopped
    environment:
      POSTGRES_PASSWORD: example
    ports: ["5432:5432"]
    volumes: ["./postgres:/var/lib/postgresql/data"]`,
  },
  {
    id: 'paperless-ngx-dms',
    title: 'Paperless-ngx Döküman Yönetim Sistemi',
    subtitle: 'Paperless-ngx + PostgreSQL + Redis + Tika + Gotenberg',
    description: 'OCR ve metin çıkarma, PDF oluşturma, tam CRUD doküman yönetimi.',
    category: 'enterprise',
    isPro: false,
    difficulty: 'Orta',
    minRamGB: 2,
    icon: '📄',
    color: '#0F9D58',
    tags: ['Paperless-ngx', 'PostgreSQL', 'Redis', 'Tika', 'Gotenberg'],
    moduleIds: ['paperless-ngx', 'postgresql', 'redis', 'tika', 'gotenberg'],
    composeSnippet: `services:
  paperless-ngx:
    image: thepaperless/ngx:latest
    restart: unless-stopped
    ports: ["8000:8000"]
    environment:
      TZ: Europe/Istanbul
    volumes:
      - ./paperless-data:/usr/src/paperless/data
  postgresql:
    image: postgres:15
    restart: unless-stopped
    environment:
      POSTGRES_PASSWORD: example
    ports: ["5432:5432"]
    volumes: ["./postgres:/var/lib/postgresql/data"]
  redis:
    image: redis:alpine
    restart: unless-stopped
    ports: ["6379:6379"]
  tika:
    image: apache/tika:latest
    restart: unless-stopped
    ports: ["9998:9998"]
  gotenberg:
    image: thecodingmachine/gotenberg:7
    restart: unless-stopped
    ports: ["3000:3000"]`,
  },
  {
    id: 'umami-analytics-suite',
    title: 'Web Analitik & Veri Merkezi',
    subtitle: 'Ubuntu + Docker + Caddy + Umami + PostgreSQL + NocoDB',
    description: 'Google Analytics ve Airtable yerine kendi sunucunuzda çalışan, %100 gizlilik odaklı, çerezsiz web analitiği ve akıllı elektronik tablo veritabanı.',
    category: 'web',
    isPro: false,
    difficulty: 'Kolay',
    minRamGB: 2,
    icon: '📈',
    color: '#2563EB',
    tags: ['Umami', 'PostgreSQL', 'NocoDB', 'Caddy', 'Analytics', 'NoCode'],
    moduleIds: ['ubuntu-server', 'docker', 'caddy', 'umami', 'postgresql', 'nocodb'],
    composeSnippet: `services:
  umami:
    image: ghcr.io/umami-software/umami:postgresql-latest
    restart: unless-stopped
    ports: ["3005:3000"]
    environment:
      DATABASE_URL: postgresql://umami:umami_pass@postgresql:5432/umami
      DATABASE_TYPE: postgresql
      APP_SECRET: change-me-secret-token
    depends_on:
      - postgresql
  nocodb:
    image: nocodb/nocodb:latest
    restart: unless-stopped
    ports: ["8089:8080"]
    volumes:
      - ./nocodb/data:/usr/app/data
  postgresql:
    image: postgres:15
    restart: unless-stopped
    ports: ["5432:5432"]
    environment:
      POSTGRES_USER: umami
      POSTGRES_PASSWORD: umami_pass
      POSTGRES_DB: umami
    volumes:
      - ./postgres:/var/lib/postgresql/data`,
  },
  {
    id: 'kavita-digital-library',
    title: 'Manga, Kitap & Medya Kütüphanesi',
    subtitle: 'Ubuntu + Docker + Caddy + Kavita + Audiobookshelf + FileBrowser',
    description: 'Kendi dijital kitaplığınız: Manga ve çizgi romanlar için Kavita, sesli kitaplar ve podcastler için Audiobookshelf, dosya transferi için FileBrowser.',
    category: 'media',
    isPro: false,
    difficulty: 'Kolay',
    minRamGB: 2,
    icon: '📚',
    color: '#0284C7',
    tags: ['Kavita', 'Audiobookshelf', 'FileBrowser', 'Caddy', 'Manga', 'EBook'],
    moduleIds: ['ubuntu-server', 'docker', 'caddy', 'kavita', 'audiobookshelf', 'filebrowser'],
    composeSnippet: `services:
  kavita:
    image: kavitareader/kavita:latest
    restart: unless-stopped
    ports: ["5005:5000"]
    volumes:
      - ./kavita/data:/kavita/config
      - ./kavita/manga:/manga
      - ./kavita/books:/books
  audiobookshelf:
    image: ghcr.io/advplyr/audiobookshelf:latest
    restart: unless-stopped
    ports: ["13378:13378"]
    volumes:
      - ./audiobookshelf/config:/config
      - ./audiobookshelf/metadata:/metadata
      - ./audiobooks:/audiobooks
  filebrowser:
    image: filebrowser/filebrowser:latest
    restart: unless-stopped
    ports: ["8085:80"]
    volumes:
      - ./data:/srv
      - ./filebrowser/database.db:/database.db`,
  },
  {
    id: 'changedetection-monitor-stack',
    title: 'Otonom Fiyat, Değişiklik & Sistem Radarı',
    subtitle: 'Ubuntu + Docker + Nginx + Changedetection + Uptime Kuma + n8n',
    description: 'Web sitelerindeki fiyat değişimlerini ve stokları Changedetection ile izleyin, sunucu ayakta kalma durumunu Uptime Kuma ile takip edin, n8n ile Telegram bildirimleri tetikleyin.',
    category: 'devops',
    isPro: false,
    difficulty: 'Orta',
    minRamGB: 2,
    icon: '🎯',
    color: '#EC4899',
    tags: ['Changedetection', 'Uptime-Kuma', 'n8n', 'Monitoring', 'Automation'],
    moduleIds: ['ubuntu-server', 'docker', 'nginx-proxy-manager', 'changedetection', 'uptime-kuma', 'n8n'],
    composeSnippet: `services:
  changedetection:
    image: ghcr.io/dgtlmoon/changedetection.io:latest
    restart: unless-stopped
    ports: ["5003:5000"]
    volumes:
      - ./changedetection/data:/datastore
  uptime-kuma:
    image: louislam/uptime-kuma:latest
    restart: unless-stopped
    ports: ["3001:3001"]
    volumes:
      - ./uptime-kuma/data:/app/data
  n8n:
    image: n8nio/n8n:latest
    restart: unless-stopped
    ports: ["5678:5678"]
    environment:
      - GENERIC_TIMEZONE=Europe/Istanbul
    volumes:
      - ./n8n/data:/home/node/.n8n`,
  },
  {
    id: 'penpot-design-studio',
    title: 'Açık Kaynak Tasarım & Prototip Stüdyosu',
    subtitle: 'Ubuntu + Docker + Caddy + Penpot + PostgreSQL + Redis',
    description: 'Figma alternatifi açık kaynak Penpot UI/UX tasarım ve prototipleme platformu. PostgreSQL ve Redis ile tam performanslı yerel çalışma ortamı.',
    category: 'enterprise',
    isPro: false,
    difficulty: 'Orta',
    minRamGB: 4,
    icon: '🎨',
    color: '#8B5CF6',
    tags: ['Penpot', 'PostgreSQL', 'Redis', 'Caddy', 'Design', 'UIUX'],
    moduleIds: ['ubuntu-server', 'docker', 'caddy', 'penpot', 'postgresql', 'redis'],
    composeSnippet: `services:
  penpot:
    image: penpotapp/frontend:latest
    restart: unless-stopped
    ports: ["9010:80"]
    environment:
      - PENPOT_FLAGS=enable-registration enable-login-with-password
    volumes:
      - ./penpot/assets:/opt/data/assets
  postgresql:
    image: postgres:15
    restart: unless-stopped
    ports: ["5432:5432"]
    environment:
      POSTGRES_PASSWORD: penpot_password
    volumes:
      - ./postgres:/var/lib/postgresql/data
  redis:
    image: redis:alpine
    restart: unless-stopped
    ports: ["6379:6379"]`,
  },
  // ═════════════════════════════════════════════════════════════
  // 27. SUPABASE SELF-HOST BACKEND & VERİTABANI STÜDYOSU
  // ═════════════════════════════════════════════════════════════
  {
    id: 'supabase-selfhost',
    title: 'Supabase Açık Kaynak Backend & Veritabanı Stüdyosu',
    subtitle: 'Ubuntu + Docker + Supabase Studio + PostgreSQL + GoTrue + Kong Gateway',
    description: 'Firebase alternatifi açık kaynaklı PostgreSQL 15, GoTrue kimlik doğrulama, PostgREST API motoru, Realtime ve Kong API ağ geçidini barındıran tam teşekküllü kurumsal backend mimarisi.',
    category: 'enterprise',
    isPro: true,
    difficulty: 'İleri Düzey',
    minRamGB: 4,
    icon: '💼',
    color: '#3ECF8E',
    tags: ['Supabase', 'PostgreSQL', 'GoTrue', 'Kong', 'REST API', 'Enterprise', 'Docker'],
    moduleIds: ['ubuntu-server', 'docker', 'supabase-studio', 'postgresql', 'redis'],
    composeSnippet: `services:
  kong:
    image: kong:2.8.1
    restart: unless-stopped
    ports:
      - "8000:8000"
      - "8443:8443"
    environment:
      KONG_DATABASE: "off"
      KONG_DECLARATIVE_CONFIG: /var/lib/kong/kong.yml
    volumes:
      - ./kong/kong.yml:/var/lib/kong/kong.yml:ro

  auth:
    image: supabase/gotrue:v2.132.3
    restart: unless-stopped
    environment:
      GOTRUE_JWT_SECRET: super-secret-jwt-token-with-at-least-32-chars
      GOTRUE_DB_DRIVER: postgres
      DATABASE_URL: postgres://postgres:postgres_secure_pass@db:5432/postgres
    depends_on:
      - db

  rest:
    image: postgrest/postgrest:v12.0.1
    restart: unless-stopped
    environment:
      PGRST_DB_URI: postgres://postgres:postgres_secure_pass@db:5432/postgres
      PGRST_DB_SCHEMAS: public,storage
      PGRST_DB_ANON_ROLE: anon
    depends_on:
      - db

  studio:
    image: supabase/studio:latest
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      STUDIO_PG_META_URL: http://meta:8080
      POSTGRES_PASSWORD: postgres_secure_pass
    depends_on:
      - db

  db:
    image: supabase/postgres:15.1.0.117
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_PASSWORD: postgres_secure_pass
    volumes:
      - ./db/data:/var/lib/postgresql/data`,
  },
  // ═════════════════════════════════════════════════════════════
  // 28. RUSTDESK GÜVENLİ UZAKTAN MASAÜSTÜ SUNUCUSU
  // ═════════════════════════════════════════════════════════════
  {
    id: 'rustdesk-remote-desktop',
    title: 'RustDesk Güvenli Uzaktan Masaüstü Sunucusu',
    subtitle: 'Ubuntu + Docker + RustDesk Relay (hbbr) + Signal (hbbs)',
    description: 'AnyDesk ve TeamViewer alternatifi, uçtan uca şifreli ve sıfır veri sızıntılı kendi kendine barındırılan uzaktan masaüstü ve dosya aktarım altyapısı.',
    category: 'security',
    isPro: false,
    difficulty: 'Kolay',
    minRamGB: 2,
    icon: '🛡️',
    color: '#EA580C',
    tags: ['RustDesk', 'Remote Desktop', 'hbbs', 'hbbr', 'Security', 'Docker'],
    moduleIds: ['ubuntu-server', 'docker', 'rustdesk-server'],
    composeSnippet: `services:
  hbbs:
    image: rustdesk/rustdesk-server:latest
    command: hbbs -r rustdesk.local:21117
    restart: unless-stopped
    ports:
      - "21115:21115"
      - "21116:21116"
      - "21116:21116/udp"
      - "21118:21118"
    volumes:
      - ./data:/root

  hbbr:
    image: rustdesk/rustdesk-server:latest
    command: hbbr
    restart: unless-stopped
    ports:
      - "21117:21117"
      - "21119:21119"
    volumes:
      - ./data:/root`,
  },
  // ═════════════════════════════════════════════════════════════
  // 29. SEARXNG GİZLİLİK ODAKLI META ARAMA MOTORU
  // ═════════════════════════════════════════════════════════════
  {
    id: 'searxng-privacy-search',
    title: 'SearXNG Gizlilik Odaklı Meta Arama Motoru',
    subtitle: 'Ubuntu + Docker + SearXNG + Redis Cache + Caddy SSL',
    description: "Kullanıcı takibi ve profil çıkarma olmaksızın 70'ten fazla arama motorundan anonim sonuçlar derleyen, Redis önbellekli ultra hızlı özel meta arama motoru.",
    category: 'web',
    isPro: false,
    difficulty: 'Kolay',
    minRamGB: 2,
    icon: '🌐',
    color: '#0084FF',
    tags: ['SearXNG', 'Privacy', 'Search Engine', 'Redis', 'Docker', 'Caddy'],
    moduleIds: ['ubuntu-server', 'docker', 'caddy', 'searxng', 'redis'],
    composeSnippet: `services:
  searxng:
    image: searxng/searxng:latest
    restart: unless-stopped
    ports:
      - "8888:8080"
    volumes:
      - ./searxng:/etc/searxng
    environment:
      - SEARXNG_BASE_URL=http://localhost:8888/
    depends_on:
      - redis

  redis:
    image: redis:alpine
    restart: unless-stopped
    ports:
      - "6379:6379"

  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - ./caddy_data:/data
    depends_on:
      - searxng`,
  },
  // ═════════════════════════════════════════════════════════════
  // 30. PTERODACTYL OYUN SUNUCUSU YÖNETİM PANELİ
  // ═════════════════════════════════════════════════════════════
  {
    id: 'pterodactyl-game-panel',
    title: 'Pterodactyl Oyun Sunucusu Yönetim Paneli',
    subtitle: 'Ubuntu + Docker + Pterodactyl Panel + MariaDB + Redis',
    description: 'Minecraft, Rust, CS2 ve ARK sunucularını web üzerinden yönetmek, kaynak kullanımını sınırlamak ve SFTP erişimi sağlamak için endüstri standardı oyun kontrol merkezi.',
    category: 'game',
    isPro: true,
    difficulty: 'İleri Düzey',
    minRamGB: 4,
    icon: '🎮',
    color: '#0099FF',
    tags: ['Pterodactyl', 'Game Server', 'Minecraft', 'Panel', 'MariaDB', 'Redis', 'Docker'],
    moduleIds: ['ubuntu-server', 'docker', 'pterodactyl-panel', 'mysql', 'redis'],
    composeSnippet: `services:
  panel:
    image: ghcr.io/pterodactyl/panel:latest
    restart: unless-stopped
    ports:
      - "8085:80"
      - "8445:443"
    environment:
      APP_ENV: production
      APP_URL: http://localhost:8085
      DB_HOST: database
      DB_PORT: 3306
      DB_DATABASE: panel
      DB_USERNAME: pterodactyl
      DB_PASSWORD: pterodactyl_secure_password
      CACHE_DRIVER: redis
      SESSION_DRIVER: redis
      QUEUE_CONNECTION: redis
      REDIS_HOST: cache
    volumes:
      - ./pterodactyl/var:/app/var/
      - ./pterodactyl/nginx:/etc/nginx/http.d/
      - ./pterodactyl/logs:/app/storage/logs
    depends_on:
      - database
      - cache

  database:
    image: mariadb:10.11
    restart: unless-stopped
    command: --default-authentication-plugin=mysql_native_password
    volumes:
      - ./pterodactyl/mysql:/var/lib/mysql
    environment:
      MYSQL_ROOT_PASSWORD: db_root_password
      MYSQL_DATABASE: panel
      MYSQL_USER: pterodactyl
      MYSQL_PASSWORD: pterodactyl_secure_password

  cache:
    image: redis:alpine
    restart: unless-stopped`,
  },
];

// ─── Legacy ArchitectureTemplate & PREDEFINED_TEMPLATES ───────

export interface TemplateNode {
  id: string;
  moduleId: string;
  x: number;
  y: number;
  label?: string;
  isCustom?: boolean;
  customImage?: string;
  customPorts?: Array<{ host: number; container: number; protocol?: 'tcp' | 'udp'; label?: string }>;
  customEnv?: Record<string, string>;
  customVolumes?: Array<{ hostPath: string; containerPath: string }>;
  customRestart?: string;
  portOverrides?: Record<number, number>;
  envOverrides?: Record<string, string>;
  selectedPlugins?: string[] | undefined;
}

export interface TemplateEdge {
  id: string;
  source: string;
  target: string;
}

export interface ArchitectureTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  categoryLabel: string;
  icon: string;
  color: string;
  badge: string;
  difficulty: string;
  services: string[];
  nodes: TemplateNode[];
  edges: TemplateEdge[];
  author?: string;
  likes?: number;
  createdAt?: string;
}

export const PREDEFINED_TEMPLATES: ArchitectureTemplate[] = STACK_TEMPLATES.map((st, idx) => {
  const nodes: TemplateNode[] = st.moduleIds.map((modId, mIdx) => {
    let defaultPlugins: string[] | undefined;
    if (modId === 'fivem') {
      if (st.id === 'fivem-sandbox-stack') {
        defaultPlugins = ['vmenu', 'speedometer', 'drift-mode', 'bob74_ipl', 'easy-time'];
      } else if (st.id === 'fivem-roleplay-stack') {
        defaultPlugins = ['oxmysql', 'pma-voice', 'bob74_ipl', 'postal-map', 'easy-time'];
      }
    }
    return {
      id: `n${mIdx + 1}`,
      moduleId: modId,
      x: 80 + Math.floor(mIdx / 2) * 280,
      y: (mIdx % 2 === 0) ? 120 : 340,
      selectedPlugins: defaultPlugins,
    };
  });
  const edges: TemplateEdge[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const src = nodes[i];
    const dst = nodes[i + 1];
    if (src && dst) {
      edges.push({ id: `e${i + 1}`, source: src.id, target: dst.id });
    }
  }
  return {
    id: st.id,
    name: st.title,
    description: st.description,
    category: st.category,
    categoryLabel: TEMPLATE_CATEGORIES.find(c => c.id === st.category)?.label || st.category,
    icon: st.icon,
    color: st.color,
    badge: st.isPro ? 'Gelişmiş' : 'Topluluk',
    difficulty: st.difficulty,
    services: st.tags,
    nodes,
    edges,
    author: 'XIVIZLEY Resmi Arşivi',
    likes: 42 + ((idx * 11) % 55),
    createdAt: '2026-08-20',
  };
});
