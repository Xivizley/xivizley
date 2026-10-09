import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// NIST P-256 (prime256v1) Signing Key (Strictly from Environment - Zero Hardcoded Secret)
const getSigningPrivateKey = () => {
  const key = process.env.XIVIZLEY_SIGNING_PRIVATE_KEY;
  if (!key) return null;
  return key.replace(/\\n/g, '\n');
};

// In-Memory Signature Memoization (O(1) response, protects against CPU exhaustion and timing attacks)
let cachedSignature: Buffer | null = null;
let cachedScriptHash: string | null = null;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const script = `#!/usr/bin/env bash
# ============================================================
# XIVIZLEY — Advanced 'durum' CLI Management & Monitor v2.3
# Cryptographically Signed via NIST P-256 EC Public Key
# https://xivizley.com.tr
# ============================================================

set -o pipefail

CYAN='\\033[0;36m'
GREEN='\\033[0;32m'
RED='\\033[0;31m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
BOLD='\\033[1m'
DIM='\\033[2m'
NC='\\033[0m'

# ── 1. Yetki Kontrolü (Root / EUID Check) ──
if [ "\${EUID:-$(id -u)}" -ne 0 ]; then
  echo -e "\${RED}HATA: 'durum' CLI kurulumu ve sistem yönetimi için root yetkisi gereklidir.\${NC}" >&2
  echo -e "\${DIM}Lütfen komutu 'sudo durum' şeklinde veya root kullanıcısı olarak çalıştırın.\${NC}" >&2
  exit 1
fi

# ── 2. Güvenilir Public Key (Rotated NIST P-256 Trust Anchor) ──
XIVIZLEY_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEIgWX/H8tbElvksn7mY7R0Ju2ZjuI
nLYIaQxDFF9f4DNfr8Yw3guMneHMsU1AaTK7jphXVp/s3k8BjYdxA57kQQ==
-----END PUBLIC KEY-----"

# ── 3. Kriptografik İmza Doğrulama ve Fail-Closed Kurulum ──
verify_and_install_durum() {
  local target="/usr/local/bin/durum"
  local tmpfile
  local tmpsig
  local tmppub

  # 1. Doğrulama araçlarının varlık kontrolü (FAIL-CLOSED)
  if ! command -v openssl &>/dev/null; then
    echo -e "\${RED}GÜVENLİK HATASI: OpenSSL bulunamadı, kriptografik doğrulama yapılamıyor.\${NC}" >&2
    return 1
  fi

  tmpfile=\$(mktemp)
  tmpsig=\$(mktemp)
  tmppub=\$(mktemp)

  # Hem betiği hem de ayrık dijital imzayı (.sig) çek
  if ! curl -sSfL --max-time 15 https://xivizley.com.tr/durum -o "\$tmpfile" || \\
     ! curl -sSfL --max-time 10 "https://xivizley.com.tr/durum?sig=1" -o "\$tmpsig"; then
    rm -f "\$tmpfile" "\$tmpsig" "\$tmppub"
    echo -e "\${RED}HATA: Betik veya kriptografik imza dosyası sunucudan indirilemedi.\${NC}" >&2
    return 1
  fi

  # İndirilen dosyaların boş olmadığını denetle (FAIL-CLOSED)
  if [ ! -s "\$tmpfile" ] || [ ! -s "\$tmpsig" ]; then
    rm -f "\$tmpfile" "\$tmpsig" "\$tmppub"
    echo -e "\${RED}GÜVENLİK HATASI: İndirilen betik veya imza boş! Kurulum iptal edildi.\${NC}" >&2
    return 1
  fi

  # 2. Asimetrik İmza Doğrulaması (OpenSSL ile NIST P-256)
  echo "\$XIVIZLEY_PUBLIC_KEY" > "\$tmppub"
  if ! openssl dgst -sha256 -verify "\$tmppub" -signature "\$tmpsig" "\$tmpfile" >/dev/null 2>&1; then
    rm -f "\$tmpfile" "\$tmpsig" "\$tmppub"
    echo -e "\${RED}============================================================\${NC}" >&2
    echo -e "\${RED}⛔ KRİTİK GÜVENLİK ALARMI: DİJİTAL İMZA GEÇERSİZ!\${NC}" >&2
    echo -e "\${RED}İndirilen kod onaylı XIVIZLEY özel anahtarı ile imzalanmamış.\${NC}" >&2
    echo -e "\${RED}Olası bir MITM saldırısı, DNS sızıntısı veya sunucu ihlali!\${NC}" >&2
    echo -e "\${RED}İşlem güvenlik nedeniyle tamamen iptal edildi.\${NC}" >&2
    echo -e "\${RED}============================================================\${NC}" >&2
    return 1
  fi

  # 3. Sözdizimi Kontrolü (bash -n: Taşımada veri bozulmalarına karşı korur)
  if ! bash -n "\$tmpfile" 2>/dev/null; then
    rm -f "\$tmpfile" "\$tmpsig" "\$tmppub"
    echo -e "\${RED}HATA: İndirilen betik sözdizimi doğrulamasından geçemedi (bozuk dosya).\${NC}" >&2
    return 1
  fi

  # 4. Atomik Taşıma ve Sembolik Bağlantı
  mkdir -p /usr/local/bin 2>/dev/null || true
  mv "\$tmpfile" "\$target"
  chmod 755 "\$target"
  ln -sf "\$target" /usr/local/bin/xivizley 2>/dev/null || true
  rm -f "\$tmpsig" "\$tmppub"
  return 0
}

# ── 4. Otomatik İlk Kurulum Kontrolü (/usr/local/bin/durum) ──
if [ ! -f /usr/local/bin/durum ] || [ ! -x /usr/local/bin/durum ]; then
  if ! verify_and_install_durum; then
    echo -e "\${RED}İlk kurulum güvenli doğrulama yapılamadığı için durduruldu.\${NC}" >&2
    exit 1
  fi
fi

# ── 5. Güvenli Docker & Compose Kurulum Kontrolü ──
if ! command -v docker &>/dev/null; then
  echo -e "\${YELLOW}⏳ Docker bulunamadı. Paket yöneticisi üzerinden güvenli kurulum deneniyor...\${NC}"
  apt-get update -qq && apt-get install -y -qq docker.io docker-compose-plugin 2>/dev/null || true
  systemctl enable --now docker 2>/dev/null || true

  if command -v docker &>/dev/null; then
    echo -e "\${GREEN}✓ Docker servisi aktif edildi.\${NC}"
  else
    echo -e "\${RED}HATA: Docker kurulamadı. Lütfen sunucunuza Docker'ı manuel kurun.\${NC}" >&2
  fi
fi

CMD="\${1:-status}"
ARG2="\${2:-}"

case "$CMD" in
  log|logs|loglar)
    if [ -n "$ARG2" ]; then
      echo -e "\${CYAN}📄 '\$ARG2' servisi için canlı loglar izleniyor (Çıkmak için Ctrl+C)...\${NC}"
      docker logs -f --tail=100 "$ARG2"
    else
      echo -e "\${CYAN}📄 Tüm servislerin canlı logları (Çıkmak için Ctrl+C)...\${NC}"
      if [ -d /root/xivizley-stack ]; then
        cd /root/xivizley-stack && docker compose logs -f --tail=30
      else
        docker logs -f \$(docker ps -q)
      fi
    fi
    exit 0
    ;;

  restart|yeniden-baslat)
    if [ -n "$ARG2" ]; then
      echo -e "\${YELLOW}🔄 '\$ARG2' yeniden başlatılıyor...\${NC}"
      docker restart "$ARG2"
      echo -e "\${GREEN}✓ '\$ARG2' başarıyla yeniden başlatıldı.\${NC}"
    else
      echo -e "\${YELLOW}🔄 Tüm XIVIZLEY stack yeniden başlatılıyor...\${NC}"
      if [ -d /root/xivizley-stack ]; then
        cd /root/xivizley-stack && docker compose restart
      fi
      echo -e "\${GREEN}✓ Tüm servisler yeniden başlatıldı.\${NC}"
    fi
    exit 0
    ;;

  stop|durdur)
    if [ -n "$ARG2" ]; then
      echo -e "\${RED}⏹ '\$ARG2' durduruluyor...\${NC}"
      docker stop "$ARG2"
      echo -e "\${GREEN}✓ '\$ARG2' durduruldu.\${NC}"
    else
      echo -e "\${RED}⏹ Tüm XIVIZLEY stack durduruluyor...\${NC}"
      if [ -d /root/xivizley-stack ]; then
        cd /root/xivizley-stack && docker compose stop
      fi
      echo -e "\${GREEN}✓ Tüm servisler durduruldu.\${NC}"
    fi
    exit 0
    ;;

  start|baslat)
    if [ -n "$ARG2" ]; then
      echo -e "\${GREEN}▶ '\$ARG2' başlatılıyor...\${NC}"
      docker start "$ARG2"
      echo -e "\${GREEN}✓ '\$ARG2' başlatıldı.\${NC}"
    else
      echo -e "\${GREEN}▶ Tüm XIVIZLEY stack başlatılıyor...\${NC}"
      if [ -d /root/xivizley-stack ]; then
        cd /root/xivizley-stack && docker compose start
      fi
      echo -e "\${GREEN}✓ Tüm servisler başlatıldı.\${NC}"
    fi
    exit 0
    ;;

  kur|install)
    APP_NAME="\${2:-}"
    if [ -z "\$APP_NAME" ]; then
      echo -e "\${YELLOW}Kullanım: durum kur <uygulama-adi>\${NC}"
      echo -e "\${DIM}Desteklenenler: nextcloud, jellyfin, vaultwarden, adguard-home, uptime-kuma, minecraft\${NC}"
      exit 1
    fi
    echo -e "\${CYAN}📦 '\$APP_NAME' uygulaması kuruluyor...\${NC}"
    TARGET_DIR="/root/xivizley-stack/apps/\$APP_NAME"
    mkdir -p "\$TARGET_DIR"

    case "\$APP_NAME" in
      nextcloud)
        NEXTCLOUD_PASS=\$(tr -dc 'A-Za-z0-9!@#%^&*' </dev/urandom | head -c 20 2>/dev/null || openssl rand -base64 15)
        DB_PASS=\$(tr -dc 'A-Za-z0-9' </dev/urandom | head -c 24 2>/dev/null || openssl rand -hex 12)

        # Şifreler terminale düz basılmaz; izinleri kısıtlanmış .env dosyasına yazılır (chmod 600)
        cat <<ENVEOF > "\$TARGET_DIR/.env"
NEXTCLOUD_ADMIN_USER=admin
NEXTCLOUD_ADMIN_PASSWORD=\${NEXTCLOUD_PASS}
POSTGRES_DB=nextcloud
POSTGRES_USER=nextcloud
POSTGRES_PASSWORD=\${DB_PASS}
ENVEOF
        chmod 600 "\$TARGET_DIR/.env"

        cat <<APPC > "\$TARGET_DIR/docker-compose.yml"
services:
  nextcloud:
    image: nextcloud:28-apache
    container_name: nextcloud
    restart: unless-stopped
    ports:
      - "8080:80/tcp"
    env_file:
      - .env
    environment:
      - POSTGRES_HOST=nextcloud-db
    volumes:
      - ./html:/var/www/html
    depends_on:
      - nextcloud-db

  nextcloud-db:
    image: postgres:15-alpine
    container_name: nextcloud-db
    restart: unless-stopped
    env_file:
      - .env
    volumes:
      - ./db:/var/lib/postgresql/data
APPC
        # GÜVENLİK: Şifre doğrudan ekrana / stdout'a basılmaz. Sadece dosya referansı verilir.
        echo -e "\${GREEN}============================================================\${NC}"
        echo -e "\${GREEN}✓ Nextcloud konteyneri güvenle yapılandırıldı.\${NC}"
        echo -e "  Erişim Dosyası:   \${CYAN}\$TARGET_DIR/.env\${NC} (chmod 600 korumalı)"
        echo -e "  Admin Kullanıcı:  \${BOLD}admin\${NC}"
        echo -e "  Admin Şifre:      \${DIM}[GÜVENLİK: Log sızıntısını önlemek için ekrana basılmadı]\${NC}"
        echo -e "  Şifreyi Görmek:   \${YELLOW}cat \$TARGET_DIR/.env | grep ADMIN_PASSWORD\${NC}"
        echo -e "\${GREEN}============================================================\${NC}"
        ;;

      minecraft|papermc)
        cat <<APPC > "\$TARGET_DIR/docker-compose.yml"
services:
  minecraft:
    image: itzg/minecraft-server:latest
    container_name: minecraft
    restart: unless-stopped
    stdin_open: true
    tty: true
    ports:
      - "25565:25565/tcp"
    environment:
      - EULA=TRUE
      - TYPE=PAPER
      - VERSION=1.21.1
      - MEMORY=4G
      - ENABLE_RCON=true
      - CREATE_CONSOLE_IN_PIPE=true
    volumes:
      - ./data:/data
APPC
        ;;

      jellyfin)
        cat <<APPC > "\$TARGET_DIR/docker-compose.yml"
services:
  jellyfin:
    image: jellyfin/jellyfin:latest
    container_name: jellyfin
    restart: unless-stopped
    ports:
      - "8096:8096/tcp"
    volumes:
      - ./config:/config
      - ./cache:/cache
      - /mnt/media:/media
APPC
        ;;

      vaultwarden)
        echo -e "\${YELLOW}⚠️  GÜVENLİK BİLGİSİ: Vaultwarden parola yöneticisidir.\${NC}"
        echo -e "\${YELLOW}   Dış ağa açarken Caddy veya Nginx üzerinden HTTPS kullanın.\${NC}"
        cat <<APPC > "\$TARGET_DIR/docker-compose.yml"
services:
  vaultwarden:
    image: vaultwarden/server:latest
    container_name: vaultwarden
    restart: unless-stopped
    expose:
      - "80"
    volumes:
      - ./data:/data
APPC
        ;;

      adguard|adguard-home)
        cat <<APPC > "\$TARGET_DIR/docker-compose.yml"
services:
  adguard-home:
    image: adguard/adguardhome:latest
    container_name: adguard-home
    restart: unless-stopped
    ports:
      - "53:53/tcp"
      - "53:53/udp"
      - "8053:80/tcp"
    volumes:
      - ./work:/opt/adguardhome/work
      - ./conf:/opt/adguardhome/conf
APPC
        ;;

      uptime-kuma)
        cat <<APPC > "\$TARGET_DIR/docker-compose.yml"
services:
  uptime-kuma:
    image: louislam/uptime-kuma:latest
    container_name: uptime-kuma
    restart: unless-stopped
    ports:
      - "3001:3001/tcp"
    volumes:
      - ./data:/app/data
APPC
        ;;

      *)
        echo -e "\${RED}Bilinmeyen uygulama: \$APP_NAME\${NC}"
        echo -e "\${DIM}Kullanılabilirler: nextcloud, minecraft, jellyfin, vaultwarden, adguard-home, uptime-kuma\${NC}"
        exit 1
        ;;
    esac

    cd "\$TARGET_DIR" && docker compose up -d
    echo -e "\${GREEN}✓ '\$APP_NAME' başarıyla kuruldu ve başlatıldı!\${NC}"
    exit 0
    ;;

  clean|temizle)
    echo -e "\${YELLOW}🧹 Kullanılmayan Docker imajları ve önbellek temizleniyor...\${NC}"
    docker image prune -f
    docker builder prune -f 2>/dev/null || true
    echo -e "\${GREEN}✓ Disk temizliği tamamlandı!\${NC}"
    exit 0
    ;;

  update|guncelle)
    echo -e "\${CYAN}🚀 'durum' CLI güncelleniyor ve kriptografik dijital imza doğrulanıyor...\${NC}"
    if verify_and_install_durum; then
      echo -e "\${GREEN}✓ durum CLI başarıyla doğrulandı ve güncellendi.\${NC}"
    else
      echo -e "\${RED}HATA: Güncelleme sırasında imza doğrulanamadı! Değişiklikler reddedildi.\${NC}" >&2
      exit 1
    fi

    if [ -d /root/xivizley-stack ]; then
      cd /root/xivizley-stack && docker compose pull && docker compose up -d
    fi
    echo -e "\${GREEN}✓ Sistem güncellemesi başarıyla tamamlandı!\${NC}"
    exit 0
    ;;

  help|yardim|-h|--help)
    echo ""
    echo -e "\${CYAN}\${BOLD}🚀 XIVIZLEY 'durum' CLI Komut Kılavuzu\${NC}"
    echo -e "\${DIM}------------------------------------------------------------\${NC}"
    echo -e "  \${GREEN}durum\${NC}                   Genel sistem ve konteyner özet raporu"
    echo -e "  \${GREEN}durum loglar\${NC}            Tüm servislerin canlı log akışı"
    echo -e "  \${GREEN}durum loglar <servis>\${NC}   Belirli bir servisin log akışı"
    echo -e "  \${GREEN}durum kur <uygulama>\${NC}    Tek tıkla servis kur (nextcloud, minecraft...)"
    echo -e "  \${GREEN}durum yeniden-baslat\${NC}    Tüm servisleri yeniden başlat"
    echo -e "  \${GREEN}durum durdur\${NC}            Tüm servisleri durdur"
    echo -e "  \${GREEN}durum baslat\${NC}            Tüm servisleri başlat"
    echo -e "  \${GREEN}durum temizle\${NC}           Gereksiz Docker önbelleğini ve imajları temizle"
    echo -e "  \${GREEN}durum guncelle\${NC}          Tüm stack'i ve CLI'ı dijital imza ile doğrulayarak güncelle"
    echo -e "\${DIM}------------------------------------------------------------\${NC}"
    echo -e "Web: \${CYAN}https://xivizley.com.tr\${NC}\\n"
    exit 0
    ;;
esac

# ── DEFAULT: STATUS DASHBOARD ──
IP=\$(ip route get 1.1.1.1 2>/dev/null | awk '{for(i=1;i<=NF;i++) if(\$i=="src") {print \$(i+1); exit}}')
[ -z "\$IP" ] && IP=\$(hostname -I 2>/dev/null | awk '{print \$1}')
[ -z "\$IP" ] && IP="localhost"

CPU_USAGE=\$(top -bn1 2>/dev/null | grep "Cpu(s)" | awk '{print \$2 + \$4}' | awk '{printf "%.0f", \$1}' || echo "0")
MEM_TOTAL=\$(free -m 2>/dev/null | awk '/Mem:/ {print \$2}' || echo "1024")
MEM_USED=\$(free -m 2>/dev/null | awk '/Mem:/ {print \$3}' || echo "0")

if [ "\${MEM_TOTAL:-0}" -gt 0 ] 2>/dev/null; then
  MEM_PCT=\$(( MEM_USED * 100 / MEM_TOTAL ))
else
  MEM_PCT=0
fi
MEM_TOTAL_GB=\$(awk "BEGIN {printf \\"%.1f\\", \$MEM_TOTAL/1024}")
MEM_USED_GB=\$(awk "BEGIN {printf \\"%.1f\\", \$MEM_USED/1024}")
DISK_TOTAL=\$(df -h / 2>/dev/null | awk 'NR==2 {print \$2}' || echo "0")
DISK_USED=\$(df -h / 2>/dev/null | awk 'NR==2 {print \$3}' || echo "0")
DISK_PCT=\$(df / 2>/dev/null | awk 'NR==2 {print \$5}' | tr -d '%' || echo "0")
UPTIME_STR=\$(uptime -p 2>/dev/null | sed 's/up //g' || uptime 2>/dev/null | awk '{print \$3}' || echo "Aktif")

draw_bar() {
  local pct=\$1
  local filled=\$(( pct / 10 ))
  local empty=\$(( 10 - filled ))
  local bar=""
  for ((i=0; i<filled; i++)); do bar="\${bar}■"; done
  for ((i=0; i<empty; i++)); do bar="\${bar}□"; done
  echo "\$bar"
}

echo ""
echo -e "\${CYAN}============================================================\${NC}"
echo -e "\${CYAN}\${BOLD}   🚀 XIVIZLEY — CANLI SUNUCU & KONTEYNER DURUM RAPORU\${NC}"
echo -e "\${CYAN}============================================================\${NC}"
echo -e " 🖥️  \${BOLD}CPU:\${NC}   [\${GREEN}\$(draw_bar \$CPU_USAGE)\${NC}] %\$CPU_USAGE"
echo -e " 🧠  \${BOLD}RAM:\${NC}   [\${CYAN}\$(draw_bar \$MEM_PCT)\${NC}] \$MEM_USED_GB GB / \$MEM_TOTAL_GB GB (%\$MEM_PCT)"
echo -e " 💾  \${BOLD}DİSK:\${NC}  [\${YELLOW}\$(draw_bar \$DISK_PCT)\${NC}] \$DISK_USED / \$DISK_TOTAL (%\$DISK_PCT)"
echo -e " ⏱️  \${BOLD}AÇIK:\${NC}  \$UPTIME_STR"
if [ -f /etc/xivizley/sponsor ]; then
  echo -e " 🏢  \${BOLD}ALTYAPI:\${NC} \${BLUE}(\$(cat /etc/xivizley/sponsor 2>/dev/null))\${NC}"
fi
echo -e "\${DIM}------------------------------------------------------------\${NC}"
printf "\${BOLD}%-16s %-14s %-10s %-8s %-20s\${NC}\\n" "SERVİS" "DURUM" "RAM" "CPU" "PORT / ERİŞİM"
echo -e "\${DIM}------------------------------------------------------------\${NC}"

if command -v docker &>/dev/null; then
  # Process substitution (< <(...)) ile subshell izolasyonu engellenir
  while IFS='|' read -r name status ports; do
    [ -z "\$name" ] && continue
    if [[ "\$name" == *"xivizley-agent"* ]]; then continue; fi

    if [[ "\$status" == Up* ]]; then
      STAT_TXT="\${GREEN}🟢 ÇALIŞIYOR\${NC}"
    else
      STAT_TXT="\${RED}🔴 DURDU\${NC}"
    fi

    STATS=\$(docker stats --no-stream --format "{{.MemUsage}}|{{.CPUPerc}}" "\$name" 2>/dev/null)
    MEM_USAGE=\$(echo "\$STATS" | cut -d'|' -f1 | awk '{print \$1}')
    CPU_PERC=\$(echo "\$STATS" | cut -d'|' -f2)

    CLEAN_PORT=\$(echo "\$ports" | grep -o '0.0.0.0:[0-9]*' | head -n1 | cut -d':' -f2)
    if [ -n "\$CLEAN_PORT" ]; then
      PORT_DISPLAY="http://\$IP:\$CLEAN_PORT"
    else
      PORT_DISPLAY="\${DIM}Lokal Ağ\${NC}"
    fi

    printf "%-16s %-23b %-10s %-8s %-20b\\n" "\$name" "\$STAT_TXT" "\${MEM_USAGE:-0MB}" "\${CPU_PERC:-%0}" "\$PORT_DISPLAY"
  done < <(docker ps -a --format '{{.Names}}|{{.Status}}|{{.Ports}}' 2>/dev/null)
else
  echo -e "\${RED}Docker çalışmıyor.\${NC}"
fi

echo -e "\${CYAN}============================================================\${NC}"
echo -e "\${DIM}💡 Alt Komutlar: 'durum loglar', 'durum yeniden-baslat', 'durum temizle', 'durum guncelle'\${NC}"
echo -e "\${DIM}🌐 Mimari Tasarla: https://xivizley.com.tr\${NC}\\n"
`;

  const sha256 = crypto.createHash('sha256').update(script).digest('hex');

  // Detached Cryptographic Signature Endpoint (?sig=1)
  if (searchParams.get('sig') === '1' || searchParams.get('signature') === '1') {
    const signingKey = getSigningPrivateKey();

    // Server-Side Fail-Closed: Return HTTP 500 if key is missing (never proceed without valid signing setup)
    if (!signingKey) {
      console.error('[CRITICAL] XIVIZLEY_SIGNING_PRIVATE_KEY environment variable is missing.');
      return new NextResponse('Internal Error: Cryptographic signing key is not configured on server.', {
        status: 500,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    // In-memory memoization: Compute signature once per script revision (O(1) cached responses)
    if (!cachedSignature || cachedScriptHash !== sha256) {
      try {
        const sign = crypto.createSign('SHA256');
        sign.update(script);
        sign.end();
        cachedSignature = sign.sign(signingKey);
        cachedScriptHash = sha256;
      } catch (err) {
        console.error('[CRITICAL] Failed to generate cryptographic signature:', err);
        return new NextResponse('Internal Error: Cryptographic signing failure.', {
          status: 500,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      }
    }

    return new NextResponse(new Uint8Array(cachedSignature), {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'X-Signature-SHA256': sha256,
      },
    });
  }

  // SHA-256 Checksum Endpoint (?sha256=1)
  if (searchParams.get('sha256') === '1' || searchParams.get('checksum') === '1') {
    return new NextResponse(`${sha256}  durum\n`, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  }

  // Main Script Response
  return new NextResponse(script, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
      'X-Checksum-SHA256': sha256,
    },
  });
}
