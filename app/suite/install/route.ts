import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const script = `#!/usr/bin/env bash
# ==============================================================================
#  🚀 XIVIZLEY Suite v1.1 (Sovereign Cloud Edition) — Self-Hosted Kurulum Sihirbazı
#  🌐 Resmi Web Sitesi: https://xivizley.com.tr/suite
#  📦 Kaynak Kod:       https://github.com/Xivizley/xivizley-suite
#  🛡️ Güvenlik:         set -euo pipefail & main atomic execution
# ==============================================================================

set -euo pipefail

CYAN="\\x1b[1;36m"
GREEN="\\x1b[1;32m"
YELLOW="\\x1b[1;33m"
BOLD="\\x1b[1m"
NC="\\x1b[0m"

main() {
  echo -e "\${CYAN}============================================================\${NC}"
  echo -e "\${BOLD}  🚀 XIVIZLEY Suite v1.1 (Sovereign Cloud) — Kurulum Sihirbazı\${NC}"
  echo -e "\${CYAN}============================================================\${NC}"

  if ! command -v git &> /dev/null; then
    echo -e "\${YELLOW}⏳ Git kuruluyor...\${NC}"
    apt-get update -qq && apt-get install -y -qq git openssl curl >/dev/null 2>&1 || true
  fi

  if ! command -v docker &> /dev/null; then
    echo -e "\${YELLOW}⏳ Docker Engine & Docker Compose v2 kuruluyor...\${NC}"
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker >/dev/null 2>&1 || true
    systemctl start docker >/dev/null 2>&1 || true
  fi

  TARGET_DIR="/opt/xivizley-suite"
  if [ -d "\${TARGET_DIR}/.git" ]; then
    echo -e "\${YELLOW}ℹ️  Mevcut kurulum güncelleniyor (\${TARGET_DIR})...\${NC}"
    cd "\${TARGET_DIR}"
    git pull origin main
  else
    echo -e "\${YELLOW}📥 XIVIZLEY Suite v1.1 (Sovereign Cloud) indiriliyor...\${NC}"
    git clone https://github.com/Xivizley/xivizley-suite.git "\${TARGET_DIR}"
    cd "\${TARGET_DIR}"
  fi

  chmod +x ./install.sh
  ./install.sh < /dev/tty
}

main "$@"
`;

  return new NextResponse(script, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
