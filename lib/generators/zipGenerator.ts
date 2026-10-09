// ============================================================
// XIVIZLEY — Full Project .ZIP Archive Generator
// lib/generators/zipGenerator.ts
// ============================================================

import JSZip from 'jszip';
import type { ModuleNodeData } from '@/lib/types';
import { MODULE_CATALOG } from '@/lib/data/modules';

interface ZipGeneratorOptions {
  composeYaml: string;
  envContent?: string;
  bashScript?: string;
  nodes?: Array<{ data: ModuleNodeData }>;
  projectName?: string;
}

export function generateStackReadme(nodes: Array<{ data: ModuleNodeData }> = []): string {
  const serviceRows = nodes
    .map(({ data }) => {
      const def = MODULE_CATALOG.find((m) => m.id === data.moduleId);
      const name = data.label || def?.name || data.moduleId;
      const category = def?.category || 'App';
      const ports = def?.ports
        ?.map((p) => {
          const hostPort = data.portOverrides[p.internal] ?? p.default;
          return `${hostPort}:${p.internal} (${p.label})`;
        })
        .join(', ') || 'Internal only';

      return `| **${name}** | \`${def?.dockerImage || 'custom'}\` | ${category} | ${ports} |`;
    })
    .join('\n');

  return `# 🚀 XIVIZLEY Server Architecture Stack
> Generated with [XIVIZLEY Server Architect](https://xivizley.com.tr)

Bu paket, homelab ve sunucunuz için görsel olarak tasarlanmış prodüksiyon hazır Docker altyapısını içerir.

---

## 📋 Servis Listesi & Port Haritası

| Servis | Docker İmajı | Kategori | Port Eşlemesi |
|---|---|---|---|
${serviceRows || '| *Servis Yok* | - | - | - |'}

---

## ⚡ Hızlı Başlangıç (1-Tık Kurulum)

### Yöntem 1: Hazır Kurulum Scripti ile
\`\`\`bash
chmod +x setup.sh
./setup.sh
\`\`\`

### Yöntem 2: Manuel Docker Compose ile
\`\`\`bash
# 1. Ortam değişkenlerini kontrol edin
nano .env

# 2. Stack'i arka planda başlatın
docker compose up -d

# 3. Konteyner durumlarını izleyin
docker compose ps
\`\`\`

---

## 🔒 Güvenlik & Notlar
- Tüm kritik şifrelerinizi \`.env\` dosyası üzerinden yönetin.
- Varsayılan şifreleri prodüksiyona almadan önce değiştirdiğinizden emin olun.
- Port çakışmalarını önlemek için host portlarını kontrol edin.

*Created with ❤️ by XIVIZLEY Architect Platform*
`;
}

export async function downloadProjectZip({
  composeYaml,
  envContent = '',
  bashScript = '',
  nodes = [],
  projectName = 'xivizley-stack',
}: ZipGeneratorOptions): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder(projectName) || zip;

  // 1. docker-compose.yml
  folder.file('docker-compose.yml', composeYaml.trim() + '\n');

  // 2. .env file
  const finalEnv =
    envContent.trim() ||
    `# ============================================================
# XIVIZLEY — Environment Configuration
# ============================================================
TZ=Europe/Istanbul
PUID=1000
PGID=1000
`;
  folder.file('.env', finalEnv + '\n');

  // 3. setup.sh launcher script
  const finalBash =
    bashScript.trim() ||
    `#!/usr/bin/env bash
set -e

echo "🚀 Starting ${projectName} with Docker Compose..."
if ! command -v docker &> /dev/null; then
    echo "⚠️ Docker is not installed. Installing Docker..."
    curl -fsSL https://get.docker.com | sh
fi

docker compose up -d
echo "✅ All services successfully deployed!"
docker compose ps
`;
  folder.file('setup.sh', finalBash + '\n', { unixPermissions: '755' });

  // 4. README.md Documentation
  const readme = generateStackReadme(nodes);
  folder.file('README.md', readme);

  // Generate blob and trigger browser download
  const content = await zip.generateAsync({
    type: 'blob',
    platform: 'UNIX',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
