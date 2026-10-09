// ============================================================
// XIVIZLEY — Real VDS Smart Deployment Generator (Production Grade)
// lib/generators/deploymentGenerator.ts
//
// Pure client-side generator for production Linux VDS deployments.
// Produces safe, verified Bash deployment scripts with pre-flight
// checks, OS detection, port collision inspection, and health validation.
// ============================================================

import { MODULE_CATALOG, MINECRAFT_PLUGINS, FIVEM_PLUGINS } from '@/lib/data/modules';
import { generateCode, resolveServiceNames } from './composeGenerator';
import type { ArchitectNode, ArchitectEdge, DeploymentPackage } from '@/lib/types';

export interface HostPortRequirement {
  port: number;
  protocol: 'tcp' | 'udp';
  serviceName: string;
}

/**
 * Extracts all host ports required by the active canvas nodes.
 */
export function extractRequiredHostPorts(nodes: ArchitectNode[]): HostPortRequirement[] {
  const serviceMap = resolveServiceNames(nodes);
  const requirements: HostPortRequirement[] = [];
  const seen = new Set<string>();

  for (const node of nodes) {
    const info = serviceMap.get(node.id);
    if (!info || info.isHostInstall) continue;

    const { moduleId, portOverrides, isCustom, customPorts } = node.data;
    const serviceName = info.serviceName;

    if (isCustom && customPorts) {
      for (const p of customPorts) {
        const key = `${p.host}/${p.protocol || 'tcp'}`;
        if (!seen.has(key)) {
          seen.add(key);
          requirements.push({
            port: p.host,
            protocol: p.protocol || 'tcp',
            serviceName,
          });
        }
      }
      continue;
    }

    const moduleDef = MODULE_CATALOG.find((m) => m.id === moduleId);
    if (moduleDef) {
      for (const portDef of moduleDef.ports) {
        const hostPort = portOverrides[portDef.internal] ?? portDef.default;
        const protocol: 'tcp' | 'udp' = portDef.protocol === 'udp' ? 'udp' : 'tcp';
        const key = `${hostPort}/${protocol}`;
        if (!seen.has(key)) {
          seen.add(key);
          requirements.push({
            port: hostPort,
            protocol,
            serviceName,
          });
        }
      }
    }
  }

  return requirements.sort((a, b) => a.port - b.port);
}

/**
 * Sanitizes a title or label for safe bash script display.
 * Strips all shell metacharacters, control codes, newlines, quotes, backticks, and dollar signs.
 */
export function sanitizeBashDisplayString(str?: string | null, maxLength = 80): string {
  if (!str || typeof str !== 'string') return 'XIVIZLEY Homelab Stack';
  return str
    .replace(/[\r\n\t]/g, ' ')
    .replace(/[`$\\";&|<>(){}[\]!]/g, '')
    .trim()
    .slice(0, maxLength) || 'XIVIZLEY Homelab Stack';
}

/**
 * Sanitizes target directory paths.
 * Guarantees no shell injection or traversal outside legitimate directories.
 */
export function sanitizeTargetDir(dir?: string | null): string {
  if (!dir || typeof dir !== 'string') return '${HOME}/xivizley-stack';
  const trimmed = dir.trim();
  if (trimmed.startsWith('${HOME}')) {
    const sub = trimmed.slice(7).replace(/[^a-zA-Z0-9_.-/]/g, '').replace(/\/+/g, '/');
    return `\${HOME}${sub.startsWith('/') ? sub : `/${sub || 'xivizley-stack'}`}`;
  }
  const sanitized = trimmed.replace(/[^a-zA-Z0-9_.-/]/g, '').replace(/\/+/g, '/');
  return sanitized || '${HOME}/xivizley-stack';
}

/**
 * Generates the complete, production-grade VDS deploy.sh bash script.
 */
export function generateVdsDeployScript(
  nodes: ArchitectNode[],
  edges: ArchitectEdge[] = [],
  options: {
    title?: string | undefined;
    targetDir?: string | undefined;
    defaultInstallDocker?: boolean | undefined;
  } = {}
): string {
  const { dockerCompose } = generateCode(nodes, edges);
  const requiredPorts = extractRequiredHostPorts(nodes);
  const serviceMap = resolveServiceNames(nodes);
  const safeTitle = sanitizeBashDisplayString(options.title || 'XIVIZLEY Homelab Stack', 80);
  const safeTargetDir = sanitizeTargetDir(options.targetDir);

  // Dynamic collision-resistant here-doc delimiter for docker-compose.yml
  let composeDelimiter = 'EOF_XIVIZLEY_COMPOSE';
  let attempts = 0;
  while (dockerCompose.split('\n').some((line) => line.trim() === composeDelimiter)) {
    attempts++;
    if (attempts > 20) {
      throw new Error('Güvenlik Hatası: Here-doc ayırıcı çakışması aşılamadı.');
    }
    composeDelimiter = `EOF_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  }
  if (dockerCompose.split('\n').some((line) => line.trim() === composeDelimiter)) {
    throw new Error('Güvenlik Hatası: Here-doc ayırıcı çakışması tespit edildi.');
  }

  const nonHostServices: Array<{ label: string; serviceName: string }> = [];
  for (const node of nodes) {
    const info = serviceMap.get(node.id);
    if (info && !info.isHostInstall) {
      nonHostServices.push({
        label: sanitizeBashDisplayString(node.data.label || info.serviceName, 60),
        serviceName: info.serviceName.replace(/[^a-z0-9_-]/g, '').slice(0, 64) || 'service',
      });
    }
  }

  const scriptLines: string[] = [
    `#!/usr/bin/env bash`,
    `# ============================================================`,
    `# XIVIZLEY — Real VDS Smart Deployment Script`,
    `# Generated for Stack: ${safeTitle}`,
    `# Documentation: https://xivizley.com.tr/privacy`,
    `# ============================================================`,
    ``,
    `set -euo pipefail`,
    ``,
    `# ── Color & Formatting Palette ──`,
    `RED='\\033[0;31m'`,
    `GREEN='\\033[0;32m'`,
    `YELLOW='\\033[1;33m'`,
    `CYAN='\\033[0;36m'`,
    `BLUE='\\033[0;34m'`,
    `BOLD='\\033[1m'`,
    `DIM='\\033[2m'`,
    `NC='\\033[0m'`,
    ``,
    `# ── CLI Arguments Flags ──`,
    `AUTO_CONFIRM=false`,
    `CHECK_ONLY=false`,
    `ALLOW_INSTALL=true`,
    ``,
    `print_usage() {`,
    `  echo -e "\${BOLD}XIVIZLEY VDS Deployment Script\${NC}"`,
    `  echo "Usage: $0 [OPTIONS]"`,
    `  echo ""`,
    `  echo "Options:"`,
    `  echo "  --yes, -y        Auto-confirm prompts (non-interactive mode)"`,
    `  echo "  --check, -c      Run pre-flight checks only, do not deploy"`,
    `  echo "  --no-install     Do not attempt to install Docker if missing"`,
    `  echo "  --help, -h       Show this help message"`,
    `  echo ""`,
    `  echo "Examples:"`,
    `  echo "  $0 --check       # Validate system and ports without changes"`,
    `  echo "  $0 --yes         # Perform complete automated deployment"`,
    `  exit 0`,
    `}`,
    ``,
    `# ── Error Trap Handler ──`,
    `catch_error() {`,
    `  local exit_code=$1`,
    `  local line_no=$2`,
    `  echo ""`,
    `  echo -e "\${RED}✗ Deployment failed at line \${line_no} with exit code \${exit_code}\${NC}"`,
    `  echo -e "\${YELLOW}💡 İPUCU: Eğer yukarıda 'port is already allocated' (Port zaten tahsis edilmiş) hatası görüyorsanız:\${NC}"`,
    `  echo -e "   👉 https://xivizley.com.tr/architect tuvaline dönüp ilgili servisin portunu (örn: 8080 ➔ 8081) değiştirip yeni komutu çalıştırın."`,
    `  echo -e "\${DIM}Detaylı logları incelemek için: docker compose logs --tail=50\${NC}"`,
    `  exit "\${exit_code}"`,
    `}`,
    ``,
    `main() {`,
    `  # Parse CLI arguments`,
    `  while [[ $# -gt 0 ]]; do`,
    `    case "$1" in`,
    `      --yes|-y)`,
    `        AUTO_CONFIRM=true`,
    `        shift`,
    `        ;;`,
    `      --check|-c)`,
    `        CHECK_ONLY=true`,
    `        shift`,
    `        ;;`,
    `      --no-install)`,
    `        ALLOW_INSTALL=false`,
    `        shift`,
    `        ;;`,
    `      --help|-h)`,
    `        print_usage`,
    `        ;;`,
    `      *)`,
    `        echo -e "\${RED}Unknown option: $1\${NC}"`,
    `        echo "Use --help for available options."`,
    `        exit 1`,
    `        ;;`,
    `    esac`,
    `  done`,
    ``,
    `  trap 'catch_error $? $LINENO' ERR`,
    ``,
    `  # ── Header ──`,
    `echo -e "\${CYAN}============================================================\${NC}"`,
    `echo -e "\${CYAN}   🚀 XIVIZLEY Server Architect — VDS Deployment Engine\${NC}"`,
    `echo -e "\${CYAN}============================================================\${NC}"`,
    `printf 'Stack: %b%s%b\\n' "\${BOLD}" "${safeTitle}" "\${NC}"`,
    `echo ""`,
    ``,
    `# ── Target Directory ──`,
    `DEPLOY_DIR="${safeTargetDir}"`,
    `mkdir -p "\${DEPLOY_DIR}"`,
    `cd "\${DEPLOY_DIR}"`,
    ``,
    `# ── Sponsor & Kernel Optimizer ──`,
    `if [[ "$*" == *"--oweb"* || "$*" == *"--sponsor"* || "$*" == *"--cenuta"* ]]; then`,
    `  echo -e "\${CYAN}⚡ OWEB (VERİUP Bulut) Altyapısı Algılandı — Sistem & Ağ Optimizasyonları Uygulanıyor...\${NC}"`,
    `  \${SUDO_CMD} sysctl -w net.core.somaxconn=1024 &>/dev/null || true`,
    `  \${SUDO_CMD} sysctl -w vm.swappiness=10 &>/dev/null || true`,
    `  \${SUDO_CMD} sysctl -w net.ipv4.ip_forward=1 &>/dev/null || true`,
    `  \${SUDO_CMD} mkdir -p /etc/xivizley`,
    `  echo "OWEB / VERİUP Bulut (Ultra Performans ⚡)" | \${SUDO_CMD} tee /etc/xivizley/sponsor >/dev/null || true`,
    `  echo -e "  \${GREEN}✓\${NC} OWEB Yüksek Hızlı NVMe SSD, Swap & Ağ Soketleri optimize edildi."`,
    `  echo ""`,
    `fi`,
    ``,
    `# ── 1. Operating System & Architecture Check ──`,
    `echo -e "\${BOLD}[1/6] System Pre-flight Check\${NC}"`,
    `OS_TYPE="$(uname -s)"`,
    `ARCH_TYPE="$(uname -m)"`,
    ``,
    `if [[ "\${OS_TYPE}" != "Linux" && "\${XIVIZLEY_TEST_MODE:-}" != "1" ]]; then`,
    `  if [[ "\${CHECK_ONLY}" == "true" ]]; then`,
    `    echo -e "  \${YELLOW}⚠ Non-Linux OS (\${OS_TYPE}) detected. Running in pre-flight dry-run mode.\${NC}"`,
    `  else`,
    `    echo -e "\${RED}✗ Unsupported operating system: \${OS_TYPE}\${NC}"`,
    `    echo "XIVIZLEY deployment script requires a Linux server environment."`,
    `    exit 1`,
    `  fi`,
    `fi`,
    `echo -e "  \${GREEN}✓\${NC} Linux OS detected"`,
    `echo -e "  \${GREEN}✓\${NC} Architecture: \${ARCH_TYPE}"`,
    ``,
    `SUDO_CMD=""`,
    `if [[ "\${EUID}" -ne 0 ]]; then`,
    `  if command -v sudo &>/dev/null; then`,
    `    if sudo -n true 2>/dev/null; then`,
    `      SUDO_CMD="sudo"`,
    `      echo -e "  \${GREEN}✓\${NC} sudo available"`,
    `    else`,
    `      SUDO_CMD=""`,
    `      echo -e "  \${YELLOW}⚠ Non-root user without passwordless sudo. Running in unprivileged mode.\${NC}"`,
    `    fi`,
    `  else`,
    `    echo -e "\${YELLOW}⚠ Non-root user without sudo detected. Privileged operations may fail.\${NC}"`,
    `  fi`,
    `else`,
    `  echo -e "  \${GREEN}✓\${NC} Running as root"`,
    `fi`,
    ``,
    `# ── 2. Docker & Docker Compose Verification / Safe Install ──`,
    `echo ""`,
    `echo -e "\${BOLD}[2/6] Docker & Compose Verification\${NC}"`,
    ``,
    `detect_and_install_docker() {`,
    `  if command -v docker &>/dev/null; then`,
    `    DOCKER_VER="$(docker --version | head -n1)"`,
    `    echo -e "  \${GREEN}✓\${NC} Docker installed (\${DOCKER_VER})"`,
    `  else`,
    `    echo -e "\${YELLOW}⚠ Docker is not installed on this system.\${NC}"`,
    `    if [[ "\${CHECK_ONLY}" == "true" ]]; then`,
    `      echo -e "  \${YELLOW}⚠ Pre-flight: Skipping Docker install prompt (--check mode).\${NC}"`,
    `      return 0`,
    `    fi`,
    `    if [[ "\${ALLOW_INSTALL}" != "true" ]]; then`,
    `      echo -e "\${RED}✗ Docker missing and --no-install was specified. Aborting.\${NC}"`,
    `      exit 1`,
    `    fi`,
    ``,
    `    if [[ "\${AUTO_CONFIRM}" != "true" ]]; then`,
    `      if [ -c /dev/tty ] && exec 3</dev/tty 2>/dev/null; then`,
    `        exec 3<&-`,
    `        read -r -p "Install official Docker Engine on this Linux server? [y/N]: " install_ans < /dev/tty || install_ans="n"`,
    `      else`,
    `        echo -e "\${RED}✗ Interactive terminal (/dev/tty) not available and -y/--yes was not provided.\${NC}"`,
    `        echo "To install Docker non-interactively, please re-run with --yes or -y."`,
    `        exit 1`,
    `      fi`,
    `      if [[ ! "\${install_ans}" =~ ^[Yy]$ ]]; then`,
    `        echo -e "\${RED}✗ Docker installation canceled by user. Aborting.\${NC}"`,
    `        exit 1`,
    `      fi`,
    `    fi`,
    ``,
    `    echo -e "\${CYAN}📦 Installing official Docker packages (Ubuntu/Debian)... \${NC}"`,
    `    if [ -f /etc/os-release ]; then`,
    `      . /etc/os-release`,
    `      OS_DISTRO="\${ID:-}"`,
    `    else`,
    `      OS_DISTRO="unknown"`,
    `    fi`,
    ``,
    `    if [[ "\${OS_DISTRO}" == "ubuntu" || "\${OS_DISTRO}" == "debian" ]]; then`,
    `      \${SUDO_CMD} apt-get update -qq`,
    `      \${SUDO_CMD} apt-get install -y -qq ca-certificates curl gnupg lsb-release`,
    `      \${SUDO_CMD} install -m 0755 -d /etc/apt/keyrings`,
    `      if [ ! -f /etc/apt/keyrings/docker.gpg ]; then`,
    `        curl -fsSL "https://download.docker.com/linux/\${OS_DISTRO}/gpg" | \${SUDO_CMD} gpg --dearmor -o /etc/apt/keyrings/docker.gpg`,
    `        \${SUDO_CMD} chmod a+r /etc/apt/keyrings/docker.gpg`,
    `      fi`,
    `      echo "deb [arch=\$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/\${OS_DISTRO} \$(lsb_release -cs) stable" | \${SUDO_CMD} tee /etc/apt/sources.list.d/docker.list > /dev/null`,
    `      \${SUDO_CMD} apt-get update -qq`,
    `      \${SUDO_CMD} apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin`,
    `      \${SUDO_CMD} systemctl enable --now docker || true`,
    `    else`,
    `      echo -e "\${RED}✗ Automatic Docker installation is currently verified for Ubuntu and Debian.\${NC}"`,
    `      echo "Please install Docker manually on \${OS_DISTRO}, then re-run this script."`,
    `      exit 1`,
    `    fi`,
    `  fi`,
    `}`,
    ``,
    `detect_and_install_docker`,
    ``,
    `# Check Docker daemon`,
    `if command -v docker &>/dev/null; then`,
    `  if ! docker info &>/dev/null; then`,
    `    if [[ "\${CHECK_ONLY}" == "true" ]]; then`,
    `      echo -e "  \${YELLOW}⚠ Pre-flight: Docker daemon is not running.\${NC}"`,
    `    else`,
    `      echo -e "\${YELLOW}⚠ Docker daemon is not running. Attempting to start service...\${NC}"`,
    `      \${SUDO_CMD} systemctl start docker || true`,
    `      if ! docker info &>/dev/null; then`,
    `        echo -e "\${RED}✗ Cannot connect to Docker daemon. Check permissions or \'systemctl status docker\'.\${NC}"`,
    `        exit 1`,
    `      fi`,
    `    fi`,
    `  else`,
    `    echo -e "  \${GREEN}✓\${NC} Docker daemon running and accessible"`,
    `  fi`,
    `elif [[ "\${CHECK_ONLY}" == "true" ]]; then`,
    `  echo -e "  \${YELLOW}⚠ Pre-flight: Skipping Docker daemon check (Docker not installed).\${NC}"`,
    `fi`,
    ``,
    `# Check Docker Compose (v2 plugin preferred, fallback to v1 binary)`,
    `COMPOSE_CMD=""`,
    `if docker compose version &>/dev/null; then`,
    `  COMPOSE_CMD="docker compose"`,
    `  COMPOSE_VER="$(docker compose version | head -n1)"`,
    `  echo -e "  \${GREEN}✓\${NC} Docker Compose v2 plugin available (\${COMPOSE_VER})"`,
    `elif command -v docker-compose &>/dev/null; then`,
    `  COMPOSE_CMD="docker-compose"`,
    `  COMPOSE_VER="$(docker-compose --version | head -n1)"`,
    `  echo -e "  \${GREEN}✓\${NC} Standalone docker-compose available (\${COMPOSE_VER})"`,
    `else`,
    `  if [[ "\${CHECK_ONLY}" == "true" ]]; then`,
    `    echo -e "  \${YELLOW}⚠ Pre-flight: Docker Compose not installed.\${NC}"`,
    `  else`,
    `    echo -e "\${RED}✗ Docker Compose is not available. Please install docker-compose-plugin.\${NC}"`,
    `    exit 1`,
    `  fi`,
    `fi`,
    ``,
    `# ── 3. Runtime Port Availability Check ──`,
    `echo ""`,
    `echo -e "\${BOLD}[3/6] Real-time Host Port Collision Check\${NC}"`,
    `PORT_CONFLICT_COUNT=0`,
    ``,
    `check_port() {`,
    `  local port=$1`,
    `  local proto=$2`,
    `  local srv=$3`,
    `  local in_use=false`,
    `  local proc_info=""`,
    ``,
    `  if command -v ss &>/dev/null; then`,
    `    if ss -tulpn 2>/dev/null | grep -q ":\${port} "; then`,
    `      in_use=true`,
    `      proc_info="$(ss -tulpn 2>/dev/null | grep ":\${port} " | awk '{print $NF}' | head -n1)"`,
    `    fi`,
    `  elif command -v lsof &>/dev/null; then`,
    `    if lsof -i ":\${port}" &>/dev/null; then`,
    `      in_use=true`,
    `      proc_info="$(lsof -i ":\${port}" 2>/dev/null | awk 'NR==2 {print $1}')"`,
    `    fi`,
    `  elif command -v netstat &>/dev/null; then`,
    `    if netstat -tuln 2>/dev/null | grep -q ":\${port} "; then`,
    `      in_use=true`,
    `    fi`,
    `  fi`,
    ``,
    `  if [[ "\${in_use}" == "true" ]]; then`,
    `    echo -e "  \${RED}✗ Port \${port}/\${proto} is already IN USE by another process (\${proc_info:-unknown})\${NC} for service '\${srv}'"`,
    `    PORT_CONFLICT_COUNT=$((PORT_CONFLICT_COUNT + 1))`,
    `  else`,
    `    echo -e "  \${GREEN}✓\${NC} Port \${port}/\${proto} available (\${srv})"`,
    `  fi`,
    `}`,
    ``,
  ];

  if (requiredPorts.length === 0) {
    scriptLines.push(`echo "  • No external host ports declared."`);
  } else {
    for (const req of requiredPorts) {
      const safePort = Number.isInteger(req.port) && req.port > 0 && req.port <= 65535 ? req.port : 80;
      const safeProto = req.protocol === 'udp' ? 'udp' : 'tcp';
      const safeServiceName = req.serviceName.replace(/[^a-z0-9_-]/g, '').slice(0, 64) || 'service';
      scriptLines.push(`check_port ${safePort} "${safeProto}" "${safeServiceName}"`);
    }
  }

  scriptLines.push(
    ``,
    `if [[ \${PORT_CONFLICT_COUNT} -gt 0 ]]; then`,
    `  echo -e "\${YELLOW}⚠ \${PORT_CONFLICT_COUNT} port çakışması tespit edildi (Sunucuda bu portlar zaten dolu).\${NC}"`,
    `  echo ""`,
    `  echo -e "\${CYAN}======================================================================\${NC}"`,
    `  echo -e "\${YELLOW}💡 PORT ÇAKIŞMASI NASIL ÇÖZÜLÜR? (ÇÖZÜM REHBERİ):\${NC}"`,
    `  echo -e "\${CYAN}----------------------------------------------------------------------\${NC}"`,
    `  echo -e "Sunucunuzda yukarıda kırmızı ile belirtilen port(lar) başka bir servis tarafından kullanılıyor."`,
    `  echo ""`,
    `  echo -e "\${BOLD}1. [EN KOLAY VE ÖNERİLEN ÇÖZÜM]:\${NC}"`,
    `  echo -e "   • https://xivizley.com.tr/architect adresindeki tuvalinize dönün."`,
    `  echo -e "   • Çakışan servis kutusuna tıklayın (örn: Nextcloud)."`,
    `  echo -e "   • Sağdaki 'Port Eşlemeleri' kutusundan portu değiştirin (örn: 8080 ➔ 8081 veya 8090)."`,
    `  echo -e "   • 'Sunucuya Kur' butonundan yeni komutu alıp çalıştırın."`,
    `  echo ""`,
    `  echo -e "\${BOLD}2. [ALTERNATİF] Mevcut Portu Kullanan Uygulamayı Kapatmak İsterseniz:\${NC}"`,
    `  echo -e "   • Portu kullananı bulmak için: \${CYAN}ss -tulpn | grep :PORT_NO\${NC}"`,
    `  echo -e "   • İlgili Docker konteynerini durdurmak için: \${CYAN}docker stop <konteyner_id>\${NC}"`,
    `  echo -e "\${CYAN}======================================================================\${NC}"`,
    `  echo ""`,
    `  if [[ "\${AUTO_CONFIRM}" != "true" ]]; then`,
    `    if [ -c /dev/tty ] && exec 3</dev/tty 2>/dev/null; then`,
    `      exec 3<&-`,
    `      read -r -p "Yine de devam etmek istiyor musunuz? (Çakışan servisler açılamayabilir) [y/N]: " port_ans < /dev/tty || port_ans="n"`,
    `    else`,
    `      echo -e "\${RED}✗ Port conflict detected and non-interactive shell cannot prompt for confirmation.\${NC}"`,
    `      echo "Please resolve port conflicts or re-run with --yes / -y to proceed anyway."`,
    `      exit 1`,
    `    fi`,
    `    if [[ ! "\${port_ans}" =~ ^[Yy]$ ]]; then`,
    `      echo -e "\${RED}Kurulum port çakışması nedeniyle kullanıcı tarafından durduruldu.\${NC}"`,
    `      exit 1`,
    `    fi`,
    `  fi`,
    `fi`,
    ``,
    `# ── 4. Write & Validate docker-compose.yml ──`,
    `echo ""`,
    `echo -e "\${BOLD}[4/6] Writing & Validating docker-compose.yml\${NC}"`,
    ``,
    `cat << '${composeDelimiter}' > docker-compose.yml`,
    dockerCompose,
    `${composeDelimiter}`,
    ``,
    `if [[ -n "\${COMPOSE_CMD}" ]] && \${COMPOSE_CMD} config -q &>/dev/null; then`,
    `  echo -e "  \${GREEN}✓\${NC} Docker Compose configuration syntax valid"`,
    `elif [[ -n "\${COMPOSE_CMD}" ]]; then`,
    `  echo -e "\${RED}✗ Invalid Docker Compose configuration detected!\${NC}"`,
    `  \${COMPOSE_CMD} config || true`,
    `  exit 1`,
    `else`,
    `  echo -e "  \${YELLOW}⚠ Skipping compose runtime validation (Docker Compose not installed on host).\${NC}"`,
    `fi`,
    ``,
    `# ── 5. Existing Container Safety Check ──`,
    `echo ""`,
    `echo -e "\${BOLD}[5/6] Inspecting Existing Container Conflicts\${NC}"`,
    `EXISTING_FOUND=0`,
  );

  for (const s of nonHostServices) {
    scriptLines.push(
      `if docker ps -a --format '{{.Names}}' 2>/dev/null | grep -qx "${s.serviceName}"; then`,
      `  echo -e "  \${YELLOW}⚠ Container '${s.serviceName}' already exists on host\${NC}"`,
      `  EXISTING_FOUND=$((EXISTING_FOUND + 1))`,
      `fi`
    );
  }

  scriptLines.push(
    `if [[ \${EXISTING_FOUND} -eq 0 ]]; then`,
    `  echo -e "  \${GREEN}✓\${NC} No existing conflicting container names"`,
    `fi`,
    ``,
    `# Check-only flag exit`,
    `if [[ "\${CHECK_ONLY}" == "true" ]]; then`,
    `  echo ""`,
    `  echo -e "\${GREEN}✓ Pre-flight checks passed successfully. (--check mode ended)\${NC}"`,
    `  exit 0`,
    `fi`,
    ``,
    `# ── 6. Confirmation & Deployment ──`,
    `echo ""`,
    `echo -e "\${BOLD}[6/6] Deployment Confirmation\${NC}"`,
    `echo -e "The following \${BOLD}${nonHostServices.length}\${NC} services will be deployed:"`,
  );

  for (const s of nonHostServices) {
    scriptLines.push(`printf '  • %b%s%b (container: %s)\\n' "\${CYAN}" "${s.label}" "\${NC}" "${s.serviceName}"`);
  }

  scriptLines.push(
    ``,
    `if [[ "\${AUTO_CONFIRM}" != "true" ]]; then`,
    `  if [ -c /dev/tty ] && exec 3</dev/tty 2>/dev/null; then`,
    `    exec 3<&-`,
    `    read -r -p "Deploy these services now? [y/N]: " deploy_ans < /dev/tty || deploy_ans="n"`,
    `  else`,
    `    echo -e "\${RED}✗ Interactive terminal (/dev/tty) not available and -y/--yes was not provided.\${NC}"`,
    `    echo "To deploy without interactive confirmation, pass -y or --yes."`,
    `    exit 1`,
    `  fi`,
    `  if [[ ! "\${deploy_ans}" =~ ^[Yy]$ ]]; then`,
    `    echo -e "\${YELLOW}Deployment cancelled by user.\${NC}"`,
    `    exit 0`,
    `  fi`,
    `fi`,
    ``,
    `echo ""`,
    `echo -e "\${CYAN}📁 Preparing persistent volume directories...\${NC}"`,
    `grep -E '^[[:space:]]*-[[:space:]]*\\./[^:]+:' docker-compose.yml 2>/dev/null | sed -E 's/^[[:space:]]*-[[:space:]]*(\\.[^:]+):.*/\\1/' | sort -u | while read -r vol_path; do`,
    `  if [[ -n "\${vol_path}" ]]; then`,
    `    mkdir -p "\${vol_path}"`,
    `    chmod -R 777 "\${vol_path}" 2>/dev/null || true`,
    `  fi`,
    `done`,
    ``,
  );

  // Minecraft Plugins download
  const mcNodes = nodes.filter((n) => n.data.moduleId === 'minecraft-paperm');
  const hasMcPlugins = mcNodes.some((n) => n.data.selectedPlugins && n.data.selectedPlugins.length > 0);
  if (hasMcPlugins) {
    scriptLines.push(
      `echo ""`,
      `echo -e "\${CYAN}⛏️  Minecraft seçili eklentileri indiriliyor...\${NC}"`,
      `mkdir -p ./minecraft/plugins`,
      ``,
    );
    for (const mcNode of mcNodes) {
      const plugins = mcNode.data.selectedPlugins || [];
      for (const pluginId of plugins) {
        const plugin = MINECRAFT_PLUGINS.find((p) => p.id === pluginId);
        if (plugin) {
          scriptLines.push(
            `echo -e "  \${CYAN}⬇ [Minecraft] ${plugin.name} indiriliyor...\${NC}"`,
            `curl -sSL "${plugin.jarUrl}" -o "./minecraft/plugins/${plugin.fileName}" || echo -e "  \${YELLOW}⚠ ${plugin.name} indirilemedi\${NC}"`,
          );
        }
      }
    }
    scriptLines.push(``);
  }

  // FiveM Plugins download & server.cfg / permissions configuration
  const fivemNodes = nodes.filter((n) => n.data.moduleId === 'fivem');
  const hasFivemPlugins = fivemNodes.some((n) => n.data.selectedPlugins && n.data.selectedPlugins.length > 0);
  if (hasFivemPlugins) {
    scriptLines.push(
      `echo ""`,
      `echo -e "\${CYAN}🎮 FiveM seçili eklentileri ve mod paketleri indiriliyor...\${NC}"`,
      `command -v unzip &>/dev/null || ( \${SUDO_CMD} apt-get update -qq && \${SUDO_CMD} apt-get install -y -qq unzip curl &>/dev/null )`,
      `mkdir -p ./fivem/data/resources ./fivem/resources`,
      `touch ./fivem/data/server.cfg 2>/dev/null || true`,
      ``,
    );

    for (const fivemNode of fivemNodes) {
      const plugins = fivemNode.data.selectedPlugins || [];
      for (const pluginId of plugins) {
        const plugin = FIVEM_PLUGINS.find((p) => p.id === pluginId);
        if (plugin) {
          scriptLines.push(
            `echo -e "  \${CYAN}⬇ [FiveM] ${plugin.name} yükleniyor...\${NC}"`,
            `rm -rf /tmp/fivem_dl /tmp/fivem_plug.zip`,
            `mkdir -p /tmp/fivem_dl`,
            `curl -sSL "${plugin.downloadUrl}" -o /tmp/fivem_plug.zip`,
            `unzip -q -o /tmp/fivem_plug.zip -d /tmp/fivem_dl`,
            `mkdir -p "./fivem/data/resources/${plugin.folderName}" "./fivem/resources/${plugin.folderName}"`,
            `MANIFEST_FILE="$(find /tmp/fivem_dl \\( -name "fxmanifest.lua" -o -name "__resource.lua" \\) 2>/dev/null | head -n1)"`,
            `if [[ -n "\${MANIFEST_FILE}" ]]; then`,
            `  MANIFEST_DIR="\$(dirname "\${MANIFEST_FILE}")"`,
            `  cp -rf "\${MANIFEST_DIR}/"* "./fivem/data/resources/${plugin.folderName}/" 2>/dev/null || true`,
            `  cp -rf "\${MANIFEST_DIR}/"* "./fivem/resources/${plugin.folderName}/" 2>/dev/null || true`,
            `else`,
            `  cp -rf /tmp/fivem_dl/* "./fivem/data/resources/${plugin.folderName}/" 2>/dev/null || true`,
            `  cp -rf /tmp/fivem_dl/* "./fivem/resources/${plugin.folderName}/" 2>/dev/null || true`,
            `fi`,
            `rm -rf /tmp/fivem_dl /tmp/fivem_plug.zip`,
            `grep -q "${plugin.ensureCommand}" ./fivem/data/server.cfg 2>/dev/null || echo -e "\n${plugin.ensureCommand}" >> ./fivem/data/server.cfg`,
          );

          if (plugin.id === 'vmenu') {
            scriptLines.push(
              `# vMenu Permissions & Admin Bypass`,
              `if [[ -f "./fivem/data/resources/vMenu/config/permissions.cfg" ]]; then`,
              `  cp -f "./fivem/data/resources/vMenu/config/permissions.cfg" "./fivem/data/permissions.cfg" 2>/dev/null || true`,
              `fi`,
              `if [[ -f "./fivem/data/permissions.cfg" ]]; then`,
              `  grep -q 'add_ace builtin.everyone "vMenu.Everything" allow' ./fivem/data/permissions.cfg 2>/dev/null || \\`,
              `    echo -e '\nadd_ace builtin.everyone "vMenu.Everything" allow' >> ./fivem/data/permissions.cfg`,
              `fi`,
              `grep -q "exec permissions.cfg" ./fivem/data/server.cfg 2>/dev/null || \\`,
              `  sed -i '1s/^/exec permissions.cfg\\n/' ./fivem/data/server.cfg 2>/dev/null || \\`,
              `  echo -e 'exec permissions.cfg' >> ./fivem/data/server.cfg`,
            );
          }

          scriptLines.push(
            `echo -e "  \${GREEN}✓\${NC} ${plugin.name} hazır!"`,
            ``,
          );
        }
      }
    }
  }

  scriptLines.push(
    `echo -e "\${CYAN}🚀 Pulling images & starting container stack...\${NC}"`,
    `\${COMPOSE_CMD} pull`,
    `\${COMPOSE_CMD} up -d`,
    ``,
    `echo ""`,
    `echo -e "\${GREEN}============================================================\${NC}"`,
    `echo -e "\${GREEN}   ✓ XIVIZLEY Deployment Completed Successfully!\${NC}"`,
    `echo -e "\${GREEN}============================================================\${NC}"`,
    `echo ""`,
    `echo -e "\${BOLD}Current Container Status:\${NC}"`,
    `\${COMPOSE_CMD} ps`,
    ``,
    `# ── Post-Deploy Health Check Summary ──`,
    `echo ""`,
    `echo -e "\${BOLD}Health Verification:\${NC}"`,
    `for container_id in \$(\${COMPOSE_CMD} ps -q); do`,
    `  c_name="\$(docker inspect --format '{{.Name}}' "\${container_id}" | sed 's|^/||')"`,
    `  c_status="\$(docker inspect --format '{{.State.Status}}' "\${container_id}")"`,
    `  c_health="\$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "\${container_id}")"`,
    ``,
    `  if [[ "\${c_status}" == "running" ]]; then`,
    `    if [[ "\${c_health}" == "healthy" ]]; then`,
    `      echo -e "  \${GREEN}✓\${NC} \${c_name}: running (healthy)"`,
    `    elif [[ "\${c_health}" == "none" ]]; then`,
    `      echo -e "  \${GREEN}✓\${NC} \${c_name}: running (ready)"`,
    `    else`,
    `      echo -e "  \${YELLOW}⚠\${NC} \${c_name}: running (health: \${c_health})"`,
    `    fi`,
    `  elif [[ "\${c_status}" == "restarting" ]]; then`,
    `    echo -e "  \${RED}✗\${NC} \${c_name}: restarting (crash loop detected)"`,
    `  else`,
    `    echo -e "  \${RED}✗\${NC} \${c_name}: \${c_status}"`,
    `  fi`,
    `done`,
    ``,
    `# ── Automated Zero-Friction Service Configurations ──`,
    `if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "^nextcloud$"; then`,
    `  echo -e "  \${CYAN}⚙️ Nextcloud Güvenli Alan Adları (Trusted Domains) otomatik yapılandırılıyor...\${NC}"`,
    `  sleep 2`,
    `  HOST_IP=\$(curl -s4 ifconfig.me 2>/dev/null || hostname -I | awk '{print \$1}')`,
    `  docker exec --user www-data nextcloud php occ config:system:set trusted_domains 1 --value="*" &>/dev/null || true`,
    `  echo -e "  \${GREEN}✓\${NC} Nextcloud tüm alan adlarına ve sunucu IP'sine otomatik olarak açıldı."`,
    `fi`,
    ``,
  );

  const hasCasaOS = nodes.some((n) => n.data.moduleId === 'casaos');
  if (hasCasaOS) {
    scriptLines.push(
      `echo ""`,
      `echo -e "  \${CYAN}⚙️ CasaOS Sunucu Paneli Otomatik Yükleniyor...\${NC}"`,
      `curl -fsSL https://get.casaos.io | \${SUDO_CMD} bash || true`
    );
  }

  scriptLines.push(
    ``,
    `# ── 7. Install XIVIZLEY CLI Tool ('durum') ──`,
    `mkdir -p /usr/local/bin`,
    `cat << 'EOF_CLITOOL' > /usr/local/bin/durum`,
    `#!/usr/bin/env bash`,
    `CYAN='\\033[0;36m'`,
    `GREEN='\\033[0;32m'`,
    `RED='\\033[0;31m'`,
    `YELLOW='\\033[1;33m'`,
    `BOLD='\\033[1m'`,
    `DIM='\\033[2m'`,
    `NC='\\033[0m'`,
    ``,
    `IP=\$(curl -s4 ifconfig.me 2>/dev/null || ip route get 1.1.1.1 2>/dev/null | awk '{print \$7}' || hostname -I | awk '{print \$1}')`,
    `CPU_USAGE=\$(top -bn1 | grep "Cpu(s)" | awk '{print \$2 + \$4}' | awk '{printf "%.0f", \$1}')`,
    `MEM_TOTAL=\$(free -m | awk '/Mem:/ {print \$2}')`,
    `MEM_USED=\$(free -m | awk '/Mem:/ {print \$3}')`,
    `MEM_PCT=\$(( MEM_USED * 100 / (MEM_TOTAL > 0 ? MEM_TOTAL : 1) ))`,
    `MEM_TOTAL_GB=\$(awk "BEGIN {printf \\"%.1f\\", \$MEM_TOTAL/1024}")`,
    `MEM_USED_GB=\$(awk "BEGIN {printf \\"%.1f\\", \$MEM_USED/1024}")`,
    `DISK_TOTAL=\$(df -h / | awk 'NR==2 {print \$2}')`,
    `DISK_USED=\$(df -h / | awk 'NR==2 {print \$3}')`,
    `DISK_PCT=\$(df / | awk 'NR==2 {print \$5}' | tr -d '%')`,
    `UPTIME_STR=\$(uptime -p 2>/dev/null | sed 's/up //g' || uptime | awk '{print \$3}')`,
    ``,
    `draw_bar() {`,
    `  local pct=\$1`,
    `  local filled=\$(( pct / 10 ))`,
    `  local empty=\$(( 10 - filled ))`,
    `  local bar=""`,
    `  for ((i=0; i<filled; i++)); do bar="\${bar}■"; done`,
    `  for ((i=0; i<empty; i++)); do bar="\${bar}□"; done`,
    `  echo "\$bar"`,
    `}`,
    ``,
    `echo ""`,
    `echo -e "\${CYAN}============================================================\${NC}"`,
    `echo -e "\${CYAN}\${BOLD}   🚀 XIVIZLEY — CANLI SUNUCU & KONTEYNER DURUM RAPORU\${NC}"`,
    `echo -e "\${CYAN}============================================================\${NC}"`,
    `echo -e " 🖥️  \${BOLD}CPU:\${NC}   [\${GREEN}\$(draw_bar \$CPU_USAGE)\${NC}] %\${CPU_USAGE}"`,
    `echo -e " 🧠  \${BOLD}RAM:\${NC}   [\${CYAN}\$(draw_bar \$MEM_PCT)\${NC}] \${MEM_USED_GB} GB / \${MEM_TOTAL_GB} GB (%\${MEM_PCT})"`,
    `echo -e " 💾  \${BOLD}DİSK:\${NC}  [\${YELLOW}\$(draw_bar \$DISK_PCT)\${NC}] \${DISK_USED} / \${DISK_TOTAL} (%\${DISK_PCT})"`,
    `echo -e " ⏱️  \${BOLD}AÇIK:\${NC}  \${UPTIME_STR}"`,
    `if [ -f /etc/xivizley/sponsor ]; then`,
    `  echo -e " 🏢  \${BOLD}ALTYAPI:\${NC} \${BLUE}\$(cat /etc/xivizley/sponsor)\${NC}"`,
    `fi`,
    `echo -e "\${DIM}------------------------------------------------------------\${NC}"`,
    `printf "\${BOLD}%-16s %-14s %-10s %-8s %-20s\${NC}\\n" "SERVİS" "DURUM" "RAM" "CPU" "PORT / ERİŞİM"`,
    `echo -e "\${DIM}------------------------------------------------------------\${NC}"`,
    `if systemctl is-active --quiet casaos 2>/dev/null; then`,
    `  printf "%-16s %-23b %-10s %-8s %-20b\\n" "casaos" "\${GREEN}🟢 ÇALIŞIYOR\${NC}" "Systemd" "0.1%" "http://\${IP}"`,
    `fi`,
    ``,
    `if command -v docker &>/dev/null; then`,
    `  docker ps -a --format '{{.Names}}|{{.Status}}|{{.Ports}}' 2>/dev/null | while IFS='|' read -r name status ports; do`,
    `    if [[ "\$name" == *"xivizley-agent"* ]]; then continue; fi`,
    `    if [[ "\$status" == Up* ]]; then`,
    `      STAT_TXT="\${GREEN}🟢 ÇALIŞIYOR\${NC}"`,
    `    else`,
    `      STAT_TXT="\${RED}🔴 DURDU\${NC}"`,
    `    fi`,
    `    STATS=\$(docker stats --no-stream --format "{{.MemUsage}}|{{.CPUPerc}}" "\$name" 2>/dev/null)`,
    `    MEM_USAGE=\$(echo "\$STATS" | cut -d'|' -f1 | awk '{print \$1}')`,
    `    CPU_PERC=\$(echo "\$STATS" | cut -d'|' -f2)`,
    `    CLEAN_PORT=\$(echo "\$ports" | grep -o '0.0.0.0:[0-9]*' | head -n1 | cut -d':' -f2)`,
    `    if [ -n "\$CLEAN_PORT" ]; then`,
    `      PORT_DISPLAY="http://\${IP}:\${CLEAN_PORT}"`,
    `    else`,
    `      PORT_DISPLAY="\${DIM}Lokal Ağ\${NC}"`,
    `    fi`,
    `    printf "%-16s %-23b %-10s %-8s %-20b\\n" "\$name" "\$STAT_TXT" "\${MEM_USAGE:-0MB}" "\${CPU_PERC:-%0}" "\$PORT_DISPLAY"`,
    `  done`,
    `else`,
    `  echo -e "\${RED}Docker çalışmıyor.\${NC}"`,
    `fi`,
    `echo -e "\${CYAN}============================================================\${NC}"`,
    `echo -e "\${DIM}💡 İpucu: XIVIZLEY ile yeni mimari tasarlamak için: https://xivizley.com.tr\${NC}\\n"`,
    `EOF_CLITOOL`,
    `chmod 755 /usr/local/bin/durum 2>/dev/null || chmod +x /usr/local/bin/durum 2>/dev/null || true`,
    `ln -sf /usr/local/bin/durum /usr/bin/durum 2>/dev/null || true`,
    `ln -sf /usr/local/bin/durum /usr/local/bin/xivizley 2>/dev/null || true`,
    `ln -sf /usr/local/bin/durum /usr/bin/xivizley 2>/dev/null || true`,
    ``,
    `SERVER_IP="\$(hostname -I 2>/dev/null | awk '{print \$1}' || echo "your-server-ip")"`,
    `echo ""`,
    `echo -e "\${BOLD}Management Commands:\${NC}"`,
    `echo -e "  • 📊 Canlı Durum: \${GREEN}durum\${NC} (veya \${GREEN}xivizley\${NC})"`,
    `echo -e "  • Check status:  \${CYAN}cd \${DEPLOY_DIR} && \${COMPOSE_CMD} ps\${NC}"`,
    `echo -e "  • View logs:     \${CYAN}cd \${DEPLOY_DIR} && \${COMPOSE_CMD} logs -f\${NC}"`,
    `echo -e "  • Stop stack:    \${CYAN}cd \${DEPLOY_DIR} && \${COMPOSE_CMD} down\${NC}"`,
    `echo -e "  • Restart stack: \${CYAN}cd \${DEPLOY_DIR} && \${COMPOSE_CMD} restart\${NC}"`,
    `echo ""`,
    `}`,
    ``,
    `main "$@"`,
  );

  return scriptLines.join('\n');
}

/**
 * Generates the deployment README.md file.
 */
export function generateDeploymentReadme(nodes: ArchitectNode[], title: string = 'XIVIZLEY Homelab'): string {
  const serviceMap = resolveServiceNames(nodes);
  const requiredPorts = extractRequiredHostPorts(nodes);

  const lines: string[] = [
    `# ${title} — Deployment Guide`,
    ``,
    `Generated by [XIVIZLEY Server Architect](https://xivizley.com.tr).`,
    ``,
    `## 📦 Included Services`,
    ``,
  ];

  for (const node of nodes) {
    const info = serviceMap.get(node.id);
    if (!info || info.isHostInstall) continue;
    lines.push(`- **${node.data.label}** (\`${info.serviceName}\`)`);
  }

  if (requiredPorts.length > 0) {
    lines.push(``, `## 🔌 Exposed Host Ports`, ``);
    for (const p of requiredPorts) {
      lines.push(`- Port \`${p.port}/${p.protocol}\` → ${p.serviceName}`);
    }
  }

  lines.push(
    ``,
    `## 🚀 Quick Start (VDS / Local Linux Server)`,
    ``,
    `1. Transfer this folder to your VDS / Linux server:`,
    `   \`\`\`bash`,
    `   scp -r ./xivizley-stack user@your-server-ip:~/`,
    `   \`\`\``,
    ``,
    `2. SSH into your server:`,
    `   \`\`\`bash`,
    `   ssh user@your-server-ip`,
    `   cd ~/xivizley-stack`,
    `   \`\`\``,
    ``,
    `3. Make the deploy script executable and run:`,
    `   \`\`\`bash`,
    `   chmod +x deploy.sh`,
    `   ./deploy.sh`,
    `   \`\`\``,
    ``,
    `## 🛠️ CLI Options`,
    ``,
    `- \`./deploy.sh --check\` — Run pre-flight checks (OS, Docker, ports) without deploying.`,
    `- \`./deploy.sh --yes\` — Non-interactive mode (auto-confirms prompts).`,
    `- \`./deploy.sh --no-install\` — Prevents automatic Docker installation if Docker is missing.`,
    `- \`./deploy.sh --help\` — Show usage help.`,
    ``,
    `## 🔍 Troubleshooting & Management`,
    ``,
    `- **View live logs**: \`docker compose logs -f\``,
    `- **Check container status**: \`docker compose ps\``,
    `- **Restart all services**: \`docker compose restart\``,
    `- **Stop all services**: \`docker compose down\``,
    ``,
    `---`,
    `*Generated with XIVIZLEY Server Architect — Clean, Standard, Safe Docker Deployments.*`
  );

  return lines.join('\n');
}

/**
 * Returns complete deployment package with docker-compose.yml, deploy.sh, and README.md.
 */
export function generateDeploymentPackage(
  nodes: ArchitectNode[],
  edges: ArchitectEdge[] = [],
  title?: string
): DeploymentPackage {
  const { dockerCompose } = generateCode(nodes, edges);
  const deployScript = generateVdsDeployScript(nodes, edges, { title });
  const readme = generateDeploymentReadme(nodes, title);

  return {
    dockerCompose,
    deployScript,
    readme,
  };
}
