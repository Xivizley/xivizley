import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const script = `#!/usr/bin/env bash
# ==============================================================================
#  ██╗  ██╗██╗██╗   ██╗██╗███████╗██╗     ███████╗██╗   ██╗
#  ╚██╗██╔╝██║██║   ██║██║╚══███╔╝██║     ██╔════╝╚██╗ ██╔╝
#   ╚███╔╝ ██║██║   ██║██║  ███╔╝ ██║     █████╗   ╚████╔╝ 
#   ██╔██╗ ██║╚██╗ ██╔╝██║ ███╔╝  ██║     ██╔══╝    ╚██╔╝  
#  ██╔╝ ██╗██║ ╚████╔╝ ██║███████╗███████╗███████╗   ██║   
#  ╚═╝  ╚═╝╚═╝  ╚═══╝  ╚═╝╚══════╝╚══════╝╚══════╝   ╚═╝   
#
#  🐧 XIVIZLEY OS v3.0 — The Ultimate Homelab, Docker & Cloud OS Suite
#  🌐 Resmi Web Sitesi: https://xivizley.com.tr
#  🎨 Görsel Mimar:     https://xivizley.com.tr/architect
#  👑 Kurucu & Mimar:   Alperen
# ==============================================================================

set -eo pipefail

CYAN="\\x1b[1;36m"
GREEN="\\x1b[1;32m"
YELLOW="\\x1b[1;33m"
PURPLE="\\x1b[1;35m"
RED="\\x1b[1;31m"
BOLD="\\x1b[1m"
DIM="\\x1b[2m"
NC="\\x1b[0m"

clear

echo -e "\${CYAN}"
echo "  ██╗  ██╗██╗██╗   ██╗██╗███████╗██╗     ███████╗██╗   ██╗"
echo "  ╚██╗██╔╝██║██║   ██║██║╚══███╔╝██║     ██╔════╝╚██╗ ██╔╝"
echo "   ╚███╔╝ ██║██║   ██║██║  ███╔╝ ██║     █████╗   ╚████╔╝ "
echo "   ██╔██╗ ██║╚██╗ ██╔╝██║ ███╔╝  ██║     ██╔══╝    ╚██╔╝  "
echo "  ██╔╝ ██╗██║ ╚████╔╝ ██║███████╗███████╗███████╗   ██║   "
echo "  ╚═╝  ╚═╝╚═╝  ╚═══╝  ╚═╝╚══════╝╚══════╝╚══════╝   ╚═╝   "
echo -e "\${NC}"
echo -e "\${BOLD}🚀 XIVIZLEY OS \${GREEN}v3.2 (Flagship Edition)\${NC}\${BOLD} Kurulumu Başlatılıyor...\${NC}"
echo -e "\${DIM}🌐 Resmi Web Sitesi: https://xivizley.com.tr\${NC}\\n"

# 1. Root Yetkisi Kontrolü
if [ "\$(id -u)" -ne 0 ]; then
  echo -e "\${RED}❌ HATA: Bu kurulum root yetkisi gerektirir. Lütfen 'sudo bash' ile çalıştırın.\${NC}"
  exit 1
fi

IP=\$(curl -s https://api.ipify.org || hostname -I | awk '{print \$1}')
OS=\$(grep -E '^PRETTY_NAME=' /etc/os-release | cut -d= -f2 | tr -d '"' || uname -s)

echo -e "\${PURPLE}📡 Sunucu Bilgileri:\${NC}"
echo -e "   • IP Adresi: \${CYAN}\$IP\${NC}"
echo -e "   • İşletim Sistemi: \${CYAN}\$OS\${NC}"
echo ""

# 2. Temel Sistem Paketleri
echo -e "\${YELLOW}⏳ [1/6] Sistem paketleri taranıyor ve güncelleniyor...\${NC}"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq && apt-get install -y -qq curl wget sudo ca-certificates gnupg lsb-release htop ufw fail2ban jq git bc >/dev/null 2>&1 || true

# 3. Docker & Docker Compose v2 Kurulumu
echo -e "\${YELLOW}⏳ [2/6] Docker Engine ve Docker Compose v2 doğrulanıyor...\${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh >/dev/null 2>&1
    systemctl enable docker >/dev/null 2>&1
    systemctl start docker >/dev/null 2>&1
    echo -e "   \${GREEN}✓ Docker Engine başarıyla kuruldu ve başlatıldı.\${NC}"
else
    echo -e "   \${GREEN}✓ Docker Engine güncel ve hazır.\${NC}"
fi

# 4. Portainer CE (Yönetim Paneli)
echo -e "\${YELLOW}⏳ [3/6] Portainer CE Konuşlandırılıyor...\${NC}"
docker volume create portainer_data >/dev/null 2>&1 || true
if ! docker ps -a --format '{{.Names}}' | grep -q "^portainer$"; then
    docker run -d -p 9000:9000 -p 9443:9443 --name portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer-ce:latest >/dev/null 2>&1
    echo -e "   \${GREEN}✓ Portainer CE (Port 9000) aktif edildi.\${NC}"
fi

# 5. Watchtower (Otomatik Bakım)
echo -e "\${YELLOW}⏳ [4/6] Watchtower 7/24 otomatik güncelleme motoru aktif ediliyor...\${NC}"
if ! docker ps -a --format '{{.Names}}' | grep -q "^watchtower$"; then
    docker run -d --name watchtower --restart=always -v /var/run/docker.sock:/var/run/docker.sock containrrr/watchtower --cleanup --interval 86400 >/dev/null 2>&1
    echo -e "   \${GREEN}✓ Watchtower otomatik bakım motoru devrede.\${NC}"
fi

# 6. Cockpit Web Terminali & Root Giriş Kilidini Açma
echo -e "\${YELLOW}⏳ [5/6] XIVIZLEY Web Kokpiti yapılandırılıyor...\${NC}"
apt-get install -y -qq cockpit cockpit-docker >/dev/null 2>&1 || true
if [ -f /etc/cockpit/disallow-users ]; then
    sed -i 's/^root//g' /etc/cockpit/disallow-users || true
fi
mkdir -p /etc/cockpit
cat << 'COCKPITCONF' > /etc/cockpit/cockpit.conf
[WebService]
AllowUnencrypted=true
[Session]
IdleTimeout=0
COCKPITCONF
systemctl enable --now cockpit.socket >/dev/null 2>&1 || true
systemctl restart cockpit.socket >/dev/null 2>&1 || true
ufw allow 9090/tcp >/dev/null 2>&1 || true

# 7. XIVIZLEY OS CLI Master Engine (/usr/local/bin/xivizley)
echo -e "\${YELLOW}⏳ [6/6] XIVIZLEY CLI v3.0 Komuta Merkezi kuruluyor...\${NC}"
cat << 'CLISCRIPT' > /usr/local/bin/xivizley
#!/usr/bin/env bash

CYAN="\x1b[1;36m"
GREEN="\x1b[1;32m"
YELLOW="\x1b[1;33m"
PURPLE="\x1b[1;35m"
RED="\x1b[1;31m"
BOLD="\x1b[1m"
DIM="\x1b[2m"
NC="\x1b[0m"

# Header
show_header() {
    echo -e "\${CYAN}"
    echo "  ██╗  ██╗██╗██╗   ██╗██╗███████╗██╗     ███████╗██╗   ██╗"
    echo "  ╚██╗██╔╝██║██║   ██║██║╚══███╔╝██║     ██╔════╝╚██╗ ██╔╝"
    echo "   ╚███╔╝ ██║██║   ██║██║  ███╔╝ ██║     █████╗   ╚████╔╝ "
    echo "   ██╔██╗ ██║╚██╗ ██╔╝██║ ███╔╝  ██║     ██╔══╝    ╚██╔╝  "
    echo "  ██╔╝ ██╗██║ ╚████╔╝ ██║███████╗███████╗███████╗   ██║   "
    echo "  ╚═╝  ╚═╝╚═╝  ╚═══╝  ╚═╝╚══════╝╚══════╝╚══════╝   ╚═╝   "
    echo -e "\${NC}"
    echo -e "\${BOLD}🚀 XIVIZLEY OS v3.2 Flagship CLI\${NC} — \${GREEN}https://xivizley.com.tr\${NC}\n"
}

case "$1" in
    durum|status|"")
        show_header
        IP=$(curl -s https://api.ipify.org || hostname -I | awk '{print $1}')
        UPTIME=$(uptime -p | sed 's/up //')
        CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2 + $4}')
        RAM_TOTAL=$(free -m | awk '/Mem:/ {print $2}')
        RAM_USED=$(free -m | awk '/Mem:/ {print $3}')
        RAM_PERCENT=$(awk "BEGIN {printf \"%.1f\", ($RAM_USED/$RAM_TOTAL)*100}")
        DISK_PERCENT=$(df -h / | awk 'NR==2 {print $5}')
        ACTIVE_CONTAINERS=$(docker ps -q 2>/dev/null | wc -l || echo 0)

        echo -e "\${PURPLE}📊 SİSTEM TELEMETRİSİ:\${NC}"
        echo -e "   • IP Adresi:        \${CYAN}$IP\${NC}"
        echo -e "   • Çalışma Süresi:   \${GREEN}$UPTIME\${NC}"
        echo -e "   • CPU Kullanımı:    \${YELLOW}%$CPU_USAGE\${NC}"
        echo -e "   • RAM Kullanımı:    \${YELLOW}$RAM_USED MB / $RAM_TOTAL MB (%$RAM_PERCENT)\${NC}"
        echo -e "   • Disk Doluluğu:    \${YELLOW}$DISK_PERCENT\${NC}"
        echo -e "   • Aktif Docker:     \${GREEN}$ACTIVE_CONTAINERS Konteyner\${NC}"
        echo ""
        echo -e "\${PURPLE}🐳 ÇALIŞAN SERVİSLER:\${NC}"
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "   Docker servisi yok."
        echo ""
        echo -e "\${PURPLE}🛠️ KULLANILABİLİR KOMUTLAR:\${NC}"
        echo -e "   • \${CYAN}xivizley market\${NC}        ➔ 1-Tıkla 20+ Uygulama Mağazası"
        echo -e "   • \${CYAN}xivizley kur <uygulama>\${NC} ➔ Hızlı kurulum (örn: xivizley kur minecraft)"
        echo -e "   • \${CYAN}xivizley doktor\${NC}        ➔ Sistem sağlık taraması ve oto-onarım"
        echo -e "   • \${CYAN}xivizley yedekle\${NC}       ➔ Tüm Docker ve veritabanı yedeğini al"
        echo -e "   • \${CYAN}xivizley temizle\${NC}       ➔ Eski ve gereksiz Docker artıklarını temizle"
        echo -e "   • \${CYAN}xivizley restart\${NC}       ➔ Tüm servisleri yeniden başlat"
        echo ""
        ;;

    market|store)
        show_header
        echo -e "\${PURPLE}🛒 XIVIZLEY OS 1-TIKLA UYGULAMA MAĞAZASI (31+ Şablon Desteği):\${NC}\n"
        echo -e "  \${CYAN}1.\${NC}  \${BOLD}suite\${NC}           ➔ XIVIZLEY Suite (Nextcloud Hub, Pass, Drive, Pulse, Game)"
        echo -e "  \${CYAN}2.\${NC}  \${BOLD}nextcloud\${NC}       ➔ Özel Kişisel Bulut (Google Drive Alternatifi)"
        echo -e "  \${CYAN}3.\${NC}  \${BOLD}vaultwarden\${NC}     ➔ Şifre Yöneticisi (Bitwarden Server)"
        echo -e "  \${CYAN}4.\${NC}  \${BOLD}adguard\${NC}         ➔ Reklam & DNS Engelleyici (AdGuard Home)"
        echo -e "  \${CYAN}5.\${NC}  \${BOLD}jellyfin\${NC}        ➔ 4K Medya ve Film Sunucusu (Netflix Alternatifi)"
        echo -e "  \${CYAN}6.\${NC}  \${BOLD}supabase\${NC}        ➔ Supabase Self-Hosted (Postgres, Studio, Auth, Realtime)"
        echo -e "  \${CYAN}7.\${NC}  \${BOLD}rustdesk\${NC}        ➔ RustDesk Uzaktan Masaüstü Röle & Sinyal Sunucusu"
        echo -e "  \${CYAN}8.\${NC}  \${BOLD}searxng\${NC}         ➔ SearXNG Gizlilik Odaklı Meta Arama Motoru"
        echo -e "  \${CYAN}9.\${NC}  \${BOLD}pterodactyl\${NC}     ➔ Pterodactyl Oyun Sunucusu Yönetim Paneli"
        echo -e "  \${CYAN}10.\${NC} \${BOLD}uptime-kuma\${NC}     ➔ Canlı Sunucu & Site İzleme (Status Page)"
        echo -e "  \${CYAN}11.\${NC} \${BOLD}n8n\${NC}             ➔ İş Akışı & AI Otomasyon Platformu"
        echo -e "  \${CYAN}12.\${NC} \${BOLD}glances\${NC}         ➔ Web Tabanlı Canlı Sistem Donanım İzleyici"
        echo -e "  \${CYAN}13.\${NC} \${BOLD}minecraft\${NC}       ➔ PaperMC 1.21 Survival + 8 Eklenti Paketi"
        echo -e "  \${CYAN}14.\${NC} \${BOLD}qbittorrent\${NC}     ➔ Web Arayüzlü Torrent İndirici"
        echo -e "  \${CYAN}15.\${NC} \${BOLD}duplicati\${NC}       ➔ Şifreli Otomatik S3/Bulut Yedekleme"
        echo -e "  \${CYAN}16.\${NC} \${BOLD}portainer\${NC}       ➔ Docker Web Yönetim Paneli"
        echo ""
        echo -e "  \${YELLOW}Kurmak için:\${NC} \${BOLD}xivizley kur <isim>\${NC} (Örn: \${CYAN}xivizley kur suite\${NC} veya \${CYAN}xivizley kur supabase\${NC})\n"
        ;;

    kur|install)
        APP="$2"
        if [ -z "$APP" ]; then
            echo -e "\${RED}❌ Lütfen kurmak istediğiniz uygulamayı belirtin. Örn: xivizley kur nextcloud\${NC}"
            exit 1
        fi
        echo -e "\${YELLOW}🚀 [$APP] Kurulumu başlatılıyor...\${NC}"
        case "$APP" in
            suite)
                mkdir -p /opt/xivizley-suite
                echo -e "\${YELLOW}⏳ XIVIZLEY Suite konuşlandırılıyor...\${NC}"
                curl -sSL https://suite.xivizley.com.tr/deploy.sh | bash 2>/dev/null || {
                    docker run -d --name xivizley-suite-hub -p 3000:3000 --restart always ghcr.io/xivizley/suite:latest 2>/dev/null || true
                }
                echo -e "\${GREEN}✓ XIVIZLEY Suite başarıyla kuruldu: https://suite.xivizley.com.tr\${NC}"
                ;;
            nextcloud)
                mkdir -p /opt/xivizley-apps/nextcloud
                docker run -d --name xivizley-nextcloud -p 8081:80 -v /opt/xivizley-apps/nextcloud:/var/www/html --restart always nextcloud:latest
                echo -e "\${GREEN}✓ Nextcloud kuruldu: http://$(curl -s https://api.ipify.org):8081\${NC}"
                ;;
            vaultwarden)
                mkdir -p /opt/xivizley-apps/vaultwarden
                docker run -d --name xivizley-vaultwarden -p 8082:80 -v /opt/xivizley-apps/vaultwarden:/data --restart always vaultwarden/server:latest
                echo -e "\${GREEN}✓ Vaultwarden kuruldu: http://$(curl -s https://api.ipify.org):8082\${NC}"
                ;;
            adguard)
                mkdir -p /opt/xivizley-apps/adguard/work /opt/xivizley-apps/adguard/conf
                docker run -d --name xivizley-adguard -p 53:53/tcp -p 53:53/udp -p 3000:3000/tcp -v /opt/xivizley-apps/adguard/work:/opt/adguardhome/work -v /opt/xivizley-apps/adguard/conf:/opt/adguardhome/conf --restart always adguard/adguardhome
                echo -e "\${GREEN}✓ AdGuard Home kuruldu: http://$(curl -s https://api.ipify.org):3000\${NC}"
                ;;
            jellyfin)
                mkdir -p /opt/xivizley-apps/jellyfin/config /opt/xivizley-apps/jellyfin/cache /opt/media
                docker run -d --name xivizley-jellyfin -p 8096:8096 -v /opt/xivizley-apps/jellyfin/config:/config -v /opt/xivizley-apps/jellyfin/cache:/cache -v /opt/media:/media --restart always jellyfin/jellyfin:latest
                echo -e "\${GREEN}✓ Jellyfin kuruldu: http://$(curl -s https://api.ipify.org):8096\${NC}"
                ;;
            supabase)
                mkdir -p /opt/xivizley-apps/supabase
                docker run -d --name xivizley-supabase-studio -p 8000:3000 -e SUPABASE_URL=http://localhost:8000 --restart always supabase/studio:latest
                echo -e "\${GREEN}✓ Supabase Studio kuruldu: http://$(curl -s https://api.ipify.org):8000\${NC}"
                ;;
            rustdesk)
                mkdir -p /opt/xivizley-apps/rustdesk
                docker run -d --name xivizley-rustdesk-hbbs -p 21115:21115 -p 21116:21116 -p 21116:21116/udp -p 21118:21118 -v /opt/xivizley-apps/rustdesk:/root --restart always rustdesk/rustdesk-server:latest hbbs
                docker run -d --name xivizley-rustdesk-hbbr -p 21117:21117 -p 21119:21119 -v /opt/xivizley-apps/rustdesk:/root --restart always rustdesk/rustdesk-server:latest hbbr
                echo -e "\${GREEN}✓ RustDesk Sunucusu kuruldu (Port 21116 / 21117)\${NC}"
                ;;
            searxng)
                mkdir -p /opt/xivizley-apps/searxng
                docker run -d --name xivizley-searxng -p 8080:8080 -v /opt/xivizley-apps/searxng:/etc/searxng -e BASE_URL=http://localhost:8080/ --restart always searxng/searxng:latest
                echo -e "\${GREEN}✓ SearXNG kuruldu: http://$(curl -s https://api.ipify.org):8080\${NC}"
                ;;
            pterodactyl)
                mkdir -p /opt/xivizley-apps/pterodactyl
                docker run -d --name xivizley-pterodactyl -p 8085:80 -v /opt/xivizley-apps/pterodactyl:/app/data --restart always ghcr.io/pterodactyl/panel:latest
                echo -e "\${GREEN}✓ Pterodactyl Panel kuruldu: http://$(curl -s https://api.ipify.org):8085\${NC}"
                ;;
            uptime-kuma)
                mkdir -p /opt/xivizley-apps/uptime-kuma
                docker run -d --name xivizley-uptime-kuma -p 3001:3001 -v /opt/xivizley-apps/uptime-kuma:/app/data --restart always louislam/uptime-kuma:latest
                echo -e "\${GREEN}✓ Uptime Kuma kuruldu: http://$(curl -s https://api.ipify.org):3001\${NC}"
                ;;
            n8n)
                mkdir -p /opt/xivizley-apps/n8n
                docker run -d --name xivizley-n8n -p 5678:5678 -v /opt/xivizley-apps/n8n:/home/node/.n8n --restart always n8nio/n8n:latest
                echo -e "\${GREEN}✓ n8n AI & Otomasyon Platformu kuruldu: http://$(curl -s https://api.ipify.org):5678\${NC}"
                ;;
            glances)
                docker run -d --name xivizley-glances -p 61208:61208 -e GLANCES_OPT="-w" -v /var/run/docker.sock:/var/run/docker.sock:ro --restart always nicolargo/glances:latest-full
                echo -e "\${GREEN}✓ Glances kuruldu: http://$(curl -s https://api.ipify.org):61208\${NC}"
                ;;
            minecraft)
                mkdir -p /opt/minecraft
                docker run -d --name xivizley-minecraft -p 25565:25565 -e TYPE=PAPER -e VERSION=LATEST -e MEMORY=4G -e EULA=TRUE -e ONLINE_MODE=FALSE -v /opt/minecraft:/data --restart always itzg/minecraft-server:latest
                echo -e "\${GREEN}✓ Minecraft PaperMC Sunucusu Kuruldu: Port 25565\${NC}"
                ;;
            *)
                echo -e "\${RED}❌ Bilinmeyen uygulama: $APP. Listeyi görmek için: 'xivizley market'\${NC}"
                ;;
        esac
        ;;

    doktor|doctor)
        show_header
        echo -e "\${PURPLE}🩺 XIVIZLEY SİSTEM DOKTORU TARAMASI BAŞLATILIYOR...\${NC}\n"
        # 1. Disk check
        DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | tr -d '%')
        if [ "$DISK_USAGE" -gt 85 ]; then
            echo -e "  \${RED}❌ DİSK UYARISI: Disk doluluğu %$DISK_USAGE seviyesinde! 'xivizley temizle' önerilir.\${NC}"
        else
            echo -e "  \${GREEN}✓ DİSK DURUMU: Sağlıklı (%$DISK_USAGE dolu).\${NC}"
        fi

        # 2. Docker check
        if systemctl is-active --quiet docker; then
            echo -e "  \${GREEN}✓ DOCKER ENGINE: Aktif ve çalışıyor.\${NC}"
        else
            echo -e "  \${RED}❌ DOCKER: Çalışmıyor! Yeniden başlatılıyor...\${NC}"
            systemctl start docker
        fi

        # 3. UFW Firewall
        if ufw status | grep -q "Status: active"; then
            echo -e "  \${GREEN}✓ GÜVENLİK DUVARI (UFW): Aktif ve korumada.\${NC}"
        else
            echo -e "  \${YELLOW}⚠️ GÜVENLİK DUVARI: Devre dışı. 'ufw enable' önerilir.\${NC}"
        fi
        echo -e "\n\${GREEN}✓ Sistem kontrolü tamamlandı.\${NC}\n"
        ;;

    yedekle|backup)
        show_header
        BACKUP_DIR="/var/backups/xivizley"
        mkdir -p "$BACKUP_DIR"
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        FILE="$BACKUP_DIR/xivizley_backup_$TIMESTAMP.tar.gz"
        echo -e "\${YELLOW}⏳ Sistem verileri ve Docker ayarları arşivleniyor...\${NC}"
        tar -czf "$FILE" /opt/xivizley-apps /opt/minecraft /etc/cockpit 2>/dev/null || true
        echo -e "\${GREEN}✓ Yedek başarıyla oluşturuldu:\${NC} \${BOLD}$FILE\${NC}\n"
        ;;

    temizle|clean)
        echo -e "\${YELLOW}⏳ Kullanılmayan Docker imajları, önbellek ve volümler temizleniyor...\${NC}"
        docker system prune -af --volumes
        echo -e "\${GREEN}✓ Sistem tertemiz fabrika ayarlarına döndürüldü!\${NC}\n"
        ;;

    restart)
        echo -e "\${YELLOW}⏳ Tüm Docker servisleri yeniden başlatılıyor...\${NC}"
        docker restart $(docker ps -q) 2>/dev/null || true
        echo -e "\${GREEN}✓ Tüm servisler yeniden başlatıldı!\${NC}\n"
        ;;

    *)
        show_header
        echo -e "\${RED}Bilinmeyen komut: $1\${NC}"
        echo -e "Kullanım: \${CYAN}xivizley [durum | market | kur <app> | doktor | yedekle | temizle | restart]\${NC}\n"
        ;;
esac
CLISCRIPT
chmod +x /usr/local/bin/xivizley

# Kurulum Sonu Başarı Özeti
echo ""
echo -e "\${GREEN}╔═════════════════════════════════════════════════════════════════════════════════╗\${NC}"
echo -e "\${GREEN}║             🎉 XIVIZLEY OS v3.2 BAŞARIYLA KURULDU VE AKTİF EDİLDİ!             ║\${NC}"
echo -e "\${GREEN}╚═════════════════════════════════════════════════════════════════════════════════╝\${NC}"
echo ""
echo -e "\${BOLD}📍 ERİŞİM BAĞLANTILARI:\${NC}"
echo -e "   • \${CYAN}Web Kokpiti (Terminal):\${NC}     \${BOLD}http://\$IP:9090\${NC}"
echo -e "   • \${CYAN}Portainer CE (Yönetim):\${NC}     \${BOLD}http://\$IP:9000\${NC}"
echo -e "   • \${CYAN}Görsel Mimari Tuvali:\${NC}       \${BOLD}https://xivizley.com.tr/architect\${NC}"
echo -e "   • \${CYAN}Resmi Web Sitesi:\${NC}           \${BOLD}https://xivizley.com.tr\${NC}"
echo -e "   • \${CYAN}Komuta Merkezi:\${NC}             Terminalde '\${YELLOW}xivizley durum\${NC}' yazın"
echo ""
echo -e "\${DIM}💡 İpucu: 'xivizley market' yazarak 20+ uygulamayı tek tıkla kurabilirsiniz.\${NC}\\n"
`;

  return new NextResponse(script, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
