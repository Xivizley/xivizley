import type { Node } from 'reactflow';
import type { ModuleNodeData } from '@/lib/types';
import { MODULE_CATALOG } from '@/lib/data/modules';

export interface SecurityIssue {
  id: string;
  nodeId: string;
  nodeLabel: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  recommendation: string;
  autoFixable: boolean;
  field?: string;
}

export interface SecurityAuditResult {
  score: number; // 0 - 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  issues: SecurityIssue[];
  passedCount: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
}

const INSECURE_PASSWORDS = [
  'password',
  '123456',
  'admin',
  'root',
  'CHANGE_ME',
  'YOUR_PASSWORD',
  'secret',
  'default',
  'test',
  '12345678',
];

export function auditStackSecurity(nodes: Node<ModuleNodeData>[]): SecurityAuditResult {
  if (nodes.length === 0) {
    return {
      score: 100,
      grade: 'A+',
      issues: [],
      passedCount: 0,
      criticalCount: 0,
      warningCount: 0,
      infoCount: 0,
    };
  }

  const issues: SecurityIssue[] = [];
  let passedChecks = 0;

  // 1. Check for Reverse Proxy presence
  const hasProxy = nodes.some((n) => {
    const def = MODULE_CATALOG.find((m) => m.id === n.data.moduleId);
    return def?.category === 'proxy' || n.data.moduleId.includes('nginx') || n.data.moduleId.includes('traefik');
  });

  const webAppNodes = nodes.filter((n) => {
    const def = MODULE_CATALOG.find((m) => m.id === n.data.moduleId);
    return def?.ports.some((p) => p.internal === 80 || p.internal === 443 || p.internal === 8080 || p.internal === 3000);
  });

  if (webAppNodes.length > 1 && !hasProxy) {
    issues.push({
      id: 'missing-reverse-proxy',
      nodeId: 'global',
      nodeLabel: 'Tüm Yığın',
      severity: 'warning',
      title: 'Ters Proxy (SSL / HTTPS Yöneticisi) Bulunamadı',
      description: 'Birden fazla web servisi doğrudan dış portlara açılmış. Otomatik SSL şifrelemesi ve tek alan adı yönlendirmesi için Nginx Proxy Manager önerilir.',
      recommendation: 'Tuvale Nginx Proxy Manager veya Traefik modülü ekleyin.',
      autoFixable: false,
    });
  } else {
    passedChecks += 2;
  }

  // 2. Per-Node Security Checks
  nodes.forEach((node) => {
    const moduleDef = MODULE_CATALOG.find((m) => m.id === node.data.moduleId);
    const envOverrides = node.data.envOverrides || {};

    const envMap: Record<string, string> = {};
    (moduleDef?.environment || []).forEach((e) => {
      envMap[e.key] = e.defaultValue;
    });
    Object.assign(envMap, envOverrides);

    // A. Check for default / insecure passwords
    Object.entries(envMap).forEach(([key, val]) => {
      const isSecretKey = /password|secret|key|token|auth/i.test(key);
      const isWeakVal = INSECURE_PASSWORDS.some((p) => String(val).toLowerCase() === p.toLowerCase());

      if (isSecretKey && isWeakVal) {
        issues.push({
          id: `weak-secret-${node.id}-${key}`,
          nodeId: node.id,
          nodeLabel: node.data.label,
          severity: 'critical',
          title: `Güvensiz Varsayılan Parola: ${key}`,
          description: `"${node.data.label}" servisinde "${key}" değişkeni güvensiz bir varsayılan değere (${val}) sahip.`,
          recommendation: '32 karakterlik rastgele güçlü bir parola atayın.',
          autoFixable: true,
          field: key,
        });
      } else if (isSecretKey) {
        passedChecks += 1;
      }
    });

    // B. Check for risky volumes (docker socket or root fs)
    const volumes = moduleDef?.volumes || [];
    volumes.forEach((vol) => {
      if (vol.hostPath.includes('/var/run/docker.sock') && !['portainer', 'watchtower', 'glances'].includes(node.data.moduleId)) {
        issues.push({
          id: `docker-sock-risk-${node.id}`,
          nodeId: node.id,
          nodeLabel: node.data.label,
          severity: 'critical',
          title: 'Docker Socket Doğrudan Paylaşılmış',
          description: 'Docker socket bağlaması konteynere ana makine üzerinde tam root yetkisi verir.',
          recommendation: 'Yalnızca güvenilir yönetim araçlarında kullanın ve :ro (read-only) bayrağı ekleyin.',
          autoFixable: false,
        });
      } else {
        passedChecks += 1;
      }
    });

    // C. Database exposed ports
    if (['postgres', 'mariadb', 'mysql', 'redis', 'mongodb'].includes(node.data.moduleId)) {
      const portCount = moduleDef?.ports.length || 0;
      if (portCount > 0 && !hasProxy) {
        issues.push({
          id: `exposed-db-port-${node.id}`,
          nodeId: node.id,
          nodeLabel: node.data.label,
          severity: 'warning',
          title: 'Veritabanı Portu Doğrudan Dış Dünyaya Açık',
          description: `"${node.data.label}" portları doğrudan internete açık. Bu durum kaba kuvvet (brute-force) saldırılarına zemin hazırlar.`,
          recommendation: 'Veritabanlarını sadece dahili Docker ağı (internal network) üzerinden web uygulamalarına bağlayın.',
          autoFixable: false,
        });
      }
    }
  });

  // Calculate Score
  const criticalCount = issues.filter((i) => i.severity === 'critical').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const infoCount = issues.filter((i) => i.severity === 'info').length;

  let score = 100 - (criticalCount * 25) - (warningCount * 12) - (infoCount * 4);
  score = Math.max(0, Math.min(100, score));

  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'A+';
  if (score >= 95) grade = 'A+';
  else if (score >= 85) grade = 'A';
  else if (score >= 70) grade = 'B';
  else if (score >= 50) grade = 'C';
  else if (score >= 30) grade = 'D';
  else grade = 'F';

  return {
    score,
    grade,
    issues,
    passedCount: passedChecks,
    criticalCount,
    warningCount,
    infoCount,
  };
}

export function generateSecureSecret(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
  let result = '';
  const randomValues = new Uint32Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomValues);
    for (let i = 0; i < length; i++) {
      const idx = (randomValues[i] ?? 0) % chars.length;
      result += chars[idx];
    }
  } else {
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return result;
}
