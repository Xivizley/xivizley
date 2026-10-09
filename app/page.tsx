// ============================================================
// XIVIZLEY — Industrial System Schematic Landing Page
// Art Direction: DIN 40719 Hardware Spec Sheet (Obsidian Violet)
// Palette: Siyah - Mor Arası (#090514 Void Obsidian / #120A21 Deep Amethyst)
// Font: Newsreader (editorial serif) + JetBrains Mono (technical mono)
// app/page.tsx
// ============================================================

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useI18nStore, useTranslation } from '@/lib/i18n/store';
import { Navbar } from '@/components/shared/Navbar';
import { SponsorSection } from '@/components/shared/SponsorSection';
import { NewsletterSection } from '@/components/shared/NewsletterSection';
import { PLATFORM_STATS } from '@/lib/constants/stats';

const SAMPLE_COMPOSE = `version: '3.8'

services:
  ubuntu-base:
    image: ubuntu:22.04
    container_name: xivizley-os
    restart: unless-stopped

  nginx-proxy-manager:
    image: jc21/nginx-proxy-manager:latest
    container_name: nginx-proxy
    restart: unless-stopped
    ports:
      - "80:80/tcp"
      - "443:443/tcp"
    volumes:
      - ./npm/data:/data
      - ./npm/letsencrypt:/etc/letsencrypt

  minecraft-papermc:
    image: itzg/minecraft-server:latest
    container_name: minecraft-1-21
    restart: unless-stopped
    ports:
      - "25565:25565/tcp"
    environment:
      - EULA=TRUE
      - TYPE=PAPER
      - VERSION=1.21.4
      - MEMORY=4G
    volumes:
      - ./minecraft/data:/data

networks:
  default:
    name: xivizley_net`;

const SERVICES = ['Nextcloud', 'Plex', 'Minecraft', 'Vaultwarden', 'WireGuard', 'Jellyfin', 'AdGuard Home', 'Ollama AI'];

export default function LandingPage() {
  const { t } = useTranslation();
  const { lang } = useI18nStore();
  const isTr = lang === 'tr';
  const isPt = lang === 'pt';
  const [activeTab, setActiveTab] = useState<'preview' | 'yaml'>('preview');
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [serviceIdx, setServiceIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setServiceIdx((prev) => (prev + 1) % SERVICES.length);
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  // Scroll reveal — single IntersectionObserver
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('xv-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.06, rootMargin: '60px' }
    );
    document.querySelectorAll('.xv-reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleCopyCmd = useCallback(() => {
    navigator.clipboard.writeText('curl -sSL https://xivizley.com.tr/durum | bash');
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  }, []);

  const STEP_FLOW = [
    {
      step: '01',
      title: isTr ? 'Şablon veya Modül Seç' : isPt ? 'Selecione Modelo ou Módulo' : 'Select Template or Module',
      desc: isTr
        ? `${PLATFORM_STATS.totalTemplates} hazır şablondan birini seçin veya ${PLATFORM_STATS.totalModules} Docker servisini tuvalinize ekleyin.`
        : isPt
        ? `Escolha entre ${PLATFORM_STATS.totalTemplates} modelos prontos ou adicione ${PLATFORM_STATS.totalModules} serviços Docker na sua tela.`
        : `Choose from ${PLATFORM_STATS.totalTemplates} pre-built templates or add ${PLATFORM_STATS.totalModules} Docker services onto your canvas.`,
    },
    {
      step: '02',
      title: isTr ? 'Görsel Tuvalde Bağla' : isPt ? 'Conecte na Tela Visual' : 'Connect on Visual Canvas',
      desc: isTr
        ? 'Konteynerleri, ters vekil ve veritabanlarını birbirine sürükleyerek bağlayın.'
        : isPt
        ? 'Arraste e conecte contêineres, proxies reversos e bancos de dados de forma intuitiva.'
        : 'Drag and wire containers, reverse proxies, and databases together seamlessly.',
    },
    {
      step: '03',
      title: isTr ? 'Çakışmaları Denetle' : isPt ? 'Verifique Conflitos de Portas' : 'Check for Port Conflicts',
      desc: isTr
        ? 'Aynı portu kullanan servisleri otomatik tespit eder ve boş port alternatifleri sunar.'
        : isPt
        ? 'Detecta automaticamente portas conflitantes e sugere alternativas validadas com 1 clique.'
        : 'Automatically detects overlapping ports and provides validated alternative port options.',
    },
    {
      step: '04',
      title: isTr ? 'Tek Komutla Dağıt' : isPt ? 'Implante em 1-Clique' : 'Deploy in 1-Click',
      desc: isTr
        ? 'Oluşturulan tek satırlık komutu sunucu terminalinize yapıştırarak tüm mimariyi ayağa kaldırın.'
        : isPt
        ? 'Cole o comando de linha única gerado no terminal do seu servidor para subir toda a stack.'
        : 'Paste the generated one-line command into your server terminal to launch the whole stack.',
    },
  ];

  const FAQS = [
    {
      q: isTr ? 'XIVIZLEY nedir ve ne işe yarar?' : isPt ? 'O que é o XIVIZLEY e como funciona?' : 'What is XIVIZLEY and how does it work?',
      a: isTr
        ? 'XIVIZLEY, Linux ve VDS sunucularda Docker servislerini sürükle-bırak yöntemiyle görsel olarak tasarlamanızı, port çakışmalarını önceden tespit etmenizi ve tek satır komutla sunucunuza kurmanızı sağlayan ücretsiz bir homelab mimarıdır.'
        : isPt
        ? 'O XIVIZLEY é um arquiteto visual gratuito de self-host que permite arrastar e soltar serviços Docker, detectar conflitos de porta em tempo real e implantar tudo no seu servidor Linux com um único comando SSH.'
        : 'XIVIZLEY is a free visual homelab architect that lets you drag-and-drop Docker services, catch port conflicts in real time, and deploy everything to your Linux server with a single SSH command.',
    },
    {
      q: isTr ? 'Docker port çakışması nasıl çözülür?' : isPt ? 'Como os conflitos de porta do Docker são resolvidos?' : 'How are Docker port conflicts resolved?',
      a: isTr
        ? 'XIVIZLEY, tuvalinize eklediğiniz servislerin kullandığı portları anlık olarak denetler. Bir çakışma olduğunda kırmızı bildirim verir ve boş bir alternatif port önererek çakışmayı tek tıkla giderir.'
        : isPt
        ? 'O XIVIZLEY monitora as portas em tempo real. Se houver sobreposição, ele alerta em vermelho e sugere alternativas livres com correção em 1 clique.'
        : 'XIVIZLEY monitors ports used by all services in real time. If an overlap occurs, it flashes red and suggests free alternatives with a one-click fix.',
    },
    {
      q: isTr ? 'XIVIZLEY tamamen ücretsiz mi?' : isPt ? 'O XIVIZLEY é totalmente gratuito?' : 'Is XIVIZLEY completely free?',
      a: isTr
        ? 'Evet, XIVIZLEY Çekirdek (Core), görsel tuval, port radarı ve tüm Homelab mimarlık araçları %100 ücretsiz ve MIT lisansıyla açık kaynaklıdır. Kendi sunucunuza kurup dilediğiniz gibi çalıştırabilirsiniz. Kendi kendine barındırılan (self-hosted) Suite araçları da tamamen ücretsizdir; yalnızca merkezi barındırılan bulut senkronizasyon özellikleri özeldir.'
        : isPt
        ? 'Sim. O XIVIZLEY Core — a tela visual, o radar de portas e todas as ferramentas de arquitetura homelab — é 100% gratuito e de código aberto com licença MIT. Você pode auto-hospedar e executar como quiser. As ferramentas Suite auto-hospedadas também são totalmente gratuitas; apenas os recursos de sincronização em nuvem hospedados centralmente são premium.'
        : 'Yes. XIVIZLEY Core — the visual canvas, port radar, and all homelab architecture tools — is 100% free and MIT-licensed open source. You can self-host and run it however you like. The self-hosted Suite tools are entirely free too; only the centrally hosted cloud sync features are premium.',
    },
    {
      q: isTr ? 'Tasarladığım mimariyi VDS sunucuma nasıl kurarım?' : isPt ? 'Como implanto minha arquitetura em um servidor VDS?' : 'How do I deploy my architecture to a VDS server?',
      a: isTr
        ? '"Dağıtıma Hazırla" butonuna basarak üretilen tek satırlık SSH komutunu kopyalayıp sunucu terminalinize yapıştırmanız yeterlidir.'
        : isPt
        ? 'Clique em "Preparar Implantação", copie o comando SSH de linha única gerado e cole-o no terminal do seu servidor.'
        : 'Click "Deploy to Server", copy the generated one-line SSH command, and paste it into your server terminal.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#090514] text-[#F5F3FF]" style={{ fontFamily: 'var(--font-sans)' }}>

      {/* ─── Navbar ─── */}
      <Navbar />

      {/* ─── Announcement Strip (Dark Violet) ─── */}
      <div
        className="border-b border-[#2B1A42] bg-[#0E0720] overflow-hidden"
        style={{ height: '36px' }}
        aria-label={isTr ? 'Duyurular' : 'Announcements'}
      >
        <div className="xv-ticker-track">
          <div className="xv-ticker-inner">
            {[
              { text: isTr ? 'XIVIZLEY Suite v1.1 Sovereign Cloud — Kendi sunucunda kur' : 'XIVIZLEY Suite v1.1 Sovereign Cloud — Self-host on your own server', link: '/suite' },
              { text: isTr ? 'OWEB TR Cloud — Resmi Altyapı Sponsoru 10 Gbps NVMe' : 'OWEB TR Cloud — Official Infrastructure Partner 10 Gbps NVMe', link: 'https://www.oweb.net.tr/aff.php?aff=975' },
              { text: isTr ? `${PLATFORM_STATS.totalModules} Docker Modülü  ${PLATFORM_STATS.totalTemplates} Hazır Şablon  Ücretsiz` : `${PLATFORM_STATS.totalModules} Docker Modules  ${PLATFORM_STATS.totalTemplates} Curated Stacks  Free`, link: '/templates' },
              { text: isTr ? 'LaunchIgniter Week 38 — Küresel Vitrin' : 'LaunchIgniter Week 38 — Global Showcase', link: 'https://launchigniter.com' },
            ].concat([
              { text: isTr ? 'XIVIZLEY Suite v1.1 Sovereign Cloud — Kendi sunucunda kur' : 'XIVIZLEY Suite v1.1 Sovereign Cloud — Self-host on your own server', link: '/suite' },
              { text: isTr ? 'OWEB TR Cloud — Resmi Altyapı Sponsoru 10 Gbps NVMe' : 'OWEB TR Cloud — Official Infrastructure Partner 10 Gbps NVMe', link: 'https://www.oweb.net.tr/aff.php?aff=975' },
              { text: isTr ? `${PLATFORM_STATS.totalModules} Docker Modülü  ${PLATFORM_STATS.totalTemplates} Hazır Şablon  Ücretsiz` : `${PLATFORM_STATS.totalModules} Docker Modules  ${PLATFORM_STATS.totalTemplates} Curated Stacks  Free`, link: '/templates' },
              { text: isTr ? 'LaunchIgniter Week 38 — Küresel Vitrin' : 'LaunchIgniter Week 38 — Global Showcase', link: 'https://launchigniter.com' },
            ]).map((item, i) => (
              <span key={i} className="inline-flex items-center gap-4 px-8">
                <a
                  href={item.link}
                  target={item.link.startsWith('http') ? '_blank' : undefined}
                  rel={item.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="text-[11px] font-mono font-medium text-[#C084FC] hover:text-[#E9D5FF] transition-colors tracking-wide uppercase"
                >
                  {item.text}
                </a>
                <span className="text-[#3B255E] select-none" aria-hidden="true">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Homepage-scoped FAQPage structured data (kept in sync with the visible accordion) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQS.map((faq) => ({
              '@type': 'Question',
              name: faq.q,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.a,
              },
            })),
          }),
        }}
      />

      <main id="main-content">

        {/* ════════════════════════════════════════════════════
            HERO — 60/40 Asimetrik Monolitik Sistem Matrisi
            Sol: Donanım Şartnamesi Kütüğü (60%)
            Sağ: Gerçek Ürün Kadrajı (40%)
        ════════════════════════════════════════════════════ */}
        <section className="border-b border-[#2B1A42]" aria-label="Hero">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-[60fr_40fr] min-h-[88vh]">

              {/* ─── LEFT: Spec Sheet Manifold ─── */}
              <div className="flex flex-col justify-between py-16 lg:py-20 lg:pr-12 border-b lg:border-b-0 lg:border-r border-[#2B1A42]">

                {/* Architect badge — top-left */}
                <div className="flex items-center gap-3 mb-12">
                  <div className="h-px flex-1 bg-[#2B1A42]" aria-hidden="true" />
                  <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#C084FC]">
                    XIV — SISTEM MİMARİ ŞARTNAME FORMU — Rev. 2026.10
                  </span>
                </div>

                {/* Primary heading */}
                <div className="mb-10">
                  <div className="mb-3">
                    <span
                      className="block text-[13px] font-mono tracking-[0.15em] uppercase text-[#A78BFA] mb-2"
                    >
                      {isTr ? 'Konfigürasyon Tanımı' : 'Configuration Definition'}
                    </span>
                  </div>
                  <h1
                    className="text-[clamp(2.8rem,6vw,5rem)] leading-[1.0] tracking-tight text-[#F5F3FF] mb-6"
                    style={{ fontFamily: 'var(--font-serif, Georgia, serif)', fontWeight: 700 }}
                  >
                    {isTr ? (
                      <>
                        Kendi Sunucunu<br />
                        <span style={{ color: '#C084FC' }}>Görsel Olarak</span><br />
                        Tasarla.
                      </>
                    ) : isPt ? (
                      <>
                        Projete Seu Servidor<br />
                        <span style={{ color: '#C084FC' }}>Visualmente,</span><br />
                        Deploy em 1-Clique.
                      </>
                    ) : (
                      <>
                        Design Your Server<br />
                        <span style={{ color: '#C084FC' }}>Architecture</span><br />
                        Visually.
                      </>
                    )}
                  </h1>
                  <p className="text-[15px] text-[#A19BAF] leading-relaxed max-w-xl font-mono">
                    {isTr
                      ? `Karmaşık YAML dosyaları ve port çakışmalarıyla uğraşmayı bırakın. ${PLATFORM_STATS.totalModules} Docker servisini tuvalde bağlayın; tek satır SSH komutuyla VDS sunucunuza kurun.`
                      : isPt
                      ? `Pare de lidar com arquivos YAML complexos. Conecte ${PLATFORM_STATS.totalModules} serviços Docker na tela visual e implante no servidor com um único comando SSH.`
                      : `Stop wrestling with complex YAML files and port conflicts. Connect ${PLATFORM_STATS.totalModules} Docker services on the canvas, deploy to your server with a single SSH command.`}
                  </p>
                </div>

                {/* Spec table — DIN-style parameter log (Deep Obsidian Violet) */}
                <div className="mb-10 border border-[#2B1A42] bg-[#120A21]" role="table" aria-label="System Specification">
                  <div className="border-b border-[#2B1A42] px-4 py-2 bg-[#7C3AED]" role="rowgroup">
                    <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#FFFFFF] font-bold">
                      {isTr ? 'SİSTEM PARAMETRELERİ' : 'SYSTEM PARAMETERS'}
                    </span>
                  </div>
                  {[
                    { param: 'PLATFORM.TYPE', value: isTr ? 'Görsel Docker Mimarlık Tuvali' : 'Visual Docker Architecture Canvas', unit: '—' },
                    { param: 'MODULE.COUNT', value: `${PLATFORM_STATS.totalModules}`, unit: isTr ? 'Docker Modülü' : 'Docker Modules' },
                    { param: 'TEMPLATE.COUNT', value: '31', unit: isTr ? 'Hazır Şablon' : 'Curated Stacks' },
                    { param: 'DEPLOY.METHOD', value: 'curl -sSL ... | bash', unit: isTr ? '1-Tıkla SSH' : '1-Click SSH' },
                    { param: 'LICENSE', value: 'MIT Open Source', unit: isTr ? '100% Ücretsiz' : '100% Free' },
                    { param: 'INFRA.PARTNER', value: 'OWEB TR & Hosting.com.tr', unit: '10 Gbps NVMe' },
                  ].map((row, i) => (
                    <div
                      key={row.param}
                      className="grid grid-cols-[auto_1fr_auto] items-center gap-x-4 border-b border-[#2B1A42] px-4 py-2.5 last:border-b-0"
                      style={{ background: i % 2 === 0 ? '#120A21' : '#0D0719' }}
                      role="row"
                    >
                      <span className="font-mono text-[10px] tracking-wide text-[#C084FC] shrink-0" role="cell">{row.param}</span>
                      <span className="font-mono text-[11px] text-[#F5F3FF] font-medium truncate" role="cell">{row.value}</span>
                      <span className="font-mono text-[9px] text-[#8B7D9E] shrink-0 text-right" role="cell">{row.unit}</span>
                    </div>
                  ))}
                </div>

                {/* CTA pair */}
                <div className="flex flex-wrap gap-4 mb-10">
                  <Link
                    href="/architect"
                    id="hero-cta-primary"
                    prefetch={false}
                    className="xv-btn-primary inline-flex items-center gap-2 px-7 py-3 font-mono text-[13px] font-semibold tracking-wide text-[#FFFFFF] bg-[#8B5CF6] hover:bg-[#7C3AED] transition-colors"
                    style={{ borderRadius: '2px' }}
                  >
                    {isTr ? 'Tuvalde Tasarlamaya Başla' : isPt ? 'Começar na Tela Visual' : 'Start Building on Canvas'}
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/></svg>
                  </Link>
                  <Link
                    href="/templates"
                    id="hero-cta-secondary"
                    prefetch={false}
                    className="xv-btn-secondary inline-flex items-center gap-2 px-7 py-3 font-mono text-[13px] font-semibold tracking-wide text-[#F5F3FF] border border-[#2B1A42] hover:border-[#8B5CF6] hover:text-[#C084FC] transition-colors bg-[#120A21]/60"
                    style={{ borderRadius: '2px' }}
                  >
                    {isTr ? '31 Hazır Şablonu İncele' : isPt ? 'Ver 31 Stacks Prontas' : 'Explore 31 Stacks'}
                  </Link>
                  <a
                    href="https://github.com/Xivizley/xivizley"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-7 py-3 font-mono text-[13px] font-semibold tracking-wide text-[#C084FC] border border-[#2B1A42] bg-[#120A21] hover:border-[#8B5CF6] hover:text-[#FFFFFF] transition-colors"
                    style={{ borderRadius: '2px' }}
                  >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.16-.02-2.1-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.41-5.25 5.69.41.35.78 1.05.78 2.12 0 1.53-.01 2.76-.01 3.14 0 .31.2.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" />
                    </svg>
                    GITHUB [ MIT CORE ]
                  </a>
                </div>

                {/* Current service live ticker */}
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#8B5CF6]" aria-hidden="true" />
                  <span className="font-mono text-[11px] text-[#8B7D9E] tracking-wide">
                    {isTr ? 'Desteklenen servis:' : 'Supported:'}{' '}
                    <span className="text-[#C084FC] font-semibold">{SERVICES[serviceIdx]}</span>
                  </span>
                </div>
              </div>

              {/* ─── RIGHT: Technical Product Cadre ─── */}
              <div className="flex flex-col justify-center py-16 lg:py-20 lg:pl-12">

                {/* Measurement frame header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#8B7D9E]">
                    {isTr ? 'CANLI ÖNIZLEME / MİMARİ KADRAJ' : 'LIVE PREVIEW / ARCHITECTURE FRAME'}
                  </span>
                  <div className="flex items-center gap-1.5 bg-[#120A21] border border-[#2B1A42] px-2 py-1" style={{ borderRadius: '2px' }} role="tablist" aria-label={isTr ? 'Görünüm' : 'View'}>
                    <button
                      role="tab"
                      id="tab-preview"
                      aria-selected={activeTab === 'preview'}
                      aria-controls="tabpanel-preview"
                      onClick={() => setActiveTab('preview')}
                      className={`px-2 py-0.5 font-mono text-[10px] tracking-wide transition-colors ${activeTab === 'preview' ? 'bg-[#7C3AED] text-[#FFFFFF]' : 'text-[#8B7D9E] hover:text-[#F5F3FF]'}`}
                      style={{ borderRadius: '2px' }}
                    >
                      {isTr ? 'Tuval' : 'Canvas'}
                    </button>
                    <button
                      role="tab"
                      id="tab-yaml"
                      aria-selected={activeTab === 'yaml'}
                      aria-controls="tabpanel-yaml"
                      onClick={() => setActiveTab('yaml')}
                      className={`px-2 py-0.5 font-mono text-[10px] tracking-wide transition-colors ${activeTab === 'yaml' ? 'bg-[#7C3AED] text-[#FFFFFF]' : 'text-[#8B7D9E] hover:text-[#F5F3FF]'}`}
                      style={{ borderRadius: '2px' }}
                    >
                      YAML
                    </button>
                  </div>
                </div>

                {/* Frame with measurement tick marks */}
                <div
                  className="relative border border-[#2B1A42] bg-[#0D0719] overflow-hidden"
                  style={{ borderRadius: '2px' }}
                >
                  {/* Top ruler */}
                  <div className="flex border-b border-[#2B1A42] h-5 bg-[#120A21]" aria-hidden="true">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div key={i} className="flex-1 border-r border-[#2B1A42] flex items-end pb-0.5">
                        {i % 5 === 0 && (
                          <span className="font-mono text-[7px] text-[#5E4E77] ml-0.5">{i * 5}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex">
                    {/* Left ruler */}
                    <div className="flex flex-col border-r border-[#2B1A42] w-5 bg-[#120A21]" aria-hidden="true">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="flex-1 border-b border-[#2B1A42] flex items-start justify-end pr-0.5 pt-0.5">
                          {i % 3 === 0 && (
                            <span className="font-mono text-[7px] text-[#5E4E77]">{i * 10}</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Content area */}
                    <div className="flex-1 p-4 bg-[#090514]">
                      {activeTab === 'preview' && (
                        <div
                          role="tabpanel"
                          id="tabpanel-preview"
                          aria-labelledby="tab-preview"
                        >
                          {/* Actual product screenshot */}
                          <Image
                            src="/og.png"
                            alt={isTr ? 'XIVIZLEY Görsel Docker Mimarlık Tuvali' : 'XIVIZLEY Visual Docker Architecture Canvas'}
                            width={1200}
                            height={630}
                            className="w-full h-auto border border-[#2B1A42]"
                            style={{ borderRadius: '2px' }}
                            priority
                            fetchPriority="high"
                          />

                          {/* Annotation strip */}
                          <div className="mt-3 flex items-center justify-between border-t border-[#2B1A42] pt-2">
                            <div className="flex items-center gap-4">
                              {[
                                { label: isTr ? 'Ubuntu 22.04 LTS' : 'Ubuntu 22.04 LTS', status: 'online' },
                                { label: 'Nginx Proxy', status: 'online' },
                                { label: 'Minecraft 1.21.4', status: 'online' },
                              ].map((node) => (
                                <div key={node.label} className="flex items-center gap-1.5">
                                  <div className={`h-1.5 w-1.5 rounded-full ${node.status === 'online' ? 'bg-[#8B5CF6]' : 'bg-[#5E4E77]'}`} aria-hidden="true" />
                                  <span className="font-mono text-[9px] text-[#8B7D9E]">{node.label}</span>
                                </div>
                              ))}
                            </div>
                            <span className="font-mono text-[9px] text-[#8B7D9E]">xivizley_net</span>
                          </div>
                        </div>
                      )}

                      {activeTab === 'yaml' && (
                        <div
                          role="tabpanel"
                          id="tabpanel-yaml"
                          aria-labelledby="tab-yaml"
                        >
                          <pre className="text-[10px] font-mono text-[#C4B5FD] overflow-x-auto max-h-[340px] leading-relaxed whitespace-pre bg-[#06030D] p-3 border border-[#2B1A42]">{SAMPLE_COMPOSE}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Copy command */}
                <div className="mt-4 flex items-center gap-0 border border-[#2B1A42] bg-[#0E0720] overflow-hidden" style={{ borderRadius: '2px' }}>
                  <span className="flex-1 px-3 py-2 font-mono text-[11px] text-[#A19BAF] truncate">
                    curl -sSL https://xivizley.com.tr/durum | bash
                  </span>
                  <button
                    onClick={handleCopyCmd}
                    className="shrink-0 px-3 py-2 font-mono text-[11px] font-semibold border-l border-[#2B1A42] hover:bg-[#8B5CF6] hover:text-[#FFFFFF] transition-colors text-[#C084FC]"
                    aria-label={isTr ? 'Kurulum komutunu kopyala' : 'Copy install command'}
                  >
                    {copiedCmd ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M1 6l4 4 6-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/></svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><rect x="1" y="4" width="7" height="7" stroke="currentColor" strokeWidth="1.2"/><path d="M4 4V1h7v7h-3" stroke="currentColor" strokeWidth="1.2"/></svg>
                    )}
                  </button>
                </div>

                {/* Stat strip */}
                <div className="mt-6 grid grid-cols-4 gap-0 border border-[#2B1A42] divide-x divide-[#2B1A42]">
                  {[
                    { val: PLATFORM_STATS.modulesDisplay, label: isTr ? 'Modül' : 'Modules' },
                    { val: PLATFORM_STATS.templatesDisplay, label: isTr ? 'Şablon' : 'Stacks' },
                    { val: '10G', label: 'NVMe' },
                    { val: '%100', label: isTr ? 'Ücretsiz' : 'Free' },
                  ].map((s) => (
                    <div key={s.val} className="flex flex-col items-center py-3 bg-[#120A21]">
                      <span className="font-mono text-base font-black text-[#C084FC]">{s.val}</span>
                      <span className="font-mono text-[9px] uppercase tracking-wide text-[#8B7D9E]">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            FEATURES — 4 Technical Feature Panels
        ════════════════════════════════════════════════════ */}
        <section className="xv-reveal border-b border-[#2B1A42]" aria-labelledby="features-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">

            <div className="mb-12 flex items-end justify-between border-b border-[#2B1A42] pb-6">
              <div>
                <span className="block font-mono text-[10px] tracking-[0.2em] uppercase text-[#C084FC] mb-2">
                  {isTr ? 'ÖZELLİK KATALOĞU' : 'FEATURE CATALOGUE'}
                </span>
                <h2
                  id="features-heading"
                  className="text-3xl sm:text-4xl tracking-tight text-[#F5F3FF]"
                  style={{ fontFamily: 'var(--font-serif, Georgia, serif)', fontWeight: 700 }}
                >
                  {isTr ? 'Neden XIVIZLEY?' : isPt ? 'Por que XIVIZLEY?' : 'Why XIVIZLEY?'}
                </h2>
              </div>
              <Link
                href="/architect"
                prefetch={false}
                className="hidden sm:inline-flex items-center gap-2 font-mono text-[11px] font-semibold text-[#C084FC] hover:text-[#E9D5FF] transition-colors border-b border-[#C084FC] pb-0.5"
              >
                {isTr ? 'Tuvale Git' : 'Open Canvas'}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M1 6h10M7 2l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="square"/></svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-l border-t border-[#2B1A42]">
              {[
                {
                  code: 'F-001',
                  title: isTr ? 'Canlı Görsel Mimarlık Stüdyosu' : 'Live Visual Architecture Studio',
                  desc: isTr
                    ? 'İşletim sisteminizden Docker konteynerlerinize kadar her katmanı görsel düğümlerle eşleştirin. Otomatik auto-layout motoru tüm şemanızı profesyonelce hizalar.'
                    : 'Map every layer from your host OS to Docker containers with visual nodes. The automatic layout engine aligns your entire topology with precision.',
                  metric: `${PLATFORM_STATS.totalModules} modules`,
                  link: '/architect',
                },
                {
                  code: 'F-002',
                  title: isTr ? 'Akıllı Port Çakışması Çözücü' : 'Smart Port Conflict Resolver',
                  desc: isTr
                    ? 'Port 80 veya 53 üzerinde iki servis çakıştığında kırmızı alarm verir ve boş bir alternatif portu tek tıkla uygular.'
                    : 'Triggers an instant red warning when two services claim port 80 or 53, offering vacant alternative ports with one-click resolution.',
                  metric: '0 conflicts',
                  link: '/architect',
                },
                {
                  code: 'F-003',
                  title: isTr ? '31 Hazır Şablon Marketi' : '31 Curated Stack Templates',
                  desc: isTr
                    ? 'Ollama AI, Minecraft, Nextcloud, Jellyfin 4K, Palworld, CS2 ve WordPress mimarilerini tek tıkla tuvalinize yükleyin.'
                    : 'Load Ollama AI, Minecraft, Nextcloud, Jellyfin 4K, Palworld, CS2, and WordPress stacks to your canvas with one click.',
                  metric: '31 stacks',
                  link: '/templates',
                },
                {
                  code: 'F-004',
                  title: isTr ? '4K Şema Dışa Aktarma' : '4K Diagram Export & Share',
                  desc: isTr
                    ? 'Tasarımınızı 4K PNG, Discord Markdown tablosu veya kalıcı URL bağlantısı olarak paylaşın.'
                    : 'Export your architecture as a 4K PNG, markdown table, or shareable one-click URL with the community.',
                  metric: 'PNG / YAML / URL',
                  link: '/architect',
                },
              ].map((feat) => (
                <div
                  key={feat.code}
                  className="border-r border-b border-[#2B1A42] p-8 group hover:bg-[#150C28] transition-colors"
                >
                  <div className="flex items-start justify-between mb-6">
                    <span className="font-mono text-[10px] text-[#C084FC] tracking-widest">{feat.code}</span>
                    <span className="font-mono text-[10px] text-[#A19BAF] tracking-wide border border-[#2B1A42] px-2 py-0.5 bg-[#0E0720]" style={{ borderRadius: '2px' }}>{feat.metric}</span>
                  </div>
                  <h3 className="text-base font-semibold text-[#F5F3FF] mb-3" style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>
                    {feat.title}
                  </h3>
                  <p className="font-mono text-[12px] text-[#A19BAF] leading-relaxed mb-6">{feat.desc}</p>
                  <Link
                    href={feat.link}
                    prefetch={false}
                    className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#C084FC] hover:text-[#E9D5FF] transition-colors border-b border-[#C084FC]/40 hover:border-[#E9D5FF] pb-0.5"
                  >
                    {isTr ? 'İncele' : 'Explore'}
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M1 5h8M6 2l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square"/></svg>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Sponsor Section ─── */}
        <SponsorSection />

        {/* ════════════════════════════════════════════════════
            4-STEP DEPLOY FLOW
        ════════════════════════════════════════════════════ */}
        <section className="xv-reveal border-b border-[#2B1A42]" aria-labelledby="how-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">

            <div className="mb-12 border-b border-[#2B1A42] pb-6">
              <span className="block font-mono text-[10px] tracking-[0.2em] uppercase text-[#C084FC] mb-2">
                {isTr ? 'UYGULAMA PROTOKOLÜ' : 'DEPLOYMENT PROTOCOL'}
              </span>
              <h2
                id="how-heading"
                className="text-3xl sm:text-4xl tracking-tight text-[#F5F3FF]"
                style={{ fontFamily: 'var(--font-serif, Georgia, serif)', fontWeight: 700 }}
              >
                {t('landing.howTitle')}
              </h2>
              <p className="mt-2 font-mono text-[13px] text-[#8B7D9E]">{t('landing.howSubtitle')}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border-l border-t border-[#2B1A42]">
              {STEP_FLOW.map((item) => (
                <div key={item.step} className="border-r border-b border-[#2B1A42] p-8 hover:bg-[#150C28] transition-colors">
                  <div className="font-mono text-[2rem] font-black text-[#2B1A42] mb-6">{item.step}</div>
                  <div className="w-8 h-px bg-[#8B5CF6] mb-4" aria-hidden="true" />
                  <h3 className="text-[14px] font-semibold text-[#F5F3FF] mb-3" style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>
                    {item.title}
                  </h3>
                  <p className="font-mono text-[11px] text-[#A19BAF] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            FAQ
        ════════════════════════════════════════════════════ */}
        <section className="xv-reveal border-b border-[#2B1A42]" aria-labelledby="faq-heading">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-20">

            <div className="mb-12 border-b border-[#2B1A42] pb-6">
              <span className="block font-mono text-[10px] tracking-[0.2em] uppercase text-[#C084FC] mb-2">
                {isTr ? 'SIKÇA SORULAN SORULAR' : 'FREQUENTLY ASKED'}
              </span>
              <h2
                id="faq-heading"
                className="text-3xl tracking-tight text-[#F5F3FF]"
                style={{ fontFamily: 'var(--font-serif, Georgia, serif)', fontWeight: 700 }}
              >
                {isTr ? 'Teknik Soru & Cevap' : 'Technical Q&A'}
              </h2>
            </div>

            <div className="divide-y divide-[#2B1A42] border-y border-[#2B1A42]">
              {FAQS.map((faq, idx) => (
                <div key={idx}>
                  <button
                    id={`faq-q-${idx}`}
                    aria-expanded={activeFaq === idx}
                    aria-controls={`faq-a-${idx}`}
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full flex items-start justify-between py-5 text-left group"
                  >
                    <div className="flex items-start gap-4 pr-4">
                      <span className="font-mono text-[10px] text-[#C084FC] tracking-widest mt-0.5 shrink-0">Q.{String(idx + 1).padStart(2, '0')}</span>
                      <span className="font-mono text-[13px] font-semibold text-[#F5F3FF] group-hover:text-[#C084FC] transition-colors">
                        {faq.q}
                      </span>
                    </div>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                      className={`shrink-0 mt-0.5 text-[#8B7D9E] transition-transform duration-200 ${activeFaq === idx ? 'rotate-180 text-[#C084FC]' : ''}`}
                    >
                      <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
                    </svg>
                  </button>
                  <div
                    id={`faq-a-${idx}`}
                    role="region"
                    aria-labelledby={`faq-q-${idx}`}
                    className={`grid transition-all duration-300 ease-out ${activeFaq === idx ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                  >
                    <div className="overflow-hidden">
                      <p className="pb-5 pl-12 font-mono text-[12px] text-[#A19BAF] leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            PRIVACY & TRUST (Dark Violet Box)
        ════════════════════════════════════════════════════ */}
        <section className="xv-reveal border-b border-[#2B1A42] bg-[#0E0720]" aria-labelledby="privacy-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-center">
              <div>
                <span className="block font-mono text-[10px] tracking-[0.2em] uppercase text-[#C084FC] mb-2">
                  {isTr ? 'GİZLİLİK & GÜVENLİK' : 'PRIVACY & SECURITY'}
                </span>
                <h2
                  id="privacy-heading"
                  className="text-xl font-semibold text-[#F5F3FF] mb-2"
                  style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
                >
                  {t('landing.privacyTitle')}
                </h2>
                <p className="font-mono text-[12px] text-[#A19BAF] max-w-xl leading-relaxed">
                  {t('landing.privacyDesc')}
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Link
                  href="/privacy"
                  className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold text-[#C084FC] hover:text-[#E9D5FF] transition-colors border-b border-[#C084FC]/40 pb-0.5"
                >
                  {t('landing.privacyLink')}
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M1 5h8M6 2l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square"/></svg>
                </Link>
                <Link
                  href="/terms"
                  className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold text-[#8B7D9E] hover:text-[#C084FC] transition-colors"
                >
                  {isTr ? 'Kullanım Şartları' : 'Terms of Service'}
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M1 5h8M6 2l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square"/></svg>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            FINAL CTA
        ════════════════════════════════════════════════════ */}
        <section className="xv-reveal border-b border-[#2B1A42]" aria-labelledby="cta-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 items-center">
              <div>
                <span className="block font-mono text-[10px] tracking-[0.2em] uppercase text-[#C084FC] mb-4">
                  {isTr ? 'BAŞLANGIÇ NOKTASI' : 'ENTRY POINT'}
                </span>
                <h2
                  id="cta-heading"
                  className="text-4xl sm:text-5xl tracking-tight text-[#F5F3FF] mb-4"
                  style={{ fontFamily: 'var(--font-serif, Georgia, serif)', fontWeight: 700 }}
                >
                  {isTr ? 'Mimarinizi Şimdi Tasarlayın.' : isPt ? 'Projete Agora.' : 'Design Your Architecture Now.'}
                </h2>
                <p className="font-mono text-[13px] text-[#A19BAF] max-w-lg leading-relaxed">
                  {isTr
                    ? 'Tamamen ücretsiz, kayıt gerektirmeyen ve tarayıcınızda çalışan görsel Homelab mimarı.'
                    : '100% free, client-side, zero-install visual homelab architect running directly in your browser.'}
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <Link
                  href="/architect"
                  id="landing-cta-bottom"
                  prefetch={false}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 font-mono text-[13px] font-semibold text-[#FFFFFF] bg-[#8B5CF6] hover:bg-[#7C3AED] transition-colors"
                  style={{ borderRadius: '2px' }}
                >
                  {isTr ? 'Görsel Mimarı Başlat' : isPt ? 'Iniciar Arquiteto Visual' : 'Launch Visual Architect'}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/></svg>
                </Link>
                <a
                  href="https://www.producthunt.com/products/xivizley"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 font-mono text-[13px] font-semibold text-[#F5F3FF] border border-[#2B1A42] hover:border-[#8B5CF6] hover:text-[#C084FC] transition-colors bg-[#120A21]/50"
                  style={{ borderRadius: '2px' }}
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#ff6154] text-[9px] font-bold text-white">P</span>
                  {isTr ? "Product Hunt'ta İnceleyin" : 'Support on Product Hunt'}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Newsletter ─── */}
        <NewsletterSection />
      </main>

      {/* ════════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════════ */}
      <footer className="border-t border-[#2B1A42] bg-[#070310] pt-12 pb-8 px-4 sm:px-8">
        <div className="mx-auto max-w-7xl">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10 border-b border-[#2B1A42]">

            {/* Brand */}
            <div className="space-y-4">
              <Link href="/" className="inline-block">
                <Image
                  src="/xivizley-logo.png"
                  alt="XIVIZLEY"
                  width={140}
                  height={32}
                  className="h-7 w-auto object-contain"
                  loading="lazy"
                />
              </Link>
              <p className="font-mono text-[11px] text-[#8B7D9E] leading-relaxed">
                {isTr
                  ? `Görsel Homelab & Sunucu Mimarı. ${PLATFORM_STATS.totalModules} Docker servisini sürükle-bırak yöntemiyle tasarlayın, tek tıkla VDS sunucunuza kurun.`
                  : `Visual Homelab & Server Architect. Design ${PLATFORM_STATS.totalModules} Docker containers via drag-and-drop, deploy to VDS in 1-click.`}
              </p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] text-[#8B7D9E] border border-[#2B1A42] px-2 py-0.5" style={{ borderRadius: '2px' }}>
                  Core is open source (MIT)
                </span>
                <span className="font-mono text-[9px] text-[#C084FC] border border-[#8B5CF6]/40 px-2 py-0.5" style={{ borderRadius: '2px' }}>
                  100% Free
                </span>
              </div>
            </div>

            {/* Product */}
            <div className="space-y-3">
              <h4 className="font-mono text-[9px] font-bold tracking-[0.2em] uppercase text-[#F5F3FF]">
                {isTr ? 'Ürün & Araçlar' : 'Product & Tools'}
              </h4>
              <ul className="space-y-2">
                {[
                  { href: '/architect', label: isTr ? 'Görsel Tuval (Architect)' : 'Visual Canvas' },
                  { href: '/templates', label: isTr ? '31 Hazır Şablon' : '31 Stack Templates' },
                  { href: '/feed', label: isTr ? 'Topluluk Mimarileri' : 'Community Feed' },
                  { href: '/architect?tool=domain', label: isTr ? 'Domain & SSL Sihirbazı' : 'Domain & SSL Wizard' },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="font-mono text-[11px] text-[#8B7D9E] hover:text-[#C084FC] transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Docs */}
            <div className="space-y-3">
              <h4 className="font-mono text-[9px] font-bold tracking-[0.2em] uppercase text-[#F5F3FF]">
                {isTr ? 'Kaynaklar & Dokümanlar' : 'Resources & Docs'}
              </h4>
              <ul className="space-y-2">
                {[
                  { href: '/guide', label: isTr ? 'Homelab Ansiklopedisi' : 'Homelab Encyclopedia' },
                  { href: '/blog', label: isTr ? 'Blog & Kurulum Rehberleri' : 'Blog & Tutorials' },
                  { href: '/forum', label: isTr ? 'Topluluk Forumu' : 'Discussion Forum' },
                  { href: '/destek', label: isTr ? 'Destek Merkezi' : 'Support Center' },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="font-mono text-[11px] text-[#8B7D9E] hover:text-[#C084FC] transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social & Legal */}
            <div className="space-y-3">
              <h4 className="font-mono text-[9px] font-bold tracking-[0.2em] uppercase text-[#F5F3FF]">
                {isTr ? 'Sosyal & Hukuki' : 'Social & Legal'}
              </h4>
              <ul className="space-y-2">
                <li>
                  <a href="https://t.me/xivizley_destek_bot" target="_blank" rel="noopener noreferrer" className="font-mono text-[11px] text-[#8B7D9E] hover:text-[#C084FC] transition-colors">
                    {isTr ? 'Telegram Destek (7/24)' : 'Telegram Support (24/7)'}
                  </a>
                </li>
                <li>
                  <a href="https://instagram.com/xivizley" target="_blank" rel="noopener noreferrer" className="font-mono text-[11px] text-[#8B7D9E] hover:text-[#C084FC] transition-colors">
                    Instagram @xivizley
                  </a>
                </li>
                <li>
                  <a href="https://github.com/Xivizley" target="_blank" rel="noopener noreferrer" className="font-mono text-[11px] text-[#8B7D9E] hover:text-[#C084FC] transition-colors">
                    GitHub Repository
                  </a>
                </li>
                <li>
                  <Link href="/privacy" className="font-mono text-[11px] text-[#8B7D9E] hover:text-[#C084FC] transition-colors">
                    {isTr ? 'Gizlilik Politikası' : 'Privacy Policy'}
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="font-mono text-[11px] text-[#8B7D9E] hover:text-[#C084FC] transition-colors">
                    {isTr ? 'Kullanım Şartları' : 'Terms of Service'}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-mono text-[11px] text-[#8B7D9E]">
                XIVIZLEY © {new Date().getFullYear()} Alperen
              </span>
              <a
                href="https://launchigniter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-80"
              >
                <img
                  src="https://launchigniter.com/badge.svg"
                  alt="Featured on LaunchIgniter"
                  width={120}
                  height={28}
                  className="h-5 w-auto object-contain"
                  loading="lazy"
                />
              </a>
              <a
                href="https://peerpush.com/p/xivizley"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[10px] text-[#8B7D9E] border border-[#2B1A42] px-2 py-0.5 hover:border-[#8B5CF6] hover:text-[#C084FC] transition-colors"
                style={{ borderRadius: '2px' }}
              >
                PeerPush
              </a>
              <a
                href="https://smolrank.com/projects/xivizley?utm_source=badge"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-80"
              >
                <img
                  src="https://smolrank.com/smolrank/images/badges/featured-on-dark.svg"
                  alt="Featured on Smol Rank"
                  width={120}
                  height={28}
                  className="h-5 w-auto object-contain"
                  loading="lazy"
                />
              </a>
            </div>
            <p className="font-mono text-[10px] text-[#5E4E77]">
              {isTr
                ? 'Geliştiriciler ve Homelab tutkunları için yapıldı. Şablonlar MIT.'
                : 'Built for developers & homelab enthusiasts. Templates MIT-licensed.'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
