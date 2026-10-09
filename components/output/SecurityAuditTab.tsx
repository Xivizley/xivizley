'use client';

// ============================================================
// XIVIZLEY — Security Audit & Linter Tab
// components/output/SecurityAuditTab.tsx
// ============================================================

import React, { useMemo } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Zap,
  CheckCircle2,
  KeyRound,
  Network,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { useArchitectStore } from '@/store/useArchitectStore';
import { runSecurityAudit, SecurityIssue } from '@/lib/security/linter';
import { useI18nStore } from '@/lib/i18n/store';
import { cn } from '@/lib/utils';

export function SecurityAuditTab() {
  const { lang } = useI18nStore();
  const nodes = useArchitectStore((s) => s.nodes);
  const updateEnvOverride = useArchitectStore((s) => s.updateEnvOverride);
  const updatePortOverride = useArchitectStore((s) => s.updatePortOverride);
  const updateCustomContainer = useArchitectStore((s) => s.updateCustomContainer);

  const report = useMemo(() => runSecurityAudit(nodes), [nodes]);

  const handleFixIssue = (issue: SecurityIssue) => {
    const node = nodes.find((n) => n.id === issue.nodeId);
    if (!node || !issue.fixData) return;

    if (
      (issue.fixData.type === 'replace_env' || issue.fixData.type === 'add_env') &&
      issue.fixData.envKey &&
      issue.fixData.newValue
    ) {
      updateEnvOverride(node.id, issue.fixData.envKey, issue.fixData.newValue);
    } else if (issue.fixData.type === 'set_restart' && issue.fixData.newValue) {
      updateCustomContainer(node.id, {
        customRestart: issue.fixData.newValue,
      });
    } else if (issue.fixData.type === 'bind_localhost' && issue.fixData.portInternal) {
      updatePortOverride(node.id, issue.fixData.portInternal, 0);
    }
  };

  const handleAutoFixAll = () => {
    report.issues.forEach((issue) => {
      if (issue.canAutoFix) {
        handleFixIssue(issue);
      }
    });
  };

  const isTr = lang === 'tr';

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4 bg-[#090514] text-[#F5F3FF]">
      {/* Score Header Card */}
      <div className="rounded-[2px] border border-[#2B1A42] bg-[#120A21] p-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-[2px] border text-xl font-bold font-mono shadow-lg',
                report.score >= 80
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                  : report.score >= 50
                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-400'
                  : 'bg-red-950/40 border-red-500/40 text-red-400'
              )}
            >
              {report.score}%
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#F5F3FF] flex items-center gap-2">
                {report.score === 100 ? (
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                ) : (
                  <ShieldAlert className="h-4 w-4 text-amber-400" />
                )}
                {isTr ? 'Güvenlik & Linter Skoru' : 'Security & Linter Score'}
              </h3>
              <p className="text-xs text-[#A19BAF] mt-0.5">
                {report.totalIssues === 0
                  ? isTr
                    ? 'Tüm denetimler başarılı, risk bulunamadı.'
                    : 'All checks passed, no risks detected.'
                  : `${report.totalIssues} ${isTr ? 'güvenlik uyarısı tespit edildi.' : 'security issues found.'}`}
              </p>
            </div>
          </div>

          {report.totalIssues > 0 && (
            <button
              onClick={handleAutoFixAll}
              className="flex items-center gap-1.5 rounded-[2px] bg-[#8B5CF6] hover:bg-[#7C3AED] px-3.5 py-2 text-xs font-bold text-white font-mono shadow-md active:scale-95 transition-all shrink-0"
            >
              <Zap className="h-3.5 w-3.5 fill-current" />
              <span>{isTr ? '1-Tıkla Hepsini Düzelt' : '1-Click Auto-Fix All'}</span>
            </button>
          )}
        </div>

        {/* Severity Count Pills */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#2B1A42] text-[11px] font-mono">
          <span className="text-red-400 bg-[#06030D] px-2 py-0.5 rounded-[2px] border border-red-900/50">
            {report.criticalCount} {isTr ? 'Kritik' : 'Critical'}
          </span>
          <span className="text-amber-400 bg-[#06030D] px-2 py-0.5 rounded-[2px] border border-amber-900/50">
            {report.highCount} {isTr ? 'Yüksek' : 'High'}
          </span>
          <span className="text-[#C084FC] bg-[#06030D] px-2 py-0.5 rounded-[2px] border border-[#2B1A42]">
            {report.mediumCount} {isTr ? 'Orta' : 'Medium'}
          </span>
          <span className="text-emerald-400 bg-[#06030D] px-2 py-0.5 rounded-[2px] border border-emerald-900/50 ml-auto">
            ✓ {report.passedChecks} {isTr ? 'Geçti' : 'Passed'}
          </span>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-2.5">
        {report.issues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center rounded-[2px] border border-[#2B1A42] bg-[#0D0719] p-6 shadow-xl">
            <CheckCircle2 className="h-10 w-10 text-emerald-400 mb-3" />
            <h4 className="text-sm font-bold text-[#F5F3FF]">
              {isTr ? 'Mimariniz Güvenli ve Temiz!' : 'Your Architecture is Secure!'}
            </h4>
            <p className="text-xs text-[#A19BAF] mt-1 max-w-xs">
              {isTr
                ? 'Varsayılan şifreler, açık veritabanı portları ve restart politikaları kontrol edildi.'
                : 'Default passwords, exposed database ports, and restart policies verified.'}
            </p>
          </div>
        ) : (
          report.issues.map((issue) => (
            <div
              key={issue.id}
              className={cn(
                'rounded-[2px] border border-[#2B1A42] p-4 transition-all flex items-start justify-between gap-3 shadow-md',
                issue.severity === 'CRITICAL'
                  ? 'bg-red-950/20 border-red-500/40'
                  : issue.severity === 'HIGH'
                  ? 'bg-amber-950/20 border-amber-500/40'
                  : 'bg-[#0D0719]'
              )}
            >
              <div className="flex items-start gap-2.5">
                <div
                  className={cn(
                    'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[2px] border',
                    issue.severity === 'CRITICAL'
                      ? 'border-red-500/40 bg-red-500/10 text-red-400'
                      : issue.severity === 'HIGH'
                      ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                      : 'border-[#2B1A42] bg-[#120A21] text-[#C084FC]'
                  )}
                >
                  {issue.category === 'password' ? (
                    <KeyRound className="h-3.5 w-3.5" />
                  ) : issue.category === 'port' ? (
                    <Network className="h-3.5 w-3.5" />
                  ) : issue.category === 'restart' ? (
                    <RefreshCw className="h-3.5 w-3.5" />
                  ) : (
                    <Lock className="h-3.5 w-3.5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#F5F3FF]">{issue.title}</span>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-[2px] bg-[#120A21] border border-[#2B1A42] text-[#8B7D9E]">
                      {issue.moduleName}
                    </span>
                  </div>
                  <p className="text-xs text-[#A19BAF] mt-1 leading-relaxed">{issue.description}</p>
                </div>
              </div>

              {issue.canAutoFix && (
                <button
                  onClick={() => handleFixIssue(issue)}
                  className="rounded-[2px] border border-[#2B1A42] bg-[#120A21] hover:border-[#8B5CF6] text-[#C084FC] hover:text-[#F5F3FF] px-3 py-1.5 text-xs font-mono font-bold transition-all active:scale-95 shrink-0 ml-2"
                >
                  {isTr ? 'Düzelt' : 'Fix'}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
