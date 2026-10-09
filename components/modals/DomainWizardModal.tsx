'use client';

import React, { useState, useMemo } from 'react';
import { useArchitectStore } from '@/store/useArchitectStore';
import { MODULE_CATALOG } from '@/lib/data/modules';
import { useI18nStore } from '@/lib/i18n/store';
import { Globe, X, Copy, Check, ShieldCheck, Sparkles, Server, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DomainWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast?: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export function DomainWizardModal({ isOpen, onClose, onToast }: DomainWizardModalProps) {
  const { lang } = useI18nStore();
  const isTr = lang === 'tr';
  const isPt = lang === 'pt';

  const nodes = useArchitectStore((s) => s.nodes);

  // Filter nodes that expose web/HTTP ports
  const targetNodes = useMemo(() => {
    return nodes.filter((node) => {
      const def = MODULE_CATALOG.find((m) => m.id === node.data.moduleId);
      return (def?.ports.length || 0) > 0;
    });
  }, [nodes]);

  const [selectedNodeId, setSelectedNodeId] = useState<string>(targetNodes[0]?.id || '');
  const [domainName, setDomainName] = useState(
    isTr ? 'bulut.orneksite.com' : isPt ? 'nuvem.seusite.com' : 'cloud.example.com'
  );
  const [serverIp, setServerIp] = useState('178.210.168.163');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || targetNodes[0];
  const selectedDef = selectedNode ? MODULE_CATALOG.find((m) => m.id === selectedNode.data.moduleId) : null;
  const primaryPort = selectedNode?.data.portOverrides?.[selectedDef?.ports[0]?.internal || 80] ?? selectedDef?.ports[0]?.default ?? 80;

  // Caddyfile snippet
  const caddySnippet = useMemo(() => {
    const tlsComment = isTr
      ? "# veya Let's Encrypt için otomatik geçerli e-posta"
      : isPt
      ? "# ou e-mail válido para Let's Encrypt automático"
      : "# or valid email for automatic Let's Encrypt";
    return `${domainName} {
    reverse_proxy localhost:${primaryPort}
    tls internal ${tlsComment}
}`;
  }, [domainName, primaryPort, isTr, isPt]);

  // Nginx snippet
  const nginxSnippet = useMemo(() => {
    return `server {
    listen 80;
    server_name ${domainName};
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${domainName};

    # SSL Certificates (Certbot / Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/${domainName}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${domainName}/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:${primaryPort};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}`;
  }, [domainName, primaryPort]);

  const copyToClipboard = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedType(type);
    onToast?.(
      'success',
      isTr ? 'Kopyalandı' : isPt ? 'Copiado' : 'Copied',
      isTr ? 'Panoya başarıyla kopyalandı.' : isPt ? 'Copiado para a área de transferência.' : 'Copied to clipboard successfully.'
    );
    setTimeout(() => setCopiedType(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-800 bg-[#0e111a] shadow-2xl overflow-hidden text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-[#0e111a]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-inner">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                {isTr
                  ? '1-Tıkla Domain & SSL Bağlama Sihirbazı'
                  : isPt
                  ? 'Assistente de Domínio & SSL em 1 Clique'
                  : '1-Click Domain & SSL Wizard'}
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                  Cloudflare & SSL
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {isTr
                  ? 'Self-Host & VDS servislerinize kendi alan adınızı ve ücretsiz HTTPS sertifikanızı bağlayın'
                  : isPt
                  ? 'Conecte seu domínio personalizado e certificado HTTPS gratuito aos seus serviços'
                  : 'Attach your custom domain and free HTTPS certificate to your self-hosted services'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            aria-label={isTr ? 'Kapat' : isPt ? 'Fechar' : 'Close'}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin scrollbar-thumb-slate-700">
          
          {/* Step 1: Select Node & Domain */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isTr
                  ? '1. Yönlendirilecek Servis (Tuvalden)'
                  : isPt
                  ? '1. Serviço de Destino (da Tela)'
                  : '1. Target Service (from Canvas)'}
              </label>
              {targetNodes.length === 0 ? (
                <p className="text-xs text-amber-400">
                  {isTr
                    ? 'Tuvalde portu olan servis bulunamadı.'
                    : isPt
                    ? 'Nenhum serviço com porta encontrado na tela.'
                    : 'No service with exposed port found on canvas.'}
                </p>
              ) : (
                <select
                  value={selectedNodeId}
                  onChange={(e) => setSelectedNodeId(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-[#131724] px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40"
                >
                  {targetNodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.data.label} (Port: {n.data.portOverrides?.[80] || n.data.portOverrides?.[8080] || (isTr ? 'Aktif' : isPt ? 'Ativo' : 'Active')})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isTr
                  ? '2. Bağlanacak Alan Adı (Subdomain)'
                  : isPt
                  ? '2. Nome do Domínio (Subdomínio)'
                  : '2. Domain Name (Subdomain)'}
              </label>
              <input
                type="text"
                value={domainName}
                onChange={(e) => setDomainName(e.target.value)}
                placeholder={isTr ? 'Örn: bulut.domain.com' : isPt ? 'Ex: nuvem.meudominio.com' : 'e.g. cloud.mydomain.com'}
                className="w-full rounded-xl border border-slate-800 bg-[#131724] px-3 py-2 text-xs font-mono text-indigo-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40"
              />
            </div>
          </div>

          {/* Step 2: Cloudflare DNS Guide */}
          <div className="rounded-2xl border border-indigo-500/30 bg-[#131724] p-4 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-indigo-400" />
                {isTr
                  ? 'Cloudflare DNS Ayarı (1. Adım)'
                  : isPt
                  ? 'Configuração de DNS Cloudflare (Passo 1)'
                  : 'Cloudflare DNS Record (Step 1)'}
              </span>
              <span className="text-[10px] text-indigo-400/80">
                {isTr
                  ? 'Turuncu Bulut (Proxied) Açık'
                  : isPt
                  ? 'Nuvem Laranja (Proxied) Ativa'
                  : 'Orange Cloud (Proxied) Enabled'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-[#08090e] border border-slate-800">
                <span className="text-[10px] text-slate-500 block">
                  {isTr ? 'Tür' : isPt ? 'Tipo' : 'Type'}
                </span>
                <span className="text-slate-200 font-bold">A</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#08090e] border border-slate-800">
                <span className="text-[10px] text-slate-500 block">
                  {isTr ? 'İsim (Name)' : isPt ? 'Nome (Name)' : 'Name'}
                </span>
                <span className="text-indigo-300 font-bold truncate block">{domainName.split('.')[0] || '@'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#08090e] border border-slate-800">
                <span className="text-[10px] text-slate-500 block">
                  {isTr ? 'Hedef IPv4 (Sunucu IP)' : isPt ? 'Destino IPv4 (IP Servidor)' : 'IPv4 Target (Server IP)'}
                </span>
                <span className="text-emerald-400 font-bold truncate block">{serverIp}</span>
              </div>
            </div>
          </div>

          {/* Step 3: Caddyfile vs Nginx Configuration */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                {isTr
                  ? 'Otomatik Reverse Proxy Ayarı (Caddyfile):'
                  : isPt
                  ? 'Configuração de Proxy Reverso Automático (Caddyfile):'
                  : 'Automatic Reverse Proxy Config (Caddyfile):'}
              </label>
              <button
                onClick={() => copyToClipboard(caddySnippet, 'caddy')}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                {copiedType === 'caddy' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>
                  {copiedType === 'caddy'
                    ? isTr
                      ? 'Kopyalandı'
                      : isPt
                      ? 'Copiado'
                      : 'Copied'
                    : isTr
                    ? 'Caddyfile Kopyala'
                    : isPt
                    ? 'Copiar Caddyfile'
                    : 'Copy Caddyfile'}
                </span>
              </button>
            </div>
            <pre className="rounded-2xl border border-slate-800 bg-[#08090e] p-3.5 text-[11px] font-mono text-indigo-300 overflow-x-auto shadow-inner">
              {caddySnippet}
            </pre>
          </div>

          {/* Step 4: Nginx Configuration */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                {isTr
                  ? 'Alternatif Nginx Konfigürasyonu (/etc/nginx/sites-available/):'
                  : isPt
                  ? 'Configuração Nginx Alternativa (/etc/nginx/sites-available/):'
                  : 'Alternative Nginx Config (/etc/nginx/sites-available/):'}
              </label>
              <button
                onClick={() => copyToClipboard(nginxSnippet, 'nginx')}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                {copiedType === 'nginx' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>
                  {copiedType === 'nginx'
                    ? isTr
                      ? 'Kopyalandı'
                      : isPt
                      ? 'Copiado'
                      : 'Copied'
                    : isTr
                    ? 'Nginx Conf Kopyala'
                    : isPt
                    ? 'Copiar Nginx Conf'
                    : 'Copy Nginx Conf'}
                </span>
              </button>
            </div>
            <pre className="rounded-2xl border border-slate-800 bg-[#08090e] p-3.5 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-36 scrollbar-thin scrollbar-thumb-slate-700 shadow-inner">
              {nginxSnippet}
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800/80 bg-[#08090e] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:brightness-110 text-xs font-bold text-white shadow-md shadow-indigo-500/20 transition-all active:scale-95"
          >
            {isTr ? 'Tamamla' : isPt ? 'Concluir' : 'Finish'}
          </button>
        </div>

      </div>
    </div>
  );
}
