'use client';

// ============================================================
// XIVIZLEY — Output & Inspector Panel (Production Grade)
// components/output/OutputPanel.tsx
// ============================================================

import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useArchitectStore, selectSelectedNode } from '@/store/useArchitectStore';
import { generateCode } from '@/lib/generators/composeGenerator';
import { generateVdsDeployScript, generateDeploymentReadme } from '@/lib/generators/deploymentGenerator';
import { generateEnvFile } from '@/lib/generators/envGenerator';
import { generateSecurePassword } from '@/lib/utils/passwordGenerator';
import { MODULE_CATALOG, MINECRAFT_PLUGINS, FIVEM_PLUGINS, FIVEM_PLUGIN_PACKS } from '@/lib/data/modules';
import {
  Copy, Check, Download, ChevronRight, ChevronLeft,
  Terminal, FileCode2, Settings2, X, Rocket, Braces,
  ShieldCheck, Eye, EyeOff, Sparkles, Key, FileText,
  Shield, Package, Globe, Archive, Boxes, Mail, Send,
} from 'lucide-react';
import { useTranslation, useI18nStore } from '@/lib/i18n/store';
import { SecurityAuditTab } from './SecurityAuditTab';
import { BackupStudioTab } from './BackupStudioTab';
import { downloadProjectZip } from '@/lib/generators/zipGenerator';
import { generateCaddyfile, generateNginxConf } from '@/lib/generators/proxyGenerator';
import { exportToDockerRunCLI, exportToKubernetesYAML, exportToAnsiblePlaybook } from '@/lib/utils/multiFormatExporter';
import { MinecraftConfigStudio } from './MinecraftConfigStudio';
import { TurnstileWidget } from '@/components/shared/TurnstileWidget';

// ─── Copy Button ─────────────────────────────────────────────

function CopyButton({ text, label }: { text: string; label?: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={copy}
      className={cn(
        'flex items-center gap-1.5 rounded-[2px] border px-2.5 py-1.5 text-xs font-mono font-medium transition-all',
        copied
          ? 'border-emerald-500/60 bg-emerald-950/40 text-emerald-400'
          : 'border-[#2B1A42] bg-[#120A21] text-[#A19BAF] hover:text-[#F5F3FF] hover:border-[#8B5CF6]',
      )}
      aria-label={label || t('common.copyToClipboard')}
      title={label || t('common.copyToClipboard')}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? t('common.copied') : label || t('common.copy')}
    </button>
  );
}

// ─── Download Button ─────────────────────────────────────────

function DownloadButton({ text, filename }: { text: string; filename: string }) {
  const { t } = useTranslation();
  const download = useCallback(() => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [text, filename]);

  return (
    <button
      onClick={download}
      className="flex items-center gap-1.5 rounded-[2px] border border-[#2B1A42] bg-[#120A21] px-2.5 py-1.5 text-xs font-mono font-medium text-[#A19BAF] hover:text-[#F5F3FF] hover:border-[#8B5CF6] transition-all"
      aria-label={`${filename} ${t('common.downloadFile')}`}
    >
      <Download className="h-3.5 w-3.5" />
      {filename}
    </button>
  );
}

// ─── Code Block ──────────────────────────────────────────────

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="overflow-auto rounded-[2px] border border-[#2B1A42] bg-[#06030D] p-4 text-[11px] font-mono leading-relaxed text-[#C4B5FD] max-h-[340px] scrollbar-thin scrollbar-thumb-[#2B1A42] scrollbar-track-transparent">
      {code.split('\n').map((line, i) => {
        if (line.trimStart().startsWith('#')) {
          return (
            <span key={i} className="block text-[#8B7D9E]/70">
              {line}
            </span>
          );
        }
        const colonIdx = line.indexOf(':');
        if (colonIdx > 0 && !line.trimStart().startsWith('-')) {
          const key = line.slice(0, colonIdx + 1);
          const value = line.slice(colonIdx + 1);
          return (
            <span key={i} className="block">
              <span className="text-[#C084FC] font-medium">{key}</span>
              <span className="text-[#F5F3FF]">{value}</span>
            </span>
          );
        }
        if (line.trimStart().startsWith('-')) {
          return (
            <span key={i} className="block text-[#A78BFA]">
              {line}
            </span>
          );
        }
        return (
          <span key={i} className="block">
            {line}
          </span>
        );
      })}
    </pre>
  );
}

// ─── Email Export Card ───────────────────────────────────────

function EmailExportCard({
  dockerCompose,
  deployScript,
  nodeNames,
}: {
  dockerCompose: string;
  deployScript?: string;
  nodeNames: string[];
}) {
  const lang = useI18nStore((s) => s.lang);
  const isTr = lang === 'tr';
  const isPt = lang === 'pt';
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string>('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nodeNames.length === 0) {
      setStatus('error');
      setMessage(
        isTr
          ? 'Lütfen önce tuvale en az bir modül ekleyin.'
          : isPt
          ? 'Adicione pelo menos um módulo ao canvas primeiro.'
          : 'Please add at least one module to the canvas first.'
      );
      return;
    }
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage(
        isTr
          ? 'Lütfen geçerli bir e-posta adresi girin.'
          : isPt
          ? 'Por favor insira um e-mail válido.'
          : 'Please enter a valid email address.'
      );
      return;
    }
    setLoading(true);
    setStatus('idle');
    try {
      const res = await fetch('/api/export/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          composeYaml: dockerCompose,
          deployScript,
          moduleNames: nodeNames,
          canvasUrl: typeof window !== 'undefined' ? window.location.href : undefined,
          turnstileToken,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || (isTr ? 'Gönderilemedi' : isPt ? 'Falha ao enviar' : 'Failed to send'));
      setStatus('success');
      setMessage(data.message || (isTr ? 'E-posta başarıyla gönderildi!' : isPt ? 'E-mail enviado com sucesso!' : 'Email sent successfully!'));
      setTurnstileToken('');
    } catch (err: unknown) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : (isTr ? 'Bir hata oluştu' : isPt ? 'Ocorreu um erro' : 'An error occurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[2px] border border-[#2B1A42] bg-[#120A21] p-3 shadow-lg">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-[2px] border border-[#2B1A42] bg-[#06030D] text-[#C084FC]">
          <Mail className="h-4 w-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-[#F5F3FF]">
            {isTr ? 'Mimarimi E-postama Gönder' : isPt ? 'Enviar Arquitetura por E-mail' : 'Email My Architecture'}
          </h4>
          <p className="text-[10px] text-[#A19BAF]">
            {isTr
              ? 'Compose & tek tık kurulum rehberi gelen kutuna gelsin.'
              : isPt
              ? 'Receba o Compose e guia de 1 clique na sua caixa de entrada.'
              : 'Get Compose & 1-click install guide in your inbox.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSend} className="space-y-2">
        <div className="flex gap-1.5">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ornek@domain.com"
            className="flex-1 rounded-[2px] border border-[#2B1A42] bg-[#06030D] px-2.5 py-1.5 text-xs text-[#F5F3FF] placeholder-[#8B7D9E] font-mono focus:border-[#8B5CF6] focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1 rounded-[2px] bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 px-3 py-1.5 text-xs font-mono font-bold text-white shadow-md transition-all"
          >
            {loading ? (
              <span>...</span>
            ) : (
              <>
                <span>{isTr ? 'Gönder' : isPt ? 'Enviar' : 'Send'}</span>
                <Send className="h-3 w-3" />
              </>
            )}
          </button>
        </div>
        <TurnstileWidget
          onSuccess={(token) => setTurnstileToken(token)}
          onError={() => setTurnstileToken('')}
          onExpire={() => setTurnstileToken('')}
          size="flexible"
          theme="dark"
          className="my-1"
        />
        {status === 'success' && (
          <p className="text-[11px] font-mono font-medium text-emerald-400">✓ {message}</p>
        )}
        {status === 'error' && (
          <p className="text-[11px] font-mono font-medium text-red-400">⚠️ {message}</p>
        )}
      </form>
    </div>
  );
}

// ─── Node Configure Panel ─────────────────────────────────────

function NodeConfigPanel() {
  const { t } = useTranslation();
  const lang = useI18nStore((s) => s.lang);
  const isTr = lang === 'tr';
  const isPt = lang === 'pt';
  const selectedNode = useArchitectStore(selectSelectedNode);
  const updatePortOverride = useArchitectStore((s) => s.updatePortOverride);
  const updateEnvOverride = useArchitectStore((s) => s.updateEnvOverride);
  const updateNodeLabel = useArchitectStore((s) => s.updateNodeLabel);
  const updateAdvancedSetting = useArchitectStore((s) => s.updateAdvancedSetting);
  const togglePlugin = useArchitectStore((s) => s.togglePlugin);
  const setNodePlugins = useArchitectStore((s) => s.setNodePlugins);
  const removeNode = useArchitectStore((s) => s.removeNode);

  const selectNode = useArchitectStore((s) => s.selectNode);

  // Password visibility state
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGeneratePassword = (key: string) => {
    if (!selectedNode) return;
    const newPass = generateSecurePassword(18);
    updateEnvOverride(selectedNode.id, key, newPass);
    setShowSecrets((prev) => ({ ...prev, [key]: true }));
  };

  if (!selectedNode) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center text-slate-600">
        <Settings2 className="h-8 w-8 mb-2 opacity-40 text-slate-500" />
        <p className="text-sm font-semibold text-slate-400">{t('architect.inspector.noNodeSelected')}</p>
        <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
          {t('architect.inspector.noNodeDesc')}
        </p>
      </div>
    );
  }

  // Custom Container Configuration
  if (selectedNode.data.isCustom || selectedNode.data.moduleId === 'custom') {
    const updateCustomField = (field: string, value: any) => {
      const { nodes, onNodesChange } = useArchitectStore.getState();
      const updatedNodes = nodes.map((n) => {
        if (n.id === selectedNode.id) {
          return {
            ...n,
            data: {
              ...n.data,
              [field]: value,
            },
          };
        }
        return n;
      });
      useArchitectStore.setState({ nodes: updatedNodes });
    };

    return (
      <div className="p-4 space-y-4 text-[#A19BAF]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2B1A42] pb-3">
          <div>
            <h3 className="text-sm font-semibold text-[#F5F3FF] flex items-center gap-2">
              <span>{selectedNode.data.label || (isTr ? 'Özel Konteyner' : isPt ? 'Container Personalizado' : 'Custom Container')}</span>
              <span className="rounded-[2px] bg-[#1E1235] border border-[#2B1A42] px-1.5 py-0.5 text-[9px] font-mono text-[#C084FC]">
                Custom
              </span>
            </h3>
            <p className="text-[10px] text-[#8B7D9E] font-mono mt-0.5">{selectedNode.id.slice(0, 8)}</p>
          </div>
          <button
            onClick={() => selectNode(null)}
            className="text-[#8B7D9E] hover:text-[#F5F3FF] p-1"
            aria-label={t('common.close')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Display Name */}
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-[#8B7D9E] mb-1">
            {isTr ? 'Görünen Ad' : isPt ? 'Nome de Exibição' : 'Display Name'}
          </label>
          <input
            type="text"
            value={selectedNode.data.label || ''}
            onChange={(e) => updateNodeLabel(selectedNode.id, e.target.value)}
            placeholder={isTr ? 'Örn: Özel Servisim' : isPt ? 'Ex: Meu Serviço' : 'e.g. My Custom API'}
            className="w-full rounded-[2px] border border-[#2B1A42] bg-[#06030D] px-2.5 py-1.5 text-xs text-[#F5F3FF] placeholder-[#8B7D9E] font-mono focus:outline-none focus:border-[#8B5CF6] transition-colors"
          />
        </div>

        {/* Docker Image */}
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-[#8B7D9E] mb-1">
            {isTr ? 'Docker İmajı (Hub / Registry)' : isPt ? 'Imagem Docker (Hub / Registro)' : 'Docker Image (Hub / Registry)'}
          </label>
          <input
            type="text"
            value={selectedNode.data.customImage || ''}
            onChange={(e) => updateCustomField('customImage', e.target.value)}
            placeholder="Örn: alpine:latest veya ghcr.io/org/repo:tag"
            className="w-full rounded-[2px] border border-[#2B1A42] bg-[#06030D] px-2.5 py-1.5 text-xs font-mono text-[#C084FC] placeholder-[#8B7D9E] focus:outline-none focus:border-[#8B5CF6] transition-colors"
          />
        </div>

        {/* Delete */}
        <div className="pt-2 border-t border-[#2B1A42]">
          <button
            onClick={() => removeNode(selectedNode.id)}
            className="w-full rounded-[2px] border border-red-900/60 bg-red-950/20 px-3 py-1.5 text-xs font-mono font-medium text-red-400 hover:bg-red-950/50 hover:border-red-700 transition-colors"
          >
            {t('architect.inspector.removeModule')}
          </button>
        </div>
      </div>
    );
  }

  const moduleDef = MODULE_CATALOG.find((m) => m.id === selectedNode.data.moduleId);
  if (!moduleDef) return null;

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2B1A42] pb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="h-3 w-3 rounded-full shrink-0"
            style={{ background: moduleDef.color }}
            aria-hidden
          />
          <div>
            <h3 className="text-sm font-semibold text-[#F5F3FF]">{selectedNode.data.label}</h3>
            <p className="text-[10px] text-[#8B7D9E] font-mono mt-0.5">
              {moduleDef.dockerImage}:{moduleDef.defaultTag}
            </p>
          </div>
        </div>
        <button
          onClick={() => selectNode(null)}
          className="text-[#8B7D9E] hover:text-[#F5F3FF] p-1"
          aria-label={t('common.close')}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Display name */}
      <div>
        <label
          htmlFor={`label-${selectedNode.id}`}
          className="block text-[10px] font-mono uppercase tracking-widest text-[#8B7D9E] mb-1"
        >
          {t('architect.inspector.displayName')}
        </label>
        <input
          id={`label-${selectedNode.id}`}
          type="text"
          value={selectedNode.data.label}
          onChange={(e) => updateNodeLabel(selectedNode.id, e.target.value)}
          className="w-full rounded-[2px] border border-[#2B1A42] bg-[#06030D] px-2.5 py-1.5 text-xs text-[#F5F3FF] font-mono focus:outline-none focus:border-[#8B5CF6] transition-colors"
        />
      </div>

      {/* Port mappings */}
      {moduleDef.ports.length > 0 && (
        <div>
          <p className="block text-[10px] font-mono uppercase tracking-widest text-[#8B7D9E] mb-2">
            {t('architect.inspector.portMappings')}
          </p>
          <div className="space-y-2">
            {moduleDef.ports.map((portDef) => {
              const currentHostPort =
                selectedNode.data.portOverrides[portDef.internal] ?? portDef.default;
              const hasConflict = selectedNode.data.conflicts.some(
                (c) => c.hostPort === currentHostPort,
              );

              return (
                <div key={portDef.internal} className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[#F5F3FF] font-medium">{portDef.label}</span>
                    <span className="text-[10px] text-[#8B7D9E] ml-1 font-mono">({portDef.protocol || 'tcp'})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={currentHostPort}
                      disabled={portDef.locked}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) {
                          updatePortOverride(selectedNode.id, portDef.internal, val);
                        }
                      }}
                      className={cn(
                        'w-20 rounded-[2px] border px-2 py-1 text-xs font-mono text-center transition-colors',
                        portDef.locked
                          ? 'border-[#2B1A42] bg-[#090514] text-[#8B7D9E]/60 cursor-not-allowed'
                          : hasConflict
                          ? 'border-red-500/80 bg-red-950/40 text-red-300 focus:outline-none focus:ring-1 focus:ring-red-500'
                          : 'border-[#2B1A42] bg-[#06030D] text-[#F5F3FF] focus:outline-none focus:border-[#8B5CF6]',
                      )}
                      aria-label={`${portDef.label} ${t('architect.inspector.hostPortFor')}`}
                    />
                    <span className="text-[10px] text-[#8B7D9E] font-mono">:{portDef.internal}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Environment variables with Secure Password Generator */}
      {moduleDef.environment.length > 0 && (
        <div>
          <p className="block text-[10px] font-mono uppercase tracking-widest text-[#8B7D9E] mb-2">
            {t('architect.inspector.envVars')}
          </p>
          <div className="space-y-2.5">
            {moduleDef.environment.map((envDef) => {
              const value = selectedNode.data.envOverrides[envDef.key] ?? envDef.defaultValue;
              const isVisible = showSecrets[envDef.key];

              return (
                <div key={envDef.key} className="rounded-[2px] bg-[#120A21] border border-[#2B1A42] p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor={`env-${selectedNode.id}-${envDef.key}`}
                      className="flex items-center gap-1 text-[11px] font-mono text-[#C084FC]"
                    >
                      <span>{envDef.key}</span>
                      {envDef.required && (
                        <span className="text-red-500" aria-label={t('architect.inspector.required')}>*</span>
                      )}
                    </label>

                    {envDef.secret && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleGeneratePassword(envDef.key)}
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] text-[10px] font-mono font-semibold bg-[#1E1235] border border-[#2B1A42] text-[#C084FC] hover:border-[#8B5CF6] transition-colors"
                          title={isTr ? 'Rastgele Güçlü Şifre Üret (18 karakter)' : isPt ? 'Gerar Senha Forte Aleatória (18 caracteres)' : 'Generate Strong Password (18 chars)'}
                        >
                          <Sparkles className="h-3 w-3" />
                          <span>{isTr ? 'Şifre Üret' : isPt ? 'Gerar Senha' : 'Generate'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleSecretVisibility(envDef.key)}
                          className="p-1 text-[#8B7D9E] hover:text-[#F5F3FF] transition-colors"
                          title={isVisible ? (isTr ? 'Gizle' : isPt ? 'Ocultar' : 'Hide') : (isTr ? 'Göster' : isPt ? 'Mostrar' : 'Show')}
                        >
                          {isVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </button>
                      </div>
                    )}
                  </div>

                  <input
                    id={`env-${selectedNode.id}-${envDef.key}`}
                    type={envDef.secret && !isVisible ? 'password' : 'text'}
                    value={value}
                    onChange={(e) => updateEnvOverride(selectedNode.id, envDef.key, e.target.value)}
                    placeholder={envDef.defaultValue}
                    className="w-full rounded-[2px] border border-[#2B1A42] bg-[#06030D] px-2.5 py-1 text-xs font-mono text-[#F5F3FF] placeholder-[#8B7D9E] focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  />
                  {envDef.description && (
                    <p className="text-[10px] text-[#8B7D9E] leading-tight">{envDef.description}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Minecraft Plugins (for PaperMC) */}
      {selectedNode.data.moduleId === 'minecraft-paperm' && (
        <div>
          <p className="block text-[10px] font-mono uppercase tracking-widest text-[#8B7D9E] mb-2">
            {isTr ? 'Eklentiler (Plugins)' : isPt ? 'Plugins (Extensões)' : 'Plugins'}
          </p>
          <div className="space-y-1.5">
            {MINECRAFT_PLUGINS.map((plugin) => {
              const isSelected = selectedNode.data.selectedPlugins?.includes(plugin.id);
              return (
                <label
                  key={plugin.id}
                  className="flex cursor-pointer items-start gap-2.5 rounded-[2px] border border-[#2B1A42] bg-[#120A21] p-2 hover:bg-[#1E1235] transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(isSelected)}
                    onChange={() => togglePlugin(selectedNode.id, plugin.id)}
                    className="mt-0.5 h-3.5 w-3.5 rounded-[2px] border-[#2B1A42] bg-[#06030D] accent-[#8B5CF6]"
                  />
                  <div>
                    <p className="text-xs font-semibold text-[#F5F3FF]">{plugin.name}</p>
                    <p className="text-[10px] text-[#8B7D9E] leading-tight mt-0.5">{plugin.description}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* FiveM Plugin Packs & Plugins */}
      {selectedNode.data.moduleId === 'fivem' && (
        <div className="space-y-4 pt-2 border-t border-[#2B1A42]">
          {/* 1-Click Packs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#C084FC]">
                <Sparkles className="h-3.5 w-3.5 text-[#8B5CF6]" />
                {isTr ? 'Hazır Eklenti Paketleri (1-Tık)' : isPt ? 'Pacotes de Plugins Prontos (1-Clique)' : 'Ready Plugin Packs (1-Click)'}
              </p>
              <span className="text-[9px] text-[#8B7D9E] font-mono">1-Click Bundles</span>
            </div>
            <p className="text-[11px] text-[#A19BAF] mb-2.5">
              {isTr
                ? 'Sunucu tipinize uygun eklentileri tek tıkla yükleyin veya aşağıdan tek tek seçin.'
                : isPt
                ? 'Instale plugins adequados para seu servidor com 1 clique ou selecione individualmente abaixo.'
                : 'Install plugins matching your server type with 1 click or pick individually below.'}
            </p>

            <div className="grid grid-cols-1 gap-2">
              {FIVEM_PLUGIN_PACKS.map((pack) => {
                const currentPlugins = selectedNode.data.selectedPlugins || [];
                const isActive = pack.pluginIds.every((id) => currentPlugins.includes(id)) &&
                                 pack.pluginIds.length === currentPlugins.length;

                return (
                  <button
                    key={pack.id}
                    type="button"
                    onClick={() => setNodePlugins(selectedNode.id, pack.pluginIds)}
                    className={cn(
                      'w-full text-left rounded-[2px] p-2.5 transition-all border text-xs',
                      isActive
                        ? 'border-[#8B5CF6] bg-[#1E1235]'
                        : 'border-[#2B1A42] bg-[#120A21] hover:border-[#8B5CF6] hover:bg-[#1E1235]/60'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-[#F5F3FF] flex items-center gap-1.5">
                        <span>{pack.emoji}</span>
                        <span>{pack.name}</span>
                      </span>
                      <span
                        className={cn(
                          'text-[9px] px-1.5 py-0.5 rounded-[2px] font-mono font-medium shrink-0',
                          isActive
                            ? 'bg-[#120A21] text-[#C084FC] border border-[#8B5CF6]'
                            : 'bg-[#06030D] text-[#8B7D9E] border border-[#2B1A42]'
                        )}
                      >
                        {isActive ? (isTr ? '✓ Aktif Paket' : isPt ? '✓ Pacote Ativo' : '✓ Active Pack') : pack.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#A19BAF] mt-1 leading-relaxed">
                      {pack.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {pack.pluginIds.map((pId) => {
                        const pluginDef = FIVEM_PLUGINS.find((p) => p.id === pId);
                        return (
                          <span
                            key={pId}
                            className="rounded-[2px] bg-[#06030D] border border-[#2B1A42] px-1.5 py-0.5 text-[9px] text-[#A19BAF] font-mono"
                          >
                            +{pluginDef?.name.split(' ')[0] || pId}
                          </span>
                        );
                      })}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Individual Plugins List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="block text-[10px] font-mono uppercase tracking-widest text-[#8B7D9E]">
                {isTr ? 'Tüm FiveM Eklentileri & Modları' : isPt ? 'Todos os Plugins e Mods FiveM' : 'All FiveM Plugins & Mods'}
              </p>
              <div className="flex items-center gap-2 font-mono">
                <button
                  type="button"
                  onClick={() => setNodePlugins(selectedNode.id, FIVEM_PLUGINS.map((p) => p.id))}
                  className="text-[10px] text-[#C084FC] hover:text-[#F5F3FF] transition-colors"
                >
                  {isTr ? 'Tümünü Seç' : isPt ? 'Selecionar Todos' : 'Select All'}
                </button>
                <span className="text-[#2B1A42]">|</span>
                <button
                  type="button"
                  onClick={() => setNodePlugins(selectedNode.id, [])}
                  className="text-[10px] text-[#8B7D9E] hover:text-[#A19BAF] transition-colors"
                >
                  {isTr ? 'Temizle' : isPt ? 'Limpar' : 'Clear'}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              {FIVEM_PLUGINS.map((plugin) => {
                const isSelected = selectedNode.data.selectedPlugins?.includes(plugin.id);
                return (
                  <label
                    key={plugin.id}
                    className={cn(
                      'flex cursor-pointer items-start gap-2.5 rounded-[2px] border p-2 transition-colors',
                      isSelected
                        ? 'border-[#8B5CF6] bg-[#1E1235]'
                        : 'border-[#2B1A42] bg-[#120A21] hover:bg-[#1E1235]/60'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(isSelected)}
                      onChange={() => togglePlugin(selectedNode.id, plugin.id)}
                      className="mt-0.5 h-3.5 w-3.5 rounded-[2px] border-[#2B1A42] bg-[#06030D] accent-[#8B5CF6]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <p className="text-xs font-semibold text-[#F5F3FF] truncate">{plugin.name}</p>
                        <span className="shrink-0 rounded-[2px] bg-[#06030D] border border-[#2B1A42] px-1.5 py-0.5 text-[9px] text-[#8B7D9E] font-mono">
                          {plugin.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#A19BAF] leading-tight mt-0.5">
                        {plugin.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>

            {selectedNode.data.selectedPlugins?.includes('vmenu') && (
              <div className="mt-2.5 rounded-[2px] border border-emerald-900/40 bg-emerald-950/20 p-2.5 text-[11px] text-emerald-300 font-mono">
                <span className="font-semibold text-emerald-200">
                  {isTr ? '⚡ vMenu Tam Yetki Entegre Edildi:' : isPt ? '⚡ vMenu Permissão Total Integrada:' : '⚡ vMenu Full Admin Integrated:'}
                </span>{' '}
                {isTr
                  ? 'Sunucu kurulduğunda tüm oyuncular için vMenu admin hakları (araç spawn, ışınlanma, modifiye, godmode) açık gelir. Oyunda M veya F2 tuşuyla açabilirsiniz.'
                  : isPt
                  ? 'Direitos de admin do vMenu (spawn de veículos, teleporte, mods, godmode) vêm habilitados. Pressione M ou F2 no jogo.'
                  : 'vMenu admin permissions (vehicle spawn, teleport, tuning, godmode) enabled for all players. Press M or F2 in-game.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {moduleDef.notes.length > 0 && (
        <div className="rounded-[2px] border border-amber-900/40 bg-amber-950/20 p-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-amber-500 mb-1.5">{t('architect.inspector.notes')}</p>
          <ul className="space-y-1">
            {moduleDef.notes.map((note, i) => (
              <li key={i} className="text-[11px] text-amber-300/80 flex gap-1.5 font-mono">
                <span className="shrink-0 text-amber-500">→</span>
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Delete */}
      <div className="pt-2 border-t border-[#2B1A42]">
        <button
          onClick={() => removeNode(selectedNode.id)}
          className="w-full rounded-[2px] border border-red-900/60 bg-red-950/20 px-3 py-1.5 text-xs font-mono font-medium text-red-400 hover:bg-red-950/50 hover:border-red-700 transition-colors"
        >
          {t('architect.inspector.removeModule')}
        </button>
      </div>
    </div>
  );
}

// ─── Output Panel ─────────────────────────────────────────────

type Tab = 'compose' | 'env' | 'bash' | 'proxy' | 'security' | 'backup' | 'configure' | 'json' | 'multiexport';

interface OutputPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  onOpenDeploy?: () => void;
  conflictCount?: number;
}

export function OutputPanel({ isOpen, onToggle, onOpenDeploy }: OutputPanelProps) {
  const { t } = useTranslation();
  const lang = useI18nStore((s) => s.lang);
  const isTr = lang === 'tr';
  const isPt = lang === 'pt';
  const nodes = useArchitectStore((s) => s.nodes);
  const edges = useArchitectStore((s) => s.edges);
  const conflictCount = useArchitectStore((s) => s.conflictMap.size);
  const selectedNodeId = useArchitectStore((s) => s.selectedNodeId);
  const [activeTab, setActiveTab] = useState<Tab>(
    selectedNodeId ? 'configure' : 'compose',
  );
  
  const [jsonImportText, setJsonImportText] = React.useState('');
  const [jsonImportError, setJsonImportError] = React.useState<string | null>(null);
  const [jsonImportSuccess, setJsonImportSuccess] = React.useState(false);
  const loadFromJson = useArchitectStore((s) => s.loadFromJson);
  const exportToJson = useArchitectStore((s) => s.exportToJson);

  const [prevSelectedNodeId, setPrevSelectedNodeId] = useState(selectedNodeId);
  if (selectedNodeId !== prevSelectedNodeId) {
    setPrevSelectedNodeId(selectedNodeId);
    if (selectedNodeId) {
      setActiveTab('configure');
    }
  }

  const [proxyDomain, setProxyDomain] = useState('homelab.local');
  const [proxyType, setProxyType] = useState<'caddy' | 'nginx'>('caddy');

  const caddyConfig = useMemo(
    () => generateCaddyfile(nodes, proxyDomain),
    [nodes, proxyDomain]
  );

  const nginxConfig = useMemo(
    () => generateNginxConf(nodes, proxyDomain),
    [nodes, proxyDomain]
  );

  const { dockerCompose } = useMemo(
    () => generateCode(nodes, edges),
    [nodes, edges],
  );

  const envContent = useMemo(
    () => generateEnvFile(nodes),
    [nodes]
  );

  const deployScript = useMemo(
    () => generateVdsDeployScript(nodes, edges),
    [nodes, edges]
  );

  const [multiFormat, setMultiFormat] = useState<'docker-run' | 'k8s' | 'ansible'>('docker-run');
  const dockerRunCode = useMemo(() => exportToDockerRunCLI(nodes), [nodes]);
  const k8sCode = useMemo(() => exportToKubernetesYAML(nodes), [nodes]);
  const ansibleCode = useMemo(() => exportToAnsiblePlaybook(nodes), [nodes]);

  return (
    <div
      className={cn(
        'flex flex-col border-l border-[#2B1A42] bg-[#0D0719]/95 backdrop-blur-md',
        'transition-all duration-300',
        isOpen ? 'w-full sm:w-[340px] lg:w-[380px] xl:w-[410px]' : 'w-10',
      )}
    >
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center border-b border-[#2B1A42] p-2 text-[#8B7D9E] hover:text-[#C084FC] transition-colors shrink-0"
        aria-label={isOpen ? t('architect.inspector.collapsePanel') : t('architect.inspector.expandPanel')}
      >
        {isOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {isOpen && (
        <>
          {/* Tabs */}
          <div className="flex border-b border-[#2B1A42] shrink-0 overflow-x-auto scrollbar-none bg-[#090514]">
            {(
              [
                { id: 'compose'      as Tab, label: 'Compose',                                             icon: FileCode2 },
                { id: 'multiexport'  as Tab, label: 'K8s & CLI',                                           icon: Boxes },
                { id: 'env'          as Tab, label: '.env',                                                icon: FileText },
                { id: 'bash'         as Tab, label: isTr ? 'Kurulum' : isPt ? 'Instalação' : 'Install',     icon: Terminal },
                { id: 'proxy'        as Tab, label: 'Proxy',                                               icon: Globe },
                { id: 'security'     as Tab, label: isTr ? 'Güvenlik' : isPt ? 'Segurança' : 'Security',   icon: Shield },
                { id: 'backup'       as Tab, label: isTr ? 'Yedek & DR' : isPt ? 'Backup & DR' : 'Backup & DR',       icon: Archive },
                { id: 'configure'    as Tab, label: isTr ? 'Ayarlar' : isPt ? 'Config' : 'Settings',       icon: Settings2 },
                { id: 'json'         as Tab, label: 'JSON',                                                icon: Braces },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5 px-2 py-2.5 text-xs font-semibold whitespace-nowrap transition-all font-mono',
                  activeTab === id
                    ? 'border-b-2 border-[#8B5CF6] text-[#F5F3FF] bg-[#120A21]'
                    : 'border-b-2 border-transparent text-[#8B7D9E] hover:text-[#C084FC]',
                )}
                aria-selected={activeTab === id}
                role="tab"
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#2B1A42]">
            {/* Compose Tab */}
            {activeTab === 'compose' && (
              <div className="p-4 pb-8 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#F5F3FF] font-mono">docker-compose.yml</h3>
                  <div className="flex flex-wrap gap-1.5">
                    <CopyButton text={dockerCompose} />
                    <DownloadButton text={dockerCompose} filename="docker-compose.yml" />
                    <button
                      onClick={() =>
                        downloadProjectZip({
                          composeYaml: dockerCompose,
                          envContent,
                          bashScript: deployScript,
                          nodes,
                        })
                      }
                      className="flex items-center gap-1.5 rounded-[2px] border border-[#2B1A42] bg-[#1E1235] px-2.5 py-1.5 text-xs font-mono font-semibold text-[#C084FC] hover:border-[#8B5CF6] hover:text-[#F5F3FF] transition-all shadow-sm"
                      title={isTr ? 'docker-compose.yml, .env, setup.sh ve README.md dosyalarını tek bir ZIP olarak indir' : isPt ? 'Baixar docker-compose.yml, .env, setup.sh e README.md em um único ZIP' : 'Download docker-compose.yml, .env, setup.sh and README.md as a single ZIP'}
                    >
                      <Package className="h-3.5 w-3.5" />
                      <span>{isTr ? '.ZIP İndir' : isPt ? 'Baixar .ZIP' : 'Download .ZIP'}</span>
                    </button>
                  </div>
                </div>
                {conflictCount > 0 && (
                  <div className="rounded-[2px] border border-red-500/40 bg-red-950/30 px-3 py-2 text-xs font-mono text-red-400">
                    ⚠️ {conflictCount} {t('architect.inspector.conflictWarning')}
                  </div>
                )}
                <EmailExportCard
                  dockerCompose={dockerCompose}
                  deployScript={deployScript}
                  nodeNames={nodes.map((n) => n.data.label)}
                />
                <CodeBlock code={dockerCompose} />

                {/* Recommended Cloud VDS Sponsor Card (OWEB & Hosting.com.tr) */}
                <div className="rounded-[2px] border border-[#2B1A42] bg-[#120A21] p-3.5 shadow-xl">
                  <div className="flex items-center justify-between pb-2 border-b border-[#2B1A42]">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2 w-2 rounded-full bg-[#8B5CF6] animate-pulse" />
                      <h4 className="text-xs font-bold text-[#F5F3FF] flex items-center gap-1.5">
                        <span>{isTr ? 'Önerilen VDS Altyapısı' : isPt ? 'Infraestrutura VDS Recomendada' : 'Recommended Cloud VDS'}</span>
                        <span className="text-[10px] font-normal text-[#C084FC]">({nodes.length} {isTr ? 'Modül' : isPt ? 'Módulos' : 'Modules'})</span>
                      </h4>
                    </div>
                    <span className="rounded-[2px] border border-[#2B1A42] bg-[#06030D] px-2 py-0.5 text-[9px] font-mono font-bold text-[#C084FC]">
                      10 Gbps NVMe
                    </span>
                  </div>

                  <p className="text-[11px] text-[#A19BAF] mt-2 leading-relaxed">
                    {isTr ? (
                      <>Tasarladığın bu mimari için <strong className="text-[#F5F3FF]">{Math.max(2, Math.ceil(nodes.length * 0.75))} GB RAM</strong> ve yüksek disk I/O hızına sahip sunucu önerilir.</>
                    ) : isPt ? (
                      <>Para esta arquitetura, recomenda-se um servidor com <strong className="text-[#F5F3FF]">{Math.max(2, Math.ceil(nodes.length * 0.75))} GB RAM</strong> e alto I/O de disco.</>
                    ) : (
                      <>A server with <strong className="text-[#F5F3FF]">{Math.max(2, Math.ceil(nodes.length * 0.75))} GB RAM</strong> and high disk I/O is recommended for this stack.</>
                    )}
                  </p>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* OWEB Sponsor */}
                    <a
                      href="https://www.oweb.net.tr/aff.php?aff=975"
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="group flex flex-col justify-between rounded-[2px] border border-[#2B1A42] bg-[#0D0719] hover:bg-[#1E1235] p-2.5 transition-all hover:border-[#8B5CF6]"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-[#C084FC]">⚡ OWEB TR Cloud</span>
                          <span className="text-[9px] text-[#8B7D9E] font-mono">10 Gbps</span>
                        </div>
                        <p className="text-[10px] text-[#A19BAF] mt-1 leading-tight">
                          {isTr ? 'Datacenter NVMe SSD, sıfır gecikmeli Türkiye lokasyon.' : isPt ? 'Datacenter NVMe SSD de alta performance e baixa latência.' : 'Datacenter NVMe SSD with ultra-low latency & high bandwidth.'}
                        </p>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between text-[11px] font-bold text-[#C084FC] group-hover:text-[#F5F3FF]">
                        <span>{isTr ? 'Hemen Kirala' : isPt ? 'Alugar Agora' : 'Rent Now'}</span>
                        <span className="text-xs group-hover:translate-x-0.5 transition-transform">↗</span>
                      </div>
                    </a>

                    {/* Hosting.com.tr Sponsor */}
                    <a
                      href="https://www.hosting.com.tr/aff.php?aff=1702"
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="group flex flex-col justify-between rounded-[2px] border border-[#2B1A42] bg-[#0D0719] hover:bg-[#1E1235] p-2.5 transition-all hover:border-[#8B5CF6]"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-[#C084FC]">🚀 Hosting.com.tr</span>
                          <span className="text-[9px] text-[#8B7D9E] font-mono">VDS Ultra</span>
                        </div>
                        <p className="text-[10px] text-[#A19BAF] mt-1 leading-tight">
                          {isTr ? 'Yüksek CPU çekirdeği & tek tıkla Docker hazır şablon.' : isPt ? 'Alto desempenho de CPU e modelo Docker com 1 clique.' : 'High CPU cores & 1-click Docker ready templates.'}
                        </p>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between text-[11px] font-bold text-[#C084FC] group-hover:text-[#F5F3FF]">
                        <span>{isTr ? 'VDS Seç' : isPt ? 'Escolher VDS' : 'Choose VDS'}</span>
                        <span className="text-xs group-hover:translate-x-0.5 transition-transform">↗</span>
                      </div>
                    </a>
                  </div>
                </div>

                {/* Portainer Stack Helper Box */}
                <div className="flex items-center justify-between rounded-[2px] border border-[#2B1A42] bg-[#120A21] p-2.5 text-xs text-[#A19BAF]">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-[#8B5CF6] shrink-0" />
                    <div>
                      <p className="font-semibold text-[#F5F3FF] text-[11px] font-mono">{isTr ? 'Portainer Uyumlu Stack' : isPt ? 'Stack Compatível com Portainer' : 'Portainer-Compatible Stack'}</p>
                      <p className="text-[10px] text-[#8B7D9E]">{isTr ? 'Portainer > Stacks > Add stack içine doğrudan yapıştırılabilir.' : isPt ? 'Pode ser colado diretamente em Portainer > Stacks > Add stack.' : 'Can be pasted directly into Portainer > Stacks > Add stack.'}</p>
                    </div>
                  </div>
                  <CopyButton text={dockerCompose} />
                </div>

                {onOpenDeploy && (
                  <button
                    onClick={onOpenDeploy}
                    className="w-full flex items-center justify-center gap-2 rounded-[2px] bg-[#8B5CF6] hover:bg-[#7C3AED] py-2.5 text-xs font-bold text-white font-mono shadow-md transition-all active:scale-95"
                  >
                    <Rocket className="h-4 w-4" />
                    <span>{isTr ? 'Tek Komutla Sunucuya Kur (Deploy)' : isPt ? 'Instalar no Servidor com 1 Comando (Deploy)' : '1-Command Server Deploy'}</span>
                  </button>
                )}
              </div>
            )}

            {/* Multi-Format Export Tab (K8s, Docker CLI, Ansible) */}
            {activeTab === 'multiexport' && (
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#F5F3FF] font-mono">{isTr ? 'Çoklu Platform Dışa Aktar' : isPt ? 'Exportação Multiplataforma' : 'Multi-Platform Export'}</h3>
                  <div className="flex gap-1">
                    <CopyButton
                      text={
                        multiFormat === 'docker-run'
                          ? dockerRunCode
                          : multiFormat === 'k8s'
                          ? k8sCode
                          : ansibleCode
                      }
                    />
                    <DownloadButton
                      text={
                        multiFormat === 'docker-run'
                          ? dockerRunCode
                          : multiFormat === 'k8s'
                          ? k8sCode
                          : ansibleCode
                      }
                      filename={
                        multiFormat === 'docker-run'
                          ? 'docker-run.sh'
                          : multiFormat === 'k8s'
                          ? 'k8s-manifest.yaml'
                          : 'playbook.yml'
                      }
                    />
                  </div>
                </div>

                {/* Sub format pills */}
                <div className="flex rounded-[2px] bg-[#090514] p-1 border border-[#2B1A42]">
                  <button
                    onClick={() => setMultiFormat('docker-run')}
                    className={cn(
                      'flex-1 rounded-[2px] py-1 text-[11px] font-mono font-semibold transition-all',
                      multiFormat === 'docker-run'
                        ? 'bg-[#8B5CF6] text-white shadow-sm'
                        : 'text-[#8B7D9E] hover:text-[#F5F3FF]'
                    )}
                  >
                    Docker CLI
                  </button>
                  <button
                    onClick={() => setMultiFormat('k8s')}
                    className={cn(
                      'flex-1 rounded-[2px] py-1 text-[11px] font-mono font-semibold transition-all',
                      multiFormat === 'k8s'
                        ? 'bg-[#8B5CF6] text-white shadow-sm'
                        : 'text-[#8B7D9E] hover:text-[#F5F3FF]'
                    )}
                  >
                    Kubernetes
                  </button>
                  <button
                    onClick={() => setMultiFormat('ansible')}
                    className={cn(
                      'flex-1 rounded-[2px] py-1 text-[11px] font-mono font-semibold transition-all',
                      multiFormat === 'ansible'
                        ? 'bg-[#8B5CF6] text-white shadow-sm'
                        : 'text-[#8B7D9E] hover:text-[#F5F3FF]'
                    )}
                  >
                    Ansible
                  </button>
                </div>

                <p className="text-[11px] text-[#8B7D9E] leading-relaxed">
                  {multiFormat === 'docker-run' && (isTr ? 'Docker Compose olmadan her konteyneri tek satırlık terminal komutuyla başlatmak için.' : isPt ? 'Para iniciar cada container com comando de linha única sem Docker Compose.' : 'To run each container with a single-line terminal command without Docker Compose.')}
                  {multiFormat === 'k8s' && (isTr ? 'K3s, MicroK8s veya Kubernetes kümesinde deployment ve service olarak çalıştırmak için.' : isPt ? 'Para executar como deployment e service em clusters K3s, MicroK8s ou Kubernetes.' : 'To run as deployments and services in K3s, MicroK8s, or Kubernetes clusters.')}
                  {multiFormat === 'ansible' && (isTr ? 'Çoklu uzak sunuculara otomatik dağıtım için hazır Ansible Playbook formatı.' : isPt ? 'Formato Ansible Playbook pronto para distribuição automatizada em múltiplos servidores remotos.' : 'Ready Ansible Playbook format for automated deployment to multiple remote servers.')}
                </p>

                <CodeBlock
                  code={
                    multiFormat === 'docker-run'
                      ? dockerRunCode
                      : multiFormat === 'k8s'
                      ? k8sCode
                      : ansibleCode
                  }
                />
              </div>
            )}

            {/* Security Audit Tab */}
            {activeTab === 'security' && <SecurityAuditTab />}

            {/* Backup & Disaster Recovery Studio Tab */}
            {activeTab === 'backup' && <BackupStudioTab />}

            {/* .env Tab */}
            {activeTab === 'env' && (
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#F5F3FF] font-mono">{isTr ? '.env Konfigürasyonu' : isPt ? 'Configuração .env' : '.env Configuration'}</h3>
                  <div className="flex gap-2">
                    <CopyButton text={envContent} />
                    <DownloadButton text={envContent} filename=".env" />
                  </div>
                </div>
                <p className="text-[11px] text-[#8B7D9E]">
                  {isTr ? 'Konteyner ortam değişkenleri ve gizli anahtarlar için otomatik üretilen çevre dosyası.' : isPt ? 'Arquivo de ambiente gerado automaticamente para variáveis de container e chaves secretas.' : 'Auto-generated environment file for container variables and secret keys.'}
                </p>
                <CodeBlock code={envContent} />
              </div>
            )}

            {/* Bash Tab */}
            {activeTab === 'bash' && (
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#F5F3FF] font-mono">deploy.sh (VDS Smart Deploy)</h3>
                  <div className="flex flex-wrap gap-1.5">
                    <CopyButton text={deployScript} />
                    <DownloadButton text={deployScript} filename="deploy.sh" />
                    <DownloadButton text={generateDeploymentReadme(nodes)} filename="README.md" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-[#A19BAF] bg-[#120A21] p-2.5 rounded-[2px] border border-[#2B1A42]">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{isTr ? 'Pre-flight, port çakışma ve Docker sağlık denetimi içerir.' : isPt ? 'Inclui pré-verificações, conflitos de porta e integridade do Docker.' : 'Includes pre-flight checks, port conflict resolution, and Docker health tests.'}</span>
                </div>
                <EmailExportCard
                  dockerCompose={dockerCompose}
                  deployScript={deployScript}
                  nodeNames={nodes.map((n) => n.data.label)}
                />
                <CodeBlock code={deployScript} />
              </div>
            )}

            {/* Proxy Tab */}
            {activeTab === 'proxy' && (
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#F5F3FF] font-mono">{isTr ? 'Reverse Proxy Yönlendirme' : isPt ? 'Roteamento de Reverse Proxy' : 'Reverse Proxy Routing'}</h3>
                  <div className="flex gap-1.5 font-mono">
                    <button
                      onClick={() => setProxyType('caddy')}
                      className={cn(
                        'px-2 py-1 text-xs rounded-[2px] font-medium transition-all',
                        proxyType === 'caddy'
                          ? 'bg-[#1E1235] text-[#C084FC] border border-[#8B5CF6]'
                          : 'border border-[#2B1A42] bg-[#120A21] text-[#8B7D9E] hover:text-[#F5F3FF]'
                      )}
                    >
                      Caddyfile
                    </button>
                    <button
                      onClick={() => setProxyType('nginx')}
                      className={cn(
                        'px-2 py-1 text-xs rounded-[2px] font-medium transition-all',
                        proxyType === 'nginx'
                          ? 'bg-[#1E1235] text-[#C084FC] border border-[#8B5CF6]'
                          : 'border border-[#2B1A42] bg-[#120A21] text-[#8B7D9E] hover:text-[#F5F3FF]'
                      )}
                    >
                      Nginx
                    </button>
                  </div>
                </div>

                {/* Domain input */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[#8B7D9E] mb-1">
                    {isTr ? 'Ana Domain Adresi (Base Domain):' : isPt ? 'Domínio Base:' : 'Base Domain Address:'}
                  </label>
                  <input
                    type="text"
                    value={proxyDomain}
                    onChange={(e) => setProxyDomain(e.target.value)}
                    placeholder={isTr ? 'evim.xyz veya homelab.local' : isPt ? 'meudominio.xyz ou homelab.local' : 'mysite.com or homelab.local'}
                    className="w-full rounded-[2px] border border-[#2B1A42] bg-[#06030D] px-3 py-1.5 text-xs text-[#F5F3FF] font-mono placeholder-[#8B7D9E] focus:border-[#8B5CF6] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-[#8B7D9E]">
                    {proxyType === 'caddy' ? (isTr ? 'Otomatik SSL & HTTP/3 hazır Caddy kuralı.' : isPt ? 'Regra Caddy com SSL automático e HTTP/3.' : 'Auto SSL & HTTP/3 ready Caddy rules.') : (isTr ? 'Standart Nginx proxy bloğu.' : isPt ? 'Bloco proxy Nginx padrão.' : 'Standard Nginx proxy block.')}
                  </span>
                  <div className="flex gap-2">
                    <CopyButton text={proxyType === 'caddy' ? caddyConfig : nginxConfig} />
                    <DownloadButton
                      text={proxyType === 'caddy' ? caddyConfig : nginxConfig}
                      filename={proxyType === 'caddy' ? 'Caddyfile' : 'nginx-xivizley.conf'}
                    />
                  </div>
                </div>

                <CodeBlock code={proxyType === 'caddy' ? caddyConfig : nginxConfig} />
              </div>
            )}

            {/* JSON Tab */}
            {activeTab === 'json' && (
              <div className="p-4 space-y-4">
                {/* Export section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[#F5F3FF] font-mono">Canvas JSON</h3>
                    <CopyButton text={exportToJson()} />
                  </div>
                  <p className="text-[11px] text-[#8B7D9E]">{isTr ? 'Canvas durumunu JSON olarak kaydet veya başkasıyla paylaş.' : isPt ? 'Salve o estado do canvas como JSON ou compartilhe com outros.' : 'Save canvas state as JSON or share with others.'}</p>
                  <CodeBlock code={exportToJson()} />
                </div>

                {/* Divider */}
                <div className="border-t border-[#2B1A42]" />

                {/* Import section */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-[#F5F3FF] font-mono">{isTr ? 'JSON İçe Aktar' : isPt ? 'Importar JSON' : 'Import JSON'}</h3>
                  <p className="text-[11px] text-[#8B7D9E]">{isTr ? 'Daha önce kaydettiğin bir canvas JSON formatını buraya yapıştır.' : isPt ? 'Cole aqui o JSON de um canvas salvo anteriormente.' : 'Paste a previously saved canvas JSON here.'}</p>
                  <textarea
                    value={jsonImportText}
                    onChange={(e) => {
                      setJsonImportText(e.target.value);
                      setJsonImportError(null);
                      setJsonImportSuccess(false);
                    }}
                    placeholder="{\n  &quot;nodes&quot;: [...],\n  &quot;edges&quot;: [...]\n}"
                    rows={6}
                    className="w-full rounded-[2px] border border-[#2B1A42] bg-[#06030D] px-3 py-2.5 text-[11px] font-mono text-[#C4B5FD] placeholder-[#8B7D9E]/60 focus:outline-none focus:border-[#8B5CF6] resize-none scrollbar-thin scrollbar-thumb-[#2B1A42]"
                  />
                  {jsonImportError && (
                    <p className="text-xs font-mono text-red-400">⚠️ {jsonImportError}</p>
                  )}
                  {jsonImportSuccess && (
                    <p className="text-xs font-mono text-emerald-400">{isTr ? '✓ Canvas başarıyla yüklendi!' : isPt ? '✓ Canvas carregado com sucesso!' : '✓ Canvas loaded successfully!'}</p>
                  )}
                  <button
                    onClick={() => {
                      try {
                        JSON.parse(jsonImportText); // validate first
                        loadFromJson(jsonImportText);
                        setJsonImportSuccess(true);
                        setJsonImportError(null);
                        setJsonImportText('');
                      } catch {
                        setJsonImportError(isTr ? 'Geçersiz JSON formatı. Lütfen kontrol edin.' : isPt ? 'Formato JSON inválido. Verifique novamente.' : 'Invalid JSON format. Please verify.');
                      }
                    }}
                    disabled={!jsonImportText.trim()}
                    className="w-full rounded-[2px] bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 text-xs font-mono font-bold text-white transition-all shadow-md active:scale-95"
                  >
                    {isTr ? "Canvas'ı Yükle" : isPt ? "Carregar Canvas" : "Load Canvas"}
                  </button>
                </div>
              </div>
            )}

            {/* Configure Tab */}
            {activeTab === 'configure' && (
              selectedNodeId && nodes.find((n) => n.id === selectedNodeId)?.data.moduleId === 'minecraft-paperm' ? (
                <div className="space-y-4">
                  <MinecraftConfigStudio />
                  <div className="border-t border-[#2B1A42] pt-4">
                    <p className="px-4 text-[10px] uppercase font-bold text-[#8B7D9E] font-mono mb-2">{isTr ? 'Gelişmiş Standart Ayarlar' : isPt ? 'Configurações Padrão Avançadas' : 'Advanced Standard Settings'}</p>
                    <NodeConfigPanel />
                  </div>
                </div>
              ) : (
                <NodeConfigPanel />
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}
