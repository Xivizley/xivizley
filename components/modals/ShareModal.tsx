'use client';

import React, { useState } from 'react';
import {
  X,
  Share2,
  Download,
  Copy,
  Check,
  Send,
  MessageSquare,
  Sparkles,
  Link2,
  Layers,
  Image as ImageIcon,
  Code2,
  MonitorPlay,
} from 'lucide-react';
import { useArchitectStore } from '@/store/useArchitectStore';
import { exportCanvasAsPng } from '@/lib/utils/exportCanvasImage';
import { InstagramIcon } from '@/components/modals/StoryCardModal';
import { useI18nStore } from '@/lib/i18n/store';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenStoryCard?: (() => void) | undefined;
  onToast?: ((type: 'success' | 'error' | 'info', title: string, desc?: string) => void) | undefined;
}

export function ShareModal({ isOpen, onClose, onOpenStoryCard, onToast }: ShareModalProps) {
  const lang = useI18nStore((s) => s.lang);
  const isTr = lang === 'tr';
  const isPt = lang === 'pt';

  const nodes = useArchitectStore((s) => s.nodes);
  const exportToJson = useArchitectStore((s) => s.exportToJson);

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [copiedBadge, setCopiedBadge] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  // Generate Share URL
  const getShareUrl = () => {
    try {
      const json = exportToJson();
      const base64 = btoa(unescape(encodeURIComponent(json)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
      return typeof window !== 'undefined'
        ? `${window.location.origin}/architect?canvas=${base64}`
        : `https://xivizley.com.tr/architect?canvas=${base64}`;
    } catch {
      return 'https://xivizley.com.tr/architect';
    }
  };

  const handleCopyEmbed = async () => {
    try {
      const json = exportToJson();
      const base64 = btoa(unescape(encodeURIComponent(json)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://xivizley.com.tr';
      const iframeCode = `<iframe src="${origin}/embed?canvas=${base64}" width="100%" height="520px" frameborder="0" style="border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); background: #08090e;" title="XIVIZLEY Architecture"></iframe>`;
      await navigator.clipboard.writeText(iframeCode);
      setCopiedEmbed(true);
      onToast?.(
        'success',
        isTr ? 'İnteraktif Embed Kodu Kopyalandı! 💻' : isPt ? 'Código Embed Copiado! 💻' : 'Interactive Embed Code Copied! 💻',
        isTr
          ? 'Blog, Notion ve dokümantasyon sayfalarınıza ekleyebileceğiniz iframe kodu panoya kopyalandı.'
          : isPt
          ? 'Código <iframe> pronto para incorporar em blogs, Notion e documentação.'
          : 'Iframe code ready to embed into blogs, Notion, and documentation sites.'
      );
      setTimeout(() => setCopiedEmbed(false), 2500);
    } catch {
      onToast?.(
        'error',
        isTr ? 'Hata' : isPt ? 'Erro' : 'Error',
        isTr ? 'Kod oluşturulamadı.' : isPt ? 'Falha ao gerar código.' : 'Failed to generate code.'
      );
    }
  };

  const handleCopyLink = async () => {
    const url = getShareUrl();
    await navigator.clipboard.writeText(url);
    setCopiedLink(true);
    onToast?.(
      'success',
      isTr ? 'Bağlantı Kopyalandı! 🔗' : isPt ? 'Link Copiado! 🔗' : 'Link Copied! 🔗',
      isTr
        ? 'Mimari paylaşım bağlantısı panoya kopyalandı.'
        : isPt
        ? 'Link de compartilhamento copiado para a área de transferência.'
        : 'Architecture share link copied to clipboard.'
    );
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyMarkdown = async () => {
    const serviceList = nodes.map((n) => `- **${n.data.label}** (\`${n.data.moduleId}\`)`).join('\n');
    const md = isTr
      ? `### 🚀 XIVIZLEY ile Tasarladığım Sunucu Mimarisi\n\n**Düğüm Sayısı:** ${nodes.length}\n\n**Dahil Olan Servisler:**\n${serviceList}\n\n👉 **Mimariyi Tuvalde Aç & İncele:** [XIVIZLEY Sunucu Mimarı](${getShareUrl()})`
      : isPt
      ? `### 🚀 Arquitetura de Servidor Criada com XIVIZLEY\n\n**Total de Nós:** ${nodes.length}\n\n**Serviços Incluídos:**\n${serviceList}\n\n👉 **Abrir & Explorar no Canvas:** [XIVIZLEY Architecture Studio](${getShareUrl()})`
      : `### 🚀 Server Architecture Designed with XIVIZLEY\n\n**Node Count:** ${nodes.length}\n\n**Included Services:**\n${serviceList}\n\n👉 **Open & Explore on Canvas:** [XIVIZLEY Architecture Studio](${getShareUrl()})`;
    await navigator.clipboard.writeText(md);
    setCopiedMarkdown(true);
    onToast?.(
      'success',
      isTr ? 'Markdown Kopyalandı! 📋' : isPt ? 'Markdown Copiado! 📋' : 'Markdown Copied! 📋',
      isTr
        ? 'Discord ve Reddit için biçimlendirilmiş metin hazır.'
        : isPt
        ? 'Texto formatado pronto para Discord e Reddit.'
        : 'Formatted text ready for Discord and Reddit.'
    );
    setTimeout(() => setCopiedMarkdown(false), 2500);
  };

  const handleCopyBadge = async () => {
    const url = getShareUrl();
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://xivizley.com.tr';
    const statusText = nodes.length > 0 ? `${nodes.length} Services` : 'Deploy Stack';
    const badgeMarkdown = `[![Deploy with XIVIZLEY](${origin}/api/badge/deploy?status=${encodeURIComponent(statusText)})](${url})`;
    await navigator.clipboard.writeText(badgeMarkdown);
    setCopiedBadge(true);
    onToast?.(
      'success',
      isTr ? 'GitHub Rozeti Kopyalandı! 🛡️' : isPt ? 'Badge do GitHub Copiado! 🛡️' : 'GitHub Badge Copied! 🛡️',
      isTr
        ? 'README.md dosyanıza yapıştırabileceğiniz Markdown kodu hazır.'
        : isPt
        ? 'Código Markdown pronto para colar no seu README.md.'
        : 'Markdown snippet ready to paste into your README.md.'
    );
    setTimeout(() => setCopiedBadge(false), 2500);
  };

  const handleTwitterShare = () => {
    const url = getShareUrl();
    const text = encodeURIComponent(
      isTr
        ? `Kendi Self-Host ve Sunucu mimarimi @xivizley ile görsel olarak tasarladım! 🚀🛠️\n\nŞemayı incelemek ve 1-tıkla VDS'e kurmak için:`
        : isPt
        ? `Desenhei visualmente minha arquitetura de servidor com @xivizley! 🚀🛠️\n\nVeja o diagrama e implante em 1-clique:`
        : `I visually designed my self-host server architecture using @xivizley! 🚀🛠️\n\nExplore the diagram and deploy with 1-click:`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const handleDownloadPng = async () => {
    if (nodes.length === 0) {
      onToast?.(
        'error',
        isTr ? 'Tuval Boş' : isPt ? 'Canvas Vazio' : 'Empty Canvas',
        isTr ? 'Görsel indirmek için en az bir modül ekleyin.' : isPt ? 'Adicione pelo menos um módulo para baixar a imagem.' : 'Add at least one module to download image.'
      );
      return;
    }
    setIsExporting(true);
    try {
      await exportCanvasAsPng();
      onToast?.(
        'success',
        isTr ? 'Görsel İndirildi! 🖼️' : isPt ? 'Imagem Baixada! 🖼️' : 'Image Downloaded! 🖼️',
        isTr ? 'Yüksek çözünürlüklü mimari şemanız kaydedildi.' : isPt ? 'Seu diagrama de alta resolução foi salvo.' : 'Your high-resolution architecture diagram was saved.'
      );
    } catch {
      onToast?.('error', isTr ? 'Hata' : isPt ? 'Erro' : 'Error', isTr ? 'Görsel oluşturulurken bir problem yaşandı.' : isPt ? 'Ocorreu um erro ao gerar a imagem.' : 'An error occurred while generating the image.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-cyan-500/40 bg-slate-950 shadow-2xl p-6 md:p-8 overflow-hidden text-slate-100">
        
        {/* Glow background */}
        <div className="absolute -top-32 -right-32 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center max-w-md mx-auto mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-3 shadow-lg shadow-cyan-500/10">
            <Share2 className="h-3.5 w-3.5 text-cyan-400" />
            <span>{isTr ? 'PAYLAŞ & DIŞA AKTAR STÜDYOSU' : isPt ? 'ESTÚDIO DE COMPARTILHAMENTO' : 'SHARE & EXPORT STUDIO'}</span>
          </div>

          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-white">
            {isTr ? 'Mimarini Dünyayla Paylaş' : isPt ? 'Compartilhe sua Arquitetura' : 'Share Your Architecture'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isTr
              ? 'Tasarladığın sunucu şemasını 4K görsel olarak kaydet veya tek tıkla topluluklarda paylaş.'
              : isPt
              ? 'Salve o diagrama como imagem 4K ou compartilhe com a comunidade em 1 clique.'
              : 'Save your architecture diagram as a 4K image or share with communities in 1 click.'}
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center justify-center gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 mb-5 text-xs text-slate-300 font-mono">
          <span className="flex items-center gap-1">
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
            <strong>{nodes.length}</strong> {isTr ? 'Modül' : isPt ? 'Módulos' : 'Modules'}
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-emerald-400">
            {isTr ? '⚡ 1-Tıkla İçe Aktarılabilir' : isPt ? '⚡ Importável em 1-Clique' : '⚡ 1-Click Importable'}
          </span>
        </div>

        {/* Export Actions Grid */}
        <div className="space-y-3">
          {/* 0. 9:16 Viral Instagram Story Card */}
          {onOpenStoryCard && (
            <button
              onClick={() => {
                onClose();
                onOpenStoryCard();
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-pink-500/50 bg-gradient-to-r from-pink-950/50 via-purple-950/40 to-cyan-950/30 hover:border-pink-400 hover:bg-pink-900/40 transition-all group active:scale-98 shadow-lg shadow-pink-500/10"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400 group-hover:scale-110 transition-transform">
                  <InstagramIcon className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-extrabold text-pink-200 group-hover:text-white transition-colors">
                      {isTr ? '📸 Instagram Story Kartı (9:16)' : isPt ? '📸 Story do Instagram (9:16)' : '📸 Instagram Story Card (9:16)'}
                    </h4>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-pink-500/20 text-pink-300 font-bold border border-pink-500/40">
                      VIRAL
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300">
                    {isTr ? 'Spotify Wrapped tarzı kimlik kartını oluştur & indir' : isPt ? 'Crie seu cartão estilo Spotify Wrapped & baixe' : 'Create & download Spotify Wrapped style identity card'}
                  </p>
                </div>
              </div>
              <Sparkles className="h-4 w-4 text-pink-400 group-hover:text-pink-300 transition-colors animate-pulse" />
            </button>
          )}

          {/* 1. Download PNG */}
          <button
            onClick={handleDownloadPng}
            disabled={isExporting || nodes.length === 0}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/40 to-blue-950/30 hover:border-cyan-400 hover:bg-cyan-900/40 transition-all group active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform">
                <ImageIcon className="h-4 w-4" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                  {isTr ? '4K Kristal PNG Görseli İndir' : isPt ? 'Baixar Imagem PNG 4K Cristal' : 'Download 4K Crystal PNG'}
                </h4>
                <p className="text-[10px] text-slate-400">
                  {isTr ? 'Filigranlı ve yüksek çözünürlüklü şema' : isPt ? 'Diagrama de alta resolução com marca d\'água' : 'High-resolution diagram with watermark'}
                </p>
              </div>
            </div>
            <Download className="h-4 w-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
          </button>

          {/* 2. Twitter / X Share */}
          <button
            onClick={handleTwitterShare}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-sky-500/50 hover:bg-sky-950/30 transition-all group active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 group-hover:scale-110 transition-transform">
                <Send className="h-4 w-4" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold text-slate-100 group-hover:text-sky-300 transition-colors">
                  {isTr ? "Twitter / X'te Paylaş" : isPt ? 'Compartilhar no Twitter / X' : 'Share on Twitter / X'}
                </h4>
                <p className="text-[10px] text-slate-400">
                  {isTr ? 'Topluluğa ve geliştiricilere göster' : isPt ? 'Mostre para a comunidade e desenvolvedores' : 'Show off to the community and developers'}
                </p>
              </div>
            </div>
            <Share2 className="h-4 w-4 text-slate-400 group-hover:text-sky-400 transition-colors" />
          </button>

          {/* 3. Discord & Reddit Markdown */}
          <button
            onClick={handleCopyMarkdown}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-indigo-500/50 hover:bg-indigo-950/30 transition-all group active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                  {isTr ? 'Discord & Reddit için Kopyala' : isPt ? 'Copiar para Discord & Reddit' : 'Copy for Discord & Reddit'}
                </h4>
                <p className="text-[10px] text-slate-400">
                  {isTr ? 'Tablo ve biçimlendirilmiş Markdown metni' : isPt ? 'Tabela e texto formatado em Markdown' : 'Table and formatted Markdown text'}
                </p>
              </div>
            </div>
            {copiedMarkdown ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
            )}
          </button>

          {/* 4. Copy Permanent Link */}
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/50 hover:bg-emerald-950/30 transition-all group active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                <Link2 className="h-4 w-4" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                  {isTr ? 'Kalıcı Tuval Bağlantısını Kopyala' : isPt ? 'Copiar Link Permanente do Canvas' : 'Copy Permanent Canvas Link'}
                </h4>
                <p className="text-[10px] text-slate-400">
                  {isTr ? 'Arkadaşının doğrudan tuvalinde açmasını sağla' : isPt ? 'Permita que seus amigos abram diretamente no canvas deles' : 'Let your friends open directly on their canvas'}
                </p>
              </div>
            </div>
            {copiedLink ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
            )}
          </button>

          {/* 5. Copy GitHub README Badge */}
          <button
            onClick={handleCopyBadge}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-cyan-500/50 hover:bg-cyan-950/30 transition-all group active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform">
                <Code2 className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {isTr ? 'GitHub README Rozetini Kopyala' : isPt ? 'Copiar Badge para GitHub README' : 'Copy GitHub README Badge'}
                  </h4>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40">
                    SVG
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {isTr
                    ? '1-Tıkla kurulum sağlayan dinamik GitHub Markdown rozeti'
                    : isPt
                    ? 'Badge dinâmico em Markdown para implantação em 1 clique'
                    : 'Dynamic 1-click deploy Markdown badge for open source repos'}
                </p>
              </div>
            </div>
            {copiedBadge ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            )}
          </button>

          {/* 6. Copy Interactive Embed Code (iframe) */}
          <button
            onClick={handleCopyEmbed}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-indigo-500/50 hover:bg-indigo-950/30 transition-all group active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform">
                <MonitorPlay className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                    {isTr ? 'İnteraktif Tuval Embed Kodu' : isPt ? 'Código Embed do Canvas' : 'Interactive Canvas Embed Code'}
                  </h4>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/40">
                    &lt;iframe&gt;
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {isTr
                    ? "Blog, Notion ve dokümantasyonlar için canlı, gezilebilir mimari widget'ı"
                    : isPt
                    ? 'Widget interativo para blogs, Notion e documentação técnica'
                    : 'Live, interactive architecture widget for blogs, Notion, and docs'}
                </p>
              </div>
            </div>
            {copiedEmbed ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
