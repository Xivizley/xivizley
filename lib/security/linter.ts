// ============================================================
// XIVIZLEY — Infrastructure Security & Linter Engine
// lib/security/linter.ts
// ============================================================

import type { Node } from 'reactflow';
import type { ModuleNodeData } from '@/lib/types';
import { MODULE_CATALOG } from '@/lib/data/modules';

export type SecuritySeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'GOOD';

export interface SecurityIssue {
  id: string;
  nodeId: string;
  moduleName: string;
  title: string;
  description: string;
  severity: SecuritySeverity;
  category: 'password' | 'port' | 'restart' | 'permission' | 'network';
  canAutoFix: boolean;
  fixActionLabel?: string;
  fixData?: {
    type: 'replace_env' | 'bind_localhost' | 'set_restart' | 'add_env';
    envKey?: string;
    newValue?: string;
    portInternal?: number;
    newHostPort?: number;
  };
}

export interface SecurityAuditReport {
  score: number; // 0 - 100
  totalIssues: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  issues: SecurityIssue[];
  passedChecks: number;
}

const WEAK_PASSWORD_PATTERNS = [
  'CHANGE_ME',
  'CHANGEME',
  'password',
  'admin',
  '123456',
  '12345678',
  'root',
  'secret',
  'test',
  'pass',
  'default',
];

const RAW_DATABASE_PORTS = [5432, 3306, 27017, 6379];

export function generateStrongSecret(length = 24): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=';
  let result = '';
  const randomValues = new Uint32Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomValues);
    for (let i = 0; i < length; i++) {
      result += charset[randomValues[i]! % charset.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      result += charset[Math.floor(Math.random() * charset.length)];
    }
  }
  return result;
}

export function runSecurityAudit(nodes: Node<ModuleNodeData>[]): SecurityAuditReport {
  const issues: SecurityIssue[] = [];
  let passedChecks = 0;

  if (nodes.length === 0) {
    return {
      score: 100,
      totalIssues: 0,
      criticalCount: 0,
      highCount: 0,
      mediumCount: 0,
      lowCount: 0,
      issues: [],
      passedChecks: 0,
    };
  }

  nodes.forEach((node) => {
    const data = node.data;
    const def = MODULE_CATALOG.find((m) => m.id === data.moduleId);
    const moduleName = data.label || def?.name || data.moduleId;

    // 1. Password & Secret Check
    if (def?.environment) {
      def.environment.forEach((envDef) => {
        const currentValue = data.envOverrides[envDef.key] ?? envDef.defaultValue;
        const isSecret =
          envDef.secret ||
          envDef.key.toLowerCase().includes('pass') ||
          envDef.key.toLowerCase().includes('secret') ||
          envDef.key.toLowerCase().includes('key') ||
          envDef.key.toLowerCase().includes('token');

        if (isSecret) {
          const isWeak =
            !currentValue ||
            WEAK_PASSWORD_PATTERNS.some((p) => currentValue.toLowerCase().includes(p.toLowerCase())) ||
            currentValue.length < 8;

          if (isWeak) {
            issues.push({
              id: `sec-${node.id}-${envDef.key}`,
              nodeId: node.id,
              moduleName,
              title: `Zayıf veya Varsayılan Şifre: ${envDef.key}`,
              description: `"${moduleName}" modülündeki "${envDef.key}" şifresi zayıf veya varsayılan (${currentValue}) olarak bırakılmış.`,
              severity: 'CRITICAL',
              category: 'password',
              canAutoFix: true,
              fixActionLabel: 'Güçlü Şifre Ata',
              fixData: {
                type: 'replace_env',
                envKey: envDef.key,
                newValue: generateStrongSecret(24),
              },
            });
          } else {
            passedChecks++;
          }
        }
      });
    }

    // 2. Raw Database Port Exposure Check
    if (
      def?.category === 'storage' ||
      def?.id.includes('db') ||
      def?.id.includes('postgres') ||
      def?.id.includes('mysql') ||
      def?.id.includes('redis')
    ) {
      def.ports.forEach((p) => {
        if (RAW_DATABASE_PORTS.includes(p.internal)) {
          const hostPort = data.portOverrides[p.internal] ?? p.default;
          if (hostPort) {
            issues.push({
              id: `sec-${node.id}-db-port-${p.internal}`,
              nodeId: node.id,
              moduleName,
              title: `Açık Veritabanı Portu (${hostPort})`,
              description: `Veritabanı portu (${p.internal}) doğrudan tüm internete açık. Mikroservisler aynı Docker ağında portsuz iletişim kurabilir.`,
              severity: 'HIGH',
              category: 'port',
              canAutoFix: true,
              fixActionLabel: 'Portu Koru / İyileştir',
              fixData: {
                type: 'bind_localhost',
                portInternal: p.internal,
              },
            });
          }
        }
      });
    }

    // 3. Restart Policy Check
    const restartPolicy = data.customRestart || 'unless-stopped';
    if (restartPolicy === 'no') {
      issues.push({
        id: `sec-${node.id}-restart`,
        nodeId: node.id,
        moduleName,
        title: `Eksik Yeniden Başlatma Politikası`,
        description: `"${moduleName}" servisinde otomatik yeniden başlatma (restart) kapalı. Sunucu yeniden başladığında servis kapalı kalır.`,
        severity: 'MEDIUM',
        category: 'restart',
        canAutoFix: true,
        fixActionLabel: 'unless-stopped Yap',
        fixData: {
          type: 'set_restart',
          newValue: 'unless-stopped',
        },
      });
    } else {
      passedChecks++;
    }

    // 4. LinuxServer PUID/PGID Check
    if (def?.dockerImage?.startsWith('linuxserver/')) {
      const hasPuid = data.envOverrides['PUID'] || def.environment?.some((e) => e.key === 'PUID');
      const hasPgid = data.envOverrides['PGID'] || def.environment?.some((e) => e.key === 'PGID');

      if (!hasPuid || !hasPgid) {
        issues.push({
          id: `sec-${node.id}-puid`,
          nodeId: node.id,
          moduleName,
          title: `PUID / PGID İzin Eksikliği`,
          description: `LinuxServer konteynerlerinde dosya izin hatalarını önlemek için PUID=1000 ve PGID=1000 tanımlanmalıdır.`,
          severity: 'LOW',
          category: 'permission',
          canAutoFix: true,
          fixActionLabel: 'PUID/PGID Ekle',
          fixData: {
            type: 'add_env',
            envKey: 'PUID',
            newValue: '1000',
          },
        });
      } else {
        passedChecks++;
      }
    }
  });

  const criticalCount = issues.filter((i) => i.severity === 'CRITICAL').length;
  const highCount = issues.filter((i) => i.severity === 'HIGH').length;
  const mediumCount = issues.filter((i) => i.severity === 'MEDIUM').length;
  const lowCount = issues.filter((i) => i.severity === 'LOW').length;

  let score = 100 - (criticalCount * 25 + highCount * 15 + mediumCount * 8 + lowCount * 4);
  if (score < 0) score = 0;

  return {
    score,
    totalIssues: issues.length,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    issues,
    passedChecks,
  };
}
