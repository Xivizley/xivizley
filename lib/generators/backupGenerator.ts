// ============================================================
// XIVIZLEY — Master Auto-Backup & Disaster Recovery Generator
// lib/generators/backupGenerator.ts
// ============================================================

import type { Node } from 'reactflow';
import type { ModuleNodeData } from '@/lib/types';
import { MODULE_CATALOG } from '@/lib/data/modules';

export interface BackupConfigOptions {
  backupDir: string;
  cronSchedule: string;
  scheduleLabel: string;
  retentionDays: number;
  enableEncryption: boolean;
  encryptionPassword?: string;
  discordWebhook?: string;
  telegramBotToken?: string;
  telegramChatId?: string;
}

export interface BackupGenerationResult {
  backupScript: string;
  restoreScript: string;
  cronCommand: string;
  detectedDatabases: Array<{ name: string; type: string; command: string }>;
  detectedVolumes: string[];
}

export function generateBackupSuite(
  nodes: Node<ModuleNodeData>[],
  options: Partial<BackupConfigOptions> = {}
): BackupGenerationResult {
  const backupDir = options.backupDir || '/var/backups/xivizley';
  const retentionDays = options.retentionDays || 7;
  const cronSchedule = options.cronSchedule || '0 3 * * *';
  const enableEncryption = options.enableEncryption || false;
  const encryptionPassword = options.encryptionPassword || 'CHANGE_THIS_BACKUP_KEY_2026';
  const discordWebhook = options.discordWebhook || '';

  const detectedDatabases: Array<{ name: string; type: string; command: string }> = [];
  const detectedVolumes: Set<string> = new Set();

  // Scan nodes for DBs and Volumes
  nodes.forEach((node) => {
    const modDef = MODULE_CATALOG.find((m) => m.id === node.data.moduleId);
    const label = node.data.label || modDef?.name || node.id;
    const modId = node.data.moduleId.toLowerCase();

    // Detect DBs
    const containerFilter = node.data.customContainerName || node.data.moduleId;
    if (modId.includes('mysql') || modId.includes('mariadb')) {
      detectedDatabases.push({
        name: label,
        type: 'MySQL / MariaDB',
        command: `CONTAINER_ID=$(docker ps -q -f name=${containerFilter} | head -n 1)
if [ -n "$CONTAINER_ID" ]; then
  docker exec "$CONTAINER_ID" mariadb-dump -u root -p"\${DB_ROOT_PASSWORD:-root}" --all-databases > "\$TEMP_DIR/${node.data.moduleId}_dump.sql" 2>/dev/null || \
  docker exec "$CONTAINER_ID" mysqldump -u root -p"\${DB_ROOT_PASSWORD:-root}" --all-databases > "\$TEMP_DIR/${node.data.moduleId}_dump.sql" 2>/dev/null || true
fi`,
      });
    } else if (modId.includes('postgres')) {
      detectedDatabases.push({
        name: label,
        type: 'PostgreSQL',
        command: `CONTAINER_ID=$(docker ps -q -f name=${containerFilter} | head -n 1)
if [ -n "$CONTAINER_ID" ]; then
  docker exec "$CONTAINER_ID" pg_dumpall -U "\${POSTGRES_USER:-postgres}" > "\$TEMP_DIR/${node.data.moduleId}_dump.sql" 2>/dev/null || true
fi`,
      });
    } else if (modId.includes('sqlite') || modId.includes('vaultwarden') || modId.includes('ghost') || modId.includes('uptime-kuma')) {
      detectedDatabases.push({
        name: label,
        type: 'SQLite / Embedded DB',
        command: `find . -maxdepth 3 -type f \\( -name "*.db" -o -name "*.sqlite" -o -name "*.sqlite3" \\) -exec cp {} "\$TEMP_DIR/" \\; 2>/dev/null || true`,
      });
    } else if (modId.includes('redis')) {
      detectedDatabases.push({
        name: label,
        type: 'Redis',
        command: `CONTAINER_ID=$(docker ps -q -f name=${containerFilter} | head -n 1)
if [ -n "$CONTAINER_ID" ]; then
  docker exec "$CONTAINER_ID" redis-cli BGSAVE 2>/dev/null || true
fi`,
      });
    } else if (modId.includes('mongo')) {
      detectedDatabases.push({
        name: label,
        type: 'MongoDB',
        command: `CONTAINER_ID=$(docker ps -q -f name=${containerFilter} | head -n 1)
if [ -n "$CONTAINER_ID" ]; then
  docker exec "$CONTAINER_ID" mongodump --archive="\$TEMP_DIR/${node.data.moduleId}.archive" 2>/dev/null || true
fi`,
      });
    }

    // Collect volumes
    (modDef?.volumes || []).forEach((vol) => {
      const hostPath = vol.hostPath;
      if (hostPath && !hostPath.startsWith('/var/run') && !hostPath.startsWith('/dev/')) {
        detectedVolumes.add(hostPath);
      }
    });
  });

  // Default volumes fallback
  if (detectedVolumes.size === 0) {
    detectedVolumes.add('./data');
    detectedVolumes.add('./config');
  }

  const volumeListArray = Array.from(detectedVolumes);
  const volumeTarArgs = volumeListArray.map((v) => `"${v}"`).join(' ');

  // 1. BACKUP SCRIPT (backup.sh)
  const backupScript = `#!/usr/bin/env bash
# ==============================================================================
# 🛡️ XIVIZLEY Master Auto-Backup Engine (Production Grade)
# 🌐 Web: https://xivizley.com.tr | Altyapı: OWEB TR Cloud 10G NVMe
# 📅 Oluşturulma: $(date '+%Y-%m-%d %H:%M:%S')
# ==============================================================================

set -eo pipefail

# Konfigürasyon
BACKUP_ROOT="${backupDir}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
TEMP_DIR="/tmp/xivizley_backup_\$TIMESTAMP"
ARCHIVE_NAME="xivizley_backup_\$TIMESTAMP.tar.gz"
FINAL_FILE="\$BACKUP_ROOT/\$ARCHIVE_NAME"
LOG_FILE="\$BACKUP_ROOT/backup.log"
RETENTION_DAYS=${retentionDays}
DISCORD_WEBHOOK="${discordWebhook}"

mkdir -p "\$BACKUP_ROOT"
mkdir -p "\$TEMP_DIR"

log() {
  echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] \$1" | tee -a "\$LOG_FILE"
}

notify_discord() {
  local status="\$1"
  local message="\$2"
  if [ -n "\$DISCORD_WEBHOOK" ]; then
    local color=3066993 # Green
    if [ "\$status" = "ERROR" ]; then
      color=15158332 # Red
    fi
    curl -s -H "Content-Type: application/json" -X POST -d "{
      \\"embeds\\": [{
        \\"title\\": \\"🛡️ XIVIZLEY Yedekleme Bildirimi\\",
        \\"description\\": \\"\$message\\",
        \\"color\\": \$color,
        \\"footer\\": { \\"text\\": \\"XIVIZLEY Backup Suite • OWEB TR Cloud 10G NVMe\\" },
        \\"timestamp\\": \\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\\"
      }]
    }" "\$DISCORD_WEBHOOK" > /dev/null 2>&1 || true
  fi
}

log "🚀 Otomatik yedekleme başlatılıyor..."

# 1. Veritabanlarını Güvenli Dışa Aktar (Database Dumps)
${
  detectedDatabases.length > 0
    ? detectedDatabases
        .map(
          (db) => `log "📦 ${db.name} (${db.type}) veritabanı dökümü alınıyor..."
${db.command} || log "⚠️ ${db.name} döküm uyarısı (atlandı)"`
        )
        .join('\n')
    : '# Veritabanı bulunamadı, dosya yedekleme aşamasına geçiliyor.'
}

# 2. Docker Compose ve .env Dosyalarını Dahil Et
if [ -f "docker-compose.yml" ]; then
  cp docker-compose.yml "\$TEMP_DIR/"
fi
if [ -f ".env" ]; then
  cp .env "\$TEMP_DIR/"
fi

# 3. Kalıcı Dizinleri ve Verileri Sıkıştır
log "🗜️ Kalıcı birimler ve veriler sıkıştırılıyor (${volumeListArray.length} kaynak)..."
PROJECT_DIR="$(pwd)"
VALID_VOLUMES=()
for vol in ${volumeTarArgs}; do
  clean_vol="\${vol#./}"
  if [ -e "\$PROJECT_DIR/\$clean_vol" ]; then
    VALID_VOLUMES+=("\$clean_vol")
  fi
done

if [ \${#VALID_VOLUMES[@]} -gt 0 ]; then
  tar -czf "\$FINAL_FILE" -C "\$TEMP_DIR" . -C "\$PROJECT_DIR" "\${VALID_VOLUMES[@]}" 2>/dev/null || tar -czf "\$FINAL_FILE" -C "\$TEMP_DIR" . 2>/dev/null
else
  tar -czf "\$FINAL_FILE" -C "\$TEMP_DIR" . 2>/dev/null
fi

${
  enableEncryption
    ? `# 4. AES-256 Şifreleme Uygula
log "🔐 Arşiv AES-256 CBC ile şifreleniyor..."
openssl enc -aes-256-cbc -salt -pbkdf2 -in "\$FINAL_FILE" -out "\$FINAL_FILE.enc" -pass pass:"${encryptionPassword}"
rm -f "\$FINAL_FILE"
FINAL_FILE="\$FINAL_FILE.enc"
`
    : ''
}

# 5. Geçici Dosyaları Temizle
rm -rf "\$TEMP_DIR"

# 6. Eski Yedekleri Temizle (Retention Rotation)
log "🧹 \$RETENTION_DAYS günden eski yedekler temizleniyor..."
find "\$BACKUP_ROOT" -type f -name "xivizley_backup_*" -mtime +\$RETENTION_DAYS -delete

BACKUP_SIZE=$(du -h "\$FINAL_FILE" | cut -f1)
log "✅ Yedekleme başarıyla tamamlandı! Boyut: \$BACKUP_SIZE -> \$FINAL_FILE"
notify_discord "SUCCESS" "Yedekleme başarıyla oluşturuldu!\\n📁 **Dosya:** \`\$ARCHIVE_NAME\`\\n💾 **Boyut:** \`\$BACKUP_SIZE\`\\n⏳ **Saklama Süresi:** ${retentionDays} gün"

exit 0
`;

  // 2. DISASTER RECOVERY SCRIPT (restore.sh)
  const restoreScript = `#!/usr/bin/env bash
# ==============================================================================
# 🚨 XIVIZLEY Master Felaket Kurtarma & Geri Yükleme Motoru (Disaster Recovery)
# 🌐 Web: https://xivizley.com.tr
# ==============================================================================

set -eo pipefail

if [ -z "\$1" ]; then
  echo "❌ Kullanım: bash restore.sh <yedek_dosyasi_yolu>"
  echo "Örnek: bash restore.sh ${backupDir}/xivizley_backup_20260830_030000.tar.gz${enableEncryption ? '.enc' : ''}"
  exit 1
fi

ARCHIVE_PATH="\$1"
RESTORE_TEMP="/tmp/xivizley_restore_$(date +%s)"

if [ ! -f "\$ARCHIVE_PATH" ]; then
  echo "❌ Hata: Yedek dosyası bulunamadı: \$ARCHIVE_PATH"
  exit 1
fi

echo "🚨 [1/4] Çalışan Docker servisleri durduruluyor..."
docker compose down || true

mkdir -p "\$RESTORE_TEMP"

${
  enableEncryption
    ? `echo "🔐 [2/4] AES-256 Şifreli yedek çözülüyor..."
openssl enc -d -aes-256-cbc -pbkdf2 -in "\$ARCHIVE_PATH" -out "\$RESTORE_TEMP/unencrypted.tar.gz" -pass pass:"${encryptionPassword}"
TARGET_ARCHIVE="\$RESTORE_TEMP/unencrypted.tar.gz"
`
    : `TARGET_ARCHIVE="\$ARCHIVE_PATH"`
}

echo "📦 [3/4] Arşiv açılıyor ve dizinler geri yükleniyor..."
tar -xzf "\$TARGET_ARCHIVE" -C .

echo "🚀 [4/4] Docker servisleri başlatılıyor..."
docker compose up -d

# 5. Veritabanı Dökümlerini İçe Aktar (DB Restoration)
if ls *_dump.sql 1> /dev/null 2>&1; then
  echo "📥 [5/5] Veritabanı dökümleri içeri aktarılıyor..."
  sleep 4
  for f in *postgres*_dump.sql; do
    if [ -f "$f" ]; then
      echo "  PostgreSQL dökümü aktarılıyor: $f"
      PG_CID=$(docker ps -q -f name=postgres | head -n 1)
      if [ -n "$PG_CID" ]; then
        docker exec -i "$PG_CID" psql -U "\${POSTGRES_USER:-postgres}" < "$f" 2>/dev/null || true
      fi
    fi
  done
  for f in *mysql*_dump.sql *mariadb*_dump.sql; do
    if [ -f "$f" ]; then
      echo "  MySQL/MariaDB dökümü aktarılıyor: $f"
      MY_CID=$(docker ps -q -f name=mysql -f name=mariadb | head -n 1)
      if [ -n "$MY_CID" ]; then
        docker exec -i "$MY_CID" mariadb -u root -p"\${DB_ROOT_PASSWORD:-root}" < "$f" 2>/dev/null || \
        docker exec -i "$MY_CID" mysql -u root -p"\${DB_ROOT_PASSWORD:-root}" < "$f" 2>/dev/null || true
      fi
    fi
  done
fi

rm -rf "\$RESTORE_TEMP"

echo "✅ TEBRİKLER! Tüm mimari ve veritabanları yedekten başarıyla geri yüklendi!"
`;

  // 3. CRONTAB COMMAND
  const cronCommand = `(crontab -l ; echo "${cronSchedule} /opt/xivizley/backup.sh >/dev/null 2>&1") | crontab -`;

  return {
    backupScript,
    restoreScript,
    cronCommand,
    detectedDatabases,
    detectedVolumes: volumeListArray,
  };
}
