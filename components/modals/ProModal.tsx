'use client';

// ============================================================
// XIVIZLEY — VIP & Pro License Modal (Obsidian Violet DIN 40719)
// components/modals/ProModal.tsx
// Features 1-Click Viral Share Growth Loop & VDS Free VIP Activation
// ============================================================

import React, { useState } from 'react';
import {
  X,
  Crown,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Bot,
  KeyRound,
  Share2,
  AlertCircle,
  ExternalLink,
  Layers,
  FileText,
} from 'lucide-react';
import { useProStore } from '@/store/useProStore';
import { useI18nStore } from '@/lib/i18n/store';
import { cn } from '@/lib/utils';

export interface ProModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenStoryCard?: () => void;
}

export function ProModal({ isOpen, onClose, onOpenStoryCard }: ProModalProps) {
  const { lang } = useI18nStore();
  const isTr = lang === 'tr';
  const isPt = lang === 'pt';

  const { isPro, tier, licenseKey, activateLicense, deactivateLicense } = useProStore();

  const [inputKey, setInputKey] = useState('');
  const [activationStatus, setActivationStatus] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  if (!isOpen) return null;

  const features = [
    {
      icon: Layers,
      title: isTr
        ? '31+ Kurumsal Flagship Mimari'
        : isPt
        ? '31+ Arquiteturas Flagship'
        : '31+ Enterprise Flagship Stacks',
      desc: isTr
        ? 'Supabase, RustDesk, SearXNG, Nextcloud, Pterodactyl gibi 31 hazır stack ve 115 modül.'
        : isPt
        ? '31 modelos prontos e 115 módulos, incluindo Supabase, RustDesk, SearXNG e Nextcloud.'
        : '31 ready-to-deploy stacks and 115 modules including Supabase, RustDesk, SearXNG, and Nextcloud.',
    },
    {
      icon: Bot,
      title: isTr
        ? 'AI Mimari Doktoru & Linter'
        : isPt
        ? 'Médico de Arquitetura & Linter IA'
        : 'AI Architect Doctor & Linter',
      desc: isTr
        ? 'Port çakışmalarını, bellek darboğazlarını ve Docker güvenlik risklerini tek tıkla onarın.'
        : isPt
        ? 'Corrija conflitos de portas e riscos de segurança automaticamente com IA.'
        : 'Automatically resolve port collisions, memory bottlenecks, and Docker security vulnerabilities.',
    },
    {
      icon: FileText,
      title: isTr
        ? 'DIN 40719 Vektörel PDF Şartnamesi'
        : isPt
        ? 'Especificação Técnica DIN 40719 PDF'
        : 'DIN 40719 Vector PDF Blueprint',
      desc: isTr
        ? '1970ler Tektronix mühendislik standardında resmi onaylı paftayı vektörel PDF olarak indirin.'
        : isPt
        ? 'Baixe a planta técnica em PDF vetorial padrão industrial DIN 40719 com 1 clique.'
        : 'Download official high-resolution vector PDF schematic sheets conforming to DIN 40719.',
    },
    {
      icon: ShieldCheck,
      title: isTr
        ? 'VIP Topluluk & Öncelikli Destek'
        : isPt
        ? 'Comunidade VIP & Suporte Prioritário'
        : 'VIP Community & Direct Support',
      desc: isTr
        ? 'Discord sunucumuzda parlayan VIP rolü ve kurucu Alperen ile doğrudan öncelikli hat.'
        : isPt
        ? 'Cargo VIP brilhante no Discord e canal direto com o fundador.'
        : 'Glowing VIP role on Discord and priority 1-on-1 technical channel with founder Alperen.',
    },
  ];

  const handleActivate = () => {
    if (!inputKey.trim()) {
      setActivationStatus({
        success: false,
        message: isTr
          ? 'Lütfen bir lisans anahtarı, sipariş numarası veya VDS IP adresi girin.'
          : 'Please enter a license key, order ID or VDS IP address.',
      });
      return;
    }

    const result = activateLicense(inputKey);
    setActivationStatus({ success: result.valid, message: result.message });
    if (result.valid) {
      setInputKey('');
    }
  };

  // 1-Click Twitter / X Viral Growth Loop
  const handleShareTwitter = () => {
    const tweetText = encodeURIComponent(
      'Linux VDS ve Homelab mimarimi @xivizley ile görsel olarak tasarladım! ⚡\n\n120 FPS tuval, port çakışma tespiti ve DIN 40719 PDF şartname indirme efsane olmuş.\n\nÜcretsiz deneyin: https://xivizley.com.tr'
    );
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank', 'noopener,noreferrer');

    // Auto-grant lifetime VIP
    const viralKey = `XIV-PRO-VIRAL-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    activateLicense(viralKey);
    setActivationStatus({
      success: true,
      message: isTr
        ? '🎉 Harika! Paylaşımınız için Ömür Boyu VIP Lisansınız anında hesabınızda aktif edildi!'
        : '🎉 Awesome! Lifetime VIP license automatically activated for your share!',
    });
  };

  // 1-Click Instagram Story Card Viral Loop
  const handleShareInstagram = () => {
    // Auto-grant lifetime VIP
    const viralKey = `XIV-PRO-STORY-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    activateLicense(viralKey);
    setActivationStatus({
      success: true,
      message: isTr
        ? '📸 Harika! Story kartı oluşturuldu ve Ömür Boyu VIP Lisansınız aktif edildi!'
        : '📸 Awesome! Story Card generated and Lifetime VIP license activated!',
    });

    if (onOpenStoryCard) {
      onOpenStoryCard();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090514]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-[2px] border border-[#2B1A42] bg-[#0D0719] shadow-2xl p-6 md:p-8 overflow-hidden text-[#F5F3FF] max-h-[90vh] overflow-y-auto font-mono">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-[2px] text-[#8B7D9E] hover:text-[#F5F3FF] hover:bg-[#1E1235] border border-transparent hover:border-[#2B1A42] transition-colors cursor-pointer"
          aria-label="Kapat"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Title Block */}
        <div className="text-center max-w-lg mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[2px] bg-[#120A21] border border-[#2B1A42] text-[#C084FC] text-[10px] font-bold uppercase tracking-wider mb-3">
            <Crown className="h-3.5 w-3.5 text-[#C084FC]" />
            <span>
              {isPro
                ? isTr
                  ? '👑 XIVIZLEY VIP LİSANSINIZ AKTİF'
                  : '👑 XIVIZLEY VIP LICENSE ACTIVE'
                : 'XIVIZLEY VIP PROTOCOL // DIN 40719'}
            </span>
          </div>

          <h2
            className="text-2xl md:text-3xl font-bold tracking-tight text-[#F5F3FF]"
            style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
          >
            {isPro
              ? isTr
                ? 'Tüm VIP Ayrıcalıklar Açık!'
                : 'All VIP Privileges Unlocked!'
              : isTr
              ? 'Self-Host & DevOps Mimarınızı Zirveye Taşıyın'
              : 'Elevate Your Self-Host & DevOps Architecture'}
          </h2>

          <p className="text-xs text-[#A19BAF] mt-2 leading-relaxed">
            {isPro
              ? isTr
                ? 'Hesabınızda 31 kurumsal şablon, AI doktoru, DIN 40719 PDF şartname ve sınırsız dışa aktarma yetkileri devrede.'
                : 'All 31 enterprise stacks, AI doctor, DIN 40719 PDF blueprints, and unlimited exports are active.'
              : isTr
              ? 'Kurumsal şablonlar, yapay zeka mimari analizi ve ömür boyu VIP lisansı tek pakette.'
              : 'Enterprise stacks, AI architecture analysis, and lifetime VIP perks in one unified tier.'}
          </p>
        </div>

        {/* If Already Pro: Display Active Badge */}
        {isPro && (
          <div className="mt-5 p-4 rounded-[2px] border border-[#8B5CF6]/40 bg-[#120A21] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-[2px] bg-[#1E1235] border border-[#8B5CF6]/50 text-[#C084FC]">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#F5F3FF]">
                  {isTr ? 'Aktif Lisans: ' : 'Active License: '}
                  <span className="text-[#C084FC]">{tier}</span>
                </p>
                <p className="text-[10px] text-[#8B7D9E] mt-0.5 font-mono">
                  {isTr ? 'Lisans Kodu: ' : 'Key: '}
                  {licenseKey ? `${licenseKey.slice(0, 16)}...` : 'VIP-LIFETIME'}
                </p>
              </div>
            </div>
            <button
              onClick={deactivateLicense}
              className="text-[10px] text-[#8B7D9E] hover:text-rose-400 underline transition-colors cursor-pointer"
            >
              {isTr ? 'Lisansı Kaldır' : 'Remove License'}
            </button>
          </div>
        )}

        {/* ─── VIRAL GROWTH LOOP CARD: 1-Click Share to Get Free VIP ─── */}
        {!isPro && (
          <div className="mt-5 p-4 rounded-[2px] border border-[#8B5CF6] bg-[#120A21] relative overflow-hidden">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-[2px] bg-[#8B5CF6] text-white shrink-0 mt-0.5">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#C084FC] bg-[#1E1235] px-2 py-0.5 rounded-[2px] border border-[#2B1A42]">
                    {isTr ? '%100 ÜCRETSİZ HEDİYE' : '100% FREE GIFT'}
                  </span>
                  <span className="text-[10px] text-[#8B7D9E]">
                    {isTr ? 'Topluluk Büyüme Programı' : 'Community Growth Loop'}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-[#F5F3FF] mt-1.5">
                  {isTr
                    ? '1 Tıkla Bizi Paylaş, Ömür Boyu VIP Lisansını Anında Kap!'
                    : 'Share XIVIZLEY in 1-Click, Instantly Get Lifetime VIP!'}
                </h4>
                <p className="text-[11px] text-[#A19BAF] mt-1 leading-relaxed">
                  {isTr
                    ? 'Twitter (X) veya Instagram Story’de XIVIZLEY’den bahset; sistem paylaşımını algılayıp hesabına Ömür Boyu VIP Lisansını saniyeler içinde ücretsiz tanımlasın.'
                    : 'Mention XIVIZLEY on Twitter (X) or Instagram Story to unlock your free Lifetime VIP license.'}
                </p>

                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <button
                    onClick={handleShareTwitter}
                    className="flex items-center gap-1.5 rounded-[2px] bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-3 py-1.5 text-xs font-bold transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] active:scale-95 cursor-pointer"
                  >
                    <span>🐦</span>
                    <span>{isTr ? "X'te Paylaş & VIP Kazan" : 'Share on X & Unlock VIP'}</span>
                  </button>

                  <button
                    onClick={handleShareInstagram}
                    className="flex items-center gap-1.5 rounded-[2px] border border-[#2B1A42] bg-[#1E1235] hover:border-[#8B5CF6] hover:text-[#F5F3FF] text-[#C084FC] px-3 py-1.5 text-xs font-medium transition-all cursor-pointer"
                  >
                    <span>📸</span>
                    <span>{isTr ? 'Story Kartı Aç & VIP Kazan' : 'Open Story Card & Unlock VIP'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features 2x2 Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="p-3 rounded-[2px] border border-[#2B1A42] bg-[#090514] flex items-start gap-2.5 hover:border-[#8B5CF6]/50 transition-colors"
              >
                <div className="p-1.5 rounded-[2px] bg-[#120A21] border border-[#2B1A42] text-[#C084FC] shrink-0 mt-0.5">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#F5F3FF]">{f.title}</h3>
                  <p className="text-[10px] text-[#8B7D9E] leading-normal mt-0.5">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Free VDS Partner Promotion Banner */}
        {!isPro && (
          <div className="mt-4 p-3.5 rounded-[2px] border border-[#2B1A42] bg-[#120A21]">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-[2px] bg-[#1E1235] border border-[#2B1A42] text-[#C084FC] shrink-0 mt-0.5">
                <Zap className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-[#F5F3FF]">
                  {isTr
                    ? 'VDS Kiralayan veya Sunucusuna Kuran Herkese VIP Lisans!'
                    : 'Free VIP for Anyone Renting a VDS or Deploying via CLI!'}
                </h4>
                <p className="text-[10px] text-[#A19BAF] mt-1 leading-relaxed">
                  {isTr
                    ? 'Resmi partnerlerimizden VDS kiraladığında Sipariş Numaranı veya VDS IP adresini aşağıya girerek ömür boyu VIP lisansını anında aktif edebilirsin.'
                    : 'Rent a VDS from our partners and enter your Order ID or Server IP to activate lifetime VIP.'}
                </p>

                {/* Partner VDS Buttons */}
                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                  <a
                    href="https://www.hosting.com.tr/aff.php?aff=1702"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-[2px] bg-[#1E1235] border border-[#2B1A42] hover:border-[#8B5CF6] text-[#C084FC] hover:text-[#F5F3FF] px-2.5 py-1 text-[11px] font-medium transition-colors"
                  >
                    <span>⚡ Hosting.com.tr (VDS Ultra)</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <a
                    href="https://www.oweb.net.tr/aff.php?aff=975"
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="flex items-center gap-1 rounded-[2px] bg-[#1E1235] border border-[#2B1A42] hover:border-[#8B5CF6] text-[#C084FC] hover:text-[#F5F3FF] px-2.5 py-1 text-[11px] font-medium transition-colors"
                  >
                    <span>⚡ OWEB (10 Gbit/s NVMe)</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activation Box: Key / IP / Order ID */}
        <div className="mt-4 p-3.5 rounded-[2px] border border-[#2B1A42] bg-[#090514]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-[#C084FC]" />
              <h4 className="text-xs font-bold text-[#F5F3FF]">
                {isTr
                  ? 'Lisans Kodu, VDS Sipariş No veya Sunucu IP:'
                  : 'License Key, VDS Order ID or Server IP:'}
              </h4>
            </div>
            <span className="text-[9px] text-[#8B7D9E]">
              {isTr ? '[ANINDA OTO-DOĞRULAMA]' : '[INSTANT VERIFY]'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputKey}
              onChange={(e) => {
                setInputKey(e.target.value);
                setActivationStatus(null);
              }}
              placeholder={
                isTr
                  ? 'Örn: 178.210.168.163 veya ORD-12345 veya XIV-PRO-XXXX'
                  : 'e.g. 178.210.168.163 or ORD-12345 or XIV-PRO-XXXX'
              }
              className="flex-1 rounded-[2px] border border-[#2B1A42] bg-[#0D0719] px-3 py-1.5 text-xs font-mono text-[#F5F3FF] placeholder-[#8B7D9E] focus:outline-none focus:border-[#8B5CF6] uppercase"
            />
            <button
              onClick={handleActivate}
              className="px-3.5 py-1.5 rounded-[2px] bg-[#8B5CF6] hover:bg-[#7C3AED] text-xs font-bold text-white transition-all active:scale-95 shrink-0 cursor-pointer"
            >
              {isTr ? 'Aktif Et' : 'Activate'}
            </button>
          </div>

          <p className="text-[10px] text-[#8B7D9E] mt-2">
            💡 {isTr
              ? 'İpucu: Tuvaldeki mimarinizi VDS sunucunuza curl ... | bash komutuyla kurduğunuzda da sistem sunucunuzu algılayıp VIP lisansınızı otomatik etkinleştirir.'
              : 'Tip: When you deploy your canvas architecture to your VDS via curl ... | bash, your VIP license is automatically unlocked.'}
          </p>

          {activationStatus && (
            <div
              className={cn(
                'mt-2.5 p-2 rounded-[2px] text-xs flex items-center gap-2 border font-mono',
                activationStatus.success
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
              )}
            >
              {activationStatus.success ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
              )}
              <span>{activationStatus.message}</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
